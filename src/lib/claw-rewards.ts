export const CLAW_STARS_PER_TURN = 10;

export interface ClawPrize {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: 'bright' | 'super' | 'golden';
}

export interface ClawProgress {
  version: 1;
  lastKnownStars: number;
  starRemainder: number;
  earnedTurns: number;
  spentTurns: number;
  collection: Record<string, number>;
}

export const CLAW_PRIZES: ClawPrize[] = [
  { id: 'rocket', name: 'Rocket Buddy', emoji: '🚀', description: 'A speedy learning rocket for your collection.', rarity: 'bright' },
  { id: 'dino', name: 'Tiny Dino', emoji: '🦕', description: 'A friendly little dinosaur who loves facts.', rarity: 'bright' },
  { id: 'rainbow', name: 'Rainbow Gem', emoji: '🌈', description: 'A colourful gem for brilliant effort.', rarity: 'bright' },
  { id: 'owl', name: 'Wise Owl', emoji: '🦉', description: 'A clever owl who cheers on curious learners.', rarity: 'bright' },
  { id: 'planet', name: 'Planet Pal', emoji: '🪐', description: 'A space prize for out-of-this-world learning.', rarity: 'super' },
  { id: 'unicorn', name: 'Star Unicorn', emoji: '🦄', description: 'A magical friend unlocked through learning.', rarity: 'super' },
  { id: 'trophy', name: 'Mini Trophy', emoji: '🏆', description: 'A tiny trophy celebrating perseverance.', rarity: 'super' },
  { id: 'heart-key', name: 'Golden Heart Key', emoji: '🗝️', description: 'A special golden key for a growing collection.', rarity: 'golden' },
];

export function createInitialClawProgress(totalStars: number): ClawProgress {
  const safeStars = Math.max(0, Math.floor(totalStars));
  return {
    version: 1,
    lastKnownStars: safeStars,
    starRemainder: safeStars % CLAW_STARS_PER_TURN,
    earnedTurns: Math.floor(safeStars / CLAW_STARS_PER_TURN),
    spentTurns: 0,
    collection: {},
  };
}

export function syncClawProgress(progress: ClawProgress, totalStars: number): ClawProgress {
  const safeStars = Math.max(0, Math.floor(totalStars));
  const increase = Math.max(0, safeStars - progress.lastKnownStars);
  const starPool = progress.starRemainder + increase;
  const newTurns = Math.floor(starPool / CLAW_STARS_PER_TURN);

  return {
    ...progress,
    lastKnownStars: safeStars,
    starRemainder: starPool % CLAW_STARS_PER_TURN,
    earnedTurns: progress.earnedTurns + newTurns,
  };
}

export function availableClawTurns(progress: ClawProgress): number {
  return Math.max(0, progress.earnedTurns - progress.spentTurns);
}

function seededIndex(childId: number, playNumber: number, poolSize: number): number {
  if (poolSize <= 1) return 0;
  let seed = (childId * 1103515245 + playNumber * 12345) >>> 0;
  seed ^= seed >>> 16;
  return (seed >>> 0) % poolSize;
}

export function chooseClawPrize(
  childId: number,
  playNumber: number,
  collection: Record<string, number>,
  prizes: ClawPrize[] = CLAW_PRIZES,
): ClawPrize {
  if (prizes.length === 0) {
    throw new Error('Claw machine requires at least one prize');
  }

  const uncollected = prizes.filter((prize) => !collection[prize.id]);
  const pool = uncollected.length > 0 ? uncollected : prizes;
  return pool[seededIndex(childId, playNumber, pool.length)];
}

export function awardClawPrize(progress: ClawProgress, prize: ClawPrize): ClawProgress {
  if (availableClawTurns(progress) <= 0) return progress;

  return {
    ...progress,
    spentTurns: progress.spentTurns + 1,
    collection: {
      ...progress.collection,
      [prize.id]: (progress.collection[prize.id] ?? 0) + 1,
    },
  };
}

export function normaliseClawProgress(value: unknown, totalStars: number): ClawProgress {
  if (!value || typeof value !== 'object') return createInitialClawProgress(totalStars);
  const candidate = value as Partial<ClawProgress>;
  if (candidate.version !== 1) return createInitialClawProgress(totalStars);

  const progress: ClawProgress = {
    version: 1,
    lastKnownStars: Number.isFinite(candidate.lastKnownStars) ? Math.max(0, Math.floor(candidate.lastKnownStars as number)) : 0,
    starRemainder: Number.isFinite(candidate.starRemainder) ? Math.max(0, Math.floor(candidate.starRemainder as number)) % CLAW_STARS_PER_TURN : 0,
    earnedTurns: Number.isFinite(candidate.earnedTurns) ? Math.max(0, Math.floor(candidate.earnedTurns as number)) : 0,
    spentTurns: Number.isFinite(candidate.spentTurns) ? Math.max(0, Math.floor(candidate.spentTurns as number)) : 0,
    collection: candidate.collection && typeof candidate.collection === 'object' ? candidate.collection as Record<string, number> : {},
  };

  if (progress.spentTurns > progress.earnedTurns) progress.spentTurns = progress.earnedTurns;
  return syncClawProgress(progress, totalStars);
}
