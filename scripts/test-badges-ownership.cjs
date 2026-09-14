// Focused local regression tests. HTTP/auth/DB boundaries are mocked; no live DB,
// network request, migration, paid provider, or production credential is used.
// Requires Node 24, with its built-in TypeScript stripping (not type checking).
// Run: node --experimental-vm-modules --test scripts/test-badges-ownership.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createContext, SourceTextModule, SyntheticModule } = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

const root = resolve(__dirname, '..');

async function load(relative, mocks) {
  const context = createContext({ console: { error() {} } });
  const source = stripTypeScriptTypes(readFileSync(resolve(root, relative), 'utf8'), {
    mode: 'strip', sourceUrl: relative,
  });
  const mod = new SourceTextModule(source, { context, identifier: relative });
  await mod.link(name => {
    if (!(name in mocks)) throw new Error(`Unmocked module: ${name}`);
    const values = mocks[name];
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context, identifier: name });
  });
  await mod.evaluate();
  return mod.namespace;
}

const definitions = load('src/lib/badges.ts', {});

async function harness({ session = { user: { id: 'parent-a' } }, authFailure = false, dbFailure = false, empty = false } = {}) {
  const queries = [];
  const profiles = [{ id: 7, parent_id: 'parent-a' }, { id: 8, parent_id: 'parent-b' }];
  const sql = (strings, ...values) => ({ text: strings.join('?').replace(/\s+/g, ' ').trim(), values });
  const db = {
    async execute(query) {
      queries.push(query);
      if (dbFailure) throw new Error('mock database unavailable');
      // Validate the SQL contract as well as simulating the ownership boundary.
      // A regression to user_id, or omission of either predicate, cannot pass.
      if (queries.length === 1) {
        assert.equal(query.text, 'SELECT id FROM children WHERE id = ? AND parent_id = ? LIMIT 1');
        const [id, parentId] = query.values;
        return [profiles.filter(row => row.id === id && row.parent_id === parentId).map(row => ({ id: row.id })), []];
      }
      if (query.text === 'SELECT subject, stars, completed_at FROM child_progress WHERE child_id = ?') {
        assert.deepEqual(query.values, [queries[0].values[0]]);
        return [empty ? [] : [
          { subject: 'Maths', stars: 3, completed_at: '2026-09-01T12:00:00Z' },
          { subject: 'reading', stars: 2, completed_at: '2026-09-02T12:00:00Z' },
        ], []];
      }
      if (query.text === 'SELECT current_streak, max_streak FROM streak_tracker WHERE child_id = ? LIMIT 1') {
        assert.deepEqual(query.values, [queries[0].values[0]]);
        return [empty ? [] : [{ current_streak: 2, max_streak: 5 }], []];
      }
      if (query.text === 'SELECT COUNT(*) as cnt FROM referrals WHERE referrer_user_id = ? AND converted = 1') {
        assert.deepEqual(query.values, [session.user.id]);
        return [[{ cnt: empty ? 0 : 1 }], []];
      }
      throw new Error(`Unexpected SQL: ${query.text}`);
    },
  };
  const { default: handler } = await load('src/server/api/badges/GET.ts', {
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => {
      if (authFailure) throw new Error('mock authentication unavailable');
      return session;
    } } }) },
    '../../db/client.js': { db },
    'drizzle-orm': { sql },
    '@/lib/badges': await definitions,
  });
  const request = (childId, extras = {}) => ({ headers: {}, query: { childId }, ...extras });
  const response = () => ({
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  });
  return { queries, handler, request, response };
}

test('schema maps child ownership to parent_id', () => {
  const schema = readFileSync(resolve(root, 'src/server/db/schema.ts'), 'utf8');
  assert.match(schema, /export const children = mysqlTable\('children',\s*\{[^]*?parentId:\s*varchar\('parent_id'/);
});

test('anonymous and user-less sessions return 401 before any database query', async () => {
  for (const session of [null, {}, { user: null }]) {
    const h = await harness({ session }); const res = h.response();
    await h.handler(h.request('7'), res);
    assert.equal(res.statusCode, 401); assert.equal(h.queries.length, 0);
  }
});

test('missing childId returns 400 without reading the database', async () => {
  const h = await harness(); const res = h.response();
  await h.handler(h.request(undefined), res);
  assert.equal(res.statusCode, 400); assert.equal(h.queries.length, 0);
});

test('invalid, duplicate, object and injection-shaped child IDs are rejected', async () => {
  for (const childId of ['', '0', '-1', '1.5', '1e2', 'Infinity', ' 7 ', '9007199254740992', '7 OR 1=1', ['7'], ['7', '8'], {}, 7]) {
    const h = await harness(); const res = h.response();
    await h.handler(h.request(childId), res);
    assert.equal(res.statusCode, 400, `input ${JSON.stringify(childId)}`);
    assert.equal(h.queries.length, 0);
  }
});

test('another parent child returns 404 before progress, streak or referral reads', async () => {
  const h = await harness(); const res = h.response();
  await h.handler(h.request('8'), res);
  assert.equal(res.statusCode, 404); assert.equal(h.queries.length, 1);
  assert.equal(res.body.error, 'Child not found');
});

test('unknown child has the same response as a child owned by another parent', async () => {
  const h = await harness(); const res = h.response();
  await h.handler(h.request('999'), res);
  assert.equal(res.statusCode, 404); assert.equal(h.queries.length, 1);
  assert.equal(res.body.error, 'Child not found');
});

test('forged query/body ownership or admin claims cannot replace the signed-in parent', async () => {
  const h = await harness(); const res = h.response();
  await h.handler(h.request('8', {
    query: { childId: '8', parentId: 'parent-b', userId: 'parent-b', isAdmin: 'true' },
    body: { parentId: 'parent-b', userId: 'parent-b', isAdmin: true },
  }), res);
  assert.equal(res.statusCode, 404); assert.equal(h.queries.length, 1);
  assert.deepEqual(h.queries[0].values, [8, 'parent-a']);
});

test('owned child returns calculated stats and real badge definitions', async () => {
  const h = await harness(); const res = h.response();
  await h.handler(h.request('7'), res);
  assert.equal(res.statusCode, 200); assert.equal(h.queries.length, 4);
  assert.deepEqual(h.queries[0].values, [7, 'parent-a']);
  assert.equal(res.body.stats.gamesPlayed, 2);
  assert.equal(res.body.stats.totalStars, 5);
  assert.equal(res.body.stats.currentStreak, 2);
  assert.equal(res.body.stats.maxStreak, 5);
  assert.equal(res.body.stats.mathsGames, 1);
  assert.equal(res.body.stats.readingGames, 1);
  assert.equal(res.body.stats.perfectGames, 1);
  assert.equal(res.body.stats.referrals, 1);
  assert.equal(res.body.badges.length, (await definitions).BADGE_DEFS.length);
  assert.equal(res.body.badges.find(badge => badge.id === 'first_game').earned, true);
  assert.equal(res.body.badges.find(badge => badge.id === 'games_10').earned, false);
});

test('changing signed-in parent changes the ownership and referral scope', async () => {
  const own = harness({ session: { user: { id: 'parent-b' } } });
  const h = await own; const res = h.response();
  await h.handler(h.request('8'), res);
  assert.equal(res.statusCode, 200); assert.equal(h.queries.length, 4);
  assert.deepEqual(h.queries[0].values, [8, 'parent-b']);
  assert.deepEqual(h.queries[3].values, ['parent-b']);

  const denied = await harness({ session: { user: { id: 'parent-b' } } });
  const deniedResponse = denied.response();
  await denied.handler(denied.request('7'), deniedResponse);
  assert.equal(deniedResponse.statusCode, 404); assert.equal(denied.queries.length, 1);
});

test('owned child with no progress receives zero stats and unearned first-game badge', async () => {
  const h = await harness({ empty: true }); const res = h.response();
  await h.handler(h.request('7'), res);
  assert.equal(res.statusCode, 200); assert.equal(h.queries.length, 4);
  for (const value of Object.values(res.body.stats)) assert.equal(value, 0);
  assert.equal(res.body.badges.find(badge => badge.id === 'first_game').earned, false);
});

test('ownership-query failure stops all later reads and returns a generic error', async () => {
  const h = await harness({ dbFailure: true }); const res = h.response();
  await h.handler(h.request('7'), res);
  assert.equal(res.statusCode, 500); assert.equal(h.queries.length, 1);
  assert.equal(res.body.error, 'Failed to load badges');
  assert.equal(res.body.badges, undefined);
});

test('authentication failure cannot grant badge access or reach the database', async () => {
  const h = await harness({ authFailure: true }); const res = h.response();
  await h.handler(h.request('7'), res);
  assert.equal(res.statusCode, 500); assert.equal(h.queries.length, 0);
  assert.equal(res.body.error, 'Failed to load badges');
});
