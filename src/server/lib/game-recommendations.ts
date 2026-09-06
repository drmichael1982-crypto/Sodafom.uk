/**
 * Smart game recommendation engine.
 * Scans teacher notes for keywords and maps them to relevant games.
 */

export interface GameRec {
  gameId: string;
  title: string;
  href: string;
  emoji: string;
  subject: string;
  reason: string;
}

export const KEYWORD_MAP: Array<{ keywords: string[]; game: GameRec }> = [
  // Maths
  { keywords: ['times table', 'multiplication', 'multiply', 'times'],
    game: { gameId: 'times-table-race', title: 'Times Table Race', href: '/games/times-table-race', emoji: '🏎️', subject: 'maths', reason: 'Practises times tables with speed challenges' } },
  { keywords: ['fraction', 'fractions', 'halves', 'quarters', 'thirds'],
    game: { gameId: 'fraction-pizza', title: 'Fraction Pizza', href: '/games/fraction-pizza', emoji: '🍕', subject: 'maths', reason: 'Visual fraction practice with pizza slices' } },
  { keywords: ['number bond', 'number bonds', 'addition', 'adding', 'add up', 'mental maths'],
    game: { gameId: 'number-bonds', title: 'Number Bonds', href: '/games/number-bonds', emoji: '🔢', subject: 'maths', reason: 'Builds mental addition and number bond fluency' } },
  { keywords: ['counting', 'count', 'numbers', 'number recognition'],
    game: { gameId: 'number-pop', title: 'Number Pop!', href: '/games/number-pop', emoji: '🎈', subject: 'maths', reason: 'Fun counting and number recognition game' } },
  { keywords: ['shape', 'shapes', 'geometry', '2d', '3d', 'sides', 'corners'],
    game: { gameId: 'shape-sorter', title: 'Shape Sorter', href: '/games/shape-sorter', emoji: '🔷', subject: 'maths', reason: 'Identifies and sorts 2D and 3D shapes' } },
  { keywords: ['logic', 'puzzle', 'problem solving', 'reasoning'],
    game: { gameId: 'sudoku', title: 'Number Sudoku', href: '/games/sudoku', emoji: '🧩', subject: 'maths', reason: 'Develops logical thinking and number reasoning' } },
  // Reading
  { keywords: ['phonics', 'letter sound', 'letter sounds', 'blending', 'decoding'],
    game: { gameId: 'phonics-parrot', title: 'Phonics Parrot', href: '/games/phonics-parrot', emoji: '🦜', subject: 'reading', reason: 'Practises letter sounds and phonics blending' } },
  { keywords: ['comprehension', 'reading comprehension', 'inference', 'understanding', 'reading for meaning'],
    game: { gameId: 'reading-quest', title: 'Reading Quest', href: '/games/reading-quest', emoji: '🗺️', subject: 'reading', reason: 'Builds reading comprehension and inference skills' } },
  { keywords: ['sentence', 'sentences', 'word order', 'grammar', 'punctuation'],
    game: { gameId: 'sentence-builder', title: 'Sentence Builder', href: '/games/sentence-builder', emoji: '📝', subject: 'reading', reason: 'Practises correct sentence structure and word order' } },
  { keywords: ['alphabet', 'alphabetical', 'letter names', 'abc'],
    game: { gameId: 'alphabet-explorer', title: 'Alphabet Explorer', href: '/games/alphabet-explorer', emoji: '🔤', subject: 'reading', reason: 'Explores every letter of the alphabet' } },
  { keywords: ['creative writing', 'story', 'stories', 'writing', 'imagination'],
    game: { gameId: 'story-builder', title: 'Story Builder', href: '/games/story-builder', emoji: '📜', subject: 'reading', reason: 'Encourages creative story writing' } },
  // Spelling
  { keywords: ['spelling', 'spell', 'misspelling', 'tricky words', 'common words'],
    game: { gameId: 'spelling-bee', title: 'Spelling Bee', href: '/games/spelling-bee', emoji: '🐝', subject: 'spelling', reason: 'Listen and spell words correctly' } },
  { keywords: ['word', 'words', 'vocabulary', 'word recognition'],
    game: { gameId: 'word-search', title: 'Word Search', href: '/games/word-search', emoji: '🔍', subject: 'spelling', reason: 'Reinforces word recognition and spelling' } },
  { keywords: ['unscramble', 'jumbled', 'anagram', 'letter order'],
    game: { gameId: 'word-wizard', title: 'Word Wizard', href: '/games/word-wizard', emoji: '🧙', subject: 'spelling', reason: 'Unscrambles letters to practise spelling' } },
  { keywords: ['crossword', 'clues', 'definitions'],
    game: { gameId: 'crossword', title: 'Crossword', href: '/games/crossword', emoji: '✏️', subject: 'spelling', reason: 'Uses clues to practise spelling and vocabulary' } },
];

export function getGameRecommendations(noteText: string, alreadyPlayedIds: string[]): GameRec[] {
  const lower = noteText.toLowerCase();
  const seen = new Set<string>();
  const results: GameRec[] = [];

  for (const { keywords, game } of KEYWORD_MAP) {
    if (seen.has(game.gameId)) continue;
    const matched = keywords.some(kw => lower.includes(kw));
    if (matched) {
      seen.add(game.gameId);
      results.push({ ...game, alreadyPlayed: alreadyPlayedIds.includes(game.gameId) } as GameRec & { alreadyPlayed: boolean });
    }
  }

  // If no keyword matches, return a default starter set
  if (results.length === 0) {
    return [
      { gameId: 'number-pop',     title: 'Number Pop!',    href: '/games/number-pop',    emoji: '🎈', subject: 'maths',   reason: 'Great starter maths game' },
      { gameId: 'phonics-parrot', title: 'Phonics Parrot', href: '/games/phonics-parrot', emoji: '🦜', subject: 'reading', reason: 'Great starter reading game' },
      { gameId: 'spelling-bee',   title: 'Spelling Bee',   href: '/games/spelling-bee',   emoji: '🐝', subject: 'spelling', reason: 'Great starter spelling game' },
    ];
  }

  return results.slice(0, 6);
}

