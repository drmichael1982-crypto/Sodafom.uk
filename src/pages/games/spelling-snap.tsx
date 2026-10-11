import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';

interface SpellingSnapQuestion {
  prompt: string;
  answer: string;
  options: [string, string];
  hint: string;
}

export const SPELLING_SNAP_QUESTIONS: SpellingSnapQuestion[] = [
  { prompt: 'The children put ___ books away.', answer: 'their', options: ['their', 'there'], hint: '“Their” shows belonging. “There” points to a place.' },
  { prompt: 'Lack of sleep can ___ your concentration.', answer: 'affect', options: ['affect', 'effect'], hint: '“Affect” usually means to change something. An “effect” is usually the result.' },
  { prompt: 'Everyone was invited ___ Sam.', answer: 'except', options: ['accept', 'except'], hint: '“Accept” means to agree or receive. “Except” means leaving one out.' },
  { prompt: 'I do not know ___ it will rain.', answer: 'whether', options: ['weather', 'whether'], hint: '“Weather” describes outdoor conditions. “Whether” introduces a choice or possibility.' },
  { prompt: 'The school ___ welcomed everyone.', answer: 'principal', options: ['principal', 'principle'], hint: 'A “principal” can lead a school. A “principle” is a rule or belief.' },
  { prompt: 'The bicycle remained ___ at the traffic lights.', answer: 'stationary', options: ['stationary', 'stationery'], hint: '“Stationary” means not moving. “Stationery” is writing paper and supplies.' },
  { prompt: 'The blue scarf will ___ your coat.', answer: 'complement', options: ['complement', 'compliment'], hint: '“Complement” means to match well. A “compliment” is something kind you say.' },
  { prompt: 'We ate apple crumble for ___.', answer: 'dessert', options: ['desert', 'dessert'], hint: 'A “dessert” is a sweet course. A “desert” is a very dry place.' },
  { prompt: 'Football ___ starts at four.', answer: 'practice', options: ['practice', 'practise'], hint: 'In British English, “practice” is the noun and “practise” is the verb.' },
  { prompt: 'Mum renewed her driving ___.', answer: 'licence', options: ['licence', 'license'], hint: 'In British English, “licence” is the noun and “license” is the verb.' },
];

export function SpellingSnapPlay({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const [round, setRound] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [hadWrongAttempt, setHadWrongAttempt] = useState(false);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [paused, setPaused] = useState(false);
  const completionSent = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const TOTAL = 10;
  const question = SPELLING_SNAP_QUESTIONS[round];

  // Report current question to Archie
  useEffect(() => {
    onQuestionChange?.(`Spelling Snap question ${round + 1}: choose the correct word for this sentence: ${question.prompt}`);
  }, [question, round, onQuestionChange]);
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function pick(word: string) {
    if (paused || feedback === 'correct' || completionSent.current || word === wrongChoice) return;
    const isCorrect = word === question.answer;
    if (!isCorrect) {
      setHadWrongAttempt(true);
      setWrongChoice(word);
      setFeedback('wrong');
      setShowHint(true);
      return;
    }

    const nextFirstTryCorrect = firstTryCorrect + (hadWrongAttempt ? 0 : 1);
    setFirstTryCorrect(nextFirstTryCorrect);
    setFeedback('correct');
    timerRef.current = setTimeout(() => {
      setFeedback(null);
      const nr = round + 1;
      if (nr >= TOTAL) {
        const score = Math.round((nextFirstTryCorrect / TOTAL) * 100);
        completionSent.current = true;
        onComplete({ score, correct: nextFirstTryCorrect, total: TOTAL, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 });
      } else {
        setRound(nr);
        setHadWrongAttempt(false);
        setWrongChoice(null);
        setShowHint(false);
      }
    }, 900);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-lg mx-auto">
      <div className="w-full" aria-label="Spelling Snap progress">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(round / TOTAL) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm font-bold text-muted-foreground text-center">
          Question {round + 1} of {TOTAL} · {firstTryCorrect} first-try correct
        </p>
      </div>
      <p className="text-base font-bold text-foreground text-center">
        Choose a word. If it is not right, use the meaning hint and try the same sentence again.
      </p>
      <motion.div key={round} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-border rounded-2xl p-5 w-full text-center">
        <p className="text-lg font-bold">Choose the word that completes the sentence:</p>
        <p className="text-2xl font-black text-primary mt-3">{question.prompt}</p>
      </motion.div>
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 w-full">
        {question.options.map(word => (
          <motion.button key={word} whileTap={{ scale: 0.95 }} onClick={() => pick(word)}
            disabled={paused || feedback === 'correct' || completionSent.current || word === wrongChoice}
            aria-describedby={feedback === 'wrong' ? 'spelling-snap-feedback' : undefined}
            className={`min-h-12 px-4 py-3 rounded-2xl font-black text-lg border-2 transition-all disabled:cursor-not-allowed
              ${word === wrongChoice
                ? 'border-red-400 bg-red-100 text-red-900'
                : 'border-border bg-card hover:border-primary disabled:opacity-60'}`}>
            {word}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {feedback && <motion.div id="spelling-snap-feedback" initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
          role="status" aria-live="polite"
          className={`w-full rounded-2xl border-2 px-4 py-3 text-center ${feedback === 'correct' ? 'border-green-300 bg-green-50 text-green-900' : 'border-amber-300 bg-amber-50 text-amber-950'}`}>
          <p className="text-lg font-black">
            {feedback === 'correct' ? (hadWrongAttempt ? '✅ You fixed it!' : '✅ Correct!') : 'Good try. Keep this sentence and choose again.'}
          </p>
          {feedback === 'wrong' && <p className="mt-1 text-sm font-bold">{question.hint}</p>}
        </motion.div>}
      </AnimatePresence>
      {!feedback && showHint && (
        <div className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-center" role="status">
          <p className="font-black text-blue-950">Meaning hint</p>
          <p className="mt-1 text-sm font-bold text-blue-900">{question.hint}</p>
        </div>
      )}
      {paused && (
        <div className="w-full rounded-2xl border-2 border-blue-300 bg-blue-50 px-4 py-3 text-center" role="status">
          <p className="font-black text-blue-950">Paused. Your sentence is saved.</p>
          <p className="text-sm font-bold text-blue-900">Take a break and resume whenever you are ready.</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          type="button"
          onClick={() => setShowHint(true)}
          disabled={paused || feedback === 'correct' || showHint}
          aria-pressed={showHint}
          className="min-h-12 rounded-xl border-2 border-blue-300 bg-blue-50 px-3 py-2 font-black text-blue-950 disabled:opacity-60"
        >
          Show meaning hint
        </button>
        <button
          type="button"
          onClick={() => setPaused(value => !value)}
          disabled={feedback === 'correct'}
          className="min-h-12 rounded-xl border-2 border-blue-800 bg-blue-700 px-3 py-2 font-black text-white disabled:opacity-60"
        >
          {paused ? 'Resume game' : 'Pause game'}
        </button>
      </div>
    </div>
  );
}

export default function SpellingSnap() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Spelling Snap — Sodafom</title>
        <meta name="description" content="Snap the correct spelling from confusable word pairs. their/there, affect/effect and more!" />
        <link rel="canonical" href="https://sodafom.uk/games/spelling-snap" />
        <meta property="og:title" content="Spelling Snap — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Spelling Snap — Spelling Game for Kids — Sodafom
      </h1>
      <GameShell title="Spelling Snap" emoji="🃏" subject="spelling" ageGroups={['8–10', '11–13']} currentQuestion={currentQuestion}>
        {(oc) => <SpellingSnapPlay onComplete={oc} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
