import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import SodafomAdventurePage from './SodafomAdventurePage';

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function showAdventure() {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
  return render(<HelmetProvider><MemoryRouter initialEntries={['/classic-adventure']}><Routes>
    <Route path="/classic-adventure" element={<SodafomAdventurePage />} />
    <Route path="*" element={<LocationProbe />} />
  </Routes></MemoryRouter></HelmetProvider>);
}

it('replaces child-facing purchases with free local-first learning choices', () => {
  showAdventure();
  fireEvent.click(screen.getByRole('button', { name: /Sodafom Shop/i }));
  expect(screen.getByRole('heading', { name: 'Free Learning Corner' })).toBeInTheDocument();
  expect(screen.getByText(/no payment or credits needed/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Ask Local Archie/i })).toBeInTheDocument();
  expect(screen.queryByText(/£2 AI Credit|Yearly Pack|required for purchases/i)).not.toBeInTheDocument();
});

it('opens the free account profile without subscription wording', () => {
  showAdventure();
  fireEvent.click(screen.getByRole('button', { name: /Settings$/i }));
  expect(screen.getByText(/Learning is free.*no payment is required/i)).toBeInTheDocument();
  expect(screen.queryByText(/Subscription management and cancellation/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Account$/i }));
  expect(screen.getByTestId('location')).toHaveTextContent('/hub/profile');
});
