/**
 * /games/place-value — hundreds, tens and units with visual blocks (maths, ages 5–10)
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

interface PVQuestion {
  hundreds: number;
  tens: number;
  units: number;
  questionType: 'read' | 'build';
  choices: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

function buildQuestions(): PVQuestion[] {
  return [
    // Easy — units only
    { hundreds: 0, tens: 0, units: 7, questionType: 'read', choices: ['7', '70', '17', '700'], answer: '7', difficulty: 'easy' },
    { hundreds: 0, tens: 0, units: 3, questionType: 'read', choices: ['3', '30', '300', '13'], answer: '3', difficulty: 'easy' },
    // Easy — tens
    { hundreds: 0, tens: 4, units: 0, questionType: 'read', choices: ['40', '4', '400', '14'], answer: '40', difficulty: 'easy' },
    { hundreds: 0, tens: 2, units: 5, questionType: 'read', choices: ['25', '52', '205', '250'], answer: '25', difficulty: 'easy' },
    { hundreds: 0, tens: 3, units: 8, questionType: 'read', choices: ['38', '83', '308', '380'], answer: '38', difficulty: 'easy' },
    // Medium — hundreds
    { hundreds: 1, tens: 0, units: 0, questionType: 'read', choices: ['100', '10', '1', '1000'], answer: '100', difficulty: 'medium' },
    { hundreds: 2, tens: 3, units: 0, questionType: 'read', choices: ['230', '203', '23', '2300'], answer: '230', difficulty: 'medium' },
    { hundreds: 1, tens: 4, units: 6, questionType: 'read', choices: ['146', '164', '416', '461'], answer: '146', difficulty: 'medium' },
    { hundreds: 3, tens: 0, units: 5, questionType: 'read', choices: ['305', '350', '503', '530'], answer: '305', difficulty: 'medium' },
    // Hard — digit value questions
    { hundreds: 4, tens: 7, units: 2, questionType: 'read', choices: ['472', '427', '742', '724'], answer: '472', difficulty: 'hard' },
    { hundreds: 6, tens: 0, units: 9, questionType: 'read', choices: ['609', '690', '906', '960'], answer: '609', difficulty: 'hard' },
    { hundreds: 5, tens: 8, units: 3, questionType: 'read', choices: ['583', '538', '835', '853'], answer: '583', difficulty: 'hard' },
    { hundreds: 9, tens: 1, units: 0, questionType: 'read', choices: ['910', '901', '190', '109'], answer: '910', difficulty: 'hard' },
    { hundreds: 7, tens: 4, units: 6, questionType: 'read', choices: ['746', '764', '476', '674'], answer: '746', difficulty: 'hard' },
    { hundreds: 2, tens: 9, units: 7, questionType: 'read', choices: ['297', '279', '927', '972'], answer: '297', difficulty: 'hard' },
  ];
}

// Visual place-value blocks
function PlaceValueBlocks({ hundreds, tens, units }: { hundreds: number; tens: number; units: number }) {
  return (
    <div className="flex items-end justify-center gap-4 py-2">
      {/* Hundreds */}
      {hundreds > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-wrap gap-0.5 justify-center" style={{ maxWidth: '60px' }}>
            {Array.from({ length: hundreds }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="w-5 h-5 rounded-sm bg-blue-500 border border-blue-700 shadow-sm"
              />
            ))}
          </div>
          <span className="text-xs font-black text-blue-700">Hundreds</span>
          <span className="text-lg font-black text-blue-600">{hundreds}</span>
        </div>
      )}
      {/* Tens */}
      {tens > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: tens }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                className="w-4 h-5 rounded-sm bg-green-500 border border-green-700 shadow-sm"
              />
            ))}
          </div>
          <span className="text-xs font-black text-green-700">Tens</span>
          <span className="text-lg font-black text-green-600">{tens}</span>
        </div>
      )}
      {/* Units */}
      {units > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-wrap gap-0.5 justify-center" style={{ maxWidth: '40px' }}>
            {Array.from({ length: units }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.07, duration: 0.2 }}
                className="w-4 h-4 rounded-sm bg-orange-400 border border-orange-600 shadow-sm"
              />
            ))}
          </div>
          <span className="text-xs font-black text-orange-700">Units</span>
          <span className="text-lg font-black text-orange-600">{units}</span>
        </div>
      )}
      {/* Zero case */}
      {hundreds === 0 && tens === 0 && units === 0 && (
        <div className="text-4xl font-black text-muted-foreground">0</div>
      )}
    </div>
  );
}

const TOTAL = 10;

function PlaceValueInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<PVQuestion[]>(() => {
    const all = buildQuestions();
    const easy = all.filter(q => q.difficulty === 'easy').sort(() => Math.random() - 0.5).slice(0, 3);
    const medium = all.filter(q => q.difficulty === 'medium').sort(() => Math.random() - 0.5).slice(0, 4);
    const hard = all.filter(q => q.difficulty === 'hard').sort(() => Math.random() - 0.5).slice(0, 3);
    return [...easy, ...medium, ...hard];
  });
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
  const diffColour = q.difficulty === 'easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto px-4 py-6">
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
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">🔢</span>
            <div className="flex-1">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Place Value</p>
              <p className="text-white font-black text-sm">Hundreds, tens &amp; units</p>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${diffColour}`}>{q.difficulty}</span>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="text-base font-black text-foreground text-center" style={{ fontFamily: 'var(--font-heading)' }}>
              What number do these blocks show?
            </p>

            {/* Visual blocks */}
            <div className="bg-muted/30 rounded-2xl border border-border p-4">
              <PlaceValueBlocks hundreds={q.hundreds} tens={q.tens} units={q.units} />
            </div>

            {/* Column labels */}
            <div className="flex justify-center gap-6 text-xs font-black text-muted-foreground">
              <span className="text-blue-600">H = {q.hundreds}</span>
              <span className="text-green-600">T = {q.tens}</span>
              <span className="text-orange-600">U = {q.units}</span>
            </div>

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
                    className={`py-4 px-3 rounded-2xl border-2 font-black text-xl transition-all flex items-center justify-center gap-1.5 ${style}`}
                  >
                    {selected !== null && c === q.answer && <CheckCircle2 size={16} className="text-green-600 shrink-0" />}
                    {selected !== null && c === selected && c !== q.answer && <XCircle size={16} className="text-red-500 shrink-0" />}
                    {c}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${phase === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                >
                  {phase === 'correct'
                    ? <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    : <XCircle size={16} className="text-red-500 shrink-0" />}
                  <p className={`font-bold text-sm ${phase === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {phase === 'correct'
                      ? `✓ Correct! ${q.hundreds} hundreds + ${q.tens} tens + ${q.units} units = ${q.answer}`
                      : `The answer is ${q.answer}: ${q.hundreds}H + ${q.tens}T + ${q.units}U`}
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

export default function PlaceValueGame() {
  return (
    <>
      <Helmet>
        <title>Place Value — Sodafom | Maths Games for Kids</title>
        <meta name="description" content="Learn hundreds, tens and units with visual blocks! A fun place value maths game for children aged 5–10 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/place-value" />
        <meta property="og:title" content="Place Value — Sodafom" />
        <meta property="og:description" content="Learn hundreds, tens and units with visual blocks!" />
        <meta property="og:url" content="https://sodafom.uk/games/place-value" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/place-value#webpage',
          name: 'Place Value — Sodafom', url: 'https://sodafom.uk/games/place-value',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Place Value — Maths Game for Kids — Sodafom</h1>
      <GameShell title="Place Value" emoji="🔢" subject="maths" ageGroups={['5–7', '8–10']}>
        {(onComplete) => <PlaceValueInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
