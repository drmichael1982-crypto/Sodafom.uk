import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

// ── Types ─────────────────────────────────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Fraction {
  label: string;
  numerator: number;
  denominator: number;
  slices: number;
  fill: number;
  description?: string;
}

// ── Safe record lookup (prevents object injection lint warnings) ──────────────
function safeGet<T>(record: Record<string, T>, key: string, fallback: T): T {
  const entry = Object.entries(record).find(([k]) => k === key);
  return entry ? (entry[1] as T) : fallback;
}

// ── Fraction sets by difficulty ───────────────────────────────────────────────
const FRACTIONS_EASY: Fraction[] = [
  { label: '½',  numerator: 1, denominator: 2, slices: 2, fill: 1, description: 'one half' },
  { label: '¼',  numerator: 1, denominator: 4, slices: 4, fill: 1, description: 'one quarter' },
  { label: '¾',  numerator: 3, denominator: 4, slices: 4, fill: 3, description: 'three quarters' },
  { label: '⅓',  numerator: 1, denominator: 3, slices: 3, fill: 1, description: 'one third' },
  { label: '⅔',  numerator: 2, denominator: 3, slices: 3, fill: 2, description: 'two thirds' },
  { label: '2/4', numerator: 2, denominator: 4, slices: 4, fill: 2, description: 'two quarters' },
];

const FRACTIONS_MEDIUM: Fraction[] = [
  { label: '⅛',  numerator: 1, denominator: 8, slices: 8, fill: 1 },
  { label: '⅜',  numerator: 3, denominator: 8, slices: 8, fill: 3 },
  { label: '⅝',  numerator: 5, denominator: 8, slices: 8, fill: 5 },
  { label: '⅞',  numerator: 7, denominator: 8, slices: 8, fill: 7 },
  { label: '2/6', numerator: 2, denominator: 6, slices: 6, fill: 2 },
  { label: '4/6', numerator: 4, denominator: 6, slices: 6, fill: 4 },
  { label: '5/6', numerator: 5, denominator: 6, slices: 6, fill: 5 },
  { label: '3/5', numerator: 3, denominator: 5, slices: 5, fill: 3 },
  { label: '2/5', numerator: 2, denominator: 5, slices: 5, fill: 2 },
  { label: '4/5', numerator: 4, denominator: 5, slices: 5, fill: 4 },
];

const FRACTIONS_HARD: Fraction[] = [
  { label: '3/9',  numerator: 3, denominator: 9, slices: 9, fill: 3 },
  { label: '6/9',  numerator: 6, denominator: 9, slices: 9, fill: 6 },
  { label: '7/9',  numerator: 7, denominator: 9, slices: 9, fill: 7 },
  { label: '2/10', numerator: 2, denominator: 10, slices: 10, fill: 2 },
  { label: '4/10', numerator: 4, denominator: 10, slices: 10, fill: 4 },
  { label: '7/10', numerator: 7, denominator: 10, slices: 10, fill: 7 },
  { label: '9/10', numerator: 9, denominator: 10, slices: 10, fill: 9 },
  { label: '5/12', numerator: 5, denominator: 12, slices: 12, fill: 5 },
  { label: '7/12', numerator: 7, denominator: 12, slices: 12, fill: 7 },
  { label: '11/12', numerator: 11, denominator: 12, slices: 12, fill: 11 },
];

const FRACTION_SETS: Record<Difficulty, Fraction[]> = {
  'Easy':   FRACTIONS_EASY,
  'Medium': FRACTIONS_MEDIUM,
  'Hard':   FRACTIONS_HARD,
};

const TOTAL_ROUNDS = 8;

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  'Easy':   'bg-green-100 text-green-700 border-green-300',
  'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Hard':   'bg-red-100 text-red-700 border-red-300',
};

// ── Pizza slice SVG ───────────────────────────────────────────────────────────
function PizzaSlice({
  total, index, selected, onClick,
}: {
  total: number; index: number; selected: boolean; onClick: () => void;
}) {
  const angle = 360 / total;
  const startAngle = index * angle - 90;
  const endAngle = startAngle + angle;
  const r = 80;
  const cx = 100; const cy = 100;
  const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
  const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
  const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
  const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
  const largeArc = angle > 180 ? 1 : 0;
  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

  return (
    <path
      d={d}
      fill={selected ? '#FFD700' : '#fde68a'}
      stroke="#92400e"
      strokeWidth="2"
      onClick={onClick}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    />
  );
}

// ── Difficulty picker ─────────────────────────────────────────────────────────
function DifficultyPicker({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-5xl">🍕</div>
      <h2 className="text-2xl font-black text-foreground text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        Choose Difficulty
      </h2>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        Shade the correct number of pizza slices to match the fraction shown!
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
          <motion.button
            key={d}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(d)}
            className={`py-4 px-5 rounded-2xl font-black text-base border-2 transition-all shadow-sm flex items-center justify-between ${safeGet(DIFFICULTY_COLORS, d, '')}`}
          >
            <span>
              {d === 'Easy' && '😊 '}
              {d === 'Medium' && '🤔 '}
              {d === 'Hard' && '🔥 '}
              {d}
            </span>
            <span className="text-xs font-bold opacity-70">
              {d === 'Easy' && 'Halves, quarters, thirds'}
              {d === 'Medium' && 'Fifths, sixths, eighths'}
              {d === 'Hard' && 'Ninths, tenths, twelfths'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Game inner ────────────────────────────────────────────────────────────────
function FractionPizzaPlay({
  onComplete,
  difficulty,
}: {
  onComplete: (r: GameResult) => void;
  difficulty: Difficulty;
}) {
  const pool = safeGet(FRACTION_SETS as Record<string, Fraction[]>, difficulty, FRACTION_SETS['Easy']);
  const [shuffled] = useState<Fraction[]>(() => [...pool].sort(() => Math.random() - 0.5));
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const frac = shuffled.at(round % shuffled.length)!;

  const toggleSlice = (i: number) => {
    if (feedback) return;
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const checkAnswer = () => {
    if (feedback) return;
    const isRight = selected.length === frac.fill;
    setFeedback(isRight ? 'correct' : 'wrong');
    const newCorrect = isRight ? correct + 1 : correct;
    if (isRight) setCorrect(newCorrect);
    setTimeout(() => {
      const next = round + 1;
      if (next >= TOTAL_ROUNDS) {
        const score = Math.round((newCorrect / TOTAL_ROUNDS) * 100);
        const stars = score >= 90 ? 3 : score >= 75 ? 2 : score >= 50 ? 1 : 0;
        onComplete({ score, correct: newCorrect, total: TOTAL_ROUNDS, stars });
      } else {
        setRound(next);
        setSelected([]);
        setFeedback(null);
      }
    }, 1100);
  };

  // Toppings placed at fixed angles so they don't overlap slice lines
  const toppingAngles = [30, 150, 270];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-background">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
          <span>Round {round + 1} / {TOTAL_ROUNDS}</span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${safeGet(DIFFICULTY_COLORS, difficulty, '')}`}>
              {difficulty}
            </span>
            <span>⭐ {correct} correct</span>
          </div>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Fraction prompt */}
      <motion.div
        key={round}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <p className="text-base font-bold text-muted-foreground mb-1">Shade this fraction of the pizza</p>
        <p className="text-5xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          {frac.label}
        </p>
        {frac.description && (
          <p className="text-sm text-muted-foreground mt-1 italic">({frac.description})</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Select <strong>{frac.fill}</strong> slice{frac.fill !== 1 ? 's' : ''} out of <strong>{frac.denominator}</strong>
        </p>
      </motion.div>

      {/* Pizza SVG */}
      <motion.div
        key={`pizza-${round}`}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative mb-5"
      >
        <svg width="210" height="210" viewBox="0 0 200 200">
          {/* Crust */}
          <circle cx="100" cy="100" r="84" fill="#d97706" />
          {/* Base */}
          <circle cx="100" cy="100" r="80" fill="#fde68a" />
          {/* Slices */}
          {Array.from({ length: frac.slices }).map((_, i) => (
            <PizzaSlice
              key={i}
              total={frac.slices}
              index={i}
              selected={selected.includes(i)}
              onClick={() => toggleSlice(i)}
            />
          ))}
          {/* Toppings */}
          {toppingAngles.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <text
                key={i}
                x={100 + 38 * Math.cos(rad)}
                y={100 + 38 * Math.sin(rad)}
                fontSize="13"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {['🫑', '🍄', '🫒'].at(i)}
              </text>
            );
          })}
        </svg>
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-2xl font-black mb-4 ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}
          >
            {feedback === 'correct'
              ? '🎉 Perfect slice!'
              : `❌ Need ${frac.fill} slice${frac.fill !== 1 ? 's' : ''} — that's ${frac.label}!`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setSelected([])}
          disabled={!!feedback}
          className="px-5 py-3 rounded-xl font-bold bg-muted text-foreground border border-border disabled:opacity-50"
        >
          Clear
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={checkAnswer}
          disabled={!!feedback || selected.length === 0}
          className="px-8 py-3 rounded-xl font-black bg-primary text-primary-foreground disabled:opacity-50 shadow-md"
        >
          Serve it! 🍕
        </motion.button>
      </div>

      {/* Hint for hard mode */}
      {difficulty === 'Hard' && (
        <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
          💡 Tip: Count the total slices first, then shade the right number!
        </p>
      )}
    </div>
  );
}

// ── Wrapper with difficulty gate ──────────────────────────────────────────────
function FractionPizzaWithDifficulty({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const { tier } = useChildAge();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  useEffect(() => {
    const auto: Difficulty = tier === 1 ? 'Easy' : tier === 2 ? 'Medium' : 'Hard';
    setDifficulty(auto);
  }, [tier]);
  if (!difficulty) return <DifficultyPicker onSelect={setDifficulty} />;
  return <FractionPizzaPlay onComplete={onComplete} difficulty={difficulty} />;
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function FractionPizzaGame() {
  return (
    <>
      <Helmet>
        <title>Fraction Pizza — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Learn fractions by making pizzas! A delicious maths game for children aged 8–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/fraction-pizza" />
        <meta property="og:title" content="Fraction Pizza — Sodafom" />
        <meta property="og:description" content="Learn fractions by making pizzas! A delicious maths game for children aged 8–13 on Sodafom." />
        <meta property="og:url" content="https://sodafom.uk/games/fraction-pizza" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fraction Pizza — Sodafom" />
        <meta name="twitter:description" content="Learn fractions by making pizzas! A delicious maths game for children aged 8–13 on Sodafom." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/fraction-pizza#webpage","name":"Fraction Pizza — Sodafom","url":"https://sodafom.uk/games/fraction-pizza","description":"Learn fractions by making pizzas! A delicious maths game for children aged 8–13 on Sodafom.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Fraction Pizza — Maths Game for Kids — Sodafom
      </h1>

      <GameShell title="Fraction Pizza" emoji="🍕" subject="maths" ageGroups={['5–7', '8–10', '11–13']}>
        {(onComplete) => <FractionPizzaWithDifficulty onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
