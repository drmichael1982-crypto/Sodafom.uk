// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.session } }),
}));
vi.mock('../../../../db/client.js', () => ({
  db: { select: mocks.select, insert: mocks.insert, update: mocks.update },
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
