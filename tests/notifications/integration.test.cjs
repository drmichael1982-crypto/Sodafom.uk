const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./load.cjs');
const policy = loader()('src/lib/reminder-policy.ts');
const errors = loader()('src/server/notifications/reminder-handlers.ts');
const sql = (strings, ...values) => ({ text: strings.join('?'), values });
const response = () => ({ code: 200, body: null, status(n) { this.code = n; return this; }, json(b) { this.body = b; return this; }, setHeader() {} });
const request = () => ({ headers: { 'content-type': 'application/json', 'x-sodafom-reminders': '1' }, query: {}, body: {} });
function authFixture(user = { id: 'parent-A' }, children = [{ id: 1 }]) {
  const queries = [];
  const load = loader({
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => user ? { user } : null, verifyPassword: async input => ({ status: input.body.password === 'correct' }) } }) },
    '../db/client': { db: { execute: async q => { queries.push(q); return [children]; } } },
    'drizzle-orm': { sql },
    './reminder-store': { readReminderPreferences: async () => policy.defaultReminderPreferences(), saveReminderPreferences: async () => {}, reserveReminderPasswordAttempt: async () => true, claimReminder: async () => null },
  });
  return { api: load('src/server/notifications/reminder-api.ts'), queries };
}
test('real adapter rejects absent session', async () => { const f = authFixture(null); await assert.rejects(f.api.reminderParentId(request()), /Sign in/); assert.equal(f.queries.length, 0); });
for (const role of ['child', 'student', 'pupil']) test(`real adapter rejects ${role} role`, async () => { const f = authFixture({ id: 'X', role }); await assert.rejects(f.api.reminderParentId(request()), /parent account/i); assert.equal(f.queries.length, 0); });
test('real adapter requires an owned child profile', async () => { const f = authFixture({ id: 'A' }, []); await assert.rejects(f.api.reminderParentId(request()), /child profile/); });
test('real adapter scopes ownership query to session, not body', async () => { const f = authFixture(); const req = request(); req.body.userId = 'parent-B'; assert.equal(await f.api.reminderParentId(req), 'parent-A'); assert.deepEqual(f.queries[0].values, ['parent-A']); });
test('real adapter password verification is invoked with parent password', async () => { const f = authFixture(), req = request(), res = response(); req.body = { password: 'correct', preferences: policy.defaultReminderPreferences() }; await f.api.reminderHandlers.save(req, res); assert.equal(res.code, 200); });
function routeFixture() {
  const calls = [];
  const load = loader({
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => ({ user: { id: 'A' } }) } }) },
    '../../../notifications/reminder-api': { reminderHandlers: Object.fromEntries(['read', 'save', 'due'].map(k => [k, async (_req, res) => { calls.push(k); return res.json({ action: k }); }])) },
    '../../../notifications/reminder-handlers': errors,
  });
  return { handler: load('src/server/api/notifications/read/POST.ts').default, calls };
}
for (const [query, expected] of [['preferences', 'read'], ['save', 'save'], ['due', 'due']]) test(`registered endpoint dispatches ${query}`, async () => { const f = routeFixture(), req = request(), res = response(); req.query.reminders = query; await f.handler(req, res); assert.deepEqual(f.calls, [expected]); });
test('registered endpoint preserves existing mark-read behavior', async () => { const f = routeFixture(), res = response(); await f.handler(request(), res); assert.equal(res.body.ok, true); assert.equal(f.calls.length, 0); });
test('registered endpoint rejects unknown reminder action', async () => { const f = routeFixture(), req = request(), res = response(); req.query.reminders = 'broadcast'; await f.handler(req, res); assert.equal(res.code, 400); assert.equal(f.calls.length, 0); });
test('registered endpoint rejects cross-site form for reminder reads too', async () => { const f = routeFixture(), req = request(), res = response(); req.query.reminders = 'preferences'; req.headers = {}; await f.handler(req, res); assert.equal(res.code, 403); assert.equal(f.calls.length, 0); });
function pushFixture({ admin = true, due = true, status = null, host = 'fcm.googleapis.com' } = {}) {
  const sent = [], queries = [];
  const load = loader({
    'web-push': { setVapidDetails() {}, async sendNotification(...args) { sent.push(args); if (status) throw { statusCode: status }; } },
    '../../../db/client.js': { db: { execute: async q => { queries.push(q); return [[{ endpoint: `https://${host}/example`, p256dh: 'public', auth_key: 'private-test-only' }]]; } } },
    'drizzle-orm': { sql },
    '../../../push-keys.js': { getOrCreateVapidKeys: async () => ({ publicKey: 'test', privateKey: 'test' }) },
    '@/server/admin-auth': { hasAdminAccess: async () => admin },
    '../../../notifications/reminder-store': { claimReminder: async () => due ? { message: policy.REMINDER_COPY.lessons } : null },
  });
  return { handler: load('src/server/api/push/send/POST.ts').default, sent, queries };
}
test('push retains existing admin check', async () => { const f = pushFixture({ admin: false }), req = request(), res = response(); req.body.userId = 'A'; await f.handler(req, res); assert.equal(res.code, 403); assert.equal(f.queries.length, 0); assert.equal(f.sent.length, 0); });
test('push rejects broadcasts', async () => { const f = pushFixture(), res = response(); await f.handler(request(), res); assert.equal(res.code, 400); assert.equal(f.sent.length, 0); });
test('push cannot bypass disabled or not-due preferences', async () => { const f = pushFixture({ due: false }), req = request(), res = response(); req.body.userId = 'A'; await f.handler(req, res); assert.equal(res.body.sent, 0); assert.equal(f.sent.length, 0); });
test('push ignores arbitrary copy/links and sends one low-priority short-lived reminder', async () => { const f = pushFixture(), req = request(), res = response(); req.body = { userId: 'A', title: 'Buy now', body: 'Lose your streak', url: 'https://untrusted.example' }; await f.handler(req, res); assert.equal(f.sent.length, 1); const payload = JSON.parse(f.sent[0][1]); assert.equal(payload.body, policy.REMINDER_COPY.lessons); assert.equal(payload.url, '/hub/notifications'); assert.equal(payload.silent, true); assert.deepEqual(f.sent[0][2], { TTL: 60, urgency: 'low' }); });
test('push rejects arbitrary legacy endpoint hosts', async () => { const f = pushFixture({ host: '127.0.0.1' }), req = request(), res = response(); req.body.userId = 'A'; await f.handler(req, res); assert.equal(f.sent.length, 0); });
test('expired push subscription is removed without retry', async () => { const f = pushFixture({ status: 410 }), req = request(), res = response(); req.body.userId = 'A'; await f.handler(req, res); assert.equal(res.body.failed, 1); assert.equal(f.sent.length, 1); assert.ok(f.queries.some(q => q.text.includes('DELETE'))); });
