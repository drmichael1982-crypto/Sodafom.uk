/**
 * BetterAuth Client + Components
 *
 * BetterAuth handles session context internally via cookies and the useSession hook.
 * No explicit React context provider is needed - the authClient manages session state.
 */

import { createAuthClient } from 'better-auth/react';
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from "react-router";
import { SESSION_RECOVERY_URL, claimSessionRecovery, clearSessionRecovery } from './session-recovery';
import { API_BASE_URL, API_PREFIX } from '../config';

// Auth client - baseURL must be the full origin for BetterAuth's URL construction.
const _authClient = createAuthClient({
  baseURL: API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
});

// How long an unsettled session may stay pending before we treat it as a stuck
// stale-cookie state and attempt recovery. Generous enough to clear a slow but
// healthy first load; short enough that a blank preview self-heals quickly.
const SESSION_RECOVERY_PENDING_TIMEOUT_MS = 8000;

/**
 * Clear the stale HttpOnly session cookie server-side, then reload into a clean
 * unauthenticated state. One-shot per tab (see `claimSessionRecovery`) so an
 * unfixable session can't reload-loop.
 */
function recoverFromStaleSession(): void {
  if (typeof window === 'undefined') return;
  if (!claimSessionRecovery(window.sessionStorage)) return;

  const recoveryUrl = SESSION_RECOVERY_URL.startsWith('http')
    ? SESSION_RECOVERY_URL
    : `${API_PREFIX}${SESSION_RECOVERY_URL}`;

  void fetch(recoveryUrl, {
    cache: 'no-store',
    credentials: 'include'
  }).catch(() => undefined).finally(() => {
    // Logged so a future "preview keeps reloading" report is diagnosable —
    // more than one of these per tab points at a clear that isn't sticking.
    console.info(JSON.stringify({
      event: 'auth.session.recovery.reloading'
    }));
    window.location.reload();
  });
}

/**
 * Self-heal a stale-cookie session. A failed session lookup is a returned
 * `error`, not a thrown one, so no error boundary fires and the app would sit
 * blank. Recover on an explicit error, or when the session never settles within
 * the pending timeout. A healthy session resets the guard so a later genuine
 * failure can recover again in the same tab.
 */
function useStaleSessionRecovery(error: unknown, isPending: boolean, isAuthenticated: boolean): void {
  useEffect(function staleSessionRecovery() {
    if (typeof window === 'undefined') return;
    if (error) {
      recoverFromStaleSession();
      return;
    }
    if (isAuthenticated) {
      clearSessionRecovery(window.sessionStorage);
      return;
    }
    if (!isPending) return;
    const timer = setTimeout(recoverFromStaleSession, SESSION_RECOVERY_PENDING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [error, isPending, isAuthenticated]);
}
export const authClient = _authClient;
export const {
  signIn,
  signUp,
  signOut
} = _authClient;

/**
 * useSession — null-safe session hook.
 *
 * Returns `user` as a top-level nullable field and `isAuthenticated` as a
 * boolean so components naturally handle the unauthenticated state:
 *
 *   const { user, isAuthenticated, isPending } = useSession();
 *   if (isPending) return <Spinner />;
 *   return isAuthenticated ? <span>{user.name}</span> : <a href="/login">Sign In</a>;
 */
export function useSession() {
  const {
    data: session,
    isPending,
    error
  } = _authClient.useSession();

  // Log for debugging blank screen on Android
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      console.log('useSession state:', { isPending, hasSession: !!session, hasUser: !!session?.user, error });
    }
  }, [session, isPending, error]);

  const isAuthenticated = !isPending && !!session?.user;
  useStaleSessionRecovery(error, isPending, isAuthenticated);

  // MOCK SESSION FOR FREE ACCESS (1182 code)
  const hasFreeAccess = typeof window !== 'undefined' && localStorage.getItem('sodafom_free_access') === 'true';
  if (hasFreeAccess) {
    return {
      session: { user: { id: 'free-user', name: 'Archie Friend', email: '1182@sodafom.uk', isAdmin: true } } as any,
      user: { id: 'free-user', name: 'Archie Friend', email: '1182@sodafom.uk', isAdmin: true } as any,
      isPending: false,
      error: null,
      isAuthenticated: true
    };
  }

  return {
    session,
    user: session?.user ?? null,
    isPending,
    error,
    isAuthenticated
  };
}

// Alias for useSession (common naming convention)
export const useAuth = useSession;

/**
 * SessionProvider - Wrapper for compatibility with common auth patterns.
 *
 * BetterAuth manages session state internally through cookies and the useSession hook,
 * so no React context is needed. This component is provided for API compatibility
 * with apps that expect a provider wrapper pattern (e.g., migrating from NextAuth).
 *
 * You can safely wrap your app with this, but it's optional.
 */
export function SessionProvider({
  children
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

// Alias for SessionProvider (common naming convention in auth libraries)
export const AuthProvider = SessionProvider;

// Session timeout for loading state (30 seconds)
const SESSION_TIMEOUT_MS = 30000;

// ProtectedRoute component with timeout handling
export function ProtectedRoute({
  children,
  redirectTo = '/hub/login'
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const {
    isAuthenticated,
    isPending,
    session,
    error
  } = useSession();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isPending) return;
    console.log('ProtectedRoute: session pending...', { pathname: location.pathname });
    const timeout = setTimeout(() => {
      console.warn('ProtectedRoute: session check timed out');
      setTimedOut(true);
    }, SESSION_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isPending, location.pathname]);

  if (timedOut) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Session check timed out. Please try again.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Retry
        </button>
      </div>;
  }
  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{
      from: location
    }} replace />;
  }
  return <>{children}</>;
}

/**
 * LogoutButton - Button to sign out the user
 *
 * Handles the sign-out process and redirects to login page.
 * Can be customized with className prop.
 */
export function LogoutButton({
  className = '',
  children = 'Logout'
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  async function handleLogout() {
    setIsLoading(true);
    try {
      localStorage.removeItem('sodafom_free_access');
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  }
  return <button onClick={handleLogout} disabled={isLoading} className={className || 'px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50'}>
      {isLoading ? 'Logging out...' : children}
    </button>;
}
