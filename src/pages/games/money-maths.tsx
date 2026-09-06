/**
 * /games/money-maths — UK coins and notes, making change, counting money
 * Ages 5–13 · Maths subject
 */
import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star, PoundSterling } from 'lucide-react';
import ArchieGameHelper from '@/components/games/ArchieGameHelper';

interface MoneyQ {
  question: string;
  visual: string; // emoji representation of coins/notes
  choices: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QUESTIONS: MoneyQ[] = [
  // Easy — counting coins
  { question: 'How much money is this?', visual: '1p + 1p + 1p + 1p + 1p', choices: ['5p', '4p', '6p', '3p'], answer: '5p', explanation: 'Five 1p coins = 5p', difficulty: 'easy' },
  { question: 'How much money is this?', visual: '10p + 5p + 2p', choices: ['17p', '15p', '12p', '20p'], answer: '17p', explanation: '10p + 5p + 2p = 17p', difficulty: 'easy' },
  { question: 'How much money is this?', visual: '50p + 20p + 10p', choices: ['80p', '70p', '90p', '75p'], answer: '80p', explanation: '50p + 20p + 10p = 80p', difficulty: 'easy' },
  { question: 'How much money is this?', visual: '£1 + 50p', choices: ['£1.50', '£1.05', '£2.00', '£1.25'], answer: '£1.50', explanation: '£1 + 50p = £1.50', difficulty: 'easy' },
  { question: 'How much money is this?', visual: '20p + 20p + 5p', choices: ['45p', '40p', '50p', '35p'], answer: '45p', explanation: '20p + 20p + 5p = 45p', difficulty: 'easy' },
  // Medium — making change
  { question: 'You buy a snack for 35p. You pay with 50p. How much change do you get?', visual: '50p → 35p', choices: ['15p', '25p', '10p', '20p'], answer: '15p', explanation: '50p − 35p = 15p change', difficulty: 'medium' },
  { question: 'A book costs £1.20. You pay with £2. How much change do you get?', visual: '£2 → £1.20', choices: ['80p', '60p', '90p', '70p'], answer: '80p', explanation: '£2.00 − £1.20 = 80p change', difficulty: 'medium' },
  { question: 'You buy a toy for £3.75. You pay with £5. How much change do you get?', visual: '£5 → £3.75', choices: ['£1.25', '£1.50', '£1.00', '£2.25'], answer: '£1.25', explanation: '£5.00 − £3.75 = £1.25 change', difficulty: 'medium' },
  { question: 'A drink costs 65p. You pay with £1. How much change do you get?', visual: '£1 → 65p', choices: ['35p', '45p', '25p', '40p'], answer: '35p', explanation: '£1.00 − 65p = 35p change', difficulty: 'medium' },
  { question: 'You have 3 × 20p coins. Can you buy something costing 55p?', visual: '20p + 20p + 20p = ?', choices: ['Yes, with 5p change', 'No, not enough', 'Yes, exact money', 'Yes, with 10p change'], answer: 'Yes, with 5p change', explanation: '3 × 20p = 60p. 60p − 55p = 5p change', difficulty: 'medium' },
  // Hard — totals and comparison
  { question: 'Which combination makes exactly £2.50?', visual: '£2.50 = ?', choices: ['£1 + £1 + 50p', '£1 + 50p + 50p', '£2 + 20p + 20p', '£1 + £1 + 20p + 20p'], answer: '£1 + £1 + 50p', explanation: '£1 + £1 + 50p = £2.50', difficulty: 'hard' },
  { question: 'A pencil costs 45p and a rubber costs 30p. How much do they cost together?', visual: '✏️ 45p + 🧹 30p', choices: ['75p', '65p', '80p', '70p'], answer: '75p', explanation: '45p + 30p = 75p', difficulty: 'hard' },
  { question: 'You have £5. You spend £2.60 on lunch and 85p on a drink. How much is left?', visual: '£5 − £2.60 − 85p', choices: ['£1.55', '£1.45', '£1.65', '£2.55'], answer: '£1.55', explanation: '£2.60 + 85p = £3.45. £5.00 − £3.45 = £1.55', difficulty: 'hard' },
  { question: 'Three friends each have £1.50. How much do they have altogether?', visual: '£1.50 × 3', choices: ['£4.50', '£3.50', '£4.00', '£5.00'], answer: '£4.50', explanation: '£1.50 × 3 = £4.50', difficulty: 'hard' },
  { question: 'A bag of crisps costs 60p. How many can you buy with £3?', visual: '£3 ÷ 60p', choices: ['5', '4', '6', '3'], answer: '5', explanation: '£3.00 ÷ 60p = 5 bags', difficulty: 'hard' },
];



const TOTAL = 10;

function MoneyMathsInner({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string, opts?: string[]) => void }) {
  const [questions] = useState<MoneyQ[]>(() => {
    const easy = QUESTIONS.filter(q => q.difficulty === 'easy').sort(() => Math.random() - 0.5).slice(0, 3);
    const medium = QUESTIONS.filter(q => q.difficulty === 'medium').sort(() => Math.random() - 0.5).slice(0, 4);
    const hard = QUESTIONS.filter(q => q.difficulty === 'hard').sort(() => Math.random() - 0.5).slice(0, 3);
    return [...easy, ...medium, ...hard].sort(() => Math.random() - 0.5);
  });
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);

  const q = questions[qIdx];

  // Report to Archie
  useEffect(() => {
    onQuestionChange?.(q.question, q.choices);
  }, [qIdx, q, onQuestionChange]);

  const handleAnswer = (choice: string) => {
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
  };

  const progress = (qIdx / TOTAL) * 100;
  const phase = selected === null ? 'answering' : selected === q.answer ? 'correct' : 'wrong';
  const diffColour = q.difficulty === 'easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

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
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 px-6 py-4 flex items-center gap-3">
            <PoundSterling size={22} className="text-white shrink-0" />
            <div className="flex-1">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Money Maths</p>
              <p className="text-white font-black text-sm">UK Coins &amp; Notes</p>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${diffColour}`}>{q.difficulty}</span>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Visual */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-4 text-center">
              <p className="text-2xl font-black text-amber-800 tracking-wide">{q.visual}</p>
            </div>

            {/* Question */}
            <div className="flex items-center gap-4">
              <p className="flex-1 text-base font-black text-foreground text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                {q.question}
              </p>
              <ArchieGameHelper />
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-3">
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
                    whileHover={selected === null ? { scale: 1.04 } : {}}
                    whileTap={selected === null ? { scale: 0.96 } : {}}
                    onClick={() => handleAnswer(c)}
                    disabled={selected !== null}
                    className={`py-3.5 px-3 rounded-2xl border-2 font-black text-base transition-all flex items-center justify-center gap-1.5 ${style}`}
                  >
                    {selected !== null && c === q.answer && <CheckCircle2 size={14} className="text-green-600 shrink-0" />}
                    {selected !== null && c === selected && c !== q.answer && <XCircle size={14} className="text-red-500 shrink-0" />}
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
                  className={`flex items-start gap-2 rounded-2xl px-4 py-3 ${phase === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                >
                  {phase === 'correct'
                    ? <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
                  <p className={`font-bold text-sm ${phase === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {phase === 'correct' ? '✓ Correct! ' : `The answer is ${q.answer}. `}{q.explanation}
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

export default function MoneyMathsGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');

  return (
    <>
      <Helmet>
        <title>Money Maths — Sodafom | Maths Games for Kids</title>
        <meta name="description" content="Count UK coins and notes, make change, and solve money problems! A fun maths game for children aged 5–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/money-maths" />
        <meta property="og:title" content="Money Maths — Sodafom" />
        <meta property="og:description" content="Count UK coins and notes, make change, and solve money problems!" />
        <meta property="og:url" content="https://sodafom.uk/games/money-maths" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Money Maths — UK Coins and Notes Game for Kids — Sodafom</h1>
      <GameShell title="Money Maths" emoji="💰" subject="maths" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => <MoneyMathsInner onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
