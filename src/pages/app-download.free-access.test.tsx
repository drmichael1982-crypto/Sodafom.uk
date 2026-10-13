import { cleanup, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import AppDownloadPage from './app-download';

afterEach(cleanup);

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  vi.stubGlobal('fetch', vi.fn(async () => ({
    json: async () => ({ subscribed: true, status: 'active', trialEndsAt: null, daysLeft: null, plan: 'promo' }),
  })));
});

afterAll(() => vi.unstubAllGlobals());

describe('mobile web preview', () => {
  it('does not claim an app-store launch, paid subscription, rating or offline download', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <AppDownloadPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Learning on phones and tablets 🌟' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Open the Sodafom web app' })[0]).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: 'Browse free learning games' })[0]).toHaveAttribute('href', '/games');
    expect(screen.getByText('Free web access · no subscription or app-store download required')).toBeInTheDocument();
    expect(screen.queryByText(/Download on the App Store/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Google Play/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Top Rated/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/10,000\+ families/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Works offline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Subscription required/i)).not.toBeInTheDocument();
  }, 15_000);
});
