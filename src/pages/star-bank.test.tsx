import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ session: { isAuthenticated: true } }));
vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/auth/auth-client', () => ({ useSession: () => auth.session }));

import { StarBankPage } from './star-bank';

function response(data: unknown) {
  return { ok: true, json: async () => data } as Response;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

function character(id: number, name: string, unlocked: boolean, isActive = false) {
  return { id, slug: name.toLowerCase(), name, emoji: '🤖', description: `${name} helper`, starCost: 100, category: 'hero', sortOrder: id, unlocked, isActive };
}

function renderPage() {
  return render(<HelmetProvider><MemoryRouter><StarBankPage /></MemoryRouter></HelmetProvider>);
}

const children = [
  { id: 1, name: 'Alice', totalStars: 500, avatarEmoji: '🐝', activeCharacterId: null },
  { id: 2, name: 'Bob', totalStars: 250, avatarEmoji: '🦊', activeCharacterId: null },
];

describe('signed-in Star Bank', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('reads the canonical API shape and ignores a previous learner response', async () => {
    const aliceCharacters = deferred<Response>();
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/children') return Promise.resolve(response({ children }));
      if (url.includes('characters?childId=1')) return aliceCharacters.promise;
      if (url.includes('/children/1/progress')) return Promise.resolve(response({ recent: [] }));
      if (url.includes('characters?childId=2')) return Promise.resolve(response({ characters: [character(2, 'Bob Bot', true, true)], totalStars: 260 }));
      if (url.includes('/children/2/progress')) return Promise.resolve(response({ recent: [{ gameSlug: 'number-pop', starsEarned: 3 }] }));
      throw new Error(`Unexpected request: ${url}`);
    }));

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /Bob/ }));
    expect(await screen.findByText('Bob Bot')).toBeInTheDocument();
    expect(screen.getByText('number pop')).toBeInTheDocument();

    await act(async () => {
      aliceCharacters.resolve(response({ characters: [character(1, 'Alice Ace', true, true)], totalStars: 900 }));
      await Promise.resolve();
    });

    expect(screen.getByText('Bob Bot')).toBeInTheDocument();
    expect(screen.queryByText('Alice Ace')).not.toBeInTheDocument();
    expect(screen.getByText('260')).toBeInTheDocument();
  });

  it('uses the working unlock and equip endpoints with the selected child', async () => {
    const requests: Array<[string, RequestInit | undefined]> = [];
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      requests.push([url, init]);
      if (url === '/api/children') return Promise.resolve(response({ children: [children[0]] }));
      if (url.includes('/rewards/characters?')) return Promise.resolve(response({
        characters: [character(1, 'Locked Bot', false), character(2, 'Ready Bot', true)],
        totalStars: 500,
      }));
      if (url.includes('/progress')) return Promise.resolve(response({ recent: [] }));
      if (url === '/api/rewards/unlock') return Promise.resolve(response({ success: true, starsRemaining: 400 }));
      if (url === '/api/rewards/set-character') return Promise.resolve(response({ success: true }));
      throw new Error(`Unexpected request: ${url}`);
    }));

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Unlock now!' }));
    const readyCard = screen.getByText('Ready Bot').closest<HTMLElement>('.rounded-2xl');
    if (!readyCard) throw new Error('Ready Bot card missing');
    await userEvent.click(within(readyCard).getByRole('button', { name: 'Equip' }));

    const unlock = requests.find(([url]) => url === '/api/rewards/unlock');
    const equip = requests.find(([url]) => url === '/api/rewards/set-character');
    expect(JSON.parse(String(unlock?.[1]?.body))).toEqual({ childId: 1, characterId: 1 });
    expect(JSON.parse(String(equip?.[1]?.body))).toEqual({ childId: 1, characterId: 2 });
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText('✅ Ready Bot is now your avatar!')).toBeInTheDocument();
  });
});
