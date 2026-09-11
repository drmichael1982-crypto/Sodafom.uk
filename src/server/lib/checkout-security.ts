import type { Request } from 'express';

export const SODAFOM_PLAN_PRICE_IDS = Object.freeze({
  monthly: 'price_1U5bazK4qwt1chs3b6cnitbe',
  annual: 'price_1U5bb5K4qwt1chs3WvIrzKfS',
  school: 'price_1U67njK4qwt1chs37hn3EUeh',
});

export type SodafomPlan = keyof typeof SODAFOM_PLAN_PRICE_IDS;

export function planForPrice(priceId: string): SodafomPlan | null {
  const entry = Object.entries(SODAFOM_PLAN_PRICE_IDS).find(([, configuredPriceId]) => configuredPriceId === priceId);
  return entry ? entry[0] as SodafomPlan : null;
}

export function isStripePriceId(value: unknown): value is string {
  return typeof value === 'string' && /^price_[A-Za-z0-9]{8,}$/.test(value);
}

function normaliseConfiguredOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const candidate = value.includes('://') ? value : `https://${value}`;
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Checkout return URLs must come from server-owned host configuration, never
 * from request JSON or the browser-controlled Origin header.
 */
export function checkoutOrigin(req: Request): string {
  const configured = normaliseConfiguredOrigin(process.env.SODAFOM_PUBLIC_URL)
    ?? normaliseConfiguredOrigin(process.env.RAILWAY_PUBLIC_DOMAIN)
    ?? normaliseConfiguredOrigin(process.env.RAILWAY_STATIC_URL);
  const host = req.get('host')?.toLowerCase();

  if (host) {
    const hostname = host.replace(/:\d+$/, '');
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isSodafom = hostname === 'sodafom.uk' || hostname.endsWith('.sodafom.uk');
    const configuredHost = configured ? new URL(configured).host.toLowerCase() : null;
    if (isLocal || isSodafom || host === configuredHost) {
      return `${isLocal ? 'http' : 'https'}://${host}`;
    }
  }

  return configured ?? 'https://sodafom.uk';
}
