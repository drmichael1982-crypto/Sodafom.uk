/**
 * /games/human-body — label body parts and organs (science, ages 8–13)
 * Ages 8–13 · Science subject
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star, Heart } from 'lucide-react';

interface BodyQ {
  question: string;
  emoji: string;
  choices: string[];
  answer: string;
  funFact: string;
  category: 'external' | 'organ' | 'system' | 'bone';
}

const QUESTIONS: BodyQ[] = [
  { question: 'Which organ pumps blood around the body?', emoji: '❤️', choices: ['Heart', 'Lungs', 'Liver', 'Kidney'], answer: 'Heart', funFact: 'Your heart beats about 100,000 times every single day!', category: 'organ' },
  { question: 'Which organ do we use to breathe?', emoji: '🫁', choices: ['Lungs', 'Heart', 'Stomach', 'Brain'], answer: 'Lungs', funFact: 'You have two lungs — the right one is slightly bigger than the left!', category: 'organ' },
  { question: 'Which organ controls everything your body does?', emoji: '🧠', choices: ['Brain', 'Heart', 'Spine', 'Liver'], answer: 'Brain', funFact: 'Your brain uses about 20% of all the energy your body produces!', category: 'organ' },
  { question: 'Which organ breaks down food in your body?', emoji: '🫃', choices: ['Stomach', 'Lungs', 'Heart', 'Kidney'], answer: 'Stomach', funFact: 'Your stomach produces a new lining every 3–4 days to protect itself from its own acid!', category: 'organ' },
  { question: 'Which organ filters waste from your blood to make urine?', emoji: '🫘', choices: ['Kidneys', 'Liver', 'Pancreas', 'Spleen'], answer: 'Kidneys', funFact: 'Your kidneys filter about 200 litres of blood every day!', category: 'organ' },
  { question: 'What is the largest organ in the human body?', emoji: '🧴', choices: ['Skin', 'Liver', 'Lungs', 'Intestines'], answer: 'Skin', funFact: 'Your skin is about 2 square metres in area and replaces itself every 2–3 weeks!', category: 'external' },
  { question: 'Which body part connects your brain to the rest of your nervous system?', emoji: '🦴', choices: ['Spinal cord', 'Femur', 'Ribcage', 'Skull'], answer: 'Spinal cord', funFact: 'The spinal cord is about 45cm long and contains millions of nerve fibres!', category: 'system' },
  { question: 'What is the longest bone in the human body?', emoji: '🦵', choices: ['Femur (thigh bone)', 'Tibia (shin bone)', 'Humerus (upper arm)', 'Spine'], answer: 'Femur (thigh bone)', funFact: 'The femur is about a quarter of your total height!', category: 'bone' },
  { question: 'How many bones does an adult human body have?', emoji: '💀', choices: ['206', '180', '250', '300'], answer: '206', funFact: 'Babies are born with about 270 bones — many fuse together as you grow!', category: 'bone' },
  { question: 'Which organ produces bile to help digest fats?', emoji: '🟤', choices: ['Liver', 'Pancreas', 'Stomach', 'Kidney'], answer: 'Liver', funFact: 'The liver performs over 500 different functions and can regenerate itself!', category: 'organ' },
  { question: 'What do red blood cells carry around the body?', emoji: '🔴', choices: ['Oxygen', 'Carbon dioxide', 'Nutrients', 'Water'], answer: 'Oxygen', funFact: 'You have about 25 trillion red blood cells — and your body makes 2 million new ones every second!', category: 'system' },
  { question: 'Which part of the eye controls how much light enters?', emoji: '👁️', choices: ['Pupil', 'Iris', 'Retina', 'Cornea'], answer: 'Pupil', funFact: 'Your pupils can change size in less than a second to adjust to different light levels!', category: 'external' },
  { question: 'What is the name of the tube that carries food from your mouth to your stomach?', emoji: '🍽️', choices: ['Oesophagus', 'Trachea', 'Intestine', 'Aorta'], answer: 'Oesophagus', funFact: 'The oesophagus uses wave-like muscle contractions called peristalsis to push food down!', category: 'system' },
  { question: 'Which organ produces insulin to control blood sugar?', emoji: '🫀', choices: ['Pancreas', 'Liver', 'Kidney', 'Spleen'], answer: 'Pancreas', funFact: 'The pancreas also produces digestive enzymes that break down carbohydrates, proteins and fats!', category: 'organ' },
  { question: 'How many chambers does the human heart have?', emoji: '❤️', choices: ['4', '2', '3', '6'], answer: '4', funFact: 'The four chambers are: right atrium, right ventricle, left atrium, and left ventricle!', category: 'organ' },
];

const CATEGORY_META: Record<string, { label: string; colour: string }> = {
  external: { label: 'External body', colour: 'bg-orange-100 text-orange-700' },
  organ:    { label: 'Organ',         colour: 'bg-red-100 text-red-700' },
  system:   { label: 'Body system',   colour: 'bg-blue-100 text-blue-700' },
  bone:     { label: 'Skeleton',      colour: 'bg-gray-100 text-gray-700' },
};

const TOTAL = 10;

function HumanBodyInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<BodyQ[]>(() =>
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
    }, 2000);
  }, [selected, q.answer, score, correct, qIdx, onComplete]);

  const progress = (qIdx / TOTAL) * 100;
  const phase = selected === null ? 'answering' : selected === q.answer ? 'correct' : 'wrong';
  const catMeta = CATEGORY_META[q.category];

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
          <div className="bg-gradient-to-br from-rose-500 to-red-600 px-6 py-4 flex items-center gap-3">
            <Heart size={20} className="text-white shrink-0" fill="white" />
            <div className="flex-1">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Human Body</p>
              <p className="text-white font-black text-sm">Body parts &amp; organs</p>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${catMeta.colour}`}>{catMeta.label}</span>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Emoji + Question */}
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                className="text-6xl mb-3"
              >
                {q.emoji}
              </motion.div>
              <p className="text-base font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {q.question}
              </p>
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
                    className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 text-center ${style}`}
                  >
                    {selected !== null && c === q.answer && <CheckCircle2 size={14} className="text-green-600 shrink-0" />}
                    {selected !== null && c === selected && c !== q.answer && <XCircle size={14} className="text-red-500 shrink-0" />}
                    {c}
                  </motion.button>
                );
              })}
            </div>

            {/* Fun fact */}
            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`flex items-start gap-2 rounded-2xl px-4 py-3 ${phase === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}
                >
                  <span className="text-lg shrink-0">🔬</span>
                  <div>
                    <p className={`font-black text-sm mb-0.5 ${phase === 'correct' ? 'text-green-800' : 'text-blue-800'}`}>
                      {phase === 'correct' ? `✓ Correct! The answer is ${q.answer}.` : `The answer is ${q.answer}.`}
                    </p>
                    <p className="text-xs text-muted-foreground font-bold">Fun fact: {q.funFact}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function HumanBodyGame() {
  return (
    <>
      <Helmet>
        <title>Human Body — Sodafom | Science Games for Kids</title>
        <meta name="description" content="Learn about body parts and organs! Heart, lungs, brain and more. A fun science game for children aged 8–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/human-body" />
        <meta property="og:title" content="Human Body — Sodafom" />
        <meta property="og:description" content="Learn about body parts and organs!" />
        <meta property="og:url" content="https://sodafom.uk/games/human-body" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/human-body#webpage',
          name: 'Human Body — Sodafom', url: 'https://sodafom.uk/games/human-body',
          description: 'Learn about body parts and organs. Science game for children aged 8–13.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Human Body — Science Game for Kids — Sodafom</h1>
      <GameShell title="Human Body" emoji="🫀" subject="science" ageGroups={['8–10', '11–13']}>
        {(onComplete) => <HumanBodyInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
