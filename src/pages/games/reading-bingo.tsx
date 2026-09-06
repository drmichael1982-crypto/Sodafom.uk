import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';

const ITEMS = [
  'A book with a blue cover','A book about animals','A book set in another country',
  'A book with more than 100 pages','A book that made you laugh','A book with a mystery',
  'A book about history','A book with a map inside','A book by a female author',
  'A book about science','A book with a twist ending','A book you read in one sitting',
  'A book with a dragon or magical creature','A book about friendship','A book set in the future',
  'A book that taught you something new',
];

function BingoInner({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const [grid] = useState(() => ITEMS.sort(() => Math.random() - 0.5).slice(0, 9));
  const [ticked, setTicked] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  useEffect(() => { onQuestionChange?.('Tick off the books you have read to get a line of three!'); }, [onQuestionChange]);

  function toggle(i: number) {
    if (done) return;
    const next = new Set(ticked);
    if (next.has(i)) next.delete(i); else next.add(i);
    setTicked(next);
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ];
    const hasBingo = lines.some(l => l.every(idx => next.has(idx)));
    if (hasBingo) {
      setDone(true);
      setTimeout(() => onComplete({ score: 90, correct: 9, total: 9, stars: 3 }), 1500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4 max-w-sm mx-auto">
      <p className="font-black text-lg text-center">Reading Bingo</p>
      <p className="text-sm text-muted-foreground text-center">Tick off books you have read to get a line!</p>
      <div className="grid grid-cols-3 gap-2 w-full">
        {grid.map((item, i) => (
          <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => toggle(i)}
            className={`p-2 rounded-xl text-xs font-bold border-2 transition-all min-h-[70px] ${
              ticked.has(i) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary'
            }`}>
            {ticked.has(i) && <span className="block text-lg mb-1">✓</span>}
            {item}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {done && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
          className="text-2xl font-black text-primary">🎉 BINGO!</motion.p>}
      </AnimatePresence>
      <p className="text-xs text-muted-foreground">{ticked.size} ticked — get a line of 3 to win!</p>
    </div>
  );
}

export default function ReadingBingo() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Reading Bingo — Sodafom</title>
        <meta name="description" content="Play reading bingo! Tick off books you have read to complete a line." />
        <link rel="canonical" href="https://sodafom.uk/games/reading-bingo" />
        <meta property="og:title" content="Reading Bingo — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Reading Bingo — Reading Game for Kids — Sodafom
      </h1>
      <GameShell title="Reading Bingo" emoji="🎰" subject="reading" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(oc) => <BingoInner onComplete={oc} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
