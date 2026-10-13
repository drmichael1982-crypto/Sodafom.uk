import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

vi.mock('@/lib/auth/auth-client', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: ({ children }: { children: React.ReactNode }) => children }));

import ChildProgressPage from './[childId]';

describe('child progress detail', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('keeps all-time totals separate from recent and 30-day activity', async () => {
    const now = new Date().toISOString();
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/children')) return new Response(JSON.stringify([{
        id: 7,
        name: 'Sam',
        ageGroup: '8-10',
        avatarEmoji: '🦊',
      }]));
      if (url.endsWith('/children/7/progress')) return new Response(JSON.stringify({
        recent: [{
          id: 20,
          activityId: 'number-bonds',
          activityTitle: 'Latest game',
          subject: 'maths',
          score: 10,
          maxScore: 10,
          durationSeconds: 60,
          starsEarned: 3,
          completedAt: now,
        }],
        activity30: [{
          id: 19,
          activityId: 'reading-bingo',
          activityTitle: 'Earlier 30-day game',
          subject: 'reading',
          score: 8,
          maxScore: 10,
          durationSeconds: 120,
          starsEarned: 2,
          completedAt: now,
        }, {
          id: 20,
          activityId: 'number-bonds',
          activityTitle: 'Latest game',
          subject: 'maths',
          score: 10,
          maxScore: 10,
          durationSeconds: 60,
          starsEarned: 3,
          completedAt: now,
        }],
        summaries: [],
        totalStars: 90,
        totalPlays: 42,
        totalDurationSeconds: 3720,
      }));
      if (url.includes('/badges?childId=7')) return new Response(JSON.stringify({ badges: [] }));
      return new Response(null, { status: 404 });
    }));

    render(
      <MemoryRouter initialEntries={['/hub/child/7']}>
        <Routes>
          <Route path="/hub/child/:childId" element={<ChildProgressPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: "Sam's Progress" })).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('62 min')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subject overview — last 30 days' })).toBeInTheDocument();
    expect(screen.getAllByText('1 session')).toHaveLength(2);
    expect(screen.getByText('Latest game')).toBeInTheDocument();
    expect(screen.queryByText('Earlier 30-day game')).not.toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  });
});
