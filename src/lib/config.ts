/**
 * Application configuration
 */

function detectCapacitor() {
  if (typeof window === 'undefined') return false;

  const hasCapBridge = !!(window as any).Capacitor;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isAppHost = window.location.hostname === 'app.sodafom.uk';
  const isCapProtocol = window.location.protocol === 'capacitor:';
  const hasCapUA = navigator.userAgent.includes('Capacitor');

  const result = hasCapBridge || isLocalhost || isAppHost || isCapProtocol || hasCapUA;

  if (typeof window !== 'undefined') {
    const diag = {
      isCapacitor: result,
      origin: window.location.origin,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent
    };
    (window as any)._SODAFOM_DIAG = diag;
    if (result && !localStorage.getItem('sodafom_diag_shown')) {
      localStorage.setItem('sodafom_diag_shown', '1');
    }
  }

  return result;
}

export const isCapacitor = detectCapacitor();

// The production backend URL (Railway). Native builds use this by default.
export const PRODUCTION_URL = 'https://sodafomuk-production.up.railway.app';

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

/**
 * Browser sessions must use the same site that rendered the app. A cross-site
 * BetterAuth cookie is not reliably sent after refresh under modern browser
 * privacy rules, which was the root cause of the recurring sign-in loop.
 * Capacitor builds remain on the explicit Railway API because they have no
 * Sodafom web origin to share.
 */
function shouldUseSameOriginApi(): boolean {
  if (typeof window === 'undefined' || isCapacitor) return false;
  const host = window.location.hostname.toLowerCase();
  return import.meta.env.DEV || host === 'sodafom.uk' || host.endsWith('.sodafom.uk');
}

export const API_BASE_URL = shouldUseSameOriginApi()
  ? ''
  : (configuredApiUrl || PRODUCTION_URL).replace(/\/$/, '');

export const API_PREFIX = API_BASE_URL ? API_BASE_URL + '/api' : '/api';

if (typeof window !== 'undefined') {
  console.info('[Config] Sodafom API is using', API_BASE_URL ? 'the configured mobile backend' : 'the same site');
}

// Archie must use the real Sodafom API in production and phone builds.
export const ARCHIE_TEST_MODE = false;
