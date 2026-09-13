const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./load.cjs');
const p = loader()('src/lib/reminder-policy.ts');
const at = value => new Date(`2026-09-14T${value}:00Z`); // Monday; UTC configured in fixture
function prefs() { const s = p.defaultReminderPreferences(); s.timeZone = 'UTC'; s.rules.lessons.enabled = true; return s; }
const empty = p.emptyReminderLedger;
test('all five categories default off and have independent objects', () => {
  const a = p.defaultReminderPreferences(), b = p.defaultReminderPreferences();
  assert.equal(p.REMINDER_TYPES.length, 5);
  assert.ok(Object.values(a.rules).every(r => !r.enabled));
  a.rules.lessons.enabled = true; a.rules.lessons.days.push(0);
  assert.equal(b.rules.lessons.enabled, false); assert.equal(b.rules.lessons.days.length, 5);
});
test('all-off never delivers', () => assert.equal(p.planReminder(p.defaultReminderPreferences(), empty(), at('15:00')), null));
test('due lesson appears at selected time', () => assert.deepEqual(p.planReminder(prefs(), empty(), at('16:00')).notification.types, ['lessons']));
test('not early', () => assert.equal(p.planReminder(prefs(), empty(), at('15:59')), null));
test('within grace window', () => assert.ok(p.planReminder(prefs(), empty(), at('16:09'))));
test('no catch-up at ten minute boundary', () => assert.equal(p.planReminder(prefs(), empty(), at('16:10')), null));
test('missed day has no backlog', () => assert.equal(p.planReminder(prefs(), empty(), new Date('2026-09-15T09:00Z')), null));
test('selected weekdays only', () => assert.equal(p.planReminder(prefs(), empty(), new Date('2026-09-13T16:00Z')), null));
test('same-time categories bundle into one event', () => {
  const s = prefs(); s.rules.homework.enabled = true; s.rules.daily.enabled = true;
  const result = p.planReminder(s, empty(), at('16:00'));
  assert.equal(result.nextLedger.deliveries.length, 1);
  assert.deepEqual(result.notification.types, ['lessons', 'homework', 'daily']);
});
test('repeated request does not repeat reminder', () => {
  const s = prefs(), first = p.planReminder(s, empty(), at('16:00'));
  assert.equal(p.planReminder(s, first.nextLedger, at('16:01')), null);
});
test('minimum one hour between different types', () => {
  const s = prefs(); s.rules.reading = { enabled: true, time: '16:30', days: [1] };
  const first = p.planReminder(s, empty(), at('16:00'));
  assert.equal(p.planReminder(s, first.nextLedger, at('16:30')), null);
});
test('exactly one hour permits second different type', () => {
  const s = prefs(); s.rules.reading = { enabled: true, time: '17:00', days: [1] };
  const first = p.planReminder(s, empty(), at('16:00'));
  assert.ok(p.planReminder(s, first.nextLedger, at('17:00')));
});
test('maximum two across all categories', () => {
  const s = prefs(); s.rules.reading.enabled = true; s.rules.homework = { enabled: true, time: '19:00', days: [1] };
  const one = p.planReminder(s, empty(), at('16:00'));
  const two = p.planReminder(s, one.nextLedger, at('18:00'));
  assert.equal(p.planReminder(s, two.nextLedger, at('19:00')), null);
});
test('parent can reduce limit to one', () => {
  const s = prefs(); s.maxPerDay = 1; s.rules.reading.enabled = true;
  assert.equal(p.planReminder(s, p.planReminder(s, empty(), at('16:00')).nextLedger, at('18:00')), null);
});
test('24-hour cap spans midnight', () => {
  const s = prefs(); s.maxPerDay = 1;
  const one = p.planReminder(s, empty(), at('16:00'));
  s.rules.lessons.time = '08:00';
  assert.equal(p.planReminder(s, one.nextLedger, new Date('2026-09-15T08:00Z')), null);
});
test('rescheduling same type does not repeat it that day', () => {
  const s = prefs(); const one = p.planReminder(s, empty(), at('16:00'));
  s.rules.lessons.time = '18:00'; assert.equal(p.planReminder(s, one.nextLedger, at('18:00')), null);
});
test('off/on preserves deduplication', () => {
  const s = prefs(); const one = p.planReminder(s, empty(), at('16:00'));
  s.rules.lessons.enabled = false; assert.equal(p.planReminder(s, one.nextLedger, at('16:01')), null);
  s.rules.lessons.enabled = true; assert.equal(p.planReminder(s, one.nextLedger, at('16:02')), null);
});
test('parent quiet period suppresses delivery crossing boundary', () => {
  const s = prefs(); s.quietStart = '16:05';
  assert.equal(p.planReminder(s, empty(), at('16:05')), null);
});
test('hard bedtime suppresses a late grace window', () => {
  const s = prefs(); s.rules.lessons.time = '19:59';
  assert.equal(p.planReminder(s, empty(), at('20:00')), null);
});
test('quiet periods crossing midnight', () => { assert.ok(p.isQuiet(60, '20:00', '08:00')); assert.ok(!p.isQuiet(960, '20:00', '08:00')); });
test('daytime quiet periods', () => { assert.ok(p.isQuiet(720, '11:00', '13:00')); assert.ok(!p.isQuiet(780, '11:00', '13:00')); });
test('UK summer time follows local clock', () => { const s = prefs(); s.timeZone = 'Europe/London'; assert.ok(p.planReminder(s, empty(), at('15:00'))); });
test('UK winter time follows local clock', () => { const s = prefs(); s.timeZone = 'Europe/London'; assert.ok(p.planReminder(s, empty(), new Date('2026-11-02T16:00Z'))); });
test('DST transition produces correct local time', () => {
  assert.equal(p.localReminderTime(new Date('2026-10-25T01:30Z'), 'Europe/London').minute, 90);
  assert.equal(p.localReminderTime(new Date('2026-03-29T01:30Z'), 'Europe/London').minute, 150);
});
test('achievement requires a real fresh source event', () => {
  const s = prefs(); s.rules.lessons.enabled = false; s.rules.achievements.enabled = true;
  assert.equal(p.planReminder(s, empty(), at('16:00')), null);
  const one = p.planReminder(s, empty(), at('16:00'), 'award-1'); assert.ok(one);
  assert.equal(p.planReminder(s, one.nextLedger, new Date('2026-09-15T16:01Z'), 'award-1'), null);
  assert.ok(p.planReminder(s, one.nextLedger, new Date('2026-09-15T16:01Z'), 'award-2'));
});
test('future delivery timestamps fail closed', () => {
  const s = prefs(), one = p.planReminder(s, empty(), at('16:00'));
  assert.equal(p.planReminder(s, one.nextLedger, at('15:00')), null);
});
test('invalid clock does not send', () => assert.equal(p.planReminder(prefs(), empty(), new Date(NaN)), null));
for (const [name, mutate] of [
  ['unknown version', s => s.version = 2], ['unknown field', s => s.marketing = true],
  ['invalid timezone', s => s.timeZone = 'Unknown/Foo'], ['invalid limit', s => s.maxPerDay = 50],
  ['equal quiet start/end', s => s.quietEnd = s.quietStart], ['quiet invalid format', s => s.quietStart = '24:00'],
  ['invalid reminder time', s => s.rules.lessons.time = '99:99'], ['night reminder', s => s.rules.lessons.time = '22:00'],
  ['early morning reminder', s => s.rules.lessons.time = '06:59'], ['no selected days', s => s.rules.lessons.days = []],
  ['duplicate days', s => s.rules.lessons.days = [1, 1]], ['invalid day', s => s.rules.lessons.days = [8]],
  ['string boolean', s => s.rules.lessons.enabled = 'false'], ['quiet schedule', s => s.rules.lessons.time = '07:30'],
  ['unknown reminder type', s => s.rules.marketing = s.rules.lessons], ['missing type', s => delete s.rules.homework],
]) test(`rejects ${name}`, () => { const s = prefs(); mutate(s); assert.throws(() => p.parseReminderPreferences(s)); });
test('corrupt ledger fails closed', () => assert.throws(() => p.planReminder(prefs(), { deliveries: 'bad' }, at('16:00'))));
test('copy contains no guilt, threats, streak losses or adverts', () => {
  for (const copy of Object.values(p.REMINDER_COPY)) assert.doesNotMatch(copy, /lose|streak|hurry|buy|sale|miss out|punish|behind|must/i);
});
