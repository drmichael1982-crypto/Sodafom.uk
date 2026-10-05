/**
 * Spelling progression in successive sets of ten words.
 *
 * Pure functions only (no React, no DOM) apart from the small load/save helpers
 * at the bottom, which accept an injectable Storage for tests.
 *
 * ── Rules ──────────────────────────────────────────────────────────────────
 * Band: always follows the learner's configured year (Year 1, Year 2,
 *   Years 3–4, Years 5–6, Years 7–9). The child is never moved to an older or
 *   younger band automatically. Each band keeps its own progress, so changing
 *   the year setting starts (or continues) that band's state.
 *
 * Set: exactly SET_SIZE (10) words. A word counts as "first-try correct" only
 *   when the very first typed attempt is right. A wrong first attempt gets a
 *   friendly hint and one retry (MAX_ATTEMPTS = 2); after that the spelling is
 *   shown with an explanation. Any word not right first time joins the review
 *   list (with a miss count); getting a review word right first time removes it.
 *
 * Mastery after a learning set (first-try correct out of 10):
 *   >= ADVANCE_THRESHOLD (8)          → move to the next stage in the same band.
 *   CONSOLIDATE_THRESHOLD (5) .. 7    → stay on the stage; next set mixes in up
 *                                        to CONSOLIDATE_REVIEW_QUOTA missed words.
 *   <= 4                              → targeted practice set: missed words plus
 *                                        easier words (earlier stages or words
 *                                        already spelt correctly) from the same
 *                                        band. Never harder material.
 *   After a practice or review set the stage never changes; >= 8 returns to
 *   normal learning, 5–7 to a consolidation set, <= 4 to another practice set.
 *
 * Word choice: unseen words are preferred (current stage first, then leftover
 *   earlier-stage words, then later stages of the same band). Correctly spelt
 *   words are not repeated while unseen words remain in the band; only review
 *   words (previous mistakes) come back early, on purpose.
 *
 * End of band: when every word in the band has been seen, the learner is
 *   offered an explicit review set (missed words first, then older words) or a
 *   grown-up-supported choice (stop, or change the year in settings). No new
 *   questions are invented and play is never forced to continue.
 */
import { bandForYear, getWord, stageCount, wordsInBand, type BandId, type SpellingWord } from './word-bank';

export const SET_SIZE = 10;
export const ADVANCE_THRESHOLD = 8;
export const CONSOLIDATE_THRESHOLD = 5;
export const MAX_ATTEMPTS = 2;
export const LEARN_REVIEW_QUOTA = 2;
export const CONSOLIDATE_REVIEW_QUOTA = 5;
export const PRACTICE_MISSED_MAX = 6;
export const PROGRESSION_VERSION = 1;
export const STORAGE_KEY = 'sodafom_spelling_progress_v1';

export type SetKind = 'learn' | 'consolidate' | 'practice' | 'review';
export type Outcome = 'advance' | 'stay' | 'practice';

export interface SetAnswer { wordId: string; typed: string; attempts: number; firstTryCorrect: boolean; correct: boolean }

export interface CurrentSet {
  setNumber: number;
  kind: SetKind;
  stageIndex: number;
  wordIds: string[];
  /** 0-based index of the question on screen. */
  position: number;
  /** Wrong attempts already made on the current question. */
  attempts: number;
  answers: SetAnswer[];
}

export interface SetResult {
  setNumber: number;
  kind: SetKind;
  firstTryCorrect: number;
  total: number;
  missed: string[];
  outcome: Outcome;
  stageBefore: number;
  stageAfter: number;
  nextKind: SetKind;
  bandComplete: boolean;
  acknowledged: boolean;
}

export interface BandProgress {
  stageIndex: number;
  /** Number of the set in progress, or of the next set to start. Starts at 1. */
  setNumber: number;
  seenWords: string[];
  /** Word id → number of times it was missed and is still waiting for review. */
  reviewWords: Record<string, number>;
  nextKind: SetKind;
  currentSet: CurrentSet | null;
  lastResult: SetResult | null;
}

export interface ProgressionState {
  version: typeof PROGRESSION_VERSION;
  yearBand: BandId;
  bands: Partial<Record<BandId, BandProgress>>;
  /** True once the old adaptive level has been used to choose a starting stage. */
  legacySeeded: boolean;
}

export type Rng = () => number;

export function createState(year: number): ProgressionState {
  return { version: PROGRESSION_VERSION, yearBand: bandForYear(year), bands: {}, legacySeeded: false };
}

function newBandProgress(stageIndex = 0): BandProgress {
  return { stageIndex, setNumber: 1, seenWords: [], reviewWords: {}, nextKind: 'learn', currentSet: null, lastResult: null };
}

/**
 * The old Spelling Bee level (1–10) went up after every round regardless of
 * score, so it is only a weak signal. It is used once, gently, to skip early
 * stages of the first band created: levels 1–3 → stage 0, 4–6 → 1, 7–9 → 2, 10 → 3.
 */
export function stageFromLegacyLevel(band: BandId, legacyLevel: number | undefined): number {
  if (!Number.isFinite(legacyLevel) || !legacyLevel || legacyLevel <= 1) return 0;
  return Math.max(0, Math.min(stageCount(band) - 1, Math.floor((Math.min(legacyLevel, 10) - 1) / 3)));
}

/** Point the state at the band for this year, creating that band's progress if needed. */
export function selectBand(state: ProgressionState, year: number, legacyLevel?: number): ProgressionState {
  const band = bandForYear(year);
  if (state.bands[band]) return state.yearBand === band ? state : { ...state, yearBand: band };
  const seed = state.legacySeeded ? 0 : stageFromLegacyLevel(band, legacyLevel);
  return { ...state, yearBand: band, legacySeeded: true, bands: { ...state.bands, [band]: newBandProgress(seed) } };
}

export function bandProgress(state: ProgressionState): BandProgress {
  return state.bands[state.yearBand] ?? newBandProgress();
}

function withBand(state: ProgressionState, progress: BandProgress): ProgressionState {
  return { ...state, bands: { ...state.bands, [state.yearBand]: progress } };
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Shuffle within each stage, then order stages as requested. */
function byStage(words: SpellingWord[], rng: Rng, direction: 1 | -1 = 1): string[] {
  return shuffle(words, rng).sort((a, b) => (a.stage - b.stage) * direction).map(w => w.id);
}

export function unseenCount(state: ProgressionState): number {
  const seen = new Set(bandProgress(state).seenWords);
  return wordsInBand(state.yearBand).filter(w => !seen.has(w.id)).length;
}

/** True when every word in the band has been seen and no further set is due without a grown-up/child choice. */
export function isBandExhausted(state: ProgressionState): boolean {
  const p = bandProgress(state);
  return !p.currentSet && p.nextKind !== 'practice' && unseenCount(state) === 0;
}

function reviewOrder(p: BandProgress, maxStage = Infinity): string[] {
  return Object.entries(p.reviewWords)
    .filter(([id]) => (getWord(id)?.stage ?? Infinity) <= maxStage)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id]) => id);
}

export function pickWords(band: BandId, p: BandProgress, kind: SetKind, rng: Rng = Math.random): string[] {
  const words = wordsInBand(band);
  const seen = new Set(p.seenWords);
  const cur = p.stageIndex;
  const chosen: string[] = [];
  const add = (ids: string[], limit = SET_SIZE) => {
    let added = 0;
    for (const id of ids) {
      if (chosen.length >= SET_SIZE || added >= limit) break;
      if (!chosen.includes(id)) { chosen.push(id); added++; }
    }
  };
  const unseen = (pred: (w: SpellingWord) => boolean, dir: 1 | -1 = 1) => byStage(words.filter(w => !seen.has(w.id) && pred(w)), rng, dir);
  const familiar = (pred: (w: SpellingWord) => boolean) => shuffle(words.filter(w => seen.has(w.id) && !(w.id in p.reviewWords) && pred(w)), rng).map(w => w.id);

  if (kind === 'practice') {
    const lastMissed = p.lastResult?.missed ?? [];
    const review = reviewOrder(p, cur);
    add([...lastMissed, ...review], PRACTICE_MISSED_MAX);
    add(unseen(w => w.stage < cur));            // easier: earlier stages
    add(familiar(w => w.stage <= cur));         // easier: already spelt correctly
    add(unseen(w => w.stage === cur));          // same stage, never later
    add([...lastMissed, ...review]);            // remaining missed words
    add(words.filter(w => w.stage <= cur).map(w => w.id));
  } else if (kind === 'review') {
    add(reviewOrder(p));
    add(familiar(() => true));
    add(unseen(() => true));
  } else {
    const review = reviewOrder(p);
    add(review, kind === 'consolidate' ? CONSOLIDATE_REVIEW_QUOTA : LEARN_REVIEW_QUOTA);
    add(unseen(w => w.stage === cur));
    add(unseen(w => w.stage < cur));
    add(unseen(w => w.stage > cur));
    add(review);
    add(familiar(w => w.stage <= cur));
    add(familiar(() => true));
  }
  return chosen.slice(0, SET_SIZE);
}

/**
 * Start the next set for the learner's year, or return the state unchanged if
 * a set is already in progress (resume). If the band's material is used up,
 * no set is started unless `kind: 'review'` is requested explicitly.
 */
export function buildNextSet(state: ProgressionState, year: number, options: { kind?: 'review'; rng?: Rng; legacyLevel?: number } = {}): ProgressionState {
  const next = selectBand(state, year, options.legacyLevel);
  const p = bandProgress(next);
  if (p.currentSet) return next;
  if (!options.kind && isBandExhausted(next)) return next;
  const kind: SetKind = options.kind ?? p.nextKind;
  const wordIds = pickWords(next.yearBand, p, kind, options.rng);
  if (wordIds.length < SET_SIZE) return next;
  return withBand(next, {
    ...p,
    lastResult: p.lastResult ? { ...p.lastResult, acknowledged: true } : null,
    currentSet: { setNumber: p.setNumber, kind, stageIndex: p.stageIndex, wordIds, position: 0, attempts: 0, answers: [] },
  });
}

export function currentWord(state: ProgressionState): SpellingWord | null {
  const set = bandProgress(state).currentSet;
  return set ? getWord(set.wordIds[set.position]) ?? null : null;
}

export function normaliseSpelling(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[’‘]/g, "'").toLowerCase();
}

export type Verdict = 'correct' | 'retry' | 'revealed' | 'ignored';

/**
 * Check a typed attempt for the current question. Capital letters are not
 * marked wrong; `capitalReminder` tells the UI to remind the child (e.g. days).
 */
export function recordAnswer(state: ProgressionState, typed: string): { state: ProgressionState; verdict: Verdict; capitalReminder: boolean } {
  const p = bandProgress(state);
  const set = p.currentSet;
  const word = currentWord(state);
  if (!set || !word || set.answers.length > set.position || !typed.trim()) return { state, verdict: 'ignored', capitalReminder: false };
  const correct = normaliseSpelling(typed) === normaliseSpelling(word.word);
  const capitalReminder = correct && word.word[0] !== word.word[0].toLowerCase() && typed.trim()[0] !== word.word[0];
  const attempts = set.attempts + 1;
  if (!correct && attempts < MAX_ATTEMPTS) {
    return { state: withBand(state, { ...p, currentSet: { ...set, attempts } }), verdict: 'retry', capitalReminder };
  }
  const answer: SetAnswer = { wordId: word.id, typed: typed.trim(), attempts, firstTryCorrect: correct && attempts === 1, correct };
  const seenWords = p.seenWords.includes(word.id) ? p.seenWords : [...p.seenWords, word.id];
  return {
    state: withBand(state, { ...p, seenWords, currentSet: { ...set, attempts, answers: [...set.answers, answer] } }),
    verdict: correct ? 'correct' : 'revealed',
    capitalReminder,
  };
}

export function isSetFinished(state: ProgressionState): boolean {
  const set = bandProgress(state).currentSet;
  return !!set && set.answers.length >= set.wordIds.length;
}

/** Move to the next question after the current one has been answered (explicit child action). */
export function goToNextQuestion(state: ProgressionState): ProgressionState {
  const p = bandProgress(state);
  const set = p.currentSet;
  if (!set || set.answers.length <= set.position || set.position + 1 >= set.wordIds.length) return state;
  return withBand(state, { ...p, currentSet: { ...set, position: set.position + 1, attempts: 0 } });
}

/** Finish a set of ten: score it, update review words and decide what comes next. */
export function completeSet(state: ProgressionState): { state: ProgressionState; result: SetResult } | null {
  const p = bandProgress(state);
  const set = p.currentSet;
  if (!set || !isSetFinished(state)) return null;
  const firstTryCorrect = set.answers.filter(a => a.firstTryCorrect).length;
  const reviewWords = { ...p.reviewWords };
  const missed: string[] = [];
  for (const a of set.answers) {
    if (a.firstTryCorrect) delete reviewWords[a.wordId];
    else { reviewWords[a.wordId] = (reviewWords[a.wordId] ?? 0) + 1; missed.push(a.wordId); }
  }
  const lastStage = stageCount(state.yearBand) - 1;
  const learning = set.kind === 'learn' || set.kind === 'consolidate';
  let outcome: Outcome; let stageAfter = p.stageIndex; let nextKind: SetKind;
  if (firstTryCorrect >= ADVANCE_THRESHOLD) {
    nextKind = 'learn';
    if (learning && p.stageIndex < lastStage) { stageAfter = p.stageIndex + 1; outcome = 'advance'; } else outcome = 'stay';
  } else if (firstTryCorrect >= CONSOLIDATE_THRESHOLD) { outcome = 'stay'; nextKind = 'consolidate'; }
  else { outcome = 'practice'; nextKind = 'practice'; }
  const progress: BandProgress = { ...p, stageIndex: stageAfter, setNumber: p.setNumber + 1, reviewWords, nextKind, currentSet: null, lastResult: null };
  const seen = new Set(progress.seenWords);
  const bandComplete = nextKind !== 'practice' && wordsInBand(state.yearBand).every(w => seen.has(w.id));
  const result: SetResult = { setNumber: set.setNumber, kind: set.kind, firstTryCorrect, total: set.wordIds.length, missed, outcome, stageBefore: p.stageIndex, stageAfter, nextKind, bandComplete, acknowledged: false };
  return { state: withBand(state, { ...progress, lastResult: result }), result };
}

export function masteryMessage(result: SetResult): string {
  if (result.bandComplete) return 'You have practised every word for your year group. Choose a review set of tricky words, or stop here and ask a grown-up what to try next.';
  if (result.outcome === 'advance') return `Brilliant! ${result.firstTryCorrect} out of ${result.total} first time. You are ready for new, slightly trickier words.`;
  if (result.outcome === 'practice') return 'These words were tricky. Next we will practise them again with some easier words, and use the tips to help.';
  if (result.firstTryCorrect >= ADVANCE_THRESHOLD) return `Brilliant! ${result.firstTryCorrect} out of ${result.total} first time. Keep going with new words.`;
  return `Good work! ${result.firstTryCorrect} out of ${result.total} first time. Next we will mix a few of these words in again to help them stick.`;
}

/** Stars for GameShell / useGameLevel, using the same formula as the original game. */
export function starsFor(firstTryCorrect: number, total = SET_SIZE): { score: number; stars: number } {
  const score = Math.round((firstTryCorrect / total) * 100);
  return { score, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 };
}

// ── Persistence ────────────────────────────────────────────────────────────

const BANDS: BandId[] = ['y1', 'y2', 'y3-4', 'y5-6', 'y7-9'];
const KINDS: SetKind[] = ['learn', 'consolidate', 'practice', 'review'];

function nat(value: unknown, fallback: number, max = Number.MAX_SAFE_INTEGER): number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= max ? value as number : fallback;
}

function sanitiseSet(band: BandId, raw: unknown): CurrentSet | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<CurrentSet>;
  const ids = Array.isArray(r.wordIds) ? r.wordIds : [];
  if (ids.length !== SET_SIZE || !ids.every(id => typeof id === 'string' && getWord(id)?.band === band)) return null;
  const answers: SetAnswer[] = [];
  for (const a of (Array.isArray(r.answers) ? r.answers : []).slice(0, SET_SIZE)) {
    if (!a || a.wordId !== ids[answers.length] || typeof a.correct !== 'boolean' || typeof a.firstTryCorrect !== 'boolean') break;
    answers.push({ wordId: a.wordId, typed: typeof a.typed === 'string' ? a.typed : '', attempts: Math.max(1, nat(a.attempts, 1, MAX_ATTEMPTS)), firstTryCorrect: a.firstTryCorrect && a.correct, correct: a.correct });
  }
  const position = Math.min(nat(r.position, 0, SET_SIZE - 1), answers.length);
  if (answers.length > position + 1) return null;
  return { setNumber: Math.max(1, nat(r.setNumber, 1)), kind: KINDS.includes(r.kind as SetKind) ? r.kind as SetKind : 'learn', stageIndex: nat(r.stageIndex, 0, stageCount(band) - 1), wordIds: ids, position, attempts: nat(r.attempts, 0, MAX_ATTEMPTS - 1), answers };
}

function sanitiseBand(band: BandId, raw: unknown): BandProgress | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<BandProgress>;
  const valid = (id: unknown): id is string => typeof id === 'string' && getWord(id)?.band === band;
  const reviewWords: Record<string, number> = {};
  if (r.reviewWords && typeof r.reviewWords === 'object') for (const [id, n] of Object.entries(r.reviewWords)) if (valid(id) && nat(n, 0) > 0) reviewWords[id] = n as number;
  const lr = r.lastResult as SetResult | null | undefined;
  const lastResult = lr && typeof lr === 'object' && Array.isArray(lr.missed) && Number.isInteger(lr.firstTryCorrect)
    ? { ...lr, missed: lr.missed.filter(valid) } : null;
  return {
    stageIndex: nat(r.stageIndex, 0, stageCount(band) - 1),
    setNumber: Math.max(1, nat(r.setNumber, 1)),
    seenWords: Array.isArray(r.seenWords) ? [...new Set(r.seenWords.filter(valid))] : [],
    reviewWords,
    nextKind: KINDS.includes(r.nextKind as SetKind) && r.nextKind !== 'review' ? r.nextKind as SetKind : 'learn',
    currentSet: sanitiseSet(band, r.currentSet),
    lastResult,
  };
}

export function parseProgress(raw: string | null): ProgressionState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<ProgressionState>;
    if (!data || data.version !== PROGRESSION_VERSION) return null;
    const bands: ProgressionState['bands'] = {};
    for (const band of BANDS) { const b = sanitiseBand(band, data.bands?.[band]); if (b) bands[band] = b; }
    return { version: PROGRESSION_VERSION, yearBand: BANDS.includes(data.yearBand as BandId) ? data.yearBand as BandId : 'y3-4', bands, legacySeeded: data.legacySeeded === true || Object.keys(bands).length > 0 };
  } catch { return null; }
}

export function loadProgress(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): ProgressionState | null {
  try { return parseProgress(storage?.getItem(STORAGE_KEY) ?? null); } catch { return null; }
}

export function saveProgress(state: ProgressionState, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked: keep playing in memory */ }
}
