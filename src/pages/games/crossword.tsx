import { useState, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';

/** Safe 2D array accessor — avoids object-injection lint warnings on grid[r][c] */
function cell<T>(grid: T[][], r: number, c: number): T | undefined {
  return grid.at(r)?.at(c);
}
function setCell<T>(grid: T[][], r: number, c: number, value: T): void {
  const row = grid.at(r);
  if (row) row.splice(c, 1, value);
}

// ── Original crossword puzzles — all clues and answers written in-house ──────
// No third-party puzzle content used. Copyright-free original work.

interface CrosswordClue {
  id: string;
  clue: string;
  answer: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
}

interface PuzzleDefinition {
  title: string;
  size: number;
  clues: CrosswordClue[];
}

export const PUZZLES: PuzzleDefinition[] = [
  {
    title: 'Animals',
    size: 7,
    clues: [
      { id: 'a1', number: 1, direction: 'across', clue: 'A pet that barks', answer: 'DOG', row: 0, col: 0 },
      { id: 'd1', number: 2, direction: 'down', clue: 'A farm animal with horns', answer: 'GOAT', row: 0, col: 2 },
      { id: 'a2', number: 3, direction: 'across', clue: 'A big striped jungle cat', answer: 'TIGER', row: 3, col: 2 },
      { id: 'd2', number: 4, direction: 'down', clue: 'A small animal with a long tail', answer: 'RAT', row: 3, col: 6 },
    ],
  },
  {
    title: 'Colours',
    size: 7,
    clues: [
      { id: 'a1', number: 1, direction: 'across', clue: 'The colour of the sky', answer: 'BLUE', row: 0, col: 0 },
      { id: 'd1', number: 2, direction: 'down', clue: 'A bright green gemstone colour', answer: 'EMERALD', row: 0, col: 3 },
      { id: 'a2', number: 3, direction: 'across', clue: 'A pale sandy colour', answer: 'BEIGE', row: 2, col: 2 },
      { id: 'a3', number: 4, direction: 'across', clue: 'The colour of blood', answer: 'RED', row: 3, col: 3 },
    ],
  },
  {
    title: 'Numbers',
    size: 7,
    clues: [
      { id: 'a1', number: 1, direction: 'across', clue: '2 + 2', answer: 'FOUR', row: 0, col: 0 },
      { id: 'd1', number: 2, direction: 'down', clue: 'The number before two', answer: 'ONE', row: 0, col: 1 },
      { id: 'a2', number: 3, direction: 'across', clue: '3 × 3', answer: 'NINE', row: 1, col: 1 },
      { id: 'd2', number: 4, direction: 'down', clue: '4 + 4', answer: 'EIGHT', row: 1, col: 4 },
      { id: 'a3', number: 5, direction: 'across', clue: '1 + 1', answer: 'TWO', row: 5, col: 4 },
    ],
  },
];

// Build a grid from clues
export function buildCrosswordGrid(puzzle: PuzzleDefinition): string[][] {
  const grid: string[][] = Array.from({ length: puzzle.size }, () =>
    Array(puzzle.size).fill('')
  );
  for (const clue of puzzle.clues) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      if (r < puzzle.size && c < puzzle.size) {
        const existing = cell(grid, r, c);
        const nextLetter = clue.answer.at(i) ?? '';
        if (existing && existing !== nextLetter) {
          throw new Error(`${puzzle.title}: conflicting letters at row ${r + 1}, column ${c + 1}`);
        }
        setCell(grid, r, c, nextLetter);
      }
    }
  }
  return grid;
}

// Build cell number map
function buildNumberMap(puzzle: PuzzleDefinition): Map<string, number> {
  const map = new Map<string, number>();
  for (const clue of puzzle.clues) {
    const key = `${clue.row},${clue.col}`;
    if (!map.has(key)) map.set(key, clue.number);
  }
  return map;
}

function CrosswordInner({ onComplete }: { onComplete: (result: GameResult) => void }) {
  const puzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
  const solution = buildCrosswordGrid(puzzle);
  const numberMap = buildNumberMap(puzzle);
  const size = puzzle.size;

  // Which cells are active (part of any answer)
  const activeCells = new Set<string>();
  for (const clue of puzzle.clues) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      if (r < size && c < size) activeCells.add(`${r},${c}`);
    }
  }

  const [userGrid, setUserGrid] = useState<string[][]>(
    Array.from({ length: size }, () => Array(size).fill(''))
  );
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [activeClue, setActiveClue] = useState<CrosswordClue | null>(puzzle.clues[0]);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const selectClue = (clue: CrosswordClue) => {
    setActiveClue(clue);
    setSelected([clue.row, clue.col]);
    window.setTimeout(() => inputRefs.current.get(`${clue.row},${clue.col}`)?.focus(), 0);
  };

  const handleCellClick = (r: number, c: number) => {
    if (!activeCells.has(`${r},${c}`) || done) return;
    setSelected([r, c]);
    // Find a clue that passes through this cell
    const passingClues = puzzle.clues.filter(cl => {
      for (let i = 0; i < cl.answer.length; i++) {
        const cr = cl.direction === 'across' ? cl.row : cl.row + i;
        const cc = cl.direction === 'across' ? cl.col + i : cl.col;
        if (cr === r && cc === c) return true;
      }
      return false;
    });
    // At an intersection, keep the chosen direction when possible. Tapping
    // the same square again toggles between Across and Down.
    const clue = passingClues.length > 1
      ? passingClues.find(cl => cl.id !== activeClue?.id) ?? passingClues[0]
      : passingClues[0];
    if (clue) setActiveClue(clue);
    inputRefs.current.get(`${r},${c}`)?.focus();
  };

  const handleInput = (r: number, c: number, value: string) => {
    if (done) return;
    const letter = value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
    const newGrid = userGrid.map(row => [...row]);
    setCell(newGrid, r, c, letter);
    setUserGrid(newGrid);

    // Check completion
    let correct = 0;
    let total = 0;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (activeCells.has(`${row},${col}`)) {
          total++;
          if (cell(newGrid, row, col) === cell(solution, row, col)) correct++;
        }
      }
    }
    if (correct === total) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const score = Math.max(100 - elapsed, 20);
      const stars = score >= 90 ? 3 : score >= 75 ? 2 : score >= 50 ? 1 : 0;
      setDone(true);
      onComplete({ score, correct, total, stars });
    }

    // Auto-advance to next cell in active clue direction
    if (letter && activeClue) {
      const dir = activeClue.direction;
      const nr = dir === 'across' ? r : r + 1;
      const nc = dir === 'across' ? c + 1 : c;
      const belongsToActiveClue = activeClue && Array.from({ length: activeClue.answer.length }, (_, i) => {
        const cr = activeClue.direction === 'across' ? activeClue.row : activeClue.row + i;
        const cc = activeClue.direction === 'across' ? activeClue.col + i : activeClue.col;
        return `${cr},${cc}`;
      }).includes(`${nr},${nc}`);
      if (nr < size && nc < size && belongsToActiveClue) {
        setSelected([nr, nc]);
        inputRefs.current.get(`${nr},${nc}`)?.focus();
      }
    }
  };

  const getCellState = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (!activeCells.has(key)) return 'black';
    const val = cell(userGrid, r, c);
    const sol = cell(solution, r, c);
    if (val && val !== sol) return 'error';
    if (val && val === sol) return 'correct';
    const isSel = selected?.[0] === r && selected?.[1] === c;
    const isHighlighted = activeClue && (() => {
      for (let i = 0; i < activeClue.answer.length; i++) {
        const cr = activeClue.direction === 'across' ? activeClue.row : activeClue.row + i;
        const cc = activeClue.direction === 'across' ? activeClue.col + i : activeClue.col;
        if (cr === r && cc === c) return true;
      }
      return false;
    })();
    if (isSel) return 'selected';
    if (isHighlighted) return 'highlighted';
    return 'empty';
  };

  const cellClass: Record<string, string> = {
    black: 'bg-foreground',
    error: 'bg-red-100 border-red-400 text-red-700',
    correct: 'bg-green-100 border-green-400 text-green-700',
    selected: 'bg-primary border-primary text-primary-foreground',
    highlighted: 'bg-primary/20 border-primary/50',
    empty: 'bg-card border-border',
  };

  const acrossClues = puzzle.clues.filter(c => c.direction === 'across');
  const downClues = puzzle.clues.filter(c => c.direction === 'down');

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 w-full max-w-2xl mx-auto">
      {/* Grid */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-muted-foreground">Theme: {puzzle.title}</p>
        <div
          className="grid border-2 border-foreground"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {Array.from({ length: size }, (_, r) =>
            Array.from({ length: size }, (_, c) => {
              const state = getCellState(r, c);
              const num = numberMap.get(`${r},${c}`);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 border border-border/50 ${Object.hasOwn(cellClass, state) ? cellClass[state as keyof typeof cellClass] : ''} cursor-pointer`}
                  onClick={() => handleCellClick(r, c)}
                >
                  {num && state !== 'black' && (
                    <span className="absolute top-0 left-0.5 text-[8px] font-bold text-foreground/60 leading-none">
                      {num}
                    </span>
                  )}
                  {state !== 'black' && (
                    <input
                      ref={el => { if (el) inputRefs.current.set(`${r},${c}`, el); }}
                      className="absolute inset-0 w-full h-full text-center text-sm font-black bg-transparent outline-none uppercase pt-2"
                      maxLength={2}
                      value={cell(userGrid, r, c) ?? ''}
                      onChange={e => handleInput(r, c, e.target.value)}
                      aria-label={`Row ${r + 1} column ${c + 1}`}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clues */}
      <div className="flex flex-row lg:flex-col gap-4 text-sm overflow-auto max-h-64 lg:max-h-none">
        <div>
          <p className="font-black text-primary mb-1">Across</p>
          {acrossClues.map(cl => (
            <motion.button
              key={cl.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectClue(cl)}
              className={`block text-left w-full px-2 py-0.5 rounded transition-colors ${activeClue?.id === cl.id ? 'bg-primary/20 font-bold' : 'hover:bg-muted'}`}
            >
              <span className="font-bold">{cl.number}.</span> {cl.clue}
            </motion.button>
          ))}
        </div>
        <div>
          <p className="font-black text-primary mb-1">Down</p>
          {downClues.map(cl => (
            <motion.button
              key={cl.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectClue(cl)}
              className={`block text-left w-full px-2 py-0.5 rounded transition-colors ${activeClue?.id === cl.id ? 'bg-primary/20 font-bold' : 'hover:bg-muted'}`}
            >
              <span className="font-bold">{cl.number}.</span> {cl.clue}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CrosswordGame() {
  return (
    <>
      <Helmet>
        <title>Crossword Puzzle — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Solve fun crossword puzzles and build vocabulary. A great spelling and reading game for ages 8–13." />
        <link rel="canonical" href="https://sodafom.uk/games/crossword" />
        <meta property="og:title" content="Crossword Puzzle — Sodafom" />
        <meta property="og:description" content="Solve fun crossword puzzles and build vocabulary. A great spelling and reading game for ages 8–13." />
        <meta property="og:url" content="https://sodafom.uk/games/crossword" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Crossword Puzzle — Sodafom" />
        <meta name="twitter:description" content="Solve fun crossword puzzles and build vocabulary. A great spelling and reading game for ages 8–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/crossword#webpage","name":"Crossword Puzzle — Sodafom","url":"https://sodafom.uk/games/crossword","description":"Solve fun crossword puzzles and build vocabulary. A great spelling and reading game for ages 8–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Crossword Puzzle — Sodafom
      </h1>
      <GameShell
        title="Crossword Puzzle"
        emoji="✏️"
        subject="spelling"
        ageGroups={['8–10', '11–13']}
      >
        {(onComplete) => <CrosswordInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
