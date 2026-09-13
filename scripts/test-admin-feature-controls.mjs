/** Run: node --test scripts/test-admin-feature-controls.mjs
 * Pure logic, real TypeScript checks, SQL-adapter and route mocks.
 * React hook tests below are a simulated lifecycle, not the full React app.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { loader, root, ts } from './admin-feature-test-support.mjs';
const modelPath = 'src/components/admin/feature-controls-model.ts';
const servicePath = 'src/server/admin-feature-controls/service.ts';
const clientPath = 'src/components/admin/feature-controls-client.ts';
const load = loader();
const M = load(modelPath);
const { createFeatureService, allowedOrigin } = load(servicePath);
const snapshot = () => M.buildSnapshot(M.defaultSettings(), 0);
const change = (extra = {}) => ({ action: 'set-feature-control', key: 'cinema', enabled: false, revision: 0, confirmed: false, ...extra });
const request = (extra = {}) => ({ authorised: true, origin: 'https://owner.example', host: 'owner.example', contentType: 'application/json', actionHeader: 'feature-control', development: false, trustedOrigins: [], body: change(), ...extra });
function memoryStore() {
  let settings = M.defaultSettings(), revision = 0, writes = 0;
  const reads = [];
  return {
    reads, get writes() { return writes; },
    async read(initialise) { reads.push(initialise); return { settings: { ...settings }, revision }; },
    async compareAndSet(expected, next) {
      if (expected !== revision) throw new M.FeatureControlError(409, 'Settings changed in another window. Reload before trying again.');
      settings = { ...next }; revision++; writes++;
    },
  };
}
function response() {
  return { statusCode: 200, headers: {}, body: null,
    set(k, v) { this.headers[k] = v; return this; },
    status(n) { this.statusCode = n; return this; },
    json(b) { this.body = b; return this; },
  };
}

test('strict TypeScript: model, client, service and DOM view', () => {
  const files = [modelPath, clientPath, servicePath, 'src/components/admin/feature-controls-view.ts'].map(f => path.join(root, f));
  const program = ts.createProgram(files, { noEmit: true, strict: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], types: [], skipLibCheck: true });
  const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => root, getCanonicalFileName: x => x, getNewLine: () => '\n' }));
});
test('syntax check all new admin TS/TSX and modified integration files', () => {
  const dirs = ['src/components/admin', 'src/server/admin-feature-controls', 'src/server/api/admin/founder-changes'];
  const files = dirs.flatMap(dir => readdirSync(path.join(root, dir)).filter(f => /\.tsx?$/.test(f)).map(f => path.join(dir, f)));
  files.push('src/components/FounderVoiceControl.tsx', 'src/layouts/RootLayout.tsx');
  for (const file of files) {
    const result = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true, fileName: file });
    assert.equal(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0, file);
  }
});
test('all 13 requested controls are unique; 9 connected and 4 explicitly unfinished', () => {
  assert.equal(M.FEATURES.length, 13); assert.equal(new Set(M.FEATURES.map(f => f.id)).size, 13);
  assert.equal(M.FEATURES.filter(f => f.connected).length, 9);
  const states = Object.values(snapshot().states);
  assert.equal(states.filter(x => x === 'on').length, 9);
  assert.equal(states.filter(x => x === 'testing').length, 3);
  assert.equal(states.filter(x => x === 'coming_soon').length, 1);
});
for (const feature of M.FEATURES.filter(f => f.connected)) {
  test(`${feature.label}: off/on round trip preserves unrelated settings`, () => {
    const stored = { ...M.defaultSettings(), futureFeature: 'preserve' };
    const off = M.prepareChange(stored, 0, change({ key: feature.id, confirmed: true }));
    assert.equal(off.snapshot.states[feature.id], 'off'); assert.equal(off.snapshot.revision, 1);
    assert.equal(off.settings.futureFeature, 'preserve');
    for (const other of M.FEATURES.filter(f => f.connected && f.id !== feature.id)) assert.equal(off.settings[other.id], true);
    const on = M.prepareChange(off.settings, 1, change({ key: feature.id, revision: 1, enabled: true }));
    assert.equal(on.snapshot.states[feature.id], 'on'); assert.equal(on.snapshot.revision, 2);
  });
}
test('critical disable needs confirmation; enabling and no-op do not', () => {
  assert.throws(() => M.validateChange(change({ key: 'learning' }), snapshot()), e => e.status === 409);
  const on = M.prepareChange(M.defaultSettings(), 0, change({ key: 'learning', enabled: true }));
  assert.equal(on.changed, false); assert.equal(on.snapshot.revision, 0);
});
test('reject unknown, disconnected, prototype, extra fields and non-boolean controls', () => {
  for (const key of ['__proto__', 'constructor', 'payments', 'admin', 'ask_archie', 'voice', 'notifications', 'sticker_books']) assert.throws(() => M.validateChange(change({ key }), snapshot()));
  for (const value of [null, [], '', { ...change(), enabled: 'false' }, { ...change(), revision: -1 }, { ...change(), revision: '0' }, { ...change(), revision: 0.5 }, { ...change(), secret: 'not-allowed' }, Object.create(change())]) assert.throws(() => M.validateChange(value, snapshot()));
  assert.equal({}.polluted, undefined);
});
test('reject stale revisions and malformed snapshots without leaking unknown settings', () => {
  assert.throws(() => M.validateChange(change({ revision: 1 }), snapshot()), e => e.status === 409);
  assert.throws(() => M.buildSnapshot({ games: 'false' }, 0));
  for (const revision of [-1, NaN, Infinity, '1']) assert.throws(() => M.buildSnapshot({}, revision));
  const safe = M.buildSnapshot({ ...M.defaultSettings(), privateValue: 'TEST_DO_NOT_EXPOSE' }, 1);
  assert.ok(!JSON.stringify(safe).includes('TEST_DO_NOT_EXPOSE'));
  assert.deepEqual(M.readSnapshot({ ...safe, token: 'TEST_DO_NOT_EXPOSE' }), safe);
  assert.throws(() => M.readSnapshot({ revision: 1, states: { ...safe.states, voice: 'on' } }));
});
test('route mapping: all connected roots and descendants, correct prefix boundaries', () => {
  for (const f of M.FEATURES.filter(f => f.connected)) for (const url of f.paths) assert.equal(M.featureForPath(url)?.id, f.id);
  assert.equal(M.featureForPath('/games/number-pop')?.id, 'games');
  assert.equal(M.featureForPath('/GAMES/number-pop/?a=b')?.id, 'games');
  assert.equal(M.featureForPath('/subjects/reading')?.id, 'reading');
  assert.equal(M.featureForPath('/gamesmanship'), undefined);
  assert.equal(M.featureForPath('/%zz'), undefined);
});
test('owner, login, cancellation, opt-out and parent chore approvals remain reachable', () => {
  for (const url of ['/', '/admin-panel', '/admin/sodafom-bot', '/hub/subscription', '/auth/logout', '/subscribe', '/checkout/cancel', '/notifications', '/teacher-hub/login', '/teacher-hub/register', '/teacher-hub/logout', '/teacher-hub/settings', '/teacher-hub/forgot-password', '/teacher-hub/reset-password', '/parent-dashboard/chores', '/parent-dashboard/chores/item', '/parent-dashboard/settings', '/parent-dashboard/subscription', '/parent-area/settings', '/parent-area/subscription']) assert.equal(M.featureForPath(url), undefined, url);
});
test('unauthorised private reads and writes never touch the store', async () => {
  const store = memoryStore(); const service = createFeatureService(store);
  assert.equal((await service.read(false, false)).status, 401);
  assert.equal((await service.write(request({ authorised: false }))).status, 401);
  assert.deepEqual(store.reads, []); assert.equal(store.writes, 0);
});
test('public reads never initialise settings and expose only safe snapshot', async () => {
  const store = memoryStore(); const result = await createFeatureService(store).read(false, true);
  assert.equal(result.status, 200); assert.deepEqual(store.reads, [false]);
  assert.deepEqual(Object.keys(result.body).sort(), ['snapshot', 'success']);
  assert.deepEqual(Object.keys(result.body.snapshot).sort(), ['revision', 'states']);
});
test('reject cross-site/absent origins, untrusted hosts, malformed origin URLs and missing action header', async () => {
  for (const fields of [{ origin: undefined }, { origin: 'null' }, { origin: 'https://evil.example' }, { origin: 'https://owner.example/path' }, { origin: 'https://owner.example.evil.example' }, { origin: 'http://owner.example' }, { origin: 'https://user@owner.example' }, { actionHeader: undefined }, { contentType: 'text/plain' }, { contentType: 'application/jsonevil' }]) {
    const store = memoryStore(); const result = await createFeatureService(store).write(request(fields));
    assert.equal(result.status, 403, JSON.stringify(fields)); assert.deepEqual(store.reads, []);
  }
});
test('allow exact trusted HTTPS origin and development localhost only', () => {
  assert.equal(allowedOrigin(request({ origin: 'https://front.example', trustedOrigins: ['https://front.example/auth'] })), true);
  assert.equal(allowedOrigin(request({ origin: 'http://localhost:5173', host: 'localhost:5173', development: true })), true);
  assert.equal(allowedOrigin(request({ origin: 'http://localhost:5173', host: 'localhost:5173' })), false);
});
test('save and reload are durable in the test store; a no-op does not write', async () => {
  const store = memoryStore(); const service = createFeatureService(store);
  const saved = await service.write(request()); assert.equal(saved.status, 200); assert.equal(store.writes, 1);
  const loaded = await service.read(true, false); assert.equal(loaded.body.snapshot.states.cinema, 'off');
  const noop = await service.write(request({ body: change({ revision: 1 }) }));
  assert.equal(noop.status, 200); assert.equal(noop.body.snapshot.revision, 1); assert.equal(store.writes, 1);
});
test('two simultaneous edits cannot overwrite each other', async () => {
  const store = memoryStore(); const service = createFeatureService(store);
  const results = await Promise.all([service.write(request()), service.write(request({ body: change({ key: 'shop' }) }))]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]); assert.equal(store.writes, 1);
});
test('database failures have generic messages and cannot report saved', async () => {
  const store = { read: async () => { throw new Error('TEST_PRIVATE_DATABASE_VALUE'); }, compareAndSet: async () => {} };
  for (const result of [await createFeatureService(store).read(true, false), await createFeatureService(store).write(request())]) {
    assert.equal(result.status, 503); assert.ok(!JSON.stringify(result).includes('TEST_PRIVATE_DATABASE_VALUE'));
  }
});
function sqlStore(execute) {
  return loader({ 'drizzle-orm': { sql: (strings, ...values) => ({ text: strings.join('?'), values }) }, '../db/client': { db: { execute } } })('src/server/admin-feature-controls/store.ts').featureStore;
}
test('SQL adapter: public read is SELECT-only and accepts MySQL JSON strings', async () => {
  const calls = []; const store = sqlStore(async query => { calls.push(query); return [[{ revision: '2', settings: JSON.stringify(M.defaultSettings()) }], []]; });
  const value = await store.read(false); assert.equal(value.revision, 2); assert.equal(calls.length, 1); assert.match(calls[0].text, /^SELECT/);
});
test('SQL adapter: authenticated init occurs once, uses bound values and preserves existing row', async () => {
  const calls = []; const store = sqlStore(async query => {
    calls.push(query); return query.text.startsWith('SELECT') ? [[{ revision: 0, settings: M.defaultSettings() }], []] : [{ affectedRows: 1 }, []];
  });
  await store.read(true); await store.read(true);
  assert.equal(calls.filter(q => q.text.startsWith('CREATE')).length, 1);
  assert.equal(calls.filter(q => q.text.startsWith('INSERT')).length, 1);
  assert.match(calls.find(q => q.text.startsWith('INSERT')).text, /ON DUPLICATE KEY UPDATE id = id/);
  await store.compareAndSet(0, M.defaultSettings());
  assert.deepEqual(calls.at(-1).values, [JSON.stringify(M.defaultSettings()), 0]);
  assert.match(calls.at(-1).text, /WHERE id = 1 AND revision = \?/);
});
test('SQL adapter rejects silent empty mock, corrupt JSON, missing row and lost update', async () => {
  for (const result of [[], [[], []], [[{ revision: 1, settings: '{bad' }], []], [[{ revision: NaN, settings: {} }], []]]) await assert.rejects(() => sqlStore(async () => result).read(false));
  await assert.rejects(() => sqlStore(async () => [{ affectedRows: 0 }, []]).compareAndSet(0, {}), e => e.status === 409);
  await assert.rejects(() => sqlStore(async () => []).compareAndSet(0, {}));
});
test('SQL adapter retries initialisation after failure', async () => {
  let failed = false;
  const store = sqlStore(async query => {
    if (!failed) { failed = true; throw new Error('synthetic unavailable'); }
    return query.text.startsWith('SELECT') ? [[{ revision: 0, settings: M.defaultSettings() }], []] : [{ affectedRows: 1 }, []];
  });
  await assert.rejects(() => store.read(true)); assert.equal((await store.read(true)).revision, 0);
});
test('HTTP client keeps private requests credentialled, public requests anonymous, and sends one namespaced action', async () => {
  const C = loader()(clientPath); const calls = [];
  const fetcher = async (url, init) => { calls.push({ url, init }); return { ok: true, json: async () => ({ success: true, snapshot: snapshot() }) }; };
  await C.requestFeatureSnapshot('/api/', { fetcher });
  await C.requestFeatureSnapshot('/api', { publicOnly: true, fetcher });
  await C.requestFeatureSnapshot('/api', { change: change(), fetcher });
  assert.equal(calls[0].init.credentials, 'include'); assert.equal(calls[1].init.credentials, 'omit');
  assert.equal(calls[0].init.cache, 'no-store'); assert.match(calls[1].url, /view=feature-availability$/);
  assert.deepEqual(JSON.parse(calls[2].init.body), change()); assert.equal(calls[2].init.headers['X-Sodafom-Admin-Action'], 'feature-control');
});
test('HTTP client rejects error/malformed responses without passing server error text to the view', async () => {
  const C = loader()(clientPath);
  await assert.rejects(() => C.requestFeatureSnapshot('/api', { fetcher: async () => ({ ok: false, status: 500, json: async () => ({ error: 'TEST_PRIVATE_VALUE' }) }) }), e => e.status === 500 && !e.message.includes('TEST_PRIVATE_VALUE'));
  await assert.rejects(() => C.requestFeatureSnapshot('/api', { fetcher: async () => ({ ok: true, json: async () => ({ success: true, snapshot: {} }) }) }));
});
test('HTTP timeout and caller cancellation abort pending requests', async () => {
  const C = loader()(clientPath);
  const fetcher = async (_url, init) => new Promise((_resolve, reject) => {
    if (init.signal.aborted) reject(new DOMException('Aborted', 'AbortError'));
    else init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  });
  await assert.rejects(() => C.requestFeatureSnapshot('/api', { timeoutMs: 5, fetcher }), e => e.name === 'AbortError');
  const controller = new AbortController(); controller.abort();
  await assert.rejects(() => C.requestFeatureSnapshot('/api', { signal: controller.signal, fetcher }), e => e.name === 'AbortError');
});
test('offline availability keeps last public state, with original defaults before first successful read', async () => {
  const C = loader()(clientPath); const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new Error('offline'); };
    assert.equal((await C.readPageAvailability('/api', new AbortController().signal)).states.games, 'on');
    const saved = snapshot(); saved.states.games = 'off'; saved.revision = 1;
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ success: true, snapshot: saved }) });
    await C.readPageAvailability('/api', new AbortController().signal);
    globalThis.fetch = async () => { throw new Error('offline'); };
    assert.equal((await C.readPageAvailability('/api', new AbortController().signal)).states.games, 'off');
  } finally { globalThis.fetch = previous; }
});
function routes(authorised = true) {
  const store = memoryStore(); let authChecks = 0, historyReads = 0;
  const record = { id: 1, status: 'approved_for_development' };
  const db = { select: () => ({ from: () => ({ orderBy: () => ({ limit: async () => { historyReads++; return [{ id: 1, instruction: 'Existing request' }]; } }), where: () => ({ limit: async () => [record] }) }) }), update: () => ({ set: value => ({ where: async () => { record.status = value.status; } }) }) };
  const local = loader({ 'drizzle-orm': { desc: x => x, and: (...x) => x, eq: (...x) => x }, '@/server/db/client': { db }, '@/server/db/schema': { founderChangeRequests: {} }, '@/server/admin-auth': { hasAdminAccess: async () => { authChecks++; return authorised; } }, '@/lib/founder-change-planner': { planFounderInstruction: () => ({}) }, '@/server/admin-feature-controls/store': { featureStore: store }, '@/server/admin-feature-controls/service': { createFeatureService } });
  return { store, get authChecks() { return authChecks; }, get historyReads() { return historyReads; }, get: local('src/server/api/admin/founder-changes/GET.ts').default, post: local('src/server/api/admin/founder-changes/POST.ts').default };
}
test('existing GET route dispatch: public minimal snapshot, private settings denied, history still private', async () => {
  const r = routes(false); const res = response();
  await r.get({ query: { view: 'feature-availability' } }, res);
  assert.equal(res.statusCode, 200); assert.equal(r.authChecks, 0); assert.deepEqual(r.store.reads, [false]); assert.equal(res.headers['Cache-Control'], 'no-store');
  const privateRes = response(); await r.get({ query: { view: 'feature-controls' } }, privateRes); assert.equal(privateRes.statusCode, 401);
  const historyRes = response(); await r.get({ query: {} }, historyRes); assert.equal(historyRes.statusCode, 401); assert.equal(r.historyReads, 0);
});
test('existing GET history still works for an owner', async () => {
  const r = routes(); const res = response(); await r.get({ query: {} }, res);
  assert.deepEqual(res.body, { success: true, changes: [{ id: 1, instruction: 'Existing request' }] }); assert.equal(r.historyReads, 1);
});
test('existing POST dispatch: auth gate, new action, existing development-only approval', async () => {
  const denied = routes(false); const bad = response(); await denied.post({ body: change() }, bad); assert.equal(bad.statusCode, 401); assert.equal(denied.store.writes, 0);
  const r = routes(); const res = response();
  const headers = { Origin: 'https://owner.example', Host: 'owner.example', 'Content-Type': 'application/json', 'X-Sodafom-Admin-Action': 'feature-control' };
  await r.post({ body: change(), get: name => headers[name] }, res); assert.equal(res.statusCode, 200); assert.equal(r.store.writes, 1);
  const approval = response(); await r.post({ body: { action: 'approve', id: 1 } }, approval);
  assert.equal(approval.body.change.status, 'approved_for_development'); assert.equal(r.store.writes, 1);
});

// Lightweight hook-driver tests exercise the boundary decisions and abort logic.
// They do not replace browser tests using the installed React/React Router versions.
function boundaryDriver() {
  let location = { pathname: '/', key: 'home' }, state = null, effect, previousDeps, cleanup;
  const pending = [];
  const local = loader({
    react: { useState: () => [state, value => { state = value; }], useEffect: (fn, deps) => { if (!previousDeps || deps.some((x, i) => x !== previousDeps[i])) { cleanup?.(); effect = fn; previousDeps = deps; } } },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-router': { useLocation: () => location, Link: 'Link' }, '@/lib/config': { API_PREFIX: '/api' },
    './feature-controls-client': { readPageAvailability: (_prefix, signal) => new Promise(resolve => pending.push({ signal, resolve })) },
  });
  const { AdminFeatureAvailability } = local('src/components/admin/AdminFeatureAvailability.tsx');
  const child = { type: 'ACTIVITY' };
  return { child, pending,
    render(pathname, key = pathname) { location = { pathname, key }; const value = AdminFeatureAvailability({ children: child }); if (effect) { const fn = effect; effect = undefined; cleanup = fn(); } return value; },
    unmount() { cleanup?.(); },
  };
}
test('boundary: protected pages mount immediately without availability calls', () => {
  const d = boundaryDriver(); assert.equal(d.render('/admin-panel'), d.child); assert.equal(d.render('/hub/subscription'), d.child); assert.equal(d.pending.length, 0);
});
test('boundary: activity waits for availability, then starts once and is not polled mid-activity', async () => {
  const d = boundaryDriver(); assert.notEqual(d.render('/games/number-pop'), d.child);
  d.pending[0].resolve(snapshot()); await Promise.resolve();
  assert.equal(d.render('/games/number-pop'), d.child); assert.equal(d.pending.length, 1);
  assert.equal(d.render('/games/number-pop'), d.child); assert.equal(d.pending.length, 1);
});
test('boundary: disabled page has a friendly message and Home link instead of mounting activity', async () => {
  const d = boundaryDriver(); d.render('/games/number-pop'); const off = snapshot(); off.states.games = 'off';
  d.pending[0].resolve(off); await Promise.resolve(); const rendered = d.render('/games/number-pop');
  assert.notEqual(rendered, d.child); assert.match(JSON.stringify(rendered), /taking a little break/); assert.match(JSON.stringify(rendered), /Back to Home/);
});
test('boundary: navigation and unmount ignore stale requests; new history entry rechecks', async () => {
  const d = boundaryDriver(); d.render('/games/number-pop', '1'); d.render('/reading', '2');
  assert.equal(d.pending[0].signal.aborted, true);
  d.pending[0].resolve(snapshot()); await Promise.resolve(); assert.notEqual(d.render('/reading', '2'), d.child);
  d.pending[1].resolve(snapshot()); await Promise.resolve(); assert.equal(d.render('/reading', '2'), d.child);
  assert.notEqual(d.render('/reading', '3'), d.child); assert.equal(d.pending.length, 3);
  d.unmount(); assert.equal(d.pending[2].signal.aborted, true);
});
