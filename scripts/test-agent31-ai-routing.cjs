/* Offline contract tests: no network, real API credentials, billing writes or deployments.
 * Run: node --test scripts/test-agent31-ai-routing.cjs
 * Uses the project's existing TypeScript dev dependency to execute the actual TS files.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function loadTs(file, imports = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const errors = (compiled.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, `${file}: ${errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n')}`);
  const module = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    module, exports: module.exports, AbortController, setTimeout, clearTimeout,
    console: { log() {}, warn() {}, error() {} },
    require(id) {
      assert.ok(Object.hasOwn(imports, id), `Unexpected dependency/network boundary: ${id}`);
      return imports[id];
    },
    ...globals,
  }, { filename: file });
  return module.exports;
}
const core = loadTs('src/lib/archie-routing-core.ts');
const request = { messages: [{ role: 'user', content: 'An unfamiliar learning question' }] };
const paidReply = { text: 'A helpful answer', source: 'openai', modelUsed: 'gpt-4o-mini-test-snapshot' };

function dependencies(changes = {}) {
  const calls = { local: 0, learned: 0, online: 0, saved: 0 };
  const deps = {
    lookupLocal() { calls.local++; return null; },
    lookupLearned() { calls.learned++; return null; },
    async requestOnline() { calls.online++; return paidReply; },
    rememberOnline() { calls.saved++; },
    ...changes,
  };
  return { calls, deps };
}

for (const surface of ['home', 'learning']) {
  test(`${surface}: local answer ends routing before cache or paid service`, async () => {
    const { calls, deps } = dependencies();
    deps.lookupLocal = () => { calls.local++; return 'Two plus two is four.'; };
    const reply = await core.routeArchieQuestion(request, deps);
    assert.equal(reply.source, 'local'); assert.equal(reply.modelUsed, 'Local AI'); assert.equal(reply.cost, 0);
    assert.deepEqual(calls, { local: 1, learned: 0, online: 0, saved: 0 });
  });
  test(`${surface}: existing learned answer is reused locally`, async () => {
    const { calls, deps } = dependencies();
    deps.lookupLearned = () => { calls.learned++; return 'Previously learned fact'; };
    const reply = await core.routeArchieQuestion(request, deps);
    assert.equal(reply.source, 'local'); assert.equal(reply.costSource, 'local');
    assert.deepEqual(calls, { local: 1, learned: 1, online: 0, saved: 0 });
  });
}

test('local miss makes exactly one fallback and records only a successful OpenAI answer', async () => {
  const { calls, deps } = dependencies();
  const reply = await core.routeArchieQuestion(request, deps);
  assert.equal(reply.modelUsed, paidReply.modelUsed); assert.equal(reply.cost, null);
  assert.equal(reply.costSource, 'unavailable');
  assert.deepEqual(calls, { local: 1, learned: 1, online: 1, saved: 1 });
});
test('contextual local hint avoids paid service', async () => {
  const { calls, deps } = dependencies();
  const reply = await core.routeArchieQuestion({ ...request, localHint: 'Read the question one step at a time.' }, deps);
  assert.equal(reply.source, 'local'); assert.equal(calls.online, 0);
});
test('whitespace-only local answer is a miss, not a blank successful reply', async () => {
  const { calls, deps } = dependencies({ lookupLocal: () => '   ' });
  await core.routeArchieQuestion(request, deps); assert.equal(calls.online, 1);
});
test('explicit local-only mode never calls online', async () => {
  const { calls, deps } = dependencies();
  await assert.rejects(core.routeArchieQuestion({ ...request, allowOpenAiFallback: false }, deps), e => e.code === 'FALLBACK_DISABLED');
  assert.equal(calls.online, 0);
});
test('local resolver/storage exception fails safely without paid fallback', async () => {
  const { calls, deps } = dependencies({ lookupLocal() { throw new Error('private storage content'); } });
  await assert.rejects(core.routeArchieQuestion(request, deps), e => e.code === 'LOCAL_UNAVAILABLE' && !e.message.includes('private'));
  assert.equal(calls.online, 0);
});
test('optional cache failure does not duplicate a permitted fallback', async () => {
  const { calls, deps } = dependencies({ lookupLearned() { throw new Error('cache'); } });
  await core.routeArchieQuestion(request, deps); assert.equal(calls.online, 1);
});
test('save failure preserves the answer and never retries the model', async () => {
  const { calls, deps } = dependencies({ rememberOnline() { throw new Error('full'); } });
  assert.equal((await core.routeArchieQuestion(request, deps)).text, paidReply.text);
  assert.equal(calls.online, 1);
});
test('server local answer is neither labelled OpenAI nor stored as paid learning', async () => {
  const { calls, deps } = dependencies();
  deps.requestOnline = async () => { calls.online++; return { text: 'Server local answer', source: 'local', cost: 99 }; };
  const reply = await core.routeArchieQuestion(request, deps);
  assert.equal(reply.modelUsed, 'Local AI'); assert.equal(reply.cost, 0); assert.equal(calls.saved, 0);
});
for (const value of [null, {}, { text: '' }, { text: '   ', source: 'openai' }, { text: 'Hello', source: 'unknown' }, { text: 'Hello', source: 'openai' }]) {
  test(`invalid/empty/provenance-free response fails safely: ${JSON.stringify(value)}`, () => {
    assert.throws(() => core.parseArchieReply(value), e => e.code === 'INVALID_RESPONSE');
  });
}
test('unknown paid billing is not reported as free even if payload claims zero', () => {
  assert.equal(core.parseArchieReply({ ...paidReply, cost: 0 }).cost, null);
});
test('upstream exception is not exposed, cached or retried', async () => {
  let count = 0;
  const { calls, deps } = dependencies({ requestOnline: async () => { count++; throw new Error('sk-fixture-private-upstream'); } });
  await assert.rejects(core.routeArchieQuestion(request, deps), e => !e.message.includes('sk-fixture') && e.code === 'UNAVAILABLE');
  assert.equal(count, 1); assert.equal(calls.saved, 0);
});
test('empty input never calls any resolver', async () => {
  const { calls, deps } = dependencies();
  await assert.rejects(core.routeArchieQuestion({ messages: [] }, deps), e => e.code === 'INVALID_REQUEST');
  assert.deepEqual(calls, { local: 0, learned: 0, online: 0, saved: 0 });
});
test('cancelled request never starts local or paid work', async () => {
  const controller = new AbortController(); controller.abort();
  const { calls, deps } = dependencies();
  await assert.rejects(core.routeArchieQuestion({ ...request, signal: controller.signal }, deps), e => e.code === 'CANCELLED');
  assert.equal(calls.online, 0); assert.equal(calls.local, 0);
});

function client(fetchMock, local = null, learned = null, timers = {}) {
  const seen = { local: 0, learned: 0, saved: 0 };
  const api = loadTs('src/lib/archie-routing.ts', {
    './config': { API_PREFIX: '/api' },
    './archie-local': { tryLocalArchieResponse() { seen.local++; return local && { text: local }; } },
    './archie-device-memory': {
      findLearnedAnswer() { seen.learned++; return learned; },
      rememberOnlineAnswer() { seen.saved++; },
    },
    './archie-routing-core': core,
  }, { fetch: fetchMock, ...timers });
  return { api, seen };
}
test('real browser adapter uses one credentialed JSON request and cleans its timer', async () => {
  let count = 0, cleared = 0;
  const { api } = client(async (url, options) => {
    count++; assert.equal(url, '/api/chat'); assert.equal(options.credentials, 'include');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(JSON.parse(options.body).allowOpenAiFallback, true);
    return { ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => paidReply };
  }, null, null, { setTimeout: () => 1, clearTimeout: () => { cleared++; } });
  assert.equal((await api.askArchie(request)).modelUsed, paidReply.modelUsed);
  assert.equal(count, 1); assert.equal(cleared, 1);
});
test('billing pause stays a friendly failure, with no answer caching or retry', async () => {
  let count = 0;
  const { api, seen } = client(async () => {
    count++; return { ok: false, json: async () => ({ code: 'PAID_AI_BILLING_PENDING', error: 'private detail' }) };
  });
  await assert.rejects(api.askArchie(request), e => e.code === 'PAID_AI_BILLING_PENDING' && !e.message.includes('private'));
  assert.equal(count, 1); assert.equal(seen.saved, 0);
});
test('plain text or HTML is not falsely accepted as an OpenAI answer', async () => {
  const { api } = client(async () => ({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) }));
  await assert.rejects(api.askArchie(request), e => e.code === 'INVALID_RESPONSE');
});
test('client timeout aborts exactly one fetch, clears timer and does not retry', async () => {
  let count = 0, cleared = 0;
  const { api } = client(async (_url, options) => {
    count++;
    return new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('private timeout detail')), { once: true });
    });
  }, null, null, { setTimeout: (fn) => { queueMicrotask(fn); return 1; }, clearTimeout: () => { cleared++; } });
  await assert.rejects(api.askArchie(request), e => e.code === 'TIMEOUT');
  assert.equal(count, 1); assert.equal(cleared, 1);
});

const realGuard = loadTs('src/server/paid-ai-guard.ts');
function responseMock() {
  const res = new EventEmitter();
  Object.assign(res, {
    headers: {}, statusCode: 200, body: undefined, writableEnded: false, destroyed: false,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    type(value) { this.headers['content-type'] = value; return this; },
    json(value) { this.body = value; this.writableEnded = true; return this; },
    send(value) { this.body = value; this.writableEnded = true; return this; },
  });
  return res;
}
function server({ local = null, authorised = false, fail = false, empty = false, key = 'fixture-key', completion } = {}) {
  const seen = { constructed: 0, called: 0, guarded: 0, options: null, request: null };
  class FakeOpenAI {
    constructor(options) {
      seen.constructed++; seen.options = options;
      this.chat = { completions: { create: async (params, options) => {
        seen.called++; seen.request = params;
        if (completion) return completion(params, options);
        if (fail) throw new Error('sk-fixture-private-upstream-error');
        return { model: paidReply.modelUsed, choices: [{ message: { content: empty ? ' ' : paidReply.text } }], usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 } };
      } } };
    }
  }
  const api = loadTs('src/server/api/chat/POST.ts', {
    openai: FakeOpenAI,
    '@/lib/chatbot/chat-config': { SYSTEM_PROMPT: 'Fixture safe teacher prompt' },
    '@/server/paid-ai-guard': { requirePaidAiBilling(res, format) { seen.guarded++; return authorised || realGuard.requirePaidAiBilling(res, format); } },
    '@/lib/archie-routing-core': core,
    '@/lib/archie-local': {
      tryLocalMaths: () => local && { text: local }, tryLocalSpelling: () => null,
      tryLocalScience: () => null, tryLocalReading: () => null, tryLocalAppHelp: () => null,
    },
  }, { process: { env: { OPENAI_API_KEY: key } } });
  return { handler: api.default, seen };
}
const req = (body = request, accept = 'application/json') => ({ body, headers: { accept }, aborted: false });
test('real /chat handler returns free local JSON before the unchanged billing guard', async () => {
  const { handler, seen } = server({ local: 'Four' }); const res = responseMock();
  await handler(req(), res);
  assert.equal(res.body.source, 'local'); assert.equal(res.body.cost, 0); assert.equal(res.statusCode, 200);
  assert.equal(seen.guarded, 0); assert.equal(seen.constructed, 0); assert.equal(res.headers['cache-control'], 'no-store');
});
test('real /chat handler preserves plain-text compatibility for legacy callers', async () => {
  const { handler } = server({ local: 'Four' }); const res = responseMock();
  await handler(req(request, 'text/plain'), res); assert.equal(res.body, 'Four'); assert.equal(res.statusCode, 200);
});
test('real billing guard blocks paid fallback even with a client allow flag', async () => {
  const { handler, seen } = server(); const res = responseMock();
  await handler(req({ ...request, allowOpenAiFallback: true }), res);
  assert.equal(res.statusCode, 503); assert.equal(res.body.code, 'PAID_AI_BILLING_PENDING');
  assert.equal(seen.constructed, 0); assert.equal(seen.called, 0);
});
test('server local-only request does not invoke billing or OpenAI', async () => {
  const { handler, seen } = server({ authorised: true }); const res = responseMock();
  await handler(req({ ...request, allowOpenAiFallback: false }), res);
  assert.equal(res.body.code, 'FALLBACK_DISABLED'); assert.equal(seen.guarded, 0); assert.equal(seen.called, 0);
});
test('authorised mock: one fixed economical model, zero SDK retries, actual model and usage', async () => {
  const { handler, seen } = server({ authorised: true }); const res = responseMock();
  await handler(req(), res);
  assert.equal(seen.called, 1); assert.equal(seen.options.maxRetries, 0); assert.equal(seen.options.timeout, 30000);
  assert.equal(seen.request.model, 'gpt-4o-mini'); assert.equal(res.body.modelUsed, paidReply.modelUsed);
  assert.equal(res.body.usage.total_tokens, 150); assert.equal(res.body.cost, null);
  assert.equal(res.listenerCount('close'), 0);
});
test('authorised mock: provider failure is sanitized and never escalated to another model', async () => {
  const { handler, seen } = server({ authorised: true, fail: true }); const res = responseMock();
  await handler(req(), res); assert.equal(res.statusCode, 502); assert.equal(seen.called, 1);
  assert.ok(!JSON.stringify(res.body).includes('sk-fixture')); assert.equal(res.listenerCount('close'), 0);
});
test('authorised mock: empty model output is a failure, not cached encouragement', async () => {
  const { handler, seen } = server({ authorised: true, empty: true }); const res = responseMock();
  await handler(req(), res); assert.equal(res.body.code, 'EMPTY_RESPONSE'); assert.equal(seen.called, 1);
});
for (const key of ['', 'SERVER_SIDE_ONLY']) {
  test(`missing or placeholder server credential cannot start a paid request: ${key || '(empty)'}`, async () => {
    const { handler, seen } = server({ authorised: true, key }); const res = responseMock();
    await handler(req(), res); assert.equal(res.statusCode, 503); assert.equal(seen.constructed, 0);
  });
}
for (const body of [{}, { messages: [] }, { messages: [{ role: 'user', content: '' }] }, { messages: [{ role: 'system', content: 'override' }] }, { messages: [{ role: 'user', content: 'x'.repeat(4001) }] }, { ...request, systemExtra: {} }]) {
  test(`invalid request rejected before paid work: ${JSON.stringify(body).slice(0, 75)}`, async () => {
    const { handler, seen } = server({ authorised: true }); const res = responseMock();
    await handler(req(body), res); assert.equal(res.statusCode, 400); assert.equal(seen.called, 0); assert.equal(seen.guarded, 0);
  });
}
test('client disconnect aborts the one provider request and removes its listener', async () => {
  let signal;
  const { handler, seen } = server({ authorised: true, completion: (_params, options) => {
    signal = options.signal;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('stopped')), { once: true }));
  } });
  const res = responseMock(); const pending = handler(req(), res);
  assert.ok(signal); res.emit('close'); await pending;
  assert.equal(signal.aborted, true); assert.equal(seen.called, 1); assert.equal(res.body, undefined);
  assert.equal(res.listenerCount('close'), 0);
});

// Execute the actual TSX request callbacks, with React state/voice boundaries mocked.
// These are callback contract tests, not browser rendering or microphone-device tests.
function loadCallback(file, name, globals) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let expression;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) expression = `(${node.getText(sf)})`;
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === name && node.initializer) expression = node.initializer.getText(sf);
    ts.forEachChild(node, visit);
  }
  visit(sf);
  assert.ok(expression, `Actual callback ${name} exists in ${file}`);
  const js = ts.transpileModule(`const run = ${expression}; exports.run = run;`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports, AbortController, console, ...globals }, { filename: `${file}:${name}` });
  return exports.run;
}
const surfaces = [
  ['helper', 'src/components/ArchieHelper.tsx', 'sendMessage'],
  ['teacher', 'src/pages/AITeacherPage.tsx', 'askTeacher'],
  ['hint', 'src/components/ArchieHintButton.tsx', 'fetchHint'],
];
function surfaceHarness(surface, ask, overrides = {}) {
  const [name, file, callback] = surface;
  const out = { messages: [], answer: '', source: 'Old badge', error: '', spoken: [], busy: false, hint: '' };
  const lock = { current: false }, abort = { current: null };
  const globals = {
    question: 'Why does a rainbow form?', busy: false, isLoading: false, hint: '',
    messages: [], requestInFlightRef: lock, requestAbortRef: abort, abortRef: abort,
    setMessages(value) { out.messages = typeof value === 'function' ? value(out.messages) : value; },
    setAnswer(value) { out.answer = value; }, setAnswerSource(value) { out.source = value; },
    setHint(value) { out.hint = value; }, setError(value) { out.error = value; },
    setBusy(value) { out.busy = value; }, setIsLoading(value) { out.busy = value; },
    setLoading(value) { out.busy = value; }, setInput() {}, setOpen() {},
    speak(value) { out.spoken.push(value); }, ttsSpeak(value) { out.spoken.push(value); },
    askArchie: ask, friendlyArchieError: core.friendlyArchieError,
    getRememberedChildName: () => null, requestedDestination: () => null,
    parseArchieMessage: (text) => ({ text, buttons: [] }),
    currentQuestion: 'Which shape has three sides?', gameTitle: name === 'hint' ? 'Shapes' : '', subject: 'Maths',
    age: 8, curriculum: { year: 'Year 4', stage: 'Key Stage 2', topics: 'light and sound' },
    navigate() {}, window: { setTimeout(fn) { fn(); } }, ...overrides,
  };
  return { run: loadCallback(file, callback, globals), out, lock, abort };
}
for (const surface of surfaces) {
  test(`${surface[0]} actual callback: same-tick submissions make one shared-router request`, async () => {
    let calls = 0, finish;
    const h = surfaceHarness(surface, () => { calls++; return new Promise(resolve => { finish = resolve; }); });
    const first = h.run('Why does a rainbow form?');
    await h.run('Why does a rainbow form?');
    assert.equal(calls, 1); assert.equal(h.lock.current, true);
    finish(core.localArchieReply('A local explanation'));
    await first;
    assert.equal(h.lock.current, false); assert.equal(h.abort.current, null); assert.equal(h.out.busy, false);
    assert.equal(h.out.spoken[0], 'A local explanation');
  });
  test(`${surface[0]} actual callback: rejected request unlocks and hides private errors`, async () => {
    let calls = 0;
    const h = surfaceHarness(surface, async () => { calls++; throw new Error('private-user-api-key'); });
    await h.run('An unfamiliar question');
    assert.equal(calls, 1); assert.equal(h.lock.current, false); assert.equal(h.out.busy, false);
    assert.ok(h.out.error); assert.ok(!h.out.error.includes('private-user'));
    if (surface[0] === 'teacher') { assert.equal(h.out.source, null); assert.equal(h.out.answer, ''); }
  });
  test(`${surface[0]} actual callback: aborted request does not display or speak a stale reply`, async () => {
    let finish;
    const h = surfaceHarness(surface, () => new Promise(resolve => { finish = resolve; }));
    const pending = h.run('An unfamiliar question');
    h.abort.current.abort(); finish(paidReply); await pending;
    assert.equal(h.out.spoken.length, 0); assert.equal(h.out.answer, ''); assert.equal(h.out.hint, '');
    assert.equal(h.lock.current, false);
  });
}
for (const reply of [core.localArchieReply('Known fact'), paidReply]) {
  test(`teacher actual badge uses verified source: ${reply.source}`, async () => {
    const h = surfaceHarness(surfaces[1], async () => reply);
    await h.run();
    assert.equal(h.out.source, reply.source === 'local' ? 'Local AI' : `OpenAI · ${reply.modelUsed}`);
    assert.equal(h.out.answer, reply.text);
  });
}
test('helper navigation command still finishes without invoking an AI router', async () => {
  let calls = 0, route;
  const h = surfaceHarness(surfaces[0], async () => { calls++; return paidReply; }, {
    requestedDestination: () => ({ label: 'Maths games', route: '/games/maths' }),
    navigate(value) { route = value; },
  });
  await h.run('Open maths'); assert.equal(calls, 0); assert.equal(route, '/games/maths'); assert.equal(h.lock.current, false);
});
test('hint actual callback provides question context with paid fallback explicitly disabled', async () => {
  let sent;
  const h = surfaceHarness(surfaces[2], async request => { sent = request; return core.localArchieReply(request.localHint); });
  await h.run();
  assert.equal(sent.allowOpenAiFallback, false); assert.ok(sent.localHint.includes('Which shape has three sides?'));
  assert.ok(h.out.hint.includes('Which shape has three sides?'));
});
test('contextual local hints do not accidentally submit an answer to a stateful tutor', async () => {
  const { calls, deps } = dependencies({ lookupLocal() { throw new Error('Must not grade a hint as an answer'); } });
  const reply = await core.routeArchieQuestion({ ...request, localHint: 'Read each choice carefully.' }, deps);
  assert.equal(reply.source, 'local'); assert.equal(calls.online, 0); assert.equal(calls.learned, 0);
});
test('same saved local answer reaches helper and teacher actual callbacks with no network', async () => {
  for (const surface of surfaces.slice(0, 2)) {
    let network = 0;
    const { api } = client(async () => { network++; throw new Error('Must not call network'); }, null, 'Previously learned fact');
    const h = surfaceHarness(surface, api.askArchie);
    await h.run('Why does a rainbow form?');
    assert.equal(network, 0); assert.equal(h.out.spoken[0], 'Previously learned fact');
  }
});
test('hint actual callback through real shared adapter has zero network calls', async () => {
  let network = 0;
  const { api } = client(async () => { network++; throw new Error('Must not call network'); });
  const h = surfaceHarness(surfaces[2], api.askArchie); await h.run();
  assert.equal(network, 0); assert.ok(h.out.hint);
});
for (const [, file] of surfaces) {
  test(`complete TSX syntax and routing-import contract: ${file}`, () => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const compiled = ts.transpileModule(source, { fileName: file, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } });
    const errors = (compiled.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
    assert.match(source, /import \{ askArchie, friendlyArchieError \} from '@\/lib\/archie-routing'/);
    assert.doesNotMatch(source, /\/chat[`'"]/);
  });
}
