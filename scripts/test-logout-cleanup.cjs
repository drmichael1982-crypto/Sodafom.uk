// Dependency-free Node 24 tests; no browser, live auth, or database calls.
// Run: node --test scripts/test-logout-cleanup.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const helperSource = stripTypeScriptTypes(fs.readFileSync(path.join(root, 'src/lib/auth/logout-cleanup.ts'), 'utf8'));
const clientSource = fs.readFileSync(path.join(root, 'src/lib/auth/auth-client.tsx'), 'utf8');
const handlerMatch = clientSource.match(/async function handleLogout\(\) \{[\s\S]*?\n  \}\n  return <button/);
assert.ok(handlerMatch, 'Locate the actual LogoutButton handler for isolated execution');
const handlerSource = handlerMatch[0].replace(/\n  return <button$/, '');

function loadHelper() {
  const context = {};
  vm.runInNewContext(helperSource.replace(/^export /gm, '') + '\nglobalThis.clearLegacyFreeAccess = clearLegacyFreeAccess;', context);
  return context.clearLegacyFreeAccess;
}

function loadHandler(storageDescriptor, signOut) {
  const loading = [];
  const loggedErrors = [];
  const redirects = [];
  const location = {};
  Object.defineProperty(location, 'href', { set: value => redirects.push(value) });
  const browser = { location };
  Object.defineProperty(browser, 'localStorage', storageDescriptor);
  const context = { window: browser, signOut, setIsLoading: value => loading.push(value), console: { error: (...args) => loggedErrors.push(args) } };
  vm.runInNewContext(helperSource.replace(/^export /gm, '') + '\n' + handlerSource + '\nglobalThis.runLogout = handleLogout;', context);
  return { runLogout: context.runLogout, loading, loggedErrors, redirects };
}

test('normal cleanup removes only the obsolete free-access flag', () => {
  const values = new Map([['sodafom_free_access', 'true'], ['unrelated-preference', 'keep']]);
  const removed = [];
  loadHelper()({ localStorage: { removeItem(key) { removed.push(key); values.delete(key); } } });
  assert.deepEqual(removed, ['sodafom_free_access']);
  assert.equal(values.has('sodafom_free_access'), false);
  assert.equal(values.get('unrelated-preference'), 'keep');
});

test('cleanup safely tolerates an absent browser', () => {
  assert.doesNotThrow(() => loadHelper()(undefined));
});

test('cleanup safely tolerates a denied localStorage getter', () => {
  assert.doesNotThrow(() => loadHelper()({ get localStorage() { throw Error('storage denied'); } }));
});

test('cleanup safely tolerates removeItem rejection', () => {
  assert.doesNotThrow(() => loadHelper()({ localStorage: { removeItem() { throw Error('storage denied'); } } }));
});

for (const [label, descriptor] of [
  ['denied getter', { get() { throw Error('storage denied'); } }],
  ['failing removeItem', { value: { removeItem() { throw Error('storage denied'); } } }],
]) {
  test(`actual logout still awaits server sign-out with ${label}`, async () => {
    let calls = 0;
    let complete;
    const pending = new Promise(resolve => { complete = resolve; });
    const handler = loadHandler(descriptor, () => { calls += 1; return pending; });
    const finished = handler.runLogout();
    assert.equal(calls, 1);
    assert.deepEqual(handler.loading, [true]);
    assert.deepEqual(handler.redirects, []);
    complete();
    await finished;
    assert.deepEqual(handler.redirects, ['/login']);
    assert.deepEqual(handler.loggedErrors, []);
  });

  test(`server rejection remains visible and prevents redirect with ${label}`, async () => {
    const failure = Error('server sign-out failed');
    let calls = 0;
    const handler = loadHandler(descriptor, async () => { calls += 1; throw failure; });
    await handler.runLogout();
    assert.equal(calls, 1);
    assert.deepEqual(handler.redirects, []);
    assert.deepEqual(handler.loading, [true, false]);
    assert.equal(handler.loggedErrors.length, 1);
    assert.equal(handler.loggedErrors[0][0], 'Logout failed:');
    assert.equal(handler.loggedErrors[0][1], failure);
  });
}

test('successful logout keeps cleanup, server sign-out, then redirect ordering', async () => {
  const events = [];
  const handler = loadHandler({ value: { removeItem: key => events.push(`cleanup:${key}`) } }, async () => { events.push('server-sign-out'); });
  await handler.runLogout();
  assert.deepEqual(events, ['cleanup:sodafom_free_access', 'server-sign-out']);
  assert.deepEqual(handler.redirects, ['/login']);
  assert.deepEqual(handler.loggedErrors, []);
});

test('client statically imports cleanup and leaves sign-out and redirect in the handler', () => {
  assert.match(clientSource, /import \{ clearLegacyFreeAccess \} from '\.\/logout-cleanup';/);
  assert.match(handlerSource, /clearLegacyFreeAccess\(typeof window !== 'undefined' \? window : undefined\)/);
  assert.match(handlerSource, /await signOut\(\);/);
  assert.match(handlerSource, /window\.location\.href = '\/login';/);
  assert.doesNotMatch(handlerSource, /localStorage|document\.cookie/);
});
