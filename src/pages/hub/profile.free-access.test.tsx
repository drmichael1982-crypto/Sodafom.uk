import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({ API_PREFIX: '' }));
vi.mock('@/lib/auth/auth-client', () => ({
  useSession: () => ({ user: { name: 'Pat Parent', email: 'pat@example.com' } }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
  signOut: vi.fn(),
}));
vi.mock('@/components/CancelSubscriptionFlow', () => ({
  default: () => <div>Cancel flow mounted</div>,
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));

import ProfilePage, { ProfileChildCard } from './profile';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/children') {
      return { ok: true, json: async () => [] };
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('shows free access without requesting or exposing subscription controls', async () => {
  render(<MemoryRouter><ProfilePage /></MemoryRouter>);

  expect(screen.getByRole('heading', { name: 'Free access' })).toBeInTheDocument();
  expect(screen.getByText('All learning games are free')).toBeInTheDocument();
  expect(screen.getByText(/No payment, subscription or cancellation is needed/)).toBeInTheDocument();

  await waitFor(() => expect(fetch).toHaveBeenCalledWith('/children'));
  const urls = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
  expect(urls.some(url => url.includes('/subscription'))).toBe(false);
  expect(screen.queryByRole('button', { name: /Cancel subscription/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Upgrade to full access/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Subscription' })).not.toBeInTheDocument();
  expect(screen.queryByText('Cancel flow mounted')).not.toBeInTheDocument();
});

it('shows an honest learner error and retries instead of showing an empty profile', async () => {
  let fail = true;
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/children') {
      return fail
        ? { ok: false, status: 503, json: async () => ({ error: 'Unavailable' }) }
        : { ok: true, json: async () => [] };
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }));

  render(<MemoryRouter><ProfilePage /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load learners');
  expect(screen.queryByText(/No learners have been added yet/i)).not.toBeInTheDocument();

  fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText(/No learners have been added yet/i)).toBeInTheDocument();
});

it('keeps the avatar picker open when the server rejects a change', async () => {
  const onEmojiChange = vi.fn();
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })));
  render(<MemoryRouter><ProfileChildCard child={{ id: 7, name: 'Ava', ageGroup: '8-10', avatarEmoji: '🦊', totalStars: 12 }} onEmojiChange={onEmojiChange} /></MemoryRouter>);

  fireEvent.click(screen.getByRole('button', { name: 'Change avatar emoji' }));
  const tiger = screen.getByRole('button', { name: 'Set avatar to 🐯' });
  expect(tiger).toHaveClass('w-11', 'h-11');
  fireEvent.click(tiger);

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save that avatar');
  expect(screen.getByRole('button', { name: 'Set avatar to 🐯' })).toBeInTheDocument();
  expect(onEmojiChange).not.toHaveBeenCalled();
});
