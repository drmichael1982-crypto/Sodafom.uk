import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

export function generateCard(tier: 1 | 2 | 3): number[] {
  const max = tier === 1 ? 10 : tier === 2 ? 25 : 64;
  // A 3×3 card keeps young learners within 10. Shuffle a finite pool so
  // generation also finishes when random values repeat.
  const size = tier === 1 ? 9 : 16;
  const pool = Array.from({ length: max }, (_, index) => index + 1);
  for (let index = pool.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[other]] = [pool[other], pool[index]];
  }
  return pool.slice(0, size).sort((a, b) => a - b);
}

export function hasBingo(card: number[], marked: Set<number>): boolean {
  const side = Math.sqrt(card.length);
  const rows = Array.from({ length: side }, (_, row) =>
    Array.from({ length: side }, (_, column) => row * side + column));
  const columns = Array.from({ length: side }, (_, column) =>
    Array.from({ length: side }, (_, row) => row * side + column));
  return [...rows, ...columns].some(line => line.every(index => marked.has(card[index])));
}

function generateQuestionForAnswer(answer: number, tier: 1 | 2 | 3): string {
  if (tier === 1 || (tier === 2 && Math.random() < 0.6)) {
    const a = Math.floor(Math.random() * (answer - 1)) + 1;
    return `${a} + ${answer - a}`;
  }
  if (tier === 2) {
    const b = Math.floor(Math.random() * 10) + 1;
    return `${answer + b} - ${b}`;
  }
  // Tier 3: maybe multiplication
  const factors = [];
  for (let i = 2; i <= 12; i++) {
    if (answer % i === 0 && answer / i <= 12) factors.push(i);
  }
  if (factors.length > 0 && Math.random() < 0.7) {
    const f = factors[Math.floor(Math.random() * factors.length)];
    return `${f} × ${answer / f}`;
  }
  const b = Math.floor(Math.random() * 20) + 1;
  return Math.random() < 0.5 ? `${answer + b} - ${b}` : `${answer - b} + ${b}`;
}

export function BingoInner({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string, opts?: string[]) => void }) {
  const { tier } = useChildAge();
  const [card] = useState(() => generateCard(tier as 1 | 2 | 3));
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState<{ q: string; answer: number } | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const bingo = result !== null;
  const [round, setRound] = useState(0);
  const [firstCorrect, setFirstCorrect] = useState(0);
  const [retried, setRetried] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => onComplete(result), 1500);
    return () => clearTimeout(timer);
  }, [result, onComplete]);

  const nextQuestion = useCallback(() => {
    if (bingo) return;
    // Pick an unmarked number from the card to ensure it exists!
    const unmarked = card.filter(n => !marked.has(n));
    const target = unmarked.length > 0
      ? unmarked[Math.floor(Math.random() * unmarked.length)]
      : card[Math.floor(Math.random() * card.length)];

    const qText = generateQuestionForAnswer(target, tier as 1 | 2 | 3);
    setCurrent({
      q: qText,
      answer: target
    });
    setRetried(false);
    setFeedback('');
    setShowHint(false);
    onQuestionChange?.(`${qText} = ?`, card.map(String));
  }, [tier, card, marked, bingo, onQuestionChange]);

  useEffect(() => { nextQuestion(); }, [nextQuestion]);

  function handleMark(num: number) {
    if (!current || bingo || paused || marked.has(num)) return;
    if (num !== current.answer) {
      setRetried(true);
      setFeedback('Good try. Use a hint or work out the sum, then try another square.');
      return;
    }
    const next = new Set(marked);
    next.add(num);
    setMarked(next);
    const newRound = round + 1;
    setRound(newRound);
    const correct = firstCorrect + (retried ? 0 : 1);
    setFirstCorrect(correct);
    if (hasBingo(card, next)) {
      // Only presented questions count. An unused square is not a missed sum.
      const score = Math.round((correct / newRound) * 100);
      setResult({ score, correct, total: newRound, stars: score >= 90 ? 3 : score >= 75 ? 2 : score >= 50 ? 1 : 0 });
    }
  }

  const parts = current?.q.match(/^(\d+) ([+\-×]) (\d+)$/);
  const hint = parts ? parts[2] === '+'
    ? `Start at ${parts[1]} and count on ${parts[3]}.`
    : parts[2] === '-'
      ? `Start at ${parts[1]} and count back ${parts[3]}.`
      : `Try ${parts[1]} groups of ${parts[3]}. Count the total.` : 'Work through the sum one step at a time.';

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-lg mx-auto" role="region" aria-label="Bingo practice">
      <p className="text-center text-blue-950">Solve the sum, then tap its answer. Complete a row or column to make Bingo. Take a break whenever you need one.</p>
      {current && (
        <motion.div key={current.q} initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-blue-50 text-blue-950 border-2 border-blue-200 rounded-2xl px-6 py-4 text-center shadow-lg relative">
          <p className="text-xs font-bold opacity-70 mb-1">Solve it — then tap the answer on your card!</p>
          <p className="text-4xl font-black">{current.q} = ?</p>
        </motion.div>
      )}
      {!bingo && <div className="flex flex-wrap justify-center gap-3">
        <button className="min-h-12 rounded-xl bg-blue-700 text-white font-bold px-5 py-3" disabled={paused} onClick={() => setShowHint(true)}>Show a hint</button>
        <button className="min-h-12 rounded-xl border-2 border-blue-700 text-blue-950 bg-white font-bold px-5 py-3" onClick={() => setPaused(value => !value)}>{paused ? 'Resume Bingo' : 'Pause Bingo'}</button>
      </div>}
      <div className="w-full text-center text-blue-950" role="status" aria-live="polite">
        {paused ? <p>Paused. Your card and question are saved.</p> : <>{feedback && <p>{feedback}</p>}{showHint && <p>{hint}</p>}</>}
      </div>
      <div className="grid gap-2 w-full" style={{ gridTemplateColumns: `repeat(${Math.sqrt(card.length)}, minmax(0, 1fr))` }} aria-label="Bingo card">
        {card.map((num, i) => (
          <motion.button key={i} whileTap={reducedMotion ? undefined : { scale: 0.9 }}
            onClick={() => handleMark(num)}
            disabled={bingo || paused || marked.has(num)}
            aria-label={`Bingo number ${num}${marked.has(num) ? ', marked' : ''}`}
            className={`aspect-square rounded-xl text-lg font-black border-2 transition-all ${
              marked.has(num)
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-card border-border hover:border-primary'
            }`}>
            {marked.has(num) ? '✓' : num}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {bingo && (
          <motion.div initial={reducedMotion ? false : { scale: 0 }} animate={{ scale: 1 }} className="text-4xl font-black text-blue-950 text-center">
            🎱 BINGO!
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-sm text-blue-950">{bingo ? `You solved ${round} sums and completed a line.` : `Question ${round + 1} · Complete a row or column`}</p>
    </div>
  );
}

export default function MathsBingo() {
  const [currentQuestion, setCurrentQuestion] = useState('');

  return (
    <>
      <Helmet>
        <title>Maths Bingo — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Mark off answers on your bingo card as maths sums are called out. First to BINGO wins!" />
        <link rel="canonical" href="https://sodafom.uk/games/maths-bingo" />
        <meta property="og:title" content="Maths Bingo — Sodafom" />
        <meta property="og:description" content="Mark off answers on your bingo card as maths sums are called out. First to BINGO wins!" />
        <meta property="og:url" content="https://sodafom.uk/games/maths-bingo" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Maths Bingo — Maths Game for Kids — Sodafom
      </h1>
      <GameShell title="Maths Bingo" emoji="🎱" subject="maths" ageGroups={['5–7', '8–10']} currentQuestion={currentQuestion}>
        {(onComplete) => <BingoInner onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
