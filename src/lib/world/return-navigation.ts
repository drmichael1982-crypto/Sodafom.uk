import { isShopId } from './shop-registry';

const SIMPLE_RETURNS = new Set(['/world/floating', '/cinema', '/books/animated']);

/** Exact local destinations only: never normalise an untrusted URL into a match. */
export function resolveGameReturnTo(value: unknown): string {
  if (typeof value !== 'string') return '/games';
  if (SIMPLE_RETURNS.has(value)) return value;
  const shop = /^\/world\/victorian\?shop=([a-z-]+)$/.exec(value)?.[1];
  return isShopId(shop) && value === `/world/victorian?shop=${shop}` ? value : '/games';
}

/** URLSearchParams decodes the outer game query once; duplicate targets fail closed. */
export function getGameReturnTo(search: string): string {
  const values = new URLSearchParams(search).getAll('returnTo');
  return values.length === 1 ? resolveGameReturnTo(values[0]) : '/games';
}

/** Carry a validated return destination through the next game/level link. */
export function withGameReturnTo(gameRoute: string, search: string): string {
  const queryAt = gameRoute.indexOf('?');
  const path = queryAt < 0 ? gameRoute : gameRoute.slice(0, queryAt);
  if (!/^\/games(?:\/[a-z0-9-]+)?$/.test(path) || /[#\s\\]/.test(gameRoute)) return '/games';
  const params = new URLSearchParams(queryAt < 0 ? '' : gameRoute.slice(queryAt + 1));
  params.delete('returnTo');
  const destination = getGameReturnTo(search);
  if (destination !== '/games') params.set('returnTo', destination);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function gameReturnLabel(destination: string): string {
  if (destination.startsWith('/world/victorian?shop=')) return 'Back to shop';
  if (destination === '/world/floating') return 'Back to planet room';
  if (destination === '/cinema') return 'Back to cinema';
  if (destination === '/books/animated') return 'Back to books';
  return 'Back to games';
}
