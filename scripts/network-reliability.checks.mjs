// Dependency-free transport tests. Run: node --test scripts/network-reliability.checks.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../public/network-worker.js', import.meta.url), 'utf8');
const origin = 'https://network-test.invalid';
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };

function worker(implementation = async () => new Response('{"ok":true}', {
  headers: { 'Content-Type': 'application/json' },
}), options = {}) {
  let time = 0, nextTimer = 0;
  const timers = new Map(), stores = new Map(), messages = [], calls = [];
  const listeners = {};
  const caches = { open: async name => {
    if (options.cacheBlocked) throw new Error('test cache blocked');
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      match: async request => entries.get(request.url)?.clone(),
      put: async (request, response) => {
        if (options.quotaFull) throw new Error('test quota full');
        entries.set(request.url, response.clone());
      },
      keys: async () => [...entries.keys()].map(url => new Request(url)),
      delete: async request => entries.delete(request.url),
    };
  } };
  const context = vm.createContext({
    self: {
      location: { origin },
      clients: { get: async () => ({ postMessage: message => messages.push(message) }) },
      addEventListener: (type, handler) => { listeners[type] = handler; },
    },
    caches, URL, Response, Request, Headers, Blob, TextDecoder, AbortController, Promise, Date,
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { at: time + delay, callback }); return id; },
    clearTimeout: id => timers.delete(id),
    fetch: (request, init) => { calls.push({ request, init }); return implementation(request, init); },
  });
  vm.runInContext(source, context, { filename: 'network-worker.js' });
  const dispatch = (path, init = {}) => {
    const navigate = init.navigate;
    const request = new Request(path.startsWith('http') ? path : `${origin}${path}`, init);
    if (navigate) Object.defineProperty(request, 'mode', { value: 'navigate' });
    const waiting = [];
    let result;
    listeners.fetch({
      request, clientId: 'fixture-tab',
      respondWith: promise => { assert.equal(result, undefined, 'one response per request'); result = promise; },
      waitUntil: promise => waiting.push(promise),
    });
    return {
      request, result,
      settled: async () => { const response = await result; await Promise.all(waiting); await flush(); return response; },
    };
  };
  const tick = async ms => {
    time += ms;
    let again = true;
    while (again) {
      again = false;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= time) { timers.delete(id); timer.callback(); again = true; }
      }
      await flush();
    }
  };
  return { dispatch, tick, timers, stores, calls, messages, listeners };
}

const asset = (body = 'export default 1') => new Response(body, {
  headers: { 'Content-Type': 'application/javascript', 'Content-Length': String(body.length) },
});

test('good internet: JSON payload and status are preserved; one request', async () => {
  const w = worker();
  const response = await w.dispatch('/api/fixture').settled();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(w.calls.length, 1);
  assert.equal(w.timers.size, 0);
});

test('slow internet: pending message, then success without a retry', async () => {
  let resolve;
  const w = worker(() => new Promise(done => { resolve = done; }));
  const request = w.dispatch('/api/fixture');
  await w.tick(4000);
  assert.equal(w.messages.at(-1).state, 'slow');
  resolve(new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }));
  assert.equal((await request.settled()).status, 200);
  assert.equal(w.messages.at(-1).state, 'settled');
  assert.equal(w.calls.length, 1);
  assert.equal(w.timers.size, 0);
});

test('hung read: deadline settles even when transport ignores abort', async () => {
  const w = worker(() => new Promise(() => {}));
  const request = w.dispatch('/api/fixture');
  await w.tick(15000);
  const response = await request.settled();
  assert.equal(response.status, 503);
  assert.equal(w.calls[0].init.signal.aborted, true);
  assert.equal(w.calls.length, 1);
  assert.equal(w.timers.size, 0);
});

test('headers arrived but JSON body stalls: same deadline releases caller', async () => {
  const w = worker(async () => new Response(new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{')); } }), {
    headers: { 'Content-Type': 'application/json' },
  }));
  const request = w.dispatch('/api/fixture');
  await flush();
  await w.tick(15000);
  assert.equal((await request.settled()).status, 503);
  assert.equal(w.calls.length, 1);
});

test('offline read: safe failure body, never success or cached account data', async () => {
  const w = worker(async () => { throw new Error('TEST_PRIVATE_TOKEN /private/path trace'); });
  const response = await w.dispatch('/api/fixture?child=TEST_PRIVATE_NAME').settled();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const body = await response.text();
  assert.match(body, /internet/);
  assert.doesNotMatch(body + JSON.stringify(w.messages), /TEST_PRIVATE|private\/path|trace|child=/);
  assert.equal(w.stores.size, 0);
});

for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
  test(`dropout during ${method}: unknown outcome, exactly one attempt, no retry later`, async () => {
    const w = worker(async () => { throw new Error('connection reset'); });
    const response = await w.dispatch('/api/fixture', { method, body: '{"fixture":true}' }).settled();
    assert.equal(response.status, 503);
    assert.equal((await response.json()).submissionStatus, 'unknown');
    assert.equal(w.messages.at(-1).state, 'uncertain');
    await w.tick(120000);
    assert.equal(w.calls.length, 1);
    assert.equal(w.stores.size, 0);
    assert.equal(w.listeners.sync, undefined);
  });
}

test('slow submission gets the longer deadline and is not replayed', async () => {
  const w = worker(() => new Promise(() => {}));
  const request = w.dispatch('/api/fixture', { method: 'POST', body: 'fixture' });
  await w.tick(15000);
  assert.equal(w.calls[0].init.signal.aborted, false);
  await w.tick(45000);
  assert.equal((await request.settled()).status, 503);
  assert.equal(w.calls.length, 1);
});

test('reconnection permits a new explicit read, never resubmits an old write', async () => {
  let offline = true;
  const w = worker(async () => {
    if (offline) throw new Error('offline');
    return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
  });
  await w.dispatch('/api/fixture', { method: 'POST', body: 'fixture' }).settled();
  offline = false;
  await w.tick(120000);
  assert.equal(w.calls.length, 1);
  assert.equal((await w.dispatch('/api/fixture').settled()).status, 200);
  assert.deepEqual(w.calls.map(call => call.request.method), ['POST', 'GET']);
});

test('repeated dropouts do not leave retry timers', async () => {
  const w = worker(async () => { throw new Error('offline'); });
  for (let i = 0; i < 8; i++) await w.dispatch('/api/fixture').settled();
  assert.equal(w.timers.size, 0);
  assert.equal(w.calls.length, 8);
});

for (const status of [502, 503, 504]) {
  test(`upstream ${status} diagnostics are replaced by a safe network message`, async () => {
    const w = worker(async () => new Response('TEST_PRIVATE_PROXY_TRACE', { status }));
    const response = await w.dispatch('/api/fixture').settled();
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /TEST_PRIVATE/);
    assert.equal(w.calls.length, 1);
  });
}

for (const status of [400, 401, 402, 403, 409, 422, 429]) {
  test(`application HTTP ${status} is left to the existing feature handler`, async () => {
    const w = worker(async () => new Response('{"error":"fixture"}', { status, headers: { 'Content-Type': 'application/json' } }));
    const response = await w.dispatch('/api/fixture').settled();
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error: 'fixture' });
    assert.equal(w.calls.length, 1);
  });
}

test('caller read cancellation is propagated without an uncertain submission warning', async () => {
  const controller = new AbortController();
  const w = worker(() => new Promise(() => {}));
  const request = w.dispatch('/api/fixture', { signal: controller.signal });
  controller.abort();
  assert.equal((await request.settled()).type, 'error');
  assert.equal(w.messages.at(-1).state, 'settled');
  assert.equal(w.timers.size, 0);
});

test('already-aborted request makes no transport attempt or unhandled rejection', async () => {
  const controller = new AbortController();
  controller.abort();
  const w = worker();
  assert.equal((await w.dispatch('/api/fixture', { signal: controller.signal }).settled()).type, 'error');
  assert.equal(w.calls.length, 0);
  assert.equal(w.timers.size, 0);
});

test('streaming responses remain streaming instead of being buffered', async () => {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('data: fixture\n\n')); } });
  const w = worker(async () => new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } }));
  const response = await w.dispatch('/api/fixture').settled();
  assert.equal(response.body, stream);
  assert.equal(response.bodyUsed, false);
  assert.equal(w.timers.size, 0);
  await response.body.cancel();
});

test('public hashed build asset is available from cache during an outage', async () => {
  let offline = false;
  const w = worker(async () => { if (offline) throw new Error('offline'); return asset(); });
  assert.equal((await w.dispatch('/assets/lesson-AbCd1234.js').settled()).status, 200);
  offline = true;
  assert.equal(await (await w.dispatch('/assets/lesson-AbCd1234.js').settled()).text(), 'export default 1');
  assert.equal(w.calls.length, 1);
});

for (const [name, path, init] of [
  ['unhashed script', '/assets/lesson.js', {}],
  ['image/photo', '/assets/photo-AbCd1234.png', {}],
  ['URL with query data', '/assets/lesson-AbCd1234.js?child=fixture', {}],
  ['authorized asset', '/assets/lesson-AbCd1234.js', { headers: { Authorization: 'fixture' } }],
  ['range request', '/assets/lesson-AbCd1234.js', { headers: { Range: 'bytes=0-10' } }],
  ['explicit no-store', '/assets/lesson-AbCd1234.js', { cache: 'no-store' }],
  ['cross-origin request', 'https://other.invalid/api/fixture', {}],
  ['ordinary document fetch', '/parent-dashboard', {}],
  ['payment API', '/api/stripe/create-checkout-session', { method: 'POST', body: 'fixture' }],
  ['admin API', '/api/admin/stats', {}],
  ['AI API', '/api/chat', { method: 'POST', body: 'fixture' }],
  ['scanner API', '/api/homework-scan', { method: 'POST', body: 'fixture' }],
  ['auth API', '/api/auth/session', {}],
  ['push API', '/api/push/subscribe', { method: 'POST', body: 'fixture' }],
  ['payment navigation', '/checkout/success', { navigate: true }],
  ['admin navigation', '/admin-panel', { navigate: true }],
  ['AI navigation', '/tutor', { navigate: true }],
  ['scanner navigation', '/homework-scan', { navigate: true }],
  ['teacher navigation', '/teacher-hub', { navigate: true }],
]) {
  test(`${name} is not handled by the recovery worker`, () => {
    const w = worker();
    assert.equal(w.dispatch(path, init).result, undefined);
    assert.equal(w.calls.length, 0);
    assert.equal(w.stores.size, 0);
  });
}

for (const headers of [
  { 'Cache-Control': 'private' }, { 'Cache-Control': 'no-store' }, { 'Cache-Control': 'no-cache' },
  { Vary: 'Cookie' }, { Vary: '*' }, { 'Content-Type': 'text/html' },
  { 'Content-Type': 'application/json' }, { 'Content-Length': '999999999' }, { 'Content-Length': '0' },
]) {
  test(`unsafe response is not cached: ${JSON.stringify(headers)}`, async () => {
    const w = worker(async () => {
      const response = asset();
      for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      return response;
    });
    await w.dispatch('/assets/lesson-AbCd1234.js').settled();
    assert.equal([...w.stores.values()].reduce((n, store) => n + store.size, 0), 0);
  });
}

test('API JSON is never cached, even with public headers', async () => {
  const w = worker(async () => new Response('{"fixture":true}', { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public', 'Content-Length': '16' } }));
  await w.dispatch('/api/progress-fixture').settled();
  assert.equal(w.stores.size, 0);
});

test('cache eviction is bounded and affects only the network public-asset cache', async () => {
  const w = worker(async () => asset());
  w.stores.set('fixture-unrelated-cache', new Map([['do-not-remove', 'fixture']]));
  await Promise.all(Array.from({ length: 65 }, (_, i) => w.dispatch(`/assets/lesson${i}-AbCd1234.js`).settled()));
  assert.equal(w.stores.get('sodafom-network-assets-v1').size, 60);
  assert.equal(w.stores.get('fixture-unrelated-cache').size, 1);
});

for (const options of [{ cacheBlocked: true }, { quotaFull: true }]) {
  test(`cache storage failure does not break network loading: ${JSON.stringify(options)}`, async () => {
    const w = worker(async () => asset(), options);
    assert.equal(await (await w.dispatch('/assets/lesson-AbCd1234.js').settled()).text(), 'export default 1');
    assert.equal(w.calls.length, 1);
  });
}

test('offline navigation shows an independent child-friendly page, not cached private HTML', async () => {
  const w = worker(async () => { throw new Error('TEST_PRIVATE_ERROR'); });
  const response = await w.dispatch('/parent-dashboard?child=TEST_PRIVATE_NAME', { navigate: true }).settled();
  assert.equal(response.status, 503);
  assert.match(response.headers.get('Content-Type'), /text\/html/);
  assert.match(await response.text(), /internet connection has paused/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(w.stores.size, 0);
});

test('notification source is preserved and network worker is imported once', async () => {
  const sw = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.equal((sw.match(/importScripts\('\/network-worker\.js'\)/g) || []).length, 1);
  for (const event of ['install', 'activate', 'push', 'notificationclick']) assert.ok(sw.includes(`addEventListener('${event}'`));
});

test('network modules do not clear storage, reload, register background sync, or log data', async () => {
  const status = await readFile(new URL('../src/lib/network-status.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source + status, /localStorage\.(?:clear|removeItem|setItem)|sessionStorage\.(?:clear|removeItem|setItem)|location\.reload\(|console\.|sync\.register/);
});

test('main uses the tested offline mutation defaults and starts connection support once', async () => {
  const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
  const policy = await readFile(new URL('../src/lib/network-query-policy.ts', import.meta.url), 'utf8');
  assert.match(main, /mutations: networkMutationDefaults/);
  assert.equal((main.match(/startNetworkSupport\(\)/g) || []).length, 1);
  assert.match(policy, /retry: 0/);
  assert.match(policy, /networkMode: 'always'/);
});


test('malformed JSON after a dropout becomes a friendly failure, not a parsing exception', async () => {
  const w = worker(async () => new Response('{"partial":', { headers: { 'Content-Type': 'application/json' } }));
  const response = await w.dispatch('/api/fixture').settled();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
});

test('invalid submission acknowledgement remains unknown and is never replayed', async () => {
  const w = worker(async () => new Response('{"partial":', { headers: { 'Content-Type': 'application/json' } }));
  const response = await w.dispatch('/api/fixture', { method: 'POST', body: 'fixture' }).settled();
  assert.equal((await response.json()).submissionStatus, 'unknown');
  await w.tick(120000);
  assert.equal(w.calls.length, 1);
});

test('decoded JSON has correct length and no stale compression metadata', async () => {
  const w = worker(async () => new Response('{"ok":true}', { headers: {
    'Content-Type': 'application/json', 'Content-Encoding': 'gzip', 'Content-Length': '999',
  } }));
  const response = await w.dispatch('/api/fixture').settled();
  assert.equal(response.headers.get('Content-Encoding'), null);
  assert.equal(response.headers.get('Content-Length'), '11');
  assert.deepEqual(await response.json(), { ok: true });
});

test('public script body stall is bounded, not just the response headers', async () => {
  const w = worker(async () => new Response(new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('export')); } }), {
    headers: { 'Content-Type': 'application/javascript', 'Content-Length': '100' },
  }));
  const request = w.dispatch('/assets/lesson-AbCd1234.js');
  await flush();
  await w.tick(15000);
  assert.equal((await request.settled()).status, 503);
  assert.equal(w.calls.length, 1);
});

test('decoded asset above the size limit is not cached despite a smaller advertised length', async () => {
  const body = 'x'.repeat(2 * 1024 * 1024 + 1);
  const w = worker(async () => new Response(body, { headers: {
    'Content-Type': 'application/javascript', 'Content-Length': '100', 'Content-Encoding': 'gzip',
  } }));
  const response = await w.dispatch('/assets/lesson-AbCd1234.js').settled();
  assert.equal(response.status, 200);
  assert.equal([...w.stores.values()].reduce((n, store) => n + store.size, 0), 0);
});

test('redirected asset is not cached when rebuilding the decoded response', async () => {
  const w = worker(async () => {
    const response = asset();
    Object.defineProperty(response, 'redirected', { value: true });
    return response;
  });
  assert.equal((await w.dispatch('/assets/lesson-AbCd1234.js').settled()).status, 200);
  assert.equal([...w.stores.values()].reduce((n, store) => n + store.size, 0), 0);
});


test('cancelling an already-sent write warns about its uncertain outcome and never replays', async () => {
  const controller = new AbortController();
  const w = worker(() => new Promise(() => {}));
  const request = w.dispatch('/api/fixture', { method: 'POST', body: 'fixture', signal: controller.signal });
  assert.equal(w.calls.length, 1);
  controller.abort();
  assert.equal((await request.settled()).type, 'error');
  assert.equal(w.messages.at(-1).state, 'uncertain');
  await w.tick(120000);
  assert.equal(w.calls.length, 1);
  assert.equal(w.timers.size, 0);
});

test('a write cancelled before any attempt does not imply an uncertain submission', async () => {
  const controller = new AbortController();
  controller.abort();
  const w = worker();
  assert.equal((await w.dispatch('/api/fixture', { method: 'POST', body: 'fixture', signal: controller.signal }).settled()).type, 'error');
  assert.equal(w.calls.length, 0);
  assert.equal(w.messages.at(-1).state, 'settled');
});
