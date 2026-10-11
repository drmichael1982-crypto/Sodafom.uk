import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SPELLING_SNAP_QUESTIONS, SpellingSnapPlay } from './spelling-snap';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_target, tag: string) => tag }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Spelling Snap contextual questions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
    expect(screen.getByText('Question 1 of 10 · 0 first-try correct')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'their' }));
    expect(screen.getByText('✅ Correct!')).toBeInTheDocument();
  });

  it('keeps a wrong sentence active for a supported retry and preserves it through a break', () => {
    render(<SpellingSnapPlay onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'there' }));
    expect(screen.getByRole('status')).toHaveTextContent('Good try. Keep this sentence and choose again.');
    expect(screen.getByRole('status')).toHaveTextContent('“Their” shows belonging. “There” points to a place.');
    expect(screen.getByText('The children put ___ books away.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'there' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'their' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Pause game' }));
    expect(screen.getByText('Paused. Your sentence is saved.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'their' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Resume game' }));
    expect(screen.getByText('The children put ___ books away.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'their' }));
    expect(screen.getByRole('status')).toHaveTextContent('You fixed it!');
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByText('Lack of sleep can ___ your concentration.')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 10 · 0 first-try correct')).toBeInTheDocument();
  });

  it('offers a meaning hint without moving or scoring the question', () => {
    render(<SpellingSnapPlay onComplete={vi.fn()} />);

    const hint = screen.getByRole('button', { name: 'Show meaning hint' });
    fireEvent.click(hint);
    expect(screen.getByText('Meaning hint')).toBeInTheDocument();
    expect(screen.getByText('“Their” shows belonging. “There” points to a place.')).toBeInTheDocument();
    expect(hint).toHaveAttribute('aria-pressed', 'true');
    expect(hint).toBeEnabled();
    expect(screen.getByText('Question 1 of 10 · 0 first-try correct')).toBeInTheDocument();
  });

  it('scores first-try accuracy after a corrected mistake and submits once', () => {
    const onComplete = vi.fn();
    render(<SpellingSnapPlay onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'there' }));

    for (const question of SPELLING_SNAP_QUESTIONS) {
      const answer = screen.getByRole('button', { name: question.answer });
      fireEvent.click(answer);
      fireEvent.click(answer);
      act(() => vi.advanceTimersByTime(900));
    }

    expect(onComplete).toHaveBeenCalledExactlyOnceWith({
      score: 90,
      correct: 9,
      total: 10,
      stars: 3,
    });

    act(() => vi.advanceTimersByTime(900));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cancels delayed completion when the game unmounts', () => {
    const onComplete = vi.fn();
    const view = render(<SpellingSnapPlay onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'their' }));
    view.unmount();
    act(() => vi.advanceTimersByTime(900));

    expect(onComplete).not.toHaveBeenCalled();
  });
});
