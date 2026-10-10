// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  getSession: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock('@/server/db/client', () => ({ db: { execute: mocks.execute } }));
vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock('@/server/email', () => ({ sendEmail: mocks.sendEmail }));

import handler from './POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('weekly parent report email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      user: { id: 'parent-1', email: 'parent@example.test', name: 'Pat Parent' },
    });
    mocks.sendEmail.mockResolvedValue(undefined);
  });

  it('requires an authenticated parent session', async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = response();

    await handler({ headers: {} } as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it('emails totals across every subject from each owned child activity', async () => {
    mocks.execute
      .mockResolvedValueOnce([[
        { id: 7, name: 'Ava', total_stars: 42, avatar_emoji: '🦊' },
      ]])
      .mockResolvedValueOnce([[
        { top_subject: 'maths', games_played: 3, stars_this_week: 6 },
        { top_subject: 'reading', games_played: 2, stars_this_week: 3 },
      ]]);
    const res = response();

    await handler({ headers: {} } as Request, res);

    expect(mocks.execute).toHaveBeenCalledTimes(2);
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'parent@example.test',
      subject: expect.stringContaining('5 games, 9 stars'),
      html: expect.stringMatching(/Ava[\s\S]*5[\s\S]*⭐ 9[\s\S]*maths/),
    }));
    expect(res.json).toHaveBeenCalledWith({
      sent: true,
      childCount: 1,
      totalGamesThisWeek: 5,
      totalStarsThisWeek: 9,
    });
  });

  it('does not send a report when the signed-in parent has no children', async () => {
    mocks.execute.mockResolvedValueOnce([[]]);
    const res = response();

    await handler({ headers: {} } as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ sent: false, reason: 'No children found' });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});
