/** Server-only origin policy. Never infer trust from a request's Host header. */
type Environment = Record<string, string | undefined>;
const SITE_ORIGINS = [
  'https://sodafom.uk',
  'https://www.sodafom.uk',
  'https://app.sodafom.uk',
];
// Exact origins used by the existing packaged Capacitor app. No arbitrary ports.
const NATIVE_ORIGINS = ['http://localhost', 'https://localhost', 'capacitor://localhost'];

function webOrigin(value: string): string | null {
  if (!value || value.length > 2048 || /[\s*\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        url.search || url.hash || url.pathname !== '/') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function trustedOrigins(requestOrigin?: unknown, env: Environment = process.env): string[] {
  const origins = new Set([...SITE_ORIGINS, ...NATIVE_ORIGINS]);
  // Configure individual preview/custom HTTPS origins, never wildcard tenants.
  for (const value of (env.SODAFOM_TRUSTED_ORIGINS || '').split(',')) {
    const origin = webOrigin(value.trim());
    if (origin && (origin.startsWith('https://') || env.NODE_ENV === 'development')) origins.add(origin);
  }
  if (env.NODE_ENV === 'development' && typeof requestOrigin === 'string') {
    const origin = webOrigin(requestOrigin);
    if (origin === requestOrigin && origin !== null) {
      const host = new URL(origin).hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') origins.add(origin);
    }
  }
  return [...origins];
}

export function isTrustedOrigin(origin: unknown, env: Environment = process.env): origin is string {
  return typeof origin === 'string' && trustedOrigins(origin, env).includes(origin);
}
