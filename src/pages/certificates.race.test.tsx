import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/auth/auth-client', () => ({
  useSession: () => ({ user: { id: 'parent-1' } }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

import { CertificatesInner } from './certificates';

function response(data: unknown) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter><CertificatesInner /></MemoryRouter>
    </HelmetProvider>,
  );
}

const children = [
  { id: 1, name: 'Alice', age: 7, ageGroup: '6-8', avatarEmoji: '🐝', totalStars: 500 },
  { id: 2, name: 'Bob', age: 9, ageGroup: '9-11', avatarEmoji: '🦊', totalStars: 250 },
];

describe('certificate learner switching', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('never shows or prints delayed certificate data from the previous child', async () => {
    const aliceDashboard = deferred<Response>();
    const aliceStreak = deferred<Response>();
    const bobDashboard = deferred<Response>();
    const bobStreak = deferred<Response>();
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/children') return Promise.resolve(response({ children }));
      if (url.includes('dashboard?childId=1')) return aliceDashboard.promise;
      if (url.includes('streak?childId=1')) return aliceStreak.promise;
      if (url.includes('dashboard?childId=2')) return bobDashboard.promise;
      if (url.includes('streak?childId=2')) return bobStreak.promise;
      throw new Error(`Unexpected request: ${url}`);
    }));

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /Bob/ }));
    expect(await screen.findByText("Loading Bob's certificate")).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Print \/ Save as PDF/ })).not.toBeInTheDocument();

    await act(async () => {
      bobDashboard.resolve(response({
        badgeCount: 2,
        subjects: [{ subject: 'science', games_played: 3, stars: 15 }],
      }));
      bobStreak.resolve(response({ currentStreak: 4, maxStreak: 4 }));
      await Promise.resolve();
    });

    expect(await screen.findByText("Bob's stats")).toBeInTheDocument();
    expect(screen.getAllByText('🏅 2')).toHaveLength(2);
    expect(screen.queryByText('🏅 99')).not.toBeInTheDocument();

    await act(async () => {
      aliceDashboard.resolve(response({
        badgeCount: 99,
        subjects: [{ subject: 'maths', games_played: 99, stars: 999 }],
      }));
      aliceStreak.resolve(response({ currentStreak: 30, maxStreak: 30 }));
      await Promise.resolve();
    });

    expect(screen.getByText("Bob's stats")).toBeInTheDocument();
    expect(screen.getAllByText('🏅 2')).toHaveLength(2);
    expect(screen.queryByText('🏅 99')).not.toBeInTheDocument();
    expect(screen.queryByText('🔥 30-day')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print \/ Save as PDF/ })).toBeEnabled();
  });
});
