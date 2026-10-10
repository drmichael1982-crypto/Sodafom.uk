import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({ API_PREFIX: '' }));
vi.mock('@/lib/auth/auth-client', () => ({
  useSession: () => ({ user: { name: 'Pat Parent' } }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/ParentTutorReport', () => ({ ParentTutorReport: () => null }));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));

import { ParentDashboardInner } from './parent-dashboard';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/children') return { ok: true, json: async () => [{ id: 7, name: 'Ava', ageGroup: '8-10', totalStars: 12, avatarEmoji: '🦊' }] };
    if (url === '/parent/dashboard?childId=7') return { ok: true, json: async () => ({
      child: { id: 7, name: 'Ava', age_group: '8-10', total_stars: 12 },
      totalGames: 4,
      badgeCount: 1,
      subjects: [],
      daily: [],
      recent: [],
    }) };
    if (url === '/streak?childId=7') return { ok: true, json: async () => ({ currentStreak: 0, maxStreak: 0, starBalance: 12 }) };
    throw new Error(`Unexpected fetch: ${url}`);
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('renders the signed-in parent\'s children from the API array and their camelCase summary totals', async () => {
  render(<MemoryRouter><ParentDashboardInner /></MemoryRouter>);

  expect(await screen.findByText('Family overview')).toBeInTheDocument();
  expect(screen.queryByText('No children added yet')).not.toBeInTheDocument();
  expect(screen.getAllByText('Ava').length).toBeGreaterThan(0);
  expect(screen.getByText('⭐12')).toBeInTheDocument();
  await waitFor(() => expect(fetch).toHaveBeenCalledWith('/parent/dashboard?childId=7', { credentials: 'include' }));
});
