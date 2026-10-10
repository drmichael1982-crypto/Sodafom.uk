import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { VoiceProvider } from '@/lib/voice-context';

vi.mock('@/components/games/GameShell', () => ({
  default: ({ children }: any) => children(vi.fn()),
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('motion/react', async () => {
  const { createElement } = await import('react');
  const element = (tag: string) => ({ children, initial, animate, exit, transition, whileHover, whileTap, ...props }: any) => createElement(tag, props, children);
  return {
    motion: { div: element('div'), button: element('button') },
    AnimatePresence: ({ children }: any) => children,
  };
});
import PhonicsParrotGame from './phonics-parrot';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('speechSynthesis', undefined);
  vi.stubGlobal('SpeechSynthesisUtterance', undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('keeps the printed sound visible and offers calm recovery when speech is unavailable', () => {
  render(<VoiceProvider><PhonicsParrotGame /></VoiceProvider>);
  const control = screen.getByRole('button', { name: 'Hear the sound' });
  const soundCard = document.getElementById(control.getAttribute('aria-controls')!);
  expect(soundCard).toHaveTextContent(/is for/i);

  control.focus();
  fireEvent.click(control);

  expect(screen.getByRole('status')).toHaveTextContent('Read aloud is not available on this device. Keep reading on the screen, or ask a grown-up to check the sound settings.');
  expect(control).toHaveFocus();
  expect(control).toHaveAccessibleName('Hear the sound');
  expect(soundCard).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
