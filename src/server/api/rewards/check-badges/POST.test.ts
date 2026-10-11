// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  getSession: vi.fn(),
  ensureRewardStorage: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock('../../../db/client.js', () => ({ db: { execute: mocks.execute } }));
vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock('@/server/lib/reward-storage', () => ({
  ensureRewardStorage: mocks.ensureRewardStorage,
}));
vi.mock('@/server/email', () => ({ sendEmail: mocks.sendEmail }));

import handler from './POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

function executedSql(): string {
  return mocks.execute.mock.calls.map(([query]) => JSON.stringify(query)).join('\n');
}

describe('post-game badge checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: 'parent-1' } });
    mocks.ensureRewardStorage.mockResolvedValue(undefined);
    mocks.execute.mockResolvedValue([[]]);
  });

  it('rejects an invalid child ID without reading the database', async () => {
    const res = response();
    await handler({ headers: {}, body: { childId: '7x' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.ensureRewardStorage).not.toHaveBeenCalled();
  });

  it('stops after the ownership query for another parent child', async () => {
    mocks.execute.mockResolvedValueOnce([[]]);
    const res = response();
    await handler({ headers: {}, body: { childId: 7 } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(executedSql()).toContain('parent_id');
    expect(executedSql()).not.toContain('user_id');
    expect(mocks.ensureRewardStorage).not.toHaveBeenCalled();
  });

  it('uses current activity sessions and all-time earned stars', async () => {
    mocks.execute
      .mockResolvedValueOnce([[{ id: 7, name: 'Mia', total_stars: 2 }]])
      .mockResolvedValueOnce([[{ reward_email: null }]])
      .mockResolvedValueOnce([[
        { subject: 'maths', stars: '3' },
        { subject: 'reading', stars: 3 },
        { subject: 'spelling', stars: 2 },
        { subject: 'science', stars: 2 },
      ]])
      .mockResolvedValueOnce([[{ current_streak: 0, max_streak: 0 }]])
      .mockResolvedValueOnce([[{ cnt: 0 }]])
      .mockResolvedValueOnce([[]]);

    const res = response();
    await handler({ headers: {}, body: { childId: 7 } } as Request, res);

    const payload = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.newBadges.map((badge: { id: string }) => badge.id)).toEqual([
      'first_game',
      'stars_10',
    ]);
    const queries = executedSql();
    expect(queries).toContain('activity_sessions');
    expect(queries).toContain('stars_earned');
    expect(queries).not.toContain('child_progress');
    expect(mocks.ensureRewardStorage).toHaveBeenCalledTimes(1);
  });

  it('does not expose database error details', async () => {
    mocks.execute.mockRejectedValueOnce(new Error('secret database host'));
    const res = response();
    await handler({ headers: {}, body: { childId: 7 } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to check badges' });
  });
});
