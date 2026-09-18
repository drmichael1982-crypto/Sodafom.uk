import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '@/lib/auth/auth-client';
import { canAccessPrivate797 } from '@/lib/admin797/access-policy';

/** Adult/admin-only boundary. Never reuse this component in child-facing UI. */
export function Admin797Gate({ children }: { children: ReactNode }) {
  const { user, isPending, isAuthenticated } = useSession();
  const location = useLocation();

  if (isPending) {
    return <main className="min-h-screen grid place-items-center" aria-busy="true">Checking private access…</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/hub/login" state={{ from: location }} replace />;
  }

  if (!canAccessPrivate797(user as { isAdmin?: boolean; role?: string } | null)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
