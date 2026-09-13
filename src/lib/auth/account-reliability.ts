/** Account/session policy only. Never use browser hints as server authorisation. */
export interface AccountIdentity {
  id?: string;
  role?: string | null;
  isAdmin?: boolean;
}

export interface AccountSession {
  user?: AccountIdentity | null;
  session?: { expiresAt?: string | Date | null } | null;
}

export function isChildAccount(user: AccountIdentity | null | undefined): boolean {
  return typeof user?.role === 'string' && ['child', 'student', 'pupil'].includes(user.role.trim().toLowerCase());
}

export function canUseParentArea(user: AccountIdentity | null | undefined): boolean {
  return !!user && !isChildAccount(user) && (user.role === 'parent' || user.isAdmin === true);
}

export function canUseAdminArea(user: AccountIdentity | null | undefined): boolean {
  return !!user && !isChildAccount(user) && user.isAdmin === true;
}

export function sessionExpiresAt(data: AccountSession | null | undefined): number {
  const expiry = data?.session?.expiresAt;
  if (!(typeof expiry === 'string' || expiry instanceof Date)) return NaN;
  return new Date(expiry).getTime();
}

export function isCurrentSession(
  data: AccountSession | null | undefined,
  error: unknown,
  isPending: boolean,
  now = Date.now(),
): boolean {
  return !error && !isPending && !!data?.user?.id && sessionExpiresAt(data) > now;
}

/** Match the API origin already selected by config, rather than forcing Railway. */
export function resolveAuthBaseURL(apiPrefix: string, browserOrigin?: string): string | undefined {
  const prefix = apiPrefix.replace(/\/+$/, '');
  if (prefix === '/api') return browserOrigin || undefined;
  try {
    const url = new URL(prefix);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return undefined;
    return `${url.origin}${url.pathname.replace(/\/api$/, '').replace(/\/$/, '')}`;
  } catch {
    return browserOrigin || undefined;
  }
}

export function getSessionRecoveryURL(apiPrefix: string): string {
  return `${apiPrefix.replace(/\/+$/, '')}/auth/get-session?clearCookies=1`;
}

const PUBLIC_AUTH_PATHS = new Set([
  '/login', '/signup', '/forgot-password', '/reset-password',
  '/hub/login', '/hub/signup', '/hub/forgot-password', '/hub/reset-password',
  '/teacher-hub/login',
]);

function normalizedPath(raw: string): string | null {
  if (!raw.startsWith('/') || raw.startsWith('//') || /[\\\s\u0000-\u001f\u007f]/.test(raw)) return null;
  try {
    const url = new URL(raw, 'https://sodafom.invalid');
    if (url.origin !== 'https://sodafom.invalid') return null;
    // Query values may legitimately contain encoded paths; only classify the pathname.
    if (/%(?:2f|5c|00|0[ad])/i.test(url.pathname)) return null;
    const decoded = decodeURIComponent(url.pathname);
    if (/[\\\s\u0000-\u001f\u007f]/.test(decoded) || /%/.test(decoded)) return null;
    return decoded.replace(/\/+$/, '').toLowerCase() || '/';
  } catch {
    return null;
  }
}

export function restrictedAccountArea(raw: string): 'parent' | 'teacher' | 'admin' | null {
  const path = normalizedPath(raw);
  if (!path || PUBLIC_AUTH_PATHS.has(path)) return null;
  const under = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
  if (under('/admin') || under('/admin-panel')) return 'admin';
  if (under('/teacher-hub')) return 'teacher';
  if (under('/hub') || under('/parent-dashboard') || under('/parent-area') || under('/pocket-money/setup')) return 'parent';
  return null;
}

export function accountLandingPath(user: AccountIdentity | null | undefined): string {
  if (isChildAccount(user)) return '/';
  if (canUseAdminArea(user)) return '/admin-panel';
  if (user?.role === 'teacher') return '/teacher-hub';
  return canUseParentArea(user) ? '/hub' : '/';
}

/** Keep query/hash on legitimate return paths; reject auth loops and wrong-role destinations. */
export function postLoginPath(raw: unknown, user: AccountIdentity | null | undefined): string {
  const fallback = accountLandingPath(user);
  if (typeof raw !== 'string') return fallback;
  const path = normalizedPath(raw);
  if (!path || PUBLIC_AUTH_PATHS.has(path) || (path === '/api' || path.startsWith('/api/'))) return fallback;
  const area = restrictedAccountArea(raw);
  if (area === 'parent' && !canUseParentArea(user)) return fallback;
  if (area === 'admin' && !canUseAdminArea(user)) return fallback;
  if (area === 'teacher' && user?.role !== 'teacher') return fallback;
  const url = new URL(raw, 'https://sodafom.invalid');
  return `${url.pathname}${url.search}${url.hash}`;
}

export function browserStorage(kind: 'localStorage' | 'sessionStorage'): Storage | undefined {
  try { return typeof window === 'undefined' ? undefined : window[kind]; }
  catch { return undefined; }
}

export function readLoginEmail(): string {
  try { return browserStorage('localStorage')?.getItem('sodafom_remembered_login_email') || ''; }
  catch { return ''; }
}

export function rememberLoginEmail(email: string, remember: boolean): void {
  try {
    const storage = browserStorage('localStorage');
    if (remember) storage?.setItem('sodafom_remembered_login_email', email.trim().toLowerCase());
    else storage?.removeItem('sodafom_remembered_login_email');
  } catch { /* An optional device preference must never turn a successful login into a failure. */ }
}

export function clearClientAuthHints(): void {
  const storage = browserStorage('localStorage');
  for (const key of ['sodafom_free_access', 'sodafom_teacher_token', 'sodafom_teacher_profile']) {
    try { storage?.removeItem(key); } catch { /* Best effort; never delete learning/progress data. */ }
  }
  try { browserStorage('sessionStorage')?.removeItem('better-auth.session-recovery-attempted'); } catch { /* optional */ }
}

/** Native fetch resolves for HTTP errors: validate status AND the expected response body. */
export async function requestSessionRecovery(apiPrefix: string, fetcher: typeof fetch = fetch): Promise<void> {
  await authJsonRequest(getSessionRecoveryURL(apiPrefix), { method: 'GET' }, 'cleared', fetcher);
}

/** No automatic retries: a timed-out account mutation may already have completed. */
export async function authJsonRequest(
  url: string, init: RequestInit, successKey: 'ok' | 'cleared', fetcher: typeof fetch = fetch,
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetcher(url, {
      ...init, credentials: 'include', cache: 'no-store', signal: controller.signal,
    });
    if (!response.ok) throw new Error('Account request is unavailable. Please try again.');
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || (data as Record<string, unknown>)[successKey] !== true) {
      throw new Error('Account request was not confirmed. Please try again.');
    }
  } finally { clearTimeout(timer); }
}

export function validResetLink(token: string | null, error: string | null): boolean {
  return typeof token === 'string' && token.trim().length > 0 && token.length <= 512 && !error;
}

/** Production reset links cannot be redirected by an attacker-controlled Host header. */
export function passwordResetCallback(development: boolean, origin?: string): string {
  if (development && origin) {
    try {
      const url = new URL(origin);
      if (['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
          && !url.username && !url.password) return `${url.origin}/hub/reset-password`;
    } catch { /* Fall through to the fixed first-party callback. */ }
  }
  return 'https://sodafom.uk/hub/reset-password';
}


/** BetterAuth reports some failures as values rather than rejected promises. */
export async function completeSignOut<T extends { error?: unknown }>(operation: () => Promise<T>): Promise<T> {
  const result = await operation();
  if (result.error) throw new Error('Could not sign out. Check your connection and try again.');
  clearClientAuthHints();
  return result;
}

/** Validate signup redirects without changing the existing mixed signup/payment form. */
export function safeSignupLocation(pathname: string, search: string): string | null {
  if (!['/signup', '/hub/signup'].includes(normalizedPath(pathname) || '')) return null;
  const params = new URLSearchParams(search);
  const raw = params.get('redirect');
  if (!raw) return null;
  // Public signup creates parent accounts; the server prevents role input.
  const safe = postLoginPath(raw, { role: 'parent' });
  if (raw === safe) return null;
  params.set('redirect', safe);
  return `${pathname}?${params.toString()}`;
}
