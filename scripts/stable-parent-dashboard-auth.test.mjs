/** Integration checks for the merged Parent Dashboard + Agent29 role policy. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import * as policy from '../src/lib/auth/account-reliability.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const parentReports = {
  REPORT_LIMIT: 500,
  parseChildId(value) {
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number(raw);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  },
  parseReportDays(value) {
    if (value === undefined) return 30;
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number(raw);
    return [7, 30, 90].includes(parsed) ? parsed : null;
  },
  knownGameIds() { return new Set(); },
  buildChildReport(child, rows, options) {
    return { childId: child.id, activityCount: rows.length, days: options.days };
  },
};

function loadDashboard({ user, execute }) {
  const path = 'src/server/api/parent/dashboard/GET.ts';
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal(compiled.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} };
  const dependencies = {
    '@/lib/auth/account-reliability': policy,
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => user ? { user } : null } }) },
    '@/server/db/client': { db: { execute } },
    '@/lib/parent-reports': parentReports,
    'virtual:content': { games: { games: [] } },
    'drizzle-orm': { sql: (strings, ...values) => ({ strings, values }) },
  };
  const sandbox = {
    module, exports: module.exports, Buffer, Headers, Request, Response, Error, Date,
    process: { env: { NODE_ENV: 'test' } },
    console,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(compiled.outputText, sandbox, { filename: path });
  return module.exports.default;
}

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    varied: [],
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; return this; },
    vary(value) { this.varied.push(value); return this; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
  };
}

const req = { headers: {}, query: { childId: '7', days: '30' } };

for (const [label, user, expected] of [
  ['unauthenticated', null, 401],
  ['child', { id: 'child', role: 'child' }, 403],
  ['student', { id: 'student', role: 'student' }, 403],
  ['teacher', { id: 'teacher', role: 'teacher' }, 403],
  ['unknown role', { id: 'unknown', role: 'unknown' }, 403],
]) {
  test(`merged parent API denies ${label} before data access`, async () => {
    let queries = 0;
    const handler = loadDashboard({ user, execute: async () => { queries += 1; return [[]]; } });
    const res = response();
    await handler(req, res);
    assert.equal(res.statusCode, expected);
    assert.equal(queries, 0);
  });
}

test('merged parent API keeps child ownership restriction', async () => {
  let query;
  const handler = loadDashboard({
    user: { id: 'test-parent', role: 'parent' },
    execute: async q => { query = q; return [[]]; },
  });
  const res = response();
  await handler(req, res);
  assert.equal(res.statusCode, 404);
  assert.deepEqual(query.values, [7, 'test-parent']);
});

test('merged parent API returns an owned child only after role and ownership checks', async () => {
  const child = { id: 7, name: 'Test Child', age_group: '5-7', total_stars: 3 };
  const results = [[[child]], [[]]];
  let queries = 0;
  const handler = loadDashboard({
    user: { id: 'test-parent', role: 'parent' },
    execute: async () => { queries += 1; return results.shift(); },
  });
  const res = response();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.child.id, 7);
  assert.equal(res.body.report.childId, 7);
  assert.equal(res.body.report.days, 30);
  assert.equal(queries, 2);
  assert.equal(res.headers['cache-control'], 'private, no-store, max-age=0');
  assert.deepEqual(res.varied, ['Cookie']);
});
