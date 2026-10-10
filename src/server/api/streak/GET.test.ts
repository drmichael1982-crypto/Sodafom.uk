// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({ execute: vi.fn(), getSession: vi.fn() }));
vi.mock('../../db/client.js', () => ({ db: { execute: mocks.execute } }));
vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));

import handler from './GET';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('streak summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: 'parent-1' } });
  });

  it('uses the owned child star balance and current streak record', async () => {
    mocks.execute
      .mockResolvedValueOnce([[{ id: '7', total_stars: 63 }]])
      .mockResolvedValueOnce([[{ current_streak: 4, max_streak: 9, last_played_date: '2026-10-10', freeze_active: 0, freeze_used_at: null }]]);
    const res = response();
    await handler({ headers: {}, query: { childId: '7' } } as unknown as Request, res);

    expect(mocks.execute).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      currentStreak: 4,
      maxStreak: 9,
      totalStars: 63,
      freezeCost: 50,
    }));
  });

  it('does not expose a streak for an unowned child', async () => {
    mocks.execute.mockResolvedValueOnce([[]]);
    const res = response();
    await handler({ headers: {}, query: { childId: '8' } } as unknown as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });
});
