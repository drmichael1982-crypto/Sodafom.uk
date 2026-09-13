/** Run: node scripts/test-agent18-audio.mjs. No microphone, network, provider keys or paid calls. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = mkdtempSync(path.join(tmpdir(), 'agent18-audio-'));
const sources = ['audio-policy', 'audio-runtime', 'speech-input', 'island-speech'];
const localTsc = path.join(root, 'node_modules/.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
const tsc = existsSync(localTsc) ? localTsc : (process.env.AGENT18_TSC || 'tsc');
execFileSync(tsc, ['--strict', '--noUnusedLocals', '--noUnusedParameters', '--target', 'ES2022', '--module', 'ES2022', '--moduleResolution', 'bundler', '--lib', 'ES2022,DOM', '--outDir', output, ...sources.map(name => `src/lib/${name}.ts`)], { cwd: root, stdio: 'inherit' });
writeFileSync(path.join(output, 'package.json'), '{"type":"module"}');
for (const name of readdirSync(output).filter(name => name.endsWith('.js'))) {
  const filename = path.join(output, name);
  writeFileSync(filename, readFileSync(filename, 'utf8').replace(/from '(\.\/[^']+)'/g, (_, specifier) => `from '${specifier}.js'`));
}
class Storage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
class Host extends EventTarget {
  isSecureContext = true;
  localStorage = new Storage();
  document = Object.assign(new EventTarget(), { hidden: false });
}
const host = new Host();
globalThis.window = host;
globalThis.document = host.document;
const policy = await import(pathToFileURL(path.join(output, 'audio-policy.js')));
const input = await import(pathToFileURL(path.join(output, 'speech-input.js')));
const runtime = await import(pathToFileURL(path.join(output, 'audio-runtime.js')));
const island = await import(pathToFileURL(path.join(output, 'island-speech.js')));
const tests = [];
const test = (name, callback) => tests.push({ name, callback });
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
test('server-side invocation fails safely without window or a microphone', () => {
  const previous = globalThis.window; delete globalThis.window;
  try {
    const states = [];
    input.startSpeechInput({ onState: state => states.push(state), onTranscript: () => assert.fail('Unexpected transcript') });
    input.startVoiceRecording({ onState: state => states.push(state), onBlob: () => assert.fail('Unexpected recording') });
    assert.deepEqual(states, ['error', 'error']);
  } finally { globalThis.window = previous; }
});
const voice = (name, uri, localService = true) => ({ name, voiceURI: uri, lang: 'en-GB', localService, default: false });
class Synth extends EventTarget {
  voices = [voice('UK child boy', 'boy'), voice('UK adult female', 'woman'), voice('UK adult male', 'man')];
  calls = []; cancelled = 0;
  getVoices() { return this.voices; }
  speak(utterance) { this.calls.push(utterance); }
  cancel() { this.cancelled++; }
}
class Utterance { constructor(text) { this.text = text; } }
globalThis.SpeechSynthesisUtterance = Utterance;
const resetSynth = () => { const synth = new Synth(); host.speechSynthesis = synth; return synth; };
class Recognition {
  static instances = [];
  started = 0; aborted = 0;
  constructor() { Recognition.instances.push(this); }
  start() { this.started++; }
  abort() { this.aborted++; }
}
const recognitionHost = () => Object.assign(new Host(), { SpeechRecognition: Recognition });
const latest = () => Recognition.instances.at(-1);
const recordingHost = (getUserMedia, Recorder) => Object.assign(new Host(), { navigator: { mediaDevices: { getUserMedia } }, MediaRecorder: Recorder });
const stream = () => { const track = { stopped: 0, stop() { this.stopped++; } }; return { track, getTracks: () => [track] }; };
class Recorder {
  static instances = [];
  static isTypeSupported(type) { return type === 'audio/mp4'; }
  state = 'inactive'; mimeType = 'audio/mp4';
  constructor(acquired, options) { this.stream = acquired; this.options = options; Recorder.instances.push(this); }
  start() { this.state = 'recording'; }
  stop() {
    this.state = 'inactive';
    const data = this.ondataavailable; const stopped = this.onstop;
    queueMicrotask(() => { data?.({ data: new Blob(['clip'], { type: 'audio/mp4' }) }); stopped?.(); });
  }
}

test('strict isolated TypeScript compilation', () => assert.ok(existsSync(path.join(output, 'audio-runtime.js'))));
test('defaults opt out of music/effects and preserve read-aloud', () => {
  assert.equal(policy.getAudioSettings().effects, false); assert.equal(policy.getAudioSettings().music, false); assert.equal(policy.getAudioSettings().voices, true);
});
test('settings reject invalid values and clamp volume', () => {
  const settings = policy.normaliseAudioSettings({ voices: 'false', voiceVolume: NaN, musicVolume: -1, effectsVolume: 9 });
  assert.equal(settings.voices, true); assert.equal(settings.voiceVolume, .85); assert.equal(settings.musicVolume, 0); assert.equal(settings.effectsVolume, 1);
});
test('quiet mode mutes extras without muting reading', () => {
  const settings = policy.normaliseAudioSettings({ music: true, effects: true, quiet: true });
  assert.equal(policy.channelVolume('music', settings, null), 0); assert.equal(policy.channelVolume('effects', settings, null), 0); assert.equal(policy.channelVolume('voice', settings, null), .85);
});
test('voice and microphone focus both suppress music/effects', () => {
  const settings = policy.normaliseAudioSettings({ music: true, effects: true });
  for (const focus of ['voice', 'microphone']) for (const channel of ['music', 'effects']) assert.equal(policy.channelVolume(channel, settings, focus), 0);
});
test('old focus cleanup cannot release a newer owner', () => {
  let interrupted = 0; const first = policy.claimAudioFocus('voice', () => { interrupted++; first(); });
  const second = policy.claimAudioFocus('microphone', () => {}); first();
  assert.equal(interrupted, 1); assert.equal(policy.getAudioFocus(), 'microphone'); second(); assert.equal(policy.getAudioFocus(), null);
});
test('settings persist and notify without writing transcripts', () => {
  let events = 0; const off = policy.subscribeAudioSettings(() => events++);
  policy.updateAudioSettings({ effects: true, quiet: true }); off();
  assert.equal(events, 1); assert.equal(host.localStorage.getItem('sodafom_sound_enabled'), 'false');
  assert.equal(JSON.parse(host.localStorage.getItem('sodafom-audio-settings-v1')).quiet, true);
  policy.updateAudioSettings(policy.DEFAULT_AUDIO_SETTINGS);
});
test('female is never matched as male', () => {
  assert.equal(policy.voiceMatchesRole('English female', 'adult-man'), false);
  assert.equal(policy.voiceMatchesRole('English female', 'child-boy'), false);
  assert.equal(policy.voiceMatchesRole('English male', 'adult-man'), true);
});
test('family dogs cannot be reconfigured as humans', () => {
  assert.throws(() => policy.configureCharacterVoice({ id: 'Daisy', role: 'child-girl', rate: 1, pitch: 1 }));
  for (const name of ['Daisy', 'Jessica', 'Sally']) assert.equal(policy.selectCharacterVoice(name, []).quality, 'dog');
});
test('explicit adult and child voice bindings stay distinct', () => {
  const voices = [voice('UK child boy', 'boy'), voice('UK adult female', 'woman'), voice('UK adult male', 'man')];
  for (const [id, role, uri] of [['test-child', 'child-boy', 'boy'], ['test-woman', 'adult-woman', 'woman'], ['test-man', 'adult-man', 'man']]) {
    policy.configureCharacterVoice({ id, role, voiceURI: uri, rate: 1, pitch: 1 });
    assert.equal(policy.selectCharacterVoice(id, voices).voice.voiceURI, uri);
  }
});
test('pinned voice survives changes in list order', () => {
  const voices = [voice('UK child boy', 'boy'), voice('UK child boy second', 'boy2')];
  const first = policy.selectCharacterVoice('pin-order-test', voices).voice.voiceURI;
  assert.equal(policy.selectCharacterVoice('pin-order-test', [...voices].reverse()).voice.voiceURI, first);
});
test('missing pinned voice is not silently replaced', () => {
  policy.configureCharacterVoice({ id: 'missing-test', role: 'adult-woman', voiceURI: 'missing', rate: 1, pitch: 1 });
  assert.equal(policy.selectCharacterVoice('missing-test', [voice('Other female', 'other')]).quality, 'unavailable');
});
test('unreviewed identities are unassigned, not guessed from names', () => assert.equal(policy.getCharacterProfile('New Teacher').role, 'unassigned'));
test('remote-only speech voices are not used', () => assert.equal(policy.selectCharacterVoice('remote-test', [voice('UK voice', 'remote', false)]).quality, 'unavailable'));
test('markup cleaning and maths pronunciation', () => assert.equal(runtime.cleanSpeakableText('## **Try** 3 × 4 = 12! [help](https://example.com) XXX'), 'Try 3 times 4 equals 12! help'));
test('long speech chunks retain every character in order', () => {
  const text = 'A short sentence. '.repeat(130); const chunks = runtime.speechChunks(text);
  assert.equal(chunks.join(''), text); assert.ok(chunks.length > 1); assert.ok(chunks.every(chunk => chunk.length <= 600));
});
test('dogs never reach human speech engines', async () => {
  const synth = resetSynth(); let native = 0;
  const playback = runtime.speakAudio('Hello, I am a dog', { character: 'Daisy', native: { speak: async () => { native++; return {}; }, stop: async () => {} } });
  assert.equal(await playback.finished, 'unavailable'); assert.equal(synth.calls.length, 0); assert.equal(native, 0);
});
test('cancel while waiting for voices prevents delayed speech', async () => {
  const synth = resetSynth(); synth.voices = [];
  const playback = runtime.speakAudio('Please do not start later'); playback.stop();
  synth.voices = [voice('UK child boy', 'boy')]; synth.dispatchEvent(new Event('voiceschanged'));
  await new Promise(resolve => setTimeout(resolve, 1050));
  assert.equal(await playback.finished, 'cancelled'); assert.equal(synth.calls.length, 0);
});
test('empty voiceschanged does not consume the real ready event', async () => {
  const synth = resetSynth(); synth.voices = [];
  const playback = runtime.speakAudio('One ready event'); synth.dispatchEvent(new Event('voiceschanged'));
  synth.voices = [voice('UK child boy', 'boy')]; synth.dispatchEvent(new Event('voiceschanged'));
  assert.equal(synth.calls.length, 1); synth.calls[0].onend(); assert.equal(await playback.finished, 'finished');
});
test('old speech callbacks cannot finish newer speech', async () => {
  const synth = resetSynth(); const first = runtime.speakAudio('First'); const late = synth.calls[0].onend;
  const second = runtime.speakAudio('Second'); late();
  assert.equal(await first.finished, 'cancelled'); assert.equal(policy.getAudioFocus(), 'voice');
  synth.calls[1].onend(); assert.equal(await second.finished, 'finished');
});
test('native rejection after Stop does not trigger browser fallback', async () => {
  const synth = resetSynth(); let reject; let stops = 0;
  const playback = runtime.speakAudio('Native', { native: { speak: () => new Promise((_, failed) => { reject = failed; }), stop: async () => { stops++; } } });
  playback.stop(); reject(new Error('late failure')); await tick();
  assert.equal(await playback.finished, 'cancelled'); assert.equal(stops, 1); assert.equal(synth.calls.length, 0);
});
test('ordinary native failure makes one browser fallback', async () => {
  const synth = resetSynth(); let stops = 0;
  const playback = runtime.speakAudio('Fallback', { native: { speak: async () => { throw new Error('engine'); }, stop: async () => { stops++; } } });
  await tick(); assert.equal(synth.calls.length, 1); synth.calls[0].onend();
  assert.equal(await playback.finished, 'finished'); assert.equal(stops, 1);
});
test('native stopped result is cancellation rather than success', async () => {
  resetSynth(); const playback = runtime.speakAudio('Stopped', { native: { speak: async () => ({ status: 'stopped' }), stop: async () => {} } });
  assert.equal(await playback.finished, 'cancelled');
});
test('muting a voice settles playback and releases audio focus', async () => {
  resetSynth(); const playback = runtime.speakAudio('Mute now'); policy.updateAudioSettings({ voices: false });
  assert.equal(await playback.finished, 'muted'); assert.equal(policy.getAudioFocus(), null); policy.updateAudioSettings({ voices: true });
});
test('hidden page cancels speech', async () => {
  resetSynth(); const playback = runtime.speakAudio('Hide now'); host.document.hidden = true; host.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(await playback.finished, 'cancelled'); host.document.hidden = false;
});
test('unsupported/insecure recognition never opens a mic', () => {
  let state; let message; input.startSpeechInput({ onState: (s, m) => { state = s; message = m; }, onTranscript: () => assert.fail() }, { isSecureContext: false, SpeechRecognition: Recognition });
  assert.equal(state, 'error'); assert.match(message, /HTTPS/);
});
test('permission-pending state is explicit and cancellable', () => {
  const states = []; const cancel = input.startSpeechInput({ onState: s => states.push(s), onTranscript: () => assert.fail() }, recognitionHost());
  assert.equal(states[0], 'requesting'); cancel(); assert.equal(states.at(-1), 'off'); assert.equal(latest().aborted, 1);
});
test('webkit recognition alias is supported', () => {
  const cancel = input.startSpeechInput({ onState: () => {}, onTranscript: () => {} }, { webkitSpeechRecognition: Recognition, isSecureContext: true });
  assert.equal(latest().started, 1); cancel();
});
test('permission denial does not restart or retry', () => {
  const states = []; input.startSpeechInput({ onState: s => states.push(s), onTranscript: () => {} }, recognitionHost());
  const rec = latest(); rec.onerror({ error: 'not-allowed' });
  assert.equal(rec.started, 1); assert.equal(states.at(-1), 'error'); assert.equal(policy.getAudioFocus(), null);
});
test('only final nonempty transcript is delivered once', () => {
  const values = []; input.startSpeechInput({ onState: () => {}, onTranscript: text => { assert.equal(policy.getAudioFocus(), null); values.push(text); } }, recognitionHost());
  const rec = latest(); const late = rec.onresult;
  rec.onresult({ results: [{ isFinal: false, 0: { transcript: 'interim' } }] });
  assert.equal(values.length, 0);
  rec.onresult({ results: [{ isFinal: true, 0: { transcript: ' hello ' } }] });
  late({ results: [{ isFinal: true, 0: { transcript: 'late' } }] }); assert.deepEqual(values, ['hello']);
});
test('double start aborts old mic and old stop cannot kill new mic', () => {
  const stopFirst = input.startSpeechInput({ onState: () => {}, onTranscript: () => {} }, recognitionHost()); const first = latest();
  const stopSecond = input.startSpeechInput({ onState: () => {}, onTranscript: () => {} }, recognitionHost()); const second = latest();
  assert.equal(first.aborted, 1); stopFirst(); assert.equal(second.aborted, 0); stopSecond();
});
test('recognition stops when a page becomes hidden', () => {
  const page = recognitionHost(); input.startSpeechInput({ onState: () => {}, onTranscript: () => {} }, page);
  page.document.hidden = true; page.document.dispatchEvent(new Event('visibilitychange')); assert.equal(latest().aborted, 1);
});
test('recognition stops on pagehide', () => {
  const page = recognitionHost(); input.startSpeechInput({ onState: () => {}, onTranscript: () => {} }, page);
  page.dispatchEvent(new Event('pagehide')); assert.equal(latest().aborted, 1);
});
test('recognition timeout closes microphone without retries', async () => {
  const states = []; input.startSpeechInput({ timeoutMs: 1000, onState: s => states.push(s), onTranscript: () => {} }, recognitionHost());
  const rec = latest(); await new Promise(resolve => setTimeout(resolve, 1050)); assert.equal(states.at(-1), 'off'); assert.equal(rec.started, 1); assert.equal(rec.aborted, 1);
});
test('recognition constructor/start failures are recoverable', () => {
  let state; const options = { onState: s => { state = s; }, onTranscript: () => {} };
  input.startSpeechInput(options, { SpeechRecognition: class { constructor() { throw new Error('unsupported'); } } }); assert.equal(state, 'error');
  input.startSpeechInput(options, { SpeechRecognition: class extends Recognition { start() { throw new Error('busy'); } } }); assert.equal(state, 'error'); assert.equal(policy.getAudioFocus(), null);
});
test('island answer matching preserves numeric values before option indices', () => {
  assert.equal(island.choiceFromTranscript('three', ['8', '3', '9']), '3'); assert.equal(island.choiceFromTranscript('option C', ['8', '3', '9']), '9'); assert.equal(island.choiceFromTranscript('unknown', ['8', '3', '9']), null);
});
test('recording asks for audio only with optional noise controls', () => {
  assert.equal(input.RECORDING_CONSTRAINTS.video, false); assert.equal(input.RECORDING_CONSTRAINTS.audio.noiseSuppression.ideal, true); assert.equal(input.RECORDING_CONSTRAINTS.audio.echoCancellation.ideal, true);
});
test('cancelled permission request stops a late acquired stream', async () => {
  let permit; const acquired = stream(); const before = Recorder.instances.length;
  const recording = input.startVoiceRecording({ onState: () => {}, onBlob: () => assert.fail() }, recordingHost(() => new Promise(resolve => { permit = resolve; }), Recorder));
  recording.cancel(); permit(acquired); await tick(); assert.equal(acquired.track.stopped, 1); assert.equal(Recorder.instances.length, before);
});
test('recorder constructor failure releases microphone', async () => {
  const acquired = stream(); let state;
  class FailingRecorder extends Recorder { constructor() { super(); throw new Error('codec'); } }
  input.startVoiceRecording({ onState: s => { state = s; }, onBlob: () => assert.fail() }, recordingHost(async () => acquired, FailingRecorder));
  await tick(); assert.equal(state, 'error'); assert.equal(acquired.track.stopped, 1); assert.equal(policy.getAudioFocus(), null);
});
test('recording Stop produces actual supported MIME and is idempotent', async () => {
  const acquired = stream(); const blobs = [];
  const recording = input.startVoiceRecording({ onState: () => {}, onBlob: blob => blobs.push(blob) }, recordingHost(async () => acquired, Recorder));
  await tick(); assert.equal(Recorder.instances.at(-1).options.mimeType, 'audio/mp4'); recording.stop(); recording.stop(); await tick();
  assert.equal(blobs.length, 1); assert.equal(blobs[0].type, 'audio/mp4'); assert.ok(acquired.track.stopped > 0); assert.equal(policy.getAudioFocus(), null);
});
test('cancel recording discards queued data and preview callbacks', async () => {
  const acquired = stream(); const recording = input.startVoiceRecording({ onState: () => {}, onBlob: () => assert.fail('cancelled clip delivered') }, recordingHost(async () => acquired, Recorder));
  await tick(); recording.cancel(); await tick(); assert.ok(acquired.track.stopped > 0);
});
test('recording is stopped on page exit', async () => {
  const acquired = stream(); const page = recordingHost(async () => acquired, Recorder);
  input.startVoiceRecording({ onState: () => {}, onBlob: () => assert.fail() }, page); await tick(); page.dispatchEvent(new Event('pagehide')); await tick(); assert.ok(acquired.track.stopped > 0);
});
test('recording permission denial leaves microphone off', async () => {
  let state; const error = new Error('denied'); error.name = 'NotAllowedError';
  input.startVoiceRecording({ onState: s => { state = s; }, onBlob: () => assert.fail() }, recordingHost(async () => { throw error; }, Recorder));
  await tick(); assert.equal(state, 'error'); assert.equal(policy.getAudioFocus(), null);
});
test('optional effects remain silent by default', async () => assert.equal(await runtime.playActionSound('tap'), false));
test('Android source does not override device volume or log child text', () => {
  const java = readFileSync(path.join(root, 'app/src/main/java/uk/sodafom/app/ArchieSpeechPlugin.java'), 'utf8');
  assert.doesNotMatch(java, /audioManager\.setStreamVolume\s*\(/); assert.doesNotMatch(java, /Log\.[a-z]\([^\n]*(?:pendingText|\+ text)/);
  assert.match(java, /KEY_PARAM_VOLUME/); assert.match(java, /UUID\.randomUUID\(\)/); assert.match(java, /!id\.equals\(activeId\)/);
});
let failed = 0;
for (const { name, callback } of tests) {
  try { await callback(); console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}: ${error.stack}`); }
  finally { runtime.stopSpeech(); runtime.stopSoundEffects(); policy.stopForegroundAudio(); }
}
rmSync(output, { recursive: true, force: true });
console.log(`\n${tests.length - failed}/${tests.length} passed; ${failed} failed. Mocked engines; no physical-device/audio-quality claim.`);
process.exitCode = failed ? 1 : 0;
