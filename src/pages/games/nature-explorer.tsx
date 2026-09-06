import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

const TOTAL_ROUNDS = 10;

type MatchPair = {
  left: string;
  leftEmoji: string;
  right: string;
  rightEmoji: string;
  category: string;
  fact: string;
};

// Tier 1 (5–7): simple plant/animal to habitat matching
const PAIRS_EASY: MatchPair[] = [
  { left: 'Fish', leftEmoji: '🐟', right: 'Ocean', rightEmoji: '🌊', category: 'Habitat', fact: 'Oceans cover more than 70% of the Earth\'s surface!' },
  { left: 'Cactus', leftEmoji: '🌵', right: 'Desert', rightEmoji: '🏜️', category: 'Habitat', fact: 'Cacti store water in their thick stems to survive in dry deserts.' },
  { left: 'Polar Bear', leftEmoji: '🐻‍❄️', right: 'Arctic', rightEmoji: '🧊', category: 'Habitat', fact: 'Polar bears have two layers of fur to keep warm in freezing temperatures.' },
  { left: 'Monkey', leftEmoji: '🐒', right: 'Rainforest', rightEmoji: '🌴', category: 'Habitat', fact: 'Rainforests are home to more than half of all plant and animal species on Earth.' },
  { left: 'Sunflower', leftEmoji: '🌻', right: 'Meadow', rightEmoji: '🌾', category: 'Habitat', fact: 'Sunflowers always face the sun — this is called heliotropism.' },
  { left: 'Frog', leftEmoji: '🐸', right: 'Pond', rightEmoji: '💧', category: 'Habitat', fact: 'Frogs absorb water through their skin — they never need to drink!' },
  { left: 'Eagle', leftEmoji: '🦅', right: 'Mountain', rightEmoji: '⛰️', category: 'Habitat', fact: 'Eagles can spot prey from over 3 km away thanks to their incredible eyesight.' },
  { left: 'Camel', leftEmoji: '🐪', right: 'Desert', rightEmoji: '🏜️', category: 'Habitat', fact: 'Camels store fat (not water) in their humps for energy on long journeys.' },
  { left: 'Penguin', leftEmoji: '🐧', right: 'Antarctic', rightEmoji: '❄️', category: 'Habitat', fact: 'Emperor penguins huddle together in groups of thousands to stay warm.' },
  { left: 'Oak Tree', leftEmoji: '🌳', right: 'Forest', rightEmoji: '🌲', category: 'Habitat', fact: 'A single oak tree can support over 500 different species of insects and animals.' },
  { left: 'Seaweed', leftEmoji: '🌿', right: 'Ocean', rightEmoji: '🌊', category: 'Habitat', fact: 'Seaweed is not actually a plant — it\'s a type of algae.' },
  { left: 'Lion', leftEmoji: '🦁', right: 'Savanna', rightEmoji: '🌅', category: 'Habitat', fact: 'Lions are the only cats that live in groups, called prides.' },
];

// Tier 2 (8–10): plant parts to functions, life cycles
const PAIRS_MEDIUM: MatchPair[] = [
  { left: 'Roots', leftEmoji: '🌱', right: 'Absorb water', rightEmoji: '💧', category: 'Plant parts', fact: 'Some tree roots can extend 3 times wider than the tree\'s canopy.' },
  { left: 'Leaves', leftEmoji: '🍃', right: 'Make food', rightEmoji: '☀️', category: 'Plant parts', fact: 'Leaves use sunlight, water and CO₂ to make glucose through photosynthesis.' },
  { left: 'Flowers', leftEmoji: '🌸', right: 'Attract pollinators', rightEmoji: '🐝', category: 'Plant parts', fact: 'Flowers use colour and scent to attract bees, butterflies and other pollinators.' },
  { left: 'Seeds', leftEmoji: '🌰', right: 'Grow new plants', rightEmoji: '🌱', category: 'Plant parts', fact: 'The oldest seed ever germinated was a 2,000-year-old date palm seed.' },
  { left: 'Stem', leftEmoji: '🌿', right: 'Transport water', rightEmoji: '🔄', category: 'Plant parts', fact: 'Stems contain tiny tubes called xylem that carry water from roots to leaves.' },
  { left: 'Egg', leftEmoji: '🥚', right: 'Frog life cycle start', rightEmoji: '🐸', category: 'Life cycle', fact: 'A frog can lay up to 20,000 eggs at once, but only a few survive to adulthood.' },
  { left: 'Tadpole', leftEmoji: '🐟', right: 'Young frog stage', rightEmoji: '🔄', category: 'Life cycle', fact: 'Tadpoles breathe through gills, just like fish, before growing lungs.' },
  { left: 'Caterpillar', leftEmoji: '🐛', right: 'Butterfly larva', rightEmoji: '🦋', category: 'Life cycle', fact: 'A caterpillar eats constantly and can increase its weight by 100 times.' },
  { left: 'Pollen', leftEmoji: '🌼', right: 'Fertilises flowers', rightEmoji: '🌸', category: 'Pollination', fact: 'Bees carry pollen in special baskets on their back legs called corbiculae.' },
  { left: 'Fruit', leftEmoji: '🍎', right: 'Protects seeds', rightEmoji: '🌰', category: 'Plant parts', fact: 'Fruits are the ripened ovaries of flowers — even tomatoes and cucumbers are fruits!' },
  { left: 'Chlorophyll', leftEmoji: '💚', right: 'Makes leaves green', rightEmoji: '🍃', category: 'Plant science', fact: 'Chlorophyll absorbs red and blue light but reflects green, making leaves look green.' },
  { left: 'Spore', leftEmoji: '🍄', right: 'Fern reproduction', rightEmoji: '🌿', category: 'Reproduction', fact: 'Ferns are ancient plants that reproduce using spores, not seeds or flowers.' },
];

// Tier 3 (11–13): ecosystems, food webs, environmental science
const PAIRS_HARD: MatchPair[] = [
  { left: 'Producer', leftEmoji: '🌿', right: 'Makes own food', rightEmoji: '☀️', category: 'Food web', fact: 'Producers form the base of every food chain — without them, no other life could exist.' },
  { left: 'Consumer', leftEmoji: '🐰', right: 'Eats other organisms', rightEmoji: '🥕', category: 'Food web', fact: 'Primary consumers eat producers; secondary consumers eat primary consumers.' },
  { left: 'Decomposer', leftEmoji: '🍄', right: 'Breaks down dead matter', rightEmoji: '♻️', category: 'Food web', fact: 'Without decomposers, dead plants and animals would pile up and nutrients would be locked away.' },
  { left: 'Photosynthesis', leftEmoji: '🌳', right: 'Converts sunlight to energy', rightEmoji: '⚡', category: 'Processes', fact: 'Photosynthesis produces all the oxygen in Earth\'s atmosphere.' },
  { left: 'Carbon cycle', leftEmoji: '🔄', right: 'Recycles carbon through ecosystems', rightEmoji: '🌍', category: 'Cycles', fact: 'Carbon has been cycling through Earth\'s systems for billions of years.' },
  { left: 'Water cycle', leftEmoji: '💧', right: 'Evaporation and precipitation', rightEmoji: '🌧️', category: 'Cycles', fact: 'The same water molecules have been cycling on Earth for over 4 billion years.' },
  { left: 'Deforestation', leftEmoji: '🪓', right: 'Loss of forest habitat', rightEmoji: '🌲', category: 'Environment', fact: 'About 15 billion trees are cut down each year — that\'s 46% of the world\'s forests since humans arrived.' },
  { left: 'Greenhouse effect', leftEmoji: '🌡️', right: 'Traps heat in atmosphere', rightEmoji: '🌍', category: 'Climate', fact: 'Without any greenhouse effect, Earth\'s average temperature would be -18°C.' },
  { left: 'Biodiversity', leftEmoji: '🌈', right: 'Variety of life in an area', rightEmoji: '🦋', category: 'Ecology', fact: 'Tropical rainforests cover 6% of Earth\'s surface but contain over 50% of its species.' },
  { left: 'Adaptation', leftEmoji: '🦎', right: 'Feature that helps survival', rightEmoji: '✅', category: 'Evolution', fact: 'The peppered moth changed colour during the Industrial Revolution to blend with soot-covered trees.' },
  { left: 'Nitrogen cycle', leftEmoji: '🌱', right: 'Recycles nitrogen through soil', rightEmoji: '🔄', category: 'Cycles', fact: 'Nitrogen makes up 78% of the air we breathe but most organisms can\'t use it directly.' },
  { left: 'Symbiosis', leftEmoji: '🤝', right: 'Two species living together', rightEmoji: '🐠', category: 'Ecology', fact: 'Clownfish and sea anemones are a classic example — the fish gets shelter, the anemone gets cleaning.' },
];

function getPairs(tier: 1 | 2 | 3): MatchPair[] {
  const base = tier === 1 ? PAIRS_EASY : tier === 2 ? PAIRS_MEDIUM : PAIRS_HARD;
  return [...base].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
}

export default function NatureExplorerGame() {
  return (
    <>
      <Helmet>
        <title>Nature Explorer — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Explore the natural world through fun science questions. A nature quiz for children aged 5–13." />
        <link rel="canonical" href="https://sodafom.uk/games/nature-explorer" />
        <meta property="og:title" content="Nature Explorer — Sodafom" />
        <meta property="og:description" content="Explore the natural world through fun science questions. A nature quiz for children aged 5–13." />
        <meta property="og:url" content="https://sodafom.uk/games/nature-explorer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nature Explorer — Sodafom" />
        <meta name="twitter:description" content="Explore the natural world through fun science questions. A nature quiz for children aged 5–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/nature-explorer#webpage","name":"Nature Explorer — Sodafom","url":"https://sodafom.uk/games/nature-explorer","description":"Explore the natural world through fun science questions. A nature quiz for children aged 5–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Nature Explorer — Science Game for Kids — Sodafom
      </h1>

      <GameShell title="Nature Explorer" emoji="🌿" subject="science" ageGroups={['5–7', '8–10', '11–13']}>
        {(onComplete) => <NatureExplorerPlay onComplete={onComplete} />}
      </GameShell>
    </>
  );
}

function NatureExplorerPlay({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const { tier } = useChildAge();
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const p = getPairs(tier);
    setPairs(p);
  }, [tier]);

  useEffect(() => {
    if (!pairs.length) return;
    const current = pairs[round];
    // Build 4 options: correct answer + 3 distractors from other pairs
    const others = pairs
      .filter((_, i) => i !== round)
      .map(p => p.right)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setOptions([...others, current.right].sort(() => Math.random() - 0.5));
  }, [round, pairs]);

  const p = pairs[round];

  const handleAnswer = useCallback((option: string) => {
    if (feedback || !p) return;
    const isCorrect = option === p.right;
    setSelected(option);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setCorrect(c => c + 1);

    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        const finalCorrect = isCorrect ? correct + 1 : correct;
        const stars = finalCorrect >= 9 ? 3 : finalCorrect >= 6 ? 2 : 1;
        onComplete({ stars, score: finalCorrect * 10, correct: finalCorrect, total: TOTAL_ROUNDS });
      } else {
        setRound(nextRound);
        setSelected(null);
        setFeedback(null);
      }
    }, 2000);
  }, [feedback, p, round, correct, onComplete]);

  if (!p || !options.length) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">Round {round + 1} of {TOTAL_ROUNDS}</span>
        <span className="text-sm font-bold text-primary">⭐ {correct} correct</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <motion.div
          className="bg-primary h-2 rounded-full"
          animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Category badge */}
          <div className="text-center mb-3">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
              {p.category}
            </span>
          </div>

          {/* Left item */}
          <div className="bg-card border-2 border-primary rounded-2xl p-6 text-center mb-4 shadow-sm">
            <div className="text-5xl mb-3">{p.leftEmoji}</div>
            <p className="text-xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {p.left}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Match this to the correct option →</p>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => {
              const matchPair = pairs.find(pr => pr.right === option);
              const emoji = matchPair?.rightEmoji ?? '❓';
              const isCorrectOption = option === p.right;
              const isSelected = option === selected;
              let btnClass = 'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 ';
              if (!feedback) {
                btnClass += 'bg-card border-border hover:border-primary hover:bg-primary/5 text-foreground cursor-pointer';
              } else if (isCorrectOption) {
                btnClass += 'bg-green-100 border-green-500 text-green-800';
              } else if (isSelected) {
                btnClass += 'bg-red-100 border-red-500 text-red-800';
              } else {
                btnClass += 'bg-muted border-border text-muted-foreground opacity-50';
              }

              return (
                <motion.button
                  key={option}
                  className={btnClass}
                  onClick={() => handleAnswer(option)}
                  whileHover={!feedback ? { scale: 1.04 } : {}}
                  whileTap={!feedback ? { scale: 0.96 } : {}}
                >
                  <span className="text-3xl">{emoji}</span>
                  <span>{option}</span>
                  {feedback && isCorrectOption && <span>✅</span>}
                  {feedback && isSelected && !isCorrectOption && <span>❌</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Fact */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl border-2 text-sm font-medium ${feedback === 'correct' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}
              >
                <span className="font-black">🌿 Nature fact: </span>{p.fact}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
