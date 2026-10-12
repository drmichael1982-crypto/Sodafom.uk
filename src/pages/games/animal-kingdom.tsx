import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

const TOTAL_ROUNDS = 10;

type Question = {
  question: string;
  answer: string;
  options: string[];
  emoji: string;
  fact: string;
};

// Tier 1 (5–7): basic animal facts — what sound, what group, what they eat
const QUESTIONS_EASY: Omit<Question, 'options'>[] = [
  { question: 'What do cows eat?', answer: 'Grass', emoji: '🐄', fact: 'Cows spend about 8 hours a day eating grass!' },
  { question: 'What sound does a duck make?', answer: 'Quack', emoji: '🦆', fact: 'Only female ducks quack — males make a softer sound.' },
  { question: 'Where do fish live?', answer: 'Water', emoji: '🐟', fact: 'There are over 30,000 different species of fish!' },
  { question: 'What do bees make?', answer: 'Honey', emoji: '🐝', fact: 'A bee visits up to 1,500 flowers to make one teaspoon of honey.' },
  { question: 'What is a baby cat called?', answer: 'Kitten', emoji: '🐱', fact: 'Kittens are born with their eyes closed and open them after about 10 days.' },
  { question: 'What do birds use to fly?', answer: 'Wings', emoji: '🐦', fact: 'Birds have hollow bones to help them stay light enough to fly.' },
  { question: 'What is a baby dog called?', answer: 'Puppy', emoji: '🐶', fact: 'Puppies are born deaf and blind — their senses develop over a few weeks.' },
  { question: 'What do frogs eat?', answer: 'Insects', emoji: '🐸', fact: 'Frogs catch insects with their long, sticky tongues.' },
  { question: 'What is a group of lions called?', answer: 'Pride', emoji: '🦁', fact: 'A pride of lions can have up to 40 members!' },
  { question: 'What do caterpillars turn into?', answer: 'Butterflies', emoji: '🦋', fact: 'A caterpillar can increase its body mass by 100 times before becoming a butterfly.' },
  { question: 'Which animal has a very long neck?', answer: 'Giraffe', emoji: '🦒', fact: 'A giraffe\'s neck can be up to 1.8 metres long!' },
  { question: 'What do rabbits eat?', answer: 'Vegetables', emoji: '🐰', fact: 'Rabbits eat their own droppings to get extra nutrients — gross but clever!' },
];

// Tier 2 (8–10): animal classification, habitats, adaptations
const QUESTIONS_MEDIUM: Omit<Question, 'options'>[] = [
  { question: 'What type of animal is a whale?', answer: 'Mammal', emoji: '🐋', fact: 'Whales breathe air and feed their babies milk, just like humans.' },
  { question: 'What is the largest land animal?', answer: 'Elephant', emoji: '🐘', fact: 'African elephants can weigh up to 6,000 kg — as heavy as a bus!' },
  { question: 'Which animal uses echolocation to hunt?', answer: 'Bat', emoji: '🦇', fact: 'Bats send out sound waves and listen for the echo to find prey in the dark.' },
  { question: 'What do herbivores eat?', answer: 'Plants', emoji: '🌿', fact: 'Herbivores have flat teeth designed for grinding plants.' },
  { question: 'Where do polar bears live?', answer: 'Arctic', emoji: '🐻‍❄️', fact: 'Polar bears have black skin under their white fur to absorb heat from the sun.' },
  { question: 'What is the fastest land animal?', answer: 'Cheetah', emoji: '🐆', fact: 'Cheetahs can reach 70 mph in just 3 seconds — faster than most cars!' },
  { question: 'What type of animal is a frog?', answer: 'Amphibian', emoji: '🐸', fact: 'Amphibians can live both in water and on land.' },
  { question: 'Which bird cannot fly?', answer: 'Penguin', emoji: '🐧', fact: 'Penguins use their wings as flippers to swim at up to 25 mph.' },
  { question: 'What do carnivores eat?', answer: 'Meat', emoji: '🥩', fact: 'Carnivores have sharp teeth called canines for tearing meat.' },
  { question: 'What is a group of wolves called?', answer: 'Pack', emoji: '🐺', fact: 'Wolf packs are led by an alpha pair — usually the parents of the group.' },
  { question: 'Which animal has the longest lifespan?', answer: 'Tortoise', emoji: '🐢', fact: 'Some tortoises live over 150 years — longer than any human!' },
  { question: 'What is the process of a caterpillar becoming a butterfly?', answer: 'Metamorphosis', emoji: '🦋', fact: 'Inside the chrysalis, the caterpillar\'s body completely dissolves and reforms.' },
];

// Tier 3 (11–13): scientific names, ecosystems, evolution
const QUESTIONS_HARD: Omit<Question, 'options'>[] = [
  { question: 'What is the scientific study of animals called?', answer: 'Zoology', emoji: '🔬', fact: 'Zoologists study everything from animal behaviour to genetics.' },
  { question: 'Which gas do plants produce that animals need?', answer: 'Oxygen', emoji: '🌳', fact: 'A single tree can produce enough oxygen for 4 people to breathe for a year.' },
  { question: 'What is the term for animals that are active at night?', answer: 'Nocturnal', emoji: '🦉', fact: 'Nocturnal animals often have larger eyes to see better in the dark.' },
  { question: 'What is the largest organ of the human body?', answer: 'Skin', emoji: '🧬', fact: 'The skin of an average adult covers about 2 square metres.' },
  { question: 'What is the process by which plants make food using sunlight?', answer: 'Photosynthesis', emoji: '☀️', fact: 'Photosynthesis converts CO₂ and water into glucose and oxygen.' },
  { question: 'What is an invertebrate?', answer: 'Animal without a backbone', emoji: '🦑', fact: 'About 97% of all animal species on Earth are invertebrates.' },
  { question: 'What is the term for animals that eat both plants and meat?', answer: 'Omnivore', emoji: '🐻', fact: 'Humans are omnivores — we can digest both plant and animal foods.' },
  { question: 'What is the name of the process where animals sleep through winter?', answer: 'Hibernation', emoji: '🐻', fact: 'During hibernation, a bear\'s heart rate drops from 55 to just 8 beats per minute.' },
  { question: 'What is the term for a species found nowhere else on Earth?', answer: 'Endemic', emoji: '🦘', fact: 'Australia has many endemic species, including kangaroos and koalas.' },
  { question: 'What is the food chain relationship between predator and prey?', answer: 'Predator eats prey', emoji: '🦅', fact: 'Removing a predator from an ecosystem can cause prey populations to explode.' },
  { question: 'What is the term for animals that migrate seasonally?', answer: 'Migratory', emoji: '🦅', fact: 'Arctic terns migrate 70,000 km each year — the longest migration of any animal.' },
  { question: 'What is the name for the variety of life in an ecosystem?', answer: 'Biodiversity', emoji: '🌍', fact: 'Scientists estimate there are 8.7 million species on Earth, but only 1.2 million have been named.' },
];

const WRONG_POOL_EASY = ['Meat', 'Water', 'Bark', 'Moo', 'Oink', 'Woof', 'Land', 'Air', 'Cub', 'Foal', 'Fins', 'Legs', 'Worms', 'Seeds', 'Milk', 'Eggs', 'Herd', 'Flock', 'Moths', 'Beetles', 'Frogs', 'Tadpoles'];
const WRONG_POOL_MEDIUM = ['Reptile', 'Insect', 'Fish', 'Bird', 'Amphibian', 'Mammal', 'Fungi', 'Meat', 'Plants', 'Insects', 'Antarctic', 'Sahara', 'Amazon', 'Lion', 'Tiger', 'Wolf', 'Shark', 'Eagle', 'Flock', 'Herd', 'Colony', 'Pod', 'Tortoise', 'Parrot', 'Crocodile', 'Metamorphosis', 'Migration', 'Hibernation'];
const WRONG_POOL_HARD = ['Biology', 'Ecology', 'Botany', 'Carbon dioxide', 'Nitrogen', 'Hydrogen', 'Diurnal', 'Crepuscular', 'Arboreal', 'Heart', 'Liver', 'Brain', 'Respiration', 'Transpiration', 'Germination', 'Vertebrate', 'Arthropod', 'Mollusc', 'Carnivore', 'Herbivore', 'Scavenger', 'Migration', 'Dormancy', 'Aestivation', 'Native', 'Invasive', 'Keystone', 'Prey eats predator', 'Symbiosis', 'Parasitism', 'Nomadic', 'Territorial', 'Ecosystem', 'Habitat', 'Niche'];

function buildOptions(answer: string, pool: string[]): string[] {
  const wrongs = pool.filter(w => w.toLowerCase() !== answer.toLowerCase());
  const shuffled = [...wrongs].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...shuffled, answer].sort(() => Math.random() - 0.5);
}

function getQuestions(tier: 1 | 2 | 3): Question[] {
  const base = tier === 1 ? QUESTIONS_EASY : tier === 2 ? QUESTIONS_MEDIUM : QUESTIONS_HARD;
  const pool = tier === 1 ? WRONG_POOL_EASY : tier === 2 ? WRONG_POOL_MEDIUM : WRONG_POOL_HARD;
  const shuffled = [...base].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
  return shuffled.map(q => ({ ...q, options: buildOptions(q.answer, pool) }));
}

export default function AnimalKingdomGame() {
  return (
    <>
      <Helmet>
        <title>Animal Kingdom Quiz — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Test your knowledge of the animal kingdom! A fun science quiz for children aged 5–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/animal-kingdom" />
        <meta property="og:title" content="Animal Kingdom Quiz — Sodafom" />
        <meta property="og:description" content="Test your knowledge of the animal kingdom! A fun science quiz for children aged 5–13 on Sodafom." />
        <meta property="og:url" content="https://sodafom.uk/games/animal-kingdom" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Animal Kingdom Quiz — Sodafom" />
        <meta name="twitter:description" content="Test your knowledge of the animal kingdom! A fun science quiz for children aged 5–13 on Sodafom." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/animal-kingdom#webpage","name":"Animal Kingdom Quiz — Sodafom","url":"https://sodafom.uk/games/animal-kingdom","description":"Test your knowledge of the animal kingdom! A fun science quiz for children aged 5–13 on Sodafom.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Animal Kingdom — Science Game for Kids — Sodafom
      </h1>

      <GameShell title="Animal Kingdom" emoji="🦁" subject="science" ageGroups={['5–7', '8–10', '11–13']}>
        {(onComplete) => <AnimalKingdomPlay onComplete={onComplete} />}
      </GameShell>
    </>
  );
}

function AnimalKingdomPlay({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const { tier } = useChildAge();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showFact, setShowFact] = useState(false);

  useEffect(() => {
    setQuestions(getQuestions(tier));
  }, [tier]);

  const q = questions[round];

  const handleAnswer = useCallback((option: string) => {
    if (feedback) return;
    const isCorrect = option === q.answer;
    setSelected(option);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setCorrect(c => c + 1);
    setShowFact(true);

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
        setShowFact(false);
      }
    }, 2200);
  }, [feedback, q, round, correct, onComplete]);

  if (!q) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">Question {round + 1} of {TOTAL_ROUNDS}</span>
        <span className="text-sm font-bold text-primary">⭐ {correct} correct</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <motion.div
          className="bg-primary h-2 rounded-full"
          animate={{ width: `${((round) / TOTAL_ROUNDS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-card border border-border rounded-2xl p-6 mb-5 text-center shadow-sm">
            <div className="text-6xl mb-4">{q.emoji}</div>
            <p className="text-xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((option) => {
              const isCorrectOption = option === q.answer;
              const isSelected = option === selected;
              let btnClass = 'w-full text-left px-5 py-4 rounded-xl font-bold text-base border-2 transition-all duration-200 ';
              if (!feedback) {
                btnClass += 'bg-card border-border hover:border-primary hover:bg-primary/5 text-foreground cursor-pointer';
              } else if (isCorrectOption) {
                btnClass += 'bg-green-100 border-green-500 text-green-800';
              } else if (isSelected) {
                btnClass += 'bg-red-100 border-red-500 text-red-800';
              } else {
                btnClass += 'bg-muted border-border text-muted-foreground opacity-60';
              }

              return (
                <motion.button
                  key={option}
                  className={btnClass}
                  onClick={() => handleAnswer(option)}
                  whileHover={!feedback ? { scale: 1.02 } : {}}
                  whileTap={!feedback ? { scale: 0.98 } : {}}
                >
                  <span className="mr-2">
                    {feedback && isCorrectOption ? '✅' : feedback && isSelected && !isCorrectOption ? '❌' : ''}
                  </span>
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Fun fact */}
          <AnimatePresence>
            {showFact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-xl border-2 text-sm font-medium ${feedback === 'correct' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}
              >
                <span className="font-black">🔬 Did you know? </span>{q.fact}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
