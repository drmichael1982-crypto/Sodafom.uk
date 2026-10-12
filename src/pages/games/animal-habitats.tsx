/**
 * /games/animal-habitats — Match animals to their correct habitat
 * Ages 5–13 · Science subject
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

interface HabitatQ {
  animal: string;
  emoji: string;
  correctHabitat: string;
  habitatEmoji: string;
  choices: string[];
  funFact: string;
}

const QUESTIONS: HabitatQ[] = [
  { animal: 'Polar Bear', emoji: '🐻‍❄️', correctHabitat: 'Arctic tundra', habitatEmoji: '🧊', choices: ['Arctic tundra', 'Rainforest', 'Desert', 'Ocean'], funFact: 'Polar bears have black skin under their white fur to absorb heat!' },
  { animal: 'Camel', emoji: '🐪', correctHabitat: 'Desert', habitatEmoji: '🏜️', choices: ['Desert', 'Arctic tundra', 'Rainforest', 'Grassland'], funFact: 'Camels store fat in their humps, not water!' },
  { animal: 'Clownfish', emoji: '🐠', correctHabitat: 'Coral reef', habitatEmoji: '🪸', choices: ['Coral reef', 'River', 'Arctic ocean', 'Desert'], funFact: 'Clownfish live among sea anemone tentacles and are immune to their sting!' },
  { animal: 'Toucan', emoji: '🦜', correctHabitat: 'Rainforest', habitatEmoji: '🌴', choices: ['Rainforest', 'Desert', 'Arctic tundra', 'Grassland'], funFact: 'A toucan\'s large beak helps it reach fruit on thin branches!' },
  { animal: 'Lion', emoji: '🦁', correctHabitat: 'Grassland (savanna)', habitatEmoji: '🌾', choices: ['Grassland (savanna)', 'Rainforest', 'Arctic tundra', 'Ocean'], funFact: 'Lions are the only cats that live in social groups called prides!' },
  { animal: 'Penguin', emoji: '🐧', correctHabitat: 'Antarctic coast', habitatEmoji: '🏔️', choices: ['Antarctic coast', 'Desert', 'Rainforest', 'Grassland'], funFact: 'Emperor penguins can dive over 500 metres deep!' },
  { animal: 'Beaver', emoji: '🦫', correctHabitat: 'Freshwater river', habitatEmoji: '🏞️', choices: ['Freshwater river', 'Ocean', 'Desert', 'Arctic tundra'], funFact: 'Beavers build dams to create ponds where they build their lodges!' },
  { animal: 'Cactus Wren', emoji: '🐦', correctHabitat: 'Desert', habitatEmoji: '🏜️', choices: ['Desert', 'Rainforest', 'Arctic tundra', 'Ocean'], funFact: 'The cactus wren nests inside cacti for protection from predators!' },
  { animal: 'Orangutan', emoji: '🦧', correctHabitat: 'Rainforest', habitatEmoji: '🌴', choices: ['Rainforest', 'Grassland', 'Arctic tundra', 'Desert'], funFact: 'Orangutans spend almost their entire lives in the treetops!' },
  { animal: 'Great White Shark', emoji: '🦈', correctHabitat: 'Open ocean', habitatEmoji: '🌊', choices: ['Open ocean', 'Coral reef', 'River', 'Arctic tundra'], funFact: 'Great white sharks can detect a single drop of blood from 5km away!' },
  { animal: 'Arctic Fox', emoji: '🦊', correctHabitat: 'Arctic tundra', habitatEmoji: '🧊', choices: ['Arctic tundra', 'Desert', 'Rainforest', 'Grassland'], funFact: 'Arctic foxes change their coat from white in winter to brown in summer!' },
  { animal: 'Gorilla', emoji: '🦍', correctHabitat: 'Rainforest', habitatEmoji: '🌴', choices: ['Rainforest', 'Grassland', 'Desert', 'Ocean'], funFact: 'Gorillas build a new nest to sleep in every single night!' },
  { animal: 'Seahorse', emoji: '🐴', correctHabitat: 'Coral reef', habitatEmoji: '🪸', choices: ['Coral reef', 'Open ocean', 'River', 'Desert'], funFact: 'Male seahorses carry and give birth to the babies!' },
  { animal: 'Meerkat', emoji: '🦦', correctHabitat: 'Desert', habitatEmoji: '🏜️', choices: ['Desert', 'Rainforest', 'Arctic tundra', 'Ocean'], funFact: 'Meerkats take turns acting as lookout to warn the group of predators!' },
  { animal: 'Salmon', emoji: '🐟', correctHabitat: 'Freshwater river', habitatEmoji: '🏞️', choices: ['Freshwater river', 'Desert', 'Arctic tundra', 'Coral reef'], funFact: 'Salmon are born in rivers, migrate to the ocean, then return to the same river to breed!' },
];

const TOTAL = 10;

function AnimalHabitatsInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<HabitatQ[]>(() =>
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
    const isRight = choice === q.correctHabitat;
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
  }, [selected, q.correctHabitat, score, correct, qIdx, onComplete]);

  const progress = (qIdx / TOTAL) * 100;
  const phase = selected === null ? 'answering' : selected === q.correctHabitat ? 'correct' : 'wrong';

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
          {/* Animal display */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
              className="text-7xl mb-3"
            >
              {q.emoji}
            </motion.div>
            <h2 className="text-white font-black text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
              {q.animal}
            </h2>
            <p className="text-white/70 text-sm mt-1">Where does this animal live?</p>
          </div>

          {/* Habitat choices */}
          <div className="p-5 grid grid-cols-2 gap-3">
            {q.choices.map((c) => {
              let style = 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground';
              if (selected !== null) {
                if (c === q.correctHabitat) style = 'bg-green-100 border-green-500 text-green-800';
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
                  className={`py-4 px-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${style}`}
                >
                  {selected !== null && c === q.correctHabitat && <CheckCircle2 size={14} className="text-green-600 shrink-0" />}
                  {selected !== null && c === selected && c !== q.correctHabitat && <XCircle size={14} className="text-red-500 shrink-0" />}
                  {c}
                </motion.button>
              );
            })}
          </div>

          {/* Fun fact */}
          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
                className={`mx-5 mb-5 rounded-2xl px-4 py-3 flex items-start gap-2 ${
                  phase === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <span className="text-lg shrink-0">{q.habitatEmoji}</span>
                <div>
                  <p className={`font-black text-sm mb-0.5 ${phase === 'correct' ? 'text-green-800' : 'text-blue-800'}`}>
                    {phase === 'correct' ? `✓ Correct! The ${q.animal} lives in the ${q.correctHabitat}.` : `The ${q.animal} lives in the ${q.correctHabitat}.`}
                  </p>
                  <p className="text-xs text-muted-foreground font-bold">🔬 Fun fact: {q.funFact}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AnimalHabitatsGame() {
  return (
    <>
      <Helmet>
        <title>Animal Habitats — Sodafom | Science Games for Kids</title>
        <meta name="description" content="Match animals to their correct habitats! Learn about polar bears, camels, clownfish and more. A fun science game for children aged 5–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/animal-habitats" />
        <meta property="og:title" content="Animal Habitats — Sodafom" />
        <meta property="og:description" content="Match animals to their correct habitats!" />
        <meta property="og:url" content="https://sodafom.uk/games/animal-habitats" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/animal-habitats#webpage',
          name: 'Animal Habitats — Sodafom', url: 'https://sodafom.uk/games/animal-habitats',
          description: 'Match animals to their correct habitats. Science game for children aged 5–13.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Animal Habitats — Science Game for Kids — Sodafom</h1>
      <GameShell title="Animal Habitats" emoji="🌍" subject="science" ageGroups={['5–7', '8–10', '11–13']}>
        {(onComplete) => <AnimalHabitatsInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
