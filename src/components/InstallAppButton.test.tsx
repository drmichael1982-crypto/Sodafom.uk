import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import InstallAppButton from './InstallAppButton';
beforeEach(() => vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }))));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('opens instructions on request and restores focus after Escape', () => {
  render(<InstallAppButton/>);
  const button = screen.getByRole('button', { name: 'Add Sodafom to your home screen' });
  fireEvent.click(button);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Back to learning' })).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(button).toHaveFocus();
});
it('defers the browser installation prompt until a user clicks', async () => {
  render(<InstallAppButton/>);
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = new Event('beforeinstallprompt', { cancelable: true });
  Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome: 'accepted' }) });
  act(() => { window.dispatchEvent(event); });
  expect(event.defaultPrevented).toBe(true);
  expect(prompt).not.toHaveBeenCalled();
  await act(async () => { fireEvent.click(screen.getByRole('button')); });
  expect(prompt).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it('hides the install action in a standalone app and removes event listeners', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  const removed = vi.spyOn(window, 'removeEventListener');
  const view = render(<InstallAppButton/>);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  view.unmount();
  expect(removed).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
  expect(removed).toHaveBeenCalledWith('appinstalled', expect.any(Function));
  removed.mockRestore();
});
