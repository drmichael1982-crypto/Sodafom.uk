import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { VoiceProvider } from '@/lib/voice-context';

vi.mock('@/components/games/GameShell', () => ({
  default: ({ children }: any) => children(vi.fn()),
  useChildAge: () => ({ tier: 2 }),
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('motion/react', async () => {
  const { createElement } = await import('react');
  const element = (tag: string) => ({ children, initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileHover: _whileHover, whileTap: _whileTap, ...props }: any) => createElement(tag, props, children);
  return {
    motion: { div: element('div'), button: element('button') },
    AnimatePresence: ({ children }: any) => children,
  };
});
import ReadingQuestGame from './reading-quest';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('speechSynthesis', undefined);
  vi.stubGlobal('SpeechSynthesisUtterance', undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('keeps the passage visible and offers calm recovery when read aloud is unavailable', () => {
  render(<VoiceProvider><ReadingQuestGame /></VoiceProvider>);
  const control = screen.getByRole('button', { name: 'Read passage aloud' });
  const passageCard = document.getElementById(control.getAttribute('aria-controls')!);
  expect(passageCard).toHaveTextContent(/./);

  control.focus();
  fireEvent.click(control);

  expect(screen.getByRole('status')).toHaveTextContent('Read aloud is not available on this device. Keep reading on the screen, or ask a grown-up to check the sound settings.');
  expect(control).toHaveFocus();
  expect(control).toHaveAccessibleName('Read passage aloud');
  expect(passageCard).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
