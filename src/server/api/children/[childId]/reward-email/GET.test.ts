// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  getSession: vi.fn(),
  ensureRewardStorage: vi.fn(),
}));

vi.mock('../../../../db/client.js', () => ({ db: { execute: mocks.execute } }));
vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock('@/server/lib/reward-storage', () => ({
  ensureRewardStorage: mocks.ensureRewardStorage,
}));

import handler from './GET';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('reward email reads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: 'parent-1' } });
    mocks.ensureRewardStorage.mockResolvedValue(undefined);
  });

  it('returns the owned child reward email using parent_id', async () => {
    mocks.execute
      .mockResolvedValueOnce([[{ id: 7 }]])
      .mockResolvedValueOnce([[{ reward_email: 'parent@example.com' }]]);
    const res = response();
    await handler({ headers: {}, params: { childId: '7' } } as unknown as Request, res);

    expect(res.json).toHaveBeenCalledWith({ rewardEmail: 'parent@example.com' });
    const queries = mocks.execute.mock.calls.map(([query]) => JSON.stringify(query)).join('\n');
    expect(queries).toContain('parent_id');
    expect(queries).not.toContain('user_id');
  });

  it('stops before reward storage for another parent child', async () => {
    mocks.execute.mockResolvedValueOnce([[]]);
    const res = response();
    await handler({ headers: {}, params: { childId: '7' } } as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(mocks.ensureRewardStorage).not.toHaveBeenCalled();
  });
});
