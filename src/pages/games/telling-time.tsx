/**
 * /games/telling-time — read analogue and digital clocks (maths, ages 5–10)
 * Ages 5–10 · Maths subject
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star, Clock } from 'lucide-react';

interface TimeQ {
  hours: number;   // 1–12
  minutes: number; // 0, 15, 30, 45 (or 5-min increments for harder)
  displayLabel: string; // e.g. "3:00", "half past 4"
  choices: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

function buildQuestions(): TimeQ[] {
  return [
    // Easy — o'clock and half past
    { hours: 3, minutes: 0,  displayLabel: '3 o\'clock',    choices: ['3 o\'clock', '6 o\'clock', 'Half past 3', 'Quarter past 3'], answer: '3 o\'clock',    difficulty: 'easy' },
    { hours: 7, minutes: 0,  displayLabel: '7 o\'clock',    choices: ['7 o\'clock', 'Half past 7', 'Quarter to 7', '8 o\'clock'], answer: '7 o\'clock',    difficulty: 'easy' },
    { hours: 2, minutes: 30, displayLabel: 'Half past 2',   choices: ['Half past 2', '2 o\'clock', 'Quarter past 2', 'Half past 3'], answer: 'Half past 2',   difficulty: 'easy' },
    { hours: 9, minutes: 30, displayLabel: 'Half past 9',   choices: ['Half past 9', '9 o\'clock', 'Quarter to 10', 'Half past 10'], answer: 'Half past 9',   difficulty: 'easy' },
    { hours: 12, minutes: 0, displayLabel: '12 o\'clock',   choices: ['12 o\'clock', 'Half past 12', '6 o\'clock', 'Quarter past 12'], answer: '12 o\'clock', difficulty: 'easy' },
    // Medium — quarter past and quarter to
    { hours: 4, minutes: 15, displayLabel: 'Quarter past 4', choices: ['Quarter past 4', 'Quarter to 4', 'Half past 4', '4 o\'clock'], answer: 'Quarter past 4', difficulty: 'medium' },
    { hours: 8, minutes: 45, displayLabel: 'Quarter to 9',   choices: ['Quarter to 9', 'Quarter past 8', 'Half past 8', 'Quarter to 8'], answer: 'Quarter to 9',   difficulty: 'medium' },
    { hours: 11, minutes: 15, displayLabel: 'Quarter past 11', choices: ['Quarter past 11', 'Quarter to 11', '11 o\'clock', 'Half past 11'], answer: 'Quarter past 11', difficulty: 'medium' },
    { hours: 6, minutes: 45, displayLabel: 'Quarter to 7',   choices: ['Quarter to 7', 'Quarter past 6', 'Half past 6', 'Quarter to 6'], answer: 'Quarter to 7',   difficulty: 'medium' },
    // Hard — 5-minute intervals
    { hours: 5, minutes: 20, displayLabel: 'Twenty past 5',  choices: ['Twenty past 5', 'Twenty to 5', 'Quarter past 5', 'Twenty past 6'], answer: 'Twenty past 5',  difficulty: 'hard' },
    { hours: 10, minutes: 40, displayLabel: 'Twenty to 11',  choices: ['Twenty to 11', 'Twenty past 10', 'Quarter to 11', 'Twenty to 10'], answer: 'Twenty to 11',  difficulty: 'hard' },
    { hours: 1, minutes: 25, displayLabel: 'Twenty-five past 1', choices: ['Twenty-five past 1', 'Twenty-five to 2', 'Quarter past 1', 'Twenty-five past 2'], answer: 'Twenty-five past 1', difficulty: 'hard' },
    { hours: 3, minutes: 50, displayLabel: 'Ten to 4',       choices: ['Ten to 4', 'Ten past 3', 'Quarter to 4', 'Ten to 3'], answer: 'Ten to 4',       difficulty: 'hard' },
    { hours: 7, minutes: 35, displayLabel: 'Twenty-five to 8', choices: ['Twenty-five to 8', 'Twenty-five past 7', 'Half past 7', 'Twenty-five to 7'], answer: 'Twenty-five to 8', difficulty: 'hard' },
    { hours: 9, minutes: 10, displayLabel: 'Ten past 9',     choices: ['Ten past 9', 'Ten to 9', 'Quarter past 9', 'Ten past 10'], answer: 'Ten past 9',     difficulty: 'hard' },
  ];
}

// SVG analogue clock face
function AnalogClock({ hours, minutes }: { hours: number; minutes: number }) {
  const cx = 80, cy = 80, r = 72;
  // Minute hand angle: 0 min = 12 o'clock = -90deg
  const minAngle = (minutes / 60) * 360 - 90;
  // Hour hand angle: includes partial hour from minutes
  const hourAngle = ((hours % 12 + minutes / 60) / 12) * 360 - 90;

  const toXY = (angleDeg: number, length: number) => ({
    x: cx + length * Math.cos((angleDeg * Math.PI) / 180),
    y: cy + length * Math.sin((angleDeg * Math.PI) / 180),
  });

  const minTip = toXY(minAngle, 55);
  const hourTip = toXY(hourAngle, 38);

  // Hour markers
  const markers = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 360 - 90;
    const inner = toXY(a, 60);
    const outer = toXY(a, 68);
    const numPos = toXY(a, 50);
    return { inner, outer, numPos, label: i === 0 ? 12 : i };
  });

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-lg">
      {/* Face */}
      <circle cx={cx} cy={cy} r={r} fill="white" stroke="hsl(var(--border))" strokeWidth="3" />
      {/* Hour markers */}
      {markers.map((m, i) => (
        <g key={i}>
          <line x1={m.inner.x} y1={m.inner.y} x2={m.outer.x} y2={m.outer.y} stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
          <text x={m.numPos.x} y={m.numPos.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="bold" fill="hsl(var(--foreground))" fontFamily="var(--font-heading)">
            {m.label}
          </text>
        </g>
      ))}
      {/* Minute hand */}
      <motion.line
        x1={cx} y1={cy}
        x2={minTip.x} y2={minTip.y}
        stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      />
      {/* Hour hand */}
      <motion.line
        x1={cx} y1={cy}
        x2={hourTip.x} y2={hourTip.y}
        stroke="hsl(var(--foreground))" strokeWidth="5" strokeLinecap="round"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
      />
      {/* Centre dot */}
      <circle cx={cx} cy={cy} r="5" fill="hsl(var(--primary))" />
    </svg>
  );
}

const TOTAL = 10;

function TellingTimeInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<TimeQ[]>(() => {
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

  // Digital time string
  const digitalTime = `${q.hours}:${String(q.minutes).padStart(2, '0')}`;

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
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 px-6 py-4 flex items-center gap-3">
            <Clock size={20} className="text-white shrink-0" />
            <div className="flex-1">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Telling the Time</p>
              <p className="text-white font-black text-sm">What time does the clock show?</p>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${diffColour}`}>{q.difficulty}</span>
          </div>

          <div className="px-6 py-5 flex flex-col items-center gap-4">
            {/* Clocks side by side */}
            <div className="flex items-center gap-6">
              {/* Analogue */}
              <div className="flex flex-col items-center gap-1">
                <AnalogClock hours={q.hours} minutes={q.minutes} />
                <p className="text-xs text-muted-foreground font-bold">Analogue</p>
              </div>
              {/* Digital */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-gray-900 rounded-2xl px-6 py-4 border-4 border-gray-700 shadow-inner">
                  <p className="text-4xl font-black text-green-400 tracking-widest" style={{ fontFamily: 'monospace' }}>
                    {digitalTime}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-bold">Digital</p>
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
                    whileHover={selected === null ? { scale: 1.04 } : {}}
                    whileTap={selected === null ? { scale: 0.96 } : {}}
                    onClick={() => handleAnswer(c)}
                    disabled={selected !== null}
                    className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 text-center ${style}`}
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
                  className={`w-full flex items-start gap-2 rounded-2xl px-4 py-3 ${phase === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                >
                  {phase === 'correct'
                    ? <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
                  <p className={`font-bold text-sm ${phase === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {phase === 'correct' ? `✓ Correct! The time is ${q.answer}.` : `The time is ${q.answer}.`}
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

export default function TellingTimeGame() {
  return (
    <>
      <Helmet>
        <title>Telling the Time — Sodafom | Maths Games for Kids</title>
        <meta name="description" content="Read analogue and digital clocks! O'clock, half past, quarter past and more. A fun maths game for children aged 5–10 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/telling-time" />
        <meta property="og:title" content="Telling the Time — Sodafom" />
        <meta property="og:description" content="Read analogue and digital clocks!" />
        <meta property="og:url" content="https://sodafom.uk/games/telling-time" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/telling-time#webpage',
          name: 'Telling the Time — Sodafom', url: 'https://sodafom.uk/games/telling-time',
          description: 'Read analogue and digital clocks. Maths game for children aged 5–10.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Telling the Time — Maths Game for Kids — Sodafom</h1>
      <GameShell title="Telling the Time" emoji="🕐" subject="maths" ageGroups={['5–7', '8–10']}>
        {(onComplete) => <TellingTimeInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
