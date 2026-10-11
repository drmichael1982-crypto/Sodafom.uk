import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({ API_PREFIX: '' }));
vi.mock('@/lib/auth/auth-client', () => ({
  useSession: () => ({ user: { name: 'Pat Parent' } }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/ParentTutorReport', () => ({
  ParentTutorReport: ({ childName }: { childName?: string }) => <div>Tutor report for {childName}</div>,
}));
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
  expect(await screen.findByText('Tutor report for Ava')).toBeInTheDocument();
  expect(screen.getByText('⭐12')).toBeInTheDocument();
  await waitFor(() => expect(fetch).toHaveBeenCalledWith('/parent/dashboard?childId=7', { credentials: 'include' }));
});

it('keeps learners visible when a cached backend returns the supported children envelope', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/children') return { ok: true, json: async () => ({ children: [{
      id: 9,
      name: 'Milo',
      age_group: '5-7',
      total_stars: 6,
      avatar_emoji: '🐯',
    }] }) };
    if (url === '/parent/dashboard?childId=9') return { ok: true, json: async () => ({
      child: { id: 9, name: 'Milo', age_group: '5-7', total_stars: 6 },
      totalGames: 2,
      badgeCount: 0,
      subjects: [],
      daily: [],
      recent: [],
    }) };
    if (url === '/streak?childId=9') return { ok: true, json: async () => ({ currentStreak: 0, maxStreak: 0, starBalance: 6 }) };
    throw new Error(`Unexpected fetch: ${url}`);
  }));

  render(<MemoryRouter><ParentDashboardInner /></MemoryRouter>);

  expect(await screen.findByText('Family overview')).toBeInTheDocument();
  expect(screen.queryByText('No children added yet')).not.toBeInTheDocument();
  expect(screen.getAllByText('Milo').length).toBeGreaterThan(0);
  expect(await screen.findByText('Tutor report for Milo')).toBeInTheDocument();
  expect(screen.getByText('⭐6')).toBeInTheDocument();
});

it('shows a safe error card when one child progress request fails', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/children') return { ok: true, json: async () => [{ id: 7, name: 'Ava', ageGroup: '8-10', totalStars: 12 }] };
    if (url === '/parent/dashboard?childId=7') return { ok: false, status: 503, json: async () => ({ error: 'Unavailable' }) };
    throw new Error(`Unexpected fetch: ${url}`);
  }));

  render(<MemoryRouter><ParentDashboardInner /></MemoryRouter>);

  expect(await screen.findByText('Could not load this learner’s progress.')).toBeInTheDocument();
  expect(screen.queryByText('No children added yet')).not.toBeInTheDocument();
});
