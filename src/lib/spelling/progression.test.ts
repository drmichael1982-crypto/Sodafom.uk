import { beforeEach, describe, expect, it } from 'vitest';
import { BAND_SPECS, allWords, bandForYear, getWord, wordsInBand, wordsInStage, type BandId } from './word-bank';
import {
  ADVANCE_THRESHOLD, MAX_ATTEMPTS, SET_SIZE, STORAGE_KEY, bandProgress, buildNextSet, completeSet, createState,
  currentWord, goToNextQuestion, isBandExhausted, loadProgress, parseProgress, recordAnswer, saveProgress,
  selectBand, stageFromLegacyLevel, unseenCount, type ProgressionState, type SetResult,
} from './progression';

/** Deterministic pseudo-random generator so tests are repeatable. */
function seeded(seed = 42) { let x = seed; return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; }

function misspell(word: string) { return word + 'x'; }

/** Answer the whole current set: the first `correct` words right first time, the rest wrong twice. */
function playSet(state: ProgressionState, correct: number): { state: ProgressionState; words: string[]; result: SetResult } {
  let s = state;
  const words: string[] = [];
  for (let i = 0; i < SET_SIZE; i++) {
    const word = currentWord(s)!;
    words.push(word.id);
    if (i < correct) s = recordAnswer(s, word.word).state;
    else for (let a = 0; a < MAX_ATTEMPTS; a++) s = recordAnswer(s, misspell(word.word)).state;
    s = goToNextQuestion(s);
  }
  const done = completeSet(s)!;
  return { state: done.state, words, result: done.result };
}

describe('spelling word bank', () => {
  it('has unique ids, real letters only, and enough words to start every band', () => {
    const ids = allWords().map(w => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of allWords()) expect(w.word).toMatch(/^[A-Za-z]+$/);
    for (const band of BAND_SPECS) expect(wordsInStage(band.id, 0).length).toBeGreaterThanOrEqual(SET_SIZE);
  });

  it('reports the expected band sizes', () => {
    const sizes = Object.fromEntries(BAND_SPECS.map(b => [b.id, wordsInBand(b.id).length]));
    expect(sizes).toEqual({ y1: 72, y2: 62, 'y3-4': 108, 'y5-6': 100, 'y7-9': 70 });
  });

  it('uses British spellings', () => {
    const words = new Set(allWords().map(w => w.word));
    for (const uk of ['favourite', 'centre', 'neighbour', 'marvellous', 'programme', 'recognise', 'criticise', 'analyse']) expect(words).toContain(uk);
    for (const us of ['favorite', 'center', 'neighbor', 'marvelous', 'program', 'recognize', 'criticize', 'analyze', 'color']) expect(words).not.toContain(us);
  });

  it('gives homophones a sentence so the dictation is not ambiguous', () => {
    const homophones = ['y1:to', 'y1:there', 'y1:be', 'y1:one', 'y1:our', 'y2:break', 'y2:hour', 'y2:whole', 'y2:would', 'y3-4:heard', 'y3-4:weight', 'y3-4:reign', 'y3-4:through', 'y5-6:muscle', 'y5-6:queue', 'y5-6:lightning'];
    for (const id of homophones) expect(getWord(id)?.sentence, id).toBeTruthy();
  });

  it('maps every year to its own curriculum band', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map(bandForYear)).toEqual(['y1', 'y2', 'y3-4', 'y3-4', 'y5-6', 'y5-6', 'y7-9', 'y7-9', 'y7-9']);
    expect(bandForYear(0)).toBe('y3-4');
  });
});

describe('spelling progression', () => {
  beforeEach(() => localStorage.clear());

  it('builds a set of ten different, unseen words from the current stage of the year band', () => {
    const s = buildNextSet(createState(3), 3, { rng: seeded() });
    const set = bandProgress(s).currentSet!;
    expect(set.wordIds).toHaveLength(SET_SIZE);
    expect(new Set(set.wordIds).size).toBe(SET_SIZE);
    expect(set.setNumber).toBe(1);
    for (const id of set.wordIds) expect(getWord(id)).toMatchObject({ band: 'y3-4', stage: 0 });
  });

  it('counts only first tries, allows one friendly retry, then reveals the word', () => {
    let s = buildNextSet(createState(2), 2, { rng: seeded() });
    const first = currentWord(s)!;
    let r = recordAnswer(s, misspell(first.word));
    expect(r.verdict).toBe('retry');
    r = recordAnswer(r.state, ` ${first.word.toUpperCase()} `);
    expect(r.verdict).toBe('correct');
    expect(bandProgress(r.state).currentSet!.answers[0]).toMatchObject({ correct: true, firstTryCorrect: false });
    expect(recordAnswer(r.state, first.word).verdict).toBe('ignored');
    s = goToNextQuestion(r.state);
    const second = currentWord(s)!;
    s = recordAnswer(s, 'zz').state;
    r = recordAnswer(s, 'zzz');
    expect(r.verdict).toBe('revealed');
    expect(bandProgress(r.state).currentSet!.answers[1]).toMatchObject({ wordId: second.id, correct: false });
  });

  it('only moves forward after an explicit next action and completes after the tenth answer', () => {
    let s = buildNextSet(createState(4), 4, { rng: seeded() });
    expect(goToNextQuestion(s)).toBe(s);
    for (let i = 0; i < 9; i++) { s = recordAnswer(s, currentWord(s)!.word).state; expect(completeSet(s)).toBeNull(); s = goToNextQuestion(s); }
    s = recordAnswer(s, currentWord(s)!.word).state;
    const done = completeSet(s)!;
    expect(done.result).toMatchObject({ setNumber: 1, firstTryCorrect: 10, total: 10, outcome: 'advance' });
    expect(bandProgress(done.state).currentSet).toBeNull();
    const next = buildNextSet(done.state, 4, { rng: seeded() });
    expect(bandProgress(next).currentSet).toMatchObject({ setNumber: 2, position: 0 });
  });

  it(`advances a stage at ${ADVANCE_THRESHOLD}/10, stays with review at 5–7, and gives targeted practice at 4 or less`, () => {
    let s = buildNextSet(createState(5), 5, { rng: seeded() });
    let played = playSet(s, 8);
    expect(played.result).toMatchObject({ outcome: 'advance', stageBefore: 0, stageAfter: 1, nextKind: 'learn' });

    s = buildNextSet(played.state, 5, { rng: seeded() });
    played = playSet(s, 6);
    expect(played.result).toMatchObject({ outcome: 'stay', stageAfter: 1, nextKind: 'consolidate' });
    const missed = played.result.missed;
    expect(missed).toHaveLength(4);
    s = buildNextSet(played.state, 5, { rng: seeded() });
    expect(bandProgress(s).currentSet!.wordIds).toEqual(expect.arrayContaining(missed));

    played = playSet(s, 3);
    expect(played.result).toMatchObject({ outcome: 'practice', stageAfter: 1, nextKind: 'practice' });
    s = buildNextSet(played.state, 5, { rng: seeded() });
    const practice = bandProgress(s).currentSet!;
    expect(practice.kind).toBe('practice');
    expect(practice.wordIds).toEqual(expect.arrayContaining(played.result.missed.slice(0, 6)));
    const newWords = practice.wordIds.filter(id => !played.result.missed.includes(id));
    for (const id of newWords) expect(getWord(id)!.stage).toBeLessThanOrEqual(1);
  });

  it('never gives a Year 1 learner words from another band, even after many perfect sets', () => {
    let s = createState(1);
    for (let i = 0; i < 12; i++) {
      s = buildNextSet(s, 1, { rng: seeded(i + 1) });
      if (!bandProgress(s).currentSet) break;
      const played = playSet(s, 10);
      for (const id of played.words) expect(id.startsWith('y1:')).toBe(true);
      s = played.state;
    }
    expect(s.yearBand).toBe('y1');
  });

  it('never moves a struggling Year 6 learner down to younger words', () => {
    let s = createState(6);
    for (let i = 0; i < 6; i++) {
      s = buildNextSet(s, 6, { rng: seeded(i + 7) });
      const played = playSet(s, 0);
      for (const id of played.words) expect(getWord(id)!.band).toBe('y5-6');
      expect(played.result.stageAfter).toBe(0);
      s = played.state;
    }
  });

  it('does not repeat correctly spelt words while unseen words remain, and brings missed words back', () => {
    let s = createState(3);
    const correctlySpelt = new Set<string>();
    s = buildNextSet(s, 3, { rng: seeded(3) });
    let played = playSet(s, 9);
    played.words.slice(0, 9).forEach(id => correctlySpelt.add(id));
    const missed = played.result.missed[0];
    s = played.state;
    for (let i = 0; i < 5; i++) {
      s = buildNextSet(s, 3, { rng: seeded(10 + i) });
      const ids = bandProgress(s).currentSet!.wordIds;
      if (i === 0) expect(ids).toContain(missed);
      for (const id of ids) expect(correctlySpelt.has(id)).toBe(false);
      played = playSet(s, 10);
      played.words.forEach(id => correctlySpelt.add(id));
      s = played.state;
    }
    expect(bandProgress(s).reviewWords).toEqual({});
  });

  it('stops at the end of the band material and only offers an explicit review set', () => {
    let s = createState(2);
    let last: SetResult | null = null;
    for (let i = 0; i < 20 && !last?.bandComplete; i++) {
      s = buildNextSet(s, 2, { rng: seeded(i + 20) });
      const played = playSet(s, i === 1 ? 9 : 10);
      last = played.result; s = played.state;
    }
    expect(last!.bandComplete).toBe(true);
    expect(unseenCount(s)).toBe(0);
    expect(isBandExhausted(s)).toBe(true);
    expect(bandProgress(buildNextSet(s, 2)).currentSet).toBeNull();
    const review = bandProgress(buildNextSet(s, 2, { kind: 'review', rng: seeded() })).currentSet!;
    expect(review.kind).toBe('review');
    expect(review.wordIds).toHaveLength(SET_SIZE);
    expect(new Set(review.wordIds).size).toBe(SET_SIZE);
    for (const id of review.wordIds) expect(getWord(id)!.band).toBe('y2');
  });

  it('keeps separate progress per band when the year setting changes', () => {
    let s = buildNextSet(createState(1), 1, { rng: seeded() });
    s = goToNextQuestion(recordAnswer(s, currentWord(s)!.word).state);
    const y1Set = bandProgress(s).currentSet!;
    s = buildNextSet(s, 7, { rng: seeded() });
    expect(s.yearBand).toBe('y7-9');
    expect(currentWord(s)!.band).toBe('y7-9');
    s = buildNextSet(s, 1);
    expect(bandProgress(s).currentSet).toEqual(y1Set);
  });

  it('saves and restores a set mid-way, and rejects unknown, corrupt or other-version data', () => {
    let s = buildNextSet(createState(4), 4, { rng: seeded() });
    for (let i = 0; i < 3; i++) s = goToNextQuestion(recordAnswer(s, currentWord(s)!.word).state);
    s = recordAnswer(s, 'wrongg').state;
    saveProgress(s);
    const restored = loadProgress()!;
    expect(restored).toEqual(s);
    expect(bandProgress(restored).currentSet).toMatchObject({ position: 3, attempts: 1 });

    expect(parseProgress('{not json')).toBeNull();
    expect(parseProgress(JSON.stringify({ ...s, version: 99 }))).toBeNull();
    const tampered = JSON.parse(JSON.stringify(s)) as ProgressionState;
    tampered.bands['y3-4']!.currentSet!.wordIds[0] = 'y3-4:notaword';
    tampered.bands['y3-4']!.seenWords.push('y1:cat');
    const cleaned = parseProgress(JSON.stringify(tampered))!;
    expect(bandProgress(cleaned).currentSet).toBeNull();
    expect(bandProgress(cleaned).seenWords).not.toContain('y1:cat');
    localStorage.setItem(STORAGE_KEY, 'null');
    expect(loadProgress()).toBeNull();
  });

  it('uses the old adaptive level once, gently, to choose a starting stage', () => {
    expect(stageFromLegacyLevel('y1', undefined)).toBe(0);
    expect(stageFromLegacyLevel('y1', 3)).toBe(0);
    expect(stageFromLegacyLevel('y1', 7)).toBe(2);
    expect(stageFromLegacyLevel('y1', 10)).toBe(3);
    expect(stageFromLegacyLevel('y1', 99)).toBe(3);
    let s = selectBand(createState(1), 1, 7);
    expect(bandProgress(s).stageIndex).toBe(2);
    s = selectBand(s, 5, 7);
    expect(bandProgress(s).stageIndex).toBe(0);
    const bands: BandId[] = ['y1', 'y5-6'];
    expect(Object.keys(s.bands)).toEqual(bands);
  });
});
