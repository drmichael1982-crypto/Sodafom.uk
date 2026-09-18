/**
 * Adult/private 797 authorization boundary.
 *
 * This policy is intentionally separate from child, parent and teacher access.
 * UI checks improve navigation, but every future 797 API must call the same
 * policy server-side before returning private data.
 */
export const PRIVATE_797_ROLE = 'kano797-admin' as const;

export type Admin797Principal = {
  isAdmin?: boolean | null;
  role?: string | null;
};

export function canAccessPrivate797(principal: Admin797Principal | null | undefined): boolean {
  return principal?.isAdmin === true && principal.role === PRIVATE_797_ROLE;
}

export function isPrivate797Path(pathname: string): boolean {
  return pathname === '/admin/797' || pathname.startsWith('/admin/797/');
}

export const FORBIDDEN_797_ROLES = ['child', 'parent', 'teacher'] as const;
