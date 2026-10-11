import { describe, expect, it } from 'vitest';
import { starsForPercentage } from './game-scoring';

describe('adaptive game star thresholds', () => {
  it.each([
    [0, 0],
    [49, 0],
    [50, 1],
    [60, 1],
    [74, 1],
    [75, 2],
    [80, 2],
    [89, 2],
    [90, 3],
    [100, 3],
  ])('converts %d%% into %d stars', (score, stars) => {
    expect(starsForPercentage(score)).toBe(stars);
  });
});
