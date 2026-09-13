export const CLAW_SESSIONS_PER_TURN = 3;

export interface ClawTurnSummary {
  successfulLearningSessions: number;
  earnedTurns: number;
  usedTurns: number;
  availableTurns: number;
  sessionsTowardsNextTurn: number;
  sessionsUntilNextTurn: number;
}

function safeWholeNumber(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

/**
 * Turns are learning-earned only: one turn for every three successful learning
 * sessions. Used turns are ledgered server-side, so there is no purchasable or
 * client-controlled claw currency.
 */
export function calculateClawTurns(
  successfulLearningSessions: number,
  usedTurns: number,
  sessionsPerTurn = CLAW_SESSIONS_PER_TURN,
): ClawTurnSummary {
  const sessions = safeWholeNumber(successfulLearningSessions);
  const used = safeWholeNumber(usedTurns);
  const threshold = Math.max(1, safeWholeNumber(sessionsPerTurn));
  const earnedTurns = Math.floor(sessions / threshold);
  const availableTurns = Math.max(0, earnedTurns - used);
  const sessionsTowardsNextTurn = sessions % threshold;

  return {
    successfulLearningSessions: sessions,
    earnedTurns,
    usedTurns: used,
    availableTurns,
    sessionsTowardsNextTurn,
    sessionsUntilNextTurn: availableTurns > 0 ? 0 : threshold - sessionsTowardsNextTurn,
  };
}

/** Stable selection keeps retries idempotent without exposing a paid/randomised mechanic. */
export function stablePrizeIndex(playToken: string, prizeCount: number): number {
  const count = safeWholeNumber(prizeCount);
  if (count <= 0) return -1;

  // FNV-1a style 32-bit hash. This is deliberately deterministic, not security-sensitive.
  let hash = 0x811c9dc5;
  for (let i = 0; i < playToken.length; i += 1) {
    hash ^= playToken.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % count;
}

export function isValidClawPlayToken(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{12,64}$/.test(value);
}

export function clampClawPosition(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(85, Math.max(15, Math.round(value)));
}
