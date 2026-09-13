import test from 'node:test';
import assert from 'node:assert/strict';
import { positiveId, normaliseAgeGroup, validateSchoolDraft, parseSchoolRecord, validMarks, summariseProgress, localMarkSuggestion, buildSchoolReport, recordMark, validSchoolPhoto, validSchoolRequestId } from '../../../lib/teacher-progress.ts';
const requestId = '12345678-1234-4234-8234-123456789abc';
const draft = (changes = {}) => ({ kind: 'homework', subject: 'maths', title: 'Number practice', status: 'needs_review', score: null, maxScore: null, comment: '', photoReviewed: false, ...changes });
const record = (changes = {}) => ({ ...draft(), id: 'test:1', recordedAt: null, source: 'teacher', ...changes });
const stored = (changes = {}) => ({ requestId, ...draft(), version: 1, revision: 1, teacherId: 1, reviewedAt: null, ...changes });
test('IDs reject partial, unsafe, zero, negative and array values', () => {
  assert.equal(positiveId('11'), 11);
  for (const v of ['11oops', 0, -1, 1.2, '01', ['11'], Number.MAX_SAFE_INTEGER + 1, null, {}]) assert.equal(positiveId(v), null);
});
test('Age groups accept the old UI dash without silently changing age', () => {
  for (const [from, to] of [['5–7', '5-7'], ['8—10', '8-10'], ['11-13', '11-13']]) assert.equal(normaliseAgeGroup(from), to);
  assert.equal(normaliseAgeGroup('18-20'), null);
});
test('Pending work has no numeric mark', () => assert.deepEqual(validateSchoolDraft(draft()), draft()));
test('Pending work cannot carry guessed marks', () => assert.throws(() => validateSchoolDraft(draft({ score: 1, maxScore: 1 }))));
test('Unscored, reviewed reading is valid and remains separate from English', () => {
  const r = draft({ kind: 'reading', subject: 'reading', status: 'reviewed' });
  assert.deepEqual(validateSchoolDraft(r), r);
});
test('Zero is a valid awarded mark', () => assert.equal(validateSchoolDraft(draft({ status: 'reviewed', score: 0, maxScore: 10 })).score, 0));
for (const [label, patch] of Object.entries({
  'negative score': { score: -1, maxScore: 10 }, 'overscore': { score: 11, maxScore: 10 },
  'zero maximum': { score: 0, maxScore: 0 }, 'fractional mark': { score: 1.5, maxScore: 10 },
  'string mark': { score: '1', maxScore: 10 }, 'infinite maximum': { score: 1, maxScore: Infinity },
  'huge maximum': { score: 1, maxScore: 10001 }, 'half-missing mark': { score: 0, maxScore: null },
})) test(`Rejects ${label}`, () => assert.throws(() => validateSchoolDraft(draft({ status: 'reviewed', ...patch }))));
test('Rejects unsupported work kinds, statuses, subjects and malformed input', () => {
  for (const r of [null, [], draft({ kind: 'game' }), draft({ status: 'ai-approved' }), draft({ subject: '__proto__' }), draft({ title: {} }), draft({ title: '' }), draft({ photoReviewed: 'yes' }), draft({ comment: 'a'.repeat(3001) })]) assert.throws(() => validateSchoolDraft(r));
});
test('Allow-list removes photograph bytes, filenames and forged author metadata', () => {
  const parsed = validateSchoolDraft({ ...draft(), image: 'data:image/png;base64,PRIVATE', filename: 'pupil-name.png', teacherId: 999 });
  assert.equal('image' in parsed, false); assert.equal('filename' in parsed, false); assert.equal('teacherId' in parsed, false);
});
test('Versioned notes round-trip safely', () => assert.deepEqual(parseSchoolRecord(JSON.stringify(stored())), stored()));
test('Corrupt, unknown-version and unverified dated records are rejected', () => {
  for (const v of ['broken', 'null', JSON.stringify(stored({ version: 2 })), JSON.stringify(stored({ revision: 0 })), JSON.stringify(stored({ status: 'reviewed', reviewedAt: 'bad-date' })), JSON.stringify(stored({ reviewedAt: new Date().toISOString() }))]) assert.equal(parseSchoolRecord(v), null);
});
test('Request IDs accept only canonical UUID-shaped version-four keys', () => {
  assert.equal(validSchoolRequestId(requestId), true);
  for (const id of ['', '%', 'bad-id', null, {}]) assert.equal(validSchoolRequestId(id), false);
});
test('Empty summaries are unscored, not zero', () => {
  const s = summariseProgress([]); assert.equal(s.percent, null); assert.equal(s.count, 0);
  assert.deepEqual(Object.keys(s.byKind), ['lesson', 'game', 'homework', 'reading']);
});
test('8/10 and 5/5 aggregate to 13/15, not raw marks presented as percentages', () => {
  const s = summariseProgress([record({ status: 'reviewed', score: 8, maxScore: 10 }), record({ kind: 'lesson', status: 'reviewed', score: 5, maxScore: 5 })]);
  assert.equal(s.percent, 86.7); assert.equal(s.bySubject.maths.percent, 86.7); assert.equal(s.byKind.homework.percent, 80);
});
test('Pending and unscored work do not lower reviewed scores', () => {
  const s = summariseProgress([record(), record({ kind: 'reading', status: 'reviewed' }), record({ status: 'reviewed', score: 8, maxScore: 10 })]);
  assert.equal(s.percent, 80); assert.equal(s.count, 3); assert.equal(s.scoredCount, 1); assert.equal(s.needsReview, 1);
});
test('A real zero score is not confused with unscored work', () => assert.equal(summariseProgress([record({ status: 'reviewed', score: 0, maxScore: 10 })]).percent, 0));
test('Invalid legacy scores cannot distort aggregates', () => {
  assert.equal(validMarks('8', 10), false); assert.equal(validMarks(Infinity, 10), false);
  assert.equal(summariseProgress([record({ status: 'reviewed', score: 100, maxScore: 10 })]).percent, null);
});
test('Legacy subject names cannot mutate the summary object prototype', () => {
  const s = summariseProgress([record({ subject: '__proto__', status: 'reviewed', score: 1, maxScore: 2 })]);
  assert.equal(s.bySubject.__proto__.percent, 50); assert.equal(Object.getPrototypeOf(s.bySubject), null);
});
test('Photo text is not marked until its transcription is verified', () => assert.equal(localMarkSuggestion('2', '2', false).suggestedScore, null));
test('Local exact matches suggest marks but explicitly require teacher confirmation', () => {
  const s = localMarkSuggestion('cat', 'cat', true); assert.equal(s.suggestedScore, 1); assert.match(s.message, /Confirm/);
});
test('Numeric checks handle simple equality and differences', () => {
  assert.equal(localMarkSuggestion('2.0', '2', true).suggestedScore, 1);
  assert.equal(localMarkSuggestion('3', '2', true).suggestedScore, 0);
});
test('Ambiguous writing, units, fractions and missing answers are never guessed', () => {
  for (const [a, b] of [['half', '1/2'], ['1/2', '0.5'], ['1 m', '100 cm'], ['colour', 'color'], ['CAT', 'cat'], ['', '2'], ['2+2', '4']]) assert.equal(localMarkSuggestion(a, b, true).suggestedScore, null);
});
test('Pending status remains visible instead of exposing a mark', () => assert.equal(recordMark(record()), 'Needs teacher review'));
test('Photo checks accept a matching JPEG signature', () => assert.equal(validSchoolPhoto('image/jpeg', 100, Uint8Array.from([255, 216, 255])), true));
test('Photo checks reject SVG, fake MIME types, empty and oversized files', () => {
  for (const [mime, size, bytes] of [['image/svg+xml', 10, [60, 115]], ['image/png', 100, [255, 216, 255]], ['image/jpeg', 0, [255, 216, 255]], ['image/jpeg', 5 * 1024 * 1024 + 1, [255, 216, 255]]]) assert.equal(validSchoolPhoto(mime, size, Uint8Array.from(bytes)), false);
});
test('Photo checks recognise PNG and WebP signatures', () => {
  assert.equal(validSchoolPhoto('image/png', 100, Uint8Array.from([137,80,78,71,13,10,26,10])), true);
  assert.equal(validSchoolPhoto('image/webp', 100, Uint8Array.from([82,73,70,70,0,0,0,0,87,69,66,80])), true);
});
test('Private reports disclose limits, comments and pending work but omit sign-in codes', () => {
  const report = buildSchoolReport({ name: 'Pupil A', ageGroup: '8-10', studentCode: 'DO-NOT-EXPORT' }, [record({ title: 'Work A', comment: 'Check the second line.' })], ['Practice reading aloud.'], { limitPerSource: 500, gamesTruncated: true, notesTruncated: false, unreadableRecords: 1 });
  assert.match(report, /not a lifetime total/); assert.match(report, /Needs teacher review/); assert.match(report, /Check the second line/);
  assert.match(report, /Practice reading aloud/); assert.match(report, /Unreadable saved records: 1/); assert.doesNotMatch(report, /DO-NOT-EXPORT/);
});
