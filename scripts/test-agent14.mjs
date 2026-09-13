/** Run: node --test scripts/test-agent14.mjs
 * Executes the actual school modules. Database/ORM and password-provider calls are
 * mocked; these are unit/handler-contract tests, NOT a MySQL/browser integration test.
 * Uses the project's existing TypeScript dev dependency. No network or live data.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const token = 'a'.repeat(96);
const teacher = { id: 7, name: 'Test Teacher', email: 'teacher@example.test', className: 'Test Class', passwordHash: 'stored-hash', licenceId: null };
const pupil = { id: 12, teacherId: 7, name: 'Test Pupil', ageGroup: '5-7', studentCode: 'SODA-STUD-1234567890' };
function fixture() {
  const calls = [], queue = [], cache = new Map();
  const tables = new Proxy({}, { get: (_, table) => new Proxy({ name: table }, { get: (_, key) => `${String(table)}.${String(key)}` }) });
  const orm = Object.fromEntries(['eq', 'and', 'or', 'gt', 'desc'].map(op => [op, (...args) => ({ op, args })]));
  orm.sql = (strings, ...values) => ({ sql: strings.join('?'), values });
  function query(operation, table) {
    const call = { operation, table }; calls.push(call);
    const chain = {};
    for (const method of ['from', 'where', 'limit', 'orderBy', 'values', 'set']) chain[method] = (...args) => { call[method] = args; return chain; };
    chain.$returningId = () => chain;
    chain.then = (ok, fail) => {
      if (!queue.length) return Promise.reject(new Error(`Unexpected database call: ${operation}`)).then(ok, fail);
      const result = queue.shift();
      return (result instanceof Error ? Promise.reject(result) : Promise.resolve(result)).then(ok, fail);
    };
    return chain;
  }
  const db = Object.fromEntries(['select', 'insert', 'update', 'delete'].map(op => [op, table => query(op, table)]));
  const passwords = { hashTeacherPassword: async () => 'new-hash', verifyTeacherPassword: async () => ({ valid: true, needsUpgrade: false }) };
  const mocks = { '@/server/db/client': { db }, '@/server/db/schema': tables, 'drizzle-orm': orm, '@/server/teacher-password': passwords, '@/server/lib/game-recommendations': { getGameRecommendations: () => [] }, '@/lib/config': { API_PREFIX: '/api' } };
  function load(path) {
    const filename = resolve(root, path);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    const source = readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } });
    function localRequire(id) {
      if (id in mocks) return mocks[id];
      if (id.startsWith('node:')) return require(id);
      let file = id.startsWith('@/') ? resolve(root, 'src', id.slice(2)) : id.startsWith('.') ? resolve(dirname(filename), id) : null;
      if (!file) throw new Error(`Unmocked import: ${id}`);
      if (!existsSync(file)) file += existsSync(file + '.ts') ? '.ts' : '.tsx';
      return load(file);
    }
    new Function('exports', 'require', 'module', '__filename', '__dirname', output.outputText)(module.exports, localRequire, module, filename, dirname(filename));
    return module.exports;
  }
  function req(body = {}, id = '12') { return { body, params: { studentId: id }, headers: { authorization: `Bearer ${token}` }, ip: '127.0.0.1', socket: {} }; }
  function res() { return { statusCode: 200, headers: {}, body: null, status(n) { this.statusCode = n; return this; }, set(k, v) { this.headers[k] = v; return this; }, json(data) { this.body = data; return this; } }; }
  const authenticate = () => queue.push([{ teacherId: 7 }], [teacher]);
  return { load, queue, calls, req, res, authenticate, passwords };
}
const core = fixture().load('src/lib/teacher-school.ts');
const draft = (overrides = {}) => ({ kind: 'homework', title: 'Addition', subject: 'maths', source: 'handwriting', transcription: '2 + 2 = 4', comment: 'Teacher feedback', status: 'needs_review', ...overrides });
const activity = (score, maxScore, gameId = 'number-pop') => ({ id: 1, gameId, gameTitle: 'Test activity', subject: 'maths', score, maxScore, starsEarned: 0, durationSeconds: 60, playedAt: null });
for (const invalid of ['12junk', '-1', '0', '1.2', '', ['12'], 2147483648, null]) test(`strict pupil ID rejects ${JSON.stringify(invalid)}`, () => assert.throws(() => core.positiveId(invalid)));
test('positive pupil ID accepted', () => assert.equal(core.positiveId('12'), 12));
test('all existing age labels normalise without changing age', () => assert.deepEqual(['5–7', '8–10', '11—13'].map(core.ageGroupInput), ['5-7', '8-10', '11-13']));
test('unsupported age is rejected rather than silently changed', () => assert.throws(() => core.ageGroupInput('4-6')));
test('email normalisation and password whitespace are deliberate', () => { assert.equal(core.normaliseEmail(' Teacher@School.test '), 'teacher@school.test'); assert.equal(core.passwordInput(' password '), ' password '); });
test('new passwords require 12 characters and bounded length', () => { assert.throws(() => core.passwordInput('eight888', true)); assert.throws(() => core.passwordInput('x'.repeat(257), true)); });
test('valid zero mark is assessed, missing marks are not zero', () => { assert.equal(core.scorePercent(0, 10), 0); assert.equal(core.scorePercent(null, 10), null); });
for (const pair of [[1, 0], [-1, 10], [11, 10], ['5', 10], [NaN, 10], [1, Infinity]]) test(`invalid score pair excluded: ${String(pair)}`, () => assert.equal(core.scorePercent(...pair), null));
test('mixed denominators report 70 percent not raw 47.5 marks', () => assert.equal(core.summariseProgress([activity(5, 10), activity(90, 100)], []).byKind.game.averagePercent, 70));
test('all four categories exist in an empty report', () => { const p = core.summariseProgress([], []); assert.deepEqual(Object.keys(p.byKind), ['lesson', 'game', 'homework', 'reading']); assert.equal(p.byKind.reading.averagePercent, null); });
test('only explicit source prefixes reclassify existing game records', () => { assert.equal(core.activityKind('reading-quest', 'reading'), 'game'); assert.equal(core.activityKind('reading:book-1', 'reading'), 'reading'); assert.equal(core.activityKind('phonics-parrot', 'reading'), 'game'); assert.equal(core.activityKind('lesson:1', 'maths'), 'lesson'); });
test('pending review discards scores and has no reviewer attribution', () => { const r = core.validateReview(draft({ score: 5, maxScore: 10 }), 7); assert.equal(r.score, null); assert.equal(r.maxScore, null); assert.equal(r.reviewedBy, null); });
test('pending review cannot lower the subject average', () => { const r = { ...core.validateReview(draft(), 7), id: 3, createdAt: null }; const p = core.summariseProgress([activity(8, 10)], [r]); assert.equal(p.bySubject[0].averagePercent, 80); assert.equal(p.byKind.homework.pending, 1); assert.equal(p.byKind.homework.assessed, 0); });
test('published mark needs explicit teacher confirmation', () => assert.throws(() => core.validateReview(draft({ status: 'reviewed', score: 8, maxScore: 10 }), 7), /Confirm/));
test('confirmed mark preserves teacher and timestamp', () => { const r = core.validateReview(draft({ status: 'reviewed', score: 8, maxScore: 10, teacherConfirmed: true }), 7, 2, new Date('2026-09-13T00:00:00Z')); assert.equal(r.reviewedBy, 7); assert.equal(r.revision, 2); assert.equal(r.reviewedAt, '2026-09-13T00:00:00.000Z'); assert.deepEqual(core.decodeReview(core.encodeReview(r)), r); });
for (const key of ['kind', 'source', 'status']) test(`array-valued ${key} rejected`, () => { const d = draft(); d[key] = [d[key]]; assert.throws(() => core.validateReview(d, 7)); });
for (const key of ['image', 'imageUrl', 'fileName', 'base64', 'attachment']) test(`photo metadata field ${key} rejected`, () => assert.throws(() => core.validateReview(draft({ [key]: 'do not upload' }), 7)));
test('pasted image data rejected', () => assert.throws(() => core.validateReview(draft({ transcription: 'data:image/png;base64,AAAA' }), 7)));
test('corrupt stored review is not counted as an assessment', () => { assert.equal(core.decodeReview(core.REVIEW_PREFIX + '{bad'), null); assert.equal(core.decodeReview('ordinary teacher comment'), null); });
test('local arithmetic produces a provisional suggestion only', () => { assert.equal(core.localArithmeticCheck('2+2=4').suggestedScore, 1); assert.equal(core.localArithmeticCheck('2+2=5').suggestedScore, 0); assert.equal(core.localArithmeticCheck('2+2=4').status, 'suggestion'); });
test('ambiguous handwritten/transcribed answer is not guessed', () => { for (const text of ['2+?=4', 'essay text', '1/2+1/2=1', '2+2=4\n3+3=6']) assert.equal(core.localArithmeticCheck(text).status, 'needs_review'); });
test('CSV formula prefixes and quotes escaped', () => { assert.equal(core.csvCell(' =HYPERLINK("x")'), '"\' =HYPERLINK(""x"")"'); assert.equal(core.csvCell('normal, text'), '"normal, text"'); });
for (const path of ['students/GET.ts', 'students/POST.ts', 'students/[studentId]/GET.ts', 'students/[studentId]/notes/POST.ts']) test(`teacher authentication required by ${path}`, async () => { const f = fixture(), req = f.req(); req.headers = {}; const res = f.res(); await f.load('src/server/api/teacher/' + path).default(req, res); assert.equal(res.statusCode, 401); assert.equal(f.calls.length, 0); assert.match(res.headers['Cache-Control'], /no-store/); });
for (const path of ['students/[studentId]/GET.ts', 'students/[studentId]/notes/POST.ts']) test(`foreign pupil hidden by ${path}`, async () => { const f = fixture(); f.authenticate(); f.queue.push([]); const res = f.res(); await f.load('src/server/api/teacher/' + path).default(f.req(), res); assert.equal(res.statusCode, 404); assert.equal(f.calls.filter(c => c.operation !== 'select').length, 0); assert.match(JSON.stringify(f.calls[2].where), /students.teacherId/); assert.match(JSON.stringify(f.calls[2].where), /7/); });
test('pupil ID rejects trailing junk before pupil query', async () => { const f = fixture(); f.authenticate(); const res = f.res(); await f.load('src/server/api/teacher/students/[studentId]/GET.ts').default(f.req({}, '12x'), res); assert.equal(res.statusCode, 400); assert.equal(f.calls.length, 2); });
test('review save cannot publish unconfirmed mark', async () => { const f = fixture(); f.authenticate(); f.queue.push([pupil]); const res = f.res(); await f.load('src/server/api/teacher/students/[studentId]/notes/POST.ts').default(f.req({ action: 'saveReview', review: draft({ status: 'reviewed', score: 5, maxScore: 10 }) }), res); assert.equal(res.statusCode, 400); assert.equal(f.calls.length, 3); });
test('pending review is persisted with teacher ownership and null marks', async () => { const f = fixture(); f.authenticate(); f.queue.push([pupil], [{ id: 31 }]); const res = f.res(); await f.load('src/server/api/teacher/students/[studentId]/notes/POST.ts').default(f.req({ action: 'saveReview', review: draft({ score: 99 }) }), res); assert.equal(res.statusCode, 201); const saved = f.calls.at(-1).values[0]; assert.equal(saved.teacherId, 7); assert.equal(saved.studentId, 12); assert.equal(core.decodeReview(saved.noteText).score, null); });
test('review IDs are scoped to this teacher and pupil', async () => { const f = fixture(); f.authenticate(); f.queue.push([pupil], []); const res = f.res(); await f.load('src/server/api/teacher/students/[studentId]/notes/POST.ts').default(f.req({ action: 'saveReview', reviewId: 99, expectedRevision: 1, review: draft() }), res); assert.equal(res.statusCode, 404); const where = JSON.stringify(f.calls.at(-1).where); assert.match(where, /studentNotes.teacherId/); assert.match(where, /studentNotes.studentId/); });
for (const race of ['stale-version', 'concurrent-save']) test(`review update prevents ${race}`, async () => { const f = fixture(); f.authenticate(); f.queue.push([pupil], [{ id: 31, noteText: core.encodeReview(core.validateReview(draft(), 7)) }]); if (race === 'concurrent-save') f.queue.push([{ affectedRows: 0 }]); const res = f.res(); await f.load('src/server/api/teacher/students/[studentId]/notes/POST.ts').default(f.req({ action: 'saveReview', reviewId: 31, expectedRevision: race === 'stale-version' ? 0 : 1, review: draft() }), res); assert.equal(res.statusCode, 409); if (race === 'concurrent-save') assert.match(JSON.stringify(f.calls.at(-1).where), /studentNotes.noteText/); });
test('pupil report separates comments, reviews and percentages', async () => { const f = fixture(); f.authenticate(); f.queue.push([pupil], [activity(8, 10)], [{ id: 31, noteText: core.encodeReview(core.validateReview(draft(), 7)), createdAt: null }, { id: 32, noteText: 'Teacher comment', subject: 'maths' }]); const res = f.res(); await f.load('src/server/api/teacher/students/[studentId]/GET.ts').default(f.req(), res); assert.equal(res.statusCode, 200); assert.equal(res.body.notes.length, 1); assert.equal(res.body.reviews.length, 1); assert.equal(res.body.progress.bySubject[0].averagePercent, 80); assert.equal(res.body.schoolPolicy.paidAiEnabled, false); });
test('pupil report discloses capped history', async () => { const f = fixture(); f.authenticate(); f.queue.push([pupil], Array.from({ length: 501 }, (_, id) => ({ ...activity(5, 10), id })), []); const res = f.res(); await f.load('src/server/api/teacher/students/[studentId]/GET.ts').default(f.req(), res); assert.equal(res.body.activity.length, 500); assert.equal(res.body.historyLimited, true); });
test('free registration stores null licence without reading payments', async () => { const f = fixture(); f.queue.push([], [{ id: 7 }]); const res = f.res(); await f.load('src/server/api/teacher/register/POST.ts').default(f.req({ name: 'Test Teacher', email: 'teacher@example.test', className: 'Class A', password: 'long-test-password' }), res); assert.equal(res.statusCode, 201); assert.equal(f.calls.at(-1).values[0].licenceId, null); assert.equal(f.calls.length, 2); });
test('invalid optional school key is not silently bypassed', async () => { const f = fixture(); f.queue.push([]); const res = f.res(); await f.load('src/server/api/teacher/register/POST.ts').default(f.req({ name: 'Test Teacher', email: 'teacher@example.test', className: 'Class A', password: 'long-test-password', licenceKey: 'invalid' }), res); assert.equal(res.statusCode, 400); assert.equal(f.calls.length, 1); });
test('sign-in stores a hash, never the returned bearer token', async () => { const f = fixture(); f.queue.push([teacher], [{ affectedRows: 1 }]); const res = f.res(); await f.load('src/server/api/teacher/login/POST.ts').default(f.req({ email: 'teacher@example.test', password: 'test-password' }), res); assert.equal(res.statusCode, 200); assert.match(res.body.token, /^[a-f0-9]{96}$/); const stored = f.calls.at(-1).values[0]; assert.match(stored.token, /^sha256:[a-f0-9]{64}$/); assert.notEqual(stored.token, res.body.token); assert.equal('passwordHash' in res.body.teacher, false); });
test('logout revokes legacy and hashed teacher sessions', async () => { const f = fixture(); f.queue.push([{ affectedRows: 1 }]); const res = f.res(); await f.load('src/server/api/teacher/login/POST.ts').default(f.req({ action: 'logout' }), res); assert.equal(res.statusCode, 200); assert.equal(f.calls[0].operation, 'delete'); assert.match(JSON.stringify(f.calls[0].where), /sha256:/); assert.match(JSON.stringify(f.calls[0].where), new RegExp(token)); });
test('invalid password input rejected before credential lookup', async () => { const f = fixture(); const res = f.res(); await f.load('src/server/api/teacher/login/POST.ts').default(f.req({ email: 'teacher@example.test', password: { value: 'x' } }), res); assert.equal(res.statusCode, 400); assert.equal(f.calls.length, 0); });
test('session query enforces expiry for hashed and legacy tokens', async () => { const f = fixture(); f.queue.push([]); assert.equal(await f.load('src/server/api/teacher/me/GET.ts').resolveTeacher(f.req()), null); assert.match(JSON.stringify(f.calls[0].where), /teacherSessions.expiresAt/); assert.match(JSON.stringify(f.calls[0].where), /"gt"/); });
test('sign-in limiter stops repeated attempts', () => { const f = fixture(); const security = f.load('src/server/api/teacher/security.ts'), res = f.res(); assert.equal(security.allowAttempt(f.req(), res, 'test', 1), true); assert.equal(security.allowAttempt(f.req(), res, 'test', 1), false); assert.equal(res.statusCode, 429); assert.ok(res.headers['Retry-After']); });
test('new pupil preserves selected age and generates longer code', async () => { const f = fixture(); f.authenticate(); f.queue.push([{ id: 12 }], [pupil]); const res = f.res(); await f.load('src/server/api/teacher/students/POST.ts').default(f.req({ name: 'Test Pupil', ageGroup: '5–7' }), res); assert.equal(res.statusCode, 201); const saved = f.calls[2].values[0]; assert.equal(saved.ageGroup, '5-7'); assert.match(saved.studentCode, /^SODA-STUD-[A-F0-9]{10}$/); assert.equal(saved.teacherId, 7); });
function storage() { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) }; }
test('teacher browser session is tab-scoped and leaves parent keys alone', () => { const original = globalThis.window; const localStorage = storage(), sessionStorage = storage(); globalThis.window = { localStorage, sessionStorage }; try { localStorage.setItem('parent_session', 'keep'); localStorage.setItem('sodafom_teacher_token', token); const auth = fixture().load('src/lib/teacher-auth.ts'); auth.saveTeacherSession(token, teacher); assert.equal(localStorage.getItem('sodafom_teacher_token'), null); assert.equal(sessionStorage.getItem('sodafom_teacher_token'), token); assert.equal(auth.getTeacherProfile().name, teacher.name); assert.equal('passwordHash' in JSON.parse(sessionStorage.getItem('sodafom_teacher_profile')), false); auth.clearTeacherSession(); assert.equal(sessionStorage.getItem('sodafom_teacher_token'), null); assert.equal(localStorage.getItem('parent_session'), 'keep'); } finally { if (original === undefined) delete globalThis.window; else globalThis.window = original; } });
test('server rendering reads no browser session', () => { const auth = fixture().load('src/lib/teacher-auth.ts'); assert.equal(auth.getTeacherToken(), null); assert.equal(auth.getTeacherProfile(), null); });
test('unreadable 401 clears teacher session before returning error', async () => { const originalWindow = globalThis.window, originalFetch = globalThis.fetch; const sessionStorage = storage(); globalThis.window = { localStorage: storage(), sessionStorage }; sessionStorage.setItem('sodafom_teacher_token', token); globalThis.fetch = async () => ({ status: 401, ok: false, json: async () => { throw new Error('HTML instead of JSON'); } }); try { const api = fixture().load('src/lib/teacher-api.ts'); await assert.rejects(api.teacherRequest('/me'), /unreadable/); assert.equal(sessionStorage.getItem('sodafom_teacher_token'), null); } finally { globalThis.fetch = originalFetch; if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow; } });
test('all changed school TypeScript and TSX sources transpile', () => { const files = []; const walk = path => { for (const name of readdirSync(path)) { const p = join(path, name); if (statSync(p).isDirectory()) walk(p); else if (/\.tsx?$/.test(p)) files.push(p); } }; walk(join(root, 'src/server/api/teacher')); walk(join(root, 'src/pages/teacher-hub')); for (const file of ['teacher-api', 'teacher-auth', 'teacher-school']) files.push(join(root, 'src/lib', file + '.ts')); for (const file of files) { const result = ts.transpileModule(readFileSync(file, 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }); assert.equal(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0, file); } });
