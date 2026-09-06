import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelBadge from '@/components/games/LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';
import ArchieGameHelper from '@/components/games/ArchieGameHelper';

const SLUG = 'division-dash';
const TOTAL = 10;

// Level 1: ÷2,5,10 answer≤5 | Level 5: ÷2–12 answer≤12
function generateQ(level: number) {
  const divisors = level <= 1 ? [2, 5, 10] : level <= 2 ? [2, 3, 4, 5, 10] : level <= 3 ? [2, 3, 4, 5, 6, 10] : level <= 4 ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const maxAns = level <= 1 ? 5 : level <= 2 ? 8 : level <= 3 ? 10 : 12;
  const b = divisors[Math.floor(Math.random() * divisors.length)];
  const answer = Math.floor(Math.random() * maxAns) + 1;
  return { q: `${b * answer} ÷ ${b}`, answer };
}

function makeOptions(answer: number): number[] {
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * 5) + 1;
    const c = answer + (Math.random() < 0.5 ? delta : -delta);
    if (c > 0) opts.add(c);
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

function DivisionInner({ onComplete, level, onLevelChange, onQuestionChange }: {
  onComplete: (r: GameResult) => void;
  level: number;
  onLevelChange: (stars: number) => void;
  onQuestionChange?: (q: string, opts?: string[]) => void;
}) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);

  const [state, setState] = useState(() => {
    const initialQ = generateQ(level);
    return {
      q: initialQ,
      options: makeOptions(initialQ.answer)
    };
  });
  const { q, options } = state;

  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`${q.q} = ?`, options.map(String)); }, [q, options, onQuestionChange]);

  function pick(opt: number) {
    if (feedback) return;
    setChosen(opt);
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const nc = correct + (isCorrect ? 1 : 0);
    setTimeout(() => {
      setFeedback(null); setChosen(null);
      const nr = round + 1;
      if (nr >= TOTAL) {
        const score = Math.round((nc / TOTAL) * 100);
        const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
        onLevelChange(stars);
        onComplete({ score, correct: nc, total: TOTAL, stars });
      } else {
        setRound(nr);
        setCorrect(nc);
        const nq = generateQ(level);
        setState({
          q: nq,
          options: makeOptions(nq.answer)
        });
      }
    }, 800);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-sm mx-auto">
      <div className="flex justify-between w-full items-center">
        <p className="text-xs text-muted-foreground font-semibold">Q {round + 1}/{TOTAL} · ⭐ {correct}</p>
        <LevelBadge level={level} />
      </div>
      <motion.div key={q.q} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-primary text-primary-foreground rounded-2xl px-10 py-6 text-center shadow-lg w-full relative">
        <p className="text-5xl font-black">{q.q} = ?</p>
        <ArchieGameHelper className="absolute -right-4 -top-4" />
      </motion.div>
      <AnimatePresence>
        {feedback && (
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
            className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? '✅ Correct!' : `❌ Answer: ${q.answer}`}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((opt) => {
          const isChosen = chosen === opt; const isCorrect = opt === q.answer;
          let cls = 'bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5';
          if (feedback && isChosen && feedback === 'correct') cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback && isChosen && feedback === 'wrong') cls = 'bg-red-500 border-red-500 text-white';
          else if (feedback && isCorrect) cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback) cls = 'bg-muted border-border text-muted-foreground opacity-50';
          return (
            <motion.button key={opt} whileHover={!feedback ? { scale: 1.04 } : {}} whileTap={!feedback ? { scale: 0.96 } : {}}
              onClick={() => pick(opt)} disabled={!!feedback}
              className={`py-5 rounded-2xl text-3xl font-black shadow-sm transition-all ${cls}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function DivisionDash() {
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
        <title>Division Dash — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Divide the numbers as fast as you can! Adaptive difficulty from Level 1 to 5." />
        <link rel="canonical" href="https://sodafom.uk/games/division-dash" />
        <meta property="og:title" content="Division Dash — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Division Dash — Maths Game for Kids — Sodafom
      </h1>
      <GameShell title="Division Dash" emoji="➗" subject="maths" ageGroups={['8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => loading ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground font-bold">Loading your level…</p></div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {levelToast && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
              <LevelBadge level={displayLevel} showToast={levelToast} onToastDone={() => setLevelToast(null)} />
            </div>}
            <DivisionInner onComplete={onComplete} level={displayLevel} onLevelChange={handleLevelChange} onQuestionChange={setCurrentQuestion} />
          </div>
        )}
      </GameShell>
    </>
  );
}
