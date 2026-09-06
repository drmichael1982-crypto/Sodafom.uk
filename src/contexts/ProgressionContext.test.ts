import { describe, expect, it } from 'vitest';
import { GAMES_PER_LEVEL, levelForCompletionCount } from './ProgressionContext';

describe('Sodafom level progression', () => {
  it('advances exactly after every ten completed games', () => {
    expect(GAMES_PER_LEVEL).toBe(10);
    expect(levelForCompletionCount(0)).toBe(1);
    expect(levelForCompletionCount(9)).toBe(1);
    expect(levelForCompletionCount(10)).toBe(2);
    expect(levelForCompletionCount(19)).toBe(2);
    expect(levelForCompletionCount(20)).toBe(3);
  });

  it('safely handles damaged saved values', () => {
    expect(levelForCompletionCount(-4)).toBe(1);
    expect(levelForCompletionCount(Number.NaN)).toBe(1);
    expect(levelForCompletionCount(10.9)).toBe(2);
  });
});
