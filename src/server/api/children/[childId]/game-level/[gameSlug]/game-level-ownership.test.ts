// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  values: vi.fn(),
  set: vi.fn(),
  updateWhere: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.session } }),
}));
vi.mock('../../../../../db/client.js', () => ({
  db: { select: mocks.select, insert: mocks.insert, update: mocks.update },
}));

import getGameLevel from './GET';
import postGameLevel from './POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

function database(ownedChildren: unknown[] = [], gameRows: unknown[] = []) {
  const ownedLimit = vi.fn().mockResolvedValue(ownedChildren);
  const ownedWhere = vi.fn(() => ({ limit: ownedLimit }));
  const gameWhere = vi.fn().mockResolvedValue(gameRows);
  mocks.select.mockImplementation((selection?: unknown) => ({
    from: vi.fn(() => ({ where: selection ? ownedWhere : gameWhere })),
  }));
  mocks.values.mockResolvedValue(undefined);
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.updateWhere.mockResolvedValue(undefined);
  mocks.set.mockReturnValue({ where: mocks.updateWhere });
  mocks.update.mockReturnValue({ set: mocks.set });
}

function request(method: 'GET' | 'POST', childId = '7', stars: unknown = 2) {
  return {
    headers: {},
    params: { childId, gameSlug: 'number-pop' },
    body: method === 'POST' ? { stars } : {},
  } as any;
}

describe('adaptive game-level ownership boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue({ user: { id: 'parent-a' } });
    database();
  });

  it.each([
    ['GET', getGameLevel],
    ['POST', postGameLevel],
  ] as const)('%s requires a signed-in parent', async (method, handler) => {
    mocks.session.mockResolvedValue(null);
    const res = response();
    await handler(request(method), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it.each([
    ['GET', getGameLevel],
    ['POST', postGameLevel],
  ] as const)('%s rejects malformed child IDs before querying', async (method, handler) => {
    const res = response();
    await handler(request(method, '7-other'), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it.each([
    ['GET', getGameLevel],
    ['POST', postGameLevel],
  ] as const)('%s does not expose or mutate another parent\'s child', async (method, handler) => {
    const res = response();
    await handler(request(method), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Child not found' });
    expect(mocks.select).toHaveBeenCalledTimes(1);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([-1, 4, 1.5, '3', Number.NaN])('POST rejects invalid stars %s before querying', async stars => {
    const res = response();
    await postGameLevel(request('POST', '7', stars), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Stars must be an integer from 0 to 3' });
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it('GET returns adaptive progress only after confirming ownership', async () => {
    database([{ id: 7 }], [{ level: 4, bestStars: 2, playsAtLevel: 1 }]);
    const res = response();
    await getGameLevel(request('GET'), res);
    expect(mocks.select).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({ level: 4, bestStars: 2, playsAtLevel: 1 });
  });

  it('POST inserts adaptive progress only after confirming ownership', async () => {
    database([{ id: 7 }], []);
    const res = response();
    await postGameLevel(request('POST', '7', 3), res);
    expect(mocks.select).toHaveBeenCalledTimes(2);
    expect(mocks.values).toHaveBeenCalledWith({ childId: 7, gameSlug: 'number-pop', level: 2, bestStars: 3, playsAtLevel: 0 });
    expect(res.json).toHaveBeenCalledWith({ level: 2, bestStars: 3, playsAtLevel: 0, advanced: true, dropped: false });
  });

  it.each([0, 1])('POST keeps a %s-star round at the same level for more practice', async stars => {
    database([{ id: 7 }], [{ id: 91, level: 4, bestStars: 2, playsAtLevel: 2 }]);
    const res = response();
    await postGameLevel(request('POST', '7', stars), res);
    expect(mocks.set).toHaveBeenCalledWith({ level: 4, bestStars: 2, playsAtLevel: 3 });
    expect(res.json).toHaveBeenCalledWith({ level: 4, bestStars: 2, playsAtLevel: 3, advanced: false, dropped: false });
  });

  it.each([2, 3])('POST advances a %s-star round by one level', async stars => {
    database([{ id: 7 }], [{ id: 91, level: 4, bestStars: 1, playsAtLevel: 2 }]);
    const res = response();
    await postGameLevel(request('POST', '7', stars), res);
    expect(mocks.set).toHaveBeenCalledWith({ level: 5, bestStars: stars, playsAtLevel: 0 });
    expect(res.json).toHaveBeenCalledWith({ level: 5, bestStars: stars, playsAtLevel: 0, advanced: true, dropped: false });
  });

  it('POST caps progression at level 10', async () => {
    database([{ id: 7 }], [{ id: 91, level: 10, bestStars: 2, playsAtLevel: 4 }]);
    const res = response();
    await postGameLevel(request('POST', '7', 3), res);
    expect(mocks.set).toHaveBeenCalledWith({ level: 10, bestStars: 3, playsAtLevel: 5 });
    expect(res.json).toHaveBeenCalledWith({ level: 10, bestStars: 3, playsAtLevel: 5, advanced: false, dropped: false });
  });
});
