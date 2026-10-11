export type GameStarMap = Record<string, number>;

const GAME_STARS_KEY = 'sodafom_game_stars';

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
  return childId ? `${GAME_STARS_KEY}:child:${encodeURIComponent(childId)}` : GAME_STARS_KEY;
}

export function readGameStarMap(): GameStarMap {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(gameStarsStorageKey()) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, stars]) =>
      typeof stars === 'number' && Number.isInteger(stars) && stars >= 0 && stars <= 3
    ));
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
