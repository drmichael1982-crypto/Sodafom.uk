/* Focused offline regression checks for the Agent 17 recovery patch.
 * Run: node --test scripts/agent17-security.test.cjs
 * No network, database, device, or provider access is performed.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');

function sandbox(env = {}, mocks = {}, globals = {}) {
  const logs = [];
  const cache = new Map();
  const context = vm.createContext({
    Buffer, URL, Headers, Request, Response, Error, Date, Blob,
    process: { env: { NODE_ENV: 'production', ...env } },
    console: Object.fromEntries(['log', 'error', 'warn'].map((level) => [
      level,
      (...args) => logs.push(args),
    ])),
    ...globals,
  });

  function load(relative) {
    const file = path.resolve(ROOT, relative);
    if (cache.has(file)) return cache.get(file).exports;
    const source = fs.readFileSync(file, 'utf8');
    const compiled = ts.transpileModule(source, {
      fileName: file,
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    assert.deepEqual(
      (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error),
      [],
      relative,
    );
    const mod = { exports: {} };
    cache.set(file, mod);

    function localRequire(spec) {
      if (Object.hasOwn(mocks, spec)) return mocks[spec];
      if (spec.startsWith('node:')) return require(spec);
      const candidate = spec.startsWith('@/')
        ? path.join(ROOT, 'src', spec.slice(2))
        : spec.startsWith('.')
          ? path.resolve(path.dirname(file), spec)
          : null;
      if (candidate) {
        for (const suffix of ['', '.ts', '.tsx']) {
          if (fs.existsSync(candidate + suffix)) return load(candidate + suffix);
        }
      }
      throw new Error('Unmocked dependency: ' + spec);
    }

    const execute = vm.runInContext(
      '(function(require,module,exports){' + compiled.outputText + '\n})',
      context,
      { filename: file },
    );
    execute(localRequire, mod, mod.exports);
    return mod.exports;
  }

  return { load, logs };
}

function req(overrides = {}) {
  return {
    method: 'POST',
    path: '/api/example',
    headers: {},
    query: {},
    body: {},
    ...overrides,
  };
}

function res() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    headersSent: false,
    setHeader(key, value) { this.headers[String(key).toLowerCase()] = value; return this; },
    vary(value) {
      const old = this.headers.vary || '';
      this.headers.vary = [...new Set([...old.split(',').map((v) => v.trim()).filter(Boolean), value])].join(', ');
      return this;
    },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
    type(value) { this.setHeader('Content-Type', value); return this; },
    send(value) { this.body = value; return this; },
    end() { this.ended = true; return this; },
  };
}

test('trusted origins use exact production entries and explicit preview configuration', () => {
  const origin = sandbox().load('src/lib/auth/trusted-origins.ts');
  for (const value of [
    'https://sodafom.uk',
    'https://www.sodafom.uk',
    'https://app.sodafom.uk',
    'http://localhost',
    'https://localhost',
    'capacitor://localhost',
  ]) assert.equal(origin.isTrustedOrigin(value), true, value);

  for (const value of [
    'https://evil.example',
    'https://sodafom.uk.evil.example',
    'https://other.sodafom.uk',
    'https://anything.airoapp.ai',
    'https://sodafom.uk/path',
    'https://user@sodafom.uk',
    'http://sodafom.uk',
  ]) assert.equal(origin.isTrustedOrigin(value), false, value);

  const preview = sandbox({
    SODAFOM_TRUSTED_ORIGINS: 'https://preview.airoapp.ai,https://x.example/path,http://bad.example',
  }).load('src/lib/auth/trusted-origins.ts');
  assert.equal(preview.isTrustedOrigin('https://preview.airoapp.ai'), true);
  assert.equal(preview.isTrustedOrigin('https://other.airoapp.ai'), false);
});

test('development loopback ports never broaden production trust', () => {
  const dev = sandbox({ NODE_ENV: 'development' }).load('src/lib/auth/trusted-origins.ts');
  assert.equal(dev.isTrustedOrigin('http://localhost:5173'), true);
  assert.equal(dev.isTrustedOrigin('http://127.0.0.1:5173'), true);
  const prod = sandbox().load('src/lib/auth/trusted-origins.ts');
  assert.equal(prod.isTrustedOrigin('http://localhost:5173'), false);
});

test('HTTP security rejects unknown credentialed API origins and preserves safe webhook requests', () => {
  const { httpSecurity } = sandbox().load('src/server/http-security.ts');
  for (const method of ['GET', 'POST', 'OPTIONS']) {
    const output = res();
    let reached = false;
    httpSecurity(req({ method, headers: { origin: 'https://evil.example' } }), output, () => { reached = true; });
    assert.equal(reached, false);
    assert.equal(output.statusCode, 403);
    assert.equal(output.headers['access-control-allow-origin'], undefined);
  }
  const webhook = res();
  let webhookReached = false;
  httpSecurity(req({ path: '/api/webhook/stripe' }), webhook, () => { webhookReached = true; });
  assert.equal(webhookReached, true);
  assert.equal(webhook.headers['access-control-allow-origin'], undefined);
});

test('HTTP security permits configured origins, private API cache controls, and preflights', () => {
  const { httpSecurity } = sandbox().load('src/server/http-security.ts');
  const allowed = res();
  let reached = false;
  httpSecurity(req({ headers: { origin: 'https://sodafom.uk' } }), allowed, () => { reached = true; });
  assert.equal(reached, true);
  assert.equal(allowed.headers['access-control-allow-origin'], 'https://sodafom.uk');
  assert.equal(allowed.headers['access-control-allow-credentials'], 'true');
  assert.equal(allowed.headers['cache-control'], 'private, no-store');
  assert.equal(allowed.headers['permissions-policy'], 'camera=(self), microphone=(self)');

  const preflight = res();
  httpSecurity(req({ method: 'OPTIONS', headers: { origin: 'https://sodafom.uk' } }), preflight, () => {
    throw new Error('preflight should stop');
  });
  assert.equal(preflight.statusCode, 204);
  assert.equal(preflight.ended, true);
});

test('headerless browser writes cannot bypass origin checks', () => {
  const { httpSecurity } = sandbox().load('src/server/http-security.ts');
  for (const site of ['same-site', 'cross-site']) {
    const output = res();
    let reached = false;
    httpSecurity(req({ headers: { 'sec-fetch-site': site } }), output, () => { reached = true; });
    assert.equal(reached, false);
    assert.equal(output.statusCode, 403);
  }
});

test('API error handler redacts request paths, query values, and raw errors', () => {
  const box = sandbox();
  const { apiErrorHandler, requestMetadata } = box.load('src/server/http-security.ts');
  const output = res();
  apiErrorHandler(new Error('PRIVATE_VALUE database failure'), req({
    path: '/api/parent/private-child',
    url: '/api/parent/private-child?token=PRIVATE_VALUE',
  }), output, () => {});
  assert.equal(output.statusCode, 500);
  assert.equal(JSON.stringify([output.body, box.logs]).includes('PRIVATE_VALUE'), false);
  assert.equal(JSON.stringify(box.logs).includes('private-child'), false);
  const metadata = requestMetadata(req({ path: '/api/children/42' }));
  assert.equal(metadata.method, 'POST');
  assert.equal(metadata.area, 'children');
});

function authConfig() {
  let config;
  const emails = [];
  const box = sandbox({}, {
    'better-auth': { betterAuth: (value) => { config = value; return {}; } },
    'better-auth/adapters/drizzle': { drizzleAdapter: () => ({}) },
    '@/server/db/client': { db: {} },
    '@/server/db/schema': {},
    '#airo/secrets': { getSecret: () => 'test-only-secret' },
    '@/server/email': { sendEmail: async (value) => emails.push(value) },
  });
  return { auth: box.load('src/lib/auth/auth.ts'), config: () => config, emails, box };
}

test('authentication restores CSRF checks, exact origins, and HTML/log privacy', async () => {
  const fixture = authConfig();
  fixture.auth.getAuth();
  const config = fixture.config();
  assert.equal(config.advanced.disableCSRFCheck, false);
  assert.equal(config.user.additionalFields.role.input, false);
  assert.equal(config.user.additionalFields.isAdmin.input, false);
  assert.equal(
    config.trustedOrigins(new Request('https://sodafom.uk', { headers: { origin: 'https://evil.example' } }))
      .includes('https://evil.example'),
    false,
  );
  await config.databaseHooks.user.create.after({
    name: '<img src=x>',
    email: 'fixture@example.invalid',
    phoneNumber: '<b>PRIVATE_PHONE</b>',
  });
  assert.equal(fixture.emails[0].html.includes('<img src=x>'), false);
  assert.equal(JSON.stringify(fixture.box.logs).includes('fixture@example.invalid'), false);
  assert.equal(JSON.stringify(fixture.box.logs).includes('PRIVATE_PHONE'), false);
});

test('auth middleware neither clones rejected bodies nor reflects infrastructure details', async () => {
  const rejected = { ok: false, status: 401, clone: () => { throw new Error('must not clone'); } };
  const first = sandbox({}, {
    '@/lib/auth/auth': { getAuth: () => ({ handler: async () => rejected }) },
    '@/lib/auth/express-adapter': { toWebRequest: (value) => value, sendWebResponse: async () => {} },
    '@/lib/auth/session-cookies': { tryClearStaleSession: () => false },
  });
  await first.load('src/server/auth-middleware.ts').authHandler(req({ path: '/api/auth/PRIVATE_VALUE' }), res());
  assert.equal(JSON.stringify(first.logs).includes('PRIVATE_VALUE'), false);

  const unavailable = sandbox({}, {
    '@/lib/auth/auth': { getAuth: () => { throw new Error('ECONNREFUSED PRIVATE_VALUE'); } },
    '@/lib/auth/express-adapter': {},
    '@/lib/auth/session-cookies': { tryClearStaleSession: () => false },
  });
  const output = res();
  await unavailable.load('src/server/auth-middleware.ts').authHandler(req(), output);
  assert.equal(output.statusCode, 503);
  assert.equal(JSON.stringify([output.body, unavailable.logs]).includes('PRIVATE_VALUE'), false);
});

test('parent reports validate role and child IDs before data queries', async () => {
  const queries = [];
  const db = {
    execute: async (query) => {
      queries.push(query);
      return [[]];
    },
  };
  const box = sandbox({}, {
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => ({ user: { id: 'parent-a', role: 'child' } }) } }) },
    '@/server/db/client': { db },
    'drizzle-orm': { sql: (strings, ...values) => ({ text: strings.join('?'), values }) },
  });
  const handler = box.load('src/server/api/parent/dashboard/GET.ts').default;
  const output = res();
  await handler(req({ query: { childId: '7' } }), output);
  assert.equal(output.statusCode, 403);
  assert.equal(queries.length, 0);

  const parentBox = sandbox({}, {
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => ({ user: { id: 'parent-a', role: 'parent' } }) } }) },
    '@/server/db/client': { db: { execute: async () => { throw new Error('must not query'); } } },
    'drizzle-orm': { sql: () => ({}) },
  });
  const invalid = res();
  await parentBox.load('src/server/api/parent/dashboard/GET.ts').default(req({ query: { childId: '7x' } }), invalid);
  assert.equal(invalid.statusCode, 400);
});

test('child progress checks ownership before querying sensitive activity rows', async () => {
  const filters = [];
  const ownership = {
    from() { return this; },
    where(filter) { filters.push(filter); return this; },
    limit: async () => [],
  };
  const box = sandbox({}, {
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession: async () => ({ user: { id: 'parent-a' } }) } }) },
    '../../../../db/client.js': { db: { select: () => ownership } },
    '../../../../db/schema.js': { children: { id: 'child-id', parentId: 'parent-id', totalStars: 'total-stars' } },
    'drizzle-orm': { eq: (field, value) => [field, value], and: (...values) => values },
  });
  const output = res();
  await box.load('src/server/api/children/[childId]/progress/GET.ts').default(req({ params: { childId: '7' } }), output);
  assert.equal(output.statusCode, 404);
  assert.deepEqual(filters, [[['child-id', 7], ['parent-id', 'parent-a']]]);
});

test('photo responses disable retrievable response storage without a provider call', async () => {
  const calls = [];
  class OpenAI {
    constructor() {
      this.responses = {
        create: async (body) => {
          calls.push(body);
          return { output_text: 'Fixture explanation' };
        },
      };
    }
  }
  const box = sandbox({ OPENAI_API_KEY: 'test-only-key' }, { openai: OpenAI });
  const output = res();
  await box.load('src/server/api/ai-teacher/read-page/POST.ts').default(
    req({ body: { image: 'data:image/png;base64,dGVzdA==', age: 8 } }),
    output,
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].store, false);
  assert.equal(calls[0].model, 'gpt-4o-mini');
  assert.equal(output.body, 'Fixture explanation');
});

test('source-level regressions retain recorder cleanup, no-store routes, and middleware ordering', () => {
  const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
  const recorder = read('src/components/VoiceRecorder.tsx');
  assert.ok(recorder.includes('streamRef.current?.getTracks().forEach(track => track.stop())'));
  assert.ok(recorder.includes('reader.abort()'));
  assert.ok(recorder.includes('captureBusyRef.current'));

  const child = read('src/server/api/children/[childId]/progress/GET.ts');
  assert.ok(child.includes('eq(children.parentId, session.user.id)'));
  assert.ok(child.includes('Cache-Control'));
  assert.equal(child.includes('error: String(e)'), false);

  const entry = read('src/server/entry.ts');
  assert.ok(entry.indexOf('app.use(httpSecurity)') < entry.indexOf('app.use(express.json'));
  assert.ok(entry.includes('app.use("/api", apiErrorHandler)'));
  assert.equal(entry.includes('Access-Control-Allow-Origin'), false);
});
