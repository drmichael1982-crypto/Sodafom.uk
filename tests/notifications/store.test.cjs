const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./load.cjs');
const p = loader()('src/lib/reminder-policy.ts');
function fixture() {
  let data = new Map(), tail = Promise.resolve();
  const queries = [], controls = { failDeliveryWrite: false, failSchema: false, failAwards: false, award: null };
  const sql = (strings, ...values) => ({ text: strings.join('?').replace(/\s+/g, ' ').trim(), values });
  async function execute(q) {
    queries.push(q);
    const v = q.values;
    if (q.text.startsWith('CREATE TABLE')) { if (controls.failSchema) throw new Error('schema unavailable'); return [{ affectedRows: 0 }]; }
    if (q.text.startsWith('INSERT INTO')) {
      if (!data.has(v[0])) data.set(v[0], { preferences_json: v[1], delivery_json: v[2], password_window: 0, password_attempts: 0 });
      return [{ affectedRows: 1 }];
    }
    if (q.text.startsWith('SELECT b.child_id')) {
      if (controls.failAwards) throw new Error('awards unavailable');
      return [controls.award ? [controls.award] : []];
    }
    if (q.text.startsWith('SELECT')) { const row = data.get(v[0]); return [row ? [{ ...row }] : []]; }
    if (q.text.startsWith('UPDATE')) {
      const id = v.at(-1), row = data.get(id); if (!row) return [{ affectedRows: 0 }];
      if (q.text.includes('SET password_window')) { row.password_window = v[0]; row.password_attempts = v[1]; }
      if (q.text.includes('SET preferences_json')) row.preferences_json = v[0];
      if (q.text.includes('SET delivery_json')) { if (controls.failDeliveryWrite) throw new Error('write failed'); row.delivery_json = v[0]; }
      return [{ affectedRows: 1 }];
    }
    throw new Error(`Unexpected SQL ${q.text}`);
  }
  const db = {
    execute,
    transaction(fn) {
      const work = tail.then(async () => {
        const before = structuredClone(data);
        try { return await fn({ execute }); } catch (error) { data = before; throw error; }
      });
      tail = work.catch(() => {}); return work;
    },
  };
  const fresh = () => loader({ 'drizzle-orm': { sql }, '../db/client': { db } })('src/server/notifications/reminder-store.ts');
  const store = fresh();
  function seed(id = 'A', settings = p.defaultReminderPreferences(), ledger = p.emptyReminderLedger()) {
    data.set(id, { preferences_json: JSON.stringify(settings), delivery_json: JSON.stringify(ledger), password_window: 0, password_attempts: 0 });
  }
  const settings = p.defaultReminderPreferences(); settings.timeZone = 'UTC'; settings.rules.lessons.enabled = true;
  return { store, fresh, controls, queries, seed, settings, get: id => data.get(id) };
}
const now = new Date('2026-09-14T16:00Z');
test('missing row reads defaults and does not opt in', async () => { const f = fixture(); assert.ok(Object.values((await f.store.readReminderPreferences('A')).rules).every(r => !r.enabled)); assert.equal(await f.store.claimReminder('A', now), null); });
test('schema failure never pretends to save', async () => { const f = fixture(); f.controls.failSchema = true; await assert.rejects(f.store.readReminderPreferences('A')); });
test('corrupt saved preferences fail closed', async () => { const f = fixture(); f.seed(); f.get('A').preferences_json = '{bad'; await assert.rejects(f.store.claimReminder('A', now)); });
test('corrupt saved ledger fails closed', async () => { const f = fixture(); f.seed('A', f.settings); f.get('A').delivery_json = 'null'; await assert.rejects(f.store.claimReminder('A', now)); });
test('two concurrent claims produce exactly one reminder', async () => { const f = fixture(); f.seed('A', f.settings); const results = await Promise.all([f.store.claimReminder('A', now), f.store.claimReminder('A', now)]); assert.equal(results.filter(Boolean).length, 1); assert.equal(JSON.parse(f.get('A').delivery_json).deliveries.length, 1); assert.ok(f.queries.some(q => q.text.endsWith('FOR UPDATE'))); });
test('ledger works across separate service instances', async () => { const f = fixture(); f.seed('A', f.settings); const other = f.fresh(); const results = await Promise.all([f.store.claimReminder('A', now), other.claimReminder('A', now)]); assert.equal(results.filter(Boolean).length, 1); });
test('write failure returns no reminder and rolls back', async () => { const f = fixture(); f.seed('A', f.settings); f.controls.failDeliveryWrite = true; await assert.rejects(f.store.claimReminder('A', now)); assert.equal(JSON.parse(f.get('A').delivery_json).deliveries.length, 0); });
test('editing settings preserves delivery history', async () => { const f = fixture(); f.seed('A', f.settings); await f.store.claimReminder('A', now); const ledger = f.get('A').delivery_json; const changed = { ...f.settings, maxPerDay: 1 }; await f.store.saveReminderPreferences('A', changed); assert.equal(f.get('A').delivery_json, ledger); assert.equal((await f.store.readReminderPreferences('A')).maxPerDay, 1); });
test('parent data isolated by authenticated ID', async () => { const f = fixture(); f.seed('A', f.settings); f.seed('B'); assert.equal(await f.store.claimReminder('B', now), null); assert.ok(await f.store.claimReminder('A', now)); assert.equal(JSON.parse(f.get('B').delivery_json).deliveries.length, 0); });
test('unavailable achievements do not invent awards', async () => { const f = fixture(); f.settings.rules.lessons.enabled = false; f.settings.rules.achievements.enabled = true; f.seed('A', f.settings); f.controls.failAwards = true; assert.equal(await f.store.claimReminder('A', now), null); });
test('unavailable achievements do not stop other reminders', async () => { const f = fixture(); f.settings.rules.achievements.enabled = true; f.seed('A', f.settings); f.controls.failAwards = true; assert.deepEqual((await f.store.claimReminder('A', now)).types, ['lessons']); });
test('fresh actual badge enables achievement reminder', async () => { const f = fixture(); f.settings.rules.lessons.enabled = false; f.settings.rules.achievements.enabled = true; f.seed('A', f.settings); f.controls.award = { child_id: 1, badge_id: 'reader', awarded_at: '2026-09-14T15:00Z' }; assert.deepEqual((await f.store.claimReminder('A', now)).types, ['achievements']); });
test('parallel password attempts enforce five per ten minutes', async () => { const f = fixture(); const results = await Promise.all(Array.from({ length: 12 }, () => f.store.reserveReminderPasswordAttempt('A', +now))); assert.equal(results.filter(Boolean).length, 5); assert.equal(f.get('A').password_attempts, 5); assert.ok(Object.values(JSON.parse(f.get('A').preferences_json).rules).every(r => !r.enabled)); });
test('password attempt window resets after ten minutes', async () => { const f = fixture(); for (let i = 0; i < 5; i++) await f.store.reserveReminderPasswordAttempt('A', +now); assert.equal(await f.store.reserveReminderPasswordAttempt('A', +now + 599999), false); assert.equal(await f.store.reserveReminderPasswordAttempt('A', +now + 600000), true); });
test('missing verified row cannot be saved', async () => { const f = fixture(); await assert.rejects(f.store.saveReminderPreferences('A', f.settings)); });
