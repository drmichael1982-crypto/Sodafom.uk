import { describe, expect, it } from 'vitest';
import { isGameForAgeBand, isGameForYear } from './game-age';

describe('game age matching', () => {
  it('matches exact and overlapping displayed age bands', () => {
    expect(isGameForAgeBand('9–10', ['9–11', '12–13'])).toBe(true);
    expect(isGameForAgeBand('10-11', ['7–9', '9–11'])).toBe(true);
    expect(isGameForAgeBand('5–6', ['7–9'])).toBe(false);
  });

  it('rejects malformed or reversed age bands', () => {
    expect(isGameForAgeBand('all', ['5–7'])).toBe(false);
    expect(isGameForAgeBand('9–7', ['5–7'])).toBe(false);
    expect(isGameForAgeBand('5–7', ['older children'])).toBe(false);
  });

  it('matches both possible ages in a school year without exceeding age 13', () => {
    expect(isGameForYear(5, ['9–11'])).toBe(true);
    expect(isGameForYear(3, ['8–10'])).toBe(true);
    expect(isGameForYear(6, ['11–13'])).toBe(true);
    expect(isGameForYear(2, ['9–11'])).toBe(false);
    expect(isGameForYear(9, ['14–16'])).toBe(false);
  });
});
