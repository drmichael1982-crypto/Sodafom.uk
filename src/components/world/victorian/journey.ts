import { getShop, resolveShopTarget, type ShopActivityRoute, type ShopId } from '@/lib/world/shop-registry';

export const STREET_ROUTE = '/world/victorian';
export const ACTIVITY_AGES: Record<ShopActivityRoute, readonly [number, number]> = {
  '/games/coin-counter': [5, 10], '/games/shopkeeper-change': [5, 13],
  '/games/pattern-maker': [5, 13], '/games/money-maths': [5, 13],
  '/games/number-bonds': [5, 10], '/games/shape-sorter': [5, 13],
  '/games/fraction-pizza': [8, 13], '/games/ratio-recipe': [10, 13],
};
export function shopFromSearch(search: string): ShopId | null {
  return getShop(new URLSearchParams(search).get('shop'))?.id ?? null;
}
export function learningUrl(shopId: unknown, activityId: unknown, age: number): string | null {
  const target = resolveShopTarget(shopId, 'learning', activityId);
  const shop = getShop(shopId);
  if (!target || !shop || !Number.isInteger(age)) return null;
  const [min, max] = ACTIVITY_AGES[target.route];
  if (age < min || age > max) return null;
  const query = new URLSearchParams({ returnTo: `${STREET_ROUTE}?shop=${shop.id}`, age: String(age) });
  return `${target.route}?${query}`;
}
export const SURPRISES = ['jar-wiggle', 'toy-dog', 'polite-joke', 'golden-star'] as const;
export type Surprise = typeof SURPRISES[number];
/** Seeded Fisher–Yates bags: each harmless effect appears once before refill. */
export function createSurpriseBag(seed = 1305) {
  let state = seed >>> 0;
  let bag: Surprise[] = [];
  let previous: Surprise | undefined;
  return () => {
    if (!bag.length) {
      bag = [...SURPRISES];
      for (let i = bag.length - 1; i > 0; i--) {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        const j = state % (i + 1);
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag[bag.length - 1] === previous) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    previous = bag.pop()!;
    return previous;
  };
}
export const SURPRISE_MESSAGES: Record<Surprise, string> = {
  'jar-wiggle': 'The display does a tiny happy wobble. Can you spot three colours?',
  'toy-dog': 'A little wooden toy dog is peeking out. Hello, explorer!',
  'polite-joke': 'Why did the sweet go to school? To become a Smartie!',
  'golden-star': 'You found the golden star! A little thank-you for being curious.',
};
