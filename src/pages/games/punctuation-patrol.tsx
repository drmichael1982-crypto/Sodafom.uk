/**
 * /games/punctuation-patrol — Fix missing punctuation in sentences
 * Ages 8–13 · Spelling/Reading subject
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star, Shield } from 'lucide-react';

interface PuncQ {
  sentence: string;       // sentence with a gap marker «»
  choices: string[];      // punctuation options
  answer: string;
  explanation: string;
  category: string;
}

const QUESTIONS: PuncQ[] = [
  {
    sentence: 'The dog barked loudly«»',
    choices: ['.', '?', '!', ','],
    answer: '.',
    explanation: 'A full stop ends a statement sentence.',
    category: 'Full stop',
  },
  {
    sentence: 'What is your name«»',
    choices: ['!', '.', '?', ','],
    answer: '?',
    explanation: 'A question mark ends a question.',
    category: 'Question mark',
  },
  {
    sentence: 'Watch out«» there\'s a car!',
    choices: ['.', ',', '!', '?'],
    answer: ',',
    explanation: 'A comma separates two clauses in a sentence.',
    category: 'Comma',
  },
  {
    sentence: 'She shouted«» "Help me!"',
    choices: ['.', ',', '!', '?'],
    answer: ',',
    explanation: 'A comma is used before speech marks.',
    category: 'Comma',
  },
  {
    sentence: 'I love football«» it\'s my favourite sport.',
    choices: ['.', ';', '!', '?'],
    answer: ';',
    explanation: 'A semicolon links two closely related main clauses.',
    category: 'Semicolon',
  },
  {
    sentence: 'The cat«»s paw was muddy.',
    choices: ["'", '.', ',', '!'],
    answer: "'",
    explanation: "An apostrophe shows possession — the cat's paw.",
    category: 'Apostrophe',
  },
  {
    sentence: 'We visited Paris«» France last summer.',
    choices: ['.', ';', ',', '!'],
    answer: ',',
    explanation: 'A comma separates a city from its country.',
    category: 'Comma',
  },
  {
    sentence: 'He couldn«»t find his keys.',
    choices: ["'", '.', ',', '-'],
    answer: "'",
    explanation: "An apostrophe replaces the missing letter in a contraction — couldn't.",
    category: 'Apostrophe',
  },
  {
    sentence: 'Run«» the race has started!',
    choices: ['!', '.', ',', '?'],
    answer: '!',
    explanation: 'An exclamation mark can follow a command for emphasis.',
    category: 'Exclamation mark',
  },
  {
    sentence: 'She bought apples«» oranges and bananas.',
    choices: ['.', ';', ',', '!'],
    answer: ',',
    explanation: 'Commas separate items in a list.',
    category: 'Comma',
  },
  {
    sentence: 'The children«»s playground was new.',
    choices: ["'", '.', ',', ';'],
    answer: "'",
    explanation: "Children's uses an apostrophe for plural possession.",
    category: 'Apostrophe',
  },
  {
    sentence: 'It was raining«» however, we still went out.',
    choices: ['.', ';', ',', '!'],
    answer: ';',
    explanation: 'A semicolon before a conjunctive adverb like "however" links two clauses.',
    category: 'Semicolon',
  },
  {
    sentence: 'My favourite colours are red«» blue and green.',
    choices: [',', '.', '!', ';'],
    answer: ',',
    explanation: 'Commas separate items in a list.',
    category: 'Comma',
  },
  {
    sentence: 'He said«» "I will be there soon."',
    choices: [',', '.', '!', '?'],
    answer: ',',
    explanation: 'A comma introduces direct speech.',
    category: 'Comma',
  },
  {
    sentence: 'Don«»t forget your homework!',
    choices: ["'", '.', ',', ';'],
    answer: "'",
    explanation: "Don't is a contraction of 'do not' — the apostrophe replaces the missing 'o'.",
    category: 'Apostrophe',
  },
];

const TOTAL = 10;

// Renders the sentence with the gap highlighted
function SentenceDisplay({ sentence, chosen, phase }: { sentence: string; chosen: string | null; phase: 'answering' | 'correct' | 'wrong' }) {
  const parts = sentence.split('«»');
  const gapStyle = phase === 'correct'
    ? 'bg-green-200 text-green-800 border-green-500'
    : phase === 'wrong'
    ? 'bg-red-200 text-red-800 border-red-400'
    : chosen
    ? 'bg-primary/20 text-primary border-primary'
    : 'bg-muted border-dashed border-muted-foreground/50 text-muted-foreground';

  return (
    <p className="text-xl font-black text-foreground text-center leading-relaxed" style={{ fontFamily: 'var(--font-heading)' }}>
      {parts[0]}
      <span className={`inline-block min-w-[28px] px-1.5 py-0.5 rounded border-2 mx-0.5 transition-all ${gapStyle}`}>
        {chosen ?? '?'}
      </span>
      {parts[1]}
    </p>
  );
}

function PunctuationPatrolInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<PuncQ[]>(() =>
    [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL)
  );
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);

  const q = questions[qIdx];

  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
    const isRight = choice === q.answer;
    const newScore = isRight ? score + 10 : score;
    const newCorrect = isRight ? correct + 1 : correct;
    if (isRight) { setScore(newScore); setCorrect(newCorrect); }

    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= TOTAL) {
        const stars = newCorrect >= 9 ? 3 : newCorrect >= 6 ? 2 : newCorrect >= 3 ? 1 : 0;
        onComplete({ score: newScore, correct: newCorrect, total: TOTAL, stars, maxScore: TOTAL * 10, durationSeconds: 0 });
      } else {
        setQIdx(next);
        setSelected(null);
      }
    }, 1800);
  }, [selected, q.answer, score, correct, qIdx, onComplete]);

  const progress = (qIdx / TOTAL) * 100;
  const phase = selected === null ? 'answering' : selected === q.answer ? 'correct' : 'wrong';

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto px-4 py-6">
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
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 px-6 py-4 flex items-center gap-3">
            <Shield size={20} className="text-white shrink-0" />
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Punctuation Patrol</p>
              <p className="text-white font-black text-sm">{q.category}</p>
            </div>
          </div>

          <div className="px-6 py-6 flex flex-col items-center gap-5">
            {/* Sentence */}
            <div className="w-full bg-muted/40 rounded-2xl px-5 py-5 text-center">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-3">Add the missing punctuation</p>
              <SentenceDisplay sentence={q.sentence} chosen={selected} phase={phase} />
            </div>

            {/* Choices */}
            <div className="flex gap-3 justify-center flex-wrap">
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
                    whileHover={selected === null ? { scale: 1.1, y: -2 } : {}}
                    whileTap={selected === null ? { scale: 0.9 } : {}}
                    onClick={() => handleAnswer(c)}
                    disabled={selected !== null}
                    className={`w-16 h-16 rounded-2xl border-2 font-black text-3xl transition-all ${style}`}
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
                  className={`w-full flex items-start gap-2 rounded-2xl px-4 py-3 ${
                    phase === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {phase === 'correct'
                    ? <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  }
                  <p className={`font-bold text-sm ${phase === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {phase === 'correct' ? '✓ Correct! ' : `The answer is "${q.answer}". `}
                    {q.explanation}
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

export default function PunctuationPatrolGame() {
  return (
    <>
      <Helmet>
        <title>Punctuation Patrol — Sodafom | Spelling Games for Kids</title>
        <meta name="description" content="Fix the missing punctuation in sentences! Full stops, commas, apostrophes and more. A fun spelling and grammar game for children aged 8–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/punctuation-patrol" />
        <meta property="og:title" content="Punctuation Patrol — Sodafom" />
        <meta property="og:description" content="Fix the missing punctuation in sentences!" />
        <meta property="og:url" content="https://sodafom.uk/games/punctuation-patrol" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/punctuation-patrol#webpage',
          name: 'Punctuation Patrol — Sodafom', url: 'https://sodafom.uk/games/punctuation-patrol',
          description: 'Fix missing punctuation in sentences. Grammar game for children aged 8–13.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Punctuation Patrol — Spelling & Grammar Game for Kids — Sodafom</h1>
      <GameShell title="Punctuation Patrol" emoji="🛡️" subject="spelling" ageGroups={['8–10', '11–13']}>
        {(onComplete) => <PunctuationPatrolInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
