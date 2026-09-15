/**
 * BrowserRouter and HashRouter track their entries with history.state.idx.
 * history.length also counts pages outside Sodafom, so do not use it to decide
 * whether the not-found page can go back. Unknown state falls back to Home.
 */
export function getNotFoundBackTarget(historyState: unknown): -1 | '/' {
  if (historyState === null || typeof historyState !== 'object') return '/';
  const index = (historyState as { idx?: unknown }).idx;
  return typeof index === 'number' && Number.isSafeInteger(index) && index > 0
    ? -1
    : '/';
}

/** Only accept a single game slug, never an external URL or a nested path. */
export function isGameNavigationCandidate(value: unknown): value is { slug: string } {
  if (value === null || typeof value !== 'object') return false;
  const slug = (value as { slug?: unknown }).slug;
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** The recovery button must still navigate when its optional catalogue is empty. */
export function getRandomGameDestination(
  games: unknown,
  random: () => number = Math.random,
): string {
  const candidates = Array.isArray(games) ? games.filter(isGameNavigationCandidate) : [];
  if (candidates.length === 0) return '/games';
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) return '/games';
  return `/games/${candidates[Math.floor(sample * candidates.length)].slug}`;
}
