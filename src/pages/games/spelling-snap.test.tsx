import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SpellingSnapPlay } from './spelling-snap';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_target, tag: string) => tag }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Spelling Snap contextual questions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows a sentence context without revealing its answer, then gives correct feedback', () => {
    render(<SpellingSnapPlay onComplete={vi.fn()} />);

    expect(screen.getByText('The children put ___ books away.')).toBeInTheDocument();
    expect(screen.queryByText(/the correct answer is/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'their' }));
    expect(screen.getByText('✅ Correct!')).toBeInTheDocument();
  });

  it('includes the final answer and submits one perfect completion', () => {
    const onComplete = vi.fn();
    render(<SpellingSnapPlay onComplete={onComplete} />);

    for (let round = 0; round < 10; round += 1) {
      const answer = screen.getByRole('button', { name: 'their' });
      fireEvent.click(answer);
      fireEvent.click(answer);
      act(() => vi.advanceTimersByTime(800));
    }

    expect(onComplete).toHaveBeenCalledExactlyOnceWith({
      score: 100,
      correct: 10,
      total: 10,
      stars: 3,
    });

    fireEvent.click(screen.getByRole('button', { name: 'their' }));
    act(() => vi.advanceTimersByTime(800));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
