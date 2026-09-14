import { describe, expect, it } from 'vitest';
import { SHOPS } from '@/lib/world/shop-registry';
import { ACTIVITY_AGES, createSurpriseBag, learningUrl, shopFromSearch, SURPRISES } from './journey';

describe('Victorian shop journey', () => {
  it('allows only registered shops from query strings', () => {
    expect(shopFromSearch('?shop=sweet-shop')).toBe('sweet-shop');
    for (const value of ['https://example.com', '../checkout', 'SWEET-SHOP', '__proto__', '']) expect(shopFromSearch(`?shop=${encodeURIComponent(value)}`)).toBeNull();
  });
  it('returns each allowed game to its exact shop with age separate from the return target', () => {
    for (const shop of SHOPS) for (const activity of shop.activities) {
      const age = ACTIVITY_AGES[activity.route][0];
      const result = learningUrl(shop.id, activity.id, age);
      expect(result).not.toBeNull();
      const url = new URL(result!, 'https://sodafom.uk');
      expect(url.pathname).toBe(activity.route);
      expect(url.searchParams.get('returnTo')).toBe(`/world/victorian?shop=${shop.id}`);
      expect(url.searchParams.get('age')).toBe(String(age));
    }
  });
  it('does not expose unsuitable ratio or fractions games to a five-year-old', () => {
    expect(learningUrl('cake-and-pie', 'recipe-ratios', 5)).toBeNull();
    expect(learningUrl('cake-and-pie', 'share-fractions', 5)).toBeNull();
    expect(learningUrl('cake-and-pie', 'recipe-ratios', 10)).toContain('/games/ratio-recipe?');
  });
  it('rejects foreign activities, hostile URLs and invalid ages', () => {
    for (const age of [NaN, Infinity, 4, 14, 7.5]) expect(learningUrl('sweet-shop', 'count-coins', age)).toBeNull();
    expect(learningUrl('sweet-shop', 'recipe-ratios', 10)).toBeNull();
    expect(learningUrl('sweet-shop', 'https://example.com', 7)).toBeNull();
    expect(learningUrl('checkout', 'count-coins', 7)).toBeNull();
  });
});

describe('safe shuffled surprise bag', () => {
  it('is reproducible and exhausts each bag before repeating', () => {
    const first = createSurpriseBag(42), second = createSurpriseBag(42);
    const values = Array.from({ length: 32 }, () => first());
    expect(values).toEqual(Array.from({ length: 32 }, () => second()));
    for (let i = 0; i < values.length; i += 4) expect([...values.slice(i, i + 4)].sort()).toEqual([...SURPRISES].sort());
    for (let i = 1; i < values.length; i++) expect(values[i]).not.toBe(values[i - 1]);
  });
});
