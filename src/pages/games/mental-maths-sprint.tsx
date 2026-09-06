import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelBadge from '@/components/games/LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';
import ArchieGameHelper from '@/components/games/ArchieGameHelper';

const SLUG = 'mental-maths-sprint';
const TOTAL_ROUNDS = 12;

type Q = { question: string; answer: number };

// Level 1: +/- to 20 | Level 5: all ops, large numbers
function generateQ(level: number): Q {
  if (level <= 1) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return Math.random() < 0.5
      ? { question: `${a} + ${b}`, answer: a + b }
      : { question: `${a + b} - ${b}`, answer: a };
  }
  if (level === 2) {
    const ops = ['+', '-', '×'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '×') { const a = Math.floor(Math.random() * 5) + 2; const b = Math.floor(Math.random() * 5) + 2; return { question: `${a} × ${b}`, answer: a * b }; }
    const a = Math.floor(Math.random() * 30) + 10; const b = Math.floor(Math.random() * 20) + 5;
    return op === '+' ? { question: `${a} + ${b}`, answer: a + b } : { question: `${a + b} - ${b}`, answer: a };
  }
  if (level === 3) {
    const ops = ['+', '-', '×'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '×') { const a = Math.floor(Math.random() * 10) + 2; const b = Math.floor(Math.random() * 10) + 2; return { question: `${a} × ${b}`, answer: a * b }; }
    const a = Math.floor(Math.random() * 50) + 20; const b = Math.floor(Math.random() * 30) + 10;
    return op === '+' ? { question: `${a} + ${b}`, answer: a + b } : { question: `${a + b} - ${b}`, answer: a };
  }
  if (level === 4) {
    const ops = ['+', '-', '×', '÷'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '×') { const a = Math.floor(Math.random() * 12) + 3; const b = Math.floor(Math.random() * 12) + 3; return { question: `${a} × ${b}`, answer: a * b }; }
    if (op === '÷') { const b = Math.floor(Math.random() * 9) + 2; const ans = Math.floor(Math.random() * 10) + 2; return { question: `${b * ans} ÷ ${b}`, answer: ans }; }
    const a = Math.floor(Math.random() * 100) + 50; const b = Math.floor(Math.random() * 50) + 10;
    return op === '+' ? { question: `${a} + ${b}`, answer: a + b } : { question: `${a + b} - ${b}`, answer: a };
  }
  // Level 5
  const ops = ['+', '-', '×', '÷'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  if (op === '×') { const a = Math.floor(Math.random() * 15) + 5; const b = Math.floor(Math.random() * 12) + 2; return { question: `${a} × ${b}`, answer: a * b }; }
  if (op === '÷') { const b = Math.floor(Math.random() * 11) + 2; const ans = Math.floor(Math.random() * 12) + 2; return { question: `${b * ans} ÷ ${b}`, answer: ans }; }
  const a = Math.floor(Math.random() * 200) + 50; const b = Math.floor(Math.random() * 100) + 10;
  return op === '+' ? { question: `${a} + ${b}`, answer: a + b } : { question: `${a + b} - ${b}`, answer: a };
}

function makeOptions(answer: number): number[] {
  const opts = new Set<number>([answer]);
  const spread = Math.max(3, Math.floor(Math.abs(answer) * 0.2));
  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * spread) + 1;
    const c = answer + (Math.random() < 0.5 ? delta : -delta);
    if (c !== answer) opts.add(c);
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

const TIME_PER_LEVEL = [0, 15, 13, 11, 10, 8] as const;

function MentalMathsGame({ onComplete, level, onLevelChange, onQuestionChange }: {
  onComplete: (r: GameResult) => void;
  level: number;
  onLevelChange: (stars: number) => void;
  onQuestionChange?: (q: string, opts?: string[]) => void;
}) {
  const timeLimit = TIME_PER_LEVEL[Math.min(level, 5)];
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  // Fix: Generate Q and Options together to ensure they match on the first round
  const [state, setState] = useState(() => {
    const initialQ = generateQ(level);
    return {
      q: initialQ,
      options: makeOptions(initialQ.answer)
    };
  });
  const { q, options } = state;

  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`${q.question} = ?`, options.map(String)); }, [q, options, onQuestionChange]);

  const advance = useCallback((wasCorrect: boolean, currentScore: number) => {
    const newScore = wasCorrect ? currentScore + 1 : currentScore;
    const newRound = round + 1;
    if (newRound >= TOTAL_ROUNDS) {
      const pct = Math.round((newScore / TOTAL_ROUNDS) * 100);
      const stars = newScore >= 10 ? 3 : newScore >= 7 ? 2 : 1;
      onLevelChange(stars);
      setTimeout(() => onComplete({ correct: newScore, total: TOTAL_ROUNDS, score: pct, stars }), 700);
    } else {
      setScore(newScore);
      setRound(newRound);
      const newQ = generateQ(level);
      setState({
        q: newQ,
        options: makeOptions(newQ.answer)
      });
      setTimeLeft(timeLimit);
      setFlash(null);
      setChosen(null);
    }
  }, [round, level, timeLimit, onComplete, onLevelChange]);

  useEffect(() => {
    if (flash) return;
    if (timeLeft <= 0) { setFlash('wrong'); setTimeout(() => advance(false, score), 700); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, flash, advance, score]);

  const handlePick = useCallback((opt: number) => {
    if (flash) return;
    setChosen(opt);
    const correct = opt === q.answer;
    setFlash(correct ? 'correct' : 'wrong');
    setTimeout(() => advance(correct, score), 700);
  }, [flash, q.answer, advance, score]);

  const timerPct = (timeLeft / timeLimit) * 100;

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden w-32">
            <motion.div className={`h-full rounded-full transition-all ${timerPct > 50 ? 'bg-green-500' : timerPct > 25 ? 'bg-accent' : 'bg-red-500'}`} style={{ width: `${timerPct}%` }} />
          </div>
          <span className="text-sm font-black text-foreground">{timeLeft}s</span>
        </div>
        <LevelBadge level={level} />
      </div>
      <p className="text-xs text-muted-foreground font-semibold">{round + 1}/{TOTAL_ROUNDS} · Score: {score}</p>

      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.2 }}
          className={`w-full rounded-3xl p-8 text-center shadow-xl border-4 transition-colors relative ${flash === 'correct' ? 'bg-green-500 border-green-400' : flash === 'wrong' ? 'bg-red-500 border-red-400' : 'bg-card border-border'}`}>
          <p className={`font-black text-4xl md:text-5xl ${flash ? 'text-white' : 'text-foreground'}`} style={{ fontFamily: 'var(--font-heading)' }}>
            {q.question} = ?
          </p>
          <ArchieGameHelper className="absolute -right-4 -top-4" />
          {flash === 'correct' && <p className="text-white text-xl font-black mt-2">✓ Correct!</p>}
          {flash === 'wrong' && <p className="text-white text-xl font-black mt-2">✗ It was {q.answer}</p>}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((opt) => {
          const isChosen = chosen === opt; const isCorrect = opt === q.answer;
          let cls = 'bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5';
          if (flash && isChosen && flash === 'correct') cls = 'bg-green-500 border-green-500 text-white';
          else if (flash && isChosen && flash === 'wrong') cls = 'bg-red-500 border-red-500 text-white';
          else if (flash && isCorrect) cls = 'bg-green-500 border-green-500 text-white';
          else if (flash) cls = 'bg-muted border-border text-muted-foreground opacity-50';
          return (
            <motion.button key={opt} whileHover={!flash ? { scale: 1.04 } : {}} whileTap={!flash ? { scale: 0.96 } : {}}
              onClick={() => handlePick(opt)} disabled={!!flash}
              className={`py-5 rounded-2xl text-2xl font-black shadow-sm transition-all ${cls}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function MentalMathsSprintPage() {
  const { level, loading, recordResult } = useGameLevel(SLUG);
  const [levelToast, setLevelToast] = useState<'up' | 'down' | null>(null);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleLevelChange = async (stars: number) => {
    const prev = displayLevel;
    const next = await recordResult(stars);
    if (next > prev) setLevelToast('up');
    else if (next < prev) setLevelToast('down');
    setDisplayLevel(next);
  };

  return (
    <>
      <Helmet>
        <title>Mental Maths Sprint — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Race the clock with mental maths! Adaptive difficulty from Level 1 to 5." />
        <link rel="canonical" href="https://sodafom.uk/games/mental-maths-sprint" />
        <meta property="og:title" content="Mental Maths Sprint — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Mental Maths Sprint — Maths Game for Kids — Sodafom
      </h1>
      <GameShell title="Mental Maths Sprint" emoji="⚡" subject="maths" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => loading ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground font-bold">Loading your level…</p></div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {levelToast && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
              <LevelBadge level={displayLevel} showToast={levelToast} onToastDone={() => setLevelToast(null)} />
            </div>}
            <MentalMathsGame onComplete={onComplete} level={displayLevel} onLevelChange={handleLevelChange} onQuestionChange={setCurrentQuestion} />
          </div>
        )}
      </GameShell>
    </>
  );
}
