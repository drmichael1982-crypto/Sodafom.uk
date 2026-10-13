import { isValidElement } from 'react';
import { Navigate, matchRoutes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { routes } from './routes';

describe('open testing mode commerce routes', () => {
  it('keeps the reachable classic home page consistent with free access', () => {
    const source = readFileSync(`${process.cwd()}/src/pages/index.tsx`, 'utf8');
    expect(source).not.toContain('£1');
    expect(source).not.toContain('Start free trial');
    expect(source).not.toContain('one subscription');
    expect(source).toContain('payment collection is off');
  });

  it.each([
    '/pricing',
    '/demo',
    '/cart',
    '/checkout/success',
    '/checkout/cancel',
    '/referral',
  ])('redirects %s to the free games catalogue', path => {
    const element = matchRoutes(routes, path)?.at(-1)?.route.element;
    expect(isValidElement(element)).toBe(true);
    if (!isValidElement(element)) throw new Error('Expected a route element');
    expect(element.type).toBe(Navigate);
    expect(element.props).toMatchObject({ to: '/games', replace: true });
  });

  it('redirects subscription management to the non-commerce profile page', () => {
    const element = matchRoutes(routes, '/hub/subscription')?.at(-1)?.route.element;
    expect(isValidElement(element)).toBe(true);
    if (!isValidElement(element)) throw new Error('Expected a route element');
    expect(element.type).toBe(Navigate);
    expect(element.props).toMatchObject({ to: '/hub/profile', replace: true });
  });

  it.each(['/admin', '/admin/payments'])(
    'does not replace protected owner route %s with a free-mode redirect',
    path => {
      const element = matchRoutes(routes, path)?.at(-1)?.route.element;
      expect(isValidElement(element)).toBe(true);
      if (!isValidElement(element)) throw new Error('Expected a route element');
      expect(element.type).not.toBe(Navigate);
    },
  );
});
