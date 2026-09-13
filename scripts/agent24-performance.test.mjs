import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const checks = [];

async function check(name, run) {
  await run();
  checks.push(name);
  console.log('PASS ' + name);
}

function transpile(path) {
  const result = ts.transpileModule(read(path), {
    fileName: path,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
    },
  });
  const errors = (result.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, path + ' has TypeScript syntax diagnostics');
  return result.outputText;
}

function moduleExists(routeModule) {
  const base = resolve(root, 'src', routeModule.slice(2));
  return ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'].some((suffix) => existsSync(base + suffix));
}

function trackedTarget() {
  const target = new EventTarget();
  const listeners = new Map();
  const add = target.addEventListener.bind(target);
  const remove = target.removeEventListener.bind(target);
  target.addEventListener = (name, listener) => {
    const registered = listeners.get(name) ?? new Set();
    registered.add(listener);
    listeners.set(name, registered);
    add(name, listener);
  };
  target.removeEventListener = (name, listener) => {
    listeners.get(name)?.delete(listener);
    remove(name, listener);
  };
  target.listenerCount = () => [...listeners.values()].reduce((count, registered) => count + registered.size, 0);
  return target;
}

function mockDocument(withObserver = true) {
  const observers = [];
  const doc = trackedTarget();
  const view = trackedTarget();
  doc.hidden = false;
  doc.defaultView = view;
  class Observer {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observed = new Set();
      this.disconnects = 0;
      observers.push(this);
    }
    observe(element) { this.observed.add(element); }
    unobserve(element) { this.observed.delete(element); }
    disconnect() { this.observed.clear(); this.disconnects += 1; }
    emit(element, isIntersecting) { this.callback([{ target: element, isIntersecting }]); }
  }
  if (withObserver) view.IntersectionObserver = Observer;
  return { doc, view, observers, element: () => ({ ownerDocument: doc }) };
}

await check('current game routes are route-lazy and retain real module targets', () => {
  const routes = read('src/routes.tsx');
  assert.doesNotMatch(routes, /^import\s+\w+\s+from\s+['\"]\.\/pages\/games\//m);
  const mappings = [];
  let currentPath = null;
  for (const line of routes.split('\n')) {
    const path = line.match(/^\s*path:\s*'([^']+)'/);
    if (path) currentPath = path[1];
    const lazy = line.match(/lazy:\s*\(\)\s*=>\s*import\('([^']+)'\)\.then\(\(module\)\s*=>\s*\(\{ Component: module\.default \}\)\)/);
    if (lazy?.[1].startsWith('./pages/games/')) mappings.push({ path: currentPath, module: lazy[1] });
  }
  assert.equal(mappings.length, 130, 'all current-main independent game routes are deferred');
  assert.equal(new Set(mappings.map((item) => item.path)).size, 130);
  for (const mapping of mappings) {
    assert.match(mapping.path ?? '', /^\/games\//);
    assert.equal(moduleExists(mapping.module), true, mapping.module + ' resolves to a source module');
  }
});

await check('pooled visibility pauses decorative work and releases listeners', async () => {
  const code = transpile('src/lib/performance/animation-visibility.ts');
  const module = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  const mock = mockDocument();
  const element = mock.element();
  const events = [];
  const dispose = module.observeAnimationVisibility(element, (active) => events.push(active));
  assert.equal(mock.observers.length, 1);
  assert.deepEqual(events, [false]);
  mock.observers[0].emit(element, true);
  mock.doc.hidden = true;
  mock.doc.dispatchEvent(new Event('visibilitychange'));
  mock.doc.hidden = false;
  mock.doc.dispatchEvent(new Event('visibilitychange'));
  mock.view.dispatchEvent(new Event('pagehide'));
  mock.view.dispatchEvent(new Event('pageshow'));
  assert.deepEqual(events, [false, true, false, true, false, true]);
  dispose();
  assert.equal(mock.observers[0].disconnects, 1);
  assert.equal(mock.doc.listenerCount() + mock.view.listenerCount(), 0);
});

await check('visibility fallback and changed source remain browser-safe', async () => {
  const code = transpile('src/lib/performance/animation-visibility.ts');
  const module = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  const legacy = mockDocument(false);
  const legacyEvents = [];
  const dispose = module.observeAnimationVisibility(legacy.element(), (active) => legacyEvents.push(active));
  legacy.doc.hidden = true;
  legacy.doc.dispatchEvent(new Event('visibilitychange'));
  dispose();
  assert.deepEqual(legacyEvents, [true, false]);
  const ssrEvents = [];
  module.observeAnimationVisibility({ ownerDocument: { defaultView: null } }, (active) => ssrEvents.push(active));
  assert.deepEqual(ssrEvents, [false]);
  for (const path of ['src/App.tsx', 'src/routes.tsx', 'src/hooks/useAnimationVisibility.ts', 'src/components/ArchieCharacter.tsx']) transpile(path);
  const archie = read('src/components/ArchieCharacter.tsx');
  assert.match(archie, /useAnimationVisibility/);
  assert.match(archie, /loading=\{loading\}/);
  assert.match(archie, /decoding="async"/);
  assert.match(archie, /\[speaking, active\]/);
  assert.match(read('src/App.tsx'), /hydrateFallbackElement: <SpinnerFallback \/>/);
});

console.log(checks.length + ' focused Agent 24 performance checks passed.');
