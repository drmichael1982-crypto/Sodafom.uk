import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { showCriticalError } from '../src/lib/critical-error-display.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.id = '';
    this.children = [];
    this.style = { cssText: '' };
    this.textContent = '';
    this.onclick = null;
    this.type = '';
  }
  set innerHTML(_) { throw new Error('Unsafe HTML assignment'); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
}

function createDocument() {
  const doc = {
    body: new Element('body'),
    createElement: (tag) => new Element(tag),
    getElementById(id) {
      const find = (node) => {
        if (node.id === id) return node;
        for (const child of node.children) {
          const found = find(child);
          if (found) return found;
        }
        return null;
      };
      return this.body ? find(this.body) : null;
    },
  };
  return doc;
}

function renderCritical(details = { message: 'Test error' }) {
  const doc = createDocument();
  let reloads = 0;
  const reload = () => { reloads += 1; };
  showCriticalError(doc, reload, details);
  return { doc, reload, reloads: () => reloads, panel: doc.body.children[0] };
}

test('critical error display keeps hostile values as inert text and retains reload', () => {
  const hostile = '<img src=x onerror=alert(1)><script>bad()</script>';
  const result = renderCritical({ message: hostile, url: hostile, error: { stack: hostile } });
  assert.deepEqual(result.panel.children.map((node) => node.tagName), ['H1', 'PRE', 'BUTTON']);
  assert.equal(result.panel.children[0].textContent, 'Sodafom Critical Error');
  assert.ok(result.panel.children[1].textContent.includes(hostile));
  assert.equal(result.panel.children[1].children.length, 0);
  assert.equal(result.reloads(), 0);
  result.panel.children[2].onclick();
  assert.equal(result.reloads(), 1);
});

test('critical error display reuses one recovery panel instead of stacking overlays', () => {
  const result = renderCritical();
  for (let index = 0; index < 20; index += 1) {
    showCriticalError(result.doc, result.reload, { message: 'Error ' + index });
  }
  assert.equal(result.doc.body.children.length, 1);
  assert.equal(result.doc.body.children[0], result.panel);
  assert.ok(result.panel.children[1].textContent.startsWith('Error 19'));
});

test('critical error display cannot mask an early error with a second error', () => {
  const doc = createDocument();
  doc.body = null;
  assert.doesNotThrow(() => showCriticalError(doc, () => assert.fail('reload'), { message: 'Early error' }));
  const hostileMessage = { toString() { throw new Error('Cannot stringify'); } };
  const inaccessibleStack = { get stack() { throw new Error('Unavailable'); } };
  const result = renderCritical({ message: hostileMessage, error: inaccessibleStack });
  assert.ok(result.panel.children[1].textContent.startsWith('Unknown error'));
  assert.ok(result.panel.children[1].textContent.endsWith('Stack: No stack'));
});

const configPath = resolve(process.cwd(), 'src/lib/config.ts');
const configText = readFileSync(configPath, 'utf8');
const configSource = ts.createSourceFile('config.ts', configText, ts.ScriptTarget.Latest, true);
const detector = configSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'detectCapacitor');
assert.ok(detector, 'The current configuration must expose the startup detector');
const detectorScript = ts.transpileModule(detector.getText(configSource), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText + '\ndetectCapacitor();';

function host(overrides = {}) {
  const values = new Map();
  let writes = 0;
  const context = {
    window: { location: { hostname: 'localhost', protocol: 'http:', origin: 'http://localhost' } },
    navigator: { userAgent: 'Agent27 QA' },
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => { writes += 1; values.set(key, value); },
    },
    ...overrides,
  };
  return {
    context,
    values,
    writes: () => writes,
    detect: () => runInNewContext(detectorScript, context),
  };
}

test('startup detector preserves supported platform detection without mandatory storage', () => {
  assert.equal(runInNewContext(detectorScript, {}), false);
  const ordinaryWeb = host();
  ordinaryWeb.context.window.location.hostname = 'www.sodafom.uk';
  Object.defineProperty(ordinaryWeb.context, 'localStorage', { get() { assert.fail('ordinary web must not touch diagnostic storage'); } });
  assert.equal(ordinaryWeb.detect(), false);

  const cases = [
    ['localhost', (setup) => { setup.context.window.location.hostname = 'localhost'; }],
    ['app host', (setup) => { setup.context.window.location.hostname = 'app.sodafom.uk'; }],
    ['native bridge', (setup) => { setup.context.window.location.hostname = 'www.sodafom.uk'; setup.context.window.Capacitor = {}; }],
    ['native protocol', (setup) => { setup.context.window.location.hostname = 'www.sodafom.uk'; setup.context.window.location.protocol = 'capacitor:'; }],
    ['native user agent', (setup) => { setup.context.window.location.hostname = 'www.sodafom.uk'; setup.context.navigator.userAgent = 'Agent27 Capacitor'; }],
  ];
  for (const [, configure] of cases) {
    const setup = host();
    configure(setup);
    assert.equal(setup.detect(), true);
    assert.equal(setup.context.window._SODAFOM_DIAG.isCapacitor, true);
    assert.equal(setup.values.get('sodafom_diag_shown'), '1');
  }
});

test('denied, blocked, and quota-limited diagnostic storage cannot crash startup', () => {
  const denied = host();
  Object.defineProperty(denied.context, 'localStorage', { get() { throw new Error('SecurityError'); } });
  assert.equal(denied.detect(), true);

  const blocked = host({ localStorage: { getItem() { throw new Error('SecurityError'); } } });
  assert.equal(blocked.detect(), true);

  const quota = host({ localStorage: { getItem() { return null; }, setItem() { throw new Error('QuotaExceededError'); } } });
  assert.equal(quota.detect(), true);
});

test('an existing diagnostic flag avoids another storage write', () => {
  const setup = host();
  setup.values.set('sodafom_diag_shown', '1');
  assert.equal(setup.detect(), true);
  assert.equal(setup.writes(), 0);
});
