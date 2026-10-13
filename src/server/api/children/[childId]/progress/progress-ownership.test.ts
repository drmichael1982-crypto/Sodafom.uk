// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  select: vi.fn(),
  execute: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.session } }),
}));
vi.mock('../../../../db/client.js', () => ({
  db: { select: mocks.select, execute: mocks.execute, insert: mocks.insert, update: mocks.update },
}));

import getProgress from './GET';
import postProgress, { progressPercentage } from './POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

function childLookup(result: unknown[]) {
  const limit = vi.fn().mockResolvedValue(result);
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  mocks.select.mockReturnValue({ from });
}

describe('child progress ownership boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue({ user: { id: 'parent-a' } });
    childLookup([]);
  });

  it.each([getProgress, postProgress])('rejects malformed child IDs before querying', async handler => {
    const res = response();
    await handler({ headers: {}, params: { childId: '7-other' }, body: {} } as any, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it.each([getProgress, postProgress])('does not expose or mutate another parent\'s child', async handler => {
    const res = response();
    await handler({ headers: {}, params: { childId: '7' }, body: {
      subject: 'reading', activityId: 'reading-bingo', activityTitle: 'Reading Bingo',
    } } as any, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Child not found' });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects non-numeric progress before writing parent-visible records', async () => {
    childLookup([{ id: 7 }]);
    const res = response();
    await postProgress({ headers: {}, params: { childId: '7' }, body: {
      subject: 'maths', activityId: 'number-bonds', activityTitle: 'Number Bonds',
      score: '10', maxScore: 10, durationSeconds: 30,
    } } as any, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid score or duration' });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('returns the parent hub summary after confirming child ownership', async () => {
    childLookup([{ id: 7, totalStars: 42 }]);
    mocks.execute
      .mockResolvedValueOnce([[
        { subject: 'maths', games_played: '3' },
        { subject: 'reading', games_played: 2 },
      ]])
      .mockResolvedValueOnce([[{ current_streak: '4' }]])
      .mockResolvedValueOnce([[{ badge_count: '6' }]]);

    const res = response();
    await getProgress({
      headers: {},
      params: { childId: '7' },
      query: { summary: '1' },
    } as any, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      totalStars: 42,
      streakDays: 4,
      gamesThisWeek: 5,
      badgeCount: 6,
      topSubject: 'maths',
    });
    expect(mocks.execute).toHaveBeenCalledTimes(3);
  });

  it('does not query summary records for another parent child', async () => {
    const res = response();
    await getProgress({
      headers: {},
      params: { childId: '7' },
      query: { summary: '1' },
    } as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('returns a complete 30-day window and a separate all-time play count', async () => {
    const recent = [{ id: 20, activityTitle: 'Latest game' }];
    const activity30 = [
      { id: 20, activityTitle: 'Latest game' },
      { id: 19, activityTitle: 'Earlier game' },
    ];
    const summaries = [{ id: 3, subject: 'maths' }];

    mocks.select
      .mockReturnValueOnce({ from: () => ({ where: () => ({ limit: () => Promise.resolve([{ totalStars: 77 }]) }) }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: () => ({ limit: () => Promise.resolve(recent) }) }) }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: () => Promise.resolve(activity30) }) }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: () => ({ limit: () => Promise.resolve(summaries) }) }) }) })
      .mockReturnValueOnce({ from: () => ({ where: () => Promise.resolve([{ totalPlays: '142' }]) }) });

    const res = response();
    await getProgress({
      headers: {},
      params: { childId: '7' },
      query: {},
    } as any, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      recent,
      activity30,
      summaries,
      totalStars: 77,
      totalPlays: 142,
    });
  });
});

describe('parent progress score normalisation', () => {
  it.each([
    [8, 10, 80],
    [10, 10, 100],
    [150, 100, 100],
    [0, 10, 0],
    [5, 0, 0],
  ])('stores %s out of %s as %s percent', (score, maxScore, expected) => {
    expect(progressPercentage(score, maxScore)).toBe(expected);
  });

  it('does not allow malformed scores to poison a parent report', () => {
    expect(progressPercentage(Number.NaN, 10)).toBe(0);
    expect(progressPercentage(5, Number.POSITIVE_INFINITY)).toBe(0);
    expect(progressPercentage(-5, 10)).toBe(0);
  });
});
