import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelBadge from '@/components/games/LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';
import ArchieGameHelper from '@/components/games/ArchieGameHelper';

const SLUG = 'times-table-race';
const TOTAL_ROUNDS = 10;

// Level 1: ×2,5,10 up to ×5 | Level 5: ×2–12 up to ×12, 10s timer
function levelParams(level: number) {
  const maxA = level <= 2 ? [2, 5, 10] : level === 3 ? [2, 3, 4, 5, 6, 10] : level === 4 ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const maxB = level <= 1 ? 5 : level <= 3 ? 10 : 12;
  const timePerQ = Math.max(8, 20 - (level - 1) * 3);
  return { tables: maxA, maxB, timePerQ };
}

function generateQ(level: number) {
  const { tables, maxB } = levelParams(level);
  const a = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * maxB) + 1;
  return { a, b, answer: a * b };
}

function makeOptions(answer: number): number[] {
  const opts = new Set<number>([answer]);
  const deltas = [1, 2, 3, 5, 10, 11, 12];
  while (opts.size < 4) {
    const d = deltas[Math.floor(Math.random() * deltas.length)];
    const c = answer + (Math.random() < 0.5 ? d : -d);
    if (c > 0 && c !== answer) opts.add(c);
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

function TimesTablePlay({ onComplete, level, onLevelChange, onQuestionChange }: {
  onComplete: (r: GameResult) => void;
  level: number;
  onLevelChange: (stars: number) => void;
  onQuestionChange?: (q: string, opts?: string[]) => void;
}) {
  const { timePerQ } = levelParams(level);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const questionHistory = useRef<Set<string>>(new Set());

  const createUniqueQuestion = () => {
    let next = generateQ(level);
    let key = `${next.a}x${next.b}`;
    let attempts = 0;
    while (questionHistory.current.has(key) && attempts < 100) {
      next = generateQ(level);
      key = `${next.a}x${next.b}`;
      attempts += 1;
    }
    questionHistory.current.add(key);
    return next;
  };

  const [state, setState] = useState(() => {
    const initialQ = generateQ(level);
    questionHistory.current.add(`${initialQ.a}x${initialQ.b}`);
    return {
      q: initialQ,
      options: makeOptions(initialQ.answer)
    };
  });
  const { q, options } = state;

  const [timeLeft, setTimeLeft] = useState(timePerQ);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [carPos, setCarPos] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`${q.a} × ${q.b} = ?`, options.map(String)); }, [q, options, onQuestionChange]);

  const nextRound = (wasCorrect: boolean, nc: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const next = round + 1;
    setCarPos(Math.round((nc / TOTAL_ROUNDS) * 100));
    if (next >= TOTAL_ROUNDS) {
      const score = Math.round((nc / TOTAL_ROUNDS) * 100);
      const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
      onLevelChange(stars);
      setTimeout(() => onComplete({ score, correct: nc, total: TOTAL_ROUNDS, stars }), 900);
    } else {
      setTimeout(() => {
        const newQ = createUniqueQuestion();
        setRound(next);
        setState({
          q: newQ,
          options: makeOptions(newQ.answer)
        });
        setTimeLeft(timePerQ);
        setFeedback(null);
        setChosen(null);
      }, 900);
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setFeedback('timeout');
          nextRound(false, correct);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, correct]);

  const handlePick = (opt: number) => {
    if (feedback) return;
    setChosen(opt);
    const isRight = opt === q.answer;
    setFeedback(isRight ? 'correct' : 'wrong');
    const nc = correct + (isRight ? 1 : 0);
    setCorrect(nc);
    nextRound(isRight, nc);
  };

  const timerPct = (timeLeft / timePerQ) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-background">
      <div className="w-full max-w-md mb-2 flex justify-between items-center">
        <p className="text-xs font-bold text-muted-foreground">Q {round + 1}/{TOTAL_ROUNDS} · ⭐ {correct}</p>
        <LevelBadge level={level} />
      </div>

      {/* Timer bar */}
      <div className="w-full max-w-md mb-3">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full transition-colors ${timerPct > 50 ? 'bg-green-500' : timerPct > 25 ? 'bg-yellow-400' : 'bg-red-500'}`}
            animate={{ width: `${timerPct}%` }} transition={{ duration: 0.5 }} />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-0.5 font-bold">{timeLeft}s</p>
      </div>

      {/* Race track */}
      <div className="w-full max-w-md bg-gray-100 rounded-full h-10 mb-4 relative overflow-hidden border-2 border-gray-200">
        <div className="absolute inset-0 flex items-center px-2">
          {[...Array(10)].map((_, i) => <div key={i} className="flex-1 border-r border-gray-300 h-full" />)}
        </div>
        <motion.div
          className="absolute top-1 text-2xl"
          style={{ transform: 'scaleX(-1)' }}
          animate={{ left: `${Math.max(0, carPos - 5)}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
          aria-label="Race car travelling towards the finish"
        >🏎️</motion.div>
        <div className="absolute right-2 top-1 text-2xl">🏁</div>
      </div>

      <motion.div key={round} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-5xl font-black text-foreground mb-4 bg-card rounded-2xl px-10 py-5 shadow-md border-2 border-border relative"
        style={{ fontFamily: 'var(--font-heading)' }}>
        {q.a} × {q.b} = ?
        <ArchieGameHelper className="absolute -right-4 -top-4" />
      </motion.div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className={`text-xl font-black mb-3 ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? '🎉 Correct!' : feedback === 'timeout' ? `⏰ Time's up!` : `❌ Try again next time!`}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {options.map((opt) => {
          const isChosen = chosen === opt;
          let cls = 'bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5';
          if (feedback && isChosen && feedback === 'correct') cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback && isChosen && feedback === 'wrong') cls = 'bg-red-500 border-red-500 text-white';
          else if (feedback) cls = 'bg-muted border-border text-muted-foreground opacity-50';
          return (
            <motion.button key={opt} whileHover={!feedback ? { scale: 1.04 } : {}} whileTap={!feedback ? { scale: 0.96 } : {}}
              onClick={() => handlePick(opt)} disabled={!!feedback}
              className={`py-5 rounded-2xl text-3xl font-black shadow-sm transition-all ${cls}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function TimesTableRaceGame() {
  const { level, loading, recordResult } = useGameLevel(SLUG);
  const [levelToast, setLevelToast] = useState<'up' | 'down' | null>(null);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [currentQuestion, setCurrentQuestion] = useState('');

  useEffect(() => { if (!loading) setDisplayLevel(level); }, [level, loading]);

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
        <title>Times Table Race — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Race to answer times tables questions before the clock runs out! Adaptive difficulty from Level 1 to 5." />
        <link rel="canonical" href="https://sodafom.uk/games/times-table-race" />
        <meta property="og:title" content="Times Table Race — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Times Table Race — Maths Game for Kids — Sodafom
      </h1>
      <GameShell title="Times Table Race" emoji="🏎️" subject="maths" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => loading ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground font-bold">Loading your level…</p></div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {levelToast && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
              <LevelBadge level={displayLevel} showToast={levelToast} onToastDone={() => setLevelToast(null)} />
            </div>}
            <TimesTablePlay onComplete={onComplete} level={displayLevel} onLevelChange={handleLevelChange} onQuestionChange={setCurrentQuestion} />
          </div>
        )}
      </GameShell>
    </>
  );
}
