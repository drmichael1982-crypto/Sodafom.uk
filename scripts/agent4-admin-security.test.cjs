const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');

test('admin account endpoint remains session-admin only and private', async () => {
  const source = await readFile(path.join(__dirname, '..', 'src', 'server', 'api', 'admin', 'list-users', 'GET.ts'), 'utf8');

  assert.match(source, /Cache-Control', 'private, no-store'/);
  assert.match(source, /getAuth\(\)/);
  assert.match(source, /isAdmin/);
  assert.doesNotMatch(source, /getSecret/);
  assert.doesNotMatch(source, /adminKey/);
  assert.doesNotMatch(source, /x-admin-code/);
  assert.match(source, /Unable to load accounts/);
});

test('authorised-code testing keeps account details behind a real admin session', async () => {
  const source = await readFile(path.join(__dirname, '..', 'src', 'pages', 'admin-panel.tsx'), 'utf8');

  assert.match(source, /if \(!stats\)/);
  assert.match(source, /<AdminAccountsAndVisits/);
  assert.match(source, /canViewAccounts=\{user\?\.isAdmin === true\}/);
});
