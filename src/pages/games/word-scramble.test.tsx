import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { WordScrambleInner } from './word-scramble';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_target, tag: string) => tag }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('keeps the hint controls large enough to tap on a phone or tablet', () => {
  render(<WordScrambleInner onComplete={vi.fn()} />);

  expect(screen.getByRole('button', { name: 'Read hint aloud' })).toHaveClass('w-11', 'h-11');
  const showHint = screen.getByRole('button', { name: 'Show hint' });
  expect(showHint).toHaveClass('w-11', 'h-11');

  fireEvent.click(showHint);

  expect(screen.queryByRole('button', { name: 'Show hint' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Read hint aloud' })).toHaveClass('w-11', 'h-11');
});

it('includes the final correct word in a perfect ten-word result', async () => {
  const onComplete = vi.fn();
  render(<WordScrambleInner onComplete={onComplete} />);

  for (let round = 0; round < 10; round += 1) {
    const letters = screen.getAllByRole('button', { name: /^Letter / });
    letters.forEach(letter => fireEvent.click(letter));
    await act(async () => { await vi.advanceTimersByTimeAsync(1401); });
  }

  expect(onComplete).toHaveBeenCalledExactlyOnceWith({
    score: 100,
    correct: 10,
    total: 10,
    stars: 3,
    maxScore: 100,
    durationSeconds: 0,
  });
});
