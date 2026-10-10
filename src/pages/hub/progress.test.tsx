import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('@/lib/auth/auth-client', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({ user: { name: 'Pat Parent', email: 'pat@example.com' } }),
  LogoutButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));
vi.mock('@/components/StreakFreezeButton', () => ({ default: () => null }));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: ({ children }: { children: React.ReactNode }) => children }));

import { ProgressDashboard } from './progress';

describe('parent progress dashboard', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/children')) return new Response(JSON.stringify([{
      id: 7,
      name: 'Sam',
      ageGroup: '8-10',
      avatarEmoji: '🦊',
      totalStars: 2,
      createdAt: '2026-10-01T00:00:00.000Z',
    }]));
    if (url.endsWith('/children/7/progress')) return new Response(JSON.stringify({ recent: [{
      id: 19,
      activityId: 'reading-bingo',
      activityTitle: 'Reading Bingo',
      subject: 'reading',
      score: 3,
      maxScore: 4,
      starsEarned: 2,
      completedAt: new Date().toISOString(),
    }] }));
    return new Response(null, { status: 404 });
  })));

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('loads the parent-owned progress endpoint and renders its activity', async () => {
    render(<MemoryRouter><ProgressDashboard /></MemoryRouter>);

    expect(await screen.findByText('Reading Bingo')).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const urls = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    expect(urls.some(url => url.endsWith('/children/7/progress'))).toBe(true);
    expect(urls.some(url => url.includes('/teacher/students/'))).toBe(false);
  });
});
