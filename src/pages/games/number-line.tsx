import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

const TOTAL = 10;

function generateQ(tier: 1 | 2 | 3) {
  const max = tier === 1 ? 20 : tier === 2 ? 100 : 1000;
  const answer = Math.floor(Math.random() * (max - 1)) + 1;
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const d = Math.floor(Math.random() * (max / 5)) + 1;
    const v = Math.max(1, answer + (Math.random() > 0.5 ? d : -d));
    if (v !== answer && v <= max) opts.add(v);
  }
  return { max, answer, options: [...opts].sort((a, b) => a - b) };
}

function NumberLineInner({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const { tier } = useChildAge();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [q, setQ] = useState(() => generateQ(tier as 1 | 2 | 3));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => { onQuestionChange?.(`Where does the arrow point on a number line from 0 to ${q.max}?`); }, [q, onQuestionChange]);

  function pick(opt: number) {
    if (feedback) return;
    setChosen(opt);
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const nc = correct + (isCorrect ? 1 : 0);
    setTimeout(() => {
      setFeedback(null);
      setChosen(null);
      const nr = round + 1;
      if (nr >= TOTAL) {
        const score = Math.round((nc / TOTAL) * 100);
        onComplete({ score, correct: nc, total: TOTAL, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 });
      } else {
        setRound(nr);
        setCorrect(nc);
        setQ(generateQ(tier as 1 | 2 | 3));
      }
    }, 800);
  }

  const pct = (q.answer / q.max) * 100;

  return (
    <div className="flex flex-col items-center gap-8 p-4 max-w-md mx-auto">
      <p className="text-sm font-bold text-muted-foreground">Where does the arrow point on the number line?</p>
      <div className="w-full relative">
        <div className="w-full h-4 bg-muted rounded-full relative">
          <div className="absolute left-0 top-0 h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
          <motion.div key={q.answer} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="absolute -top-8 text-2xl" style={{ left: `calc(${pct}% - 12px)` }}>▼</motion.div>
        </div>
        <div className="flex justify-between mt-2 text-xs font-bold text-muted-foreground">
          <span>0</span><span>{q.max}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {q.options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.95 }} onClick={() => pick(opt)}
            className={`py-4 rounded-2xl font-black text-xl border-2 transition-all ${
              chosen === opt
                ? feedback === 'correct' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-secondary'
                : 'bg-card border-border hover:border-primary'
            }`}>
            {opt}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {feedback && (
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
            className={`text-xl font-black ${feedback === 'correct' ? 'text-primary' : 'text-secondary'}`}>
            {feedback === 'correct' ? '✅ Correct!' : `❌ It was ${q.answer}`}
          </motion.p>
        )}
      </AnimatePresence>
      <p className="text-xs text-muted-foreground">Question {round + 1} of {TOTAL}</p>
    </div>
  );
}

export default function NumberLine() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Number Line Jump — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Jump to the right position on the number line! Estimate and place numbers from 0–1000." />
        <link rel="canonical" href="https://sodafom.uk/games/number-line" />
        <meta property="og:title" content="Number Line Jump — Sodafom" />
        <meta property="og:description" content="Jump to the right position on the number line! Estimate and place numbers from 0–1000." />
        <meta property="og:url" content="https://sodafom.uk/games/number-line" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Number Line — Maths Game for Kids — Sodafom
      </h1>
      <GameShell title="Number Line Jump" emoji="📏" subject="maths" ageGroups={['5–7', '8–10']} currentQuestion={currentQuestion}>
        {(onComplete) => <NumberLineInner onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
