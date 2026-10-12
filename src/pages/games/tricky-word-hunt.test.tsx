import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { buildTrickyWordResult, TrickyWordPlay } from './tricky-word-hunt';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_target, tag: string) => tag }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/components/games/GameShell', () => ({
  default: () => null,
  useChildAge: () => ({ tier: 1 }),
}));

describe('Tricky Word Hunt scoring', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([
    [10, { score: 100, stars: 3 }],
    [9, { score: 90, stars: 3 }],
    [6, { score: 60, stars: 2 }],
    [3, { score: 30, stars: 1 }],
    [2, { score: 20, stars: 0 }],
  ])('awards performance stars for %i correct answers', (correct, expected) => {
    expect(buildTrickyWordResult(correct)).toEqual({
      ...expected,
      correct,
      total: 10,
    });
  });

  it('includes the final correct answer and submits three stars once', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const onComplete = vi.fn();

    render(<TrickyWordPlay onComplete={onComplete} />);

    for (const word of ['the', 'said', 'have', 'like', 'some', 'come', 'were', 'there', 'their', 'people']) {
      fireEvent.click(screen.getByRole('button', { name: word }));
      act(() => vi.advanceTimersByTime(1000));
    }

    expect(onComplete).toHaveBeenCalledExactlyOnceWith({
      score: 100,
      correct: 10,
      total: 10,
      stars: 3,
    });
  });
});
