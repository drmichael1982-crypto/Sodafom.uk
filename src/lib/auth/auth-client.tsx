/**
 * BetterAuth Client + Components
 *
 * BetterAuth handles session context internally via cookies and the useSession hook.
 * No explicit React context provider is needed - the authClient manages session state.
 */

import { createAuthClient } from 'better-auth/react';
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from "react-router";
import { resolveAuthBaseURL } from './endpoint-config';
import { clearLegacyFreeAccess } from './logout-cleanup';
import { API_BASE_URL, API_PREFIX } from '../config';

// Auth client - baseURL must be the full origin for BetterAuth's URL construction.
const _authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(API_PREFIX, API_BASE_URL, typeof window !== 'undefined' ? window.location.origin : undefined)
});

export const { signIn, signUp } = _authClient;

/** Better Auth returns failures as values; callers must not navigate on failure. */
export async function signOut(...args: Parameters<typeof _authClient.signOut>) {
  const result = await _authClient.signOut(...args);
  if (result.error) throw new Error('Sign out failed. Please try again.');
  return result;
}
// Better Auth exposes its methods dynamically; preserve its proxy behavior.
export const authClient = new Proxy(_authClient, {
  get(target, property, receiver) {
    return property === 'signOut' ? signOut : Reflect.get(target, property, receiver);
  },
});

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

  const isAuthenticated = !isPending && !!session?.user;
  type SodafomSessionUser = NonNullable<typeof session>['user'] & { isAdmin?: boolean };

  return {
    session,
    user: (session?.user as SodafomSessionUser | undefined) ?? null,
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
    error
  } = useSession();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isPending) { setTimedOut(false); return; }
    const timeout = setTimeout(() => {
      console.warn('ProtectedRoute: session check timed out');
      setTimedOut(true);
    }, SESSION_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isPending, location.pathname]);

  if (timedOut || error) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">We could not check your session. Please try again.</p>
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
  const [logoutError, setLogoutError] = useState('');
  async function handleLogout() {
    setIsLoading(true);
    setLogoutError('');
    try {
      clearLegacyFreeAccess(typeof window !== 'undefined' ? window : undefined);
      await signOut();
      window.location.href = '/login';
    } catch {
      setLogoutError('Sign out failed. Please try again.');
      setIsLoading(false);
    }
  }
  return <><button onClick={handleLogout} disabled={isLoading} className={className || 'px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50'}>
      {isLoading ? 'Logging out...' : children}
    </button>{logoutError && <p role="alert">{logoutError}</p>}</>;
}
