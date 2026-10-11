import { describe, expect, it } from 'vitest';
import { buildMentalMathResult } from './mental-maths-sprint';

describe('Mental Maths Sprint scoring', () => {
  it.each([
    { correct: 0, score: 0, stars: 0 },
    { correct: 6, score: 50, stars: 1 },
    { correct: 7, score: 58, stars: 1 },
    { correct: 9, score: 75, stars: 2 },
    { correct: 10, score: 83, stars: 2 },
    { correct: 11, score: 92, stars: 3 },
    { correct: 12, score: 100, stars: 3 },
  ])('awards shared percentage stars for $correct of 12', ({ correct, score, stars }) => {
    expect(buildMentalMathResult(correct)).toEqual({
      correct,
      total: 12,
      score,
      stars,
    });
  });

  it('bounds invalid correct totals before deriving progress', () => {
    expect(buildMentalMathResult(-1)).toEqual({ correct: 0, total: 12, score: 0, stars: 0 });
    expect(buildMentalMathResult(13)).toEqual({ correct: 12, total: 12, score: 100, stars: 3 });
  });
});
