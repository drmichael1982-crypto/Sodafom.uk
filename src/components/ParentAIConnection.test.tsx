import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedData } from '@/lib/archie/storage';

const saved = vi.hoisted(() => ({
  data: { settings: { year: 4, sound: true, largeText: false, onlineHelp: false }, activities: [], stickers: [] } as SavedData,
  update: vi.fn(),
}));
vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/archie/storage', () => ({ updateSavedData: saved.update }));
import ParentAIConnection from './ParentAIConnection';

const network = vi.fn();
const testKey = 'synthetic-test-key-not-a-credential';
function response(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}
beforeEach(() => {
  network.mockReset(); saved.update.mockReset();
  saved.data = { settings: { year: 4, sound: true, largeText: false, onlineHelp: false }, activities: [], stickers: [] };
  saved.update.mockImplementation((update: (data: SavedData) => SavedData) => { saved.data = update(saved.data); });
  vi.stubGlobal('fetch', network);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('parent-controlled AI connection', () => {
  it('does not connect or present a microphone action on mount', () => {
    render(<ParentAIConnection />);
    expect(screen.getByRole('button', { name: 'Connect key temporarily' })).toBeDisabled();
    expect(screen.getByText(/No connection confirmed/)).toBeInTheDocument();
    expect(network).not.toHaveBeenCalled();
    expect(saved.update).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /microphone|listen/i })).not.toBeInTheDocument();
  });

  it('sends the key only to the parent server and does not enable online help or save the key locally', async () => {
    const user = userEvent.setup();
    const store = vi.spyOn(Storage.prototype, 'setItem');
    network.mockResolvedValue(response({ connected: true }));
    render(<ParentAIConnection />);
    const input = screen.getByLabelText('Parent’s OpenAI API key');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'off');
    await user.type(input, `  ${testKey}  `);
    await user.click(screen.getByRole('button', { name: 'Connect key temporarily' }));
    expect(await screen.findByText(/Account funding and live answers have not been verified/)).toBeInTheDocument();
    expect(screen.getByText(/Temporary key connected/)).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(network).toHaveBeenCalledTimes(1);
    expect(network.mock.calls[0][0]).toBe('/api/parents/ai/connect');
    expect(network.mock.calls[0][1]).toMatchObject({ method: 'POST', credentials: 'include', cache: 'no-store' });
    expect(JSON.parse(network.mock.calls[0][1].body)).toEqual({ key: testKey });
    expect(saved.update).not.toHaveBeenCalled();
    expect(saved.data.settings.onlineHelp).toBe(false);
    expect(store).not.toHaveBeenCalled();
  });

  it.each([
    ['unauthenticated account', () => Promise.resolve(response({ error: 'Unauthorized' }, 401)), 'Sign in to a connected parent account before adding an API key.'],
    ['server error', () => Promise.resolve(response({ error: 'Temporary connection service unavailable.' }, 503)), 'Temporary connection service unavailable.'],
    ['network error', () => Promise.reject(new Error('offline')), 'AI setup is unavailable. Built-in help still works.'],
  ] as const)('clears the key after %s and offers honest fallback guidance', async (_label, result, message) => {
    const user = userEvent.setup();
    const store = vi.spyOn(Storage.prototype, 'setItem');
    network.mockImplementationOnce(result);
    render(<ParentAIConnection />);
    const input = screen.getByLabelText('Parent’s OpenAI API key');
    await user.type(input, testKey);
    await user.click(screen.getByRole('button', { name: 'Connect key temporarily' }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Connect key temporarily' })).toBeDisabled();
    expect(screen.getByText(/No connection confirmed/)).toBeInTheDocument();
    expect(saved.update).not.toHaveBeenCalled();
    expect(store).not.toHaveBeenCalled();
  });

  it('selects free built-in help locally without contacting the account service', async () => {
    const user = userEvent.setup();
    saved.data.settings.onlineHelp = true;
    render(<ParentAIConnection />);
    await user.click(screen.getByRole('button', { name: 'Use free built-in help' }));
    expect(screen.getByRole('status')).toHaveTextContent('Built-in help selected. Online learning help is off on this device.');
    expect(saved.data.settings).toEqual({ year: 4, sound: true, largeText: false, onlineHelp: false });
    expect(network).not.toHaveBeenCalled();
  });

  it('checks the server connection without resending any typed key, then disconnects and turns online help off', async () => {
    const user = userEvent.setup();
    saved.data.settings.onlineHelp = true;
    network.mockResolvedValueOnce(response({ connected: true }))
      .mockResolvedValueOnce(response({ connected: false }));
    render(<ParentAIConnection />);
    await user.type(screen.getByLabelText('Parent’s OpenAI API key'), testKey);
    await user.click(screen.getByRole('button', { name: 'Check my AI connection' }));
    expect(await screen.findByText(/Temporary key connected/)).toBeInTheDocument();
    expect(network.mock.calls[0][0]).toBe('/api/parents/ai/status');
    expect(network.mock.calls[0][1]).toMatchObject({ credentials: 'include', cache: 'no-store' });
    expect(network.mock.calls[0][1]).not.toHaveProperty('body');
    expect(screen.getByLabelText('Parent’s OpenAI API key')).toHaveValue('');
    expect(saved.update).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Disconnect key and use built-in help' }));
    expect(await screen.findByText('No individual API key is connected. Built-in help is available.')).toBeInTheDocument();
    expect(network.mock.calls[1][0]).toBe('/api/parents/ai/disconnect');
    expect(JSON.parse(network.mock.calls[1][1].body)).toEqual({});
    expect(saved.data.settings.onlineHelp).toBe(false);
    expect(saved.data.settings.year).toBe(4);
  });

  it('links to official API key and pricing pages without making billing or unlimited-cloud claims', () => {
    render(<ParentAIConnection />);
    const keys = screen.getByRole('link', { name: 'Open my OpenAI API keys' });
    const pricing = screen.getByRole('link', { name: 'Read API pricing' });
    expect(keys).toHaveAttribute('href', 'https://platform.openai.com/api-keys');
    expect(pricing).toHaveAttribute('href', 'https://developers.openai.com/api/docs/pricing');
    for (const link of [keys, pricing]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(screen.getByText(/API usage is billed separately from ChatGPT/)).toBeInTheDocument();
    expect(screen.getByText(/rather than a promise of unlimited free cloud AI/)).toBeInTheDocument();
    expect(network).not.toHaveBeenCalled();
  });

  it.each([
    ['server rejection', () => Promise.resolve(response({ error: 'Unauthorized' }, 401)), 'Sign in to a connected parent account before adding an API key.'],
    ['network failure', () => Promise.reject(new Error('offline')), 'AI setup is unavailable. Built-in help still works.'],
  ] as const)('selects local free help even when disconnect encounters %s', async (_label, result, message) => {
    const user = userEvent.setup();
    saved.data.settings.onlineHelp = true;
    network.mockImplementationOnce(result);
    render(<ParentAIConnection />);
    await user.type(screen.getByLabelText('Parent’s OpenAI API key'), testKey);
    await user.click(screen.getByRole('button', { name: 'Disconnect key and use built-in help' }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(saved.data.settings.onlineHelp).toBe(false);
    expect(screen.getByLabelText('Parent’s OpenAI API key')).toHaveValue('');
    expect(network).toHaveBeenCalledTimes(1);
    expect(network.mock.calls[0][0]).toBe('/api/parents/ai/disconnect');
    expect(JSON.parse(network.mock.calls[0][1].body)).toEqual({});
    expect(screen.queryByText('No individual API key is connected. Built-in help is available.')).not.toBeInTheDocument();
  });
});

it('shows free cloud only after an authenticated configured allowance and saves explicit selection', async () => {
  const user = userEvent.setup();
  network.mockResolvedValueOnce(response({ connected: false, mode: 'local', available: { local: true, freeCloud: true } }))
    .mockResolvedValueOnce(response({ connected: false, mode: 'free-cloud', available: { local: true, freeCloud: true } }));
  render(<ParentAIConnection />);
  expect(screen.getByRole('option', { name: /configured free cloud/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save model choice' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Check my AI connection' }));
  await user.selectOptions(screen.getByLabelText('Archie’s model'), 'free-cloud');
  await user.click(screen.getByRole('button', { name: 'Save model choice' }));
  expect(await screen.findByText(/Configured free cloud backup selected/)).toBeInTheDocument();
  expect(JSON.parse(network.mock.calls[1][1].body)).toEqual({ mode: 'free-cloud' });
  expect(saved.data.settings.onlineHelp).toBe(true);
});

it('submits the chosen API model with a hidden temporary key without selecting paid use automatically', async () => {
  const user = userEvent.setup();
  network.mockResolvedValue(response({ connected: true, mode: 'local', model: 'my-model', available: { local: false, freeCloud: false } }));
  render(<ParentAIConnection />);
  await user.type(screen.getByLabelText('Parent’s OpenAI API key'), testKey);
  await user.clear(screen.getByLabelText('OpenAI model ID'));
  await user.type(screen.getByLabelText('OpenAI model ID'), 'my-model');
  await user.click(screen.getByRole('button', { name: 'Connect key temporarily' }));
  expect(JSON.parse(network.mock.calls[0][1].body)).toEqual({ key: testKey, model: 'my-model' });
  expect(saved.data.settings.onlineHelp).toBe(false);
  expect(screen.getByLabelText('Archie’s model')).toHaveValue('local');
});
