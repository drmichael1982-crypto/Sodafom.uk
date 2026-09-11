import { afterEach, describe, expect, it } from 'vitest';
import type { Request } from 'express';

import { checkoutOrigin, isStripePriceId, planForPrice, SODAFOM_PLAN_PRICE_IDS } from './checkout-security';

function requestWithHost(host: string): Request {
  return { get: (name: string) => name.toLowerCase() === 'host' ? host : undefined } as unknown as Request;
}

describe('checkout security', () => {
  const originalRailwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;

  afterEach(() => {
    if (originalRailwayDomain === undefined) delete process.env.RAILWAY_PUBLIC_DOMAIN;
    else process.env.RAILWAY_PUBLIC_DOMAIN = originalRailwayDomain;
    delete process.env.SODAFOM_PUBLIC_URL;
  });

  it('recognises only the configured subscription plan prices', () => {
    expect(planForPrice(SODAFOM_PLAN_PRICE_IDS.monthly)).toBe('monthly');
    expect(planForPrice('price_not_a_sodafom_plan')).toBeNull();
  });

  it('validates Stripe price identifier shape', () => {
    expect(isStripePriceId('price_12345678')).toBe(true);
    expect(isStripePriceId('prod_12345678')).toBe(false);
    expect(isStripePriceId(undefined)).toBe(false);
  });

  it('uses a same-site Sodafom host and ignores a hostile host', () => {
    expect(checkoutOrigin(requestWithHost('app.sodafom.uk'))).toBe('https://app.sodafom.uk');
    expect(checkoutOrigin(requestWithHost('evil.example'))).toBe('https://sodafom.uk');
  });

  it('allows only the configured Railway public host', () => {
    process.env.RAILWAY_PUBLIC_DOMAIN = 'sodafom-test.up.railway.app';
    expect(checkoutOrigin(requestWithHost('sodafom-test.up.railway.app'))).toBe('https://sodafom-test.up.railway.app');
    expect(checkoutOrigin(requestWithHost('other.up.railway.app'))).toBe('https://sodafom-test.up.railway.app');
  });
});
