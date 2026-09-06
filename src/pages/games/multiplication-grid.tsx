/**
 * /games/multiplication-grid — fill in a times table grid against the clock (maths, ages 8–13)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { Star, Timer, CheckCircle2, XCircle } from 'lucide-react';

interface GridCell {
  row: number;
  col: number;
  answer: number;
  userAnswer: string;
  correct: boolean | null;
}

const GRID_SIZE = 5; // 5×5 grid of random cells
const TIME_LIMIT = 60; // seconds

function buildGrid(): GridCell[] {
  const cells: GridCell[] = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const row = Math.floor(Math.random() * 10) + 1;
    const col = Math.floor(Math.random() * 10) + 1;
    cells.push({ row, col, answer: row * col, userAnswer: '', correct: null });
  }
  return cells;
}

function MultiplicationGridInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [cells, setCells] = useState<GridCell[]>(() => buildGrid());
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [submitted, setSubmitted] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    clearInterval(timerRef.current!);
    setSubmitted(true);
    setCells(prev => prev.map(c => ({
      ...c,
      correct: c.userAnswer.trim() === String(c.answer),
    })));
  }, [submitted]);

  useEffect(() => {
    if (!submitted) return;
    const correctCount = cells.filter(c => c.correct).length;
    const total = cells.length;
    const score = Math.round((correctCount / total) * 100);
    const stars = correctCount >= total * 0.9 ? 3 : correctCount >= total * 0.6 ? 2 : correctCount >= total * 0.3 ? 1 : 0;
    const durationSeconds = Math.round((Date.now() - startRef.current) / 1000);
    setTimeout(() => {
      onComplete({ score, correct: correctCount, total, stars, maxScore: 100, durationSeconds });
    }, 2500);
  }, [submitted, cells, onComplete]);

  const handleInput = (idx: number, val: string) => {
    if (submitted) return;
    const clean = val.replace(/[^0-9]/g, '').slice(0, 3);
    setCells(prev => prev.map((c, i) => i === idx ? { ...c, userAnswer: clean } : c));
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const next = idx + 1;
      if (next < cells.length) setActiveIdx(next);
      else handleSubmit();
    }
  };

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColour = timeLeft > 20 ? 'bg-green-500' : timeLeft > 10 ? 'bg-yellow-500' : 'bg-red-500';
  const correctCount = submitted ? cells.filter(c => c.correct).length : null;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto px-4 py-6">
      {/* Header bar */}
      <div className="w-full flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5">
          <Timer size={14} className={timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'} />
          <span className={`text-sm font-black ${timeLeft <= 10 ? 'text-red-600' : 'text-foreground'}`}>{timeLeft}s</span>
        </div>
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors ${timerColour}`}
            animate={{ width: `${timerPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2.5 py-1">
          <Star size={13} className="text-accent fill-accent" />
          <span className="text-xs font-black text-foreground">{submitted ? correctCount : '?'}</span>
        </div>
      </div>

      <div className="w-full bg-card rounded-3xl border-2 border-border shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-violet-500 to-purple-700 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">✖️</span>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Multiplication Grid</p>
            <p className="text-white font-black text-sm">Fill in all the answers before time runs out!</p>
          </div>
        </div>

        <div className="p-4">
          {/* Grid */}
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          >
            {cells.map((cell, idx) => {
              let borderCol = 'border-border';
              let bg = 'bg-background';
              if (submitted && cell.correct === true) { borderCol = 'border-green-500'; bg = 'bg-green-50'; }
              if (submitted && cell.correct === false) { borderCol = 'border-red-400'; bg = 'bg-red-50'; }
              if (!submitted && activeIdx === idx) { borderCol = 'border-primary'; bg = 'bg-primary/5'; }

              return (
                <div key={idx} className={`rounded-xl border-2 ${borderCol} ${bg} p-1.5 flex flex-col items-center gap-1 transition-all`}>
                  <p className="text-xs font-black text-muted-foreground leading-none">{cell.row}×{cell.col}</p>
                  {submitted ? (
                    <div className="flex items-center gap-0.5">
                      {cell.correct
                        ? <CheckCircle2 size={12} className="text-green-600" />
                        : <XCircle size={12} className="text-red-500" />}
                      <span className={`text-sm font-black ${cell.correct ? 'text-green-700' : 'text-red-600'}`}>
                        {cell.correct ? cell.userAnswer : cell.answer}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      inputMode="numeric"
                      value={cell.userAnswer}
                      onChange={e => handleInput(idx, e.target.value)}
                      onFocus={() => setActiveIdx(idx)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      className="w-full text-center text-sm font-black bg-transparent outline-none text-foreground"
                      style={{ appearance: 'textfield' }}
                      placeholder="?"
                      aria-label={`${cell.row} times ${cell.col}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          {!submitted && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className="mt-4 w-full py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-md"
            >
              Submit answers ✓
            </motion.button>
          )}

          {/* Result */}
          <AnimatePresence>
            {submitted && correctCount !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-2xl px-4 py-3 text-center ${correctCount >= cells.length * 0.8 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}
              >
                <p className="font-black text-lg text-foreground">
                  {correctCount === cells.length ? '🏆 Perfect score!' : correctCount >= cells.length * 0.8 ? '🌟 Great work!' : '💪 Keep practising!'}
                </p>
                <p className="text-sm font-bold text-muted-foreground mt-1">
                  {correctCount} out of {cells.length} correct
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function MultiplicationGridGame() {
  return (
    <>
      <Helmet>
        <title>Multiplication Grid — Sodafom | Maths Games for Kids</title>
        <meta name="description" content="Fill in a times table grid against the clock! A fast-paced multiplication game for children aged 8–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/multiplication-grid" />
        <meta property="og:title" content="Multiplication Grid — Sodafom" />
        <meta property="og:description" content="Fill in a times table grid against the clock!" />
        <meta property="og:url" content="https://sodafom.uk/games/multiplication-grid" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/multiplication-grid#webpage',
          name: 'Multiplication Grid — Sodafom', url: 'https://sodafom.uk/games/multiplication-grid',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Multiplication Grid — Maths Game for Kids — Sodafom</h1>
      <GameShell title="Multiplication Grid" emoji="✖️" subject="maths" ageGroups={['8–10', '11–13']}>
        {(onComplete) => <MultiplicationGridInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
