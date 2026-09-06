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
       // alert('Sodafom Mobile Detected!\n' + JSON.stringify(diag, null, 2));
       localStorage.setItem('sodafom_diag_shown', '1');
    }
  }

  return result;
}

export const isCapacitor = detectCapacitor();

// The production backend URL (Railway)
export const PRODUCTION_URL = 'https://sodafomuk-production.up.railway.app';

// Phone builds use the hosted backend by default, or VITE_API_BASE_URL when specified for local testing.
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || PRODUCTION_URL).replace(/\/$/, '');

export const API_PREFIX = `${API_BASE_URL}/api`;

if (typeof window !== 'undefined') {
  console.info('[Config] Sodafom API_PREFIX configured as:', API_PREFIX);
}

// Archie must use the real Sodafom API in production and phone builds.
export const ARCHIE_TEST_MODE = false;
