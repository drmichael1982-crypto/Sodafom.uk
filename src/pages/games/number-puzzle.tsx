import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';

/** Safe 2D array accessor — avoids object-injection lint warnings */
function cell<T>(grid: T[][], r: number, c: number): T | undefined {
  return grid.at(r)?.at(c);
}
function setCell<T>(grid: T[][], r: number, c: number, value: T): void {
  const row = grid.at(r);
  if (row) row.splice(c, 1, value);
}

// A simplified 4x4 number grid puzzle (original design, copyright-free)
// Rules: fill a 4x4 grid so each row and column contains 1,2,3,4 exactly once

const SIZE = 4;
type Grid = (number | null)[][];

function generatePuzzle(): { puzzle: Grid; solution: Grid } {
  const base = [1, 2, 3, 4];
  const solution: Grid = [];
  for (let r = 0; r < SIZE; r++) {
    const row = [...base];
    for (let i = 0; i < r; i++) row.push(row.shift()!);
    solution.push(row);
  }
  const colOrder = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const shuffled: Grid = solution.map(row => colOrder.map(c => row.at(c) ?? null));
  const puzzle: Grid = shuffled.map(row => row.map(v => (Math.random() > 0.5 ? v : null)));
  return { puzzle, solution: shuffled };
}

const COLORS = ['', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700'];
function colorFor(n: number | null | undefined): string {
  if (n == null || n < 0 || n >= COLORS.length) return '';
  return COLORS.at(n) ?? '';
}

function NumberPuzzleInner({ onComplete, onQuestionChange }: { onComplete: (result: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const [{ puzzle, solution }] = useState(generatePuzzle);
  const [grid, setGrid] = useState<Grid>(puzzle.map(row => [...row]));
  const [fixed] = useState<boolean[][]>(puzzle.map(row => row.map(v => v !== null)));
  const [errors, setErrors] = useState<boolean[][]>(Array.from({ length: SIZE }, () => Array(SIZE).fill(false)));
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [selected, setSelected] = useState<[number, number] | null>(null);

  useEffect(() => { onQuestionChange?.('Fill in the number grid so each row and column has the correct numbers.'); }, [onQuestionChange]);

  const handleCellClick = (r: number, c: number) => {
    if (cell(fixed, r, c) || done) return;
    setSelected([r, c]);
  };

  const handleNumberInput = (n: number) => {
    if (!selected || done) return;
    const [r, c] = selected;
    if (cell(fixed, r, c)) return;
    const newGrid = grid.map(row => [...row]);
    setCell(newGrid, r, c, n);
    setGrid(newGrid);

    const complete = newGrid.every((row, ri) => row.every((v, ci) => v === cell(solution, ri, ci)));
    if (complete) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const score = Math.max(100 - elapsed, 20);
      const stars = score >= 90 ? 3 : score >= 75 ? 2 : score >= 50 ? 1 : 0;
      setDone(true);
      onComplete({ score, correct: SIZE * SIZE, total: SIZE * SIZE, stars });
    }

    const newErrors = newGrid.map((row, ri) => row.map((v, ci) => v !== null && v !== cell(solution, ri, ci)));
    setErrors(newErrors);
  };

  const handleClear = () => {
    if (!selected || done) return;
    const [r, c] = selected;
    if (cell(fixed, r, c)) return;
    const newGrid = grid.map(row => [...row]);
    setCell(newGrid, r, c, null);
    setGrid(newGrid);
    const newErrors = newGrid.map((row, ri) => row.map((v, ci) => v !== null && v !== cell(solution, ri, ci)));
    setErrors(newErrors);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <p className="text-muted-foreground text-sm text-center">Each row and column must contain 1, 2, 3 and 4 exactly once.</p>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isSel = selected?.[0] === r && selected?.[1] === c;
            const isFixed = cell(fixed, r, c);
            const hasError = cell(errors, r, c);
            return (
              <motion.button
                key={`${r}-${c}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCellClick(r, c)}
                className={`w-14 h-14 rounded-xl text-2xl font-black border-2 transition-all
                  ${isFixed ? `${val ? colorFor(val) : ''} border-border cursor-default` : ''}
                  ${!isFixed && isSel ? 'border-primary bg-primary/10' : ''}
                  ${!isFixed && !isSel ? 'border-border bg-card hover:border-primary/50 cursor-pointer' : ''}
                  ${hasError ? 'border-red-400 bg-red-50 text-red-600' : ''}
                `}
                disabled={isFixed}
                aria-label={`Row ${r + 1} column ${c + 1}: ${val ?? 'empty'}`}
              >
                {val ?? ''}
              </motion.button>
            );
          })
        )}
      </div>

      <div className="flex gap-3">
        {[1, 2, 3, 4].map(n => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleNumberInput(n)}
            className={`w-12 h-12 rounded-xl text-xl font-black border-2 border-border ${colorFor(n)} hover:scale-110 transition-transform`}
          >
            {n}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleClear}
          className="w-12 h-12 rounded-xl text-sm font-bold border-2 border-border bg-muted text-muted-foreground hover:scale-110 transition-transform"
        >
          ✕
        </motion.button>
      </div>
    </div>
  );
}

export default function NumberPuzzleGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Number Puzzle — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Solve number puzzles and sharpen your maths skills. A brain-training game for children aged 8–13." />
        <link rel="canonical" href="https://sodafom.uk/games/number-puzzle" />
        <meta property="og:title" content="Number Puzzle — Sodafom" />
        <meta property="og:description" content="Solve number puzzles and sharpen your maths skills. A brain-training game for children aged 8–13." />
        <meta property="og:url" content="https://sodafom.uk/games/number-puzzle" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Number Puzzle — Sodafom" />
        <meta name="twitter:description" content="Solve number puzzles and sharpen your maths skills. A brain-training game for children aged 8–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/number-puzzle#webpage","name":"Number Puzzle — Sodafom","url":"https://sodafom.uk/games/number-puzzle","description":"Solve number puzzles and sharpen your maths skills. A brain-training game for children aged 8–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Number Grid Puzzle — Sodafom
      </h1>
      <GameShell
        title="Number Grid"
        emoji="🔢"
        subject="maths"
        ageGroups={['7–10', '11–13']}
        currentQuestion={currentQuestion}
      >
        {(onComplete) => <NumberPuzzleInner onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
