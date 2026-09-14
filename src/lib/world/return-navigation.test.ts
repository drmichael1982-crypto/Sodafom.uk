import { describe, expect, it } from 'vitest';
import { SHOPS } from './shop-registry';
import { getGameReturnTo, resolveGameReturnTo, withGameReturnTo } from './return-navigation';

describe('learning-world return navigation', () => {
  it.each(SHOPS.map(shop => shop.id))('returns to the registered %s shop', shopId => {
    const target = `/world/victorian?shop=${shopId}`;
    expect(getGameReturnTo(`?returnTo=${encodeURIComponent(target)}`)).toBe(target);
  });

  it.each(['/world/floating', '/cinema', '/books/animated'])('accepts %s exactly', target => {
    expect(resolveGameReturnTo(target)).toBe(target);
  });

  it.each([
    undefined, null, {}, '', '/admin-panel', 'https://evil.example/world/floating',
    '//evil.example/world/floating', 'javascript:alert(1)', '\\evil.example',
    '/world/../world/floating', '/world/%2e%2e/world/floating', '/world//floating',
    ' /world/floating', '/world/floating ', '/world/floating#x', '/world/floating?next=evil',
    '/world/floating/', '/world/victorian', '/world/victorian?shop=unknown',
    '/world/victorian?shop=sweet-shop&shop=school-supplies',
    '/world/victorian?shop=sweet-shop&next=https://evil.example',
    '/world/victorian?shop=sweet-shop&age=7', '/world/victorian?shop=%73weet-shop',
    '/world/victorian?shop=sweet-shop#x', '/world/victorian?shop=sweet-shop\n',
    '%2Fworld%2Ffloating', '/world/floating\u0000',
  ])('rejects an unapproved or ambiguous target %j', target => {
    expect(resolveGameReturnTo(target)).toBe('/games');
  });

  it('rejects duplicate and doubly encoded outer parameters', () => {
    expect(getGameReturnTo('?returnTo=%2Fcinema&returnTo=%2Fworld%2Ffloating')).toBe('/games');
    expect(getGameReturnTo('?returnTo=%252Fcinema')).toBe('/games');
    expect(getGameReturnTo('?level=2')).toBe('/games');
  });

  it('preserves the next game level and validated shop destination', () => {
    const target = '/world/victorian?shop=cake-and-pie';
    const result = withGameReturnTo('/games/fraction-pizza?level=3', `?level=2&returnTo=${encodeURIComponent(target)}`);
    expect(result.split('?')[0]).toBe('/games/fraction-pizza');
    const params = new URLSearchParams(result.split('?')[1]);
    expect(params.get('level')).toBe('3');
    expect(params.getAll('returnTo')).toEqual([target]);
  });

  it('removes stale return parameters when the current destination is invalid', () => {
    expect(withGameReturnTo('/games/money-maths?level=2&returnTo=%2Fcinema', '?returnTo=https://evil.example'))
      .toBe('/games/money-maths?level=2');
  });

  it.each(['https://evil.example/games/foo', '/games/../admin', '/games/%2e%2e/admin', '/games/foo#x'])('rejects an unsafe next-game route %s', route => {
    expect(withGameReturnTo(route, '?returnTo=%2Fcinema')).toBe('/games');
  });
});
