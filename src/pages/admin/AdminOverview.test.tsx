import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import AdminOverview from './AdminOverview';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const overview = { registeredParents: 7, validParentSessions: 9, mode: 'free', collectionEnabled: false, paymentsConfigured: false, generatedAt: '2026-10-09T14:00:00.000Z' };
it('shows owner-only real account counts with their limits and inactive payment status', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => overview })));
  render(<MemoryRouter><AdminOverview /></MemoryRouter>);
  expect(await screen.findByText('7')).toBeInTheDocument();
  expect(screen.getByText('9')).toBeInTheDocument();
  expect(screen.getByText(/Sessions are not a count of people online/)).toBeInTheDocument();
  expect(screen.getByText('Payment collection: off')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Manage the private future payment draft/ })).toHaveAttribute('href', '/admin/payments');
  expect(screen.getAllByText('Idea')).toHaveLength(3);
});
it('hides all metrics and owner links when access is denied', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({ error: 'Only the authorized owner can view this overview.' }) })));
  render(<MemoryRouter><AdminOverview /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('authorized owner');
  expect(screen.queryByText('Registered parents')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /payment draft/ })).not.toBeInTheDocument();
});
it('clears previously displayed metrics if a refresh loses authorization', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => overview }).mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Sign in again.' }) });
  vi.stubGlobal('fetch', fetcher);
  render(<MemoryRouter><AdminOverview /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Refresh' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Sign in again.'));
  expect(screen.queryByText('Registered parents')).not.toBeInTheDocument();
});
