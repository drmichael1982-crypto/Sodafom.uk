/**
 * /games/science-lab — Cause-and-effect science experiment quiz
 * Ages 5–13 · Science subject
 */
import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star, FlaskConical } from 'lucide-react';

// ── Question bank ─────────────────────────────────────────────────────────────
interface ScienceQ {
  emoji: string;
  question: string;
  choices: string[];
  answer: number; // index
  explanation: string;
  category: string;
}

const QUESTIONS: ScienceQ[] = [
  {
    emoji: '🌱',
    question: 'What happens to a plant if you water it every day?',
    choices: ['It grows and stays healthy', 'It dies immediately', 'It turns into a tree overnight', 'Nothing changes'],
    answer: 0,
    explanation: 'Plants need water to make food through photosynthesis and to stay healthy!',
    category: 'Plants',
  },
  {
    emoji: '🧊',
    question: 'What happens to ice when you leave it in a warm room?',
    choices: ['It gets harder', 'It melts into water', 'It turns into steam instantly', 'It stays the same'],
    answer: 1,
    explanation: 'Heat energy causes ice to melt — it changes from a solid to a liquid!',
    category: 'States of Matter',
  },
  {
    emoji: '🔦',
    question: 'What happens when you shine a torch at an opaque object?',
    choices: ['Light passes straight through', 'A shadow forms behind it', 'The object glows', 'The light disappears'],
    answer: 1,
    explanation: 'Opaque objects block light, creating a shadow on the other side!',
    category: 'Light',
  },
  {
    emoji: '🧲',
    question: 'What happens when you bring two north poles of magnets together?',
    choices: ['They attract each other', 'They repel (push apart)', 'They stick together permanently', 'Nothing happens'],
    answer: 1,
    explanation: 'Like poles repel — north and north push away from each other!',
    category: 'Magnets',
  },
  {
    emoji: '🌍',
    question: 'What causes day and night on Earth?',
    choices: ['The Sun moving around Earth', 'Earth spinning on its axis', 'The Moon blocking the Sun', 'Clouds covering the Sun'],
    answer: 1,
    explanation: 'Earth rotates (spins) on its axis once every 24 hours, causing day and night!',
    category: 'Space',
  },
  {
    emoji: '🌡️',
    question: 'What happens to most metals when they are heated?',
    choices: ['They shrink', 'They expand (get bigger)', 'They turn into gas immediately', 'They become magnetic'],
    answer: 1,
    explanation: 'Metals expand when heated because the particles inside move faster and spread out!',
    category: 'Materials',
  },
  {
    emoji: '🐛',
    question: 'What does a caterpillar turn into?',
    choices: ['A spider', 'A butterfly or moth', 'A bee', 'A grasshopper'],
    answer: 1,
    explanation: 'Caterpillars go through metamorphosis and become butterflies or moths!',
    category: 'Life Cycles',
  },
  {
    emoji: '💧',
    question: 'What happens to water when you heat it to 100°C?',
    choices: ['It freezes', 'It turns into steam (evaporates)', 'It turns into ice', 'It disappears completely'],
    answer: 1,
    explanation: 'Water boils at 100°C and turns into water vapour (steam)!',
    category: 'States of Matter',
  },
  {
    emoji: '🌿',
    question: 'What do plants need to make their own food?',
    choices: ['Soil and worms', 'Sunlight, water and carbon dioxide', 'Rain and wind only', 'Fertiliser and insects'],
    answer: 1,
    explanation: 'Plants use photosynthesis — they need sunlight, water and CO₂ to make glucose!',
    category: 'Plants',
  },
  {
    emoji: '⚡',
    question: 'What happens when you rub a balloon on your hair?',
    choices: ['The balloon pops', 'Static electricity builds up and the balloon sticks', 'Your hair turns blue', 'Nothing happens'],
    answer: 1,
    explanation: 'Rubbing transfers electrons, creating static electricity that makes the balloon stick!',
    category: 'Electricity',
  },
  {
    emoji: '🦴',
    question: 'What is the job of your skeleton?',
    choices: ['To digest food', 'To support your body and protect organs', 'To pump blood around your body', 'To help you breathe'],
    answer: 1,
    explanation: 'Your skeleton supports your body, allows movement, and protects vital organs!',
    category: 'Human Body',
  },
  {
    emoji: '🌊',
    question: 'What causes tides in the ocean?',
    choices: ['Wind blowing the water', 'The Moon\'s gravity pulling the water', 'Fish swimming in large groups', 'The Earth spinning very fast'],
    answer: 1,
    explanation: 'The Moon\'s gravitational pull causes the oceans to bulge, creating tides!',
    category: 'Space',
  },
  {
    emoji: '🔬',
    question: 'What happens when you mix vinegar and bicarbonate of soda?',
    choices: ['Nothing happens', 'A fizzing chemical reaction occurs', 'They turn into a solid', 'They become very hot'],
    answer: 1,
    explanation: 'An acid-base reaction produces carbon dioxide gas, causing fizzing and bubbling!',
    category: 'Chemistry',
  },
  {
    emoji: '🌡️',
    question: 'What is the correct order of the food chain?',
    choices: ['Consumer → Producer → Decomposer', 'Producer → Consumer → Decomposer', 'Decomposer → Consumer → Producer', 'Consumer → Decomposer → Producer'],
    answer: 1,
    explanation: 'Energy flows from producers (plants) to consumers (animals) to decomposers!',
    category: 'Ecosystems',
  },
  {
    emoji: '🌬️',
    question: 'What causes wind?',
    choices: ['Trees waving their branches', 'Differences in air pressure', 'The Moon moving', 'Clouds moving quickly'],
    answer: 1,
    explanation: 'Wind is caused by air moving from high pressure areas to low pressure areas!',
    category: 'Weather',
  },
];

const TOTAL = 10;

// ── Game inner ────────────────────────────────────────────────────────────────
function ScienceLabInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<ScienceQ[]>(() =>
    [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL)
  );
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);

  const q = questions[qIdx];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isRight = idx === q.answer;
    const newScore = isRight ? score + 10 : score;
    const newCorrect = isRight ? correct + 1 : correct;
    if (isRight) { setScore(newScore); setCorrect(newCorrect); }

    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= TOTAL) {
        const stars = newCorrect >= TOTAL * 0.9 ? 3 : newCorrect >= TOTAL * 0.6 ? 2 : newCorrect >= TOTAL * 0.3 ? 1 : 0;
        onComplete({ score: newScore, correct: newCorrect, total: TOTAL, stars, maxScore: TOTAL * 10, durationSeconds: 0 });
      } else {
        setQIdx(next);
        setSelected(null);
      }
    }, 1800);
  };

  const progress = (qIdx / TOTAL) * 100;

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

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-card rounded-3xl border-2 border-border shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-3">
              <FlaskConical size={13} className="text-white" />
              <span className="text-white text-xs font-bold">{q.category}</span>
            </div>
            <div className="text-5xl mb-3">{q.emoji}</div>
            <h2 className="text-white font-black text-lg leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
              {q.question}
            </h2>
          </div>

          {/* Choices */}
          <div className="p-5 flex flex-col gap-3">
            {q.choices.map((choice, i) => {
              let style = 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground';
              if (selected !== null) {
                if (i === q.answer) style = 'bg-green-100 border-green-500 text-green-800';
                else if (i === selected && i !== q.answer) style = 'bg-red-100 border-red-400 text-red-800';
                else style = 'bg-muted border-border text-muted-foreground';
              }
              return (
                <motion.button
                  key={i}
                  whileHover={selected === null ? { scale: 1.02, x: 4 } : {}}
                  whileTap={selected === null ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all flex items-center gap-3 ${style}`}
                >
                  <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {choice}
                  {selected !== null && i === q.answer && <CheckCircle2 size={16} className="text-green-600 ml-auto shrink-0" />}
                  {selected !== null && i === selected && i !== q.answer && <XCircle size={16} className="text-red-500 ml-auto shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
                className={`mx-5 mb-5 rounded-2xl px-4 py-3 flex items-start gap-2 ${
                  selected === q.answer ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <span className="text-lg shrink-0">🔬</span>
                <p className="text-sm font-bold text-foreground">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function ScienceLabGame() {
  return (
    <>
      <Helmet>
        <title>Science Lab — Sodafom | Science Games for Kids</title>
        <meta name="description" content="Explore cause and effect in science! Answer questions about plants, space, materials and more. A fun science quiz for children aged 5–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/science-lab" />
        <meta property="og:title" content="Science Lab — Sodafom" />
        <meta property="og:description" content="Explore cause and effect in science! Plants, space, materials and more." />
        <meta property="og:url" content="https://sodafom.uk/games/science-lab" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/science-lab#webpage',
          name: 'Science Lab — Sodafom',
          url: 'https://sodafom.uk/games/science-lab',
          description: 'Cause-and-effect science quiz for children aged 5–13.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Science Lab — Science Game for Kids — Sodafom</h1>
      <GameShell title="Science Lab" emoji="🔬" subject="science" ageGroups={['5–7', '8–10', '11–13']}>
        {(onComplete) => <ScienceLabInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
