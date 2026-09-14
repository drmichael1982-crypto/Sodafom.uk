import { ROUND_LENGTH, roundResult } from '@/lib/games/ten-question-round';
import { shapeRound } from '@/lib/games/shape-round-data';
import { useAnswerTransition } from '@/lib/games/use-answer-transition';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

const TOTAL_ROUNDS = ROUND_LENGTH;

export default function ShapeSorterGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Shape Sorter — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Sort shapes by colour, size and type! A fun maths and geometry game for children aged 5–10." />
        <link rel="canonical" href="https://sodafom.uk/games/shape-sorter" />
        <meta property="og:title" content="Shape Sorter — Sodafom" />
        <meta property="og:description" content="Sort shapes by colour, size and type! A fun maths and geometry game for children aged 5–10." />
        <meta property="og:url" content="https://sodafom.uk/games/shape-sorter" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shape Sorter — Sodafom" />
        <meta name="twitter:description" content="Sort shapes by colour, size and type! A fun maths and geometry game for children aged 5–10." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/shape-sorter#webpage","name":"Shape Sorter — Sodafom","url":"https://sodafom.uk/games/shape-sorter","description":"Sort shapes by colour, size and type! A fun maths and geometry game for children aged 5–10.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Shape Sorter — Maths Game for Kids — Sodafom
      </h1>

      <GameShell title="Shape Sorter" emoji="🔷" subject="maths" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => <ShapeSorterPlay onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}

export function ShapeSorterPlay({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const { tier } = useChildAge();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [questions] = useState(() => shapeRound(tier));
  const q = questions[round];
  const transition = useAnswerTransition();
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => { onQuestionChange?.(q.question); }, [q, onQuestionChange]);

  const pick = (opt: string) => {
    if (!transition.claim()) return;
    setChosen(opt);
    const isRight = opt === q.answer;
    if (isRight) setCorrect(c => c + 1);
    transition.schedule(() => {
      const next = round + 1;
      if (next >= TOTAL_ROUNDS) {
        const newCorrect = correct + (isRight ? 1 : 0);
        onComplete(roundResult(newCorrect));
      } else {
        setRound(next);
        transition.release();
        setChosen(null);
      }
    }, 900);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-background">
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
          <span>Round {round + 1}/{TOTAL_ROUNDS}</span>
          <span>⭐ {correct} correct</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <motion.div
        key={round}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-9xl mb-4 select-none"
      >
        {q.shape.emoji}
      </motion.div>

      <p className="text-xl font-black text-foreground mb-6 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        {q.question}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map(opt => {
          const isCorrect = opt === q.answer;
          const isChosen = opt === chosen;
          let bg = 'bg-card border-border hover:border-primary/50';
          if (chosen) {
            if (isCorrect) bg = 'bg-green-100 border-green-500';
            else if (isChosen) bg = 'bg-red-100 border-red-500';
          }
          return (
            <motion.button
              key={opt}
              whileHover={!chosen ? { scale: 1.04 } : {}}
              whileTap={!chosen ? { scale: 0.96 } : {}}
              disabled={chosen !== null}
              onClick={() => pick(opt)}
              className={`py-4 rounded-2xl font-black text-lg border-2 transition-all ${bg}`}
            >
              {opt}
              {chosen && isCorrect && ' ✅'}
              {chosen && isChosen && !isCorrect && ' ❌'}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
