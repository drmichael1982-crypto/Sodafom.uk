import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelBadge from '@/components/games/LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';

const SLUG = 'speed-tables';

// Level 1: ×2,5,10 | Level 5: ×2–12
function gen(level: number) {
  const tables = level <= 1 ? [2, 5, 10] : level <= 2 ? [2, 3, 4, 5, 10] : level <= 3 ? [2, 3, 4, 5, 6, 7, 10] : level <= 4 ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const maxB = level <= 2 ? 8 : 12;
  const a = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * maxB) + 1;
  return { a, b, answer: a * b };
}

function makeOptions(answer: number): number[] {
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * 12) + 1;
    const c = answer + (Math.random() < 0.5 ? delta : -delta);
    if (c > 0) opts.add(c);
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

function SpeedInner({ onComplete, level, onLevelChange, onQuestionChange }: {
  onComplete: (r: GameResult) => void;
  level: number;
  onLevelChange: (stars: number) => void;
  onQuestionChange?: (q: string) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [q, setQ] = useState(() => gen(level));
  const [options, setOptions] = useState(() => makeOptions(gen(level).answer));
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`${q.a} × ${q.b} = ?`); }, [q, onQuestionChange]);

  useEffect(() => {
    if (timeLeft <= 0) {
      const score = Math.min(100, Math.round((correct / Math.max(total, 1)) * 100));
      const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
      onLevelChange(stars);
      onComplete({ score, correct, total, stars });
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, correct, total, onComplete, onLevelChange]);

  const pick = useCallback((opt: number) => {
    if (flash) return;
    const isCorrect = opt === q.answer;
    setFlash(isCorrect ? 'correct' : 'wrong');
    setCorrect(c => c + (isCorrect ? 1 : 0));
    setTotal(t => t + 1);
    setTimeout(() => {
      const nq = gen(level); setQ(nq); setOptions(makeOptions(nq.answer)); setFlash(null);
    }, 400);
  }, [flash, q.answer, level]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-sm mx-auto">
      <div className="flex justify-between w-full items-center">
        <span className={`font-black text-lg ${timeLeft <= 10 ? 'text-secondary' : 'text-foreground'}`}>⏱ {timeLeft}s</span>
        <LevelBadge level={level} />
        <span className="font-black text-lg text-primary">✅ {correct}</span>
      </div>
      <motion.div key={`${q.a}x${q.b}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-2xl p-6 text-center text-5xl font-black transition-colors ${flash === 'correct' ? 'bg-primary text-primary-foreground' : flash === 'wrong' ? 'bg-secondary text-secondary-foreground' : 'bg-card border-2 border-border'}`}>
        {q.a} × {q.b} = ?
      </motion.div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((opt) => {
          let cls = 'bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5';
          if (flash === 'correct' && opt === q.answer) cls = 'bg-green-500 border-green-500 text-white';
          else if (flash === 'wrong' && opt === q.answer) cls = 'bg-muted border-border text-muted-foreground opacity-50';
          else if (flash) cls = 'bg-muted border-border text-muted-foreground opacity-50';
          return (
            <motion.button key={opt} whileHover={!flash ? { scale: 1.04 } : {}} whileTap={!flash ? { scale: 0.96 } : {}}
              onClick={() => pick(opt)} disabled={!!flash}
              className={`py-5 rounded-2xl text-3xl font-black shadow-sm transition-all ${cls}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Answered: {total} | Correct: {correct}</p>
    </div>
  );
}

export default function SpeedTables() {
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
        <title>Speed Tables — Sodafom</title>
        <meta name="description" content="Answer as many times table questions as possible in 60 seconds! Adaptive difficulty." />
        <link rel="canonical" href="https://sodafom.uk/games/speed-tables" />
        <meta property="og:title" content="Speed Tables — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Speed Tables — Maths Game for Kids — Sodafom
      </h1>
      <GameShell title="Speed Tables" emoji="⚡" subject="maths" ageGroups={['8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => loading ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground font-bold">Loading your level…</p></div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {levelToast && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
              <LevelBadge level={displayLevel} showToast={levelToast} onToastDone={() => setLevelToast(null)} />
            </div>}
            <SpeedInner onComplete={onComplete} level={displayLevel} onLevelChange={handleLevelChange} onQuestionChange={setCurrentQuestion} />
          </div>
        )}
      </GameShell>
    </>
  );
}
