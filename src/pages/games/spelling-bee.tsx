import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { useGameLevel } from '@/hooks/useGameLevel';
import { useArchieData } from '@/lib/archie/storage';
import { useVoice } from '@/lib/voice-context';
import { bandSpec, getWord, type SpellingWord } from '@/lib/spelling/word-bank';
import {
  SET_SIZE, bandProgress, buildNextSet, completeSet, createState, currentWord, goToNextQuestion,
  isBandExhausted, isSetFinished, loadProgress, masteryMessage, recordAnswer, saveProgress, selectBand,
  starsFor, type ProgressionState, type Rng, type SetResult,
} from '@/lib/spelling/progression';

const SLUG = 'spelling-bee';
/** After this many sets in one visit the break reminder becomes a stronger "proper break" message. */
const LONG_SESSION_SETS = 3;

function prepare(state: ProgressionState, year: number, legacyLevel: number | undefined, rng?: Rng): ProgressionState {
  let next = selectBand(state, year, legacyLevel);
  if (isSetFinished(next)) next = completeSet(next)?.state ?? next;
  const p = bandProgress(next);
  if (!p.currentSet && (!p.lastResult || p.lastResult.acknowledged) && !isBandExhausted(next)) next = buildNextSet(next, year, { rng });
  return next;
}

function blankSentence(word: SpellingWord): string | null {
  if (!word.sentence) return null;
  const escaped = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return word.sentence.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '_____');
}

function hintFor(word: SpellingWord): string {
  return `It starts with "${word.word[0]}" and has ${word.word.length} letters. ${word.tip}`;
}

export interface SpellingBeePlayProps {
  year: number;
  legacyLevel?: number;
  onSetComplete?: (result: SetResult) => void;
  onQuestionChange?: (question: string) => void;
  onStop?: () => void;
  onHome?: () => void;
  rng?: Rng;
}

export function SpellingBeePlay({ year, legacyLevel, onSetComplete, onQuestionChange, onStop, onHome, rng }: SpellingBeePlayProps) {
  const { speak, stop } = useVoice();
  const [state, setState] = useState<ProgressionState>(() => prepare(loadProgress() ?? createState(year), year, legacyLevel, rng));
  const [typed, setTyped] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [capitalReminder, setCapitalReminder] = useState(false);
  const [setsThisVisit, setSetsThisVisit] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  // A changed year setting switches to that band's own saved progress.
  useEffect(() => { setState(s => prepare(s, year, legacyLevel, rng)); }, [year]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { saveProgress(state); }, [state]);

  const progress = bandProgress(state);
  const set = progress.currentSet;
  const word = currentWord(state);
  const answer = set && word ? set.answers[set.position] : undefined;
  const status: 'asking' | 'retry' | 'correct' | 'revealed' = answer ? (answer.correct ? 'correct' : 'revealed') : set && set.attempts > 0 ? 'retry' : 'asking';
  const band = bandSpec(state.yearBand);

  const read = () => { if (word) speak('read:spelling-word', `${word.word}.${word.sentence ? ` ${word.sentence} ${word.word}.` : ''}`); };

  useEffect(() => {
    if (!word) return;
    onQuestionChange?.(`Spell this word: ${word.word}`);
    setTyped(''); setHintOpen(false); setCapitalReminder(false);
    const timer = setTimeout(read, 400);
    return () => clearTimeout(timer);
  }, [word?.id, set?.setNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishSet = (s: ProgressionState) => {
    const done = completeSet(s);
    if (!done) { setState(s); return; }
    stop();
    setState(done.state);
    setSetsThisVisit(n => n + 1);
    onSetComplete?.(done.result);
    setTimeout(() => resultsHeadingRef.current?.focus(), 0);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (paused || !set || answer) return;
    const r = recordAnswer(state, typed);
    if (r.verdict === 'ignored') return;
    setCapitalReminder(r.capitalReminder);
    if (r.verdict === 'retry') { setHintOpen(true); setTyped(''); setState(r.state); inputRef.current?.focus(); return; }
    if (isSetFinished(r.state)) finishSet(r.state); else setState(r.state);
  };

  const next = () => { if (!paused && answer) setState(s => goToNextQuestion(s)); };
  const continueToNextSet = (kind?: 'review') => {
    setState(s => buildNextSet(s, year, { kind, rng }));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const result = !set && progress.lastResult && !progress.lastResult.acknowledged ? progress.lastResult : null;

  if (result) return <ResultsView headingRef={resultsHeadingRef} result={result} bandLabel={band.label} setsThisVisit={setsThisVisit}
    onContinue={() => continueToNextSet()} onReview={() => continueToNextSet('review')} onStop={onStop} onHome={onHome} />;

  if (!set || !word) return <section aria-label="Spelling Bee" className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-yellow-50 to-background">
    <h2 className="text-2xl font-black mb-3">You have practised every {band.label} word!</h2>
    <p className="max-w-md mb-2">There are no new words left for your year group. You can do a review set of words that were tricky, or stop here.</p>
    <p className="max-w-md mb-4 text-sm">Grown-ups: you can change the year group in learning settings if the words feel too easy.</p>
    <div className="flex flex-wrap gap-3 justify-center">
      <button type="button" onClick={() => continueToNextSet('review')} className="min-h-12 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-black">Start a review set</button>
      {onStop && <button type="button" onClick={onStop} className="min-h-12 px-5 py-3 rounded-xl bg-muted border border-border font-bold">Stop for now</button>}
    </div>
  </section>;

  const sentence = blankSentence(word);
  const kindLabel = set.kind === 'practice' ? 'Practice set' : set.kind === 'review' ? 'Review set' : set.kind === 'consolidate' ? 'Learning set with review' : 'Learning set';

  return <section aria-label="Spelling Bee" className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-gradient-to-b from-yellow-50 to-background">
    <div className="w-full max-w-md mb-4">
      <div className="flex justify-between flex-wrap gap-2 text-sm font-bold mb-2">
        <span>Set {set.setNumber}</span>
        <span>Question {set.position + 1} of {SET_SIZE}</span>
        <span>{band.label} · {kindLabel}</span>
      </div>
      <progress className="w-full h-4" aria-label="Set progress" value={set.answers.length} max={SET_SIZE} />
    </div>
    <div className="text-7xl mb-2 select-none" aria-hidden="true">🐝</div>
    <p className="text-lg font-bold text-center mb-3">Listen to the word, then type the spelling.</p>
    {sentence && <p className="text-center mb-3 bg-card border-2 border-border rounded-xl px-4 py-2">{sentence}</p>}
    <div className="flex flex-wrap gap-2 justify-center mb-4">
      <button type="button" onClick={read} disabled={paused} className="min-h-12 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-black">🔊 Hear the word</button>
      <button type="button" onClick={stop} className="min-h-12 px-4 py-3 rounded-xl bg-white border-2 border-yellow-300 font-bold">Stop reading</button>
      <button type="button" onClick={() => setHintOpen(v => !v)} aria-expanded={hintOpen} aria-controls="spelling-hint" disabled={paused} className="min-h-12 px-4 py-3 rounded-xl bg-white border-2 border-yellow-300 font-bold">{hintOpen ? 'Hide hint' : 'Show a hint'}</button>
      <button type="button" onClick={() => { setPaused(v => !v); stop(); }} aria-pressed={paused} className="min-h-12 px-4 py-3 rounded-xl bg-white border-2 border-yellow-300 font-bold">{paused ? 'Resume spelling' : 'Pause spelling'}</button>
    </div>
    {paused ? <div role="status" className="max-w-md w-full p-5 text-center rounded-2xl bg-white mb-4">
      <h3 className="text-xl font-black">Time for a breather</h3>
      <p>Your place is saved. Stretch, have a drink of water and resume when you are ready.</p>
    </div> : <>
      {hintOpen && status !== 'correct' && status !== 'revealed' && <p id="spelling-hint" className="max-w-md w-full p-4 mb-4 rounded-xl bg-yellow-100">{hintFor(word)}</p>}
      <form onSubmit={submit} className="w-full max-w-md flex gap-2 mb-3">
        <input ref={inputRef} aria-label="Type the spelling" value={typed} onChange={e => setTyped(e.target.value)} disabled={!!answer}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} maxLength={40}
          className="flex-1 min-h-12 px-4 rounded-xl border-2 border-border text-xl font-bold" />
        <button type="submit" disabled={!!answer || !typed.trim()} className="min-h-12 px-5 rounded-xl bg-primary text-primary-foreground font-black">Check</button>
      </form>
      <div role="status" aria-live="polite" className="w-full max-w-md text-center mb-3">
        {status === 'retry' && <p className="font-bold text-blue-900">Good try! Use the hint and have another go.</p>}
        {status === 'correct' && <>
          <p className="text-xl font-black text-green-700">🎉 Correct! {answer?.firstTryCorrect ? 'First try!' : 'You kept trying and got it.'}</p>
          {capitalReminder && <p className="mt-1">Remember: {word.word} starts with a capital letter.</p>}
          <p className="mt-1">{word.tip}</p>
        </>}
        {status === 'revealed' && <>
          <p className="text-lg font-black">The spelling is: <span className="text-green-700">{word.word}</span></p>
          <p className="mt-1 tracking-widest" aria-hidden="true">{[...word.word].join(' ')}</p>
          <p className="mt-1">{word.tip}</p>
          <p className="mt-1 text-sm">We will practise this word again soon.</p>
        </>}
      </div>
      {answer && <button type="button" onClick={next} className="min-h-12 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black">Next word</button>}
    </>}
  </section>;
}

function ResultsView({ result, bandLabel, setsThisVisit, onContinue, onReview, onStop, onHome, headingRef }: {
  result: SetResult; bandLabel: string; setsThisVisit: number; onContinue: () => void; onReview: () => void;
  onStop?: () => void; onHome?: () => void; headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { stars } = starsFor(result.firstTryCorrect, result.total);
  const missed = result.missed.map(getWord).filter((w): w is SpellingWord => !!w);
  return <section aria-label="Set results" className="flex-1 flex flex-col items-center p-4 sm:p-6 bg-gradient-to-b from-yellow-50 to-background">
    <div className="w-full max-w-md bg-card rounded-3xl border-2 border-border p-5 sm:p-6 text-center">
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-black mb-2">Set {result.setNumber} complete!</h2>
      <p className="text-lg font-bold">You spelt {result.firstTryCorrect} out of {result.total} correctly first time.</p>
      <p className="text-3xl my-2" aria-label={`${stars} stars`}>{'⭐'.repeat(stars)}</p>
      <p className="mb-4">{masteryMessage(result)}</p>
      <div className="text-left mb-4">
        <h3 className="font-black mb-2">{missed.length ? 'Words to review' : 'No words to review. Great spelling!'}</h3>
        {missed.length > 0 && <ul className="space-y-2">
          {missed.map(w => <li key={w.id} className="rounded-xl bg-yellow-50 border border-yellow-200 p-3">
            <span className="font-black text-lg">{w.word}</span>
            <span className="block text-sm">{w.tip}</span>
          </li>)}
        </ul>}
      </div>
      <div role="note" className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 mb-4 text-sky-900 text-sm font-bold">
        {setsThisVisit >= LONG_SESSION_SETS
          ? `You have done ${setsThisVisit} sets. Time for a proper break: move around, rest your eyes and come back later.`
          : 'Healthy break: stand up, stretch and have a drink of water before the next set.'}
      </div>
      <div className="flex flex-col gap-3">
        {result.bandComplete ? <>
          <p className="text-sm">You have seen every {bandLabel} word. A grown-up can help choose what to do next.</p>
          <button type="button" onClick={onReview} className="min-h-12 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-black">Start a review set</button>
        </> : <button type="button" onClick={onContinue} className="min-h-12 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-black">Continue to next 10</button>}
        <div className="flex gap-3">
          {onStop && <button type="button" onClick={onStop} className="flex-1 min-h-12 px-4 py-3 rounded-xl bg-muted border border-border font-bold">Stop for now</button>}
          {onHome && <button type="button" onClick={onHome} className="flex-1 min-h-12 px-4 py-3 rounded-xl bg-muted border border-border font-bold">Home</button>}
        </div>
      </div>
    </div>
  </section>;
}

export default function SpellingBeeGame() {
  const navigate = useNavigate();
  const { level, loading, recordResult } = useGameLevel(SLUG);
  const { settings } = useArchieData();
  const [currentQuestion, setCurrentQuestion] = useState('');

  return (
    <>
      <Helmet>
        <title>Spelling Bee — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Listen to the word and type the correct spelling. Year-group word lists in sets of ten, with hints and review of tricky words." />
        <link rel="canonical" href="https://sodafom.uk/games/spelling-bee" />
        <meta property="og:title" content="Spelling Bee — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Spelling Bee — Spelling Game for Kids — Sodafom
      </h1>
      <GameShell title="Spelling Bee" emoji="🐝" subject="spelling" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(_onComplete, controls) => loading ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground font-bold">Loading your spelling words…</p></div>
        ) : (
          <SpellingBeePlay
            year={settings.year}
            legacyLevel={level}
            onQuestionChange={setCurrentQuestion}
            onSetComplete={(r) => {
              const { score, stars } = starsFor(r.firstTryCorrect, r.total);
              const gameResult: GameResult = { score, correct: r.firstTryCorrect, total: r.total, stars };
              controls.recordCompletion(gameResult);
              void recordResult(stars);
            }}
            onStop={() => navigate('/games')}
            onHome={() => navigate('/')}
          />
        )}
      </GameShell>
    </>
  );
}
