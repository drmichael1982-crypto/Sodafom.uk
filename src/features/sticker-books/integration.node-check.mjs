// Lightweight route/syntax checks. Not a substitute for the full React build.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const ts = createRequire(import.meta.url)('typescript');
const root = fileURLToPath(new URL('../../', import.meta.url));
const read = file => readFileSync(path.join(root, file), 'utf8');
const transpile = (file, source = read(file)) => ts.transpileModule(source, {
  fileName: file, reportDiagnostics: true,
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});
const gitHash = text => createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');
for (const file of ['App.tsx', 'entry-server.tsx', 'features/sticker-books/routes.tsx', 'pages/StickerBooksPage.tsx']) {
  test(`${file}: TypeScript JSX syntax/transpile check`, () => {
    const errors = (transpile(file).diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
    assert.deepEqual(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
  });
}
for (const [file, originalHash] of [
  ['App.tsx', '9cbad03b88e0e510ca2a9c8d0e099556c8a8f2ac'],
  ['entry-server.tsx', 'de8dbafc73b0aebd60e45cc237fea0db60f9171c'],
]) {
  test(`${file}: only the sticker route import differs from pinned master`, () => {
    const source = read(file);
    assert.equal(source.split("import { routes } from './features/sticker-books/routes';").length, 2);
    assert.equal(gitHash(source.replace("import { routes } from './features/sticker-books/routes';", "import { routes } from './routes';")), originalHash);
  });
}
function loadRoutes() {
  const originalElement = { type: 'OriginalRewards' };
  const original = [{ path: '/', element: { type: 'Home' } }, { path: '/rewards', element: originalElement, handle: { unchanged: true } }, { path: '/games', element: { type: 'Games' } }];
  const jsx = (type, props) => ({ type, props });
  const exports = {};
  vm.runInNewContext(transpile('features/sticker-books/routes.tsx').outputText, {
    exports,
    require: id => {
      if (id === 'react') return { lazy: loader => ({ lazy: loader }), Suspense: 'Suspense' };
      if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
      if (id === 'react-router') return { Link: 'Link' };
      if (id === '../../routes') return { routes: original };
      if (id === './stickers.css') return {};
      throw new Error(`Unexpected import: ${id}`);
    },
  });
  return { routes: exports.routes, original, originalElement };
}
test('route adapter keeps every unrelated route as the identical object', () => {
  const {routes, original} = loadRoutes();
  assert.equal(routes[0], original[0]); assert.equal(routes[2], original[2]); assert.equal(routes.length, original.length + 1);
});
test('Rewards retains its existing element, metadata and path under the sticker doorway', () => {
  const {routes, original, originalElement} = loadRoutes();
  const rewards = routes.find(r => r.path === '/rewards');
  assert.equal(rewards.handle, original[1].handle); assert.equal(rewards.element.props.children[1], originalElement);
  assert.equal(rewards.element.props.children[0].props.children[1].props.to, '/sticker-books');
});
test('exactly one lazy sticker-books route is registered', () => {
  const {routes} = loadRoutes();
  assert.equal(routes.filter(r => r.path === '/sticker-books').length, 1);
  assert.equal(typeof routes.at(-1).element.props.children.type.lazy, 'function');
});
test('saved sticker catalogue points only at the verified existing asset set', () => {
  const paths = [...read('features/sticker-books/model.ts').matchAll(/src: '([^']+)'/g)].map(match => match[1]);
  const approved = ['/assets/images/archie-character-v2.png', ...['bella','mia','toby','rocky','daisy','sunny','penny','captain-spark','professor-thinkwell','ziggy','soda-bot'].map(name => `/assets/cartoon/friends/${name}.png`)];
  assert.deepEqual(paths, approved);
  // When run in a full checkout, also check the actual asset files exist.
  const publicDir = path.join(root, '..', 'public');
  if (existsSync(publicDir)) for (const asset of paths) assert.ok(existsSync(path.join(publicDir, asset)), asset);
});
