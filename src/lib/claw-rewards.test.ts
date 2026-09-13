import { describe, expect, it } from 'vitest';
import {
  CLAW_PRIZES,
  CLAW_STARS_PER_TURN,
  awardClawPrize,
  availableClawTurns,
  chooseClawPrize,
  createInitialClawProgress,
  syncClawProgress,
} from './claw-rewards';

describe('claw reward turn accounting', () => {
  it('grants one learning turn for every ten stars on first use', () => {
    const progress = createInitialClawProgress(27);
    expect(progress.earnedTurns).toBe(2);
    expect(progress.starRemainder).toBe(7);
    expect(availableClawTurns(progress)).toBe(2);
  });

  it('keeps already-earned turns when the spendable star balance falls', () => {
    const beforeSpend = createInitialClawProgress(30);
    const afterSpend = syncClawProgress(beforeSpend, 5);
    expect(afterSpend.earnedTurns).toBe(3);
    expect(availableClawTurns(afterSpend)).toBe(3);
  });

  it('credits new learning after a star balance decrease', () => {
    let progress = createInitialClawProgress(30);
    progress = syncClawProgress(progress, 5);
    progress = syncClawProgress(progress, 15);
    expect(progress.earnedTurns).toBe(4);
    expect(progress.starRemainder).toBe(0);
  });

  it('guarantees an unseen prize while the collection is incomplete', () => {
    const collection = Object.fromEntries(CLAW_PRIZES.slice(0, -1).map((prize) => [prize.id, 1]));
    const prize = chooseClawPrize(4, 2, collection);
    expect(prize.id).toBe(CLAW_PRIZES[CLAW_PRIZES.length - 1].id);
  });

  it('uses exactly one earned turn when a prize is awarded', () => {
    const progress = createInitialClawProgress(CLAW_STARS_PER_TURN);
    const prize = chooseClawPrize(2, 1, progress.collection);
    const next = awardClawPrize(progress, prize);
    expect(next.spentTurns).toBe(1);
    expect(availableClawTurns(next)).toBe(0);
    expect(next.collection[prize.id]).toBe(1);
  });
});
