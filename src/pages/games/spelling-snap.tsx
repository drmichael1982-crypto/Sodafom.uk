import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';

const PAIRS = [
  ['their','there'],['affect','effect'],['accept','except'],['weather','whether'],
  ['principal','principle'],['stationary','stationery'],['complement','compliment'],
  ['desert','dessert'],['practice','practise'],['licence','license'],
];

function SnapInner({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);

  const [sentence, setSentence] = useState(() => {
    const p = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    return { pair: p, answer: p[Math.floor(Math.random() * 2)] };
  });
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const TOTAL = 10;

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`Choose the correct word: ${sentence.pair.join(' or ')}?`); }, [sentence, onQuestionChange]);

  function pick(word: string) {
    if (feedback) return;
    const isCorrect = word === sentence.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const nc = correct + (isCorrect ? 1 : 0);
    setTimeout(() => {
      setFeedback(null);
      const nr = round + 1;
      if (nr >= TOTAL) {
        const score = Math.round((nc / TOTAL) * 100);
        onComplete({ score, correct: nc, total: TOTAL, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 });
      } else {
        setRound(nr);
        setCorrect(nc);
        const p = PAIRS[Math.floor(Math.random() * PAIRS.length)];
        setSentence({ pair: p, answer: p[Math.floor(Math.random() * 2)] });
      }
    }, 800);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-sm mx-auto">
      <p className="text-sm font-bold text-muted-foreground text-center">Which spelling is correct for this context?</p>
      <motion.div key={round} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-border rounded-2xl p-5 w-full text-center">
        <p className="text-lg font-bold">Choose the correct word from this pair:</p>
        <p className="text-2xl font-black text-primary mt-2">{sentence.pair[0]} / {sentence.pair[1]}</p>
        <p className="text-sm text-muted-foreground mt-2">The correct answer is: <strong>{sentence.answer}</strong></p>
      </motion.div>
      <div className="flex gap-3 w-full">
        {sentence.pair.map(word => (
          <motion.button key={word} whileTap={{ scale: 0.95 }} onClick={() => pick(word)}
            className="flex-1 py-4 rounded-2xl font-black text-lg border-2 border-border bg-card hover:border-primary transition-all">
            {word}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
          className={`text-xl font-black ${feedback === 'correct' ? 'text-primary' : 'text-secondary'}`}>
          {feedback === 'correct' ? '✅ Correct!' : `❌ It was "${sentence.answer}"`}
        </motion.p>}
      </AnimatePresence>
      <p className="text-xs text-muted-foreground">Round {round + 1}/{TOTAL}</p>
    </div>
  );
}

export default function SpellingSnap() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Spelling Snap — Sodafom</title>
        <meta name="description" content="Snap the correct spelling from confusable word pairs. their/there, affect/effect and more!" />
        <link rel="canonical" href="https://sodafom.uk/games/spelling-snap" />
        <meta property="og:title" content="Spelling Snap — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Spelling Snap — Spelling Game for Kids — Sodafom
      </h1>
      <GameShell title="Spelling Snap" emoji="🃏" subject="spelling" ageGroups={['8–10', '11–13']} currentQuestion={currentQuestion}>
        {(oc) => <SnapInner onComplete={oc} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
