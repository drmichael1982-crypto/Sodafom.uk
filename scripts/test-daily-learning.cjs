/* Run: node scripts/test-daily-learning.cjs (uses the repository's TypeScript dev dependency). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
process.env.TZ = 'Europe/London';
const root = path.resolve(__dirname, '..');

function loadTS(relative, mocks = {}) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  assert.equal((compiled.diagnostics || []).length, 0, relative + ': syntax diagnostics');
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const realRequire = mod.require.bind(mod);
  mod.require = name => Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : realRequire(name);
  mod._compile(compiled.outputText, filename);
  return mod.exports;
}
const model = loadTS('src/lib/daily-learning.ts');
const now = new Date('2026-09-13T12:00:00Z');
const child = { id: 7, name: 'Alex', ageGroup: '8-10', totalStars: 27 };
function row(overrides = {}) {
  return { id: 100, childId: 7, activityId: 'number-pop', activityTitle: 'Number pop', subject: 'maths', starsEarned: 2, completedAt: '2026-09-13T10:00:00Z', ...overrides };
}
function activity(overrides = {}) { return model.normaliseActivity(row(overrides), 7); }
function history(rows, overrides = {}) { return { child, activities: rows, partial: false, ...overrides }; }
function storage(value) { return { getItem: () => value }; }
function response(body, status = 200) { return { ok: status >= 200 && status < 300, status, json: async () => body }; }
function page(rows, nextCursor = null, profile = child) { return { child: profile, recent: rows, nextCursor }; }
const signal = () => new AbortController().signal;

test('reads only a valid saved child ID, without trusting stored name or age', () => {
  assert.equal(model.selectedChildId(storage('{"id":7,"name":"ignored"}')), 7);
  for (const value of ['null', '[]', '{', '{"id":"7"}', '{"id":-1}', '{"id":0}', '{"id":1.5}']) assert.equal(model.selectedChildId(storage(value)), null);
});
test('blocked storage is safe', () => {
  const blocked = { getItem() { throw new Error('blocked'); } };
  assert.equal(model.selectedChildId(blocked), null);
  assert.deepEqual(model.readKeepsake(blocked, 'key'), { version: 1, bestStreak: 0, earned: [] });
});
test('normalises a real completion and preserves its recorded stars', () => {
  assert.deepEqual(activity(), { id: 100, childId: 7, title: 'Number pop', kind: 'game', completedAt: '2026-09-13T10:00:00.000Z', stars: 2 });
});
test('does not use another child, unowned data, a page visit or an invalid row', () => {
  for (const value of [null, [], {}, row({ childId: 8 }), row({ childId: undefined }), row({ id: 0 }), row({ activityId: '' }), row({ completedAt: null })]) assert.equal(model.normaliseActivity(value, 7), null);
});
test('rejects ambiguous, corrupt and impossible dates', () => {
  for (const date of ['today', '2026-09-13', '2026-09-13T10:00:00', '2026-02-30T10:00:00Z', '2026-13-01T10:00:00Z', '1999-01-01T10:00:00Z']) assert.equal(activity({ completedAt: date }), null);
});
test('keeps safe bounded titles and does not construct HTML', () => {
  assert.equal(activity({ activityTitle: 'a'.repeat(300) }).title.length, 160);
  assert.equal(activity({ activityTitle: '' }).title, 'Learning activity');
  assert.equal(activity({ activityTitle: '<script>bad()</script>' }).title, '<script>bad()</script>');
});
test('never fabricates stars from a score or accepts negative/invalid star values', () => {
  assert.equal(activity({ starsEarned: -3, score: 100 }).stars, 0);
  assert.equal(activity({ starsEarned: '3' }).stars, 0);
  assert.equal(activity({ starsEarned: Infinity }).stars, 0);
  assert.equal(activity({ starsEarned: 100 }).stars, 3);
});
test('separates lessons, reading, games and homework activity', () => {
  assert.equal(model.activityKind('lesson:maths-day-1', 'maths'), 'lesson');
  assert.equal(model.activityKind('tutor-science', 'science'), 'lesson');
  assert.equal(model.activityKind('reading-quest', 'reading'), 'reading');
  assert.equal(model.activityKind('book:fox', 'english'), 'reading');
  assert.equal(model.activityKind('homework:fractions', 'maths'), 'activity');
  assert.equal(model.activityKind('number-pop', 'maths'), 'game');
});
test('uses the local day around British summer-time midnight', () => {
  assert.equal(model.localDay(new Date('2026-09-12T23:30:00Z')), '2026-09-13');
  const result = model.summariseDay(history([activity({ completedAt: '2026-09-12T23:30:00Z' })]), now);
  assert.equal(result.today.length, 1);
});
test('excludes future-dated completions and other children', () => {
  const result = model.summariseDay(history([activity({ completedAt: '2026-09-14T10:00:00Z' }), { ...activity(), childId: 8 }]), now);
  assert.equal(result.today.length, 0);
  assert.equal(result.keepsake.bestStreak, 0);
});
test('deduplicates session IDs but allows genuinely separate attempts', () => {
  const result = model.summariseDay(history([activity(), activity(), activity({ id: 101 })]), now);
  assert.equal(result.today.length, 2);
  assert.equal(result.todayStars, 4);
});
test('does not mislabel yesterday as completed today', () => {
  const result = model.summariseDay(history([activity({ completedAt: '2026-09-12T08:00:00Z' })]), now);
  assert.equal(result.today.length, 0);
});
test('completed activities are newest first', () => {
  const result = model.summariseDay(history([activity({ id: 1, completedAt: '2026-09-13T07:00:00Z' }), activity({ id: 2 })]), now);
  assert.deepEqual(result.today.map(a => a.id), [2, 1]);
});
test('uses saved age for a small optional goal and caps progress at 100 percent', () => {
  for (const [ageGroup, target] of [['5-7', 1], ['8-10', 2], ['11-13', 3], [null, 2]]) {
    const result = model.summariseDay(history([activity(), activity({ id: 2 }), activity({ id: 3 }), activity({ id: 4 })], { child: { ...child, ageGroup } }), now);
    assert.equal(result.target, target);
    assert.equal(result.percent, 100);
  }
});
test('a zero-star completion still counts as effort and can achieve the daily aim', () => {
  const result = model.summariseDay(history([activity({ starsEarned: 0 })], { child: { ...child, ageGroup: '5-7', totalStars: 0 } }), now);
  assert.equal(result.percent, 100);
  assert.ok(result.keepsake.earned.includes('first-step'));
});
test('best streak ignores duplicate days and survives gaps', () => {
  assert.equal(model.bestLearningStreak(['2026-09-01', '2026-09-02', '2026-09-02', '2026-09-03', '2026-09-12']), 3);
  assert.equal(model.bestLearningStreak([]), 0);
});
test('streaks use calendar days across both British clock changes', () => {
  assert.equal(model.bestLearningStreak(['2026-03-28', '2026-03-29', '2026-03-30']), 3);
  assert.equal(model.bestLearningStreak(['2026-10-24', '2026-10-25', '2026-10-26']), 3);
});
test('missed days never remove a retained best streak or achievement', () => {
  const saved = { version: 1, bestStreak: 9, earned: ['reading-friend'] };
  const result = model.summariseDay(history([], { child: { ...child, totalStars: 0 } }), now, saved);
  assert.equal(result.keepsake.bestStreak, 9);
  assert.deepEqual(result.keepsake.earned, ['reading-friend']);
});
test('reading achievement counts distinct completed reading sessions only', () => {
  const reading = Array.from({ length: 5 }, (_, i) => activity({ id: i + 1, subject: 'reading' }));
  assert.ok(model.summariseDay(history(reading), now).keepsake.earned.includes('reading-friend'));
  assert.ok(!model.summariseDay(history(Array(5).fill(reading[0])), now).keepsake.earned.includes('reading-friend'));
});
test('star milestone uses saved account total, not newly granted stars', () => {
  const result = model.summariseDay(history([]), now);
  assert.ok(result.keepsake.earned.includes('star-collector'));
  assert.equal(result.todayStars, 0);
});
test('last seven local days are ordered, including today, without lost-day states', () => {
  const result = model.summariseDay(history([activity()]), now);
  assert.equal(result.week.length, 7);
  assert.equal(result.week[0].day, '2026-09-07');
  assert.equal(result.week[6].day, '2026-09-13');
  assert.equal(result.week[6].learned, true);
});
test('keepsake keys isolate accounts and children and cannot collide on separators', () => {
  assert.notEqual(model.keepsakeKey('parent:a', 7), model.keepsakeKey('parent', 7));
  assert.notEqual(model.keepsakeKey('parent', 7), model.keepsakeKey('parent', 8));
});
test('damaged and unknown-version keepsakes cannot introduce arbitrary achievements', () => {
  assert.deepEqual(model.readKeepsake(storage('{"version":2,"bestStreak":9}'), 'x'), { version: 1, bestStreak: 0, earned: [] });
  assert.deepEqual(model.readKeepsake(storage('{"version":1,"bestStreak":-1,"earned":["first-step","admin","first-step"]}'), 'x'), { version: 1, bestStreak: 0, earned: ['first-step'] });
});
test('merging keepsakes only retains or increases earned progress', () => {
  assert.deepEqual(model.mergeKeepsakes({ version: 1, bestStreak: 5, earned: ['first-step'] }, { version: 1, bestStreak: 2, earned: ['reading-friend'] }), { version: 1, bestStreak: 5, earned: ['first-step', 'reading-friend'] });
});

test('loader is GET-only, credentialed, uncached and follows the owned child cursor', async () => {
  const calls = [];
  const result = await model.loadDailyHistory('/api', 7, signal(), async (url, init) => {
    calls.push([url, init]);
    return response(calls.length === 1 ? page([row({ id: 101 })], 101) : page([row({ id: 100 })]));
  });
  assert.equal(result.activities.length, 2);
  assert.equal(result.partial, false);
  assert.equal(calls[1][0], '/api/children/7/progress?view=daily&beforeId=101');
  for (const [, init] of calls) { assert.equal(init.method, 'GET'); assert.equal(init.credentials, 'include'); assert.equal(init.cache, 'no-store'); assert.equal(init.body, undefined); }
});
test('loader validates ownership even when a successful response has the wrong child', async () => {
  await assert.rejects(model.loadDailyHistory('/api', 7, signal(), async () => response(page([row()], null, { ...child, id: 8 }))), /unexpected response/);
});
test('loader ignores an unexpected sibling row', async () => {
  const result = await model.loadDailyHistory('/api', 7, signal(), async () => response(page([row(), row({ id: 101, childId: 8 })])));
  assert.equal(result.activities.length, 1);
});
test('loader deduplicates overlapping pages', async () => {
  let calls = 0;
  const result = await model.loadDailyHistory('/api', 7, signal(), async () => response(++calls === 1 ? page([row()], 100) : page([row()])));
  assert.equal(result.activities.length, 1);
});
test('loader rejects a stuck cursor rather than looping indefinitely', async () => {
  await assert.rejects(model.loadDailyHistory('/api', 7, signal(), async () => response(page([row()], 100))), /safely/);
});
test('loader has a hard request bound and labels incomplete history', async () => {
  let calls = 0;
  const result = await model.loadDailyHistory('/api', 7, signal(), async () => {
    calls++;
    return response(page([row({ id: 5000 - calls })], 5000 - calls));
  });
  assert.equal(calls, model.DAILY_MAX_PAGES);
  assert.equal(result.partial, true);
});
test('loader distinguishes signed-out, forbidden, missing and unavailable progress', async () => {
  for (const [status, message] of [[401, /sign in/], [403, /belonging/], [404, /belonging/], [500, /unavailable/]]) await assert.rejects(model.loadDailyHistory('/api', 7, signal(), async () => response({}, status)), message);
});
test('loader does not accept a missing daily view or malformed profile', async () => {
  for (const body of [{ recent: [] }, page([], null, { ...child, totalStars: -1 }), page([], null, { ...child, name: '' }), page([], 'unsafe')]) await assert.rejects(model.loadDailyHistory('/api', 7, signal(), async () => response(body)));
});
test('loader refuses invalid child IDs without making a network request', async () => {
  let called = false;
  await assert.rejects(model.loadDailyHistory('/api', -1, signal(), async () => { called = true; return response({}); }));
  assert.equal(called, false);
});
test('loader stops an already aborted request before fetching', async () => {
  const controller = new AbortController(); controller.abort();
  let called = false;
  await assert.rejects(model.loadDailyHistory('/api', 7, controller.signal, async () => { called = true; return response({}); }));
  assert.equal(called, false);
});
test('loader discards a result that arrives after an abort', async () => {
  const controller = new AbortController();
  await assert.rejects(model.loadDailyHistory('/api', 7, controller.signal, async () => { controller.abort(); return response(page([row()])); }));
});

function serverFixture(options = {}) {
  const calls = [];
  const schema = {
    children: { table: 'children', id: 'children.id', parentId: 'children.parentId', name: 'children.name', ageGroup: 'children.ageGroup', totalStars: 'children.totalStars' },
    activitySessions: { table: 'activity', id: 'activity.id', childId: 'activity.childId', completedAt: 'activity.completedAt' },
    progressSummaries: { table: 'summaries', childId: 'summaries.childId', weekStart: 'summaries.weekStart' },
  };
  const db = { select(fields) {
    const call = { fields }; calls.push(call);
    const query = {
      from(table) { call.table = table.table; return query; },
      where(condition) { call.where = condition; return query; },
      orderBy(order) { call.order = order; return query; },
      limit(limit) {
        call.limit = limit;
        if (options.dbError) return Promise.reject(new Error('PRIVATE DATABASE DETAIL'));
        if (call.table === 'children') return Promise.resolve(options.notOwned ? [] : [child]);
        return Promise.resolve(call.table === 'activity' ? options.rows || [] : options.summaries || []);
      },
    }; return query;
  } };
  const op = name => (...args) => [name, ...args];
  const handler = loadTS('src/server/api/children/[childId]/progress/GET.ts', {
    '../../../../db/client.js': { db }, '../../../../db/schema.js': schema,
    'drizzle-orm': { eq: op('eq'), desc: op('desc'), and: op('and'), lt: op('lt') },
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => options.signedOut ? null : { user: { id: 'parent-1' } } } }) },
  }).default;
  const res = { statusCode: 200, headers: {}, body: null, set(key, value) { this.headers[key] = value; return this; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  async function run(query = { view: 'daily' }, id = '7') { await handler({ query, params: { childId: id }, headers: {} }, res); return res; }
  return { calls, run };
}
test('daily endpoint requires sign-in and returns no private data', async () => {
  const fixture = serverFixture({ signedOut: true });
  const res = await fixture.run();
  assert.equal(res.statusCode, 401); assert.equal(fixture.calls.length, 0);
  assert.equal(res.headers['Cache-Control'], 'private, no-store');
});
test('daily endpoint checks parent ownership before querying activity', async () => {
  const fixture = serverFixture({ notOwned: true });
  assert.equal((await fixture.run()).statusCode, 404);
  assert.equal(fixture.calls.length, 1);
  assert.deepEqual(fixture.calls[0].where, ['and', ['eq', 'children.id', 7], ['eq', 'children.parentId', 'parent-1']]);
});
test('daily endpoint rejects invalid child IDs', async () => {
  for (const id of ['0', '-1', '7.5', 'not-a-number']) assert.equal((await serverFixture().run({ view: 'daily' }, id)).statusCode, 400);
});
test('daily endpoint rejects malformed cursor inputs', async () => {
  for (const beforeId of ['0', '-2', '1.2', '1e3', '1 OR 1=1', '9007199254740992', ['4']]) assert.equal((await serverFixture().run({ view: 'daily', beforeId })).statusCode, 400);
});
test('daily endpoint returns only 100 rows, plus a stable next cursor', async () => {
  const rows = Array.from({ length: 101 }, (_, i) => row({ id: 201 - i }));
  const fixture = serverFixture({ rows });
  const res = await fixture.run();
  assert.equal(res.body.recent.length, 100); assert.equal(res.body.nextCursor, 102);
  assert.equal(fixture.calls[1].limit, 101);
  assert.deepEqual(fixture.calls[1].order, ['desc', 'activity.id']);
});
test('daily cursor query remains scoped to the owned child', async () => {
  const fixture = serverFixture();
  await fixture.run({ view: 'daily', beforeId: '100' });
  assert.deepEqual(fixture.calls[1].where, ['and', ['eq', 'activity.childId', 7], ['lt', 'activity.id', 100]]);
});
test('daily endpoint returns null cursor at the end of history', async () => {
  assert.equal((await serverFixture({ rows: [row()] }).run()).body.nextCursor, null);
});
test('daily endpoint never discloses database error details', async () => {
  const res = await serverFixture({ dbError: true }).run();
  assert.equal(res.statusCode, 500); assert.ok(!JSON.stringify(res.body).includes('PRIVATE DATABASE DETAIL'));
});
test('default progress response retains its original fields and query limits', async () => {
  const fixture = serverFixture({ rows: [row()], summaries: [{ week: 'saved' }] });
  const res = await fixture.run({});
  assert.deepEqual(Object.keys(res.body).sort(), ['recent', 'summaries', 'totalStars', 'gamesThisWeek', 'topSubject', 'streakDays', 'badgeCount'].sort());
  assert.equal(fixture.calls[1].limit, 20); assert.equal(fixture.calls[2].limit, 12);
  assert.deepEqual(fixture.calls[1].order, ['desc', 'activity.completedAt']);
  assert.equal(res.body.totalStars, 27); assert.equal(res.body.topSubject, 'maths');
});
test('new dashboard and menu integration have valid TSX syntax', () => {
  for (const relative of ['src/components/DailyLearningDashboard.tsx', 'src/pages/FeatureHubPage.tsx']) {
    const result = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), { fileName: relative, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } });
    assert.equal(result.diagnostics.length, 0);
  }
});
test('dashboard uses the existing approved asset and has no AI, payment, completion or unsafe HTML writes', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/DailyLearningDashboard.tsx'), 'utf8');
  assert.ok(source.includes('/assets/images/archie-character-v2.png'));
  assert.ok(source.includes('key={JSON.stringify([user.id, childId])}'));
  assert.ok(source.includes('controller.abort()'));
  assert.ok(!/dangerouslySetInnerHTML|innerHTML|method:\s*['"]POST|\/ai\/|\/stripe\/|\/admin\//.test(source));
});
