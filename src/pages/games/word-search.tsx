import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Super Hard';

const DIFFICULTY_ORDER: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Super Hard'];

/** Safe record lookup — prevents object-injection lint warnings */
function safeGet<T>(record: Record<string, T>, key: string, fallback: T): T {
  const entry = Object.entries(record).find(([k]) => k === key);
  return entry ? (entry[1] as T) : fallback;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  'Easy':       'bg-green-100 text-green-700 border-green-300',
  'Medium':     'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Hard':       'bg-orange-100 text-orange-700 border-orange-300',
  'Super Hard': 'bg-red-100 text-red-700 border-red-300',
};

// Word lists by difficulty
const WORD_LISTS: Record<Difficulty, string[][]> = {
  'Easy': [
    ['CAT', 'DOG', 'FOX', 'OWL', 'BEE', 'ANT', 'COW', 'HEN'],
    ['RED', 'BLUE', 'PINK', 'GOLD', 'TAN', 'TAN', 'SKY', 'SUN'],
    ['ONE', 'TWO', 'SIX', 'TEN', 'ADD', 'SUM', 'NUM', 'SET'],
  ],
  'Medium': [
    ['CAT', 'DOG', 'FOX', 'OWL', 'BEE', 'ANT', 'COW', 'HEN', 'PIG', 'RAT'],
    ['RED', 'BLUE', 'GREEN', 'PINK', 'GOLD', 'GREY', 'TAN', 'LIME', 'ROSE', 'TEAL'],
    ['ONE', 'TWO', 'SIX', 'TEN', 'FOUR', 'FIVE', 'NINE', 'ZERO', 'PLUS', 'MATH'],
  ],
  'Hard': [
    ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'CHEETAH', 'GORILLA', 'PANTHER', 'LEOPARD'],
    ['READING', 'WRITING', 'SCIENCE', 'HISTORY', 'ENGLISH', 'MATHS', 'MUSIC', 'SPORTS'],
    ['ADDITION', 'SUBTRACT', 'MULTIPLY', 'DIVISION', 'FRACTION', 'DECIMAL', 'ALGEBRA', 'GEOMETRY'],
  ],
  'Super Hard': [
    ['RHINOCEROS', 'CROCODILE', 'FLAMINGO', 'CHAMELEON', 'PORCUPINE', 'WOLVERINE', 'ALBATROSS', 'SALAMANDER'],
    ['MATHEMATICS', 'GEOGRAPHY', 'CHEMISTRY', 'ASTRONOMY', 'PHILOSOPHY', 'LITERATURE', 'PSYCHOLOGY', 'TECHNOLOGY'],
    ['MULTIPLICATION', 'SUBTRACTION', 'CALCULATION', 'PROBABILITY', 'STATISTICS', 'HYPOTHESIS', 'EXPERIMENT', 'CONCLUSION'],
  ],
};

const GRID_SIZES: Record<Difficulty, number> = {
  'Easy': 8,
  'Medium': 10,
  'Hard': 12,
  'Super Hard': 14,
};

const WORD_COUNTS: Record<Difficulty, number> = {
  'Easy': 5,
  'Medium': 6,
  'Hard': 6,
  'Super Hard': 6,
};

// Directions: Easy = horizontal/vertical only; harder = add diagonals
const DIRECTIONS_BY_DIFF: Record<Difficulty, number[][]> = {
  'Easy':       [[0,1],[1,0],[0,-1],[-1,0]],
  'Medium':     [[0,1],[1,0],[1,1],[0,-1],[-1,0]],
  'Hard':       [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[1,-1],[-1,-1]],
  'Super Hard': [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[1,-1],[-1,-1]],
};

/** Safe 2D array accessor */
function gridCell<T>(g: T[][], r: number, c: number): T | undefined {
  return g.at(r)?.at(c);
}
function setGridCell<T>(g: T[][], r: number, c: number, value: T): void {
  const row = g.at(r);
  if (row) row.splice(c, 1, value);
}

type Cell = { letter: string; wordIndex: number | null; direction: string | null };

function buildGrid(words: string[], gridSize: number, directions: number[][]): { grid: Cell[][]; placed: string[] } {
  const grid: Cell[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({ letter: '', wordIndex: null, direction: null }))
  );
  const placed: string[] = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let wi = 0; wi < words.length; wi++) {
    const word = words.at(wi) ?? '';
    let success = false;
    for (let attempt = 0; attempt < 200 && !success; attempt++) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)] ?? [0, 1];
      const maxR = dr === 0 ? gridSize : dr > 0 ? gridSize - word.length : word.length - 1;
      const maxC = dc === 0 ? gridSize : dc > 0 ? gridSize - word.length : word.length - 1;
      const minR = dr < 0 ? word.length - 1 : 0;
      const minC = dc < 0 ? word.length - 1 : 0;
      if (maxR <= minR || maxC <= minC) continue;
      const r = minR + Math.floor(Math.random() * (maxR - minR));
      const c = minC + Math.floor(Math.random() * (maxC - minC));
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) { fits = false; break; }
        const existing = gridCell(grid, nr, nc);
        if (existing?.letter && existing.letter !== word.at(i)) { fits = false; break; }
      }
      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          setGridCell(grid, nr, nc, { letter: word.at(i) ?? '', wordIndex: wi, direction: `${dr},${dc}` });
        }
        placed.push(word);
        success = true;
      }
    }
  }
  for (let r = 0; r < gridSize; r++)
    for (let c = 0; c < gridSize; c++)
      if (!gridCell(grid, r, c)?.letter)
        setGridCell(grid, r, c, { letter: letters.at(Math.floor(Math.random() * letters.length)) ?? 'A', wordIndex: -1, direction: '' });
  return { grid, placed };
}

// ── Difficulty selector ───────────────────────────────────────────────────────
function DifficultyPicker({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-5xl">🔍</div>
      <h2 className="text-2xl font-black text-foreground text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        Choose Difficulty
      </h2>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        Harder levels use bigger grids, longer words, and more directions!
      </p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {DIFFICULTY_ORDER.map(d => (
          <motion.button
            key={d}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(d)}
            className={`py-4 px-3 rounded-2xl font-black text-sm border-2 transition-all shadow-sm ${safeGet(DIFFICULTY_COLORS, d, '')}`}
          >
            {d === 'Easy' && '😊 '}
            {d === 'Medium' && '🤔 '}
            {d === 'Hard' && '😤 '}
            {d === 'Super Hard' && '🔥 '}
            {d}
          </motion.button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>😊 Easy — 8×8 grid, short words, 4 directions</p>
        <p>🤔 Medium — 10×10 grid, 5 directions</p>
        <p>😤 Hard — 12×12 grid, long words, 8 directions</p>
        <p>🔥 Super Hard — 14×14 grid, very long words, all directions</p>
      </div>
    </div>
  );
}

// ── Word Search inner ─────────────────────────────────────────────────────────
function WordSearchInner({ onComplete, difficulty }: { onComplete: (result: GameResult) => void; difficulty: Difficulty }) {
  const gridSize  = safeGet(GRID_SIZES as Record<string, number>, difficulty, 8);
  const wordCount = safeGet(WORD_COUNTS as Record<string, number>, difficulty, 6);
  const directions = safeGet(DIRECTIONS_BY_DIFF as Record<string, typeof DIRECTIONS_BY_DIFF[Difficulty]>, difficulty, DIRECTIONS_BY_DIFF['Easy']);

  const wordPool = safeGet(WORD_LISTS as Record<string, string[][]>, difficulty, WORD_LISTS['Easy']);
  const chosenList = wordPool[Math.floor(Math.random() * wordPool.length)] ?? wordPool[0]!;
  const words = chosenList.slice(0, wordCount);

  const [{ grid, placed }] = useState(() => buildGrid(words, gridSize, directions));
  const [found, setFound] = useState<string[]>([]);
  const [selecting, setSelecting] = useState<[number, number][]>([]);
  const [startTime] = useState(Date.now());

  const getSelectedLetters = () => selecting.map(([r, c]) => gridCell(grid, r, c)?.letter ?? '').join('');

  const handleCellClick = (r: number, c: number) => {
    setSelecting(prev => {
      if (prev.length === 0) return [[r, c]];
      const last = prev[prev.length - 1];
      if (last?.[0] === r && last?.[1] === c) return [];
      return [...prev, [r, c]];
    });
  };

  useEffect(() => {
    if (selecting.length < 2) return;
    const word = getSelectedLetters();
    const rev = word.split('').reverse().join('');
    const match = placed.find(w => w === word || w === rev);
    if (match && !found.includes(match)) {
      const newFound = [...found, match];
      setFound(newFound);
      setSelecting([]);
      if (newFound.length === placed.length) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const score = Math.max(100 - elapsed * 2, 20);
        const stars = score >= 90 ? 3 : score >= 75 ? 2 : score >= 50 ? 1 : 0;
        onComplete({ score, correct: placed.length, total: placed.length, stars });
      }
    }
  }, [selecting]);

  const isSelected = (r: number, c: number) => selecting.some(([sr, sc]) => sr === r && sc === c);
  const isFound = (r: number, c: number) => {
    for (const w of found) {
      const wi = placed.indexOf(w);
      for (let r2 = 0; r2 < gridSize; r2++)
        for (let c2 = 0; c2 < gridSize; c2++)
          if (gridCell(grid, r2, c2)?.wordIndex === wi && r2 === r && c2 === c) return true;
    }
    return false;
  };

  // Cell size shrinks for larger grids
  const cellCls = gridSize <= 8
    ? 'w-9 h-9 sm:w-10 sm:h-10 text-sm'
    : gridSize <= 10
    ? 'w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm'
    : gridSize <= 12
    ? 'w-7 h-7 sm:w-8 sm:h-8 text-xs'
    : 'w-6 h-6 sm:w-7 sm:h-7 text-xs';

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Difficulty badge */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span className={`px-3 py-1 rounded-full font-bold text-sm border ${safeGet(DIFFICULTY_COLORS, difficulty, '')}`}>
          {difficulty}
        </span>
        <span className="text-xs text-muted-foreground">{gridSize}×{gridSize} grid</span>
      </div>

      {/* Words to find */}
      <div className="flex flex-wrap gap-2 justify-center">
        {placed.map(w => (
          <span
            key={w}
            className={`px-3 py-1 rounded-full text-sm font-bold border-2 transition-all ${
              found.includes(w)
                ? 'bg-green-100 border-green-400 text-green-700 line-through'
                : 'bg-white border-border text-foreground'
            }`}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        className="border border-border rounded-lg overflow-hidden"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: '1px', background: 'hsl(var(--border))' }}
      >
        {grid.map((row, r) =>
          row.map((c_cell, c) => (
            <motion.button
              key={`${r}-${c}`}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleCellClick(r, c)}
              className={`${cellCls} font-black flex items-center justify-center transition-all select-none
                ${isFound(r, c)
                  ? 'bg-green-400 text-white'
                  : isSelected(r, c)
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-foreground hover:bg-accent/30'
                }`}
              aria-label={c_cell.letter}
            >
              {c_cell.letter}
            </motion.button>
          ))
        )}
      </div>

      <p className="text-muted-foreground text-xs text-center">
        Click letters to spell a word — click the same cell twice to clear
      </p>
      {selecting.length > 0 && (
        <div className="text-sm font-bold text-primary">Selected: {getSelectedLetters()}</div>
      )}
      <div className="text-xs text-muted-foreground">
        Found: {found.length} / {placed.length}
      </div>
    </div>
  );
}

// ── Wrapper with difficulty gate ──────────────────────────────────────────────
function WordSearchWithDifficulty({ onComplete }: { onComplete: (result: GameResult) => void }) {
  const { tier } = useChildAge();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  useEffect(() => {
    const auto: Difficulty = tier === 1 ? 'Easy' : tier === 2 ? 'Medium' : 'Hard';
    setDifficulty(auto);
  }, [tier]);
  if (!difficulty) return <DifficultyPicker onSelect={setDifficulty} />;
  return <WordSearchInner onComplete={onComplete} difficulty={difficulty} />;
}

export default function WordSearchGame() {
  return (
    <>
      <Helmet>
        <title>Word Search — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Find hidden words in the grid! A fun vocabulary and spelling game for children aged 8–13." />
        <link rel="canonical" href="https://sodafom.uk/games/word-search" />
        <meta property="og:title" content="Word Search — Sodafom" />
        <meta property="og:description" content="Find hidden words in the grid! A fun vocabulary and spelling game for children aged 8–13." />
        <meta property="og:url" content="https://sodafom.uk/games/word-search" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Word Search — Sodafom" />
        <meta name="twitter:description" content="Find hidden words in the grid! A fun vocabulary and spelling game for children aged 8–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/word-search#webpage","name":"Word Search — Sodafom","url":"https://sodafom.uk/games/word-search","description":"Find hidden words in the grid! A fun vocabulary and spelling game for children aged 8–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Word Search — Spelling Game for Kids — Sodafom
      </h1>
      <GameShell
        title="Word Search"
        emoji="🔍"
        subject="spelling"
        ageGroups={['5–7', '8–10', '11–13']}
      >
        {(onComplete) => (
          <>
            <WordSearchWithDifficulty onComplete={onComplete} />
          </>
        )}
      </GameShell>
    </>
  );
}
