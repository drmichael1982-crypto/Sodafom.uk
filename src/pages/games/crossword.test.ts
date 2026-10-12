import { describe, expect, it } from 'vitest';
import { buildCrosswordGrid, PUZZLES } from './crossword';

describe('crossword definitions', () => {
  it.each(PUZZLES)('$title has valid matching intersections', puzzle => {
    const grid = buildCrosswordGrid(puzzle);
    for (const clue of puzzle.clues) {
      const letters = Array.from({ length: clue.answer.length }, (_, i) => {
        const row = clue.direction === 'across' ? clue.row : clue.row + i;
        const col = clue.direction === 'across' ? clue.col + i : clue.col;
        return grid[row]?.[col];
      }).join('');
      expect(letters).toBe(clue.answer);
    }
  });
});
