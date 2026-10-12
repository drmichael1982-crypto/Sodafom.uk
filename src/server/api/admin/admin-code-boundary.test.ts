// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const session = vi.hoisted(() => vi.fn());
vi.mock('@/server/lib/archie-parent-auth', () => ({ getPreviewParentSession: session }));

import codeHandler from './code/GET';
import statsHandler from './stats/GET';
import verifyHandler from './verify/POST';

function response() {
  const res = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

describe('legacy admin code endpoints', () => {
  beforeEach(() => { session.mockReset().mockResolvedValue(null); process.env.ARCHIE_OWNER_USER_ID = 'owner'; });

  it.each([
    ['public preview PIN', verifyHandler, { headers: {}, body: { code: '1182' } }],
    ['public preview header', statsHandler, { headers: { 'x-admin-code': '1182' } }],
    ['former fallback master header', codeHandler, { headers: { 'x-admin-code': '040718' } }],
  ])('does not grant server authority to the %s', async (_label, handler, request) => {
    const res = response();
    await handler(request as any, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sign in to the owner account.' });
  });

  it('accepts the configured signed-in owner without reading a code', async () => {
    session.mockResolvedValue({ user: { id: 'owner', isAdmin: true } });
    const res = response();
    await verifyHandler({ headers: {}, body: {} } as any, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});
