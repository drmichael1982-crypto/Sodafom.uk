import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({ API_PREFIX: '' }));
vi.mock('@/lib/auth/auth-client', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));

import BadgesPage from './badges';

describe('parent badges page', () => {
  beforeEach(() => {
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 7 }));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('shows a safe error instead of rendering an invalid 500 response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ error: 'Failed to load badges' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )));

    render(<MemoryRouter><BadgesPage /></MemoryRouter>);

    expect(await screen.findByText('Failed to load badges')).toBeInTheDocument();
    expect(screen.queryByText('No badges match this filter.')).not.toBeInTheDocument();
  });
});
