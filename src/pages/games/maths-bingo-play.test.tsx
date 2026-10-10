import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/games/GameShell', () => ({
  default: () => null,
  useChildAge: () => ({ tier: 1 }),
}));
vi.mock('@/components/games/ArchieGameHelper', () => ({ default: () => null }));

import { BingoInner } from './maths-bingo';

function answerCurrentQuestion() {
  const text = screen.getByText(/= \?$/).textContent ?? '';
  const match = text.match(/(-?\d+)\s*([+×-])\s*(-?\d+)/);
  if (!match) throw new Error(`Could not read question: ${text}`);
  const left = Number(match[1]);
  const right = Number(match[3]);
  const answer = match[2] === '+' ? left + right : match[2] === '-' ? left - right : left * right;
  fireEvent.click(screen.getByRole('button', { name: String(answer) }));
}

describe('Maths Bingo result', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('awards a perfect result for every correctly answered question in a winning line', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const complete = vi.fn();
    render(<BingoInner onComplete={complete} />);

    for (let turn = 0; turn < 16 && !screen.queryByText('🎱 BINGO!'); turn++) {
      answerCurrentQuestion();
    }

    expect(screen.getByText('🎱 BINGO!')).toBeInTheDocument();
    expect(screen.getAllByRole('button').every(button => button.hasAttribute('disabled'))).toBe(true);
    act(() => vi.advanceTimersByTime(1500));

    expect(complete).toHaveBeenCalledTimes(1);
    const result = complete.mock.calls[0][0];
    expect(result).toMatchObject({ score: 100, stars: 3 });
    expect(result.correct).toBe(result.total);
    expect(result.correct).toBeGreaterThanOrEqual(4);
  });
});
