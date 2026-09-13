/** Isolated route tests with an in-memory Drizzle adapter, not a live MySQL or browser test. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../../../..');
const TOKEN = 'a'.repeat(96);
const OTHER_TOKEN = 'b'.repeat(96);
const KEY = '12345678-1234-4234-8234-123456789abc';
const DRAFT = { kind: 'homework', subject: 'maths', title: 'Number practice', status: 'needs_review', score: null, maxScore: null, comment: 'Check unclear working.', photoReviewed: false };
const tableNames = ['students', 'studentActivity', 'studentNotes', 'teacherAccounts', 'teacherSessions'];
function harness() {
  const schema = Object.fromEntries(tableNames.map(name => [name, new Proxy({ $table: name }, { get: (target, field) => field === '$table' ? target.$table : { table: name, field } })]));
  let state = {
    students: [{ id: 11, teacherId: 1, name: 'Pupil A', studentCode: 'SODA-STUD-OWN', ageGroup: '8-10', avatarEmoji: null, totalStars: 2 }, { id: 22, teacherId: 2, name: 'Pupil B', studentCode: 'SODA-STUD-OTHER', ageGroup: '5-7', totalStars: 4 }],
    teacherAccounts: [{ id: 1, name: 'Teacher A', email: 'a@school.example', className: 'Class A', passwordHash: '' }, { id: 2, name: 'Teacher B', email: 'b@school.example', className: 'Class B', passwordHash: '' }],
    teacherSessions: [{ id: 1, teacherId: 1, token: TOKEN, expiresAt: new Date(Date.now() + 3600000) }, { id: 2, teacherId: 2, token: OTHER_TOKEN, expiresAt: new Date(Date.now() + 3600000) }],
    studentActivity: [{ id: 1, studentId: 11, gameId: 'counting', gameTitle: 'Counting game', subject: 'maths', score: 8, maxScore: 10, starsEarned: 2, durationSeconds: 30, playedAt: new Date() }, { id: 2, studentId: 22, gameId: 'private-other', gameTitle: 'Other private work', subject: 'reading', score: 5, maxScore: 5, starsEarned: 4, playedAt: new Date() }],
    studentNotes: [],
  };
  const calls = { locks: 0, transactions: 0, writes: 0, selects: 0 };
  let failWrite = false;
  const orm = {
    eq: (column, value) => row => row[column.field] === value,
    gt: (column, value) => row => new Date(row[column.field]) > value,
    and: (...predicates) => row => predicates.every(p => p(row)),
    desc: column => ({ column, descending: true }),
    like: (column, pattern) => {
      // The route uses only a validated UUID literal followed by a trailing wildcard.
      assert.equal(pattern.indexOf('%'), pattern.length - 1);
      return row => String(row[column.field]).startsWith(pattern.slice(0, -1));
    },
  };
  const db = {
    select(selection) {
      calls.selects++;
      let table; let predicate = () => true; let limit = Infinity; let ordering = [];
      const q = {
        from(value) { table = value.$table; return q; },
        where(value) { predicate = value; return q; },
        limit(value) { limit = value; return q; },
        orderBy(...values) { ordering = values; return q; },
        for(mode) { assert.equal(mode, 'update'); calls.locks++; return q; },
        then(resolve, reject) {
          try {
            let rows = state[table].filter(predicate);
            rows = rows.slice().sort((a, b) => {
              for (const order of ordering) {
                const c = order.column ?? order; const av = a[c.field]; const bv = b[c.field];
                const difference = av > bv ? 1 : av < bv ? -1 : 0;
                if (difference) return order.descending ? -difference : difference;
              }
              return 0;
            }).slice(0, limit);
            if (selection) rows = rows.map(row => Object.fromEntries(Object.entries(selection).map(([name, col]) => [name, row[col.field]])));
            return Promise.resolve(structuredClone(rows)).then(resolve, reject);
          } catch (error) { return Promise.reject(error).then(resolve, reject); }
        },
      };
      return q;
    },
    insert(table) { return { values(value) {
      let inserted;
      const run = () => {
        if (inserted) return inserted;
        if (failWrite) throw new Error('Simulated database write failure');
        calls.writes++;
        inserted = { id: Math.max(0, ...state[table.$table].map(r => r.id)) + 1, createdAt: new Date(), totalStars: 0, ...structuredClone(value) };
        state[table.$table].push(inserted); return inserted;
      };
      return { $returningId: async () => [{ id: run().id }], then: (resolve, reject) => Promise.resolve().then(run).then(resolve, reject) };
    } }; },
    update(table) { return { set(value) { return { where: async predicate => {
      if (failWrite) throw new Error('Simulated database write failure');
      calls.writes++; for (const row of state[table.$table]) if (predicate(row)) Object.assign(row, structuredClone(value));
    } }; } }; },
    delete(table) { return { where: async predicate => { calls.writes++; state[table.$table] = state[table.$table].filter(row => !predicate(row)); } }; },
    async transaction(fn) {
      calls.transactions++; const backup = structuredClone(state);
      try { return await fn(db); } catch (error) { state = backup; throw error; }
    },
  };
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (!fs.existsSync(file) && fs.existsSync(`${file}.ts`)) file += '.ts';
    if (cache.has(file)) return cache.get(file).exports;
    const source = fs.readFileSync(file, 'utf8');
    const compiled = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
    const errors = compiled.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error) ?? [];
    assert.equal(errors.length, 0, `Syntax diagnostics in ${file}`);
    const module = { exports: {} }; cache.set(file, module);
    const scopedRequire = id => {
      if (id === '@/server/db/client') return { db };
      if (id === '@/server/db/schema') return schema;
      if (id === 'drizzle-orm') return orm;
      if (id === '@/server/lib/game-recommendations') return { getGameRecommendations: () => [{ gameId: 'example', title: 'Example', href: '/games/example', reason: 'Test recommendation' }] };
      if (id === '@/lib/config') return { API_PREFIX: '/api' };
      if (id.startsWith('@/')) return load(path.join(root, 'src', id.slice(2)));
      if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id));
      return require(id);
    };
    vm.runInThisContext(`(function(require,module,exports){${compiled.outputText}\n})`, { filename: file })(scopedRequire, module, module.exports);
    return module.exports;
  }
  async function request(route, { id = '11', body = {}, token = TOKEN, ip = 'test-ip' } = {}) {
    const req = { params: { studentId: id }, body, headers: token ? { authorization: `Bearer ${token}` } : {}, ip };
    const res = { statusCode: 200, headers: {}, body: undefined,
      set(name, value) { this.headers[name] = value; return this; },
      status(value) { this.statusCode = value; return this; },
      json(value) { this.body = value; return this; }, end() { return this; },
    };
    await load(path.join(root, 'src/server/api/teacher', route)).default(req, res);
    return res;
  }
  return { request, load, calls, get state() { return state; }, setFailWrite: value => { failWrite = value; } };
}
const DETAIL = 'students/[studentId]/GET.ts';
const NOTES = 'students/[studentId]/notes/POST.ts';
const makeBody = (changes = {}) => ({ action: 'save-record', requestId: KEY, record: { ...DRAFT, ...changes } });

test('Teacher detail rejects unauthenticated reads without disclosing pupil data', async () => {
  const h = harness(); const r = await h.request(DETAIL, { token: null });
  assert.equal(r.statusCode, 401); assert.doesNotMatch(JSON.stringify(r.body), /Pupil A|Counting game/);
});
test('Expired teacher sessions cannot read school records', async () => {
  const h = harness(); h.state.teacherSessions[0].expiresAt = new Date(0);
  assert.equal((await h.request(DETAIL)).statusCode, 401);
});
test('Malformed bearer tokens are rejected before database access', async () => {
  const h = harness(); assert.equal((await h.request(DETAIL, { token: 'bad' })).statusCode, 401); assert.equal(h.calls.selects, 0);
});
test('A teacher cannot read a pupil in another class', async () => {
  const h = harness(); const r = await h.request(DETAIL, { id: '22' });
  assert.equal(r.statusCode, 404); assert.doesNotMatch(JSON.stringify(r.body), /Other private|Pupil B/);
});
test('Detail uses strict path IDs instead of parseInt prefixes', async () => {
  const h = harness(); assert.equal((await h.request(DETAIL, { id: '11oops' })).statusCode, 400);
});
test('Authorised detail returns correctly scaled game marks and no-store headers', async () => {
  const h = harness(); const r = await h.request(DETAIL);
  assert.equal(r.statusCode, 200); assert.equal(r.body.summary.percent, 80);
  assert.equal(r.headers['Cache-Control'], 'private, no-store'); assert.equal(r.headers.Vary, 'Authorization');
});
test('The class list includes only the signed-in teacher’s pupils', async () => {
  const h = harness(); const r = await h.request('students/GET.ts');
  assert.equal(r.statusCode, 200); assert.deepEqual(r.body.map(s => s.id), [11]); assert.equal(r.body[0].summary.percent, 80);
});
test('Adding a pupil preserves the selected age and returns a usable dashboard shape', async () => {
  const h = harness(); const r = await h.request('students/POST.ts', { body: { name: 'New pupil', ageGroup: '5–7' } });
  assert.equal(r.statusCode, 201); assert.equal(r.body.ageGroup, '5-7'); assert.equal(r.body.summary.percent, null);
  assert.deepEqual(r.body.notes, []); assert.match(r.body.studentCode, /^SODA-STUD-[0-9A-F]{10}$/); assert.equal(r.body.studentCode.length, 20);
});
test('Adding a pupil rejects invalid ages rather than silently assigning another age', async () => {
  const h = harness(); assert.equal((await h.request('students/POST.ts', { body: { name: 'New pupil', ageGroup: '99' } })).statusCode, 400);
});
test('Teacher comments require authentication and class ownership', async () => {
  const h = harness(); assert.equal((await h.request(NOTES, { token: null, body: { noteText: 'Hello' } })).statusCode, 401);
  assert.equal((await h.request(NOTES, { id: '22', body: { noteText: 'Hello' } })).statusCode, 404); assert.equal(h.state.studentNotes.length, 0);
});
test('Ordinary teacher comments preserve the selected subject and support note', async () => {
  const h = harness(); const r = await h.request(NOTES, { body: { noteText: 'Read aloud.', subject: 'reading', needsHelp: 'Longer words' } });
  assert.equal(r.statusCode, 201); assert.match(h.state.studentNotes[0].noteText, /Longer words/); assert.equal(h.state.studentNotes[0].subject, 'reading');
});
test('Ordinary comments cannot masquerade as structured school records', async () => {
  const h = harness(); assert.equal((await h.request(NOTES, { body: { noteText: '{}', subject: 'school-record-v1' } })).statusCode, 400);
});
test('Pending review is persisted without a mark, photo, filename or forged author', async () => {
  const h = harness(); const r = await h.request(NOTES, { body: makeBody({ image: 'PRIVATE_IMAGE', filename: 'pupil.png', teacherId: 999 }) });
  assert.equal(r.statusCode, 201); const saved = JSON.parse(h.state.studentNotes[0].noteText);
  assert.equal(saved.teacherId, 1); assert.equal(saved.score, null); assert.equal(saved.reviewedAt, null);
  assert.doesNotMatch(h.state.studentNotes[0].noteText, /PRIVATE_IMAGE|pupil.png/);
  const detail = await h.request(DETAIL); assert.equal(detail.body.summary.needsReview, 1); assert.equal(detail.body.summary.percent, 80);
});
test('Class ownership is locked during a school write', async () => {
  const h = harness(); await h.request(NOTES, { body: makeBody() }); assert.equal(h.calls.transactions, 1); assert.ok(h.calls.locks >= 1);
});
test('An identical retried create is idempotent and does not double-count work', async () => {
  const h = harness(); await h.request(NOTES, { body: makeBody() }); const again = await h.request(NOTES, { body: makeBody() });
  assert.equal(again.statusCode, 200); assert.equal(h.state.studentNotes.length, 1);
});
test('A retried create with changed content conflicts instead of silently discarding it', async () => {
  const h = harness(); await h.request(NOTES, { body: makeBody() });
  assert.equal((await h.request(NOTES, { body: makeBody({ title: 'Different task' }) })).statusCode, 409);
  assert.equal(h.state.studentNotes.length, 1);
});
test('Pending work can be teacher-confirmed without creating a second record', async () => {
  const h = harness(); const created = await h.request(NOTES, { body: makeBody() });
  const body = { ...makeBody({ status: 'reviewed', score: 5, maxScore: 5 }), recordId: created.body.id, expectedRevision: 1 };
  const r = await h.request(NOTES, { body }); assert.equal(r.statusCode, 200); assert.equal(r.body.revision, 2); assert.equal(h.state.studentNotes.length, 1);
  const detail = await h.request(DETAIL); assert.equal(detail.body.summary.needsReview, 0); assert.equal(detail.body.summary.percent, 86.7);
});
test('Stale edits cannot overwrite a newer teacher review', async () => {
  const h = harness(); const created = await h.request(NOTES, { body: makeBody() });
  const body = { ...makeBody({ comment: 'First edit' }), recordId: created.body.id, expectedRevision: 1 };
  await h.request(NOTES, { body });
  const r = await h.request(NOTES, { body: { ...body, record: { ...body.record, comment: 'Stale edit' } } });
  assert.equal(r.statusCode, 409); assert.equal(JSON.parse(h.state.studentNotes[0].noteText).comment, 'First edit');
});
test('Teachers cannot amend another teacher’s review, even with its numeric ID', async () => {
  const h = harness(); const created = await h.request(NOTES, { body: makeBody() });
  const r = await h.request(NOTES, { token: OTHER_TOKEN, id: '22', body: { ...makeBody(), recordId: created.body.id, expectedRevision: 1 } });
  assert.equal(r.statusCode, 404); assert.equal(h.state.studentNotes.length, 1);
});
test('Invalid marks and malformed review bodies fail closed without writes', async () => {
  const h = harness();
  for (const body of [null, [], makeBody({ score: 2, maxScore: 2 }), makeBody({ status: 'reviewed', score: 12, maxScore: 10 }), { ...makeBody(), requestId: '%' }]) {
    assert.equal((await h.request(NOTES, { body })).statusCode, 400);
  }
  assert.equal(h.state.studentNotes.length, 0);
});
test('Unreadable saved records are flagged rather than turned into marks', async () => {
  const h = harness(); h.state.studentNotes.push({ id: 1, studentId: 11, teacherId: 1, subject: 'school-record-v1', noteText: '{bad', createdAt: new Date() });
  const r = await h.request(DETAIL); assert.equal(r.body.coverage.unreadableRecords, 1); assert.equal(r.body.summary.percent, 80);
});
test('History limits are disclosed and not presented as complete lifetime data', async () => {
  const h = harness(); h.state.studentActivity.push(...Array.from({ length: 501 }, (_, i) => ({ id: i + 10, studentId: 11, gameId: 'counting', gameTitle: 'Counting', subject: 'maths', score: 1, maxScore: 1, starsEarned: 0, playedAt: new Date() })));
  const r = await h.request(DETAIL); assert.equal(r.body.coverage.gamesTruncated, true); assert.equal(r.body.records.length, 500);
});
test('Database write failures do not claim that a review was saved', async () => {
  const h = harness(); h.setFailWrite(true); const r = await h.request(NOTES, { body: makeBody() });
  assert.equal(r.statusCode, 500); assert.equal(h.state.studentNotes.length, 0); assert.match(r.body.error, /not been confirmed/);
});
test('Login validates non-string inputs rather than throwing through to a server error', async () => {
  const h = harness(); for (const body of [{ email: {}, password: 'pass' }, { email: 'a@school.example', password: [] }, { email: 'bad', password: 'pass' }]) assert.equal((await h.request('login/POST.ts', { body })).statusCode, 400);
});
test('Real teacher-password hashing works through the new login route', async () => {
  const h = harness(); const passwords = h.load(path.join(root, 'src/server/teacher-password.ts'));
  h.state.teacherAccounts[0].passwordHash = await passwords.hashTeacherPassword('Test-password-only');
  const r = await h.request('login/POST.ts', { body: { email: ' A@SCHOOL.EXAMPLE ', password: 'Test-password-only' } });
  assert.equal(r.statusCode, 200); assert.match(r.body.token, /^[a-f0-9]{96}$/); assert.equal(r.body.teacher.id, 1);
  assert.equal('passwordHash' in r.body.teacher, false); assert.equal(r.headers['Cache-Control'], 'private, no-store');
  const session = h.state.teacherSessions.find(s => s.token === r.body.token);
  assert.ok(session.expiresAt - Date.now() > 11.9 * 3600000 && session.expiresAt - Date.now() <= 12 * 3600000);
});
test('Wrong passwords and unknown accounts both produce generic authentication failures', async () => {
  const h = harness(); const passwords = h.load(path.join(root, 'src/server/teacher-password.ts'));
  h.state.teacherAccounts[0].passwordHash = await passwords.hashTeacherPassword('Test-password-only');
  const a = await h.request('login/POST.ts', { body: { email: 'a@school.example', password: 'Wrong-password' } });
  const b = await h.request('login/POST.ts', { body: { email: 'unknown@school.example', password: 'Wrong-password' } });
  assert.equal(a.statusCode, 401); assert.equal(b.statusCode, 401); assert.deepEqual(a.body, b.body);
});
test('Teacher sign-out revokes only the presented session token', async () => {
  const h = harness(); assert.equal((await h.request('login/POST.ts', { body: { action: 'logout' } })).statusCode, 204);
  assert.equal((await h.request(DETAIL)).statusCode, 401); assert.equal(h.state.teacherSessions.length, 1); assert.equal(h.state.teacherSessions[0].token, OTHER_TOKEN);
});
test('Teacher browser sessions are tab-scoped and old persistent tokens are removed', () => {
  const h = harness(); const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }; };
  const prior = global.window; global.window = { localStorage: memory(), sessionStorage: memory() };
  try {
    global.window.localStorage.setItem('sodafom_teacher_token', TOKEN);
    const auth = h.load(path.join(root, 'src/lib/teacher-auth.ts'));
    assert.equal(auth.getTeacherToken(), null); assert.equal(global.window.localStorage.getItem('sodafom_teacher_token'), null);
    auth.saveTeacherSession(TOKEN, { id: 1, name: 'Teacher A', email: 'a@school.example', className: 'Class A' });
    assert.equal(auth.getTeacherToken(), TOKEN); assert.equal(auth.getTeacherProfile().id, 1);
    auth.clearTeacherSession(); assert.equal(auth.getTeacherToken(), null);
    assert.throws(() => auth.saveTeacherSession(undefined, undefined));
  } finally { if (prior === undefined) delete global.window; else global.window = prior; }
});

test('The teacher API adapts existing recommendation href values to working links', async () => {
  const h = harness(); const r = await h.request(DETAIL);
  assert.equal(r.body.recommendations[0].path, '/games/example');
});
test('Teacher login rate limiting returns a retry hint after the process-local budget', async () => {
  const h = harness();
  for (let i = 0; i < 60; i++) assert.equal((await h.request('login/POST.ts', { body: { email: 'a@school.example', password: 'Wrong' }, ip: 'rate-test' })).statusCode, 401);
  const r = await h.request('login/POST.ts', { body: { email: 'a@school.example', password: 'Wrong' }, ip: 'rate-test' });
  assert.equal(r.statusCode, 429); assert.equal(r.headers['Retry-After'], '900');
});
test('Legacy teacher password hashes still upgrade on successful sign-in', async () => {
  const h = harness();
  h.state.teacherAccounts[0].passwordHash = require('node:crypto').createHash('sha256').update('Test-password-only' + 'sodafom-teacher-salt').digest('hex');
  assert.equal((await h.request('login/POST.ts', { body: { email: 'a@school.example', password: 'Test-password-only' } })).statusCode, 200);
  assert.match(h.state.teacherAccounts[0].passwordHash, /^scrypt\$/);
});
test('Teacher requests clear expired sessions and reject malformed service replies', async () => {
  const h = harness(); const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }; };
  const previousWindow = global.window; const previousFetch = global.fetch;
  global.window = { localStorage: memory(), sessionStorage: memory() };
  try {
    const auth = h.load(path.join(root, 'src/lib/teacher-auth.ts'));
    const client = h.load(path.join(root, 'src/pages/teacher-hub/school-client.ts'));
    const profile = { id: 1, name: 'Teacher A', email: 'a@school.example', className: 'Class A' };
    await assert.rejects(() => client.teacherRequest('/parent/dashboard'), /Teacher endpoint/);
    auth.saveTeacherSession(TOKEN, profile);
    global.fetch = async (_url, options) => { assert.equal(options.cache, 'no-store'); return { status: 401, ok: false }; };
    await assert.rejects(() => client.teacherRequest('/teacher/students'), /expired/); assert.equal(auth.getTeacherToken(), null);
    auth.saveTeacherSession(TOKEN, profile);
    global.fetch = async () => ({ status: 502, ok: false, json: async () => { throw new Error('HTML response'); } });
    await assert.rejects(() => client.teacherRequest('/teacher/students'), /valid response/);
  } finally {
    if (previousWindow === undefined) delete global.window; else global.window = previousWindow;
    global.fetch = previousFetch;
  }
});
