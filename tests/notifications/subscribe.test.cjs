const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./load.cjs');
const errors = loader()('src/server/notifications/reminder-handlers.ts');
const p = loader()('src/lib/reminder-policy.ts');
function fixture({ signedIn = true, valid = true, allowed = true, enabled = true, owner = null } = {}) {
  const prefs = p.defaultReminderPreferences(); prefs.rules.reading.enabled = enabled;
  const writes = [];
  const db = { execute: async q => {
    if (q.text.includes('SELECT')) return [owner === null ? [] : [{ user_id: owner }]];
    writes.push(q); return [{ affectedRows: 1 }];
  } };
  const load = loader({
    '@/lib/auth/auth': { getAuth: () => ({ api: { verifyPassword: async () => ({ status: valid }) } }) },
    '../../../db/client.js': { db },
    'drizzle-orm': { sql: (parts, ...values) => ({ text: parts.join('?'), values }) },
    '../../../notifications/reminder-api': { reminderParentId: async () => { if (!signedIn) throw new errors.ReminderHttpError(401, 'Sign in'); return 'A'; } },
    '../../../notifications/reminder-store': { readReminderPreferences: async () => prefs, reserveReminderPasswordAttempt: async () => allowed },
    '../../../notifications/reminder-handlers': errors,
  });
  const req = { headers: { 'content-type': 'application/json', 'x-sodafom-reminders': '1' }, body: { password: 'example-parent-password', subscription: { endpoint: 'https://fcm.googleapis.com/example', keys: { p256dh: 'A'.repeat(87), auth: 'A'.repeat(22) } } } };
  const res = { code: 200, body: null, setHeader() {}, status(n) { this.code = n; return this; }, json(body) { this.body = body; return this; } };
  return { handler: load('src/server/api/push/subscribe/POST.ts').default, req, res, writes };
}
test('anonymous push subscription cannot be saved', async () => { const f = fixture({ signedIn: false }); await f.handler(f.req, f.res); assert.equal(f.res.code, 401); assert.equal(f.writes.length, 0); });
test('push opt-in requires parent reauthentication', async () => { const f = fixture({ valid: false }); await f.handler(f.req, f.res); assert.equal(f.res.code, 403); assert.equal(f.writes.length, 0); });
test('push opt-in respects password attempt rate limit', async () => { const f = fixture({ allowed: false }); await f.handler(f.req, f.res); assert.equal(f.res.code, 429); assert.equal(f.writes.length, 0); });
test('push opt-in respects parent all-off choices', async () => { const f = fixture({ enabled: false }); await f.handler(f.req, f.res); assert.equal(f.res.code, 409); assert.equal(f.writes.length, 0); });
test('push opt-in rejects missing confirmation header', async () => { const f = fixture(); delete f.req.headers['x-sodafom-reminders']; await f.handler(f.req, f.res); assert.equal(f.res.code, 403); assert.equal(f.writes.length, 0); });
test('push opt-in rejects untrusted destination', async () => { const f = fixture(); f.req.body.subscription.endpoint = 'https://127.0.0.1/private'; await f.handler(f.req, f.res); assert.equal(f.res.code, 400); assert.equal(f.writes.length, 0); });
test('push opt-in rejects embedded credentials', async () => { const f = fixture(); f.req.body.subscription.endpoint = 'https://user:password@fcm.googleapis.com/example'; await f.handler(f.req, f.res); assert.equal(f.res.code, 400); });
test('push opt-in rejects malformed keys', async () => { const f = fixture(); f.req.body.subscription.keys.auth = ''; await f.handler(f.req, f.res); assert.equal(f.res.code, 400); });
test('push subscription cannot be reassigned across accounts', async () => { const f = fixture({ owner: 'B' }); await f.handler(f.req, f.res); assert.equal(f.res.code, 409); assert.equal(f.writes.length, 0); });
test('verified parent can save subscription without persisting password', async () => { const f = fixture(); await f.handler(f.req, f.res); assert.equal(f.res.code, 200); assert.equal(f.writes.length, 1); assert.doesNotMatch(JSON.stringify(f.writes), /example-parent-password/); });
