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

it('keeps a mistaken word available for a supportive retry and rewards eventual completion', async () => {
  const onComplete = vi.fn();
  render(<WordScrambleInner onComplete={onComplete} />);

  screen.getAllByRole('button', { name: /^Letter / }).reverse().forEach(letter => fireEvent.click(letter));
  expect(screen.getByRole('status')).toHaveTextContent('Not quite yet');
  expect(screen.getByText('1/10')).toBeInTheDocument();
  await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
  expect(screen.getByText('1/10')).toBeInTheDocument();
  expect(onComplete).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  for (const letter of ['C', 'A', 'T']) fireEvent.click(screen.getByRole('button', { name: `Letter ${letter}` }));
  await act(async () => { await vi.advanceTimersByTimeAsync(1401); });

  for (let round = 1; round < 10; round += 1) {
    screen.getAllByRole('button', { name: /^Letter / }).forEach(letter => fireEvent.click(letter));
    await act(async () => { await vi.advanceTimersByTimeAsync(1401); });
  }

  expect(onComplete).toHaveBeenCalledExactlyOnceWith({
    score: 95,
    correct: 10,
    total: 10,
    stars: 3,
    maxScore: 100,
    durationSeconds: 0,
  });
});

it('preserves a partial answer while the learner takes an optional break', () => {
  render(<WordScrambleInner onComplete={vi.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: 'Letter C' }));
  fireEvent.click(screen.getByRole('button', { name: 'Pause game' }));
  expect(screen.getByRole('status')).toHaveTextContent('Paused. Your letters are saved.');
  expect(screen.getByRole('button', { name: 'Remove letter C' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Letter A' })).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: 'Resume game' }));
  expect(screen.getByRole('button', { name: 'Remove letter C' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Letter A' })).toBeEnabled();
});
