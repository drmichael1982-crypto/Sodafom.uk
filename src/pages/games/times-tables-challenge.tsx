/**
 * /games/times-tables-challenge — Rapid-fire times table quiz with speed bonus
 * Ages 5–13 · Maths subject
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { Zap, Star, Clock, CheckCircle2, XCircle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Question {
  a: number;
  b: number;
  answer: number;
  choices: number[];
}

// ── Question generator ────────────────────────────────────────────────────────
function makeQuestion(difficulty: Difficulty): Question {
  const tables: Record<Difficulty, number[]> = {
    Easy:   [1, 2, 3, 4, 5, 10],
    Medium: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    Hard:   [3, 4, 6, 7, 8, 9, 11, 12],
  };
  const pool = tables[difficulty];
  const a = pool[Math.floor(Math.random() * pool.length)];
  const b = Math.floor(Math.random() * 12) + 1;
  const answer = a * b;

  // Generate 3 wrong choices close to the answer
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = Math.floor(Math.random() * 10) + 1;
    const w = answer + (Math.random() > 0.5 ? offset : -offset);
    if (w > 0 && w !== answer) wrongs.add(w);
  }
  const choices = [answer, ...Array.from(wrongs)].sort(() => Math.random() - 0.5);
  return { a, b, answer, choices };
}

// ── Speed timer bar ───────────────────────────────────────────────────────────
function TimerBar({ duration, onExpire, key: _key }: { duration: number; onExpire: () => void; key: string }) {
  const [pct, setPct] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const firedRef = useRef(false);

  useEffect(() => {
    startRef.current = Date.now();
    firedRef.current = false;
    setPct(100);

    function tick() {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 1 - elapsed / (duration * 1000));
      setPct(remaining * 100);
      if (remaining <= 0) {
        if (!firedRef.current) { firedRef.current = true; onExpire(); }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, onExpire]);

  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-colors ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Difficulty picker ─────────────────────────────────────────────────────────
function DifficultyPicker({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-5xl">⚡</div>
      <h2 className="text-2xl font-black text-foreground text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        Choose your tables
      </h2>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        Answer as fast as you can — speed bonuses for quick answers!
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {([
          { d: 'Easy' as Difficulty,   emoji: '😊', label: 'Easy',   sub: 'Tables 1–5 & 10',    color: 'bg-green-100 border-green-300 text-green-800' },
          { d: 'Medium' as Difficulty, emoji: '🤔', label: 'Medium', sub: 'Tables 2–10',         color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
          { d: 'Hard' as Difficulty,   emoji: '🔥', label: 'Hard',   sub: 'Tables 3–12 mixed',  color: 'bg-red-100 border-red-300 text-red-800' },
        ]).map(({ d, emoji, label, sub, color }) => (
          <motion.button
            key={d}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(d)}
            className={`py-4 px-5 rounded-2xl font-black text-base border-2 flex items-center justify-between shadow-sm ${color}`}
          >
            <span>{emoji} {label}</span>
            <span className="text-xs font-bold opacity-70">{sub}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Game inner ────────────────────────────────────────────────────────────────
const TOTAL = 12;
const TIME_PER_Q = 8; // seconds

function TimesTablesChallengeInner({
  onComplete, difficulty,
}: {
  onComplete: (r: GameResult) => void;
  difficulty: Difficulty;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState<Question>(() => makeQuestion(difficulty));
  const [phase, setPhase] = useState<'answering' | 'correct' | 'wrong' | 'timeout'>('answering');
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [speedBonuses, setSpeedBonuses] = useState(0);
  const [timerKey, setTimerKey] = useState('0');
  const qStartRef = useRef(Date.now());
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    const next = qIdx + 1;
    if (next >= TOTAL) {
      const finalScore = score;
      const stars = finalScore >= TOTAL * 12 ? 3 : finalScore >= TOTAL * 8 ? 2 : finalScore >= TOTAL * 4 ? 1 : 0;
      onComplete({ score: finalScore, correct, total: TOTAL, stars, maxScore: TOTAL * 15, durationSeconds: 0 });
    } else {
      setQIdx(next);
      setQuestion(makeQuestion(difficulty));
      setPhase('answering');
      setTimerKey(String(next));
      qStartRef.current = Date.now();
    }
  }, [qIdx, score, correct, difficulty, onComplete]);

  const handleAnswer = useCallback((choice: number) => {
    if (phase !== 'answering') return;
    const elapsed = (Date.now() - qStartRef.current) / 1000;
    const isRight = choice === question.answer;

    if (isRight) {
      // Speed bonus: full 15pts under 2s, 12pts under 4s, 10pts otherwise
      const pts = elapsed < 2 ? 15 : elapsed < 4 ? 12 : 10;
      const isBonus = pts > 10;
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      if (isBonus) setSpeedBonuses(b => b + 1);
      setPhase('correct');
    } else {
      setPhase('wrong');
    }

    advanceRef.current = setTimeout(advance, isRight ? 900 : 1400);
  }, [phase, question.answer, advance]);

  const handleTimeout = useCallback(() => {
    if (phase !== 'answering') return;
    setPhase('timeout');
    advanceRef.current = setTimeout(advance, 1600);
  }, [phase, advance]);

  useEffect(() => () => { if (advanceRef.current) clearTimeout(advanceRef.current); }, []);

  const progress = (qIdx / TOTAL) * 100;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-4 py-6">
      {/* Progress + score */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="text-xs font-black text-muted-foreground whitespace-nowrap">{qIdx + 1}/{TOTAL}</span>
        <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2.5 py-1">
          <Star size={13} className="text-accent fill-accent" />
          <span className="text-xs font-black text-foreground">{score}</span>
        </div>
        {speedBonuses > 0 && (
          <div className="flex items-center gap-1 bg-yellow-100 rounded-full px-2.5 py-1">
            <Zap size={12} className="text-yellow-600" />
            <span className="text-xs font-black text-yellow-700">{speedBonuses}</span>
          </div>
        )}
      </div>

      {/* Timer bar */}
      {phase === 'answering' && (
        <TimerBar key={timerKey} duration={TIME_PER_Q} onExpire={handleTimeout} />
      )}

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full bg-card rounded-3xl border-2 border-border shadow-lg overflow-hidden"
        >
          {/* Question display */}
          <div className="hero-bg px-6 py-8 text-center">
            <p className="text-white/70 text-sm font-bold mb-2">What is…</p>
            <p className="text-5xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {question.a} × {question.b} = ?
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Clock size={14} className="text-white/60" />
              <span className="text-white/60 text-xs font-bold">{TIME_PER_Q}s to answer</span>
            </div>
          </div>

          {/* Choices */}
          <div className="p-5 grid grid-cols-2 gap-3">
            {question.choices.map((c) => {
              let style = 'bg-background border-border hover:border-primary hover:bg-primary/5';
              if (phase !== 'answering') {
                if (c === question.answer) style = 'bg-green-100 border-green-500 text-green-800';
                else style = 'bg-muted border-border text-muted-foreground';
              }
              return (
                <motion.button
                  key={c}
                  whileHover={phase === 'answering' ? { scale: 1.04 } : {}}
                  whileTap={phase === 'answering' ? { scale: 0.96 } : {}}
                  onClick={() => handleAnswer(c)}
                  disabled={phase !== 'answering'}
                  className={`py-5 rounded-2xl border-2 font-black text-2xl transition-all ${style}`}
                >
                  {c}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {phase !== 'answering' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mx-5 mb-5 rounded-2xl px-4 py-3 flex items-center gap-2 ${
                  phase === 'correct' ? 'bg-green-100 border border-green-300' :
                  phase === 'wrong'   ? 'bg-red-100 border border-red-300' :
                                        'bg-orange-100 border border-orange-300'
                }`}
              >
                {phase === 'correct' && <CheckCircle2 size={16} className="text-green-600 shrink-0" />}
                {phase === 'wrong'   && <XCircle size={16} className="text-red-500 shrink-0" />}
                {phase === 'timeout' && <Clock size={16} className="text-orange-600 shrink-0" />}
                <p className={`font-black text-sm ${
                  phase === 'correct' ? 'text-green-800' :
                  phase === 'wrong'   ? 'text-red-800' :
                                        'text-orange-800'
                }`}>
                  {phase === 'correct' && `✓ Correct! ${question.a} × ${question.b} = ${question.answer}`}
                  {phase === 'wrong'   && `The answer was ${question.answer}`}
                  {phase === 'timeout' && `Time's up! ${question.a} × ${question.b} = ${question.answer}`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Speed bonus hint */}
      <p className="text-xs text-muted-foreground text-center">
        <Zap size={11} className="inline text-yellow-500 mr-1" />
        Answer in under 2 seconds for a speed bonus!
      </p>
    </div>
  );
}

// ── Wrapper with difficulty gate ──────────────────────────────────────────────
function TimesTablesChallengeWithDifficulty({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  if (!difficulty) return <DifficultyPicker onSelect={setDifficulty} />;
  return <TimesTablesChallengeInner onComplete={onComplete} difficulty={difficulty} />;
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function TimesTablesChallengeGame() {
  return (
    <>
      <Helmet>
        <title>Times Tables Challenge — Sodafom | Maths Games for Kids</title>
        <meta name="description" content="Rapid-fire times table quiz with speed bonuses! Beat the clock and earn stars. A fun maths game for children aged 5–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/times-tables-challenge" />
        <meta property="og:title" content="Times Tables Challenge — Sodafom" />
        <meta property="og:description" content="Rapid-fire times table quiz with speed bonuses!" />
        <meta property="og:url" content="https://sodafom.uk/games/times-tables-challenge" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/times-tables-challenge#webpage',
          name: 'Times Tables Challenge — Sodafom',
          url: 'https://sodafom.uk/games/times-tables-challenge',
          description: 'Rapid-fire times table quiz with speed bonuses for children aged 5–13.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Times Tables Challenge — Maths Game for Kids — Sodafom</h1>
      <GameShell title="Times Tables Challenge" emoji="⚡" subject="maths" ageGroups={['5–7', '8–10', '11–13']}>
        {(onComplete) => <TimesTablesChallengeWithDifficulty onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
