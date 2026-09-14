import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  setGameContext: vi.fn(),
  clearGameContext: vi.fn(),
  recordGameCompletion: vi.fn(),
  user: { id: 'synthetic-parent', name: 'Parent', email: 'parent@example.test' },
}));
vi.mock('@/lib/auth/auth-client', () => ({
  signOut: mocks.signOut,
  useSession: () => ({ user: mocks.user, session: { user: mocks.user }, isAuthenticated: true }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('motion/react', async () => {
  const React = await import('react');
  const cache = new Map<string, React.ComponentType<Record<string, unknown>>>();
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy({}, { get(_target, tag: string) {
      if (!cache.has(tag)) cache.set(tag, ({ children, ...props }) => {
        for (const key of ['initial', 'animate', 'exit', 'transition', 'variants', 'custom', 'whileHover', 'whileTap']) delete props[key];
        return React.createElement(tag, props, children as React.ReactNode);
      });
      return cache.get(tag);
    } }),
  };
});
vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/testing-mode', () => ({ OPEN_TESTING_MODE: false }));
vi.mock('@/contexts/use-cart', () => ({ useCart: () => ({ cartCount: 0 }) }));
vi.mock('@/hooks/useSubscription', () => ({ useSubscription: () => ({ subscribed: false, loading: false }) }));
vi.mock('@/hooks/useStarCount', () => ({ useStarCount: () => ({ stars: 0 }) }));
vi.mock('@/components/SiteSearch', () => ({ SiteSearch: () => null, SearchButton: () => null }));
vi.mock('@/components/CancelSubscriptionFlow', () => ({ default: () => null }));
vi.mock('@/components/games/PaywallGate', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('@/components/games/ActiveChildBanner', () => ({ default: () => null }));
vi.mock('@/components/games/CertificateModal', () => ({ default: () => null }));
vi.mock('@/components/games/ConfettiCanvas', () => ({ default: () => null }));
vi.mock('@/components/ShareBar', () => ({ default: () => null }));
vi.mock('@/hooks/useCountUp', () => ({ useCountUp: (value: number) => value }));
vi.mock('@/hooks/useChildAge', () => ({ getActiveChild: () => null, useChildAge: () => '8-10' }));
vi.mock('@/contexts/ArchieContext', () => ({ useArchieContext: () => ({ setGameContext: mocks.setGameContext, clearGameContext: mocks.clearGameContext }) }));
vi.mock('@/contexts/ProgressionContext', () => ({ useProgression: () => ({ recordGameCompletion: mocks.recordGameCompletion, level: 1, gamesRemainingForNextLevel: 2 }) }));
vi.mock('virtual:content', () => ({ games: { games: [
  { title: 'Coin Counter', subject: 'maths', slug: 'coin-counter' },
  { title: 'Money Maths', subject: 'maths', slug: 'money-maths' },
] } }));

import Header from '@/layouts/parts/Header';
import ProfilePage from '@/pages/hub/profile';
import GameShell from '@/components/games/GameShell';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}
function game() {
  return <GameShell title="Coin Counter" emoji="🪙" subject="maths" ageGroups={['8–10']}>
    {complete => <button onClick={() => complete({ score: 70, correct: 7, total: 10, stars: 1 })}>Complete round</button>}
  </GameShell>;
}
function mount(element: React.ReactNode, entry = '/hub/profile') {
  return render(<MemoryRouter initialEntries={[entry]}>{element}<LocationProbe /></MemoryRouter>);
}

beforeEach(() => {
  localStorage.clear();
  mocks.signOut.mockReset().mockResolvedValue({ error: null });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ children: [] }) }));
  vi.stubGlobal('scrollTo', vi.fn());
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe.each([
  { name: 'site header', component: () => <Header />, destination: '/', button: /^sign out$/i, menu: true },
  { name: 'parent profile', component: () => <ProfilePage />, destination: '/', button: /^sign out$/i, menu: false },
  { name: 'game shell', component: game, destination: '/hub/login', button: /^log out$/i, menu: false },
])('$name truthful logout', ({ component, destination, button, menu }) => {
  it.each(['rejected promise', 'returned error'])('keeps the page and offers retry after a %s', async failure => {
    if (failure === 'rejected promise') mocks.signOut.mockRejectedValueOnce(new Error('offline'));
    else mocks.signOut.mockResolvedValueOnce({ error: { message: 'server failure' } });
    mount(component());
    if (menu) fireEvent.click(screen.getByRole('button', { name: 'Profile menu' }));
    fireEvent.click(screen.getByRole('button', { name: button }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sign out could not be confirmed');
    expect(screen.getByTestId('location')).toHaveTextContent('/hub/profile');
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Try sign out again' }));
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(destination));
    expect(mocks.signOut).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables repeated logout while waiting for confirmation', async () => {
    let finish!: (value: unknown) => void;
    mocks.signOut.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    mount(component());
    if (menu) fireEvent.click(screen.getByRole('button', { name: 'Profile menu' }));
    const control = screen.getByRole('button', { name: button });
    fireEvent.click(control);
    expect(control).toBeDisabled();
    fireEvent.click(control);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    finish({ error: null });
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(destination));
  });
});

describe('game return integration', () => {
  it('returns from a game to its original shop', () => {
    mount(game(), '/games/coin-counter?returnTo=%2Fworld%2Fvictorian%3Fshop%3Dsweet-shop');
    fireEvent.click(screen.getByRole('button', { name: 'Back to shop' }));
    expect(screen.getByTestId('location').textContent).toBe('/world/victorian?shop=sweet-shop');
  });
  it('falls back to games for an external destination', () => {
    mount(game(), '/games/coin-counter?returnTo=https%3A%2F%2Fevil.example');
    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }));
    expect(screen.getByTestId('location').textContent).toBe('/games');
  });
  it('carries the destination to the next game', () => {
    mount(game(), '/games/coin-counter?returnTo=%2Fworld%2Ffloating');
    fireEvent.click(screen.getByRole('button', { name: 'Complete round' }));
    fireEvent.click(screen.getByRole('button', { name: /Play Next: Money Maths/ }));
    expect(screen.getByTestId('location').textContent).toBe('/games/money-maths?returnTo=%2Fworld%2Ffloating');
  });
  it('shows a return-to-books action on the completed round', () => {
    mount(game(), '/games/coin-counter?returnTo=%2Fbooks%2Fanimated');
    fireEvent.click(screen.getByRole('button', { name: 'Complete round' }));
    const controls = screen.getAllByRole('button', { name: 'Back to books' });
    expect(controls).toHaveLength(2);
    fireEvent.click(controls[1]);
    expect(screen.getByTestId('location').textContent).toBe('/books/animated');
  });
});
