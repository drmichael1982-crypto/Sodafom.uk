import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';
import ArchieGameHelper from '@/components/games/ArchieGameHelper';

function generateCard(tier: 1 | 2 | 3): number[] {
  const nums = new Set<number>();
  const max = tier === 1 ? 10 : tier === 2 ? 25 : 64;
  while (nums.size < 16) nums.add(Math.floor(Math.random() * max) + 1);
  return [...nums].sort((a, b) => a - b);
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

function BingoInner({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string, opts?: string[]) => void }) {
  const { tier } = useChildAge();
  const [card] = useState(() => generateCard(tier as 1 | 2 | 3));
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState<{ q: string; answer: number } | null>(null);
  const [bingo, setBingo] = useState(false);
  const [round, setRound] = useState(0);

  const nextQuestion = useCallback(() => {
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
    onQuestionChange?.(`${qText} = ?`, card.map(String));
  }, [tier, card, marked, onQuestionChange]);

  useEffect(() => { nextQuestion(); }, [nextQuestion]);

  function checkBingo(m: Set<number>): boolean {
    const rows = [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]];
    const cols = [[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]];
    return [...rows, ...cols].some(line => line.every(i => m.has(card[i])));
  }

  function handleMark(num: number) {
    if (!current || num !== current.answer) return;
    const next = new Set(marked);
    next.add(num);
    setMarked(next);
    const newRound = round + 1;
    setRound(newRound);
    if (checkBingo(next)) {
      setBingo(true);
      const score = Math.round((next.size / 16) * 100);
      setTimeout(() => onComplete({ score, correct: next.size, total: 16, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 }), 1500);
    } else if (newRound >= 20) {
      const score = Math.round((next.size / 16) * 100);
      onComplete({ score, correct: next.size, total: 16, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 });
    } else {
      nextQuestion();
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-lg mx-auto">
      {current && (
        <motion.div key={current.q} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-primary text-primary-foreground rounded-2xl px-8 py-4 text-center shadow-lg relative">
          <p className="text-xs font-bold opacity-70 mb-1">Solve it — then tap the answer on your card!</p>
          <p className="text-4xl font-black">{current.q} = ?</p>
          <ArchieGameHelper className="absolute -right-4 -top-4" />
        </motion.div>
      )}
      <div className="grid grid-cols-4 gap-2 w-full">
        {card.map((num, i) => (
          <motion.button key={i} whileTap={{ scale: 0.9 }}
            onClick={() => handleMark(num)}
            className={`aspect-square rounded-xl text-lg font-black border-2 transition-all ${
              marked.has(num)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:border-primary'
            }`}>
            {marked.has(num) ? '✓' : num}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {bingo && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl font-black text-primary text-center">
            🎱 BINGO!
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-xs text-muted-foreground">Question {round + 1} of 20</p>
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
