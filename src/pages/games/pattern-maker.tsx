import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { Volume2, Star, ChevronRight, RotateCcw, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type PatternItem = {
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'diamond';
  color: string;
  label: string; // for accessibility / speech
};

type Question = {
  id: string;
  type: 'shape-color' | 'number' | 'emoji';
  sequence: (PatternItem | string)[];
  blankIndex: number; // which position is the blank
  options: (PatternItem | string)[];
  answer: PatternItem | string;
  hint: string;
  ageGroup: '4-6' | '7-9' | '10-13';
};

// ── Shape renderer ────────────────────────────────────────────────────────────
const SHAPE_COLORS: Record<string, string> = {
  red:    '#EF4444',
  blue:   '#3B82F6',
  yellow: '#F59E0B',
  green:  '#22C55E',
  purple: '#A855F7',
  orange: '#F97316',
  pink:   '#EC4899',
};

function ShapeIcon({ item, size = 44, pulse = false }: { item: PatternItem; size?: number; pulse?: boolean }) {
  const color = SHAPE_COLORS[item.color] ?? item.color;
  const s = size;
  const half = s / 2;

  const shapeEl = (() => {
    switch (item.shape) {
      case 'circle':
        return <circle cx={half} cy={half} r={half * 0.78} fill={color} />;
      case 'square':
        return <rect x={s * 0.11} y={s * 0.11} width={s * 0.78} height={s * 0.78} rx={s * 0.12} fill={color} />;
      case 'triangle':
        return <polygon points={`${half},${s * 0.1} ${s * 0.9},${s * 0.9} ${s * 0.1},${s * 0.9}`} fill={color} />;
      case 'star': {
        const pts: string[] = [];
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const r2 = i % 2 === 0 ? half * 0.82 : half * 0.38;
          pts.push(`${half + r2 * Math.cos(angle)},${half + r2 * Math.sin(angle)}`);
        }
        return <polygon points={pts.join(' ')} fill={color} />;
      }
      case 'diamond':
        return <polygon points={`${half},${s * 0.08} ${s * 0.92},${half} ${half},${s * 0.92} ${s * 0.08},${half}`} fill={color} />;
    }
  })();

  return (
    <motion.svg
      width={s} height={s} viewBox={`0 0 ${s} ${s}`}
      animate={pulse ? { scale: [1, 1.18, 1] } : {}}
      transition={{ duration: 0.7, repeat: pulse ? Infinity : 0, ease: 'easeInOut' as const }}
      aria-label={`${item.color} ${item.shape}`}
    >
      {shapeEl}
    </motion.svg>
  );
}

// ── Questions bank ────────────────────────────────────────────────────────────
const C = (shape: PatternItem['shape'], color: string): PatternItem => ({ shape, color, label: `${color} ${shape}` });

const ALL_QUESTIONS: Question[] = [
  // ── Easy (ages 4–6): simple 2-element repeating colour/shape patterns ──────
  {
    id: 'q1', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('circle','red'), C('circle','blue'), C('circle','red'), C('circle','blue'), C('circle','red'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('circle','blue'), C('circle','red'), C('circle','green'), C('circle','yellow')],
    answer: C('circle','blue'),
    hint: 'Red, blue, red, blue… what comes next?',
  },
  {
    id: 'q2', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('square','yellow'), C('square','green'), C('square','yellow'), C('square','green'), null as unknown as PatternItem],
    blankIndex: 4,
    options: [C('square','yellow'), C('square','green'), C('square','blue'), C('square','red')],
    answer: C('square','yellow'),
    hint: 'Yellow, green, yellow, green… what comes next?',
  },
  {
    id: 'q3', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('triangle','red'), C('circle','red'), C('triangle','red'), C('circle','red'), C('triangle','red'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('triangle','red'), C('circle','red'), C('square','red'), C('diamond','red')],
    answer: C('circle','red'),
    hint: 'Triangle, circle, triangle, circle… what comes next?',
  },
  {
    id: 'q4', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('star','yellow'), C('star','yellow'), C('circle','blue'), C('star','yellow'), C('star','yellow'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('star','yellow'), C('circle','blue'), C('star','blue'), C('circle','yellow')],
    answer: C('circle','blue'),
    hint: 'Star, star, circle, star, star… what comes next?',
  },
  {
    id: 'q5', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('circle','purple'), C('square','orange'), C('circle','purple'), C('square','orange'), null as unknown as PatternItem],
    blankIndex: 4,
    options: [C('circle','purple'), C('square','orange'), C('circle','orange'), C('square','purple')],
    answer: C('circle','purple'),
    hint: 'Purple circle, orange square… what comes next?',
  },
  // ── Medium (ages 7–9): 3-element patterns + growing patterns ──────────────
  {
    id: 'q6', type: 'shape-color', ageGroup: '7-9',
    sequence: [C('circle','red'), C('square','blue'), C('triangle','green'), C('circle','red'), C('square','blue'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('triangle','green'), C('circle','red'), C('square','blue'), C('diamond','green')],
    answer: C('triangle','green'),
    hint: 'Red circle, blue square, green triangle… the pattern repeats!',
  },
  {
    id: 'q7', type: 'shape-color', ageGroup: '7-9',
    sequence: [C('diamond','pink'), C('star','yellow'), C('diamond','pink'), C('star','yellow'), C('diamond','pink'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('star','yellow'), C('diamond','pink'), C('star','pink'), C('diamond','yellow')],
    answer: C('star','yellow'),
    hint: 'Pink diamond, yellow star… what comes after the pink diamond?',
  },
  {
    id: 'q8', type: 'number', ageGroup: '7-9',
    sequence: ['2', '4', '6', '8', '?'],
    blankIndex: 4,
    options: ['9', '10', '11', '12'],
    answer: '10',
    hint: 'Add 2 each time: 2, 4, 6, 8…',
  },
  {
    id: 'q9', type: 'number', ageGroup: '7-9',
    sequence: ['5', '10', '15', '20', '?'],
    blankIndex: 4,
    options: ['22', '24', '25', '30'],
    answer: '25',
    hint: 'Count in 5s!',
  },
  {
    id: 'q10', type: 'emoji', ageGroup: '7-9',
    sequence: ['🔴', '🔵', '🟡', '🔴', '🔵', '?'],
    blankIndex: 5,
    options: ['🟡', '🔴', '🔵', '🟢'],
    answer: '🟡',
    hint: 'Red, blue, yellow, red, blue… what comes next?',
  },
  // ── Hard (ages 10–13): number sequences, Fibonacci, square numbers ─────────
  {
    id: 'q11', type: 'number', ageGroup: '10-13',
    sequence: ['1', '4', '9', '16', '?'],
    blankIndex: 4,
    options: ['20', '24', '25', '36'],
    answer: '25',
    hint: 'These are square numbers: 1², 2², 3², 4²…',
  },
  {
    id: 'q12', type: 'number', ageGroup: '10-13',
    sequence: ['2', '4', '8', '16', '?'],
    blankIndex: 4,
    options: ['24', '28', '32', '36'],
    answer: '32',
    hint: 'Double each time!',
  },
  {
    id: 'q13', type: 'number', ageGroup: '10-13',
    sequence: ['1', '1', '2', '3', '5', '8', '?'],
    blankIndex: 6,
    options: ['10', '11', '12', '13'],
    answer: '13',
    hint: 'Add the two previous numbers together — Fibonacci!',
  },
  {
    id: 'q14', type: 'number', ageGroup: '10-13',
    sequence: ['3', '9', '27', '81', '?'],
    blankIndex: 4,
    options: ['162', '243', '324', '405'],
    answer: '243',
    hint: 'Multiply by 3 each time!',
  },
  {
    id: 'q15', type: 'number', ageGroup: '10-13',
    sequence: ['100', '90', '80', '70', '?'],
    blankIndex: 4,
    options: ['55', '60', '65', '75'],
    answer: '60',
    hint: 'Count backwards in 10s!',
  },
];

// ── Utility ───────────────────────────────────────────────────────────────────
function isPatternItem(v: PatternItem | string | null): v is PatternItem {
  return typeof v === 'object' && v !== null && 'shape' in v;
}

function itemsMatch(a: PatternItem | string, b: PatternItem | string): boolean {
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  if (isPatternItem(a) && isPatternItem(b)) return a.shape === b.shape && a.color === b.color;
  return false;
}

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.88; u.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.lang === 'en-GB') ?? voices.find(v => v.lang.startsWith('en')) ?? null;
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// ── Sequence item renderer ────────────────────────────────────────────────────
function SeqItem({ value, isBlank, size = 52 }: { value: PatternItem | string | null; isBlank?: boolean; size?: number }) {
  if (isBlank) {
    return (
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const }}
        className="rounded-xl border-4 border-dashed border-primary/60 bg-primary/10 flex items-center justify-center font-black text-primary text-2xl"
        style={{ width: size + 8, height: size + 8 }}
        aria-label="blank — what goes here?"
      >
        ?
      </motion.div>
    );
  }
  if (!value) return null;
  if (typeof value === 'string') {
    return (
      <div className="rounded-xl bg-muted flex items-center justify-center font-black text-foreground text-xl"
        style={{ width: size + 8, height: size + 8, fontSize: size * 0.42 }}>
        {value}
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-muted/60 flex items-center justify-center"
      style={{ width: size + 8, height: size + 8 }}>
      <ShapeIcon item={value} size={size} />
    </div>
  );
}

// ── Option button ─────────────────────────────────────────────────────────────
function OptionBtn({
  value, selected, correct, wrong, disabled, onClick
}: {
  value: PatternItem | string;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const base = 'relative rounded-2xl border-4 flex flex-col items-center justify-center gap-1 p-3 cursor-pointer transition-all select-none';
  const state = correct
    ? 'border-green-500 bg-green-100 scale-105 shadow-lg'
    : wrong
    ? 'border-red-400 bg-red-100 scale-95 opacity-60'
    : selected
    ? 'border-primary bg-primary/10 scale-105 shadow-md'
    : 'border-border bg-card hover:border-primary/60 hover:scale-105 hover:shadow-md';

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.06 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      onClick={disabled ? undefined : onClick}
      className={`${base} ${state}`}
      style={{ width: 80, height: 80 }}
      aria-label={typeof value === 'string' ? value : value.label}
    >
      {typeof value === 'string' ? (
        <span className="font-black text-foreground" style={{ fontSize: 26 }}>{value}</span>
      ) : (
        <ShapeIcon item={value} size={46} />
      )}
      {correct && <CheckCircle2 size={16} className="absolute -top-2 -right-2 text-green-600 bg-white rounded-full" />}
      {wrong && <XCircle size={16} className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full" />}
    </motion.button>
  );
}

// ── Main game inner ───────────────────────────────────────────────────────────
function PatternMakerInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const questions = ALL_QUESTIONS;
  const TOTAL = questions.length;

  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<PatternItem | string | null>(null);
  const [phase, setPhase] = useState<'answering' | 'correct' | 'wrong' | 'hint'>('answering');
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[qIdx];

  // Read question aloud on mount / question change
  useEffect(() => {
    const seqText = q.sequence
      .map((item, i) => i === q.blankIndex ? 'blank' : typeof item === 'string' ? item : item?.label ?? '')
      .join(', ');
    speak(`Pattern ${qIdx + 1}. The sequence is: ${seqText}. What comes next?`);
  }, [qIdx]);

  const handleAnswer = useCallback((opt: PatternItem | string) => {
    if (phase !== 'answering') return;
    setSelected(opt);
    const isCorrect = itemsMatch(opt, q.answer);

    if (isCorrect) {
      const pts = showHint ? 5 : 10;
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setPhase('correct');
      speak('Correct! Well done!');
      timerRef.current = setTimeout(() => advance(), 1400);
    } else {
      setStreak(0);
      setPhase('wrong');
      speak(`Not quite. The answer is ${typeof q.answer === 'string' ? q.answer : q.answer.label}.`);
      timerRef.current = setTimeout(() => advance(), 1800);
    }
  }, [phase, q, showHint, streak, bestStreak]);

  function advance() {
    setSelected(null);
    setPhase('answering');
    setShowHint(false);
    if (qIdx + 1 >= TOTAL) {
      finish();
    } else {
      setQIdx(i => i + 1);
    }
  }

  function finish() {
    const stars = correct >= TOTAL * 0.9 ? 3 : correct >= TOTAL * 0.6 ? 2 : correct >= TOTAL * 0.3 ? 1 : 0;
    onComplete({ score, correct, total: TOTAL, stars, maxScore: TOTAL * 10, durationSeconds: 0 });
  }

  function handleHint() {
    setShowHint(true);
    setHintsUsed(h => h + 1);
    speak(q.hint);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const progress = (qIdx / TOTAL) * 100;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto px-4 py-6">

      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs font-black text-muted-foreground whitespace-nowrap">{qIdx + 1}/{TOTAL}</span>
        <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2.5 py-1">
          <Star size={13} className="text-accent fill-accent" />
          <span className="text-xs font-black text-foreground">{score}</span>
        </div>
        {streak >= 2 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-orange-100 rounded-full px-2.5 py-1">
            <span className="text-xs font-black text-orange-600">🔥 {streak}</span>
          </motion.div>
        )}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35 }}
          className="w-full bg-card rounded-3xl border-2 border-border shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="hero-bg px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">
                {q.type === 'number' ? 'Number Pattern' : q.type === 'emoji' ? 'Colour Pattern' : 'Shape Pattern'}
              </p>
              <h2 className="text-white font-black text-lg leading-tight hero-title-shadow">
                What comes next?
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const seqText = q.sequence
                    .map((item, i) => i === q.blankIndex ? 'blank' : typeof item === 'string' ? item : item?.label ?? '')
                    .join(', ');
                  speak(`The sequence is: ${seqText}. What comes next?`);
                }}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Read aloud"
              >
                <Volume2 size={16} className="text-white" />
              </motion.button>
              {!showHint && phase === 'answering' && (
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={handleHint}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Show hint"
                >
                  <Lightbulb size={16} className="text-white" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Sequence display */}
          <div className="px-5 py-5">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              {q.sequence.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <SeqItem
                    value={item}
                    isBlank={i === q.blankIndex}
                    size={q.type === 'number' || q.type === 'emoji' ? 44 : 48}
                  />
                  {i < q.sequence.length - 1 && i !== q.blankIndex - 1 && (
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex items-start gap-2 bg-accent/15 border border-accent/30 rounded-xl px-3 py-2.5"
                >
                  <Lightbulb size={14} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-foreground">{q.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback banner */}
            <AnimatePresence>
              {phase === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 bg-green-100 border border-green-300 rounded-xl px-4 py-2.5"
                >
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <p className="font-black text-green-800 text-sm">
                    {showHint ? 'Correct! (+5 points)' : streak >= 3 ? `🔥 ${streak} in a row! (+10 points)` : 'Correct! Well done! (+10 points)'}
                  </p>
                </motion.div>
              )}
              {phase === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 bg-red-100 border border-red-300 rounded-xl px-4 py-2.5"
                >
                  <XCircle size={18} className="text-red-500 shrink-0" />
                  <p className="font-black text-red-800 text-sm">
                    Not quite! The answer was{' '}
                    <span className="text-red-700">
                      {typeof q.answer === 'string' ? q.answer : q.answer.label}
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Options */}
          <div className="px-5 pb-6">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-3 text-center">
              Choose the missing piece
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {q.options.map((opt, i) => {
                const isSelected = selected !== null && itemsMatch(opt, selected);
                const isCorrectOpt = phase !== 'answering' && itemsMatch(opt, q.answer);
                const isWrongOpt = isSelected && phase === 'wrong';
                return (
                  <OptionBtn
                    key={i}
                    value={opt}
                    selected={isSelected}
                    correct={isCorrectOpt}
                    wrong={isWrongOpt}
                    disabled={phase !== 'answering'}
                    onClick={() => handleAnswer(opt)}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip / restart */}
      <div className="flex items-center gap-3">
        {phase === 'answering' && (
          <button
            onClick={() => { setStreak(0); advance(); }}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            <RotateCcw size={13} /> Skip
          </button>
        )}
        <p className="text-xs text-muted-foreground">
          Hints used: <span className="font-black">{hintsUsed}</span>
        </p>
      </div>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function PatternMakerGame() {
  return (
    <>
      <Helmet>
        <title>Pattern Maker — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Spot the pattern and choose what comes next! Colour patterns, shape patterns and number sequences for children aged 4–13." />
        <link rel="canonical" href="https://sodafom.uk/games/pattern-maker" />
        <meta property="og:title" content="Pattern Maker — Sodafom" />
        <meta property="og:description" content="Spot the pattern and choose what comes next! Colour patterns, shape patterns and number sequences." />
        <meta property="og:url" content="https://sodafom.uk/games/pattern-maker" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Pattern Maker — Maths Game for Kids — Sodafom</h1>
      <GameShell title="Pattern Maker" emoji="🔷" subject="maths" ageGroups={['4–6', '5–7', '8–10', '11–13']}>
        {(onComplete) => <PatternMakerInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
