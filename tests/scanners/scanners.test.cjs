/* Isolated scanner regression tests: no network, credentials, camera or AI calls.
 * Run: node --test tests/scanners/scanners.test.cjs
 * TypeScript is already a project devDependency. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let ts;
try { ts = require('typescript'); }
catch { ts = require(path.join(require('node:child_process').execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'typescript')); }
const root = path.resolve(__dirname, '../..');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');
const corePath = 'src/components/scanners/scanner-core.ts';
const speechPath = 'src/components/scanners/useScannerSpeech.ts';
const capturePath = 'src/components/scanners/ScannerCapture.tsx';
const endpointPath = 'src/server/api/ai-teacher/read-page/POST.ts';
const serverEntryPath = 'src/server/entry.ts';

function load(name, mocks = {}, globals = {}) {
  const output = ts.transpileModule(source(name), {
    fileName: name, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  assert.equal((output.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} };
  const context = { module, exports: module.exports, console, Error, RangeError, URL, setTimeout, clearTimeout, AbortController,
    require(id) { if (!(id in mocks)) throw new Error(`Unexpected dependency: ${id}`); return mocks[id]; }, ...globals };
  vm.runInNewContext(output.outputText, context, { filename: name });
  return module.exports;
}
const core = load(corePath);

test('photo validation accepts supported files at the size boundary', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.equal(core.validatePhoto({ type, size: core.MAX_PHOTO_BYTES }), null);
});
test('photo validation rejects unsupported, empty and oversized files', () => {
  for (const file of [{ type: 'image/svg+xml', size: 100 }, { type: 'text/html', size: 100 }, { type: 'image/jpeg', size: 0 }, { type: 'image/png', size: core.MAX_PHOTO_BYTES + 1 }]) assert.equal(typeof core.validatePhoto(file), 'string');
});
test('data URL validation rejects malformed, empty and oversized camera frames', () => {
  assert.equal(core.dataUrlByteLength('data:image/jpeg;base64,AAAA'), 3);
  for (const value of ['data:image/jpeg;base64,A', 'data:image/svg+xml;base64,AAAA', 'data:image/jpeg;base64,']) assert.equal(core.dataUrlByteLength(value), null);
  const oversized = `data:image/jpeg;base64,${'A'.repeat((Math.ceil((core.MAX_PHOTO_BYTES + 1) / 3)) * 4)}`;
  assert.match(core.validatePhotoDataUrl(oversized), /smaller than 6 MB/);
});
test('word offsets preserve repeated words, punctuation and line breaks', () => {
  const text = 'A cat.\nA cat!';
  assert.equal(core.wordAtOffset(text, 9).text, 'cat!');
  assert.equal(core.wordAtOffset(text, 6), null);
  assert.equal(core.readingWords(text)[2].start, 7);
});
test('word offsets handle Unicode UTF-16 speech positions', () => {
  const text = 'Hello 🌍 café';
  assert.equal(core.wordAtOffset(text, 9).text, 'café');
});
test('speech chunks preserve exact text and offsets', () => {
  const text = 'This is a sentence.\n'.repeat(80);
  const chunks = core.speechChunks(text);
  assert.equal(chunks.map(chunk => chunk.text).join(''), text);
  for (const chunk of chunks) assert.equal(text.slice(chunk.start, chunk.start + chunk.text.length), chunk.text);
});
test('speech chunks handle long unbroken words and reject invalid limits', () => {
  assert.equal(core.speechChunks('x'.repeat(500)).length, 3);
  assert.throws(() => core.speechChunks('hello', 0), RangeError);
  assert.equal(core.speechChunks('').length, 0);
});
const scan = { image: 'data:image/jpeg;base64,AAAA', childId: 42, age: 8, mode: 'reading', task: 'help', question: 'What is a habitat?' };
test('scan request preserves authentication, signal, mode and child question', async () => {
  let sent;
  const local = load(corePath, {}, { fetch: async (url, options) => { sent = { url, options }; return { ok: true, headers: { get: () => 'text/plain' }, text: async () => ' A home for an animal. ' }; } });
  const signal = new AbortController().signal;
  assert.equal(await local.requestScan('/api/ai-teacher/read-page', scan, signal), 'A home for an animal.');
  assert.equal(sent.options.signal, signal);
  assert.equal(sent.options.credentials, 'include');
  const payload = JSON.parse(sent.options.body);
  assert.equal(payload.childId, scan.childId);
  assert.equal(payload.question, scan.question);
  assert.equal(Object.hasOwn(payload, 'age'), false);
  assert.equal(Object.hasOwn(payload, 'scannerRequest'), false);
});
test('scan request does not expose raw server errors or claim a page was read', async () => {
  for (const status of [400, 401, 402, 403, 413, 422, 429, 500, 502, 503]) {
    const local = load(corePath, {}, { fetch: async () => ({ ok: false, status, text: async () => 'private backend detail' }) });
    await assert.rejects(local.requestScan('/api', scan, new AbortController().signal), error => !error.message.includes('private backend'));
  }
});
test('scan request rejects empty, HTML and login-page success responses', async () => {
  for (const [type, text] of [['text/plain', ''], ['text/html', '<body>Sign in</body>'], ['text/plain', '<!DOCTYPE html>login']]) {
    const local = load(corePath, {}, { fetch: async () => ({ ok: true, headers: { get: () => type }, text: async () => text }) });
    await assert.rejects(local.requestScan('/api', scan, new AbortController().signal));
  }
});
test('scan request propagates cancellation rather than inventing an answer', async () => {
  const cancelled = new Error('Cancelled'); cancelled.name = 'AbortError';
  const local = load(corePath, {}, { fetch: async () => { throw cancelled; } });
  await assert.rejects(local.requestScan('/api', scan, new AbortController().signal), { name: 'AbortError' });
});
test('scan request refuses an invalid data URL before it can leave the device', async () => {
  let sent = false;
  const local = load(corePath, {}, { fetch: async () => { sent = true; throw new Error('should not be called'); } });
  await assert.rejects(local.requestScan('/api', { ...scan, image: 'data:image/jpeg;base64,A' }, new AbortController().signal));
  assert.equal(sent, false);
});

async function backend(body = {}, settings = {}) {
  const calls = [], guardCalls = [];
  const selectedChildId = Number(body.childId ?? scan.childId);
  const db = {
    select() { return { from() { return { where() { return { limit: async () => settings.ownsChild === false ? [] : [{ id: selectedChildId, ageGroup: settings.ageGroup ?? '8-10' }] }; } }; } }; },
  };
  class Provider {
    constructor() { this.responses = { create: async payload => { calls.push(payload); if (settings.throwProvider) throw new Error('private provider secret'); return settings.response ?? { status: 'completed', output_text: 'Visible text.' }; } }; }
  }
  const handler = load(endpointPath, {
    openai: Provider,
    'drizzle-orm': { and: (...parts) => parts, eq: (...parts) => parts },
    '@/lib/auth/auth': { getAuth() { return { api: { getSession: async () => { if (settings.authThrows) throw new Error('private auth detail'); return settings.authenticated === false ? null : { user: { id: 'parent-1' } }; } } }; } },
    '@/server/db/client': { db },
    '@/server/db/schema': { children: { id: 'id', parentId: 'parentId', ageGroup: 'ageGroup' } },
    '@/server/paid-ai-guard': { requirePaidAiBilling(res, type) { guardCalls.push(type); if (settings.allow === false) { res.status(402).send('Parent voucher needed.'); return false; } return true; } },
  }, { process: { env: { OPENAI_API_KEY: settings.key === false ? '' : 'test-placeholder-not-a-credential' } } }).default;
  const res = { statusCode: 200, body: '', headers: {}, setHeader(name, value) { this.headers[name.toLowerCase()] = value; }, status(value) { this.statusCode = value; return this; }, type(value) { this.contentType = value; return this; }, send(value) { this.body = value; return this; } };
  await handler({ body: { ...scan, ...body }, headers: settings.headers ?? {} }, res);
  return { calls, guardCalls, res };
}
test('backend keeps parent/voucher guard and never calls AI on denial', async () => {
  const result = await backend({}, { allow: false });
  assert.equal(result.res.statusCode, 402); assert.equal(result.calls.length, 0); assert.equal(result.guardCalls[0], 'text');
});
test('backend rejects bad photos before checking billing or calling AI', async () => {
  for (const image of ['https://example.invalid/photo.jpg', 'data:image/svg+xml;base64,AAAA', 'x'.repeat(8_500_001)]) {
    const result = await backend({ image }); assert.equal(result.res.statusCode, 400); assert.equal(result.calls.length, 0); assert.equal(result.guardCalls.length, 0);
  }
});
test('backend enforces the decoded six-megabyte limit before billing or AI', async () => {
  const image = `data:image/jpeg;base64,${'A'.repeat((Math.ceil((6 * 1024 * 1024 + 1) / 3)) * 4)}`;
  const result = await backend({ image });
  assert.equal(result.res.statusCode, 400); assert.equal(result.calls.length, 0); assert.equal(result.guardCalls.length, 0);
});
test('backend marks scanner responses as private and non-sniffable', async () => {
  const result = await backend();
  assert.equal(result.res.headers['cache-control'], 'no-store, private');
  assert.equal(result.res.headers['x-content-type-options'], 'nosniff');
});
test('scanner access requires a signed-in parent and their own selected learner', async () => {
  const cases = [
    [{ childId: 0 }, {}, 400],
    [{}, { authenticated: false }, 401],
    [{}, { ownsChild: false }, 403],
    [{}, { headers: { origin: 'https://not-sodafom.example' } }, 403],
    [{}, { authThrows: true }, 503],
  ];
  for (const [body, settings, status] of cases) {
    const result = await backend(body, settings);
    assert.equal(result.res.statusCode, status);
    assert.equal(result.calls.length, 0);
  }
});
test('scanner accepts the Sodafom app and configured preview origins', async () => {
  for (const origin of ['https://sodafom.uk', 'https://app.sodafom.uk', 'http://localhost:5173', 'https://preview.airoapp.ai', 'capacitor://localhost']) {
    const result = await backend({}, { headers: { origin } });
    assert.equal(result.res.statusCode, 200, origin);
    assert.equal(result.calls.length, 1, origin);
  }
});
test('the paid-AI guard remains fail-closed before scanner access checks', async () => {
  const result = await backend({ childId: 0 }, { allow: false });
  assert.equal(result.res.statusCode, 402); assert.equal(result.guardCalls.length, 1); assert.equal(result.calls.length, 0);
});
test('backend missing API configuration does not call AI', async () => {
  const result = await backend({}, { key: false }); assert.equal(result.res.statusCode, 503); assert.equal(result.calls.length, 0);
});
test('reading help forwards the specific child question', async () => {
  const result = await backend({ question: 'What does habitat mean?' });
  assert.equal(result.calls[0].input[0].content[0].text, 'What does habitat mean?');
  assert.match(result.calls[0].instructions, /specific question/);
});
test('reading transcription stays separate from explanations and does not invent missing words', async () => {
  const result = await backend({ task: 'transcribe' });
  assert.match(result.calls[0].instructions, /plain page text ONLY/);
  assert.match(result.calls[0].instructions, /never guess missing words/);
  assert.match(result.calls[0].instructions, /\[unclear\]/);
});
test('homework starts with a hint and requests an attempt rather than an answer sheet', async () => {
  const result = await backend({ mode: 'homework' });
  assert.match(result.calls[0].instructions, /Do not reveal .*final answer before an attempt/);
  assert.match(result.calls[0].instructions, /small numbered steps/);
  assert.match(result.calls[0].instructions, /DIFFERENT numbers/);
});
test('homework follow-up carries bounded previous help and child attempt', async () => {
  const result = await backend({ mode: 'homework', previousExplanation: 'h'.repeat(5000), question: 'q'.repeat(700) });
  const payload = JSON.parse(result.calls[0].input[0].content[0].text);
  assert.equal(payload.previousExplanation.length, 2500); assert.equal(payload.childQuestion.length, 500);
});
test('scanner teaching age comes from the owned child profile, not request data', async () => {
  assert.match((await backend({ age: 13 }, { ageGroup: '5-7' })).calls[0].instructions, /aged 6/);
  assert.match((await backend({ age: 5 }, { ageGroup: '11-13' })).calls[0].instructions, /aged 12/);
});
test('scanner safeguards cannot be disabled by a client request field', async () => {
  const result = await backend({ scannerRequest: false, task: 'transcribe' });
  assert.equal(result.calls[0].input[0].content[0].text, 'Read the visible educational text on this one page.');
  assert.match(result.calls[0].instructions, /plain page text ONLY/);
});
test('model and response size are unchanged', async () => {
  const result = await backend(); assert.equal(result.calls[0].model, 'gpt-4o-mini'); assert.equal(result.calls[0].max_output_tokens, 900); assert.equal(result.calls[0].store, false);
});
test('incomplete and empty scans fail visibly rather than presenting a complete page', async () => {
  for (const response of [{ status: 'incomplete', output_text: 'Partial page' }, { status: 'completed', output_text: '' }]) assert.equal((await backend({}, { response })).res.statusCode, 422);
});
test('provider failures remain sanitised', async () => {
  const result = await backend({}, { throwProvider: true }); assert.equal(result.res.statusCode, 502); assert.doesNotMatch(result.res.body, /secret/);
});

// Minimal hook driver for isolated lifecycle tests; not a substitute for React/browser E2E.
function hooks() {
  const slots = [], cleanups = [], effects = [];
  let cursor = 0;
  const react = {
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }]; },
    useRef(initial) { const index = cursor++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index]; },
    useCallback(fn) { cursor++; return fn; },
    useEffect(fn) { const index = cursor++; if (!(index in slots)) { slots[index] = true; effects.push(fn); } },
  };
  return { react, slots, render(fn) { cursor = 0; const value = fn(); while (effects.length) { const cleanup = effects.shift()(); if (cleanup) cleanups.push(cleanup); } return value; }, unmount() { cleanups.forEach(fn => fn()); } };
}
function voiceFixture({ native = false, supported = true } = {}) {
  const h = hooks(), instances = [], spoken = [], received = [], timers = [];
  let stopped = 0;
  class Recognition { constructor() { instances.push(this); } start() { this.started = true; } abort() { this.aborted = true; } }
  class Utterance { constructor(text) { this.text = text; } }
  const window = { addEventListener() {}, removeEventListener() {}, SpeechSynthesisUtterance: Utterance,
    speechSynthesis: { getVoices: () => [], speak: value => spoken.push(value) },
    ...(supported ? { SpeechRecognition: Recognition } : {}),
  };
  const document = { addEventListener() {}, removeEventListener() {}, hidden: false };
  const module = load(speechPath, { react: h.react, '@capacitor/core': { Capacitor: { isNativePlatform: () => native } },
    '@/lib/voice-context': { stopTts() { stopped++; }, ttsSpeak(text, end) { spoken.push({ text, end }); } }, './scanner-core': core,
  }, { window, document, SpeechSynthesisUtterance: Utterance, setTimeout(fn) { timers.push(fn); return timers.length; }, clearTimeout() {} });
  const voice = h.render(() => module.useScannerSpeech(text => received.push(text)));
  return { h, voice, instances, spoken, received, timers, stopped: () => stopped };
}
test('microphone starts only on an explicit tap and supplies editable text', () => {
  const f = voiceFixture(); assert.equal(f.instances.length, 0);
  f.voice.listen(); assert.equal(f.instances.length, 1); assert.equal(f.instances[0].continuous, false);
  f.instances[0].onresult({ results: [[{ transcript: 'Help with this word' }]] });
  assert.equal(f.received[0], 'Help with this word'); assert.equal(f.instances[0].aborted, true);
});
test('microphone denial gives a typed-input fallback', () => {
  const f = voiceFixture(); f.voice.listen(); f.instances[0].onerror({ error: 'not-allowed' });
  assert.match(f.h.slots[3], /permission was not granted/); assert.equal(f.h.slots[1], false);
});
test('unsupported microphone gives a typed-input fallback', () => {
  const f = voiceFixture({ supported: false }); f.voice.listen(); assert.match(f.h.slots[3], /Please type/);
});
test('microphone switches off after the listening limit and on unmount', () => {
  const f = voiceFixture(); f.voice.listen(); f.timers[0](); assert.equal(f.instances[0].aborted, true);
  f.voice.listen(); f.h.unmount(); assert.equal(f.instances[1].aborted, true);
});
test('speech highlighting uses real boundary positions, not guessed timers', () => {
  const f = voiceFixture(); f.voice.speak('Read this word.');
  assert.equal(f.h.slots[2], null);
  f.spoken[0].onstart(); f.spoken[0].onboundary({ name: 'word', charIndex: 5 });
  assert.equal(f.h.slots[2], 5); assert.equal(f.h.slots[0], true);
});
test('stopping speech prevents stale boundary and end callbacks restarting it', () => {
  const f = voiceFixture(); f.voice.speak('A sentence. '.repeat(50)); const first = f.spoken[0];
  f.voice.stopSpeech(); first.onboundary({ name: 'word', charIndex: 4 }); first.onend();
  assert.equal(f.h.slots[2], null); assert.equal(f.spoken.length, 1);
});
test('native read aloud uses the existing bridge without fake highlighting', () => {
  const f = voiceFixture({ native: true }); f.voice.speak('Read this.');
  assert.equal(f.spoken[0].text, 'Read this.'); assert.equal(f.h.slots[2], null);
  f.spoken[0].end(); assert.equal(f.h.slots[0], false);
});

function elements(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(elements)];
}
function cameraFixture() {
  const h = hooks(), errors = [], photos = [], streams = [], listeners = {};
  let resolveCamera, rejectCamera, stopped = 0;
  const video = { srcObject: null, play: async () => {}, videoWidth: 100, videoHeight: 100 };
  const window = { addEventListener(name, fn) { listeners[name] = fn; }, removeEventListener() {} };
  const document = { hidden: false, addEventListener() {}, removeEventListener() {}, createElement: () => ({ getContext: () => ({ drawImage() {} }), toDataURL: () => 'data:image/jpeg;base64,AAAA' }) };
  const Component = load(capturePath, { react: h.react, 'lucide-react': { Camera: 'icon', Upload: 'icon', X: 'icon' }, './scanner-core': core,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
  }, { window, document, navigator: { mediaDevices: { getUserMedia(options) { streams.push(options); return new Promise((resolve, reject) => { resolveCamera = resolve; rejectCamera = reject; }); } } } }).default;
  const render = () => {
    const tree = h.render(() => Component({ onPhoto: value => photos.push(value), onError: value => errors.push(value), onStart() {} }));
    for (const node of elements(tree)) if (node.type === 'video') { if (typeof node.props.ref === 'function') node.props.ref(video); else node.props.ref.current = video; }
    return tree;
  };
  const click = (tree, text) => elements(tree).find(node => node.type === 'button' && JSON.stringify(node.props.children).includes(text)).props.onClick();
  const media = { getTracks: () => [{ stop() { stopped++; } }] };
  return { h, render, click, errors, photos, streams, video, listeners, resolve: () => resolveCamera(media), reject: error => rejectCamera(error), stopped: () => stopped };
}
function uploadFixture() {
  const h = hooks(), errors = [], photos = [], readers = [], images = [];
  class Reader {
    constructor() { readers.push(this); this.readyState = 0; this.result = ''; }
    readAsDataURL() { this.readyState = 2; this.result = 'data:image/jpeg;base64,AAAA'; }
    abort() { this.aborted = true; }
  }
  class ImageFixture {
    constructor() { images.push(this); this.naturalWidth = 100; this.naturalHeight = 100; this._src = ''; }
    get src() { return this._src; }
    set src(value) { this._src = value; }
  }
  const window = { addEventListener() {}, removeEventListener() {} };
  const document = { hidden: false, addEventListener() {}, removeEventListener() {}, createElement: () => ({ getContext: () => ({ drawImage() {} }), toDataURL: () => 'data:image/jpeg;base64,AAAA' }) };
  const Component = load(capturePath, { react: h.react, 'lucide-react': { Camera: 'icon', Upload: 'icon', X: 'icon' }, './scanner-core': core,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
  }, { window, document, FileReader: Reader, Image: ImageFixture, navigator: {} }).default;
  const render = () => h.render(() => Component({ onPhoto: value => photos.push(value), onError: value => errors.push(value), onStart() {} }));
  const upload = tree => {
    const input = elements(tree).find(node => node.type === 'input' && node.props['aria-label'] === 'Upload a scanner photo');
    input.props.onChange({ target: { files: [{ type: 'image/jpeg', size: 3 }], value: 'page.jpg' } });
  };
  return { h, render, upload, readers, images, errors, photos };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
test('camera requests video only after an explicit tap', async () => {
  const f = cameraFixture(); let tree = f.render(); assert.equal(f.streams.length, 0);
  f.click(tree, 'Open camera'); tree = f.render(); assert.equal(f.streams[0].audio, false);
  f.resolve(); await flush(); assert.notEqual(f.video.srcObject, null); f.h.unmount();
});
test('camera permission arriving after cancellation immediately releases tracks', async () => {
  const f = cameraFixture(); f.click(f.render(), 'Open camera');
  f.click(f.render(), 'Close camera'); f.resolve(); await flush();
  assert.equal(f.stopped(), 1); assert.equal(f.video.srcObject, null);
});
test('camera capture produces a photo and releases tracks', async () => {
  const f = cameraFixture(); f.click(f.render(), 'Open camera'); f.render(); f.resolve(); await flush();
  f.click(f.render(), 'Take photo'); assert.equal(f.photos[0], 'data:image/jpeg;base64,AAAA'); assert.equal(f.stopped(), 1);
});
test('camera closes on page exit and unmount', async () => {
  const f = cameraFixture(); f.click(f.render(), 'Open camera'); f.render(); f.resolve(); await flush();
  f.listeners.pagehide(); assert.equal(f.stopped(), 1); f.h.unmount(); assert.equal(f.stopped(), 1);
});
test('camera denial offers upload instead of leaving a stuck preview', async () => {
  const f = cameraFixture(); f.click(f.render(), 'Open camera'); f.render();
  const denied = new Error('Denied'); denied.name = 'NotAllowedError'; f.reject(denied); await flush();
  assert.match(f.errors.at(-1), /upload a photo/); assert.equal(elements(f.render()).some(node => node.type === 'video'), false);
});
test('upload decoding drops the raw source after re-encoding and when the page closes', () => {
  const f = uploadFixture();
  f.upload(f.render());
  f.readers[0].onload();
  assert.equal(f.readers[0].onload, null);
  assert.equal(f.images[0].src, 'data:image/jpeg;base64,AAAA');
  f.images[0].onload();
  assert.equal(f.photos[0], 'data:image/jpeg;base64,AAAA');
  assert.equal(f.images[0].src, '');

  f.upload(f.render());
  f.readers[1].onload();
  f.h.unmount();
  assert.equal(f.images[1].src, '');
});
test('scanner route stays within Reading and preserves existing book collection', () => {
  const text = source('src/pages/ReadingPage.tsx');
  assert.match(text, /route: '\/reading\?scan=1'/); assert.match(text, /searchParams.get\('books'\) === '1'/);
  assert.match(text, /searchParams.get\('scan'\) === '1'/); assert.doesNotMatch(text, /route: '\/ai-teacher'/);
});
test('scanner components contain no persistence, forced speaking or decorative emoji', () => {
  const files = [capturePath, speechPath, 'src/components/scanners/ScannerWorkspace.tsx', corePath];
  for (const file of files) assert.doesNotMatch(source(file), /localStorage|sessionStorage|indexedDB|innerHTML|[\u{1F300}-\u{1FAFF}]/u);
});
test('uploaded photos are redrawn before previewing or sending to strip metadata', () => {
  const capture = source(capturePath);
  assert.match(capture, /removeMetadataAndResize/);
  assert.match(capture, /context\.drawImage\(image,/);
  assert.match(capture, /canvas\.toDataURL\('image\/jpeg', 0\.82\)/);
  assert.match(capture, /previewImage\.current = check/);
  assert.match(capture, /target\.src = ''/);
  assert.match(capture, /discardReader\(next\)/);
});
test('scanner route rejects untrusted, oversized and burst traffic before the narrow parser', () => {
  const entry = source(serverEntryPath);
  const scannerRoute = 'app.post("/api/ai-teacher/read-page", scannerRequestGate, express.json({ limit: "9mb" }), ai_teacher_read_page_post);';
  assert.ok(entry.indexOf(scannerRoute) >= 0);
  assert.ok(entry.indexOf(scannerRoute) < entry.indexOf('app.use(express.json());'));
  assert.equal((entry.match(/app\.post\("\/api\/ai-teacher\/read-page"/g) ?? []).length, 1);
  assert.ok(entry.indexOf('function scannerRequestGate') < entry.indexOf(scannerRoute));
  assert.match(entry, /isTrustedScannerOrigin\(req\.headers\.origin\)/);
  assert.match(entry, /content-length/);
  assert.match(entry, /SCANNER_RATE_LIMIT_MAX/);
  assert.match(entry, /Retry-After/);
  assert.match(entry, /app\.use\("\/api\/ai-teacher\/read-page", \(err: unknown/);
  assert.match(entry, /This photo is too large\. Please choose a photograph smaller than 6 MB\./);
});
test('scanner page scrubs transient page state when hidden or left', () => {
  const workspace = source('src/components/scanners/ScannerWorkspace.tsx');
  assert.match(workspace, /window\.addEventListener\('pagehide', clearSensitiveState\)/);
  assert.match(workspace, /if \(document\.hidden\) clearSensitiveState\(\)/);
  assert.match(workspace, /setPhoto\(''\); setPageText\(''\); setExplanation\(''\); setQuestion\(''\)/);
});
test('scanner read-aloud does not log the spoken page text', () => {
  const voice = source('src/lib/voice-context.tsx');
  assert.doesNotMatch(voice, /ttsSpeak starting:\s*['"`],?\s*\{\s*text/);
});
test('all eleven changed application files parse as TypeScript / TSX', () => {
  for (const file of [corePath, speechPath, capturePath, endpointPath, serverEntryPath, 'src/components/scanners/ScannerWorkspace.tsx', 'src/pages/HomeworkHelperPage.tsx', 'src/pages/ReadingPage.tsx', 'src/lib/voice-context.tsx', 'src/pages/AITeacherPage.tsx', 'src/pages/legal.tsx']) {
    const parsed = ts.createSourceFile(file, source(file), ts.ScriptTarget.Latest, true);
    assert.equal(parsed.parseDiagnostics.length, 0, file);
  }
});

test('camera permission resolving before preview mount still attaches the stream', async () => {
  const f = cameraFixture(); f.click(f.render(), 'Open camera');
  f.resolve(); await flush(); f.render();
  assert.notEqual(f.video.srcObject, null); f.h.unmount();
});
test('camera permission resolving after unmount releases the stream', async () => {
  const f = cameraFixture(); f.click(f.render(), 'Open camera');
  f.h.unmount(); f.resolve(); await flush(); assert.equal(f.stopped(), 1);
});
