export interface ChildApiRecord {
  id: number;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
  totalStars: number;
  leaderboardOptIn?: number;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Normalise the children endpoint while older deployments and cached clients
 * may still use the former `{ children: [...] }` response envelope.
 */
export function normalizeChildrenResponse(value: unknown): ChildApiRecord[] {
  const rawChildren = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.children)
      ? value.children
      : [];

  return rawChildren.flatMap((raw) => {
    if (!isRecord(raw)) return [];

    const id = finiteNumber(raw.id, Number.NaN);
    if (!Number.isSafeInteger(id) || id <= 0 || typeof raw.name !== 'string') return [];

    const ageGroup = typeof raw.ageGroup === 'string'
      ? raw.ageGroup
      : typeof raw.age_group === 'string'
        ? raw.age_group
        : '';
    const avatarEmoji = typeof raw.avatarEmoji === 'string'
      ? raw.avatarEmoji
      : typeof raw.avatar_emoji === 'string'
        ? raw.avatar_emoji
        : '⭐';
    const leaderboardOptIn = raw.leaderboardOptIn ?? raw.leaderboard_opt_in;

    return [{
      id,
      name: raw.name,
      ageGroup,
      avatarEmoji,
      totalStars: finiteNumber(raw.totalStars ?? raw.total_stars),
      ...(leaderboardOptIn === undefined
        ? {}
        : { leaderboardOptIn: finiteNumber(leaderboardOptIn) }),
    }];
  });
}
