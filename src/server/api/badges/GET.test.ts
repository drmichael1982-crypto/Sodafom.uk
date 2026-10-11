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

describe('parent badge progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: 'parent-1' } });
  });

  it('derives badges from current activity sessions for the owned child', async () => {
    mocks.execute
      .mockResolvedValueOnce([[{ id: 7, total_stars: '12' }]])
      .mockResolvedValueOnce([[
        { subject: 'maths', stars: '3', completed_at: '2026-10-11T09:00:00Z' },
        { subject: 'reading', stars: 2, completed_at: '2026-10-11T10:00:00Z' },
      ]])
      .mockResolvedValueOnce([[{ current_streak: '2', max_streak: '4' }]])
      .mockResolvedValueOnce([[{ cnt: '1' }]]);

    const res = response();
    await handler({ headers: {}, query: { childId: '7' } } as unknown as Request, res);

    expect(res.status).not.toHaveBeenCalled();
    const payload = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.stats).toEqual({
      gamesPlayed: 2,
      totalStars: 12,
      currentStreak: 2,
      maxStreak: 4,
      mathsGames: 1,
      readingGames: 1,
      spellingGames: 0,
      scienceGames: 0,
      perfectGames: 1,
      referrals: 1,
    });
    expect(payload.badges.find((badge: { id: string }) => badge.id === 'first_game').earned).toBe(true);
    expect(payload.badges.find((badge: { id: string }) => badge.id === 'stars_10').earned).toBe(true);
    expect(mocks.execute).toHaveBeenCalledTimes(4);
  });

  it('does not read progress for another parent child', async () => {
    mocks.execute.mockResolvedValueOnce([[]]);
    const res = response();

    await handler({ headers: {}, query: { childId: '7' } } as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Child not found' });
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });
});
