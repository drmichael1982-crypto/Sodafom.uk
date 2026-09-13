/** Test helpers. No network access, production credentials or live services. */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ts = (() => {
  try { return require('typescript'); }
  catch { return require(path.join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'typescript')); }
})();
export function loader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    const file = path.resolve(root, filename);
    if (cache.has(file)) return cache.get(file).exports;
    const output = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true, fileName: file,
    });
    const errors = output.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error) ?? [];
    if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, { getCurrentDirectory: () => root, getCanonicalFileName: x => x, getNewLine: () => '\n' }));
    const module = { exports: {} };
    cache.set(file, module);
    const localRequire = id => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith('.') || id.startsWith('@/')) {
        const base = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : path.resolve(path.dirname(file), id);
        const resolved = [base, base + '.ts', base + '.tsx'].find(existsSync);
        if (!resolved) throw new Error(`Missing test source: ${id}`);
        return load(resolved);
      }
      return require(id);
    };
    new Function('require', 'module', 'exports', output.outputText)(localRequire, module, module.exports);
    return module.exports;
  }
  return load;
}
export function browserFixture(directory) {
  mkdirSync(directory, { recursive: true });
  const model = loader()('src/components/admin/feature-controls-model.ts');
  writeFileSync(path.join(directory, 'default-snapshot.json'), JSON.stringify(model.buildSnapshot(model.defaultSettings(), 0)));
  const modules = {};
  for (const name of ['feature-controls-model', 'feature-controls-client', 'feature-controls-view']) {
    const source = readFileSync(path.join(root, 'src/components/admin', name + '.ts'), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
      .replace(/from '(\.\/[^']+)'/g, "from '$1.js'");
    writeFileSync(path.join(directory, name + '.js'), code);
    modules['./' + name] = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  }
  writeFileSync(path.join(directory, 'offline-bundle.js'), `(() => {const sources=${JSON.stringify(modules)};const cache={};function require(id){if(cache[id])return cache[id].exports;const module={exports:{}};cache[id]=module;new Function('require','module','exports',sources[id])(require,module,module.exports);return module.exports;}window.mountControls=require('./feature-controls-view').mountFeatureControls;})();`);
  copyFileSync(path.join(root, 'src/components/admin/admin-feature-controls.css'), path.join(directory, 'controls.css'));
  writeFileSync(path.join(directory, 'index.html'), '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Isolated Admin controls test</title><link rel="stylesheet" href="/controls.css"><style>body{margin:0;padding:8px;font-family:Arial,sans-serif}main{max-width:1120px;margin:auto}</style><main><div id="controls"></div></main><script type="module">import {mountFeatureControls} from "./feature-controls-view.js";window.cleanup=mountFeatureControls(document.getElementById("controls"),"/api");</script></html>');
}
if (process.argv[2] === '--browser-dir' && process.argv[3]) browserFixture(process.argv[3]);
