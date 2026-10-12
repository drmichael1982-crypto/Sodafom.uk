import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/archie/storage', () => ({ updateSavedData: state.update }));
import DeleteParentAccount from './DeleteParentAccount';
const network = vi.fn();
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', network); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
async function prepare() {
  const user = userEvent.setup(); const onDeleted = vi.fn();
  render(<DeleteParentAccount onDeleted={onDeleted}/>);
  await user.click(screen.getByRole('button', { name: 'Delete parent account' }));
  return { user, onDeleted };
}
it('requires a deliberate confirmation and current password; cancel sends nothing', async () => {
  const { user } = await prepare();
  expect(screen.getByRole('button', { name: 'Permanently delete my account' })).toBeDisabled();
  await user.type(screen.getByLabelText('Current password to delete account'), 'fixture-password');
  expect(screen.getByRole('button', { name: 'Permanently delete my account' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Keep my account' }));
  expect(network).not.toHaveBeenCalled();
});
it('sends only a password to the account server and finishes only after confirmed deletion', async () => {
  const localWrite = vi.spyOn(Storage.prototype, 'setItem');
  network.mockResolvedValue({ ok: true, json: async () => ({ success: true, message: 'User deleted' }) });
  const { user, onDeleted } = await prepare();
  await user.type(screen.getByLabelText('Current password to delete account'), 'fixture-password');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Permanently delete my account' }));
  expect(network).toHaveBeenCalledWith('/api/auth/delete-user', expect.objectContaining({ credentials: 'include', method: 'POST', body: JSON.stringify({ password: 'fixture-password' }) }));
  expect(onDeleted).toHaveBeenCalledOnce(); expect(state.update).toHaveBeenCalledOnce();
  expect(localWrite).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Current password to delete account')).toHaveValue('');
});
it.each([false, true])('does not claim deletion for failure or an unconfirmed response (%s)', async (ok) => {
  network.mockResolvedValue({ ok, status: 400, json: async () => ({ success: true, message: 'Verification email sent' }) });
  const { user, onDeleted } = await prepare();
  await user.type(screen.getByLabelText('Current password to delete account'), 'fixture-password');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Permanently delete my account' }));
  expect(onDeleted).not.toHaveBeenCalled(); expect(state.update).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Current password to delete account')).toHaveValue('');
});
