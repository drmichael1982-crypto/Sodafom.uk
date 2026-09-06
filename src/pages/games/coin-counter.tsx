import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelBadge from '@/components/games/LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';

const SLUG = 'coin-counter';

const ALL_COINS = [
  { label: '1p', value: 1, emoji: '🟤' },
  { label: '2p', value: 2, emoji: '🟤' },
  { label: '5p', value: 5, emoji: '⚪' },
  { label: '10p', value: 10, emoji: '⚪' },
  { label: '20p', value: 20, emoji: '🟡' },
  { label: '50p', value: 50, emoji: '🟡' },
  { label: '£1', value: 100, emoji: '🥇' },
  { label: '£2', value: 200, emoji: '🥇' },
];

// Level 1: 1p/2p/5p, max 2 types, count≤3 | Level 5: all coins, 4 types, count≤5
function generatePurse(level: number): { coin: typeof ALL_COINS[0]; count: number }[] {
  const coinPool = level <= 1 ? ALL_COINS.slice(0, 3) : level <= 2 ? ALL_COINS.slice(0, 4) : level <= 3 ? ALL_COINS.slice(0, 5) : level <= 4 ? ALL_COINS.slice(0, 6) : ALL_COINS;
  const numTypes = level <= 1 ? 2 : level <= 3 ? 3 : 4;
  const maxCount = level <= 1 ? 3 : level <= 3 ? 4 : 5;
  const shuffled = [...coinPool].sort(() => Math.random() - 0.5).slice(0, numTypes);
  return shuffled.map(coin => ({ coin, count: Math.floor(Math.random() * maxCount) + 1 }));
}

function makeOptions(answer: number): number[] {
  const opts = new Set<number>([answer]);
  const candidates = [answer - 20, answer - 10, answer - 5, answer - 2, answer + 2, answer + 5, answer + 10, answer + 20, answer + 50];
  for (const c of candidates.sort(() => Math.random() - 0.5)) {
    if (c > 0 && c !== answer) { opts.add(c); if (opts.size === 4) break; }
  }
  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * 15) + 1;
    const c = answer + (Math.random() < 0.5 ? delta : -delta);
    if (c > 0) opts.add(c);
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

const TOTAL_ROUNDS = 8;

function CoinInner({ onComplete, level, onLevelChange, onQuestionChange }: {
  onComplete: (r: GameResult) => void;
  level: number;
  onLevelChange: (stars: number) => void;
  onQuestionChange?: (q: string) => void;
}) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [currentPurse, setCurrentPurse] = useState(() => generatePurse(level));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  const total = currentPurse.reduce((s, { coin, count }) => s + coin.value * count, 0);
  const [options, setOptions] = useState(() => makeOptions(total));

  // Report current question to Archie
  useEffect(() => {
    const displayTotal = total >= 100 ? `£${(total / 100).toFixed(2)}` : `${total}p`;
    onQuestionChange?.(`Count the coins — what is the total? (Answer: ${displayTotal})`);
  }, [total, onQuestionChange]);

  function pick(opt: number) {
    if (feedback) return;
    setChosen(opt);
    const isCorrect = opt === total;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const nc = correct + (isCorrect ? 1 : 0);
    setTimeout(() => {
      setFeedback(null); setChosen(null);
      const nr = round + 1;
      if (nr >= TOTAL_ROUNDS) {
        const score = Math.round((nc / TOTAL_ROUNDS) * 100);
        const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
        onLevelChange(stars);
        onComplete({ score, correct: nc, total: TOTAL_ROUNDS, stars });
      } else {
        setRound(nr); setCorrect(nc);
        const np = generatePurse(level);
        setCurrentPurse(np);
        const nt = np.reduce((s, { coin, count }) => s + coin.value * count, 0);
        setOptions(makeOptions(nt));
      }
    }, 900);
  }

  const displayTotal = total >= 100 ? `£${(total / 100).toFixed(2)}` : `${total}p`;

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">
      <div className="flex justify-between w-full items-center">
        <p className="text-xs text-muted-foreground font-semibold">Round {round + 1}/{TOTAL_ROUNDS} · ⭐ {correct}</p>
        <LevelBadge level={level} />
      </div>
      <div className="bg-card border-2 border-border rounded-2xl p-5 w-full">
        <p className="text-sm font-bold text-muted-foreground mb-3 text-center">Count the coins — what is the total?</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {currentPurse.map(({ coin, count }, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                {Array.from({ length: count }).map((_, j) => (
                  <motion.span key={j} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: j * 0.1 }} className="text-3xl">{coin.emoji}</motion.span>
                ))}
              </div>
              <span className="text-xs font-black text-muted-foreground">{coin.label} × {count}</span>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? `✅ Correct! ${displayTotal}` : `❌ It was ${displayTotal}`}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((opt) => {
          const isChosen = chosen === opt; const isCorrect = opt === total;
          let cls = 'bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5';
          if (feedback && isChosen && feedback === 'correct') cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback && isChosen && feedback === 'wrong') cls = 'bg-red-500 border-red-500 text-white';
          else if (feedback && isCorrect) cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback) cls = 'bg-muted border-border text-muted-foreground opacity-50';
          const displayOpt = opt >= 100 ? `£${(opt / 100).toFixed(2)}` : `${opt}p`;
          return (
            <motion.button key={opt} whileHover={!feedback ? { scale: 1.04 } : {}} whileTap={!feedback ? { scale: 0.96 } : {}}
              onClick={() => pick(opt)} disabled={!!feedback}
              className={`py-4 rounded-2xl text-2xl font-black shadow-sm transition-all ${cls}`}>
              {displayOpt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function CoinCounter() {
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
        <title>Coin Counter — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Count UK coins and find the total. Adaptive difficulty from 1p coins up to £2!" />
        <link rel="canonical" href="https://sodafom.uk/games/coin-counter" />
        <meta property="og:title" content="Coin Counter — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Coin Counter — Maths Game for Kids — Sodafom
      </h1>
      <GameShell title="Coin Counter" emoji="🪙" subject="maths" ageGroups={['5–7', '8–10']} currentQuestion={currentQuestion}>
        {(onComplete) => loading ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground font-bold">Loading your level…</p></div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {levelToast && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
              <LevelBadge level={displayLevel} showToast={levelToast} onToastDone={() => setLevelToast(null)} />
            </div>}
            <CoinInner onComplete={onComplete} level={displayLevel} onLevelChange={handleLevelChange} onQuestionChange={setCurrentQuestion} />
          </div>
        )}
      </GameShell>
    </>
  );
}
