import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import config from '../capacitor.config';
import { HISTORY_LESSONS } from '../src/lib/archie/history-course';
import { coachLessonReply } from '../src/lib/archie/lesson-coach';

// Run after npm run build:archie. This checks packaged content and local CPU
// work, not end-to-end latency or a native device microphone.
assert.equal(config.webDir, 'dist/client');
assert.equal(config.server?.url, undefined, 'Native releases must bundle the app, not depend on a live-reload URL.');
assert.equal(config.server?.androidScheme, 'https');
assert.equal(HISTORY_LESSONS.length, 324);
assert.equal(new Set(HISTORY_LESSONS.map(lesson => lesson.id)).size, 324);
const bundles = readdirSync('dist/client/assets').filter(file => file.endsWith('.js'));
const bundledCode = bundles.map(file => readFileSync(`dist/client/assets/${file}`, 'utf8')).join('\n');
for (const unit of new Set(HISTORY_LESSONS.map(lesson => lesson.unit))) {
  assert.ok(bundledCode.includes(unit), `History topic missing from packaged JS: ${unit}`);
}

const originalFetch = globalThis.fetch;
let networkCalls = 0;
globalThis.fetch = (() => { networkCalls += 1; throw new Error('Local history must not request the network.'); }) as typeof fetch;
const times: number[] = [];
try {
  for (let year = 1; year <= 9; year += 1) {
    assert.equal(HISTORY_LESSONS.filter(lesson => lesson.year === year).length, 36);
  }
  for (let iteration = 0; iteration < 3000; iteration += 1) {
    const expected = HISTORY_LESSONS[iteration % HISTORY_LESSONS.length];
    const start = performance.now();
    const lesson = HISTORY_LESSONS.find(item => item.id === expected.id)!;
    const question = lesson.questions[0];
    const reply = coachLessonReply('Help me with a clue', {
      phase: 'practice', subject: 'history', year: lesson.year,
      objective: lesson.objective, hint: question.hint,
      correctOption: question.options[question.answer], answeredCorrectly: false,
    });
    times.push(performance.now() - start);
    assert.ok(reply, `Local history clue missing: ${lesson.id}`);
  }
} finally { globalThis.fetch = originalFetch; }
assert.equal(networkCalls, 0);
times.sort((a, b) => a - b);
console.log(JSON.stringify({
  scope: 'Node runtime: warm lesson lookup + local clue generation; excludes UI, startup, speech and network',
  lessons: HISTORY_LESSONS.length, years: 9, lessonsPerYear: 36,
  bundledTopics: new Set(HISTORY_LESSONS.map(lesson => lesson.unit)).size,
  iterations: times.length, networkCalls,
  p50Milliseconds: times[Math.floor(times.length * 0.5)],
  p95Milliseconds: times[Math.floor(times.length * 0.95)],
  maxMilliseconds: times[times.length - 1],
  deviceGuarantee: false,
}, null, 2));
