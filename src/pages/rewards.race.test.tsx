import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ session: { user: { id: 'parent-1' } } }));

vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/auth/auth-client', () => ({
  useSession: () => auth.session,
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

import { RewardsContent } from './rewards';

function renderRewards() {
  return render(
    <HelmetProvider>
      <MemoryRouter><RewardsContent /></MemoryRouter>
    </HelmetProvider>,
  );
}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function response(data: unknown) {
  return { ok: true, json: async () => data } as Response;
}

function character(id: number, name: string, emoji: string, unlocked = true) {
  return {
    id,
    slug: name.toLowerCase(),
    name,
    emoji,
    description: `${name} description`,
    starCost: 100,
    category: 'hero',
    sortOrder: 1,
    unlocked,
    isActive: unlocked,
  };
}

const children = [
  { id: 1, name: 'Alice', age: 7, avatarEmoji: '🐝', totalStars: 500 },
  { id: 2, name: 'Bob', age: 9, avatarEmoji: '🦊', totalStars: 250 },
];

describe('rewards learner switching', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('ignores delayed rewards and email responses from the previous learner', async () => {
    const aliceCharacters = deferred<Response>();
    const aliceMilestones = deferred<Response>();
    const aliceEmail = deferred<Response>();
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/children') return Promise.resolve(response(children));
      if (url.includes('characters?childId=1')) return aliceCharacters.promise;
      if (url.includes('milestones?childId=1')) return aliceMilestones.promise;
      if (url.includes('/children/1/reward-email')) return aliceEmail.promise;
      if (url.includes('characters?childId=2')) return Promise.resolve(response({ characters: [character(2, 'Bob Bot', '🤖')] }));
      if (url.includes('milestones?childId=2')) return Promise.resolve(response({ milestones: [], totalStars: 260 }));
      if (url.includes('/children/2/reward-email')) return Promise.resolve(response({ rewardEmail: 'bob@example.com' }));
      throw new Error(`Unexpected request: ${url}`);
    }));

    renderRewards();
    await userEvent.click(await screen.findByRole('button', { name: /Bob/ }));
    expect((await screen.findAllByText('Bob Bot')).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Parent / guardian email')).toHaveValue('bob@example.com');

    await act(async () => {
      aliceCharacters.resolve(response({ characters: [character(1, 'Alice Ace', '🦸')] }));
      aliceMilestones.resolve(response({ milestones: [], totalStars: 900 }));
      aliceEmail.resolve(response({ rewardEmail: 'alice@example.com' }));
      await Promise.resolve();
    });

    expect(screen.getAllByText('Bob Bot').length).toBeGreaterThan(0);
    expect(screen.queryByText('Alice Ace')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Parent / guardian email')).toHaveValue('bob@example.com');
    expect(screen.getByRole('button', { name: /Bob.*260/ })).toBeInTheDocument();
  });

  it('does not apply an old learner unlock response to the newly selected learner', async () => {
    const unlockAlice = deferred<Response>();
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/children') return Promise.resolve(response(children));
      if (url.includes('characters?childId=1')) return Promise.resolve(response({ characters: [character(1, 'Alice Ace', '🦸', false)] }));
      if (url.includes('characters?childId=2')) return Promise.resolve(response({ characters: [character(2, 'Bob Bot', '🤖')] }));
      if (url.includes('milestones?childId=1')) return Promise.resolve(response({ milestones: [], totalStars: 500 }));
      if (url.includes('milestones?childId=2')) return Promise.resolve(response({ milestones: [], totalStars: 250 }));
      if (url.includes('/reward-email')) return Promise.resolve(response({ rewardEmail: '' }));
      if (url === '/api/rewards/unlock' && init?.method === 'POST') return unlockAlice.promise;
      throw new Error(`Unexpected request: ${url}`);
    }));

    renderRewards();
    await userEvent.click(await screen.findByRole('button', { name: '100 ⭐ to unlock' }));
    await userEvent.click(screen.getByRole('button', { name: /Bob/ }));
    expect((await screen.findAllByText('Bob Bot')).length).toBeGreaterThan(0);

    await act(async () => {
      unlockAlice.resolve(response({ success: true, character: { name: 'Alice Ace', emoji: '🦸' }, starsRemaining: 400 }));
      await Promise.resolve();
    });

    await waitFor(() => expect(screen.getAllByText('Bob Bot').length).toBeGreaterThan(0));
    expect(screen.queryByText(/Alice Ace unlocked/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bob.*250/ })).toBeInTheDocument();
  });
});
