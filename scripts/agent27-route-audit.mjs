import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const routesFile = resolve(root, 'src/routes.tsx');
const routesText = readFileSync(routesFile, 'utf8');
const source = ts.createSourceFile(routesFile, routesText, ts.ScriptTarget.Latest, true);
const routes = [];
const imports = [];

function visit(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'path' && ts.isStringLiteral(node.initializer)) {
    routes.push(node.initializer.text);
  }
  if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.startsWith('.')) {
    imports.push(node.moduleSpecifier.text);
  }
  if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0]) && node.arguments[0].text.startsWith('.')) {
    imports.push(node.arguments[0].text);
  }
  ts.forEachChild(node, visit);
}
visit(source);

function resolves(specifier) {
  const base = resolve(dirname(routesFile), specifier);
  return ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'].some((suffix) => existsSync(base + suffix));
}

const duplicates = routes.filter((route, index) => routes.indexOf(route) !== index);
const missingImports = imports.filter((specifier) => !resolves(specifier));
assert.deepEqual(duplicates, [], 'route paths must remain unique');
assert.deepEqual(missingImports, [], 'route module imports must resolve');

const requiredRoutes = [
  '/', '/subjects', '/games', '/hub', '/hub/login', '/hub/signup',
  '/parent-dashboard', '/tutor', '/ai-teacher', '/ask-archie',
  '/rewards', '/certificates', '/checkout/success', '/checkout/cancel',
];
for (const route of requiredRoutes) assert.ok(routes.includes(route), 'required route is registered: ' + route);

const main = readFileSync(resolve(root, 'src/main.tsx'), 'utf8');
const config = readFileSync(resolve(root, 'src/lib/config.ts'), 'utf8');
assert.match(main, /showCriticalError\(/);
assert.doesNotMatch(main, /\.innerHTML\s*=/);
assert.match(config, /Optional diagnostics must not prevent startup/);

console.log(JSON.stringify({
  routeCount: routes.length,
  relativeRouteImportsChecked: imports.length,
  requiredRoutesChecked: requiredRoutes.length,
  criticalErrorMarkup: 'text-node helper',
  startupDiagnosticStorage: 'best effort',
}, null, 2));
