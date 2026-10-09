import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const { speak, stop } = vi.hoisted(() => ({ speak: vi.fn(), stop: vi.fn() }));
// These existing help/focus contracts exercise unrestricted account-mode games.
vi.mock('@/lib/config', () => ({ ARCHIE_PREVIEW: false, API_PREFIX: '' }));
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

it('hands focus from Finish to results, then from Replay to the restarted game title', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  render(<HelmetProvider><MemoryRouter><ArchieProvider>
    <GameShell title="Number Planets" emoji="Planet" subject="maths" ageGroups={['5-7']}>
      {complete => <button onClick={() => complete({ score: 100, correct: 8, total: 8, stars: 3 })}>Finish test mission</button>}
    </GameShell>
  </ArchieProvider></MemoryRouter></HelmetProvider>);
  const finish = screen.getByRole('button', { name: 'Finish test mission' });
  expect(screen.getByRole('heading', { level: 1, name: 'Number Planets' })).not.toHaveFocus();
  finish.focus();
  fireEvent.click(finish);
  fireEvent.click(screen.getByRole('button',{name:'Back to puzzle'}));
  await waitFor(() => expect(screen.getByRole('heading', { name: /Amazing exploring/ })).toHaveFocus());
  expect(finish).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Amazing exploring/ })).toHaveAttribute('tabindex', '-1');
  expect(screen.getByText('8 correct out of 8 questions')).toBeInTheDocument();
  const replay = screen.getByRole('button', { name: 'Play another round' });
  replay.focus();
  fireEvent.click(replay);
  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Number Planets' })).toHaveFocus());
  expect(replay).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Finish test mission' })).toBeInTheDocument();
  expect(screen.queryByText('8 correct out of 8 questions')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1');
});

it('preserves surviving tutor input focus while Replay replaces the result', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  render(<HelmetProvider><MemoryRouter><ArchieProvider>
    <input aria-label="Tutor question" />
    <GameShell title="Number Planets" emoji="Planet" subject="maths" ageGroups={['5-7']}>
      {complete => <button onClick={() => complete({ score: 100, correct: 8, total: 8, stars: 3 })}>Finish test mission</button>}
    </GameShell>
  </ArchieProvider></MemoryRouter></HelmetProvider>);
  const finish = screen.getByRole('button', { name: 'Finish test mission' });
  finish.focus(); fireEvent.click(finish);
  fireEvent.click(screen.getByRole('button',{name:'Back to puzzle'}));
  await waitFor(() => expect(screen.getByRole('heading', { name: /Amazing exploring/ })).toHaveFocus());
  const replay = screen.getByRole('button', { name: 'Play another round' });
  const input = screen.getByRole('textbox', { name: 'Tutor question' });
  input.focus();
  fireEvent.click(replay);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Finish test mission' })).toBeInTheDocument());
  expect(input).toHaveFocus();
});

it('does not retry a modal-blocked replay handoff after a later rerender', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const content = (title: string) => <HelmetProvider><MemoryRouter><ArchieProvider>
    <dialog aria-label="Test help" />
    <GameShell title={title} emoji="Planet" subject="maths" ageGroups={['5-7']}>
      {complete => <button onClick={() => complete({ score: 100, correct: 8, total: 8, stars: 3 })}>Finish test mission</button>}
    </GameShell>
  </ArchieProvider></MemoryRouter></HelmetProvider>;
  const view = render(content('Number Planets'));
  const finish = screen.getByRole('button', { name: 'Finish test mission' });
  finish.focus(); fireEvent.click(finish);
  fireEvent.click(screen.getByRole('button',{name:'Back to puzzle'}));
  await waitFor(() => expect(screen.getByRole('heading', { name: /Amazing exploring/ })).toHaveFocus());
  const replay = screen.getByRole('button', { name: 'Play another round' });
  const dialog = screen.getByLabelText('Test help');
  dialog.setAttribute('open', '');
  replay.focus(); fireEvent.click(replay);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Finish test mission' })).toBeInTheDocument());
  expect(document.body).toHaveFocus();
  dialog.removeAttribute('open');
  view.rerender(content('Restarted Number Planets'));
  expect(screen.getByRole('heading', { level: 1, name: 'Restarted Number Planets' })).not.toHaveFocus();
  expect(document.body).toHaveFocus();
});
