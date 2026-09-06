import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { RotateCcw } from 'lucide-react';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

// ── Types ─────────────────────────────────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Sentence {
  words: string[];
  hint?: string;
}

// ── Safe record lookup ────────────────────────────────────────────────────────
function safeGet<T>(record: Record<string, T>, key: string, fallback: T): T {
  const entry = Object.entries(record).find(([k]) => k === key);
  return entry ? (entry[1] as T) : fallback;
}

// ── Sentence banks ────────────────────────────────────────────────────────────
const SENTENCES_EASY: Sentence[] = [
  { words: ['The', 'cat', 'sat', 'on', 'the', 'mat'], hint: 'Where did the cat sit?' },
  { words: ['I', 'like', 'to', 'eat', 'cake'], hint: 'What do you like to eat?' },
  { words: ['The', 'dog', 'ran', 'fast'], hint: 'What did the dog do?' },
  { words: ['She', 'has', 'a', 'red', 'ball'], hint: 'What colour is the ball?' },
  { words: ['We', 'play', 'in', 'the', 'park'], hint: 'Where do we play?' },
  { words: ['The', 'sun', 'is', 'hot'], hint: 'What is the sun like?' },
  { words: ['He', 'can', 'jump', 'high'], hint: 'What can he do?' },
  { words: ['My', 'mum', 'bakes', 'bread'], hint: 'What does mum bake?' },
  { words: ['The', 'bird', 'sings', 'a', 'song'], hint: 'What does the bird do?' },
  { words: ['I', 'see', 'a', 'big', 'tree'], hint: 'What do you see?' },
];

const SENTENCES_MEDIUM: Sentence[] = [
  { words: ['The', 'children', 'played', 'happily', 'in', 'the', 'garden'] },
  { words: ['She', 'quickly', 'finished', 'her', 'homework'] },
  { words: ['The', 'brown', 'fox', 'jumped', 'over', 'the', 'fence'] },
  { words: ['We', 'visited', 'the', 'museum', 'on', 'Saturday'] },
  { words: ['He', 'carefully', 'painted', 'a', 'beautiful', 'picture'] },
  { words: ['The', 'teacher', 'read', 'a', 'story', 'to', 'the', 'class'] },
  { words: ['My', 'sister', 'loves', 'eating', 'strawberries'] },
  { words: ['The', 'fluffy', 'rabbit', 'hopped', 'across', 'the', 'field'] },
  { words: ['They', 'built', 'a', 'sandcastle', 'at', 'the', 'beach'] },
  { words: ['The', 'stars', 'twinkled', 'brightly', 'in', 'the', 'sky'] },
];

const SENTENCES_HARD: Sentence[] = [
  { words: ['Despite', 'the', 'rain', 'the', 'children', 'played', 'outside', 'cheerfully'] },
  { words: ['The', 'ancient', 'castle', 'stood', 'proudly', 'on', 'the', 'hilltop'] },
  { words: ['She', 'discovered', 'a', 'mysterious', 'letter', 'hidden', 'beneath', 'the', 'floorboards'] },
  { words: ['The', 'scientist', 'carefully', 'examined', 'the', 'unusual', 'specimen'] },
  { words: ['After', 'breakfast', 'they', 'embarked', 'on', 'an', 'exciting', 'adventure'] },
  { words: ['The', 'enormous', 'elephant', 'splashed', 'joyfully', 'in', 'the', 'muddy', 'river'] },
  { words: ['Without', 'hesitation', 'she', 'dived', 'into', 'the', 'crystal', 'clear', 'water'] },
  { words: ['The', 'curious', 'explorer', 'mapped', 'every', 'corner', 'of', 'the', 'jungle'] },
  { words: ['Although', 'tired', 'he', 'continued', 'climbing', 'towards', 'the', 'summit'] },
  { words: ['The', 'magnificent', 'fireworks', 'lit', 'up', 'the', 'entire', 'night', 'sky'] },
];

const SENTENCE_BANKS: Record<Difficulty, Sentence[]> = {
  Easy: SENTENCES_EASY,
  Medium: SENTENCES_MEDIUM,
  Hard: SENTENCES_HARD,
};

const TOTAL_ROUNDS = 8;

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy:   'bg-green-100 text-green-700 border-green-300',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Hard:   'bg-red-100 text-red-700 border-red-300',
};

// ── Difficulty picker ─────────────────────────────────────────────────────────
function DifficultyPicker({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-5xl">📝</div>
      <h2 className="text-2xl font-black text-foreground text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        Sentence Builder
      </h2>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        Drag or tap the word tiles to build the sentence in the correct order!
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
              {d === 'Easy' && 'Short, simple sentences'}
              {d === 'Medium' && 'Longer sentences'}
              {d === 'Hard' && 'Complex sentences'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Word tile ─────────────────────────────────────────────────────────────────
function WordTile({ word, onClick, variant }: { word: string; onClick: () => void; variant: 'bank' | 'placed' }) {
  return (
    <motion.button
      layout
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`px-3 py-2 rounded-xl font-bold text-sm shadow-sm border-2 transition-colors select-none
        ${variant === 'placed'
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-foreground border-border hover:border-primary hover:bg-primary/5'
        }`}
    >
      {word}
    </motion.button>
  );
}

// ── Game inner ────────────────────────────────────────────────────────────────
function SentenceBuilderPlay({ onComplete, difficulty, onQuestionChange }: { onComplete: (r: GameResult) => void; difficulty: Difficulty; onQuestionChange?: (q: string) => void }) {
  const bank = safeGet(SENTENCE_BANKS as Record<string, Sentence[]>, difficulty, SENTENCE_BANKS['Easy']);
  const [shuffledBank] = useState<Sentence[]>(() => [...bank].sort(() => Math.random() - 0.5));
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const sentence = shuffledBank.at(round % shuffledBank.length)!;

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`Arrange the words to make a correct sentence. Words: ${sentence.words.join(', ')}`); }, [round, sentence, onQuestionChange]);

  // Shuffled word tiles available to pick from
  const [bankWords, setBankWords] = useState<string[]>(() =>
    [...sentence.words].sort(() => Math.random() - 0.5)
  );
  const [placedWords, setPlacedWords] = useState<string[]>([]);

  const resetRound = (s: Sentence) => {
    setBankWords([...s.words].sort(() => Math.random() - 0.5));
    setPlacedWords([]);
    setFeedback(null);
  };

  const pickWord = (word: string, idx: number) => {
    if (feedback) return;
    setBankWords(prev => prev.filter((_, i) => i !== idx));
    setPlacedWords(prev => [...prev, word]);
  };

  const removeWord = (word: string, idx: number) => {
    if (feedback) return;
    setPlacedWords(prev => prev.filter((_, i) => i !== idx));
    setBankWords(prev => [...prev, word]);
  };

  const checkAnswer = () => {
    if (feedback || placedWords.length !== sentence.words.length) return;
    const isRight = placedWords.join(' ') === sentence.words.join(' ');
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
        const nextSentence = shuffledBank.at(next % shuffledBank.length)!;
        resetRound(nextSentence);
      }
    }, 1400);
  };

  const allPlaced = placedWords.length === sentence.words.length;

  return (
    <div className="flex-1 flex flex-col items-center p-5 bg-gradient-to-b from-blue-50 to-background">
      {/* Progress */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
          <span>Round {round + 1} / {TOTAL_ROUNDS}</span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${safeGet(DIFFICULTY_COLORS, difficulty, '')}`}>{difficulty}</span>
            <span>⭐ {correct}</span>
          </div>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      {/* Instruction */}
      <motion.div key={round} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
        <p className="text-base font-bold text-muted-foreground">
          {sentence.hint ? sentence.hint : 'Put the words in the right order to make a sentence'}
        </p>
      </motion.div>

      {/* Placed words area */}
      <div className="w-full max-w-lg min-h-[72px] bg-card border-2 border-dashed border-border rounded-2xl p-3 mb-4 flex flex-wrap gap-2 items-start content-start">
        <AnimatePresence>
          {placedWords.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-muted-foreground text-sm font-bold w-full text-center mt-2">
              Tap words below to build your sentence
            </motion.p>
          )}
          {placedWords.map((w, i) => (
            <motion.div key={`placed-${i}-${w}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
              <WordTile word={w} onClick={() => removeWord(w, i)} variant="placed" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-lg font-black mb-3 text-center px-4 ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}
          >
            {feedback === 'correct'
              ? '🎉 Perfect sentence!'
              : `❌ The correct order was: "${sentence.words.join(' ')}"`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word bank */}
      <div className="w-full max-w-lg bg-muted/50 rounded-2xl p-3 mb-4 flex flex-wrap gap-2 min-h-[60px] items-start content-start">
        <AnimatePresence>
          {bankWords.map((w, i) => (
            <motion.div key={`bank-${i}-${w}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
              <WordTile word={w} onClick={() => pickWord(w, i)} variant="bank" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => resetRound(sentence)}
          disabled={!!feedback}
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold bg-muted text-foreground border border-border disabled:opacity-50"
        >
          <RotateCcw size={16} /> Reset
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={checkAnswer}
          disabled={!!feedback || !allPlaced}
          className="px-8 py-3 rounded-xl font-black bg-primary text-primary-foreground disabled:opacity-50 shadow-md"
        >
          Check it! ✅
        </motion.button>
      </div>
    </div>
  );
}

// ── Wrapper ───────────────────────────────────────────────────────────────────
function SentenceBuilderWithDifficulty({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const { tier } = useChildAge();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  useEffect(() => {
    const auto: Difficulty = tier === 1 ? 'Easy' : tier === 2 ? 'Medium' : 'Hard';
    setDifficulty(auto);
  }, [tier]);
  if (!difficulty) return <DifficultyPicker onSelect={setDifficulty} />;
  return <SentenceBuilderPlay onComplete={onComplete} difficulty={difficulty} onQuestionChange={onQuestionChange} />;
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function SentenceBuilderGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Sentence Builder — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Build correct sentences by arranging words in the right order. A grammar game for ages 8–13." />
        <link rel="canonical" href="https://sodafom.uk/games/sentence-builder" />
        <meta property="og:title" content="Sentence Builder — Sodafom" />
        <meta property="og:description" content="Build correct sentences by arranging words in the right order. A grammar game for ages 8–13." />
        <meta property="og:url" content="https://sodafom.uk/games/sentence-builder" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sentence Builder — Sodafom" />
        <meta name="twitter:description" content="Build correct sentences by arranging words in the right order. A grammar game for ages 8–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/sentence-builder#webpage","name":"Sentence Builder — Sodafom","url":"https://sodafom.uk/games/sentence-builder","description":"Build correct sentences by arranging words in the right order. A grammar game for ages 8–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Sentence Builder — Reading Game for Kids — Sodafom
      </h1>

      <GameShell title="Sentence Builder" emoji="📝" subject="reading" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => <SentenceBuilderWithDifficulty onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
