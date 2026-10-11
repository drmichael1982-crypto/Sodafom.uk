import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
import ReadingQuestGame, { ReadingQuestPlay } from './reading-quest';

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  localStorage.clear();
  vi.stubGlobal('speechSynthesis', undefined);
  vi.stubGlobal('SpeechSynthesisUtterance', undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
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

describe('Reading Quest supported recovery', () => {
  it('keeps a mistaken question for a clue, pause and corrected retry', () => {
    render(<ReadingQuestPlay onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Answer questions/ }));

    const question = screen.getByRole('heading', { level: 2 });
    const questionText = question.textContent ?? '';
    const answer = questionText.includes('compass') ? "Her grandmother's attic" : 'Biscuit';
    const wrong = questionText.includes('compass') ? 'The garden' : 'Sparky';
    fireEvent.click(screen.getByRole('button', { name: wrong }));

    expect(screen.getByRole('status')).toHaveTextContent('Good try. Keep this question and look for evidence.');
    expect(question).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(`^${wrong}`) })).toBeDisabled();
    expect(screen.getByRole('button', { name: answer })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Pause quest' }));
    expect(screen.getByText('Paused. Your question is saved.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: answer })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Resume quest' }));
    expect(question).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: answer }));
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByText('Question 2/3')).toBeInTheDocument();
    expect(screen.getByText('⭐ 0 first-try correct')).toBeInTheDocument();
  });

  it('lets the learner re-read without resetting the current question', () => {
    render(<ReadingQuestPlay onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Answer questions/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Re-read the passage' }));
    expect(screen.getByRole('button', { name: 'Return to question 🎯' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Return to question 🎯' }));
    expect(screen.getByText('Question 1/3')).toBeInTheDocument();
  });

  it('scores first-try accuracy after a corrected mistake and completes once', () => {
    const onComplete = vi.fn();
    render(<ReadingQuestPlay onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /Answer questions/ }));

    for (let index = 0; index < 3; index += 1) {
      const prompt = screen.getByRole('heading', { level: 2 }).textContent ?? '';
      const answers: Record<string, string> = {
        'Where did Maya find the compass?': "Her grandmother's attic",
        'What was unusual about the compass?': "It didn't point north",
        'What did Maya find under the oak tree?': 'A wooden box',
        "What was the name of Zara's robot?": 'Biscuit',
        'What did Biscuit make for breakfast?': 'Galaxy Pancakes',
        'What happened when you poured syrup on the pancakes?': 'They changed colour',
      };
      const answer = answers[prompt];
      expect(answer).toBeTruthy();
      if (index === 0) {
        const wrong = screen.getAllByRole('button').find(button =>
          button.textContent !== answer && !['Show reading clue', 'Pause quest', 'Re-read the passage'].includes(button.textContent ?? ''),
        );
        expect(wrong).toBeTruthy();
        fireEvent.click(wrong!);
      }
      fireEvent.click(screen.getByRole('button', { name: answer }));
      act(() => vi.advanceTimersByTime(900));
    }

    expect(onComplete).toHaveBeenCalledExactlyOnceWith({ score: 67, correct: 2, total: 3, stars: 1 });
    act(() => vi.advanceTimersByTime(900));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
