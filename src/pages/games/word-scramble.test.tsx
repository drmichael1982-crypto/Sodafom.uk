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
