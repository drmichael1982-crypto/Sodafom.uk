// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  getSession: vi.fn(),
  ensureRewardStorage: vi.fn(),
}));

vi.mock('../../../db/client.js', () => ({ db: { execute: mocks.execute } }));
vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock('@/server/lib/reward-storage', () => ({
  ensureRewardStorage: mocks.ensureRewardStorage,
}));

import handler from './POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('reward email updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: 'parent-1' } });
    mocks.ensureRewardStorage.mockResolvedValue(undefined);
  });

  it('checks parent ownership before updating the email', async () => {
    mocks.execute.mockResolvedValueOnce([[{ id: 7 }]]).mockResolvedValueOnce([[]]);
    const res = response();
    await handler({ headers: {}, body: { childId: 7, email: 'parent@example.com' } } as Request, res);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    const queries = mocks.execute.mock.calls.map(([query]) => JSON.stringify(query)).join('\n');
    expect(queries).toContain('parent_id');
    expect(queries).not.toContain('user_id');
    expect(queries).toContain('UPDATE children SET reward_email');
  });

  it('does no reward storage work for another parent child', async () => {
    mocks.execute.mockResolvedValueOnce([[]]);
    const res = response();
    await handler({ headers: {}, body: { childId: 7, email: 'parent@example.com' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(mocks.ensureRewardStorage).not.toHaveBeenCalled();
  });
});
