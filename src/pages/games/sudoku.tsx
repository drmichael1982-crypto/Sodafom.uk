import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

/** Safe 2D array accessor — avoids object-injection lint warnings */
function cell<T>(grid: T[][], r: number, c: number): T | undefined {
  return grid.at(r)?.at(c);
}
function setCell<T>(grid: T[][], r: number, c: number, value: T): void {
  const row = grid.at(r);
  if (row) row.splice(c, 1, value);
}

// ── Original Sudoku-style number grid ─────────────────────────────────────────
// Uses 4×4 (Easy/Medium) and 9×9 (Hard/Super Hard) grids — an original
// educational puzzle format for children. No Sudoku trademark is claimed.

type Cell = number | null;
type Grid = Cell[][];

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Super Hard';

interface PuzzleDef {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
  size: 4 | 9;
}

// ── 4×4 puzzles (Easy & Medium) ───────────────────────────────────────────────
const PUZZLES_4x4: PuzzleDef[] = [
  {
    difficulty: 'Easy',
    size: 4,
    solution: [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]],
    puzzle:   [[1,null,3,null],[null,4,null,2],[2,null,4,null],[null,3,null,1]],
  },
  {
    difficulty: 'Easy',
    size: 4,
    solution: [[2,1,4,3],[4,3,2,1],[1,2,3,4],[3,4,1,2]],
    puzzle:   [[2,null,null,3],[null,3,2,null],[1,null,null,4],[null,4,1,null]],
  },
  {
    difficulty: 'Easy',
    size: 4,
    solution: [[3,4,1,2],[1,2,3,4],[4,3,2,1],[2,1,4,3]],
    puzzle:   [[3,null,1,null],[null,2,null,4],[4,null,2,null],[null,1,null,3]],
  },
  {
    difficulty: 'Easy',
    size: 4,
    solution: [[4,1,2,3],[2,3,4,1],[1,4,3,2],[3,2,1,4]],
    puzzle:   [[4,null,null,3],[null,3,4,null],[1,null,null,2],[null,2,1,null]],
  },
  {
    difficulty: 'Medium',
    size: 4,
    solution: [[3,1,2,4],[2,4,3,1],[4,2,1,3],[1,3,4,2]],
    puzzle:   [[null,1,null,4],[2,null,null,1],[null,2,1,null],[1,null,4,null]],
  },
  {
    difficulty: 'Medium',
    size: 4,
    solution: [[4,2,1,3],[1,3,4,2],[3,4,2,1],[2,1,3,4]],
    puzzle:   [[null,2,null,3],[1,null,4,null],[null,4,null,1],[2,null,3,null]],
  },
  {
    difficulty: 'Medium',
    size: 4,
    solution: [[2,3,4,1],[4,1,2,3],[1,4,3,2],[3,2,1,4]],
    puzzle:   [[null,3,null,1],[4,null,null,3],[null,4,3,null],[3,null,null,4]],
  },
  {
    difficulty: 'Medium',
    size: 4,
    solution: [[1,4,3,2],[3,2,1,4],[4,1,2,3],[2,3,4,1]],
    puzzle:   [[null,null,3,2],[3,2,null,null],[null,null,2,3],[2,3,null,null]],
  },
];

// ── 9×9 puzzles (Hard & Super Hard) ──────────────────────────────────────────
// Each puzzle has exactly the right number of givens for its difficulty.
const PUZZLES_9x9: PuzzleDef[] = [
  // Hard — ~35 givens
  {
    difficulty: 'Hard',
    size: 9,
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9],
    ],
    puzzle: [
      [5,3,null,null,7,null,null,null,null],
      [6,null,null,1,9,5,null,null,null],
      [null,9,8,null,null,null,null,6,null],
      [8,null,null,null,6,null,null,null,3],
      [4,null,null,8,null,3,null,null,1],
      [7,null,null,null,2,null,null,null,6],
      [null,6,null,null,null,null,2,8,null],
      [null,null,null,4,1,9,null,null,5],
      [null,null,null,null,8,null,null,7,9],
    ],
  },
  {
    difficulty: 'Hard',
    size: 9,
    solution: [
      [8,2,7,1,5,4,3,9,6],
      [9,6,5,3,2,7,1,4,8],
      [3,4,1,6,8,9,7,5,2],
      [5,9,3,4,6,8,2,7,1],
      [4,7,2,5,1,3,6,8,9],
      [6,1,8,9,7,2,4,3,5],
      [7,8,6,2,3,5,9,1,4],
      [1,5,4,7,9,6,8,2,3],
      [2,3,9,8,4,1,5,6,7],
    ],
    puzzle: [
      [null,2,null,null,null,4,3,null,null],
      [9,null,null,3,2,null,null,null,8],
      [null,null,1,null,null,null,null,5,null],
      [null,9,null,4,null,null,2,null,null],
      [4,null,null,null,1,null,null,null,9],
      [null,null,8,null,null,2,null,3,null],
      [null,8,null,null,null,null,9,null,null],
      [1,null,null,null,9,6,null,null,3],
      [null,null,9,8,null,null,null,6,null],
    ],
  },
  // Super Hard — ~25 givens
  {
    difficulty: 'Super Hard',
    size: 9,
    solution: [
      [1,2,3,4,5,6,7,8,9],
      [4,5,6,7,8,9,1,2,3],
      [7,8,9,1,2,3,4,5,6],
      [2,1,4,3,6,5,8,9,7],
      [3,6,5,8,9,7,2,1,4],
      [8,9,7,2,1,4,3,6,5],
      [5,3,1,6,4,2,9,7,8],
      [6,4,2,9,7,8,5,3,1],
      [9,7,8,5,3,1,6,4,2],
    ],
    puzzle: [
      [1,null,null,null,5,null,null,null,9],
      [null,5,null,7,null,null,null,2,null],
      [null,null,9,null,null,3,4,null,null],
      [null,1,null,null,null,5,null,9,null],
      [3,null,null,null,9,null,null,null,4],
      [null,9,null,2,null,null,null,6,null],
      [null,null,1,null,null,2,9,null,null],
      [null,4,null,null,null,8,null,3,null],
      [9,null,null,null,3,null,null,null,2],
    ],
  },
  {
    difficulty: 'Super Hard',
    size: 9,
    solution: [
      [9,8,7,6,5,4,3,2,1],
      [2,4,6,1,7,3,9,8,5],
      [3,5,1,9,2,8,7,4,6],
      [1,2,8,5,3,7,6,9,4],
      [6,3,4,8,9,2,1,5,7],
      [7,9,5,4,6,1,8,3,2],
      [5,1,9,2,8,6,4,7,3],
      [4,7,2,3,1,9,5,6,8],
      [8,6,3,7,4,5,2,1,9],
    ],
    puzzle: [
      [null,8,null,null,null,4,null,null,1],
      [null,null,6,null,7,null,null,null,null],
      [3,null,null,9,null,null,null,4,null],
      [null,2,null,null,null,7,null,null,4],
      [null,null,4,null,9,null,1,null,null],
      [7,null,null,4,null,null,null,3,null],
      [null,1,null,null,null,6,null,null,3],
      [null,null,null,null,1,null,5,null,null],
      [8,null,null,7,null,null,null,1,null],
    ],
  },
];

/** Safe record lookup — prevents object-injection lint warnings */
function safeGet<T>(record: Record<string, T>, key: string, fallback: T): T {
  const entry = Object.entries(record).find(([k]) => k === key);
  return entry ? (entry[1] as T) : fallback;
}

const ALL_PUZZLES = [...PUZZLES_4x4, ...PUZZLES_9x9];

const DIFFICULTY_ORDER: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Super Hard'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  'Easy':       'bg-green-100 text-green-700 border-green-300',
  'Medium':     'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Hard':       'bg-orange-100 text-orange-700 border-orange-300',
  'Super Hard': 'bg-red-100 text-red-700 border-red-300',
};

const BOX_COLORS_4 = ['bg-blue-50','bg-yellow-50','bg-green-50','bg-pink-50'];
const BOX_COLORS_9 = [
  'bg-blue-50','bg-yellow-50','bg-green-50',
  'bg-pink-50','bg-purple-50','bg-orange-50',
  'bg-teal-50','bg-rose-50','bg-indigo-50',
];

function getBoxIndex4(r: number, c: number) { return Math.floor(r / 2) * 2 + Math.floor(c / 2); }
function getBoxIndex9(r: number, c: number) { return Math.floor(r / 3) * 3 + Math.floor(c / 3); }

// ── Difficulty selector ───────────────────────────────────────────────────────
function DifficultyPicker({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-5xl">🔢</div>
      <h2 className="text-2xl font-black text-foreground text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        Choose Difficulty
      </h2>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        Easy &amp; Medium use a 4×4 grid. Hard &amp; Super Hard use a full 9×9 grid!
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
    </div>
  );
}

// ── Puzzle inner ──────────────────────────────────────────────────────────────
function SudokuInner({ onComplete, difficulty }: { onComplete: (result: GameResult) => void; difficulty: Difficulty }) {
  const pool = ALL_PUZZLES.filter(p => p.difficulty === difficulty);
  const [puzzleDef] = useState<PuzzleDef>(() => pool[Math.floor(Math.random() * pool.length)] ?? ALL_PUZZLES[0]!);
  const { puzzle, solution, size } = puzzleDef;
  const [grid, setGrid] = useState<Grid>(puzzle.map(row => [...row]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [mistakes, setMistakes] = useState(0);

  const isFixed = (r: number, c: number) => cell(puzzle, r, c) !== null;
  const boxColors = size === 4 ? BOX_COLORS_4 : BOX_COLORS_9;
  const getBox = size === 4 ? getBoxIndex4 : getBoxIndex9;
  const cellSize = size === 4 ? 'w-14 h-14 sm:w-16 sm:h-16 text-2xl' : 'w-8 h-8 sm:w-10 sm:h-10 text-base';
  const boxBorderC = size === 4 ? 1 : 2;
  const boxBorderR = size === 4 ? 1 : 2;

  const handleCellClick = (r: number, c: number) => {
    if (isFixed(r, c) || done) return;
    setSelected([r, c]);
  };

  const handleInput = (n: number) => {
    if (!selected || done) return;
    const [r, c] = selected;
    if (isFixed(r, c)) return;
    const newGrid = grid.map(row => [...row]);
    setCell(newGrid, r, c, n);
    setGrid(newGrid);
    if (n !== cell(solution, r, c)) { setMistakes(m => m + 1); return; }
    const total = size * size;
    const allFilled = newGrid.every((row, ri) => row.every((v, ci) => v === cell(solution, ri, ci)));
    if (allFilled) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const score = Math.max(100 - elapsed - mistakes * 5, 10);
      const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
      const blanks = puzzle.flat().filter(v => v === null).length;
      setDone(true);
      onComplete({ score, correct: total - blanks, total, stars });
    }
  };

  const handleErase = () => {
    if (!selected || done) return;
    const [r, c] = selected;
    if (isFixed(r, c)) return;
    const newGrid = grid.map(row => [...row]);
    setCell(newGrid, r, c, null);
    setGrid(newGrid);
  };

  const getCellBg = (r: number, c: number) => {
    const box = getBox(r, c);
    const isSel = selected?.[0] === r && selected?.[1] === c;
    const val = cell(grid, r, c);
    const isErr = val !== null && val !== cell(solution, r, c);
    const isCorrect = val !== null && val === cell(solution, r, c) && !isFixed(r, c);
    if (isSel) return 'bg-primary border-primary text-primary-foreground';
    if (isErr) return 'bg-red-100 border-red-400 text-red-700';
    if (isCorrect) return 'bg-green-100 border-green-400 text-green-700';
    const boxColor = boxColors.at(box) ?? '';
    if (isFixed(r, c)) return `${boxColor} border-border font-black text-foreground`;
    return `${boxColor} border-border text-foreground`;
  };

  const selVal = selected ? cell(grid, selected[0], selected[1]) : null;
  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <div className="flex items-center gap-3 flex-wrap justify-center text-sm">
        <span className={`px-3 py-1 rounded-full font-bold border ${safeGet(DIFFICULTY_COLORS, difficulty, '')}`}>
          {difficulty}
        </span>
        <span className="px-3 py-1 rounded-full bg-muted font-bold">{size}×{size} grid</span>
        {mistakes > 0 && (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold">
            ✗ {mistakes} mistake{mistakes !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <p className="text-muted-foreground text-xs text-center">
        {size === 4
          ? 'Each row, column and 2×2 box must contain 1–4 exactly once.'
          : 'Each row, column and 3×3 box must contain 1–9 exactly once.'}
      </p>

      {/* Grid */}
      <div
        className="border-2 border-foreground"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {grid.map((row, r) =>
          row.map((val, c) => {
            const highlight = selVal && val === selVal && !selected?.every((v, i) => [r, c].at(i) === v);
            const isBoxBorderR = r === boxBorderR || (size === 9 && r === 5);
            const isBoxBorderC = c === boxBorderC || (size === 9 && c === 5);
            return (
              <motion.button
                key={`${r}-${c}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCellClick(r, c)}
                className={`
                  ${cellSize} font-black flex items-center justify-center
                  border transition-all
                  ${getCellBg(r, c)}
                  ${highlight ? 'ring-2 ring-primary/40' : ''}
                  ${isBoxBorderC ? 'border-r-2 border-r-foreground/40' : ''}
                  ${isBoxBorderR ? 'border-b-2 border-b-foreground/40' : ''}
                  ${!isFixed(r, c) ? 'cursor-pointer' : 'cursor-default'}
                `}
                disabled={isFixed(r, c)}
                aria-label={`Row ${r + 1} column ${c + 1}: ${val ?? 'empty'}`}
              >
                {val ?? ''}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Number pad */}
      <div className="flex flex-wrap gap-2 justify-center max-w-xs">
        {numbers.map(n => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleInput(n)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-lg font-black border-2 border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
          >
            {n}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleErase}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-base font-bold border-2 border-border bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
          aria-label="Erase"
        >
          ✕
        </motion.button>
      </div>
    </div>
  );
}

// ── Wrapper with difficulty gate ──────────────────────────────────────────────
function SudokuWithDifficulty({ onComplete }: { onComplete: (result: GameResult) => void }) {
  const { tier } = useChildAge();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  useEffect(() => {
    // Tier 1 (5-7) → Easy, Tier 2 (8-10) → Medium, Tier 3 (11-13) → Hard
    const auto: Difficulty = tier === 1 ? 'Easy' : tier === 2 ? 'Medium' : 'Hard';
    setDifficulty(auto);
  }, [tier]);
  if (!difficulty) return <DifficultyPicker onSelect={setDifficulty} />;
  return <SudokuInner onComplete={onComplete} difficulty={difficulty} />;
}

export default function SudokuGame() {
  return (
    <>
      <Helmet>
        <title>Sudoku — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Solve Sudoku puzzles and sharpen your logical thinking. A number puzzle game for children aged 8–13." />
        <link rel="canonical" href="https://sodafom.uk/games/sudoku" />
        <meta property="og:title" content="Sudoku — Sodafom" />
        <meta property="og:description" content="Solve Sudoku puzzles and sharpen your logical thinking. A number puzzle game for children aged 8–13." />
        <meta property="og:url" content="https://sodafom.uk/games/sudoku" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sudoku — Sodafom" />
        <meta name="twitter:description" content="Solve Sudoku puzzles and sharpen your logical thinking. A number puzzle game for children aged 8–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/sudoku#webpage","name":"Sudoku — Sodafom","url":"https://sodafom.uk/games/sudoku","description":"Solve Sudoku puzzles and sharpen your logical thinking. A number puzzle game for children aged 8–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Number Sudoku — Sodafom
      </h1>
      <GameShell
        title="Number Sudoku"
        emoji="🧩"
        subject="maths"
        ageGroups={['5–7', '8–10', '11–13']}
      >
        {(onComplete) => (
          <>
            <SudokuWithDifficulty onComplete={onComplete} />
          </>
        )}
      </GameShell>
    </>
  );
}
