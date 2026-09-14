import { SESSION_RECOVERY_URL } from './session-recovery';

/** Keep Better Auth on the same origin as ordinary browser API requests. */
export function resolveAuthBaseURL(apiPrefix: string, apiBaseURL: string, pageOrigin?: string): string {
  if (apiPrefix === '/api' && pageOrigin && /^https?:\/\//.test(pageOrigin)) {
    return pageOrigin.replace(/\/+$/, '');
  }
  // Native/local builds retain their explicitly configured remote backend.
  return apiBaseURL.replace(/\/+$/, '');
}

/** API_PREFIX already contains /api; do not prepend it to /api a second time. */
export function resolveSessionRecoveryURL(apiPrefix: string): string {
  return `${apiPrefix.replace(/\/+$/, '')}${SESSION_RECOVERY_URL.slice('/api'.length)}`;
}
