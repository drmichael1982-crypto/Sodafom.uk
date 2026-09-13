/*
 * Agent 18 voice/audio recovery checks. These are isolated from real browser
 * devices, network, child profiles, microphone hardware and AI providers.
 * Run: node --test tests/agent18/voice-audio.test.cjs
 */
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
const policyPath = 'src/lib/audio-policy.ts';
const runtimePath = 'src/lib/audio-runtime.ts';
const inputPath = 'src/lib/speech-input.ts';
const recorderPath = 'src/components/VoiceRecorder.tsx';
const settingsPath = 'src/components/audio/AudioSettings.tsx';
const voicePath = 'src/lib/voice-context.tsx';

function load(name, mocks = {}, globals = {}) {
  const output = ts.transpileModule(source(name), {
    fileName: name,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  assert.equal((output.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0, name);
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    console,
    Error,
    RangeError,
    Blob,
    Promise,
    setTimeout,
    clearTimeout,
    require(id) {
      if (!(id in mocks)) throw new Error(`Unexpected dependency ${id} for ${name}`);
      return mocks[id];
    },
    ...globals,
  };
  vm.runInNewContext(output.outputText, context, { filename: name });
  return module.exports;
}

test('audio settings clamp local values and foreground audio has one owner', () => {
  const policy = load(policyPath);
  const capped = policy.normaliseAudioSettings({ voices: false, quiet: true, voiceVolume: 2 });
  assert.equal(capped.voices, false); assert.equal(capped.quiet, true); assert.equal(capped.voiceVolume, 1);
  const floored = policy.normaliseAudioSettings({ voiceVolume: -1 });
  assert.equal(floored.voices, true); assert.equal(floored.quiet, false); assert.equal(floored.voiceVolume, 0);
  assert.equal(policy.channelVolume('voice', { voices: true, quiet: true, voiceVolume: 0.9 }), 0.5);
  assert.equal(policy.channelVolume('voice', { voices: false, quiet: false, voiceVolume: 0.9 }), 0);
  assert.equal(policy.channelVolume('effects', { voices: true, quiet: false, voiceVolume: 0.9 }), 0);

  let firstStopped = 0;
  let secondStopped = 0;
  policy.claimAudioFocus('voice', () => { firstStopped += 1; });
  policy.claimAudioFocus('microphone', () => { secondStopped += 1; });
  assert.equal(firstStopped, 1);
  assert.equal(policy.getAudioFocus(), 'microphone');
  policy.stopForegroundAudio();
  assert.equal(secondStopped, 1);
  assert.equal(policy.getAudioFocus(), null);
});

test('spoken text is cleaned, bounded into exact chunks, and captions have no persistence API', () => {
  const runtime = load(runtimePath, { './audio-policy': { channelVolume: () => 1, claimAudioFocus: () => () => {}, subscribeAudioSettings: () => () => {} } });
  assert.equal(runtime.cleanSpeakableText('## [Read me](https://private.example) — 4 × 3!!!'), 'Read me — 4 times 3!');
  const original = 'A clear sentence. '.repeat(90);
  assert.equal(runtime.speechChunks(original, 90).join(''), original);
  assert.equal(runtime.getSpeechCaption(), '');
  assert.doesNotMatch(source(runtimePath), /\blocalStorage\.(?:getItem|setItem|removeItem|clear|key)\b/);
  assert.equal(source(runtimePath).includes('fetch('), false);
});

test('browser recognition begins only after an explicit start and returns one transient result', () => {
  const policy = { claimAudioFocus: (_kind, cancel) => () => cancel() };
  const input = load(inputPath, { './audio-policy': policy });
  const messages = [];
  const transcripts = [];
  const instances = [];
  class Recognition {
    constructor() { instances.push(this); }
    start() { this.started = true; }
    abort() { this.aborted = true; }
  }
  const document = { hidden: false, addEventListener() {}, removeEventListener() {} };
  const host = { isSecureContext: true, SpeechRecognition: Recognition, document, addEventListener() {}, removeEventListener() {} };
  assert.equal(instances.length, 0);
  input.startSpeechInput({ onState: (state, message) => messages.push([state, message]), onTranscript: text => transcripts.push(text) }, host);
  assert.equal(instances.length, 1);
  assert.equal(instances[0].continuous, false);
  assert.equal(instances[0].interimResults, false);
  instances[0].onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: '  hello there  ' } }] });
  assert.deepEqual(transcripts, ['hello there']);
  assert.equal(instances[0].aborted, true);
  assert.equal(messages.at(-1)[0], 'off');
  assert.equal(source(inputPath).includes('localStorage'), false);
  assert.equal(source(inputPath).includes('fetch('), false);
});

test('speech input reports a typed-control fallback for denied or unsupported access', () => {
  const input = load(inputPath, { './audio-policy': { claimAudioFocus: () => () => {} } });
  assert.match(input.microphoneError('not-allowed'), /Ask an adult/);
  const messages = [];
  input.startSpeechInput({ onState: (_state, message) => messages.push(message), onTranscript() {} }, { isSecureContext: false });
  assert.match(messages[0], /secure HTTPS page/);
});

test('late microphone permission after a cancelled clip recording immediately releases every track', async () => {
  const input = load(inputPath, { './audio-policy': { claimAudioFocus: () => () => {} } });
  let resolveMedia;
  let stopped = 0;
  const media = { getTracks: () => [{ stop() { stopped += 1; } }, { stop() { stopped += 1; } }] };
  const host = {
    isSecureContext: true,
    navigator: { mediaDevices: { getUserMedia() { return new Promise(resolve => { resolveMedia = resolve; }); } } },
    MediaRecorder: class { static isTypeSupported() { return true; } },
    document: { hidden: false, addEventListener() {}, removeEventListener() {} },
    addEventListener() {},
    removeEventListener() {},
  };
  const blobs = [];
  const handle = input.startVoiceRecording({ onState() {}, onBlob: blob => blobs.push(blob) }, host);
  handle.cancel();
  resolveMedia(media);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(stopped, 2);
  assert.equal(blobs.length, 0);
});

test('a recording is bounded and reaches the caller only after MediaRecorder stops', async () => {
  const input = load(inputPath, { './audio-policy': { claimAudioFocus: () => () => {} } });
  const instances = [];
  class Recorder {
    static isTypeSupported() { return true; }
    constructor(stream, options) { this.stream = stream; this.mimeType = options?.mimeType ?? 'audio/webm'; this.state = 'inactive'; instances.push(this); }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      this.ondataavailable?.({ data: new Blob(['safe local clip'], { type: 'audio/webm' }) });
      this.onstop?.();
    }
  }
  let stopped = 0;
  const stream = { getTracks: () => [{ stop() { stopped += 1; } }] };
  const states = [];
  const blobs = [];
  const host = {
    isSecureContext: true,
    navigator: { mediaDevices: { getUserMedia: async constraints => { assert.equal(constraints.video, false); return stream; } } },
    MediaRecorder: Recorder,
    document: { hidden: false, addEventListener() {}, removeEventListener() {} },
    addEventListener() {},
    removeEventListener() {},
  };
  const handle = input.startVoiceRecording({ maxMs: 8_000, onState: (state, message) => states.push([state, message]), onBlob: blob => blobs.push(blob) }, host);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(instances.length, 1);
  assert.equal(instances[0].state, 'recording');
  handle.stop();
  assert.equal(blobs.length, 1);
  assert.equal(blobs[0].type, 'audio/webm;codecs=opus');
  assert.equal(stopped, 1);
  assert.equal(states.some(([state]) => state === 'processing'), true);
});

test('voice UI uses the safe helpers, provides save/delete/stop controls, and avoids raw-content logs', () => {
  const recorder = source(recorderPath);
  const settings = source(settingsPath);
  const voice = source(voicePath);
  assert.match(recorder, /startVoiceRecording/);
  assert.doesNotMatch(recorder, /navigator\.mediaDevices\.getUserMedia|new MediaRecorder|localStorage/);
  assert.match(recorder, /Save recording/);
  assert.match(recorder, /Discard this unsaved recording/);
  assert.match(recorder, /Stop recording/);
  assert.match(recorder, /Delete saved recording/);
  assert.match(settings, /clearSpeechCaption/);
  assert.match(settings, /Stop reading and microphone/);
  assert.match(settings, /Test microphone/);
  assert.doesNotMatch(settings, /localStorage|fetch\(/);
  assert.doesNotMatch(voice, /console\.(log|info|warn|error)/);
});

test('all Agent 18 application changes parse as TypeScript or TSX', () => {
  for (const file of [policyPath, runtimePath, inputPath, voicePath, recorderPath, settingsPath, 'src/components/AccessibilityBar.tsx']) {
    const scriptKind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const parsed = ts.createSourceFile(file, source(file), ts.ScriptTarget.Latest, true, scriptKind);
    assert.equal(parsed.parseDiagnostics.length, 0, file);
  }
});
