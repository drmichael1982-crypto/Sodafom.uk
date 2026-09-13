import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizEngine, { optionIndexForShortcut, shuffleQuizItems } from './QuizEngine';

const voice = vi.hoisted(() => ({ speak: vi.fn() }));

vi.mock('@/lib/voice-context', () => ({
  useVoice: () => ({ ...voice, playing: false }),
}));

const QUESTIONS = [
  { question: 'What is 1 + 1?', options: ['2', '3'], answer: '2' },
  { question: 'What is 2 + 2?', options: ['4', '5'], answer: '4' },
];

describe('QuizEngine helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses a non-mutating Fisher–Yates shuffle for answer positions', () => {
    const source = ['one', 'two', 'three', 'four'];
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(shuffleQuizItems(source)).toEqual(['two', 'three', 'four', 'one']);
    expect(source).toEqual(['one', 'two', 'three', 'four']);
  });

  it('maps only available number shortcuts to answer positions', () => {
    expect(optionIndexForShortcut('1', 4)).toBe(0);
    expect(optionIndexForShortcut('4', 4)).toBe(3);
    expect(optionIndexForShortcut('5', 4)).toBeNull();
    expect(optionIndexForShortcut('0', 4)).toBeNull();
    expect(optionIndexForShortcut('ArrowRight', 4)).toBeNull();
  });
});

describe('QuizEngine keyboard flow', () => {
  beforeEach(() => {
    localStorage.clear();
    voice.speak.mockReset();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts a number-key answer and lets a keyboard player advance immediately', async () => {
    render(
      <QuizEngine
        title="Quick Maths"
        emoji="🔢"
        questions={QUESTIONS}
        onComplete={vi.fn()}
        sessionKey="quiz-engine-keyboard-flow"
      />,
    );

    const firstOption = screen.getByRole('button', { name: 'Answer 1: 2' });
    expect(firstOption).toHaveAttribute('aria-keyshortcuts', '1');
    expect(screen.getByText(/use number keys 1–2/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: '1' });

    expect(screen.getByRole('button', { name: 'Next question' })).toBeInTheDocument();
    expect(voice.speak).toHaveBeenCalledWith(
      expect.stringContaining('archie-answer:'),
      expect.stringContaining("That's correct"),
    );

    fireEvent.keyDown(window, { key: 'Enter' });

    await waitFor(() => expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Next question' })).not.toBeInTheDocument();
  });
});
