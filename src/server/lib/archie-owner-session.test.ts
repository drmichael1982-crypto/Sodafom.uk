// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { requireArchieOwnerSession } from './archie-owner-session';

function response() {
  const res = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

describe('shared owner session boundary', () => {
  it('rejects anonymous, ordinary and differently configured admin accounts', async () => {
    const req = {} as any;
    const anonymous = response();
    expect(await requireArchieOwnerSession(req, anonymous, async () => null, { ARCHIE_OWNER_USER_ID: 'owner' })).toBeNull();
    expect(anonymous.status).toHaveBeenCalledWith(401);

    for (const user of [{ id: 'parent', isAdmin: false }, { id: 'different-admin', isAdmin: true }, { id: 'owner', isAdmin: true }]) {
      const res = response();
      const env = user.id === 'owner' ? {} : { ARCHIE_OWNER_USER_ID: 'owner' };
      expect(await requireArchieOwnerSession(req, res, async () => ({ user }), env)).toBeNull();
      expect(res.status).toHaveBeenCalledWith(403);
    }
  });

  it('allows only the signed-in server-configured owner and disables caching', async () => {
    const req = {} as any; const res = response();
    const session = { user: { id: 'owner', isAdmin: true } };
    expect(await requireArchieOwnerSession(req, res, async () => session, { ARCHIE_OWNER_USER_ID: ' owner ' })).toBe(session);
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.status).not.toHaveBeenCalled();
  });
});
