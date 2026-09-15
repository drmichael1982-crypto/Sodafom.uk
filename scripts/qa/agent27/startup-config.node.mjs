// Run: node --test scripts/qa/agent27/startup-config.node.mjs
// Exercise the actual startup detector without importing network-aware modules.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const path = process.env.AGENT27_CONFIG_FILE || new URL('../../../src/lib/config.ts', import.meta.url);
const text = readFileSync(path, 'utf8');
const source = ts.createSourceFile('config.ts', text, ts.ScriptTarget.Latest, true);
const fn = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'detectCapacitor');
assert.ok(fn, 'The startup detector must exist in the actual configuration');
const script = ts.transpileModule(fn.getText(source), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + '\ndetectCapacitor();';

function host(overrides = {}) {
  const values = new Map();
  let writes = 0;
  const context = {
    window: { location: { hostname: 'localhost', protocol: 'http:', origin: 'http://localhost' } },
    navigator: { userAgent: 'QA browser' },
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes++; values.set(key, value); } },
    ...overrides,
  };
  return { context, values, writes: () => writes, detect: () => runInNewContext(script, context) };
}

test('server-side import detects no Capacitor without touching browser globals', () => {
  assert.equal(runInNewContext(script, {}), false);
});

test('ordinary web pages do not require diagnostic storage', () => {
  const setup = host();
  setup.context.window.location.hostname = 'www.sodafom.uk';
  Object.defineProperty(setup.context, 'localStorage', { get() { assert.fail('Storage should not be touched'); } });
  assert.equal(setup.detect(), false);
});

for (const scenario of ['localhost', '127.0.0.1', 'app-host', 'native-bridge', 'native-protocol', 'native-user-agent']) {
  test(`${scenario}: preserves existing platform detection and diagnostic flag`, () => {
    const setup = host();
    setup.context.window.location.hostname = 'www.sodafom.uk';
    if (scenario === 'localhost' || scenario === '127.0.0.1') setup.context.window.location.hostname = scenario;
    if (scenario === 'app-host') setup.context.window.location.hostname = 'app.sodafom.uk';
    if (scenario === 'native-bridge') setup.context.window.Capacitor = {};
    if (scenario === 'native-protocol') setup.context.window.location.protocol = 'capacitor:';
    if (scenario === 'native-user-agent') setup.context.navigator.userAgent = 'QA Capacitor';
    assert.equal(setup.detect(), true);
    assert.equal(setup.values.get('sodafom_diag_shown'), '1');
    assert.equal(setup.context.window._SODAFOM_DIAG.isCapacitor, true);
  });
}

test('denied storage getter cannot crash startup', () => {
  const setup = host();
  Object.defineProperty(setup.context, 'localStorage', { get() { throw new Error('SecurityError'); } });
  assert.equal(setup.detect(), true);
});

test('blocked getItem cannot crash startup', () => {
  const setup = host({ localStorage: { getItem() { throw new Error('SecurityError'); } } });
  assert.equal(setup.detect(), true);
  assert.equal(setup.context.window._SODAFOM_DIAG.isCapacitor, true);
});

test('quota exceeded while setting the flag cannot crash startup', () => {
  const setup = host({ localStorage: { getItem() { return null; }, setItem() { throw new Error('QuotaExceededError'); } } });
  assert.equal(setup.detect(), true);
});

test('an existing flag does not cause another storage write', () => {
  const setup = host();
  setup.values.set('sodafom_diag_shown', '1');
  assert.equal(setup.detect(), true);
  assert.equal(setup.writes(), 0);
});
