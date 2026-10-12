import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_target, tag) => tag }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));
import { TimesTablesChallengeInner } from './times-tables-challenge';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-10T00:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('includes the final correct answer in a completed twelve-question challenge', async () => {
  const onComplete = vi.fn();
  render(<TimesTablesChallengeInner difficulty="Easy" onComplete={onComplete} />);
  const game = screen.getByLabelText('Times Tables Challenge game');
  expect(game).toHaveClass('h-full', 'min-h-0', 'overflow-y-auto', 'overscroll-contain');
  expect(screen.getByTestId('challenge-timer')).toHaveClass('sticky', 'top-0');

  for (let round = 0; round < 12; round += 1) {
    const prompt = screen.getByText(/\d+ × \d+ = \?/).textContent ?? '';
    const match = prompt.match(/(\d+) × (\d+)/);
    expect(match).not.toBeNull();
    const answer = Number(match![1]) * Number(match![2]);
    fireEvent.click(screen.getByRole('button', { name: String(answer) }));
    await act(async () => { await vi.advanceTimersByTimeAsync(901); });
  }

  expect(onComplete).toHaveBeenCalledExactlyOnceWith({
    score: 180,
    correct: 12,
    total: 12,
    stars: 3,
    maxScore: 180,
    durationSeconds: 0,
  });
});
