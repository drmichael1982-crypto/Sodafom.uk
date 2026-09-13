export const PARTY_BALLOONS = ["🎈", "🎈", "🎈", "🎈", "🎈", "🎈"] as const;
export const DEFAULT_PARTY_VOLUME = 0.45;

export function clampPartyVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PARTY_VOLUME;
  return Math.min(1, Math.max(0, value));
}

export function togglePartyBalloon(
  popped: ReadonlySet<number>,
  index: number,
): Set<number> {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= PARTY_BALLOONS.length ||
    popped.has(index)
  ) {
    return new Set(popped);
  }
  const next = new Set(popped);
  next.add(index);
  return next;
}

export function partyBalloonsRemaining(popped: ReadonlySet<number>): number {
  const poppedCount = [...popped].filter(
    (index) => index >= 0 && index < PARTY_BALLOONS.length,
  ).length;
  return PARTY_BALLOONS.length - poppedCount;
}
