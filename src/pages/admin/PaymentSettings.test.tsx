import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import PaymentSettings from './PaymentSettings';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const settings = { mode: 'free', collectionEnabled: false, draftEnabled: false, linkLabel: '', signupUrl: '', editable: true, updatedAt: null, message: 'Learning is free.' };
it('does not reveal the form when the server denies owner access', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({ error: 'Only the server-authorized owner can manage payment drafts.' }) })));
  render(<MemoryRouter><PaymentSettings /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('server-authorized owner');
  expect(screen.queryByRole('button', { name: 'Save private draft' })).not.toBeInTheDocument();
});
it('saves only draft fields and continues to identify the app as free', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => settings }).mockResolvedValueOnce({ ok: true, json: async () => ({ ...settings, draftEnabled: true, linkLabel: 'Membership', signupUrl: 'https://payments.sodafom.uk/signup' }) });
  vi.stubGlobal('fetch', fetcher);
  render(<MemoryRouter><PaymentSettings /></MemoryRouter>);
  fireEvent.change(await screen.findByLabelText('Link label'), { target: { value: 'Membership' } });
  fireEvent.change(screen.getByLabelText('Future public signup link'), { target: { value: 'https://payments.sodafom.uk/signup' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Save private draft' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Draft saved. Learning is still free and payments are off.'));
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ draftEnabled: true, linkLabel: 'Membership', signupUrl: 'https://payments.sodafom.uk/signup' });
  expect(screen.getByText('Payment collection: off')).toBeInTheDocument();
});
