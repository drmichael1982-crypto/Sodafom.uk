import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'src/routes.tsx'), 'utf8');

function routeBlock(path: string) {
  const start = source.indexOf(`path: '${path}'`);
  expect(start, `${path} is registered`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf('}, {', start);
  return source.slice(start, end === -1 ? undefined : end);
}

it.each(['/admin-panel', '/admin/sodafom-bot'])('sends the legacy owner route %s through the protected dashboard', path => {
  expect(routeBlock(path)).toContain('<Navigate to="/admin" replace />');
});

it('does not mount the retired password-code admin panel', () => {
  expect(source).not.toContain('AdminPanelPage');
});
