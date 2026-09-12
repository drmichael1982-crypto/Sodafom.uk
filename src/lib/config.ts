/** Web previews use their own server, never production by accident. */
export const PRODUCTION_URL = 'https://sodafomuk-production-3f3a.up.railway.app';
export const isCapacitor = typeof window !== 'undefined' && (
  !!(window as any).Capacitor?.isNativePlatform?.() || window.location.protocol === 'capacitor:'
);
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || (isCapacitor ? PRODUCTION_URL : '')).replace(/\/$/, '');
export const API_PREFIX = `${API_BASE_URL}/api`;
export const ARCHIE_TEST_MODE = false;
