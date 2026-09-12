// Run with: node --test scripts/test-island-adventures.cjs
// Only the new island feature is covered; this is not a whole-app/device certification.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const modules = {};
function compile(relative, append = '') {
  const result = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8') + append, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
    fileName: relative, reportDiagnostics: true,
  });
  const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, errors.map(e => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'));
  return result.outputText;
}
function load(relative, append = '') {
  const mod = new Module(relative, module);
  mod.require = name => modules[name] ?? {};
  mod._compile(compile(relative, append), path.join(root, relative));
  return mod.exports;
}
const core = load('src/lib/island-adventures.ts');
modules['@/lib/island-adventures'] = core;
const speech = load('src/lib/island-speech.ts');
const art = load('src/pages/ApprovedArtworkPage.tsx', '\nexport { ARTWORK, HOME_HOTSPOTS, PAGE_HOTSPOTS };\n');

test('all four changed/new TypeScript modules transpile without syntax diagnostics', () => {
  for (const p of ['src/lib/island-adventures.ts', 'src/lib/island-speech.ts', 'src/components/IslandAdventure.tsx', 'src/pages/ApprovedArtworkPage.tsx']) compile(p);
});
for (const island of core.ISLANDS) {
  test(`${island.name}: ten unique questions, valid answers, correct scoring and completion`, () => {
    const before = JSON.stringify(core.ISLAND_QUESTIONS[island.id]);
    const questions = core.createIslandRound(island.id, () => 0.37);
    assert.equal(questions.length, 10);
    assert.equal(new Set(questions.map(q => q.id)).size, 10);
    for (const q of questions) { assert.equal(q.choices.length, 3); assert.equal(new Set(q.choices).size, 3); assert(q.choices.includes(q.answer)); }
    let state = core.beginRound(questions);
    for (let i = 0; i < 10; i++) {
      assert.equal(state.index, i);
      assert.equal(core.nextQuestion(state), state, 'next is ignored before answering');
      assert.equal(core.chooseAnswer(state, '__invalid__'), state, 'unknown answers are ignored');
      state = core.chooseAnswer(state, questions[i].answer);
      assert.equal(state.score, i + 1);
      assert.equal(core.chooseAnswer(state, questions[i].answer), state, 'duplicate answers cannot increase score');
      state = core.nextQuestion(state);
    }
    assert.equal(state.complete, true); assert.equal(state.score, 10);
    assert.equal(core.nextQuestion(state), state);
    assert.equal(JSON.stringify(core.ISLAND_QUESTIONS[island.id]), before, 'round generation must not mutate the bank');
  });
}
test('every island opens its own query route; none opens generic/all Science games', () => {
  const hotspots = art.PAGE_HOTSPOTS['game-islands'].filter(h => h.label.includes('Island games'));
  assert.equal(hotspots.length, 10); assert.equal(new Set(hotspots.map(h => h.route)).size, 10);
  for (const island of core.ISLANDS) {
    const hotspot = hotspots.find(h => h.label === `Open ${island.name} Island games`);
    assert.equal(hotspot.route, core.islandRoute(island.id));
  }
});
test('unrecognised island parameters are rejected without removing other page variants', () => {
  for (const input of [null, undefined, '', '__proto__', 'French', '<script>']) assert.equal(core.isIslandId(input), false);
  assert.equal(Object.keys(art.ARTWORK).length, 8); assert.equal(art.HOME_HOTSPOTS.length, 16);
});
test('shuffle changes question and answer ordering without losing answers', () => {
  const one = core.createIslandRound('french', () => 0);
  const two = core.createIslandRound('french', () => 0.99999);
  assert.notDeepEqual(one.map(q => q.id), two.map(q => q.id));
  assert.notDeepEqual(one.find(q => q.id === 'french-0').choices, two.find(q => q.id === 'french-0').choices);
});
test('wrong answers do not earn points, and a fresh round resets progress', () => {
  let state = core.beginRound(core.createIslandRound('german'));
  state = core.chooseAnswer(state, state.questions[0].choices.find(x => x !== state.questions[0].answer));
  assert.equal(state.score, 0); assert.notEqual(state.selected, null);
  const reset = core.beginRound(core.createIslandRound('german'));
  assert.equal(reset.index, 0); assert.equal(reset.score, 0); assert.equal(reset.selected, null);
});
test('navigation feedback tolerates blocked storage, speech and vibration', () => {
  global.window = {
    get localStorage() { throw Error('blocked'); },
    speechSynthesis: { cancel() { throw Error('unavailable'); } },
    SpeechSynthesisUtterance: function() {}, navigator: { vibrate() { throw Error('blocked'); } },
  };
  assert.doesNotThrow(() => art.playButtonFeedback('Open Maths Island games'));
  delete global.window;
  assert.doesNotThrow(() => art.playButtonFeedback('Open Maths Island games'));
});
test('spoken answers use explicit values before numbered choices', () => {
  assert.equal(speech.choiceFromTranscript('three', ['3', '7', '9']), '3');
  assert.equal(speech.choiceFromTranscript('Option C', ['3', '7', '9']), '9');
  assert.equal(speech.choiceFromTranscript('the answer is cat.', ['Cat', 'Dog', 'Bird']), 'Cat');
  assert.equal(speech.choiceFromTranscript('option one', ['Red', 'Blue', 'Green']), 'Red');
  assert.equal(speech.choiceFromTranscript('not cat', ['Cat', 'Dog', 'Bird']), null);
  assert.equal(speech.choiceFromTranscript('option D', ['Cat', 'Dog', 'Bird']), null);
});
function fakeHost(startError = false) {
  let rec;
  class FakeRecognition {
    constructor() { rec = this; this.aborts = 0; }
    start() { if (startError) throw Error('busy'); this.onstart?.(); }
    abort() { this.aborts++; }
  }
  return { host: { isSecureContext: true, SpeechRecognition: FakeRecognition }, get: () => rec };
}
function result(text) { return { resultIndex: 0, results: [{ isFinal: true, 0: { transcript: text } }] }; }
test('unsupported/insecure browser gives a tap fallback and never opens a microphone', () => {
  for (const host of [{}, { isSecureContext: false, SpeechRecognition: class { constructor() { throw Error('must not start'); } } }]) {
    const statuses = [];
    const stop = speech.startChoiceListening(['Yes'], () => assert.fail(), (s,m) => statuses.push([s,m]), host);
    assert.equal(statuses[0][0], 'error'); assert.match(statuses[0][1], /tap/); stop();
  }
});
test('speech recognition scores one final answer and ignores late duplicate results', () => {
  const fake = fakeHost(); const choices = []; const statuses = [];
  speech.startChoiceListening(['Cat','Dog','Bird'], a => choices.push(a), s => statuses.push(s), fake.host);
  const callback = fake.get().onresult;
  callback(result('cat')); callback(result('dog'));
  assert.deepEqual(choices, ['Cat']); assert.equal(fake.get().aborts, 1); assert.equal(statuses[0], 'listening');
});
for (const error of ['not-allowed', 'service-not-allowed', 'audio-capture', 'no-speech', 'network']) {
  test(`microphone ${error} stops listening and leaves a usable fallback`, () => {
    const fake = fakeHost(); const statuses = [];
    speech.startChoiceListening(['Yes'], () => assert.fail(), (s,m) => statuses.push([s,m]), fake.host);
    fake.get().onerror({ error });
    assert.equal(statuses.at(-1)[0], 'error'); assert.match(statuses.at(-1)[1], /tap/); assert.equal(fake.get().aborts, 1);
  });
}
test('microphone stop/unmount cancels recognition and rejects stale callbacks', () => {
  const fake = fakeHost(); const answers = [];
  const stop = speech.startChoiceListening(['Yes'], a => answers.push(a), () => {}, fake.host);
  const callback = fake.get().onresult;
  stop(); stop(); callback(result('Yes'));
  assert.deepEqual(answers, []); assert.equal(fake.get().aborts, 1);
});
test('microphone start exceptions are handled', () => {
  const fake = fakeHost(true); const statuses = [];
  speech.startChoiceListening(['Yes'], () => assert.fail(), (s,m) => statuses.push([s,m]), fake.host);
  assert.equal(statuses.at(-1)[0], 'error'); assert.equal(fake.get().aborts, 1);
});
test('unmatched speech never guesses an answer', () => {
  const fake = fakeHost(); const answers = [];
  speech.startChoiceListening(['Cat'], a => answers.push(a), () => {}, fake.host);
  fake.get().onresult(result('I am not sure'));
  assert.deepEqual(answers, []); assert.equal(fake.get().aborts, 1);
});
test('microphone automatically stops after its timeout', async () => {
  const fake = fakeHost(); const statuses = [];
  speech.startChoiceListening(['Yes'], () => assert.fail(), (s,m) => statuses.push([s,m]), fake.host, 5);
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(fake.get().aborts, 1); assert.equal(statuses.at(-1)[0], 'idle');
});
