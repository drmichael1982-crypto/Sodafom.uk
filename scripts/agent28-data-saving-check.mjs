/** Run: node --experimental-vm-modules --test scripts/agent28-data-saving-check.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { ROOT, plain, loadSource, memoryStorage, fakeDatabase, routes, invoke } from './agent28-test-support.mjs';
const input = await loadSource('src/server/lib/progress-input.ts');
const { GameLevelPersistence, levelCacheKey, validLevel } = await loadSource('src/lib/game-level-persistence.ts');
const owner = { userId: 'parent-a', childId: 1 };
const level = (value = 4, stars = 2) => ({ level: value, bestStars: stars, playsAtLevel: 0 });
const ok = data => new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
const options = (storage = memoryStorage(), fetcher = async () => ok(level())) => ({ storage, fetcher, apiPrefix: '/api' });
const make = (opts = options(), who = owner) => new GameLevelPersistence('number-pop', who, opts);
const activity = { subject: 'maths', activityId: 'number-pop', activityTitle: 'Synthetic activity', score: 90, maxScore: 100, durationSeconds: 120 };

for (const bad of ['0', '-1', '01', '1suffix', '1.5', '2147483648', ['1', '2'], null]) {
  test(`reject malformed child ID ${JSON.stringify(bad)}`, () => assert.equal(input.childIdFromParam(bad), null));
}
test('accept valid child IDs and single route-param array', () => {
  assert.equal(input.childIdFromParam('42'), 42);
  assert.equal(input.childIdFromParam(['42']), 42);
});
test('validate slug bounds and star values without coercion', () => {
  for (const bad of ['', ' x', 'x\n', 'x'.repeat(65), {}, ['a', 'b']]) assert.equal(input.gameSlugFromParam(bad), null);
  for (const bad of [null, {}, { stars: '3' }, { stars: -1 }, { stars: 4 }, { stars: 1.5 }, { stars: NaN }]) assert.equal(input.starsFromBody(bad), null);
  assert.equal(input.starsFromBody({ stars: 0 }), 0);
});
test('activity validation prevents malformed/negative/oversized data', () => {
  for (const patch of [{ score: '90' }, { score: -1 }, { score: 101 }, { durationSeconds: -1 }, { durationSeconds: Infinity }, { maxScore: -1 }, { subject: [] }, { activityId: '' }, { activityTitle: 'x'.repeat(256) }]) {
    assert.equal(input.progressFromBody({ ...activity, ...patch }), null);
  }
  assert.equal(input.progressFromBody(null), null);
  assert.deepEqual(plain(input.progressFromBody(activity)), activity);
});
test('unchanged score thresholds include zero maximum', () => {
  assert.deepEqual([0, 49, 50, 74, 75, 89, 90, 100].map(score => input.starsForScore(score, 100)), [0, 0, 1, 1, 2, 2, 3, 3]);
  assert.equal(input.starsForScore(0, 0), 0);
});

for (const route of ['gameGet', 'gamePost', 'progressPost', 'progressGet']) {
  test(`${route}: reject anonymous requests before data access`, async () => {
    const database = fakeDatabase(); const handlers = await routes(database, async () => null);
    const result = await invoke(handlers[route], { body: route === 'progressPost' ? activity : { stars: 3 } });
    assert.equal(result.code, 401); assert.equal(database.trace.length, 0);
    assert.equal(result.headers['Cache-Control'], 'private, no-store');
  });
  test(`${route}: another parent's child is inaccessible`, async () => {
    const database = fakeDatabase(); const handlers = await routes(database);
    const before = database.state();
    const result = await invoke(handlers[route], { childId: '2', body: route === 'progressPost' ? activity : { stars: 3 } });
    assert.equal(result.code, 404); assert.deepEqual(database.state(), before);
    assert.ok(!database.trace.includes('select:gameLevels'));
  });
}
test('game GET returns stored levels and safe defaults', async () => {
  const database = fakeDatabase({ gameLevels: [{ id: 1, childId: 1, gameSlug: 'number-pop', ...level() }] });
  const handlers = await routes(database);
  assert.deepEqual((await invoke(handlers.gameGet)).body, level());
  assert.deepEqual((await invoke(handlers.gameGet, { gameSlug: 'unplayed' })).body, level(1, 0));
});
test('game POST validates before starting a transaction', async () => {
  const database = fakeDatabase(); const handlers = await routes(database);
  assert.equal((await invoke(handlers.gamePost, { body: { stars: 4 } })).code, 400);
  assert.equal(database.trace.length, 0);
});
test('game POST creates once, advances, and preserves best stars', async () => {
  const database = fakeDatabase(); const handlers = await routes(database);
  assert.equal((await invoke(handlers.gamePost, { body: { stars: 3 } })).body.level, 2);
  assert.equal((await invoke(handlers.gamePost, { body: { stars: 1 } })).body.level, 3);
  assert.equal(database.state().gameLevels.length, 1);
  assert.equal(database.state().gameLevels[0].bestStars, 3);
  assert.ok(database.trace.includes('lock:children:update'));
});
test('game level 10 remains capped while counting plays', async () => {
  const database = fakeDatabase({ gameLevels: [{ id: 1, childId: 1, gameSlug: 'number-pop', ...level(10, 3), playsAtLevel: 2 }] });
  const result = await invoke((await routes(database)).gamePost, { body: { stars: 0 } });
  assert.equal(result.body.level, 10); assert.equal(result.body.playsAtLevel, 3); assert.equal(result.body.advanced, false);
});
for (const failure of ['insert:gameLevels', 'update:gameLevels', 'commit']) {
  test(`game POST rolls back ${failure} and returns no private driver detail`, async () => {
    const database = fakeDatabase(failure.startsWith('update') ? { gameLevels: [{ id: 1, childId: 1, gameSlug: 'number-pop', ...level() }] } : {});
    const before = database.state(); database.fail(failure);
    const result = await invoke((await routes(database)).gamePost, { body: { stars: 3 } });
    assert.equal(result.code, 503); assert.deepEqual(database.state(), before);
    assert.ok(!JSON.stringify(result.body).includes('synthetic-private'));
  });
}
test('two game submissions use the locked transaction path', async () => {
  const database = fakeDatabase(); const handlers = await routes(database);
  await Promise.all([invoke(handlers.gamePost, { body: { stars: 3 } }), invoke(handlers.gamePost, { body: { stars: 1 } })]);
  assert.equal(database.state().gameLevels.length, 1); assert.equal(database.state().gameLevels[0].level, 3);
  assert.equal(database.trace.filter(item => item === 'lock:children:update').length, 2);
});
test('activity, stars and weekly summary commit together', async () => {
  const database = fakeDatabase(); const handlers = await routes(database);
  const result = await invoke(handlers.progressPost, { body: activity });
  assert.equal(result.code, 201); assert.equal(result.body.starsEarned, 3);
  assert.equal(database.state().activitySessions.length, 1); assert.equal(database.state().children[0].totalStars, 3);
  assert.equal(database.state().progressSummaries[0].avgScore, '90.00');
  assert.equal(database.state().progressSummaries[0].totalMinutes, 2);
});
test('weekly summary updates preserve existing averaging and duration rules', async () => {
  const database = fakeDatabase(); const handlers = await routes(database);
  await invoke(handlers.progressPost, { body: activity });
  await invoke(handlers.progressPost, { body: { ...activity, score: 50, durationSeconds: 60 } });
  const summary = database.state().progressSummaries[0];
  assert.equal(summary.totalSessions, 2); assert.equal(summary.avgScore, '70.00'); assert.equal(summary.totalMinutes, 3);
});
test('zero-score/zero-maximum reading record saves without awarding stars', async () => {
  const database = fakeDatabase(); const handlers = await routes(database);
  const result = await invoke(handlers.progressPost, { body: { ...activity, subject: 'reading', score: 0, maxScore: 0 } });
  assert.equal(result.code, 201); assert.equal(result.body.starsEarned, 0); assert.equal(database.state().activitySessions.length, 1);
});
for (const failure of ['insert:activitySessions', 'update:children', 'select:starMilestones', 'insert:promoCodes', 'insert:starMilestones', 'select:progressSummaries', 'insert:progressSummaries', 'commit']) {
  test(`activity transaction rolls back at ${failure}`, async () => {
    const database = fakeDatabase({ children: [{ id: 1, parentId: 'parent-a', totalStars: 999 }] });
    const before = database.state(); database.fail(failure);
    const result = await invoke((await routes(database)).progressPost, { body: activity });
    assert.equal(result.code, 503); assert.deepEqual(database.state(), before);
    assert.equal(database.trace.at(-1), 'rollback');
    assert.ok(!JSON.stringify(result.body).includes('synthetic-private'));
  });
}
test('failed update of an existing summary rolls back new activity and stars', async () => {
  const database = fakeDatabase(); const handlers = await routes(database);
  await invoke(handlers.progressPost, { body: activity });
  const before = database.state(); database.fail('update:progressSummaries');
  assert.equal((await invoke(handlers.progressPost, { body: activity })).code, 503);
  assert.deepEqual(database.state(), before);
});
test('milestone and promo stay paired and are not awarded again on later activity', async () => {
  const database = fakeDatabase({ children: [{ id: 1, parentId: 'parent-a', totalStars: 999 }] });
  const handlers = await routes(database);
  await Promise.all([invoke(handlers.progressPost, { body: activity }), invoke(handlers.progressPost, { body: activity })]);
  const state = database.state();
  assert.equal(state.starMilestones.length, 1); assert.equal(state.promoCodes.length, 1);
  assert.equal(state.starMilestones[0].promoCode, state.promoCodes[0].code);
  assert.equal(state.children[0].totalStars, 1005); assert.equal(state.progressSummaries[0].totalSessions, 2);
});

test('account, child and guest caches have distinct keys', () => {
  assert.equal(levelCacheKey('number-pop', null), 'sodafom_level_number-pop');
  const keys = [null, owner, { userId: 'parent-b', childId: 1 }, { userId: 'parent-a', childId: 2 }].map(who => levelCacheKey('number-pop', who));
  assert.equal(new Set(keys).size, 4);
});
test('guest legacy progress survives a new persistence instance', async () => {
  const storage = memoryStorage({ sodafom_level_number_pop: '{}' });
  const one = make(options(storage), null); await one.record(3);
  const refreshed = make(options(storage), null);
  assert.equal(refreshed.snapshot().level, 2); assert.equal(refreshed.snapshot().bestStars, 3);
  assert.equal(refreshed.snapshot().syncStatus, 'local-only');
});
test('successful cloud read is cached and restores offline on refresh', async () => {
  const storage = memoryStorage(); const one = make(options(storage)); await one.load();
  const refreshed = make(options(storage, async () => { throw new Error('offline'); }));
  await refreshed.load(); assert.equal(refreshed.snapshot().level, 4); assert.equal(refreshed.snapshot().syncStatus, 'cached');
});
test('cloud result restores on a clean second device', async () => {
  let remote = level(1, 0);
  const fetcher = async (_url, init) => { if (init.method === 'POST') remote = level(remote.level + 1, JSON.parse(init.body).stars); return ok(remote); };
  const one = make(options(memoryStorage(), fetcher)); await one.load(); await one.record(3);
  const two = make(options(memoryStorage(), fetcher)); await two.load();
  assert.equal(two.snapshot().level, 2); assert.equal(two.snapshot().bestStars, 3); assert.equal(two.snapshot().syncStatus, 'synced');
});
for (const kind of ['HTTP failure', 'invalid JSON', 'invalid data']) {
  test(`${kind} never resets cached cloud progress to level 1`, async () => {
    const storage = memoryStorage({ [levelCacheKey('number-pop', owner)]: JSON.stringify(level(6, 3)) });
    const fetcher = async () => kind === 'HTTP failure' ? new Response('failure', { status: 503 })
      : kind === 'invalid JSON' ? new Response('not-json') : ok({ level: 'oops', bestStars: 100 });
    const client = make(options(storage, fetcher)); await client.load();
    assert.equal(client.snapshot().level, 6); assert.equal(client.snapshot().bestStars, 3);
    assert.notEqual(client.snapshot().syncStatus, 'synced');
  });
}
test('optimistic save reaches storage before the network resolves', async () => {
  let finish; const storage = memoryStorage();
  const client = make(options(storage, async () => new Promise(resolve => { finish = resolve; })));
  const saving = client.record(3);
  assert.equal(JSON.parse(storage.getItem(client.cacheKey)).level, 2);
  assert.equal(JSON.parse(storage.getItem(client.cacheKey)).pending, true);
  await new Promise(resolve => setImmediate(resolve)); finish(ok(level(2, 3))); await saving;
  assert.equal(client.snapshot().syncStatus, 'synced');
});
test('offline result survives refresh and a lower server response without blind replay', async () => {
  const storage = memoryStorage(); const client = make(options(storage, async () => { throw new Error('offline'); }));
  await client.record(3); let posts = 0;
  const refreshed = make(options(storage, async (_url, init) => { if (init.method === 'POST') posts += 1; return ok(level(1, 0)); }));
  await refreshed.load(); await refreshed.load();
  assert.equal(refreshed.snapshot().level, 2); assert.equal(refreshed.snapshot().bestStars, 3);
  assert.equal(refreshed.snapshot().syncStatus, 'pending'); assert.equal(posts, 0);
});
test('a later acknowledged save does not falsely confirm an older uncertain write', async () => {
  const storage = memoryStorage({ [levelCacheKey('number-pop', owner)]: JSON.stringify({ ...level(2, 3), pending: true }) });
  const client = make(options(storage, async () => ok(level(2, 1)))); await client.record(1);
  assert.equal(client.snapshot().level, 3); assert.equal(client.snapshot().syncStatus, 'pending');
});
test('a stale GET cannot overwrite a newer save', async () => {
  let finishGet;
  const client = make(options(memoryStorage(), async (_url, init) => init.method === 'GET'
    ? new Promise(resolve => { finishGet = resolve; }) : ok(level(5, 3))));
  const loading = client.load(); await client.record(3); finishGet(ok(level(1, 0))); await loading;
  assert.equal(client.snapshot().level, 5); assert.equal(client.snapshot().syncStatus, 'synced');
});
test('overlapping saves are serialized and preserve both completions', async () => {
  let count = 1, active = 0, maxActive = 0;
  const client = make(options(memoryStorage(), async () => {
    active += 1; maxActive = Math.max(maxActive, active);
    await new Promise(resolve => setTimeout(resolve, 3)); count += 1; active -= 1;
    return ok(level(count, 3));
  }));
  await Promise.all([client.record(3), client.record(1)]);
  assert.equal(client.snapshot().level, 3); assert.equal(client.snapshot().syncStatus, 'synced'); assert.equal(maxActive, 1);
});
for (const status of [401, 403, 404]) {
  test(`${status} hides inaccessible child cache and never writes it as guest data`, async () => {
    const storage = memoryStorage({ [levelCacheKey('number-pop', owner)]: JSON.stringify(level(8, 3)) });
    let posts = 0;
    const client = make(options(storage, async (_url, init) => { if (init.method === 'POST') posts += 1; return new Response('', { status }); }));
    await client.load(); await client.record(3);
    assert.equal(client.snapshot().level, 1); assert.equal(client.snapshot().syncStatus, 'unavailable');
    assert.equal(posts, 0); assert.equal(storage.getItem('sodafom_level_number-pop'), null);
  });
}
test('guest progress is not attributed to a newly selected child', () => {
  const client = make(options(memoryStorage({ 'sodafom_level_number-pop': JSON.stringify(level(9, 3)) })));
  assert.equal(client.snapshot().level, 1);
});
test('bad caches and out-of-range levels do not cause NaN or crashes', () => {
  for (const raw of ['null', '{bad', '[]', '{"level":999,"bestStars":3}', '{"level":2,"bestStars":-1}']) {
    const client = make(options(memoryStorage({ 'sodafom_level_number-pop': raw })), null);
    assert.equal(client.snapshot().level, 1);
  }
  assert.equal(validLevel({ level: NaN, bestStars: 3 }), null);
});
test('quota failure is reported as unavailable, not durable local success', async () => {
  const client = make(options({ getItem: () => null, setItem: () => { throw new Error('quota'); } }), null);
  await client.record(3); assert.equal(client.snapshot().storageAvailable, false);
  assert.equal(client.snapshot().syncStatus, 'unavailable'); assert.ok(client.snapshot().saveError);
});
test('cloud saving still works when localStorage is disabled, with an explicit cache warning', async () => {
  const client = make(options(null, async () => ok(level(2, 3)))); await client.record(3);
  assert.equal(client.snapshot().syncStatus, 'synced'); assert.equal(client.snapshot().storageAvailable, false);
  assert.ok(client.snapshot().saveError);
});
test('bounded network timeout keeps a pending result', async () => {
  const client = make({ ...options(memoryStorage(), async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('timed out')), { once: true });
  })), timeoutMs: 5 });
  await client.record(2); assert.equal(client.snapshot().syncStatus, 'pending');
});
test('invalid stars cause no write or request', async () => {
  const storage = memoryStorage(); let requests = 0;
  const client = make(options(storage, async () => { requests += 1; return ok(level()); }));
  await client.record(7); assert.equal(storage.values.size, 0); assert.equal(requests, 0);
});

async function databaseClientFixture() {
  const state = { badConfig: true, badDrizzle: false, badPing: false, pools: 0, ended: 0, released: 0 };
  const pool = { end: async () => { state.ended += 1; }, getConnection: async () => ({ ping: async () => {
    if (state.badPing) throw new Error('synthetic private ping error');
  }, release: () => { state.released += 1; } }) };
  const source = await loadSource('src/server/db/client.ts', {
    'drizzle-orm/mysql2': { drizzle: () => { if (state.badDrizzle) throw new Error('synthetic private driver error'); return { query: {}, marker: 7, select() { return this.marker; } }; } },
    'mysql2/promise': { default: { createPool: () => { state.pools += 1; return pool; } } },
    [path.join(ROOT, 'src/server/db/config.ts')]: { getDatabaseCredentials: () => {
      if (state.badConfig) throw new Error('synthetic private configuration detail');
      return { host: 'localhost', port: 3306, user: 'synthetic', password: 'not-a-real-secret', database: 'synthetic' };
    } },
    [path.join(ROOT, 'src/server/db/schema.ts')]: {},
  });
  return { source, state };
}
test('database configuration failure throws instead of accepting fake writes', async () => {
  const { source, state } = await databaseClientFixture();
  assert.throws(() => source.db.insert, /Database unavailable/); assert.equal(state.pools, 0);
  assert.equal(await source.testConnection(), false);
});
test('database can initialize on a later request after configuration recovery', async () => {
  const { source, state } = await databaseClientFixture();
  assert.throws(() => source.db.select); state.badConfig = false;
  assert.equal(source.db.select(), 7); assert.equal(state.pools, 1);
});
test('failed driver initialization closes its unused pool and does not expose driver detail', async () => {
  const { source, state } = await databaseClientFixture(); state.badConfig = false; state.badDrizzle = true;
  assert.throws(() => source.db.select, /^Error: Database unavailable$/);
  await Promise.resolve(); assert.equal(state.ended, 1);
  state.badDrizzle = false; assert.equal(source.db.select(), 7);
});
test('failed database ping always releases the checked-out connection', async () => {
  const { source, state } = await databaseClientFixture(); state.badConfig = false; state.badPing = true;
  assert.equal(await source.testConnection(), false); assert.equal(state.released, 1);
  state.badPing = false; assert.equal(await source.testConnection(), true); assert.equal(state.released, 2);
});
test('closing the database resets lazy state so a fresh pool can reopen', async () => {
  const { source, state } = await databaseClientFixture(); state.badConfig = false;
  assert.equal(source.db.select(), 7); await source.closeConnection(); assert.equal(state.ended, 1);
  assert.equal(source.db.select(), 7); assert.equal(state.pools, 2);
});

test('no saved cache plus a failed GET is unavailable, not a claimed cached success', async () => {
  const client = make(options(memoryStorage(), async () => new Response('', { status: 503 })));
  await client.load(); assert.equal(client.snapshot().syncStatus, 'unavailable');
});
test('a GET during an in-flight save does not permanently mark a later acknowledgement uncertain', async () => {
  let finishPost;
  const client = make(options(memoryStorage(), async (_url, init) => init.method === 'GET'
    ? ok(level(1, 0)) : new Promise(resolve => { finishPost = resolve; })));
  const saving = client.record(3); await new Promise(resolve => setImmediate(resolve));
  await client.load(); finishPost(ok(level(2, 3))); await saving;
  assert.equal(client.snapshot().syncStatus, 'synced');
});
test('same-tab child selection and removal dispatch a storage notification only after success', async () => {
  const storage = memoryStorage(); const events = [];
  const source = await loadSource('src/hooks/useChildAge.ts', {
    react: { default: {}, useState() {}, useEffect() {} },
  }, { localStorage: storage, window: { dispatchEvent: event => { events.push(event.type); } } });
  source.setActiveChild({ id: 1, name: 'Synthetic learner', ageGroup: '8-10', avatarEmoji: '⭐' });
  assert.equal(source.getActiveChild().id, 1);
  source.setActiveChild(null); assert.equal(source.getActiveChild(), null);
  assert.deepEqual(events, ['sodafom:active-child-changed', 'sodafom:active-child-changed']);
});
test('invalid saved child IDs are not used to select a cloud cache', async () => {
  const storage = memoryStorage();
  const source = await loadSource('src/hooks/useChildAge.ts', {
    react: { default: {}, useState() {}, useEffect() {} },
  }, { localStorage: storage });
  for (const value of [null, { id: -1, ageGroup: '8-10' }, { id: '1', ageGroup: '8-10' }, { id: 1.5, ageGroup: '8-10' }]) {
    storage.setItem('sodafom_active_child', JSON.stringify(value)); assert.equal(source.getActiveChild(), null);
  }
});

test('progress GET reads back synthetic reading/homework activity and scores submitted to the existing API', async () => {
  const database = fakeDatabase(); const handlers = await routes(database);
  await invoke(handlers.progressPost, { body: { ...activity, subject: 'reading', activityId: 'synthetic-reading', score: 75 } });
  await invoke(handlers.progressPost, { body: { ...activity, subject: 'homework', activityId: 'synthetic-homework', score: 50 } });
  const result = await invoke(handlers.progressGet);
  assert.equal(result.code, 200); assert.equal(result.headers['Cache-Control'], 'private, no-store');
  assert.equal(result.body.recent.length, 2); assert.equal(result.body.summaries.length, 2);
  assert.deepEqual(result.body.recent.map(row => row.score).sort((a, b) => a - b), [50, 75]);
  assert.equal(result.body.totalStars, 3);
});
test('failed progress GET does not disclose driver details or masquerade as empty saved progress', async () => {
  const database = fakeDatabase(); database.fail('select:activitySessions');
  const result = await invoke((await routes(database)).progressGet);
  assert.equal(result.code, 503); assert.deepEqual(result.body, { error: 'Progress is temporarily unavailable' });
});

test('cache keys cannot collide through delimiter-shaped account IDs or game slugs', () => {
  assert.notEqual(levelCacheKey('x_child_2_y', { userId: 'a', childId: 1 }),
    levelCacheKey('y', { userId: 'a_child_1_x', childId: 2 }));
});
test('a guest refresh event reads the latest locally saved value from another instance', async () => {
  const storage = memoryStorage();
  const first = make(options(storage), null); const other = make(options(storage), null);
  await first.record(3); await other.load();
  assert.equal(other.snapshot().level, 2); assert.equal(other.snapshot().bestStars, 3);
});
