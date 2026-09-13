/** Dependency-light tests: uses the repository's TypeScript devDependency; no network or database. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (cache.has(file)) return cache.get(file).exports;
    const text = fs.readFileSync(file, 'utf8');
    const { outputText, diagnostics } = ts.transpileModule(text, { fileName: file, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
    assert.equal(diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, `Syntax: ${file}`);
    const module = { exports: {} }; cache.set(file, module);
    function imported(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('@/') || name.startsWith('.')) {
        let target = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name);
        if (!path.extname(target)) target += '.ts';
        if (Object.hasOwn(mocks, path.relative(root, target))) return mocks[path.relative(root, target)];
        return load(target);
      }
      return require(name);
    }
    new Function('require', 'module', 'exports', outputText)(imported, module, module.exports);
    return module.exports;
  }
  return load;
}
const load = loader();
const d = load('src/lib/chores.ts');
const { applyChoreAction } = load('src/server/api/chores/service.ts');
const { confirmParentPassword } = load('src/server/api/chores/parent-check.ts');
const { assertChoreRequest, choreFailure } = load('src/server/api/chores/transport.ts');
const now = new Date('2026-09-13T12:00:00Z');
const today = '2026-09-13';
function job(extra = {}) { return { id: 1, childId: 1, parentId: 'p1', title: 'Put toys away', valuePence: 125, rewardType: 'money', rewardPoints: 0, recurrence: 'daily', startsOn: today, active: true, createdAt: now, ...extra }; }
function row(extra = {}) { return { id: 1, choreId: 1, childId: 1, parentId: 'p1', status: 'waiting_for_parent', occurrenceKey: `day:${today}`, ...d.snapshot(job()), completedAt: now, approvedAt: null, reviewedAt: null, parentNote: null, ...extra }; }
function request(body = {}) { return { action: 'create', childId: 1, title: 'Put toys away', rewardType: 'money', rewardValue: 125, safetyConfirmed: true, recurrence: 'daily', startsOn: today, ...body }; }
function errorStatus(fn, status) { assert.throws(fn, error => error.status === status); }

for (const [value, expected] of [['0', 0], ['0.01', 1], ['0.29', 29], ['1.2', 120], ['1.99', 199], ['1000.00', 100000]]) {
  test(`money parsing ${value} has exact integer pence`, () => assert.equal(d.parseReward(value, 'money'), expected));
}
for (const value of ['-1', '1e2', 'NaN', 'Infinity', '1.001', '.5', '1000.01', '', '1,00']) {
  test(`money parsing rejects ${JSON.stringify(value)}`, () => errorStatus(() => d.parseReward(value, 'money'), 400));
}
test('points are whole, bounded and never converted into money', () => {
  assert.equal(d.parseReward('10000', 'points'), 10000);
  for (const value of ['1.5', '-1', '10001']) errorStatus(() => d.parseReward(value, 'points'), 400);
  assert.deepEqual(d.rewardFields('points', 5), { rewardType: 'points', valuePence: 0, rewardPoints: 5 });
});
test('invalid dates and leap days are checked', () => {
  assert.equal(d.validDate('2028-02-29'), '2028-02-29');
  for (const value of ['2026-02-29', '2026-09-31', '2026-9-13', null]) errorStatus(() => d.validDate(value), 400);
});
test('UK midnight does not depend on UTC or browser timezone', () => {
  assert.equal(d.familyDate('2026-09-12T23:05:00Z'), today);
  assert.equal(d.familyDate('2026-12-12T23:05:00Z'), '2026-12-12');
});
test('daily jobs renew over summer-time transition', () => {
  const j = job({ startsOn: '2026-03-28' });
  assert.equal(d.occurrenceKey(j, '2026-03-29'), 'day:2026-03-29');
  assert.equal(d.occurrenceKey(j, '2026-03-30'), 'day:2026-03-30');
});
test('weekly jobs use seven calendar days through clock changes', () => {
  const j = job({ recurrence: 'weekly', startsOn: '2026-10-20' });
  assert.equal(d.occurrenceKey(j, '2026-10-26'), 'week:2026-10-20');
  assert.equal(d.occurrenceKey(j, '2026-10-27'), 'week:2026-10-27');
});
test('future chore cannot be completed early', () => {
  const j = job({ startsOn: '2026-09-14' });
  assert.equal(d.choreView(j, [], today).state, 'upcoming');
  errorStatus(() => d.completionPlan(j, [], today, 'day:2026-09-14'), 409);
});
test('stale period request cannot submit a new day silently', () => errorStatus(() => d.completionPlan(job(), [], today, 'day:2026-09-12'), 409));
test('one-off approval cannot be submitted again next day', () => {
  const j = job({ recurrence: 'once' });
  assert.equal(d.choreView(j, [row({ status: 'approved', occurrenceKey: 'once' })], '2026-09-14').canComplete, false);
});
test('a pending job blocks another period until reviewed', () => {
  assert.equal(d.choreView(job(), [row()], '2026-09-14').state, 'waiting_for_parent');
  errorStatus(() => d.completionPlan(job(), [row()], '2026-09-14', 'day:2026-09-14'), 409);
});
test('paused chore preserves pending status but cannot submit', () => {
  assert.equal(d.choreView(job({ active: false }), [row()], today).state, 'waiting_for_parent');
  assert.equal(d.choreView(job({ active: false }), [], today).canComplete, false);
});
test('submitting creates no approval, including zero rewards', () => {
  const plan = d.completionPlan(job({ valuePence: 0 }), [], today, `day:${today}`);
  assert.equal(plan.status, 'waiting_for_parent'); assert.equal(plan.approvedAt, null); assert.equal(plan.valuePenceSnapshot, 0);
});
test('submitted values and title stay fixed after parent edits', () => {
  const edited = job({ valuePence: 900, title: 'A new title' });
  const view = d.choreView(edited, [row()], today);
  assert.equal(view.submittedReward.label, '£1.25'); assert.equal(view.submittedReward.title, 'Put toys away');
  assert.equal(d.reviewPlan(row(), edited, true, '', false, now).valuePenceSnapshot, undefined);
});
test('return adds no reward and resubmission reuses the same record and value', () => {
  const returned = { ...row(), ...d.reviewPlan(row(), job(), false, 'Please check under the chair.', false, now) };
  assert.equal(returned.status, 'needs_work'); assert.equal(returned.approvedAt, null);
  const plan = d.completionPlan(job({ valuePence: 900 }), [returned], today, `day:${today}`);
  assert.equal(plan.retryId, 1); assert.equal(plan.valuePenceSnapshot, 125); assert.equal(plan.status, 'waiting_for_parent');
});
test('return needs a useful parent note', () => errorStatus(() => d.reviewPlan(row(), job(), false, ' ', false, now), 400));
test('approved and returned records cannot be approved again', () => {
  for (const status of ['approved', 'needs_work']) errorStatus(() => d.reviewPlan(row({ status }), job(), true, '', false, now), 409);
});
test('legacy approved amount is unknown, not guessed', () => {
  const legacy = row({ status: 'approved', occurrenceKey: null, titleSnapshot: null, rewardTypeSnapshot: null, valuePenceSnapshot: null, rewardPointsSnapshot: null });
  assert.equal(d.hasSnapshot(legacy), false);
  assert.equal(d.choreView(job(), [legacy], today).submittedReward.label, null);
});
test('legacy pending reward requires explicit parent acknowledgement', () => {
  const legacy = row({ rewardTypeSnapshot: null, valuePenceSnapshot: null, rewardPointsSnapshot: null });
  errorStatus(() => d.reviewPlan(legacy, job(), true, '', false, now), 400);
  assert.equal(d.reviewPlan(legacy, job(), true, '', true, now).valuePenceSnapshot, 125);
});
test('new create normalises title and validates safe suitability', () => {
  assert.equal(d.parseAction(request({ title: '  Put  toys away  ' }), today).title, 'Put toys away');
  errorStatus(() => d.parseAction(request({ safetyConfirmed: false }), today), 400);
});
test('extra authority, status and forged owner fields are rejected', () => {
  for (const key of ['parentId', 'parentVerified', 'approvedAt', 'status', 'commissionPence']) errorStatus(() => d.parseAction(request({ [key]: true }), today), 400);
  errorStatus(() => d.parseAction({ action: 'complete', choreId: 1, occurrenceKey: 'once', rewardValue: 99 }, today), 400);
  errorStatus(() => d.parseAction({ action: 'toString' }, today), 400);
});
test('malformed IDs and non-integer rewards are rejected', () => {
  for (const childId of [0, -1, 1.1, '1', null, Number.MAX_SAFE_INTEGER + 1]) errorStatus(() => d.parseAction(request({ childId }), today), 400);
  for (const rewardValue of [NaN, Infinity, -1, 0.1, '125']) errorStatus(() => d.parseAction(request({ rewardValue }), today), 400);
});
test('creation dates cannot be in the past or over a year ahead', () => {
  for (const startsOn of ['2026-09-12', '2028-09-13']) errorStatus(() => d.parseAction(request({ startsOn }), today), 400);
});
test('chores cannot change recurrence through update', () => errorStatus(() => d.parseAction({ action: 'update', choreId: 1, title: 'Clean socks', rewardType: 'points', rewardValue: 5, safetyConfirmed: true, recurrence: 'daily' }, today), 400));
test('pause requires a real boolean', () => errorStatus(() => d.parseAction({ action: 'set-active', choreId: 1, active: 'false' }, today), 400));
test('age ideas use the younger end of the saved age group', () => {
  assert(d.choreIdeas('5-7').every(idea => idea.minimumAge <= 5));
  assert(d.choreIdeas('8-10').every(idea => idea.minimumAge <= 8));
  assert(d.choreIdeas('11-13').some(idea => idea.minimumAge === 11));
  assert.deepEqual(d.choreIdeas('unknown'), d.choreIdeas('5-7'));
});

/** In-memory transaction adapter tests service logic, NOT a substitute for live MySQL testing. */
function memoryStore(initialJobs = [job()], initialRows = []) {
  let jobs = structuredClone(initialJobs), rows = structuredClone(initialRows), sequence = Promise.resolve();
  const owns = (p, c) => (p === 'p1' && c === 1) || (p === 'p2' && c === 2);
  return {
    get jobs() { return jobs; }, get rows() { return rows; },
    transaction(operation) {
      const run = sequence.then(async () => {
        const backup = structuredClone({ jobs, rows });
        try {
          return await operation({
            ownsChild: async (p, c) => owns(p, c),
            createChore: async values => { const id = jobs.length + 1; jobs.push({ ...values, id, createdAt: now }); return id; },
            lockChore: async (p, id) => structuredClone(jobs.find(j => j.parentId === p && j.id === id)),
            findCompletion: async (p, id) => structuredClone(rows.find(r => r.parentId === p && r.id === id)),
            listCompletions: async (p, id) => structuredClone(rows.filter(r => r.parentId === p && r.choreId === id)),
            updateChore: async (p, id, value) => Object.assign(jobs.find(j => j.parentId === p && j.id === id), value),
            createCompletion: async value => { assert(!rows.some(r => r.choreId === value.choreId && r.occurrenceKey === value.occurrenceKey)); const id = rows.length + 1; rows.push({ ...value, id }); return id; },
            updateCompletion: async (p, id, value) => Object.assign(rows.find(r => r.parentId === p && r.id === id), value),
          });
        } catch (error) { jobs = backup.jobs; rows = backup.rows; throw error; }
      });
      sequence = run.catch(() => {}); return run;
    },
  };
}
const complete = { action: 'complete', choreId: 1, occurrenceKey: `day:${today}` };
const approve = { action: 'approve', completionId: 1, confirmLegacyValue: false };
test('service refuses every parent mutation without real verification', async () => {
  for (const action of [d.parseAction(request(), today), { action: 'update', choreId: 1 }, { action: 'set-active', choreId: 1, active: false }, approve, { action: 'return', completionId: 1, parentNote: 'Try again' }]) {
    const store = memoryStore([job()], [row()]);
    await assert.rejects(applyChoreAction(store, 'p1', false, action, today, now), error => error.status === 403);
    assert.equal(store.rows[0].status, 'waiting_for_parent'); assert.equal(store.jobs[0].active, true);
  }
});
test('cross-family IDs cannot create, complete, edit or approve', async () => {
  for (const action of [d.parseAction(request(), today), complete, approve, { action: 'set-active', choreId: 1, active: false }]) {
    const store = memoryStore([job()], [row()]);
    await assert.rejects(applyChoreAction(store, 'p2', true, action, today, now), error => error.status === 404);
    assert.equal(store.rows[0].status, 'waiting_for_parent');
  }
});
test('child completion creates only a pending record', async () => {
  const store = memoryStore(); await applyChoreAction(store, 'p1', false, complete, today, now);
  assert.equal(store.rows.length, 1); assert.equal(store.rows[0].status, 'waiting_for_parent'); assert.equal(store.rows[0].approvedAt, null);
});
test('parallel complete clicks result in one submission', async () => {
  const store = memoryStore(); const results = await Promise.allSettled([applyChoreAction(store, 'p1', false, complete, today, now), applyChoreAction(store, 'p1', false, complete, today, now)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1); assert.equal(store.rows.length, 1);
});
test('parallel parent approvals count one approved record', async () => {
  const store = memoryStore([job()], [row()]); const results = await Promise.allSettled([applyChoreAction(store, 'p1', true, approve, today, now), applyChoreAction(store, 'p1', true, approve, today, now)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1); assert.equal(store.rows.filter(r => r.status === 'approved').length, 1);
});
test('competing approval and return can only perform one review', async () => {
  const store = memoryStore([job()], [row()]); const results = await Promise.allSettled([applyChoreAction(store, 'p1', true, approve, today, now), applyChoreAction(store, 'p1', true, { action: 'return', completionId: 1, parentNote: 'Try again' }, today, now)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
});
test('approved record amount survives later chore edits and pauses', async () => {
  const store = memoryStore([job()], [row()]); await applyChoreAction(store, 'p1', true, approve, today, now);
  await applyChoreAction(store, 'p1', true, { action: 'update', choreId: 1, title: 'A different chore', rewardType: 'points', valuePence: 0, rewardPoints: 9 }, today, now);
  await applyChoreAction(store, 'p1', true, { action: 'set-active', choreId: 1, active: false }, today, now);
  assert.equal(store.rows[0].valuePenceSnapshot, 125); assert.equal(store.rows[0].rewardTypeSnapshot, 'money'); assert.equal(store.rows[0].titleSnapshot, 'Put toys away');
});
test('paused pending job is still approvable by parent', async () => {
  const store = memoryStore([job({ active: false })], [row()]); await applyChoreAction(store, 'p1', true, approve, today, now); assert.equal(store.rows[0].status, 'approved');
});
test('returned job resubmits without adding duplicate history or value', async () => {
  const store = memoryStore([job()], [row()]);
  await applyChoreAction(store, 'p1', true, { action: 'return', completionId: 1, parentNote: 'Please check the floor.' }, today, now);
  await applyChoreAction(store, 'p1', false, complete, today, now);
  await applyChoreAction(store, 'p1', true, approve, today, now);
  assert.equal(store.rows.length, 1); assert.equal(store.rows[0].valuePenceSnapshot, 125); assert.equal(store.rows[0].status, 'approved');
});
function checksStore() {
  let state = { failures: 0, windowStartedAt: now }, queue = Promise.resolve();
  return { get state() { return state; }, withLock(_id, operation) { const run = queue.then(() => operation(structuredClone(state), async next => { state = next; })); queue = run.catch(() => {}); return run; } };
}
test('missing password never calls verification or grants parent action', async () => {
  let calls = 0; await assert.rejects(confirmParentPassword(checksStore(), 'p1', '', async () => { calls++; return true; }, now), error => error.status === 403); assert.equal(calls, 0);
});
test('wrong password failures are retained and locked at five attempts', async () => {
  const store = checksStore(); let calls = 0;
  for (let i = 0; i < 5; i++) await assert.rejects(confirmParentPassword(store, 'p1', 'bad', async () => { calls++; return false; }, now), error => error.status === 403);
  await assert.rejects(confirmParentPassword(store, 'p1', 'correct', async () => { calls++; return true; }, now), error => error.status === 429);
  assert.equal(calls, 5); assert.equal(store.state.failures, 5);
});
test('password checks recover after the limit window', async () => {
  const store = checksStore();
  for (let i = 0; i < 5; i++) await assert.rejects(confirmParentPassword(store, 'p1', 'bad', async () => false, now));
  await confirmParentPassword(store, 'p1', 'correct', async () => true, new Date(now.getTime() + 900000)); assert.equal(store.state.failures, 0);
});
test('concurrent bad guesses cannot evade the account limit', async () => {
  const store = checksStore(); let calls = 0;
  await Promise.allSettled(Array.from({ length: 10 }, () => confirmParentPassword(store, 'p1', 'bad', async () => { calls++; return false; }, now)));
  assert.equal(calls, 5);
});
test('password provider failure never returns verified', async () => {
  await assert.rejects(confirmParentPassword(checksStore(), 'p1', 'secret', async () => { throw new Error('Unavailable'); }, now));
});
function httpReq(extra = {}) {
  const values = { 'x-requested-with': 'SodafomChores', 'content-type': 'application/json', host: 'sodafom.uk', origin: 'https://sodafom.uk', ...extra };
  return { method: 'POST', protocol: 'https', get(name) { return values[name.toLowerCase()]; } };
}
test('feature transport allows official web and native origins', () => {
  for (const origin of ['https://sodafom.uk', 'capacitor://localhost', 'http://localhost', 'https://localhost']) assert.doesNotThrow(() => assertChoreRequest(httpReq({ origin })));
});
test('host legacy permissive CORS cannot grant chore reads to malicious origin', () => {
  const req = httpReq({ origin: 'https://evil.example' }); req.method = 'GET'; errorStatus(() => assertChoreRequest(req), 403);
});
test('CSRF form requests, missing header and fake subdomains are rejected', () => {
  errorStatus(() => assertChoreRequest(httpReq({ 'x-requested-with': undefined })), 403);
  errorStatus(() => assertChoreRequest(httpReq({ 'content-type': 'application/x-www-form-urlencoded' })), 415);
  errorStatus(() => assertChoreRequest(httpReq({ origin: 'https://sodafom.uk.evil.example' })), 403);
  errorStatus(() => assertChoreRequest(httpReq({ origin: undefined, 'sec-fetch-site': 'cross-site' })), 403);
});
test('database error messages never reveal private SQL or credentials', () => {
  for (const error of [{ code: 'ER_BAD_FIELD_ERROR', sql: 'secret' }, new Error('password secret')]) assert(!choreFailure(error).error.includes('secret'));
  assert.equal(choreFailure({ code: 'ER_DUP_ENTRY' }).status, 409);
});

// Execute the actual HTTP handlers with fake auth/store boundaries.
function handlerHarness({ verified = true, parentId = 'p1', rows = [] } = {}) {
  const store = memoryStore([job()], rows); let checkCalls = 0;
  const read = loader({
    'src/server/api/chores/security.ts': { getChoreParent: async req => { assertChoreRequest(req); if (!parentId) throw new d.ChoreError(401, 'Sign in'); return parentId; }, verifyChoreParent: async (_id, password) => { checkCalls++; if (!verified || password !== 'test-parent-password') throw new d.ChoreError(403, 'Parent confirmation required'); } },
    'src/server/api/chores/store.ts': { choresStore: store, listChores: async (_parent, id, _today, _now, cursor) => ({ child: { id }, historyCursor: cursor ?? null, totals: { moneyPence: 500, points: 4 } }) },
    '@/lib/chores': d,
  });
  const post = read('src/server/api/chores/POST.ts').default, get = read('src/server/api/chores/GET.ts').default;
  async function call(body, method = 'POST', query = {}) {
    const req = Object.assign(httpReq(), { body: structuredClone(body), method, query });
    const res = { statusCode: 200, headers: {}, body: undefined, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
    await (method === 'GET' ? get : post)(req, res); return { req, res };
  }
  return { store, call, get checks() { return checkCalls; } };
}
test('HTTP create verifies password, emits zero fee and removes request password', async () => {
  const h = handlerHarness();
  const { req, res } = await h.call(request({ startsOn: d.familyDate(), parentPassword: 'test-parent-password' }));
  assert.equal(res.statusCode, 201); assert.equal(res.body.commissionPence, 0); assert.equal(h.checks, 1); assert(!('parentPassword' in req.body)); assert.equal(res.headers['Cache-Control'], 'private, no-store');
});
test('HTTP missing session produces no database mutation', async () => {
  const h = handlerHarness({ parentId: null }); const { res } = await h.call(complete); assert.equal(res.statusCode, 401); assert.equal(h.store.rows.length, 0);
});
test('HTTP cannot approve with a shared session but no parent password', async () => {
  const h = handlerHarness({ rows: [row()] }); const { res } = await h.call(approve); assert.equal(res.statusCode, 403); assert.equal(h.store.rows[0].status, 'waiting_for_parent');
});
test('HTTP invalid body never reaches password verifier', async () => {
  const h = handlerHarness(); const { res } = await h.call({ ...approve, parentVerified: true }); assert.equal(res.statusCode, 400); assert.equal(h.checks, 0);
});
test('HTTP child completion does not request or use a parent password', async () => {
  const h = handlerHarness(); const { res } = await h.call({ ...complete, occurrenceKey: `day:${d.familyDate()}` }); assert.equal(res.statusCode, 200); assert.equal(h.checks, 0); assert.equal(h.store.rows[0].status, 'waiting_for_parent');
});
test('HTTP GET requires valid child ID and preserves pagination contract', async () => {
  const h = handlerHarness(); assert.equal((await h.call(null, 'GET', { childId: '0' })).res.statusCode, 400);
  const { res } = await h.call(null, 'GET', { childId: '1', before: '50' }); assert.equal(res.statusCode, 200); assert.equal(res.body.historyCursor, 50); assert.equal(res.body.totals.moneyPence, 500); assert.equal(res.headers['Cache-Control'], 'private, no-store');
});

test('all feature TypeScript and TSX files parse cleanly', () => {
  const paths = ['src/lib/chores.ts', 'src/pages/ChoresPage.tsx', 'scripts/migrate-agent16-chores.ts', 'src/server/db/migrations/agent16-chores.ts', ...fs.readdirSync(path.join(root, 'src/server/api/chores')).filter(f => f.endsWith('.ts')).map(f => `src/server/api/chores/${f}`)];
  for (const file of paths) {
    const result = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } });
    assert.equal(result.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, file);
  }
});
test('chores does not import payment, AI, game, book or admin services', () => {
  const files = ['src/lib/chores.ts', 'src/pages/ChoresPage.tsx', ...fs.readdirSync(path.join(root, 'src/server/api/chores')).filter(f => f.endsWith('.ts')).map(f => `src/server/api/chores/${f}`)];
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
    assert(!imports.some(name => /stripe|openai|voice-context|paid-ai|\/games|\/books|\/admin/.test(name)), file);
  }
  const css = fs.readFileSync(path.join(root, 'src/styles/chores.css'), 'utf8'); assert(css.includes('prefers-reduced-motion:reduce'));
});
test('migration is additive, explicit and leaves legacy snapshots unknown', () => {
  const source = fs.readFileSync(path.join(root, 'src/server/db/migrations/agent16-chores.ts'), 'utf8');
  assert(!/\b(DROP|DELETE|TRUNCATE)\s+(TABLE|FROM)/i.test(source)); assert(!/\bUPDATE\s+chore_completions/i.test(source));
  assert(source.includes('chore_occurrence_unique'));
  const runner = fs.readFileSync(path.join(root, 'scripts/migrate-agent16-chores.ts'), 'utf8'); assert(runner.includes('--apply-agent16-chores'));
});
