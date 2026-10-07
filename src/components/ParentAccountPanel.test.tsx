import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedData } from '@/lib/archie/storage';

const saved = vi.hoisted(() => ({
  data: { settings: { year: 4, sound: true, largeText: false, onlineHelp: true }, activities: [], stickers: [] } as SavedData,
  update: vi.fn(),
}));
vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/archie/storage', () => ({ updateSavedData: saved.update }));
import ParentAccountPanel from './ParentAccountPanel';

const network = vi.fn();
const email = 'parent@example.test';
const password = 'Only-a-test-password-42';
function response(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}
function ready(session: unknown = null) {
  network.mockResolvedValueOnce(response({ ready: true, message: 'Account server ready.' }))
    .mockResolvedValueOnce(response(session));
}
async function fill(user: ReturnType<typeof userEvent.setup>, value = password) {
  await waitFor(() => expect(screen.getByLabelText('Parent email')).toBeEnabled());
  await user.type(screen.getByLabelText('Parent email'), email);
  await user.type(screen.getByLabelText('Parent password'), value);
}
beforeEach(() => {
  network.mockReset();
  saved.update.mockReset();
  saved.data = { settings: { year: 4, sound: true, largeText: false, onlineHelp: true }, activities: [], stickers: [] };
  saved.update.mockImplementation((update: (data: SavedData) => SavedData) => { saved.data = update(saved.data); });
  vi.stubGlobal('fetch', network);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('real parent accounts', () => {
  it('keeps credentials and submission unavailable when the server is disconnected', async () => {
    network.mockResolvedValue(response({ ready: false, message: 'Accounts are not connected.' }));
    render(<ParentAccountPanel />);
    expect(await screen.findByText('Accounts are not connected.')).toBeInTheDocument();
    expect(screen.getByLabelText('Parent email')).toBeDisabled();
    expect(screen.getByLabelText('Parent password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sign in to my parent account' })).toBeDisabled();
    fireEvent.submit(screen.getByLabelText('Parent email').closest('form')!);
    expect(network).toHaveBeenCalledTimes(1);
    expect(network.mock.calls[0][0]).toBe('/api/parents/account-status');
    expect(screen.queryByText('You are signed in to a real parent account.')).not.toBeInTheDocument();
  });

  it('reports an unavailable account service without presenting a local login as real authentication', async () => {
    network.mockRejectedValue(new Error('offline'));
    render(<ParentAccountPanel />);
    expect(await screen.findByText(/Parent accounts are not connected on this preview/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in to my parent account' })).toBeDisabled();
    expect(network).toHaveBeenCalledTimes(1);
  });

  it('requires a session check even when the sign-in response itself includes a user', async () => {
    const user = userEvent.setup();
    const stored = vi.spyOn(Storage.prototype, 'setItem');
    ready();
    network.mockResolvedValueOnce(response({ user: { id: 'form-response-only' } }))
      .mockResolvedValueOnce(response(null));
    render(<ParentAccountPanel />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Sign in to my parent account' }));
    expect(await screen.findByText(/Sign in after completing any account verification/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign out of parent account' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Parent password')).toHaveValue('');
    expect(network.mock.calls.map(call => call[0])).toEqual([
      '/api/parents/account-status', '/api/auth/get-session',
      '/api/auth/sign-in/email', '/api/auth/get-session',
    ]);
    const request = network.mock.calls[2][1];
    expect(request).toMatchObject({ method: 'POST', credentials: 'include' });
    expect(JSON.parse(request.body)).toEqual({ email, password });
    expect(network.mock.calls[3][1]).toMatchObject({ credentials: 'include', cache: 'no-store' });
    expect(stored).not.toHaveBeenCalled();
  });

  it('presents a signed-in account only after the account server returns a real session', async () => {
    const user = userEvent.setup();
    ready();
    network.mockResolvedValueOnce(response({ success: true }))
      .mockResolvedValueOnce(response({ user: { id: 'session-parent' } }));
    render(<ParentAccountPanel />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Sign in to my parent account' }));
    expect(await screen.findByText('Your parent account is signed in.')).toBeInTheDocument();
    expect(screen.getByText('You are signed in to a real parent account.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out of parent account' })).toBeEnabled();
    expect(screen.queryByLabelText('Parent password')).not.toBeInTheDocument();
  });

  it.each([
    ['rejected details', () => Promise.resolve(response({ error: 'bad credentials' }, 401)), /We could not sign you in/],
    ['network failure', () => Promise.reject(new Error('offline')), /Account service is unavailable/],
    ['rate limit', () => Promise.resolve(response({}, 429)), /Please wait a little/],
  ] as const)('clears the password after %s without storing it', async (_label, result, message) => {
    const user = userEvent.setup();
    const stored = vi.spyOn(Storage.prototype, 'setItem');
    ready(); network.mockImplementationOnce(result);
    render(<ParentAccountPanel />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Sign in to my parent account' }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText('Parent password')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Sign in to my parent account' })).toBeEnabled();
    expect(network).toHaveBeenCalledTimes(3);
    expect(stored).not.toHaveBeenCalled();
  });

  it('rejects a short signup password and accepts twelve characters for the real signup request', async () => {
    const user = userEvent.setup();
    ready();
    network.mockResolvedValueOnce(response({ success: true }))
      .mockResolvedValueOnce(response(null));
    render(<ParentAccountPanel />);
    await waitFor(() => expect(screen.getByLabelText('Parent email')).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Create parent account' }));
    const input = screen.getByLabelText('Parent password');
    expect(input).toHaveAttribute('minlength', '12');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
    await fill(user, 'short');
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText('Choose a password with at least 12 characters.')).toBeInTheDocument();
    expect(network).toHaveBeenCalledTimes(2);
    await user.clear(input);
    await user.type(input, 'TwelveChars!');
    await user.click(screen.getByRole('button', { name: 'Create my parent account' }));
    expect(await screen.findByText(/Sign in after completing any account verification/)).toBeInTheDocument();
    expect(network.mock.calls[2][0]).toBe('/api/auth/sign-up/email');
    expect(JSON.parse(network.mock.calls[2][1].body)).toEqual({ email, password: 'TwelveChars!', name: 'Parent' });
    expect(input).toHaveValue('');
  });

  it('waits for temporary-key removal before signing the parent out', async () => {
    const user = userEvent.setup();
    ready({ user: { id: 'session-parent' } });
    let finishDisconnect!: (value: ReturnType<typeof response>) => void;
    network.mockImplementationOnce(() => new Promise(resolve => { finishDisconnect = resolve; }))
      .mockResolvedValueOnce(response({ success: true }));
    render(<ParentAccountPanel />);
    await user.click(await screen.findByRole('button', { name: 'Sign out of parent account' }));
    expect(network.mock.calls.map(call => call[0])).toEqual([
      '/api/parents/account-status', '/api/auth/get-session', '/api/parents/ai/disconnect',
    ]);
    expect(screen.getByRole('button', { name: 'Sign out of parent account' })).toBeDisabled();
    expect(saved.data.settings.onlineHelp).toBe(false);
    finishDisconnect(response({ connected: false }));
    expect(await screen.findByText('You have signed out.')).toBeInTheDocument();
    expect(network.mock.calls[3][0]).toBe('/api/auth/sign-out');
    expect(network.mock.calls[2][1]).toMatchObject({ method: 'POST', credentials: 'include' });
    expect(network.mock.calls[3][1]).toMatchObject({ method: 'POST', credentials: 'include' });
    expect(screen.getByLabelText('Parent password')).toHaveValue('');
  });

  it('does not claim successful sign-out when temporary-key removal cannot reach the server', async () => {
    const user = userEvent.setup();
    ready({ user: { id: 'session-parent' } });
    network.mockRejectedValueOnce(new Error('offline'));
    render(<ParentAccountPanel />);
    await user.click(await screen.findByRole('button', { name: 'Sign out of parent account' }));
    expect(await screen.findByText('Sign-out is unavailable. Please try again.')).toBeInTheDocument();
    expect(network).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('button', { name: 'Sign out of parent account' })).toBeEnabled();
    expect(screen.getByText('You are signed in to a real parent account.')).toBeInTheDocument();
    expect(saved.data.settings.onlineHelp).toBe(false);
  });

  it('ends the session honestly when the server cannot confirm key cleanup and leaves online help off', async () => {
    const user = userEvent.setup();
    ready({ user: { id: 'session-parent' } });
    network.mockResolvedValueOnce(response({ error: 'cleanup failed' }, 503))
      .mockResolvedValueOnce(response({ success: true }));
    render(<ParentAccountPanel />);
    await user.click(await screen.findByRole('button', { name: 'Sign out of parent account' }));
    expect(await screen.findByText(/Server key removal was not confirmed; temporary keys expire within 30 minutes/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign out of parent account' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in to my parent account' })).toBeEnabled();
    expect(saved.data.settings.onlineHelp).toBe(false);
    expect(network.mock.calls.slice(2).map(call => call[0])).toEqual(['/api/parents/ai/disconnect', '/api/auth/sign-out']);
  });

  it('retains the real session UI if sign-out is rejected and makes the local fallback available', async () => {
    const user = userEvent.setup();
    ready({ user: { id: 'session-parent' } });
    network.mockResolvedValueOnce(response({ connected: false }))
      .mockResolvedValueOnce(response({}, 500));
    render(<ParentAccountPanel />);
    await user.click(await screen.findByRole('button', { name: 'Sign out of parent account' }));
    expect(await screen.findByText('Sign-out did not complete. Online help is off on this device; please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out of parent account' })).toBeEnabled();
    expect(saved.data.settings.onlineHelp).toBe(false);
    expect(screen.queryByText('You have signed out.')).not.toBeInTheDocument();
  });
});
