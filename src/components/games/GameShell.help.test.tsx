import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const { speak, stop } = vi.hoisted(() => ({ speak: vi.fn(), stop: vi.fn() }));
vi.mock('@/lib/auth/auth-client', () => ({ useSession: () => ({ session: null }), signOut: vi.fn() }));
vi.mock('@/contexts/ProgressionContext', () => ({ useProgression: () => ({ recordGameCompletion: vi.fn() }) }));
vi.mock('@/lib/voice-context', () => ({ useVoice: () => ({ speak, stop, playing: false }) }));
vi.mock('./PaywallGate', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('./ActiveChildBanner', () => ({ default: () => null }));
import { ArchieProvider } from '@/contexts/ArchieContext';
import ArchieHelper from '@/components/ArchieHelper';
import GameShell from './GameShell';
import GameHubHelp from './GameHubHelp';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({}) }));
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it('opens the shared contextual helper from game help without starting speech or microphone access', () => {
  const microphone = vi.fn();
  vi.stubGlobal('SpeechRecognition', microphone);
  render(<HelmetProvider><MemoryRouter initialEntries={['/games/number-planets']}><ArchieProvider>
    <GameShell title="Number Planets" emoji="Planet" subject="maths" ageGroups={['5-7']} currentQuestion="2 times 3 = ?" currentOptions={['6', '7', '5', '9']}>
      {() => <button>Answer 6</button>}
    </GameShell>
    <ArchieHelper hideLauncher />
  </ArchieProvider></MemoryRouter></HelmetProvider>);
  const help = within(screen.getByRole('group', { name: 'Game help' })).getByRole('button', { name: 'Ask Archie' });
  expect(screen.getAllByRole('button', { name: 'Ask Archie' })).toHaveLength(1);
  help.focus();fireEvent.click(help);
  expect(screen.getByRole('dialog', { name: 'Ask Archie' })).toBeInTheDocument();
  expect(screen.getByText('Helping with Number Planets')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Read the question' })).toBeInTheDocument();
  expect(microphone).not.toHaveBeenCalled();expect(speak).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Close Ask Archie' }));
  expect(screen.queryByRole('dialog', { name: 'Ask Archie' })).not.toBeInTheDocument();
  expect(help).toBeInTheDocument();expect(help).toBeEnabled();
});

it('opens in-flow game-menu help with its subject context without starting voice', () => {
  const microphone = vi.fn();
  vi.stubGlobal('SpeechRecognition', microphone);
  render(<HelmetProvider><MemoryRouter initialEntries={['/games/maths']}><ArchieProvider>
    <GameHubHelp title="Maths game library" subject="maths" />
    <ArchieHelper hideLauncher />
  </ArchieProvider></MemoryRouter></HelmetProvider>);
  const help = within(screen.getByRole('group', { name: 'Game menu help' })).getByRole('button', { name: 'Ask Archie' });
  expect(screen.getAllByRole('button', { name: 'Ask Archie' })).toHaveLength(1);
  help.focus(); fireEvent.click(help);
  expect(screen.getByRole('dialog', { name: 'Ask Archie' })).toBeInTheDocument();
  expect(screen.getByText('Helping with Maths game library')).toBeInTheDocument();
  expect(microphone).not.toHaveBeenCalled();
  expect(speak).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Close Ask Archie' }));
  expect(screen.queryByRole('dialog', { name: 'Ask Archie' })).not.toBeInTheDocument();
  expect(help).toBeEnabled();
});
