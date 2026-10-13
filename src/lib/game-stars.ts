export type GameStarMap = Record<string, number>;

const GAME_STARS_KEY = 'sodafom_game_stars';
const PREVIOUS_PROFILE_PREFIX = `${GAME_STARS_KEY}:profile:`;

function activeChildId(): string | null {
  try {
    const child = JSON.parse(localStorage.getItem('sodafom_active_child') || 'null') as Record<string, unknown> | null;
    const id = typeof child?.id === 'number' || typeof child?.id === 'string' ? String(child.id).trim() : '';
    return id || null;
  } catch {
    return null;
  }
}

export function gameStarsStorageKey(childId = activeChildId()): string {
  if (childId) return `${GAME_STARS_KEY}:child:${encodeURIComponent(childId)}`;
  try {
    const localProfile = localStorage.getItem('sodafom_archie_local_profile_v1')?.trim();
    return localProfile ? `${GAME_STARS_KEY}:local:${encodeURIComponent(localProfile.slice(0, 80))}` : GAME_STARS_KEY;
  } catch {
    return GAME_STARS_KEY;
  }
}

function previousProfileStorageKey(childId = activeChildId()): string | null {
  if (childId) return `${PREVIOUS_PROFILE_PREFIX}child:${encodeURIComponent(childId)}`;
  try {
    const localProfile = localStorage.getItem('sodafom_archie_local_profile_v1')?.trim();
    return localProfile ? `${PREVIOUS_PROFILE_PREFIX}local:${encodeURIComponent(localProfile.slice(0, 80))}` : null;
  } catch {
    return null;
  }
}

function parseGameStarMap(raw: string | null): GameStarMap {
  try {
    const parsed: unknown = JSON.parse(raw || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, stars]) =>
      typeof stars === 'number' && Number.isInteger(stars) && stars >= 0 && stars <= 3
    ));
  } catch {
    return {};
  }
}

export function readGameStarMap(): GameStarMap {
  try {
    const canonical = localStorage.getItem(gameStarsStorageKey());
    if (canonical !== null) return parseGameStarMap(canonical);

    // Read the earlier improvement-branch key until the learner next earns a
    // better score. Merely opening the app never copies or deletes a record.
    const previousKey = previousProfileStorageKey();
    return previousKey ? parseGameStarMap(localStorage.getItem(previousKey)) : {};
  } catch {
    return {};
  }
}

export function saveBestGameStars(gameId: string, stars: number): void {
  if (!gameId || !Number.isInteger(stars) || stars < 0 || stars > 3) return;
  const key = gameStarsStorageKey();
  const map = readGameStarMap();
  const previous = map[gameId] ?? 0;
  if (stars <= previous) return;
  try {
    localStorage.setItem(key, JSON.stringify({ ...map, [gameId]: stars }));
  } catch {
    // Private browsing and full storage should not stop a completed game.
  }
}

export function totalGameStars(): number {
  return Object.values(readGameStarMap()).reduce((sum, stars) => sum + stars, 0);
}
