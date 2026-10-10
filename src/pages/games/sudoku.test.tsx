import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('motion/react', () => ({ motion: new Proxy({}, { get: (_target, tag) => tag }) }));
import { SudokuInner } from './sudoku';

const EASY_SOLUTION = [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
const EASY_PUZZLE = [[1,null,3,null],[null,4,null,2],[2,null,4,null],[null,3,null,1]];

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0);
  vi.spyOn(Date, 'now').mockReturnValue(1_000);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('reports only the cells the child solved and sends completion once', () => {
  const onComplete = vi.fn();
  render(<SudokuInner difficulty="Easy" onComplete={onComplete} />);

  EASY_PUZZLE.forEach((row, r) => row.forEach((value, c) => {
    if (value !== null) return;
    fireEvent.click(screen.getByRole('button', { name: `Row ${r + 1} column ${c + 1}: empty` }));
    fireEvent.click(screen.getByRole('button', { name: String(EASY_SOLUTION[r][c]) }));
  }));

  fireEvent.click(screen.getByRole('button', { name: '1' }));
  expect(onComplete).toHaveBeenCalledExactlyOnceWith({ score: 100, correct: 8, total: 8, stars: 3 });
});

it.each(['Easy', 'Hard'] as const)('keeps the %s board compact inside a reachable narrow-screen region', difficulty => {
  render(<SudokuInner difficulty={difficulty} onComplete={vi.fn()} />);

  const region = screen.getByRole('region', { name: /Sudoku board/i });
  expect(region).toHaveClass('w-full', 'max-w-full', 'overflow-x-auto', 'overscroll-x-contain');
  expect(region.firstElementChild).toHaveClass('grid', 'w-max', 'mx-auto');
  expect(region.firstElementChild).toHaveStyle({
    gridTemplateColumns: `repeat(${difficulty === 'Easy' ? 4 : 9}, auto)`,
  });
});
