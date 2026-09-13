const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./load.cjs');
const load = loader();
const { createReminderHandlers, ReminderHttpError } = load('src/server/notifications/reminder-handlers.ts');
const { defaultReminderPreferences } = load('src/lib/reminder-policy.ts');
function fixture(extra = {}) {
  const events = [];
  const deps = {
    parentId: async () => 'parent-A', read: async id => { events.push(['read', id]); return defaultReminderPreferences(); },
    save: async (...args) => events.push(['save', ...args]),
    reservePasswordAttempt: async id => { events.push(['attempt', id]); return true; },
    verifyPassword: async (_req, password) => { events.push(['verify']); return password === 'parent-secret'; },
    claim: async id => { events.push(['claim', id]); return null; },
    now: () => new Date('2026-09-14T16:00Z'), ...extra,
  };
  const req = { headers: { 'content-type': 'application/json', 'x-sodafom-reminders': '1' }, body: { preferences: defaultReminderPreferences(), password: 'parent-secret' } };
  const res = { code: 200, body: null, headers: {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader(k, v) { this.headers[k] = v; } };
  return { handlers: createReminderHandlers(deps), req, res, events };
}
test('read is parent-scoped and never cached', async () => { const f = fixture(); await f.handlers.read(f.req, f.res); assert.equal(f.res.code, 200); assert.deepEqual(f.events, [['read', 'parent-A']]); assert.equal(f.res.headers['Cache-Control'], 'no-store'); });
test('signed-out read is rejected', async () => { const f = fixture({ parentId: async () => { throw new ReminderHttpError(401, 'Sign in'); } }); await f.handlers.read(f.req, f.res); assert.equal(f.res.code, 401); assert.equal(f.events.length, 0); });
test('child without parent authority is rejected', async () => { const f = fixture({ parentId: async () => { throw new ReminderHttpError(403, 'Parent required'); } }); await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 403); assert.equal(f.events.length, 0); });
test('save confirms password before persisting', async () => { const f = fixture(); await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 200); assert.deepEqual(f.events.map(e => e[0]), ['attempt', 'verify', 'save']); assert.equal(f.events[2][1], 'parent-A'); assert.doesNotMatch(JSON.stringify(f.res.body), /parent-secret/); });
test('wrong password never saves', async () => { const f = fixture(); f.req.body.password = 'wrong'; await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 403); assert.ok(!f.events.some(e => e[0] === 'save')); });
test('missing password never saves', async () => { const f = fixture(); delete f.req.body.password; await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 400); assert.equal(f.events.length, 0); });
test('rate limit prevents password verification and saving', async () => { const f = fixture({ reservePasswordAttempt: async () => false }); await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 429); assert.equal(f.events.length, 0); });
test('spoofed parent ID in body is rejected', async () => { const f = fixture(); f.req.body.userId = 'parent-B'; await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 400); assert.equal(f.events.length, 0); });
test('invalid preferences rejected before password check', async () => { const f = fixture(); f.req.body.preferences.maxPerDay = 500; await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 400); assert.equal(f.events.length, 0); });
test('simple cross-site form request rejected', async () => { const f = fixture(); f.req.headers = { 'content-type': 'application/x-www-form-urlencoded' }; await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 403); assert.equal(f.events.length, 0); });
test('missing custom header rejected', async () => { const f = fixture(); delete f.req.headers['x-sodafom-reminders']; await f.handlers.due(f.req, f.res); assert.equal(f.res.code, 403); assert.equal(f.events.length, 0); });
test('due takes account from session, never supplied body', async () => { const f = fixture(); f.req.body = { userId: 'parent-B' }; await f.handlers.due(f.req, f.res); assert.deepEqual(f.events, [['claim', 'parent-A']]); assert.deepEqual(f.res.body, { notification: null }); });
test('database write failure does not report success or expose internals', async () => { const f = fixture({ save: async () => { throw new Error('sensitive-db-details'); } }); await f.handlers.save(f.req, f.res); assert.equal(f.res.code, 503); assert.doesNotMatch(JSON.stringify(f.res.body), /sensitive|parent-secret/); });
test('claim storage failure returns no notification', async () => { const f = fixture({ claim: async () => { throw new Error('offline'); } }); await f.handlers.due(f.req, f.res); assert.equal(f.res.code, 503); assert.equal(f.res.body.notification, undefined); });
