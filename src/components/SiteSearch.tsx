/**
 * SiteSearch — full-screen search overlay
 * Searches games, pages, and subjects. Keyboard navigable.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight } from 'lucide-react';

// ── Search index ──────────────────────────────────────────────────────────────

// ── Search index ──────────────────────────────────────────────────────────────
interface SearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  emoji: string;
  category: string;
  tags: string[];
}

const SEARCH_INDEX: SearchItem[] = [
  // Games — Maths
  { id: 'number-pop',          title: 'Number Pop!',         description: 'Pop balloons with the right answers',          href: '/games/number-pop',          emoji: '🎈', category: 'Maths',   tags: ['counting', 'numbers', 'maths', 'easy', '5-7'] },
  { id: 'times-table-race',    title: 'Times Table Race',    description: 'Race against the clock on times tables',       href: '/games/times-table-race',    emoji: '🏎️', category: 'Maths',   tags: ['times tables', 'multiplication', 'maths', 'speed'] },
  { id: 'fraction-pizza',      title: 'Fraction Pizza',      description: 'Slice pizza into the right fractions',         href: '/games/fraction-pizza',      emoji: '🍕', category: 'Maths',   tags: ['fractions', 'division', 'maths', 'pizza'] },
  { id: 'shape-sorter',        title: 'Shape Sorter',        description: 'Sort 2D and 3D shapes into the right boxes',   href: '/games/shape-sorter',        emoji: '🔷', category: 'Maths',   tags: ['shapes', 'geometry', 'maths', 'sorting'] },
  { id: 'sudoku',              title: 'Number Sudoku',       description: 'Fill the grid with logic and numbers',         href: '/games/sudoku',              emoji: '🧩', category: 'Maths',   tags: ['sudoku', 'logic', 'puzzle', 'maths'] },
  { id: 'times-tables-reader', title: 'Times Tables Reader', description: 'Browse and quiz yourself on all 12 tables',    href: '/games/times-tables-reader', emoji: '📖', category: 'Maths',   tags: ['times tables', 'multiplication', 'maths', 'quiz'] },
  { id: 'number-bonds',        title: 'Number Bonds',        description: 'Find the missing number to complete the bond', href: '/games/number-bonds',        emoji: '🔢', category: 'Maths',   tags: ['number bonds', 'addition', 'maths', 'mental'] },
  // Games — Reading
  { id: 'phonics-parrot',      title: 'Phonics Parrot',      description: 'Help Pip the Parrot learn letter sounds',      href: '/games/phonics-parrot',      emoji: '🦜', category: 'Reading', tags: ['phonics', 'letters', 'sounds', 'reading', '5-7'] },
  { id: 'reading-quest',       title: 'Reading Quest',       description: 'Read passages and answer questions',           href: '/games/reading-quest',       emoji: '🗺️', category: 'Reading', tags: ['comprehension', 'reading', 'inference'] },
  { id: 'colour-book',         title: 'Colour-In Book',      description: 'Colour in pictures and learn colours',         href: '/games/colour-book',         emoji: '🎨', category: 'Reading', tags: ['colouring', 'colours', 'creative', 'reading', '4-6'] },
  { id: 'sentence-builder',    title: 'Sentence Builder',    description: 'Put word tiles in the right order',            href: '/games/sentence-builder',    emoji: '📝', category: 'Reading', tags: ['sentences', 'grammar', 'reading', 'words'] },
  // Games — Spelling
  { id: 'word-wizard',         title: 'Word Wizard',         description: 'Unscramble letters to cast spelling spells',   href: '/games/word-wizard',         emoji: '🧙', category: 'Spelling', tags: ['spelling', 'letters', 'unscramble', 'words'] },
  { id: 'spelling-bee',        title: 'Spelling Bee',        description: 'Listen and type the word correctly',           href: '/games/spelling-bee',        emoji: '🐝', category: 'Spelling', tags: ['spelling', 'listening', 'typing', 'words'] },
  { id: 'tricky-words',        title: 'Tricky Word Hunt',    description: 'Find tricky words hidden in the picture',      href: '/games/tricky-words',        emoji: '🔍', category: 'Spelling', tags: ['tricky words', 'phonics', 'spelling', 'hunt'] },
  { id: 'word-search',         title: 'Word Search',         description: 'Find hidden words in the grid',                href: '/games/word-search',         emoji: '🔍', category: 'Spelling', tags: ['word search', 'spelling', 'grid', 'puzzle'] },
  { id: 'crossword',           title: 'Crossword',           description: 'Read clues and fill in the crossword',         href: '/games/crossword',           emoji: '✏️', category: 'Spelling', tags: ['crossword', 'spelling', 'clues', 'puzzle'] },
  { id: 'alphabet-explorer',   title: 'Alphabet Explorer',   description: 'Explore every letter A to Z',                  href: '/games/alphabet-explorer',   emoji: '🔤', category: 'Spelling', tags: ['alphabet', 'letters', 'spelling', '4-6'] },
  // Games — Stories
  { id: 'story-builder',       title: 'Story Builder',       description: 'Choose characters and build your own story',   href: '/games/story-builder',       emoji: '📜', category: 'Stories', tags: ['story', 'creative', 'reading', 'characters'] },
  // Pages
  { id: 'page-menu',           title: "Archie's Menu",       description: 'Open all Sodafom learning and family features', href: '/archie-menu',               emoji: '🌈', category: 'Page',    tags: ['menu', 'features', 'home'] },
  { id: 'page-lessons',        title: "Archie's Lessons",    description: 'Choose a subject and lesson length',            href: '/lessons',                   emoji: '🎓', category: 'Page',    tags: ['lessons', 'tutor', 'subjects'] },
  { id: 'page-games',          title: 'All Games',           description: 'Browse every game on Sodafom',                 href: '/games',                     emoji: '🎮', category: 'Page',    tags: ['games', 'all', 'browse'] },
  { id: 'page-maths',          title: 'Maths Hub',           description: 'All maths games in one place',                 href: '/games/maths',               emoji: '🔢', category: 'Page',    tags: ['maths', 'hub', 'games'] },
  { id: 'page-reading',        title: 'Reading Hub',         description: 'All reading games in one place',               href: '/games/reading',             emoji: '📖', category: 'Page',    tags: ['reading', 'hub', 'games'] },
  { id: 'page-spelling',       title: 'Spelling Hub',        description: 'All spelling games in one place',              href: '/games/spelling',            emoji: '✏️', category: 'Page',    tags: ['spelling', 'hub', 'games'] },
  { id: 'page-rewards',        title: 'Star Rewards',        description: 'Unlock characters with your stars',            href: '/rewards',                   emoji: '⭐', category: 'Page',    tags: ['rewards', 'stars', 'characters', 'shop'] },
  { id: 'page-story-writer',   title: 'Story Writer',        description: 'Draw and write your own illustrated story',    href: '/story-writer',              emoji: '🖊️', category: 'Page',    tags: ['story', 'draw', 'write', 'creative'] },
  { id: 'page-certificates',   title: 'Certificates',        description: 'Print achievement certificates for children',  href: '/certificates',              emoji: '🏆', category: 'Page',    tags: ['certificate', 'print', 'achievement', 'award'] },
  { id: 'page-pricing',        title: 'Pricing & Plans',     description: 'Monthly, Annual and School plans',             href: '/pricing',                   emoji: '💰', category: 'Page',    tags: ['pricing', 'plans', 'subscribe', 'cost'] },
  { id: 'page-hub',            title: 'Parent & Teacher Hub', description: 'Track your child\'s learning progress',       href: '/hub',                       emoji: '👨‍👩‍👧', category: 'Page',    tags: ['hub', 'parent', 'teacher', 'progress'] },
  { id: 'page-reviews',        title: 'Reviews',             description: 'Read and leave reviews for Sodafom',           href: '/reviews',                   emoji: '⭐', category: 'Page',    tags: ['reviews', 'feedback', 'ratings'] },
  { id: 'page-voice-studio',   title: 'Voice Studio',        description: 'Record your child\'s voice for games',         href: '/voice-studio',              emoji: '🎙️', category: 'Page',    tags: ['voice', 'record', 'audio', 'studio'] },
  { id: 'page-homework',       title: 'Homework Helper',     description: 'Photograph homework for a step-by-step explanation', href: '/homework-helper',        emoji: '📸', category: 'Page',    tags: ['homework', 'camera', 'scan', 'help'] },
  { id: 'page-chores',         title: 'Pocket Money & Chores', description: 'Track parent-approved family chores',          href: '/pocket-money',              emoji: '🧹', category: 'Page',    tags: ['chores', 'pocket money', 'family'] },
  { id: 'page-outfit',         title: "Design Archie's Outfit", description: 'Create and save an Archie outfit idea',       href: '/archie-outfit',             emoji: '🎨', category: 'Page',    tags: ['archie', 'outfit', 'design'] },
  { id: 'page-birthday',       title: 'Birthday Countdown',  description: 'Count down to a child\'s birthday',             href: '/birthday',                  emoji: '🎂', category: 'Page',    tags: ['birthday', 'countdown'] },
];

// ── Scoring ───────────────────────────────────────────────────────────────────
function scoreItem(item: SearchItem, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  const tags = item.tags.join(' ').toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (desc.includes(q)) return 40;
  if (tags.includes(q)) return 30;
  // partial word match
  const words = q.split(' ');
  const matchCount = words.filter(w => title.includes(w) || tags.includes(w)).length;
  if (matchCount > 0) return matchCount * 15;
  return 0;
}

function runSearch(query: string): SearchItem[] {
  if (!query.trim()) return [];
  return SEARCH_INDEX
    .map(item => ({ item, score: scoreItem(item, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item);
}

// ── Category colour ───────────────────────────────────────────────────────────
const CATEGORY_STYLE: Record<string, string> = {
  Maths:   'bg-primary/10 text-primary',
  Reading: 'bg-blue-100 text-blue-700',
  Spelling:'bg-secondary/10 text-secondary',
  Stories: 'bg-purple-100 text-purple-700',
  Page:    'bg-muted text-muted-foreground',
};

// ── Quick links shown when query is empty ─────────────────────────────────────
const QUICK_LINKS = [
  { label: 'All Games',    href: '/games',          emoji: '🎮' },
  { label: 'Maths',        href: '/games/maths',    emoji: '🔢' },
  { label: 'Reading',      href: '/games/reading',  emoji: '📖' },
  { label: 'Spelling',     href: '/games/spelling', emoji: '✏️' },
  { label: 'Rewards',      href: '/rewards',        emoji: '⭐' },
  { label: 'Certificates', href: '/certificates',   emoji: '🏆' },
];

// ── Overlay component ─────────────────────────────────────────────────────────
interface SiteSearchProps {
  open: boolean;
  onClose: () => void;
}

export function SiteSearch({ open, onClose }: SiteSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Search
  useEffect(() => {
    setResults(runSearch(query));
    setActiveIdx(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const list = results;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, list.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && list.length > 0) {
      const item = list.at(activeIdx);
      if (item) { navigate(item.href); onClose(); }
    }
    if (e.key === 'Escape') onClose();
  }, [results, activeIdx, navigate, onClose]);

  // Global Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const goTo = (href: string) => { navigate(href); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' as const }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
          >
            <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={20} className="text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search games, subjects, pages…"
                  className="flex-1 bg-transparent text-foreground font-semibold text-base placeholder:text-muted-foreground focus:outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Clear search">
                    <X size={18} />
                  </button>
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-1 text-xs font-bold border border-border rounded px-1.5 py-0.5 hidden sm:block">
                  Esc
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() === '' ? (
                  /* Quick links */
                  <div className="p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Quick links</p>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_LINKS.map(link => (
                        <motion.button
                          key={link.href}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => goTo(link.href)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-left font-bold text-sm text-foreground"
                        >
                          <span className="text-xl">{link.emoji}</span>
                          <span>{link.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  /* No results */
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="font-bold text-foreground">No results for "{query}"</p>
                    <p className="text-muted-foreground text-sm mt-1">Try searching for a game name or subject</p>
                  </div>
                ) : (
                  /* Results list */
                  <ul className="py-2" role="listbox">
                    {results.map((item, idx) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        role="option"
                        aria-selected={idx === activeIdx}
                      >
                        <button
                          onClick={() => goTo(item.href)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            idx === activeIdx ? 'bg-primary/10' : 'hover:bg-muted/60'
                          }`}
                        >
                          <span className="text-2xl shrink-0 w-8 text-center">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-foreground text-sm">{item.title}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_STYLE[item.category] ?? 'bg-muted text-muted-foreground'}`}>
                                {item.category}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5 truncate">{item.description}</p>
                          </div>
                          <ArrowRight size={16} className={`shrink-0 transition-opacity ${idx === activeIdx ? 'opacity-100 text-primary' : 'opacity-0'}`} />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer hint */}
              {results.length > 0 && (
                <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
                  <span>↑↓ navigate</span>
                  <span>↵ open</span>
                  <span>Esc close</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Search trigger button (used in Header) ────────────────────────────────────
interface SearchButtonProps {
  onClick: () => void;
  variant?: 'icon' | 'bar';
}

export function SearchButton({ onClick, variant = 'icon' }: SearchButtonProps) {
  if (variant === 'bar') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground transition-colors text-sm font-semibold"
        aria-label="Search"
      >
        <Search size={15} />
        <span className="hidden lg:inline">Search…</span>
        <kbd className="hidden lg:inline text-xs bg-primary-foreground/20 rounded px-1 py-0.5 font-mono">/</kbd>
      </motion.button>
    );
  }
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="p-2 rounded-full text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
      aria-label="Search"
    >
      <Search size={20} />
    </motion.button>
  );
}
