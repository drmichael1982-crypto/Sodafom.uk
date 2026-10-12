import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({ API_PREFIX: '' }));
vi.mock('@/lib/auth/auth-client', () => ({
  useSession: () => ({ user: { name: 'Pat Parent' } }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/ParentTutorReport', () => ({
  ParentTutorReport: ({ child }: { child: { id: number; name: string; ageGroup?: string } }) => (
    <div data-testid={`tutor-report-${child.id}`}>{child.name}:{child.ageGroup}</div>
  ),
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
  expect(screen.getByText('⭐12')).toBeInTheDocument();
  expect(await screen.findByTestId('tutor-report-7')).toHaveTextContent('Ava:8-10');
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
  expect(await screen.findByTestId('tutor-report-9')).toHaveTextContent('Milo:5-7');
  expect(screen.getByText('⭐6')).toBeInTheDocument();
  await waitFor(() => expect(fetch).toHaveBeenCalledWith('/parent/dashboard?childId=9', { credentials: 'include' }));
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

it('shows one learner report at a time and switches with accessible large controls', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/children') return { ok: true, json: async () => [
      { id: 7, name: 'Ava', ageGroup: '8-10', totalStars: 12, avatarEmoji: '🦊' },
      { id: 8, name: 'Milo', ageGroup: '5-7', totalStars: 6, avatarEmoji: '🐯' },
    ] };
    if (url === '/parent/dashboard?childId=7') return { ok: true, json: async () => ({
      child: { id: 7, name: 'Ava', age_group: '8-10', total_stars: 12 },
      totalGames: 4,
      badgeCount: 1,
      subjects: [],
      daily: [],
      recent: [],
    }) };
    if (url === '/parent/dashboard?childId=8') return { ok: true, json: async () => ({
      child: { id: 8, name: 'Milo', age_group: '5-7', total_stars: 6 },
      totalGames: 2,
      badgeCount: 0,
      subjects: [],
      daily: [],
      recent: [],
    }) };
    if (url.startsWith('/streak?childId=')) return { ok: true, json: async () => ({ currentStreak: 0, maxStreak: 0, starBalance: 0 }) };
    throw new Error(`Unexpected fetch: ${url}`);
  }));

  render(<MemoryRouter><ParentDashboardInner /></MemoryRouter>);

  const avaButton = await screen.findByRole('button', { name: /Ava/ });
  const miloButton = screen.getByRole('button', { name: /Milo/ });
  expect(avaButton).toHaveAttribute('aria-pressed', 'true');
  expect(miloButton).toHaveAttribute('aria-pressed', 'false');
  expect(await screen.findByTestId('tutor-report-7')).toHaveTextContent('Ava:8-10');
  expect(screen.queryByTestId('tutor-report-8')).not.toBeInTheDocument();
  expect(miloButton.className).toContain('min-h-11');

  fireEvent.click(miloButton);

  expect(await screen.findByTestId('tutor-report-8')).toHaveTextContent('Milo:5-7');
  expect(screen.queryByTestId('tutor-report-7')).not.toBeInTheDocument();
  expect(miloButton).toHaveAttribute('aria-pressed', 'true');
  expect(avaButton).toHaveAttribute('aria-pressed', 'false');
  await waitFor(() => expect(fetch).toHaveBeenCalledWith('/parent/dashboard?childId=8', { credentials: 'include' }));
});
