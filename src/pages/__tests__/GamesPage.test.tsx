import { render } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/auth-client', () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  useSession: () => ({ data: null, isPending: false }),
}));

vi.mock('@/hooks/useSubscription', () => ({
  isDemoGameId: () => true,
  useSubscription: () => ({ subscribed: true }),
}));

import GamesPage from '../games';

describe('Games page rendering', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders every game card without React list-key warnings', () => {
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ subscribed: false, status: 'none', trialEndsAt: null, daysLeft: null, plan: null }),
    }));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const view = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/games']}>
          <GamesPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    const keyWarnings = consoleError.mock.calls
      .map((parts) => parts.join(' '))
      .filter((message) => message.includes('unique "key" prop'));
    expect(keyWarnings).toEqual([]);
    const hrefs = Array.from(view.container.querySelectorAll<HTMLAnchorElement>('a[href]')).map((link) => link.getAttribute('href'));
    expect(hrefs).not.toContain('/games/undefined');
  });
});
