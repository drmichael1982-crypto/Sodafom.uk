/** Load the actual TS source with explicit mocks; never connect to production services. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
function loader(overrides = {}) {
  const cache = new Map();
  function load(filename) {
    filename = path.isAbsolute(filename) ? filename : path.join(root, filename);
    filename = filename.replace(/\.js$/, '.ts');
    if (!path.extname(filename)) filename += '.ts';
    if (cache.has(filename)) return cache.get(filename).exports;
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    const errors = result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error) || [];
    if (errors.length) throw new Error(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
    const mod = { exports: {} }; cache.set(filename, mod);
    const localRequire = spec => {
      if (Object.hasOwn(overrides, spec)) return overrides[spec];
      if (spec.startsWith('.')) return load(path.resolve(path.dirname(filename), spec));
      if (spec.startsWith('@/')) return load(path.join(root, 'src', spec.slice(2)));
      throw new Error(`Unmocked dependency: ${spec}`);
    };
    new Function('require', 'module', 'exports', result.outputText)(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}
module.exports = { loader, root };
