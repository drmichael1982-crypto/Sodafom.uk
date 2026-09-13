import { describe, expect, it } from 'vitest';
import {
  calculateClawTurns,
  clampClawPosition,
  isValidClawPlayToken,
  stablePrizeIndex,
} from './claw-machine';

describe('claw machine reward rules', () => {
  it('earns one turn for every three successful learning sessions', () => {
    expect(calculateClawTurns(0, 0).availableTurns).toBe(0);
    expect(calculateClawTurns(2, 0).availableTurns).toBe(0);
    expect(calculateClawTurns(3, 0).availableTurns).toBe(1);
    expect(calculateClawTurns(7, 1).availableTurns).toBe(1);
  });

  it('never allows used turns to create a negative balance', () => {
    const result = calculateClawTurns(3, 50);
    expect(result.availableTurns).toBe(0);
    expect(result.usedTurns).toBe(50);
  });

  it('reports progress towards the next earned turn', () => {
    const result = calculateClawTurns(5, 1);
    expect(result.sessionsTowardsNextTurn).toBe(2);
    expect(result.sessionsUntilNextTurn).toBe(1);
  });

  it('selects the same prize for the same retry token', () => {
    const token = 'claw-safe-retry-12345';
    expect(stablePrizeIndex(token, 12)).toBe(stablePrizeIndex(token, 12));
    expect(stablePrizeIndex(token, 0)).toBe(-1);
  });

  it('accepts UUID-safe play tokens and rejects unsafe input', () => {
    expect(isValidClawPlayToken('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidClawPlayToken('short')).toBe(false);
    expect(isValidClawPlayToken('bad token with spaces')).toBe(false);
  });

  it('keeps the claw inside the child-friendly control range', () => {
    expect(clampClawPosition(-20)).toBe(15);
    expect(clampClawPosition(55)).toBe(55);
    expect(clampClawPosition(200)).toBe(85);
  });
});
