/**
 * /games/number-bonds — Visual snap-block number bonds to 10 and 20
 * Ages 5–10 · Maths subject
 */
import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

type Target = 10 | 20;

interface Question {
  target: Target;
  given: number;
  answer: number;
  choices: number[];
}

function makeQuestion(target: Target): Question {
  const given = Math.floor(Math.random() * (target - 1)) + 1;
  const answer = target - given;
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const w = Math.floor(Math.random() * (target + 1));
    if (w !== answer) wrongs.add(w);
  }
  const choices = [answer, ...Array.from(wrongs)].sort(() => Math.random() - 0.5);
  return { target, given, answer, choices };
}

// Visual snap-block bar
function SnapBlocks({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.03, type: 'spring', stiffness: 400 }}
          className={`w-7 h-7 rounded-md border-2 ${
            i < filled
              ? `${color} border-current/40`
              : 'bg-muted border-border'
          }`}
        />
      ))}
    </div>
  );
}

const TOTAL = 12;

function NumberBondsInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [qIdx, setQIdx] = useState(0);

  const [question, setQuestion] = useState<Question>(() => makeQuestion(Math.random() > 0.5 ? 20 : 10));
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);

  const handleAnswer = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    const isRight = choice === question.answer;
    const newScore = isRight ? score + 10 : score;
    const newCorrect = isRight ? correct + 1 : correct;
    if (isRight) { setScore(newScore); setCorrect(newCorrect); }

    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= TOTAL) {
        const stars = newCorrect >= 11 ? 3 : newCorrect >= 8 ? 2 : newCorrect >= 4 ? 1 : 0;
        onComplete({ score: newScore, correct: newCorrect, total: TOTAL, stars, maxScore: TOTAL * 10, durationSeconds: 0 });
      } else {
        const newTarget: Target = Math.random() > 0.5 ? 20 : 10;
        setQIdx(next);
        setQuestion(makeQuestion(newTarget));
        setSelected(null);
      }
    }, 1200);
  };

  const progress = (qIdx / TOTAL) * 100;
  const q = question;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-4 py-6">
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
        <span className="text-xs font-black text-muted-foreground">{qIdx + 1}/{TOTAL}</span>
        <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2.5 py-1">
          <Star size={13} className="text-accent fill-accent" />
          <span className="text-xs font-black text-foreground">{score}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full bg-card rounded-3xl border-2 border-border shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="hero-bg px-6 py-5 text-center">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">Number bonds to {q.target}</p>
            <p className="text-white font-black text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
              {q.given} + ? = {q.target}
            </p>
          </div>

          <div className="px-5 py-5 flex flex-col items-center gap-5">
            {/* Visual blocks */}
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">Given</p>
                <SnapBlocks filled={q.given} total={q.target} color="bg-primary text-primary" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">Missing</p>
                <SnapBlocks filled={0} total={q.answer} color="bg-accent text-accent" />
              </div>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {q.choices.map((c) => {
                let style = 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground';
                if (selected !== null) {
                  if (c === q.answer) style = 'bg-green-100 border-green-500 text-green-800';
                  else if (c === selected) style = 'bg-red-100 border-red-400 text-red-800';
                  else style = 'bg-muted border-border text-muted-foreground';
                }
                return (
                  <motion.button
                    key={c}
                    whileHover={selected === null ? { scale: 1.05 } : {}}
                    whileTap={selected === null ? { scale: 0.95 } : {}}
                    onClick={() => handleAnswer(c)}
                    disabled={selected !== null}
                    className={`py-5 rounded-2xl border-2 font-black text-3xl transition-all ${style}`}
                  >
                    {c}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`w-full flex items-center gap-2 rounded-2xl px-4 py-3 ${
                    selected === q.answer ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                  }`}
                >
                  {selected === q.answer
                    ? <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    : <XCircle size={16} className="text-red-500 shrink-0" />
                  }
                  <p className={`font-black text-sm ${selected === q.answer ? 'text-green-800' : 'text-red-800'}`}>
                    {selected === q.answer
                      ? `🎉 ${q.given} + ${q.answer} = ${q.target}!`
                      : `The answer is ${q.answer}. ${q.given} + ${q.answer} = ${q.target}`
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function NumberBondsGame() {
  return (
    <>
      <Helmet>
        <title>Number Bonds — Sodafom | Maths Games for Kids</title>
        <meta name="description" content="Learn number bonds to 10 and 20 with colourful snap blocks! A visual maths game for children aged 5–10 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/number-bonds" />
        <meta property="og:title" content="Number Bonds — Sodafom" />
        <meta property="og:description" content="Learn number bonds to 10 and 20 with colourful snap blocks!" />
        <meta property="og:url" content="https://sodafom.uk/games/number-bonds" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/number-bonds#webpage',
          name: 'Number Bonds — Sodafom', url: 'https://sodafom.uk/games/number-bonds',
          description: 'Visual number bonds to 10 and 20 maths game for children aged 5–10.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Number Bonds — Maths Game for Kids — Sodafom</h1>
      <GameShell title="Number Bonds" emoji="🧩" subject="maths" ageGroups={['5–7', '8–10']}>
        {(onComplete) => <NumberBondsInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
