/** Syntax-only check. This intentionally does not claim a full dependency-aware type check or build. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../../../..');
const paths = ['src/lib/teacher-progress.ts', 'src/lib/teacher-auth.ts', 'src/pages/teacher-hub/index.tsx', 'src/pages/teacher-hub/student/[studentId].tsx',
  'src/pages/teacher-hub/school-client.ts', 'src/pages/teacher-hub/SchoolRecordEditor.tsx',
  'src/server/api/teacher/login/POST.ts', 'src/server/api/teacher/me/GET.ts', 'src/server/api/teacher/school-records.ts',
  'src/server/api/teacher/students/GET.ts', 'src/server/api/teacher/students/POST.ts',
  'src/server/api/teacher/students/[studentId]/GET.ts', 'src/server/api/teacher/students/[studentId]/notes/POST.ts'];
function sourceFiles(value) {
  if (fs.statSync(value).isDirectory()) return fs.readdirSync(value).flatMap(name => sourceFiles(path.join(value, name)));
  return /\.tsx?$/.test(value) ? [value] : [];
}
const files = [...new Set(paths.flatMap(p => sourceFiles(path.join(root, p))))];
let errors = 0;
for (const filename of files) {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } });
  for (const diagnostic of result.diagnostics ?? []) {
    if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
    errors++; console.error(filename, ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
}
console.log(`Syntax-checked ${files.length} school/teacher TypeScript files; ${errors} errors. This is not a full app build.`);
process.exitCode = errors ? 1 : 0;
