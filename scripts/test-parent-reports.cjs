/* Run: node --test scripts/test-parent-reports.cjs (uses the project's TypeScript dev dependency).
 * Isolated calculation/API/component-contract tests. React, database, content and network are mocked.
 * This is not a browser, a live Stripe test, or a substitute for the full Vite build.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const FILES = ['src/lib/parent-reports.ts', 'src/server/api/parent/dashboard/GET.ts',
  'src/components/parent/usePrivateGet.ts', 'src/components/parent/ParentSubscriptionStatus.tsx',
  'src/components/parent/ParentChildReport.tsx', 'src/pages/parent-dashboard.tsx'];
function source(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function compile(file) {
  const output = ts.transpileModule(source(file), { fileName: file, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, strict: true } });
  assert.equal((output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, file);
  return output.outputText;
}
function load(file, mocks = {}) {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compile(file))((id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    throw new Error(`Unmocked dependency: ${id}`);
  }, module, module.exports);
  return module.exports;
}
const model = load(FILES[0]);
const child = { id: 1, name: 'Test Learner', age_group: '8-10', total_stars: 12 };
const now = new Date('2026-09-13T10:00:00Z');
const catalog = [{ id: 'game-number-pop', title: 'Number Pop', slug: 'number-pop' },
  { id: 'game-reading-quest', title: 'Reading Quest', slug: 'reading-quest' }];
const gameIds = model.knownGameIds(catalog);
function row(id, overrides = {}) {
  return { id, child_id: 1, subject: 'maths', activity_id: 'number-pop', activity_title: 'Number Pop',
    score: 8, max_score: 10, duration_seconds: 60, stars_earned: 2, completed_at: '2026-09-12T10:00:00Z', ...overrides };
}
function report(rows = [], overrides = {}) { return model.buildChildReport(child, rows, { days: 30, now, gameIds, ...overrides }); }
function category(data, kind) { return data.categories.find(c => c.kind === kind); }
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }

// Minimal hook/JSX runner: exercises source callbacks and rendered contracts, not real React layout.
function hooks() {
  const slots = [], effects = [];
  let cursor = 0;
  const same = (a, b) => a && b && a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ?? (slots[i] = { current: initial }); },
    useCallback(fn, deps) { const i = cursor++; if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { deps, fn }; return slots[i].fn; },
    useEffect(fn, deps) { const i = cursor++; if (!slots[i] || !same(slots[i].deps, deps)) {
      effects.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; });
    } },
  };
  return { react, render(fn) { cursor = 0; const result = fn(); effects.splice(0).forEach(fn => fn()); return result; },
    unmount() { slots.forEach(slot => slot?.cleanup?.()); } };
}
const jsx = { jsx: (type, props, key) => ({ type, props, key }), jsxs: (type, props, key) => ({ type, props, key }), Fragment: 'fragment' };
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join(' ');
  if (tree && typeof tree === 'object') return text(tree.props?.children);
  return tree === null || tree === undefined || typeof tree === 'boolean' ? '' : String(tree);
}
function button(tree, label) { const found = nodes(tree).find(n => n.type === 'button' && text(n) === label); assert.ok(found, label); return found; }
function uiMocks(h, query) {
  return { react: h.react, 'react/jsx-runtime': jsx, 'react-router': { Link: 'Link' },
    '@/lib/config': { API_PREFIX: '/api' }, './usePrivateGet': { usePrivateGet: query } };
}
function environment(t, overrides = {}) {
  const oldWindow = global.window, oldFetch = global.fetch;
  global.window = { setTimeout, clearTimeout, confirm: () => true, print: () => {}, ...overrides };
  global.fetch = async () => { throw new Error('Unexpected network call'); };
  t.after(() => { global.window = oldWindow; global.fetch = oldFetch; });
}

for (const file of FILES) test(`TypeScript/TSX syntax: ${file}`, () => compile(file));
test('strict child identifiers reject partial, negative, fractional, array and unsafe IDs', () => {
  assert.equal(model.parseChildId('12'), 12);
  for (const value of [undefined, null, 1, '1x', '1.5', '-1', '0', '01', ' 1', ['1'], '9007199254740992']) assert.equal(model.parseChildId(value), null);
});
test('report period defaults to 30 and accepts only 7, 30, 90 days', () => {
  assert.equal(model.parseReportDays(undefined), 30);
  for (const value of ['7', '30', '90']) assert.equal(model.parseReportDays(value), Number(value));
  for (const value of ['0', '365', '', ['30'], 30]) assert.equal(model.parseReportDays(value), null);
});
test('actual camelCase child API array is normalised and sensitive extra fields are discarded', () => {
  assert.deepEqual(model.parseChildren([{ id: 1, name: child.name, ageGroup: '8-10', totalStars: 12, parentId: 'private', email: 'private' }]), [child]);
});
test('legacy child envelope, numeric strings and empty families work', () => {
  assert.deepEqual(model.parseChildren({ children: [{ ...child, id: '1', total_stars: '12' }] }), [child]);
  assert.deepEqual(model.parseChildren([]), []);
  assert.equal(model.parseChildren([{ id: 2, name: 'New', totalStars: -1 }])[0].total_stars, 0);
});
test('malformed child responses and duplicate child IDs do not silently become empty families', () => {
  for (const value of [null, {}, { error: 'No' }, [null], [{ id: 0, name: 'No' }], [child, child]]) assert.throws(() => model.parseChildren(value));
});
test('score calculation normalises different denominators and preserves genuine zero', () => {
  assert.equal(model.scorePercent(25, 50), 50); assert.equal(model.scorePercent('8', '10'), 80); assert.equal(model.scorePercent(0, 10), 0);
});
test('missing/impossible scores are unassessed rather than failures', () => {
  for (const [s, max] of [[null, 10], [undefined, 100], ['', 10], [false, 10], [10, 0], [-1, 10], [11, 10], [Infinity, 100], [8, null]]) assert.equal(model.scorePercent(s, max), null);
});
test('all four activity categories stay distinct; recognised reading games count only as games', () => {
  const data = report([row(1), row(2, { activity_id: 'lesson-maths-1' }), row(3, { activity_id: 'reading-book-1', subject: 'reading' }),
    row(4, { activity_id: 'homework-1' }), row(5, { activity_id: 'reading-quest', subject: 'reading' }), row(6, { activity_id: 'legacy-mystery' })]);
  assert.equal(category(data, 'games').sessions, 2);
  for (const kind of ['lessons', 'reading', 'homework', 'other']) assert.equal(category(data, kind).sessions, 1);
  assert.equal(data.categories.reduce((n, c) => n + c.sessions, 0), 6);
});
test('catalog IDs include current GameShell title-derived activity IDs', () => {
  assert.ok(gameIds.has('number-pop')); assert.ok(gameIds.has('game-number-pop'));
  assert.equal(model.activityKind('game-new-one', 'science', gameIds), 'games');
  assert.equal(model.activityKind('scan-reading:page', 'english', gameIds), 'reading');
  assert.equal(model.activityKind('scan-homework:page', 'maths', gameIds), 'homework');
});
test('child isolation uses IDs, deduplicates records and rejects invalid/future/out-of-period records', () => {
  const data = report([row(1), row(1), row(2, { child_id: 2 }), row(3, { completed_at: 'invalid' }), row(4, { completed_at: '2026-09-14' }),
    row(5, { completed_at: '2026-01-01' }), row(6, { completed_at: null }), row(-1)]);
  assert.equal(data.totalSessions, 1); assert.deepEqual(data.recent.map(x => x.id), [1]);
});
test('date boundaries are inclusive and totals are period-specific', () => {
  const data = report([row(1, { completed_at: '2026-09-06T10:00:00Z' }), row(2, { completed_at: now }), row(3, { completed_at: '2026-09-06T09:59:59Z' })], { days: 7 });
  assert.equal(data.totalSessions, 2); assert.equal(data.days, 7);
});
test('empty report does not assert failures or strengths and offers an honest introductory choice', () => {
  const data = report(); assert.equal(data.totalSessions, 0); assert.equal(data.strengths.length, 0); assert.equal(data.needsHelp.length, 0);
  assert.ok(data.categories.every(c => c.averageScore === null)); assert.match(data.recommendations[0].reason, /not enough/i);
  assert.equal(data.recommendations[0].href, '/lesson-library');
});
test('minimum evidence and exact 80/60 percent thresholds are respected', () => {
  assert.equal(report([row(1), row(2)]).subjects[0].status, 'early');
  assert.equal(report([row(1), row(2), row(3)]).subjects[0].status, 'strength');
  for (const [score, status] of [[59, 'practice'], [60, 'building'], [79, 'building'], [80, 'strength']]) {
    assert.equal(report([1, 2, 3].map(id => row(id, { score, max_score: 100 }))).subjects[0].status, status);
  }
});
test('unmarked activities do not increase strength/support sample size', () => {
  const data = report([row(1, { score: 0 }), row(2, { score: null }), row(3, { score: null })]);
  assert.equal(data.subjects[0].assessed, 1); assert.equal(data.needsHelp.length, 0); assert.equal(category(data, 'games').averageScore, 0);
});
test('means and trends use percentage scores, chronological order and sufficient evidence', () => {
  const data = report([row(4, { score: 10 }), row(2, { score: 50, max_score: 100 }), row(1, { score: 5 }), row(3, { score: 100, max_score: 100 })]);
  assert.equal(data.subjects[0].averageScore, 75); assert.equal(data.subjects[0].trend, 50);
  assert.equal(report([row(1), row(2), row(3)]).subjects[0].trend, null);
});
test('next lessons prioritise support, stay age-aware, and use verified local routes', () => {
  const data = report([1, 2, 3].flatMap(id => [row(id), row(id + 10, { subject: 'reading', activity_id: 'book-one', score: 3 })]));
  assert.match(data.recommendations[0].title, /^Reading/); assert.equal(data.recommendations[0].href, '/reading');
  assert.ok(data.recommendations.every(x => ['/reading', '/lesson-library'].includes(x.href)));
  assert.match(data.recommendations[0].guidance, /8-10/);
});
test('unknown/prototype-like subjects cannot inject navigation or corrupt grouping', () => {
  const data = report([row(1, { subject: '__proto__' }), row(2, { subject: 'constructor' }), row(3, { subject: 'javascript:alert(1)' })]);
  assert.equal(data.subjects.length, 3); assert.equal(data.recommendations.length, 1); assert.equal(data.recommendations[0].href, '/lesson-library');
});
test('recent list is newest-first and limited to 20; partial flag is preserved', () => {
  const data = report(Array.from({ length: 30 }, (_, i) => row(i + 1)), { truncated: true });
  assert.equal(data.recent.length, 20); assert.equal(data.recent[0].id, 30); assert.equal(data.totalSessions, 30); assert.equal(data.truncated, true);
});

async function api({ session = { user: { id: 'parent-A' } }, query = { childId: '1' }, childRows = [child], activityRows = [], failure = false } = {}) {
  const queries = [], headers = {};
  const handler = load(FILES[1], {
    '@/server/db/client': { db: { execute: async sql => { queries.push(sql); if (failure) throw new Error('secret SQL parent details'); return [queries.length === 1 ? childRows : activityRows]; } } },
    'drizzle-orm': { sql: (strings, ...values) => ({ text: strings.join('?'), values }) },
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => session } }) },
    'virtual:content': { games: { games: catalog } }, '@/lib/parent-reports': model,
  }).default;
  const response = { code: 200, setHeader(k, v) { headers[k] = v; }, vary(value) { headers.Vary = [headers.Vary, value].filter(Boolean).join(', '); }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({ headers: {}, query }, response);
  return { ...response, queries, headers };
}
test('report API rejects unauthenticated reads without querying child records', async () => {
  const result = await api({ session: null }); assert.equal(result.code, 401); assert.equal(result.queries.length, 0);
});
test('report API rejects malformed IDs and periods before reading records', async () => {
  for (const query of [{ childId: '1x' }, { childId: ['1'] }, { childId: '1', days: '365' }, {}]) {
    const result = await api({ query }); assert.equal(result.code, 400); assert.equal(result.queries.length, 0);
  }
});
test('missing or non-owned child returns a non-enumerating 404 without querying activity', async () => {
  const result = await api({ childRows: [] }); assert.equal(result.code, 404); assert.equal(result.queries.length, 1);
  assert.match(result.queries[0].text, /parent_id = \?/); assert.ok(result.queries[0].values.includes('parent-A'));
});
test('report API scopes both reads to the authenticated parent, limits records and never writes', async () => {
  const result = await api({ activityRows: [row(1, { completed_at: new Date() })] });
  assert.equal(result.code, 200); assert.equal(result.body.report.childId, 1); assert.equal(result.body.report.totalSessions, 1);
  assert.equal(result.queries.length, 2);
  assert.ok(result.queries.every(q => /^\s*SELECT/.test(q.text) && q.values.includes('parent-A')));
  assert.match(result.queries[1].text, /FROM activity_sessions/); assert.ok(result.queries[1].values.includes(501));
});
test('API reports the 500-record cap explicitly instead of silently claiming full history', async () => {
  const result = await api({ activityRows: Array.from({ length: 501 }, (_, i) => row(i + 1, { completed_at: new Date() })) });
  assert.equal(result.body.report.totalSessions, 500); assert.equal(result.body.report.truncated, true);
});
test('error responses never expose database errors; all outcomes use private no-store headers', async () => {
  for (const config of [{}, { session: null }, { childRows: [] }, { failure: true }, { query: {} }]) {
    const result = await api(config); assert.match(result.headers['Cache-Control'], /private, no-store/); assert.equal(result.headers.Vary, 'Cookie');
    assert.doesNotMatch(JSON.stringify(result.body), /secret SQL/);
    if (config.failure) assert.equal(result.code, 500);
  }
});

test('client report parser rejects a different child and strips extra profile fields', () => {
  const h = hooks(); const parser = load(FILES[4], uiMocks(h, () => ({}))).parseDashboard;
  const data = { child: { ...child, parent_id: 'private' }, report: report() };
  assert.equal(parser(data, 1).child.parent_id, undefined);
  assert.throws(() => parser(data, 2)); assert.throws(() => parser({ ...data, report: { ...data.report, childId: 2 } }, 1));
});
test('report component shows all four empty sections, unknown data explanation and chosen-child print', () => {
  const h = hooks(); const Component = load(FILES[4], uiMocks(h, () => ({ data: { child, report: report() }, loading: false, error: '', reload() {} }))).default;
  const tree = h.render(() => Component({ childId: 1, days: 30 }));
  for (const label of ['Lessons', 'Games', 'Reading', 'Homework']) assert.ok(nodes(tree).some(n => n.type === 'h3' && text(n) === label));
  assert.match(text(tree), /unknown activity, not failure/); button(tree, 'Print selected report'); button(tree, 'Save private report');
});
test('report component exposes a retry on failure and never displays a stale report while loading', () => {
  const h = hooks(); let result = { data: null, loading: false, error: 'Access denied', reload() {} };
  const Component = load(FILES[4], uiMocks(h, () => result)).default;
  assert.match(text(h.render(() => Component({ childId: 1, days: 30 }))), /Access denied/);
  result = { data: { child, report: report() }, loading: true, error: '', reload() {} };
  assert.doesNotMatch(text(h.render(() => Component({ childId: 1, days: 30 }))), /Test Learner/);
});
test('subscription parser understands actual API response and treats errors as unknown, not inactive', () => {
  const h = hooks(); const parser = load(FILES[3], uiMocks(h, () => ({}))).parseSubscription;
  assert.equal(parser({ subscribed: true, plan: 'monthly', stripeKey: 'private' }).plan, 'monthly');
  assert.equal(parser({ subscribed: true, stripeKey: 'private' }).stripeKey, undefined);
  assert.throws(() => parser({ subscribed: false, error: 'failed' })); assert.throws(() => parser({}));
});
function subscriptionHarness(data, queryError = '') {
  const h = hooks(); let reloads = 0;
  const Component = load(FILES[3], uiMocks(h, () => ({ data, loading: false, error: queryError, reload: () => reloads++ }))).default;
  return { render: () => h.render(Component), unmount: h.unmount, reloads: () => reloads };
}
test('subscription display uses actual active plan without invented prices or billing dates', () => {
  const view = subscriptionHarness({ subscribed: true, plan: 'monthly' }); const tree = view.render();
  assert.match(text(tree), /Active monthly plan/); assert.doesNotMatch(text(tree), /£|Next billing date/); button(tree, 'Cancel subscription'); view.unmount();
});
test('unknown or non-recurring subscription never offers cancellation', () => {
  for (const data of [null, { subscribed: false }, { subscribed: true, plan: 'school' }, { subscribed: true, plan: 'promo' }]) {
    const view = subscriptionHarness(data, data ? '' : 'Status unavailable');
    assert.ok(!nodes(view.render()).some(n => n.type === 'button' && text(n) === 'Cancel subscription')); view.unmount();
  }
});
test('declining immediate-access cancellation confirmation makes no request', async t => {
  environment(t, { confirm: message => { assert.match(message, /immediately/); return false; } }); let calls = 0;
  global.fetch = async () => { calls++; return { ok: true, json: async () => ({ ok: true }) }; };
  const view = subscriptionHarness({ subscribed: true, plan: 'annual' }); button(view.render(), 'Cancel subscription').props.onClick();
  await flush(); assert.equal(calls, 0); view.unmount();
});
test('confirmed cancellation uses only the existing endpoint and blocks double-click requests', async t => {
  environment(t); const pending = deferred(), calls = [];
  global.fetch = async (url, options) => { calls.push({ url, options }); await pending.promise; return { ok: true, json: async () => ({ ok: true }) }; };
  const view = subscriptionHarness({ subscribed: true, plan: 'monthly' }); const click = button(view.render(), 'Cancel subscription').props.onClick;
  click(); click(); assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/subscription/cancel');
  assert.equal(calls[0].options.method, 'POST'); assert.equal(calls[0].options.body, '{}'); assert.equal(calls[0].options.credentials, 'include');
  pending.resolve(); await flush(); assert.match(text(view.render()), /Cancellation confirmed/); assert.equal(view.reloads(), 1); view.unmount();
});
test('failed cancellation never claims success or retries a payment automatically', async t => {
  environment(t); let calls = 0;
  global.fetch = async () => { calls++; return { ok: false, json: async () => ({ error: 'provider details' }) }; };
  const view = subscriptionHarness({ subscribed: true, plan: 'monthly' }); button(view.render(), 'Cancel subscription').props.onClick(); await flush();
  assert.match(text(view.render()), /could not be confirmed/); assert.doesNotMatch(text(view.render()), /provider details|Cancellation confirmed/);
  assert.equal(calls, 1); view.unmount();
});
test('private reads send cookies/no-store and discard late responses after switching child', async t => {
  environment(t); const requests = [];
  global.fetch = (url, options) => { const d = deferred(); requests.push({ url, options, ...d }); return d.promise; };
  const h = hooks(), parse = value => value;
  const hook = load(FILES[2], { react: h.react, '@/lib/config': { API_PREFIX: '/api' } }).usePrivateGet;
  h.render(() => hook('/child/1', parse)); h.render(() => hook('/child/2', parse));
  assert.equal(requests[0].options.signal.aborted, true); assert.equal(requests[1].options.cache, 'no-store'); assert.equal(requests[1].options.credentials, 'include');
  requests[1].resolve({ ok: true, json: async () => ({ childId: 2 }) }); await flush();
  requests[0].resolve({ ok: true, json: async () => ({ childId: 1 }) }); await flush();
  assert.equal(h.render(() => hook('/child/2', parse)).data.childId, 2); h.unmount();
});
test('private read clears existing data before path changes and while refreshing', async t => {
  environment(t); global.fetch = async () => ({ ok: true, json: async () => ({ childId: 1 }) });
  const h = hooks(), parse = value => value;
  const hook = load(FILES[2], { react: h.react, '@/lib/config': { API_PREFIX: '/api' } }).usePrivateGet;
  h.render(() => hook('/child/1', parse)); await flush(); const first = h.render(() => hook('/child/1', parse)); assert.ok(first.data);
  first.reload(); assert.equal(h.render(() => hook('/child/1', parse)).data, null);
  assert.equal(h.render(() => hook('/child/2', parse)).data, null); h.unmount();
});
test('expired-session private reads show a sign-in error, not empty or cached children', async t => {
  environment(t); global.fetch = async () => ({ ok: false, status: 401 });
  const h = hooks(), parse = value => value;
  const hook = load(FILES[2], { react: h.react, '@/lib/config': { API_PREFIX: '/api' } }).usePrivateGet;
  h.render(() => hook('/children', parse)); await flush(); const result = h.render(() => hook('/children', parse));
  assert.equal(result.data, null); assert.match(result.error, /sign in again/); h.unmount();
});
test('dashboard remount keys separate parents, children and periods; no shared tutor memory or payload logs', () => {
  const page = source(FILES[5]); assert.match(page, /key=\{user.id\}/); assert.match(page, /key=\{`\$\{selected.id\}:\$\{days\}`\}/);
  assert.match(page, /ProtectedRoute/);
  for (const file of FILES) assert.doesNotMatch(source(file), /localStorage|sessionStorage|loadTutorMemory|console\.log|console\.error/);
});
