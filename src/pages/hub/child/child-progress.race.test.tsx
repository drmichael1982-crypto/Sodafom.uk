import { act, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const route = vi.hoisted(() => ({ childId: '1' }));

vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/auth/auth-client', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return { ...actual, useParams: () => ({ childId: route.childId }) };
});

import { ChildProgressView } from './[childId]';

function response(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data } as Response;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

function page() {
  return (
    <HelmetProvider>
      <MemoryRouter><ChildProgressView /></MemoryRouter>
    </HelmetProvider>
  );
}

const children = [
  { id: 1, name: 'Alice', ageGroup: '5-7', avatarEmoji: '🐝', totalStars: 8 },
  { id: 2, name: 'Bob', ageGroup: '11-13', avatarEmoji: '🦊', totalStars: 12 },
];

const bobProgress = {
  recent: [{
    id: 22,
    subject: 'maths',
    activityId: 'number-race',
    activityTitle: 'Bob Number Race',
    score: 9,
    maxScore: 10,
    durationSeconds: 120,
    starsEarned: 3,
    completedAt: '2026-10-11T12:00:00.000Z',
  }],
  summaries: [],
  totalStars: 12,
};

describe('child progress route switching', () => {
  beforeEach(() => {
    route.childId = '1';
    vi.restoreAllMocks();
  });

  it('does not let delayed progress from the previous learner replace the current report', async () => {
    const aliceProgress = deferred<Response>();
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/children') return Promise.resolve(response(children));
      if (url === '/api/children/1/progress') return aliceProgress.promise;
      if (url === '/api/children/2/progress') return Promise.resolve(response(bobProgress));
      if (url === '/api/badges?childId=2') return Promise.resolve(response({ badges: [] }));
      throw new Error(`Unexpected request: ${url}`);
    }));

    const view = render(page());
    route.childId = '2';
    view.rerender(page());

    expect(await screen.findByRole('heading', { name: "Bob's Progress" })).toBeInTheDocument();
    expect(screen.getByText('🏆 Ages 11–13')).toBeInTheDocument();
    expect(screen.getByText('Bob Number Race')).toBeInTheDocument();

    await act(async () => {
      aliceProgress.resolve(response({
        recent: [{ ...bobProgress.recent[0], id: 11, activityTitle: 'Alice Old Activity' }],
        summaries: [],
        totalStars: 999,
      }));
      await Promise.resolve();
    });

    expect(screen.getByRole('heading', { name: "Bob's Progress" })).toBeInTheDocument();
    expect(screen.getByText('Bob Number Race')).toBeInTheDocument();
    expect(screen.queryByText('Alice Old Activity')).not.toBeInTheDocument();
    expect(screen.queryByText('999')).not.toBeInTheDocument();
  });

  it('does not let delayed badges from the previous learner replace current badges', async () => {
    const aliceBadges = deferred<Response>();
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/children') return Promise.resolve(response(children));
      if (url === '/api/children/1/progress') return Promise.resolve(response({ recent: [], summaries: [], totalStars: 8 }));
      if (url === '/api/children/2/progress') return Promise.resolve(response(bobProgress));
      if (url === '/api/badges?childId=1') return aliceBadges.promise;
      if (url === '/api/badges?childId=2') return Promise.resolve(response({
        badges: [{ id: 'bob-badge', emoji: '🤖', name: 'Bob Badge', rarity: 'common', earned: true }],
      }));
      throw new Error(`Unexpected request: ${url}`);
    }));

    const view = render(page());
    expect(await screen.findByRole('heading', { name: "Alice's Progress" })).toBeInTheDocument();

    route.childId = '2';
    view.rerender(page());
    expect(await screen.findByLabelText('Bob Badge')).toBeInTheDocument();

    await act(async () => {
      aliceBadges.resolve(response({
        badges: [{ id: 'alice-badge', emoji: '🏅', name: 'Alice Old Badge', rarity: 'rare', earned: true }],
      }));
      await Promise.resolve();
    });

    expect(screen.getByLabelText('Bob Badge')).toBeInTheDocument();
    expect(screen.queryByLabelText('Alice Old Badge')).not.toBeInTheDocument();
  });
});
