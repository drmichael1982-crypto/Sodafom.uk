import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

const TOTAL_ROUNDS = 10;

const SHAPES_BASIC = [
  { name: 'Circle', emoji: '⭕', sides: 0, type: '2D', vertices: 0, faces: 1 },
  { name: 'Triangle', emoji: '🔺', sides: 3, type: '2D', vertices: 3, faces: 1 },
  { name: 'Square', emoji: '🟥', sides: 4, type: '2D', vertices: 4, faces: 1 },
  { name: 'Rectangle', emoji: '▬', sides: 4, type: '2D', vertices: 4, faces: 1 },
];

const SHAPES_ALL = [
  ...SHAPES_BASIC,
  { name: 'Pentagon', emoji: '⬠', sides: 5, type: '2D', vertices: 5, faces: 1 },
  { name: 'Hexagon', emoji: '⬡', sides: 6, type: '2D', vertices: 6, faces: 1 },
  { name: 'Cube', emoji: '🎲', sides: 12, type: '3D', vertices: 8, faces: 6 },
  { name: 'Sphere', emoji: '🔵', sides: 0, type: '3D', vertices: 0, faces: 1 },
  { name: 'Cylinder', emoji: '🥫', sides: 0, type: '3D', vertices: 0, faces: 3 },
  { name: 'Cone', emoji: '🍦', sides: 0, type: '3D', vertices: 1, faces: 2 },
  { name: 'Pyramid', emoji: '🔺', sides: 8, type: '3D', vertices: 5, faces: 5 },
];

type QuestionType = 'sides' | 'type' | 'name' | 'vertices' | 'faces';

function generateQuestion(round: number, tier: 1 | 2 | 3) {
  const pool = tier === 1 ? SHAPES_BASIC : SHAPES_ALL;
  const shape = pool[Math.floor(Math.random() * pool.length)];

  // Tier 1: only name and type; Tier 2: name, type, sides; Tier 3: all including vertices/faces
  let qType: QuestionType;
  if (tier === 1) {
    qType = round < 5 ? 'type' : 'name';
  } else if (tier === 2) {
    qType = round < 4 ? 'type' : round < 7 ? 'sides' : 'name';
  } else {
    qType = round < 3 ? 'type' : round < 5 ? 'sides' : round < 7 ? 'name' : round < 9 ? 'vertices' : 'faces';
  }

  if (qType === 'type') {
    const answer = shape.type;
    const wrong = shape.type === '2D' ? '3D' : '2D';
    return { shape, question: `Is this shape 2D or 3D?`, answer, options: [answer, wrong] };
  }

  if (qType === 'sides') {
    const answer = String(shape.sides);
    const wrongs = new Set<string>();
    while (wrongs.size < 3) {
      const w = String(Math.floor(Math.random() * 8));
      if (w !== answer) wrongs.add(w);
    }
    return { shape, question: `How many sides does a ${shape.name} have?`, answer, options: [...wrongs, answer].sort(() => Math.random() - 0.5) };
  }

  if (qType === 'vertices') {
    const answer = String(shape.vertices);
    const wrongs = new Set<string>();
    while (wrongs.size < 3) {
      const w = String(Math.floor(Math.random() * 9));
      if (w !== answer) wrongs.add(w);
    }
    return { shape, question: `How many vertices (corners) does a ${shape.name} have?`, answer, options: [...wrongs, answer].sort(() => Math.random() - 0.5) };
  }

  if (qType === 'faces') {
    const answer = String(shape.faces);
    const wrongs = new Set<string>();
    while (wrongs.size < 3) {
      const w = String(Math.floor(Math.random() * 7) + 1);
      if (w !== answer) wrongs.add(w);
    }
    return { shape, question: `How many faces does a ${shape.name} have?`, answer, options: [...wrongs, answer].sort(() => Math.random() - 0.5) };
  }

  // name
  const others = pool.filter(s => s.name !== shape.name).sort(() => Math.random() - 0.5).slice(0, 3);
  return { shape, question: `What shape is this?`, answer: shape.name, options: [...others.map(s => s.name), shape.name].sort(() => Math.random() - 0.5) };
}

export default function ShapeSorterGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Shape Sorter — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Sort shapes by colour, size and type! A fun maths and geometry game for children aged 5–10." />
        <link rel="canonical" href="https://sodafom.uk/games/shape-sorter" />
        <meta property="og:title" content="Shape Sorter — Sodafom" />
        <meta property="og:description" content="Sort shapes by colour, size and type! A fun maths and geometry game for children aged 5–10." />
        <meta property="og:url" content="https://sodafom.uk/games/shape-sorter" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shape Sorter — Sodafom" />
        <meta name="twitter:description" content="Sort shapes by colour, size and type! A fun maths and geometry game for children aged 5–10." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/shape-sorter#webpage","name":"Shape Sorter — Sodafom","url":"https://sodafom.uk/games/shape-sorter","description":"Sort shapes by colour, size and type! A fun maths and geometry game for children aged 5–10.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Shape Sorter — Maths Game for Kids — Sodafom
      </h1>

      <GameShell title="Shape Sorter" emoji="🔷" subject="maths" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => <ShapeSorterPlay onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}

function ShapeSorterPlay({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const { tier } = useChildAge();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [q, setQ] = useState(() => generateQuestion(0, tier));
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => { onQuestionChange?.(q.question); }, [q, onQuestionChange]);

  const pick = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    const isRight = opt === q.answer;
    if (isRight) setCorrect(c => c + 1);
    setTimeout(() => {
      const next = round + 1;
      if (next >= TOTAL_ROUNDS) {
        const newCorrect = correct + (isRight ? 1 : 0);
        onComplete({ score: Math.round((newCorrect / TOTAL_ROUNDS) * 100), correct: newCorrect, total: TOTAL_ROUNDS, stars: 0 });
      } else {
        setRound(next);
        setQ(generateQuestion(next, tier));
        setChosen(null);
      }
    }, 900);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-background">
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
          <span>Round {round + 1}/{TOTAL_ROUNDS}</span>
          <span>⭐ {correct} correct</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <motion.div
        key={round}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-9xl mb-4 select-none"
      >
        {q.shape.emoji}
      </motion.div>

      <p className="text-xl font-black text-foreground mb-6 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        {q.question}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map(opt => {
          const isCorrect = opt === q.answer;
          const isChosen = opt === chosen;
          let bg = 'bg-card border-border hover:border-primary/50';
          if (chosen) {
            if (isCorrect) bg = 'bg-green-100 border-green-500';
            else if (isChosen) bg = 'bg-red-100 border-red-500';
          }
          return (
            <motion.button
              key={opt}
              whileHover={!chosen ? { scale: 1.04 } : {}}
              whileTap={!chosen ? { scale: 0.96 } : {}}
              onClick={() => pick(opt)}
              className={`py-4 rounded-2xl font-black text-lg border-2 transition-all ${bg}`}
            >
              {opt}
              {chosen && isCorrect && ' ✅'}
              {chosen && isChosen && !isCorrect && ' ❌'}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
