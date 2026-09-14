// Node >=22.22.0. Dependency-free, real TypeScript runtime helpers; no live login.
// Run: node --test scripts/test-auth-endpoints.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

// Only the two dependency-free helpers are evaluated; do not initialize auth/DB.
const recoverySource = stripTypeScriptTypes(fs.readFileSync(path.join(root, 'src/lib/auth/session-recovery.ts'), 'utf8'));
const endpointSource = stripTypeScriptTypes(fs.readFileSync(path.join(root, 'src/lib/auth/endpoint-config.ts'), 'utf8'));
const context = {};
vm.runInNewContext(
  recoverySource.replace(/^export /gm, '') + '\n' +
  endpointSource.replace(/^import .* from .*;\r?\n/gm, '').replace(/^export /gm, '') +
  '\nObject.assign(globalThis, { resolveAuthBaseURL, resolveSessionRecoveryURL, getSessionRecoveryStorage, claimSessionRecovery, clearSessionRecovery });',
  context,
);
const { resolveAuthBaseURL, resolveSessionRecoveryURL, getSessionRecoveryStorage, claimSessionRecovery, clearSessionRecovery } = context;

for (const origin of ['https://sodafom.uk', 'https://www.sodafom.uk', 'https://sodafomuk-production-3f3a.up.railway.app', 'https://preview.airoapp.ai']) {
  test(`browser auth keeps cookies on ${origin}`, () => {
    assert.equal(resolveAuthBaseURL('/api', 'https://remote.example.test', origin), origin);
  });
}
test('native backend is retained even with a localhost WebView origin', () => {
  assert.equal(resolveAuthBaseURL('https://remote.example.test/api', 'https://remote.example.test/', 'https://localhost'), 'https://remote.example.test');
});
test('explicit local phone-test backend is retained', () => {
  assert.equal(resolveAuthBaseURL('http://192.0.2.10:5000/api', 'http://192.0.2.10:5000', 'capacitor://localhost'), 'http://192.0.2.10:5000');
});
test('server-side resolution has no dependency on window', () => {
  assert.equal(resolveAuthBaseURL('/api', 'https://remote.example.test'), 'https://remote.example.test');
});
test('non-web page origin cannot replace the remote auth base', () => {
  assert.equal(resolveAuthBaseURL('/api', 'https://remote.example.test', 'capacitor://localhost'), 'https://remote.example.test');
});
for (const prefix of ['/api', '/api/', 'https://remote.example.test/api', 'http://192.0.2.10:5000/api/']) {
  test(`recovery adds /api only once for ${prefix}`, () => {
    const actual = resolveSessionRecoveryURL(prefix);
    assert.equal(actual, prefix.replace(/\/+$/, '') + '/auth/get-session?clearCookies=1');
    assert.equal(actual.includes('/api/api/'), false);
  });
}
test('blocked sessionStorage getter is safe', () => {
  assert.equal(getSessionRecoveryStorage({ get sessionStorage() { throw Error('blocked'); } }), null);
  assert.equal(getSessionRecoveryStorage(undefined), null);
});
test('healthy storage is preserved and recovery is one-shot until reset', () => {
  const values = new Map();
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
  assert.equal(getSessionRecoveryStorage({ sessionStorage: storage }), storage);
  assert.equal(claimSessionRecovery(storage), true);
  assert.equal(claimSessionRecovery(storage), false);
  clearSessionRecovery(storage);
  assert.equal(claimSessionRecovery(storage), true);
});
test('failing storage methods cannot cause an uncontrolled recovery loop', () => {
  const storage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  assert.equal(claimSessionRecovery(storage), false);
  assert.doesNotThrow(() => clearSessionRecovery(storage));
});
test('real config initialization survives blocked localStorage', () => {
  const source = fs.readFileSync(path.join(root, 'src/lib/config.ts'), 'utf8').replace('import.meta.env.VITE_API_BASE_URL', 'undefined');
  const js = stripTypeScriptTypes(source).replace(/^export /gm, '');
  const sandbox = {
    window: { Capacitor: {}, location: { hostname: 'localhost', protocol: 'https:', origin: 'https://localhost' }, get localStorage() { throw Error('blocked'); } },
    navigator: { userAgent: 'Capacitor' }, console: { info() {} },
  };
  assert.doesNotThrow(() => vm.runInNewContext(js, sandbox));
});
test('client retains endpoint configuration without clearing cookies on session errors', () => {
  const client = fs.readFileSync(path.join(root, 'src/lib/auth/auth-client.tsx'), 'utf8');
  assert.match(client, /baseURL:\s*resolveAuthBaseURL\(API_PREFIX, API_BASE_URL,/);
  assert.doesNotMatch(client, /recoverFromStaleSession|clearCookies|resolveSessionRecoveryURL/);
  assert.match(client, /if \(timedOut \|\| error\)/);
  assert.match(client, /window\.location\.reload\(\)/);
  assert.doesNotMatch(client, /\$\{API_PREFIX\}\$\{SESSION_RECOVERY_URL\}/);
});
