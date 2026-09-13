/** Run: node scripts/test-performance.mjs (uses the existing TypeScript dev dependency).
 * Isolated unit/contract checks, not a substitute for the full app build or device QA.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const results = [];
async function check(name, run) {
  await run();
  results.push({ name, status: 'PASS' });
  console.log(`PASS ${name}`);
}
function compile(path, module = ts.ModuleKind.ES2022) {
  const result = ts.transpileModule(read(path), {
    fileName: path.replace(/\.txt$/, ''), reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module, jsx: ts.JsxEmit.ReactJSX, strict: true },
  });
  assert.equal((result.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, path);
  return result.outputText;
}
const output = new URL('tests/performance/out/', root);
mkdirSync(output, { recursive: true });
const visibilityFile = new URL('animation-visibility.mjs', output);
writeFileSync(visibilityFile, compile('src/lib/performance/animation-visibility.ts'));
const { observeAnimationVisibility: observe } = await import(visibilityFile.href);

function mockDocument(withObserver = true) {
  const observers = [];
  const countEvents = (target) => {
    const registered = new Map();
    const add = target.addEventListener.bind(target);
    const remove = target.removeEventListener.bind(target);
    target.addEventListener = (name, listener) => {
      const entries = registered.get(name) ?? new Set();
      entries.add(listener); registered.set(name, entries); add(name, listener);
    };
    target.removeEventListener = (name, listener) => {
      registered.get(name)?.delete(listener); remove(name, listener);
    };
    target.listenerCount = () => [...registered.values()].reduce((sum, entries) => sum + entries.size, 0);
    return target;
  };
  const doc = countEvents(new EventTarget());
  const view = countEvents(new EventTarget());
  doc.hidden = false;
  doc.defaultView = view;
  class Observer {
    observed = new Set(); unobserved = []; disconnects = 0;
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe(target) { this.observed.add(target); }
    unobserve(target) { this.observed.delete(target); this.unobserved.push(target); }
    disconnect() { this.observed.clear(); this.disconnects++; }
    emit(target, isIntersecting) { this.callback([{ target, isIntersecting }]); }
  }
  if (withObserver) view.IntersectionObserver = Observer;
  return { doc, view, observers, element: () => ({ ownerDocument: doc }) };
}

await check('visibility module imports without browser globals', () => assert.equal(typeof observe, 'function'));
await check('one observer per document; no duplicate visibility notifications', () => {
  const m = mockDocument(); const a = m.element(); const b = m.element(); const events = [];
  const offA = observe(a, active => events.push(active));
  const offB = observe(b, () => {});
  assert.equal(m.observers.length, 1);
  assert.equal(m.doc.listenerCount(), 1); assert.equal(m.view.listenerCount(), 2);
  assert.deepEqual(m.observers[0].options, { rootMargin: '0px', threshold: 0 });
  m.observers[0].emit(a, true); m.observers[0].emit(a, true); m.observers[0].emit(a, false);
  assert.deepEqual(events, [false, true, false]);
  offA(); offB();
});
await check('background tabs pause and do not resume an off-screen target', () => {
  const m = mockDocument(); const a = m.element(); const events = [];
  const off = observe(a, active => events.push(active)); const io = m.observers[0];
  io.emit(a, true);
  m.doc.hidden = true; m.doc.dispatchEvent(new Event('visibilitychange'));
  io.emit(a, false);
  m.doc.hidden = false; m.doc.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(events, [false, true, false]);
  io.emit(a, true); assert.equal(events.at(-1), true); off();
});
await check('pagehide/pageshow pause and resume including back-forward cache', () => {
  const m = mockDocument(); const a = m.element(); const events = [];
  const off = observe(a, active => events.push(active)); m.observers[0].emit(a, true);
  m.view.dispatchEvent(new Event('pagehide')); m.view.dispatchEvent(new Event('pageshow'));
  assert.deepEqual(events, [false, true, false, true]); off();
});
await check('last unsubscribe releases observers/listeners; stale callbacks ignored', () => {
  const m = mockDocument(); const a = m.element(); const events = [];
  const off = observe(a, active => events.push(active)); const io = m.observers[0];
  off(); off(); io.emit(a, true);
  assert.deepEqual(events, [false]); assert.equal(io.disconnects, 1);
  assert.equal(io.unobserved.length, 1); assert.equal(m.doc.listenerCount(), 0); assert.equal(m.view.listenerCount(), 0);
  const offAgain = observe(a, () => {}); assert.equal(m.observers.length, 2); offAgain();
});
await check('duplicate subscriptions have independent cleanup', () => {
  const m = mockDocument(); const a = m.element(); const events = []; const listener = active => events.push(active);
  const off1 = observe(a, listener); const off2 = observe(a, listener);
  off1(); assert.equal(m.observers[0].observed.size, 1); m.observers[0].emit(a, true);
  assert.deepEqual(events, [false, false, true]); off2(); assert.equal(m.observers[0].disconnects, 1);
});
await check('100 mount/unmount cycles leave no subscribed elements', () => {
  const m = mockDocument();
  for (let i = 0; i < 100; i++) { const off = observe(m.element(), () => {}); off(); }
  assert.ok(m.observers.every(io => io.observed.size === 0 && io.disconnects === 1));
  assert.equal(m.doc.listenerCount() + m.view.listenerCount(), 0);
});
await check('separate documents do not share visibility state', () => {
  const a = mockDocument(); const b = mockDocument(); let active = false;
  const offA = observe(a.element(), () => {}); const elementB = b.element();
  const offB = observe(elementB, value => { active = value; }); b.observers[0].emit(elementB, true);
  a.doc.hidden = true; a.doc.dispatchEvent(new Event('visibilitychange')); assert.equal(active, true);
  offA(); offB();
});
await check('older WebView fallback still pauses background work', () => {
  const m = mockDocument(false); const events = []; const off = observe(m.element(), value => events.push(value));
  m.doc.hidden = true; m.doc.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(events, [true, false]); off();
});
await check('detached/SSR document needs no browser APIs', () => {
  const events = []; const off = observe({ ownerDocument: { defaultView: null } }, value => events.push(value));
  off(); assert.deepEqual(events, [false]);
});
await check('changed TypeScript/TSX files transpile without syntax errors', () => {
  for (const path of ['src/App.tsx', 'src/routes.tsx', 'src/hooks/useAnimationVisibility.ts', 'src/components/ArchieCharacter.tsx']) compile(path);
});

const required = [];
const modules = new Map();
function mockRequire(path) {
  required.push(path);
  if (path === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
  if (path === 'react') return { lazy: (load) => ({ lazy: load }) };
  if (path === 'react-router') return { Navigate: 'Navigate', redirect: to => ({ redirect: to }) };
  if (!modules.has(path)) modules.set(path, new Proxy({}, {
    get(_target, name) {
      if (name === 'then') return undefined; // A module namespace is not a thenable.
      const key = `${path}#${String(name)}`;
      if (!modules.has(key)) modules.set(key, Object.assign(() => null, { modulePath: path, exportName: name }));
      return modules.get(key);
    },
  }));
  return modules.get(path);
}
function evaluateRoutes(path) {
  const exports = {};
  vm.runInNewContext(compile(path, ts.ModuleKind.CommonJS), { exports, require: mockRequire });
  return exports.routes;
}
// Immutable text fixtures are the exact blobs from the requested master base.
const baselineRoutes = evaluateRoutes('tests/performance/fixtures/routes.master.tsx.txt');
required.length = 0;
const routes = evaluateRoutes('src/routes.tsx');
await check('all original route paths and ordering preserved', () => {
  assert.deepEqual(Array.from(routes, route => route.path), Array.from(baselineRoutes, route => route.path));
});
await check('activity modules are not eagerly required by the router', () => {
  assert.equal(required.some(path => path.startsWith('./pages/games/')), false);
  assert.equal(required.includes('./pages/LessonsPage'), false);
  assert.equal(required.includes('./pages/ReadingPage'), false);
  assert.ok(required.includes('./pages/ApprovedArtworkPage')); // Home remains eager.
});
await check('all 141 lazy routes resolve their original module/export', async () => {
  const lazyRoutes = routes.filter(route => route.lazy);
  assert.equal(lazyRoutes.length, 141);
  for (const route of lazyRoutes) {
    const original = baselineRoutes.find(item => item.path === route.path);
    assert.equal(route.element, undefined);
    const { Component } = await route.lazy();
    assert.equal(Component.modulePath, original.element.type.modulePath);
    assert.equal(Component.exportName, original.element.type.exportName);
  }
});
await check('all redirect loaders and the legacy game recovery remain unchanged', () => {
  for (const original of baselineRoutes.filter(route => route.loader)) assert.equal(routes.find(route => route.path === original.path).loader().redirect, original.loader().redirect);
  const recovery = routes.find(route => route.path === '/games/:legacyGame');
  assert.equal(recovery.element.type, 'Navigate'); assert.equal(recovery.element.props.to, '/games'); assert.equal(recovery.element.props.replace, true);
});
await check('mascot assets, alt text and original animation timing preserved', () => {
  const text = read('src/components/ArchieCharacter.tsx');
  assert.equal(text.match(/const CHARACTER_ASSETS:[\s\S]+?\n};/)[0], read('tests/performance/fixtures/ArchieCharacter.master.tsx.txt').match(/const CHARACTER_ASSETS:[\s\S]+?\n};/)[0]);
  assert.match(text, /if \(!speaking \|\| !active\)/); assert.match(text, /clearInterval\(interval\)/);
  assert.match(text, /auraControls\.stop\(\)/); assert.match(text, /imageControls\.stop\(\)/);
  assert.match(text, /\}, 120\)/); assert.match(text, /loading=\{loading\}/); assert.match(text, /decoding="async"/);
  assert.match(text, /width=\{size\}/); assert.match(text, /height=\{size\}/);
});
await check('initial lazy navigation reuses the existing loading fallback', () => {
  assert.match(read('src/App.tsx'), /hydrateFallbackElement: <SpinnerFallback \/>/);
});
writeFileSync(new URL('unit-results.json', output), JSON.stringify({ scope: 'Isolated units, syntax and mocked route contracts; not a full application build', results }, null, 2) + '\n');
console.log(`${results.length} checks passed. Browser fixture module: ${fileURLToPath(visibilityFile)}`);
