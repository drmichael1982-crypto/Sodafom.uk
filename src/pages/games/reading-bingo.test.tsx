import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BINGO_LINE_LENGTH, BingoInner } from './reading-bingo';

describe('Reading Bingo result', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('records the completed three-tile line rather than claiming nine answers', () => {
    const complete = vi.fn();
    render(<BingoInner onComplete={complete} />);
    const tiles = screen.getAllByRole('button');

    fireEvent.click(tiles[0]);
    fireEvent.click(tiles[1]);
    act(() => vi.advanceTimersByTime(1500));
    expect(complete).not.toHaveBeenCalled();

    fireEvent.click(tiles[2]);
    expect(screen.getByText('🎉 BINGO!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1500));
    expect(complete).toHaveBeenCalledExactlyOnceWith({ score: 100, correct: BINGO_LINE_LENGTH, total: BINGO_LINE_LENGTH, stars: 3 });
  });
});
