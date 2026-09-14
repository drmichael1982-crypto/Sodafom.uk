// Isolated actual-source UI regression checks. No server imports or network calls.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToString } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
function compile(relative) {
  return ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}
function load(relative, mocks = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(compile(relative), { exports, require: name => {
    if (name in mocks) return mocks[name];
    if (name === 'react' || name === 'react/jsx-runtime') return require(name);
    throw Error(`Unexpected dependency: ${name}`);
  }, console, setTimeout, clearTimeout, ...globals });
  return exports;
}
const storagePath = 'src/lib/auth/browser-storage.ts';
for (const [label, window] of [
  ['SSR', undefined],
  ['blocked getter', { get localStorage() { throw Error('blocked'); }, get sessionStorage() { throw Error('blocked'); } }],
  ['blocked methods', { localStorage: { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } }, sessionStorage: { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } } }],
]) {
  test(`optional storage tolerates ${label}`, () => {
    const storage = load(storagePath, {}, { window });
    for (const kind of ['localStorage', 'sessionStorage']) {
      assert.equal(storage.readBrowserStorage(kind, 'email'), null);
      assert.doesNotThrow(() => storage.writeBrowserStorage(kind, 'email', 'test@example.test'));
      assert.doesNotThrow(() => storage.writeBrowserStorage(kind, 'email', null));
    }
  });
  test(`actual login renders with ${label}`, () => {
    const storage = load(storagePath, {}, { window });
    const { default: Login } = load('src/pages/hub/login.tsx', {
      '@dr.pogodin/react-helmet': { Helmet: () => null },
      'react-router': { useNavigate: () => () => {}, useLocation: () => ({}), useSearchParams: () => [new URLSearchParams()], Link: ({ children }) => React.createElement('a', null, children) },
      'motion/react': { motion: { div: ({ children }) => React.createElement('div', null, children) } },
      '@/lib/auth/auth-client': { signIn: {} },
      '@/lib/auth/browser-storage': storage,
      '@/lib/auth/safe-redirect': load('src/lib/auth/safe-redirect.ts'),
      '@/lib/config': { API_PREFIX: '/api' },
      'lucide-react': { Eye: () => null, EyeOff: () => null, KeyRound: () => null },
    }, { window });
    assert.match(renderToString(React.createElement(Login)), /Welcome back/);
  });
}
function client(signOut, session = { data: null, isPending: false, error: null }) {
  const dynamic = new Proxy({}, { get: (_, key) => key === 'signOut' ? signOut : key === 'useSession' ? () => session : key === 'resetPassword' ? 'dynamic-reset' : {} });
  return load('src/lib/auth/auth-client.tsx', {
    'better-auth/react': { createAuthClient: () => dynamic },
    'react-router': { useLocation: () => ({ pathname: '/hub' }), Navigate: () => React.createElement('span', null, 'LOGIN REDIRECT') },
    './endpoint-config': { resolveAuthBaseURL: () => 'https://app.example.test' },
    './logout-cleanup': { clearLegacyFreeAccess: () => {} },
    '../config': { API_PREFIX: '/api', API_BASE_URL: 'https://app.example.test' },
  });
}
test('returned sign-out errors reject through named and authClient exports', async () => {
  const auth = client(async () => ({ error: { status: 500, message: 'provider detail' } }));
  await assert.rejects(auth.signOut(), /Sign out failed/);
  await assert.rejects(auth.authClient.signOut(), /Sign out failed/);
  assert.equal(auth.authClient.resetPassword, 'dynamic-reset');
});
test('successful sign-out preserves its result', async () => {
  const result = { data: { success: true }, error: null };
  assert.equal(await client(async () => result).signOut(), result);
});
test('session outage displays retry and does not redirect to login', () => {
  const auth = client(() => {}, { data: null, isPending: false, error: { status: 503 } });
  const html = renderToString(React.createElement(auth.ProtectedRoute, null, 'private content'));
  assert.match(html, /Retry/);
  assert.doesNotMatch(html, /LOGIN REDIRECT|private content/);
});
test('confirmed unauthenticated session redirects to login', () => {
  const auth = client(() => {});
  assert.match(renderToString(React.createElement(auth.ProtectedRoute, null, 'private content')), /LOGIN REDIRECT/);
});
test('failed reset-request response never displays sent state', async () => {
  const source = fs.readFileSync(path.join(root, 'src/pages/hub/forgot-password.tsx'), 'utf8');
  const handler = source.match(/const handleSubmit = async[\s\S]*?\n  };/)[0];
  const js = ts.transpileModule(handler + '\nglobalThis.run = handleSubmit;', { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const status of [429, 503]) {
    const sent = [], errors = [];
    const context = { email: 'test@example.test', API_PREFIX: '/api', fetch: async () => ({ ok: false, status }), setError: value => errors.push(value), setLoading: () => {}, setSent: value => sent.push(value) };
    vm.runInNewContext(js, context);
    await context.run({ preventDefault() {} });
    assert.deepEqual(sent, []);
    assert.ok(errors.at(-1));
  }
});

test('successful login navigates even when remembered-email writes fail', async () => {
  const source = fs.readFileSync(path.join(root, 'src/pages/hub/login.tsx'), 'utf8');
  const handler = source.match(/const handleSubmit = async[\s\S]*?\n  };/)[0];
  const js = ts.transpileModule(handler + '\nglobalThis.run = handleSubmit;', { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const browser = { get localStorage() { throw Error('blocked'); } };
  const storage = load(storagePath, {}, { window: browser });
  const safeRedirect = load('src/lib/auth/safe-redirect.ts');
  const redirects = [], errors = [];
  const context = { email: 'parent@example.test', password: 'test-only', from: '/hub', promoFromUrl: '', rememberMe: true,
    signIn: { email: async () => ({ data: { user: {} }, error: null }) },
    setError: value => errors.push(value), setLoading: () => {}, navigate: value => redirects.push(value),
    ...storage, ...safeRedirect,
  };
  vm.runInNewContext(js, context);
  await context.run({ preventDefault() {} });
  assert.deepEqual(redirects, ['/hub']);
  assert.deepEqual(errors, ['']);
});
