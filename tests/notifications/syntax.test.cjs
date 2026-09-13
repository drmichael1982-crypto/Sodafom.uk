const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { root } = require('./load.cjs');
const files = [
  'src/lib/reminder-policy.ts', 'src/server/notifications/reminder-handlers.ts',
  'src/server/notifications/reminder-store.ts', 'src/server/notifications/reminder-api.ts',
  'src/server/api/notifications/read/POST.ts', 'src/server/api/push/send/POST.ts',
  'src/server/api/push/subscribe/POST.ts', 'src/components/ReminderNotice.tsx',
  'src/components/PushNotificationBanner.tsx', 'src/pages/notifications.tsx', 'src/layouts/RootLayout.tsx',
];
for (const file of files) test(`TypeScript/TSX syntax: ${file}`, () => {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const result = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } });
  assert.deepEqual(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error), []);
});
