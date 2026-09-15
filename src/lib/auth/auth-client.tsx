/** BetterAuth remains the only account session store. Device hints are never credentials. */
import { createAuthClient } from 'better-auth/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { API_PREFIX } from '../config';
import {
  type AccountIdentity, browserStorage, canUseAdminArea, canUseParentArea,
  clearClientAuthHints, completeSignOut, isChildAccount, isCurrentSession, requestSessionRecovery,
  resolveAuthBaseURL, restrictedAccountArea, safeSignupLocation, sessionExpiresAt,
} from './account-reliability';
import { clearSessionRecovery } from './session-recovery';

const _authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(API_PREFIX, typeof window === 'undefined' ? undefined : window.location.origin),
  fetchOptions: { credentials: 'include', timeout: 15_000 },
});

export const authClient = _authClient;
export const { signIn, signUp } = _authClient;

/** A returned BetterAuth error is not a successful logout. Never redirect past it. */
export async function signOut(...args: Parameters<typeof _authClient.signOut>) {
  return completeSignOut(() => _authClient.signOut(...args));
}

export function useSession() {
  const { data, isPending, error, refetch } = _authClient.useSession();
  const [, updateClock] = useState(0);
  const latestRefetch = useRef(refetch);
  latestRefetch.current = refetch;
  const expiresAt = sessionExpiresAt(data);

  useEffect(() => {
    if (!Number.isFinite(expiresAt)) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => {
      updateClock(value => value + 1);
      void Promise.resolve().then(() => latestRefetch.current()).catch(() => undefined);
    }, Math.min(remaining + 1, 2_147_000_000));
    return () => clearTimeout(timer);
  }, [expiresAt]);

  const isAuthenticated = isCurrentSession(data, error, isPending);
  useEffect(() => {
    if (!isAuthenticated) return;
    const storage = browserStorage('sessionStorage');
    if (storage) clearSessionRecovery(storage);
  }, [isAuthenticated]);

  type SessionUser = NonNullable<typeof data>['user'] & AccountIdentity;
  return {
    session: isAuthenticated ? data : null,
    user: isAuthenticated ? data!.user as SessionUser : null,
    isPending, error, isAuthenticated, refetch,
  };
}

export const useAuth = useSession;
export function SessionProvider({ children }: { children: ReactNode }) { return <>{children}</>; }
export const AuthProvider = SessionProvider;

function SessionProblem({ retry }: { retry: () => unknown }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('We could not check your session. Your saved learning has not been removed.');
  async function resetSession() {
    setBusy(true);
    try {
      await requestSessionRecovery(API_PREFIX);
      clearClientAuthHints();
      // Reload is unnecessary: invalidate BetterAuth's state, then use the active web/hash router.
      await Promise.resolve(retry());
      navigate('/hub/login', { replace: true });
    } catch {
      setMessage('The session reset could not be confirmed. Check your connection and try again.');
    } finally { setBusy(false); }
  }
  return <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
    <p role="alert" className="text-gray-600">{message}</p>
    <button disabled={busy} onClick={() => { void Promise.resolve().then(retry).catch(() => undefined); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Retry session check</button>
    <button disabled={busy} onClick={resetSession} className="px-4 py-2 border rounded-md">{busy ? 'Resetting session…' : 'Reset this session and sign in'}</button>
    <Link to="/hub/login">Go to sign in</Link><Link to="/">Back to learning</Link>
  </div>;
}

export function ProtectedRoute({ children, redirectTo = '/hub/login', requiredRole }: {
  children: ReactNode; redirectTo?: string; requiredRole?: 'parent' | 'admin';
}) {
  const { isAuthenticated, isPending, user, error, refetch } = useSession();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    setTimedOut(false);
    if (!isPending) return;
    const timer = setTimeout(() => setTimedOut(true), 30_000);
    return () => clearTimeout(timer);
  }, [isPending, location.pathname]);

  // A timeout is relevant only while pending. A later healthy result always recovers.
  if (error || (isPending && timedOut)) return <SessionProblem retry={refetch} />;
  if (isPending) return <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Checking your session">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>;
  if (!isAuthenticated) return <Navigate to={redirectTo} state={{ from: location }} replace />;

  const role = requiredRole ?? (restrictedAccountArea(location.pathname) === 'parent' ? 'parent' : undefined);
  if ((role === 'parent' && !canUseParentArea(user)) || (role === 'admin' && !canUseAdminArea(user))) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <p role="alert">This area is for an authorised adult account.</p>
      <Link to="/">Back to learning</Link><LogoutButton>Sign out to switch accounts</LogoutButton>
    </div>;
  }
  return <>{children}</>;
}

/** Parent pages have several aliases; guard the shared layout, not just menu links. */
export function AccountAccessBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  const signupLocation = safeSignupLocation(location.pathname, location.search);
  if (signupLocation) return <Navigate to={signupLocation} replace />;
  const area = restrictedAccountArea(location.pathname);
  if (area === 'parent') return <ProtectedRoute requiredRole="parent">{children}</ProtectedRoute>;
  if (area === 'admin' || area === 'teacher') return <ChildAccountBoundary>{children}</ChildAccountBoundary>;
  return <>{children}</>;
}

/** Retain the existing founder-code and separate teacher-login flows, but block child accounts. */
function ChildAccountBoundary({ children }: { children: ReactNode }) {
  const { user, isPending, error, refetch } = useSession();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    setTimedOut(false);
    if (!isPending) return;
    const timer = setTimeout(() => setTimedOut(true), 30_000);
    return () => clearTimeout(timer);
  }, [isPending]);
  if (error || (isPending && timedOut)) return <SessionProblem retry={refetch} />;
  if (isPending) return <p role="status">Checking account access…</p>;
  if (isChildAccount(user)) return <div role="alert">This area is for adults. <Link to="/">Back to learning</Link></div>;
  return <>{children}</>;
}

export function LogoutButton({ className = '', children = 'Logout' }: { className?: string; children?: ReactNode }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  async function handleLogout() {
    setIsLoading(true); setError('');
    try {
      await signOut();
      navigate('/hub/login', { replace: true });
    } catch { setError('Could not sign out. Check your connection and try again.'); }
    finally { setIsLoading(false); }
  }
  return <>
    <button onClick={handleLogout} disabled={isLoading} className={className || 'px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50'}>{isLoading ? 'Logging out...' : children}</button>
    {error && <p role="alert">{error}</p>}
  </>;
}
