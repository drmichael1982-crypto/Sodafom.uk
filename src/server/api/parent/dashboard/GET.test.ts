// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({ execute: vi.fn(), getSession: vi.fn() }));
vi.mock('@/server/db/client', () => ({ db: { execute: mocks.execute } }));
vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));

import handler from './GET';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('parent dashboard progress source', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: 'parent-1' } });
  });

  it('returns current activity-session progress for the signed-in parent child', async () => {
    mocks.execute
      .mockResolvedValueOnce([[{ id: 7, name: 'Ava', age_group: '8-10', total_stars: 42 }]])
      .mockResolvedValueOnce([[{ subject: 'maths', games_played: 2, stars: 5 }]])
      .mockResolvedValueOnce([[{ total: 2 }]])
      .mockResolvedValueOnce([[{ day: '2026-10-10', stars: 5 }]])
      .mockResolvedValueOnce([[{ game_slug: 'sudoku', subject: 'maths', stars_earned: 3, score_pct: 100, played_at: '2026-10-10' }]])
      .mockResolvedValueOnce([[{ total: 1 }]]);

    const req = { headers: {}, query: { childId: '7' } } as unknown as Request;
    const res = response();
    await handler(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      child: { id: 7, name: 'Ava', age_group: '8-10', total_stars: 42 },
      totalGames: 2,
      badgeCount: 1,
      subjects: [{ subject: 'maths', games_played: 2, stars: 5 }],
      daily: [{ day: '2026-10-10', stars: 5 }],
      recent: [{ game_slug: 'sudoku', subject: 'maths', stars_earned: 3, score_pct: 100, played_at: '2026-10-10' }],
    });
  });

  it('does not disclose another parent child', async () => {
    mocks.execute.mockResolvedValueOnce([[]]);
    const res = response();
    await handler({ headers: {}, query: { childId: '9' } } as unknown as Request, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });
});
