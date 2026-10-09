import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ data: null as null | { user: { id: string; isAdmin: boolean } }, isPending: false, error: null }));
vi.mock('better-auth/react', () => ({ createAuthClient: () => ({ useSession: () => state, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }) }));
vi.mock('../config', () => ({ API_BASE_URL: '', API_PREFIX: '/api', ARCHIE_PREVIEW: false }));
import { useSession } from './auth-client';
beforeEach(() => { localStorage.clear(); state.data = null; });
afterEach(cleanup);
describe('real account session', () => {
  it('never turns a browser free-access flag into an authenticated admin', () => {
    localStorage.setItem('sodafom_free_access', 'true');
    const { result } = renderHook(useSession);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });
  it('uses the server account unchanged despite an old free-access flag', () => {
    localStorage.setItem('sodafom_free_access', 'true');
    state.data = { user: { id: 'real-parent', isAdmin: false } };
    const { result } = renderHook(useSession);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: 'real-parent', isAdmin: false });
  });
});
