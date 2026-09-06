/**
 * /games/word-scramble — Unscramble jumbled words
 * Children drag/tap letter tiles to spell the correct word.
 * Ages 5–13 · Spelling subject
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { Volume2, CheckCircle2, XCircle, Lightbulb, RotateCcw, Star } from 'lucide-react';

// ── Word bank by difficulty ───────────────────────────────────────────────────
const WORDS_EASY = [
  { word: 'CAT',    hint: 'A furry pet that meows 🐱' },
  { word: 'DOG',    hint: 'A loyal pet that barks 🐶' },
  { word: 'SUN',    hint: 'It shines in the sky ☀️' },
  { word: 'HAT',    hint: 'You wear it on your head 🎩' },
  { word: 'BUS',    hint: 'A big vehicle for passengers 🚌' },
  { word: 'PEN',    hint: 'You write with it ✏️' },
  { word: 'MAP',    hint: 'Shows you where to go 🗺️' },
  { word: 'JAM',    hint: 'Sweet spread on toast 🍓' },
  { word: 'FAN',    hint: 'Keeps you cool on a hot day 💨' },
  { word: 'HOP',    hint: 'What a bunny does 🐰' },
];

const WORDS_MEDIUM = [
  { word: 'PLANT',  hint: 'It grows in soil and needs water 🌱' },
  { word: 'CLOUD',  hint: 'Fluffy white thing in the sky ☁️' },
  { word: 'BREAD',  hint: 'You make toast with this 🍞' },
  { word: 'TRAIN',  hint: 'Travels on rails 🚂' },
  { word: 'SHARK',  hint: 'A big fish with sharp teeth 🦈' },
  { word: 'FLAME',  hint: 'Hot and bright — be careful! 🔥' },
  { word: 'GLOBE',  hint: 'A round model of the Earth 🌍' },
  { word: 'STORM',  hint: 'Thunder, lightning and heavy rain ⛈️' },
  { word: 'PRIZE',  hint: 'What you win in a competition 🏆' },
  { word: 'BRAVE',  hint: 'Not afraid of anything 💪' },
];

const WORDS_HARD = [
  { word: 'JUNGLE',   hint: 'A dense tropical forest 🌴' },
  { word: 'CASTLE',   hint: 'A large stone fortress 🏰' },
  { word: 'PLANET',   hint: 'Earth is one of these 🪐' },
  { word: 'BRIDGE',   hint: 'Crosses over a river 🌉' },
  { word: 'FROZEN',   hint: 'Very cold — turned to ice 🧊' },
  { word: 'FLIGHT',   hint: 'Travelling through the air ✈️' },
  { word: 'SPRING',   hint: 'Season after winter 🌸' },
  { word: 'TROPHY',   hint: 'A prize for winning 🏆' },
  { word: 'WHISPER',  hint: 'Speaking very quietly 🤫' },
  { word: 'BLANKET',  hint: 'Keeps you warm in bed 🛏️' },
];

type WordEntry = { word: string; hint: string };

// ── Scramble a word (never same as original) ──────────────────────────────────
function scramble(word: string): string[] {
  const letters = word.split('');
  let shuffled: string[];
  let attempts = 0;
  do {
    shuffled = [...letters].sort(() => Math.random() - 0.5);
    attempts++;
  } while (shuffled.join('') === word && attempts < 20);
  return shuffled;
}

// ── Speak helper ──────────────────────────────────────────────────────────────
function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.88; u.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.lang === 'en-GB') ?? voices.find(v => v.lang.startsWith('en')) ?? null;
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// ── Letter tile ───────────────────────────────────────────────────────────────
function LetterTile({
  letter, used, onClick, size = 'md',
}: {
  letter: string; used: boolean; onClick: () => void; size?: 'sm' | 'md';
}) {
  const dim = size === 'md' ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-lg';
  return (
    <motion.button
      whileHover={used ? {} : { scale: 1.12, y: -3 }}
      whileTap={used ? {} : { scale: 0.9 }}
      onClick={used ? undefined : onClick}
      className={`${dim} rounded-xl font-black border-2 flex items-center justify-center select-none transition-all
        ${used
          ? 'bg-muted border-border text-muted-foreground/30 cursor-default'
          : 'bg-card border-primary/40 text-foreground shadow-sm hover:border-primary hover:shadow-md cursor-pointer'
        }`}
      aria-label={used ? '' : `Letter ${letter}`}
    >
      {used ? '' : letter}
    </motion.button>
  );
}

// ── Answer slot ───────────────────────────────────────────────────────────────
function AnswerSlot({
  letter, phase, index, onClick,
}: {
  letter: string | null; phase: 'answering' | 'correct' | 'wrong'; index: number; onClick: () => void;
}) {
  const filled = letter !== null;
  const borderColor = phase === 'correct'
    ? 'border-green-500 bg-green-100'
    : phase === 'wrong'
    ? 'border-red-400 bg-red-100'
    : filled
    ? 'border-primary bg-primary/10'
    : 'border-dashed border-muted-foreground/40 bg-muted/30';

  return (
    <motion.button
      key={`slot-${index}-${letter}`}
      initial={filled ? { scale: 0.7, opacity: 0 } : {}}
      animate={{ scale: 1, opacity: 1 }}
      onClick={filled && phase === 'answering' ? onClick : undefined}
      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl transition-all
        ${borderColor}
        ${filled && phase === 'answering' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
      `}
      aria-label={filled ? `Remove letter ${letter}` : 'Empty slot'}
    >
      {letter ?? ''}
    </motion.button>
  );
}

// ── Game inner ────────────────────────────────────────────────────────────────
function WordScrambleInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  // Pick word pool based on time of day (fun variety) — mix all levels
  const allWords: WordEntry[] = [...WORDS_EASY, ...WORDS_MEDIUM, ...WORDS_HARD];
  const TOTAL = 10;

  const [wordList] = useState<WordEntry[]>(() =>
    [...allWords].sort(() => Math.random() - 0.5).slice(0, TOTAL)
  );
  const [qIdx, setQIdx] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);   // indices in scrambled that are placed
  const [answer, setAnswer] = useState<(string | null)[]>([]);    // placed letters (null = empty slot)
  const [answerSrcIdx, setAnswerSrcIdx] = useState<(number | null)[]>([]); // which scrambled index each slot came from
  const [phase, setPhase] = useState<'answering' | 'correct' | 'wrong'>('answering');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entry = wordList[qIdx];

  // Initialise scrambled tiles for current word
  useEffect(() => {
    const s = scramble(entry.word);
    setScrambled(s);
    setUsedIndices([]);
    setAnswer(Array(entry.word.length).fill(null));
    setAnswerSrcIdx(Array(entry.word.length).fill(null));
    setPhase('answering');
    setShowHint(false);
    speak(`Unscramble the letters to spell a word. Hint: ${entry.hint}`);
  }, [qIdx, entry.word, entry.hint]);

  const placeLetter = useCallback((srcIdx: number) => {
    if (phase !== 'answering') return;
    if (usedIndices.includes(srcIdx)) return;
    const firstEmpty = answer.findIndex(a => a === null);
    if (firstEmpty === -1) return;
    const newAnswer = [...answer];
    const newSrc = [...answerSrcIdx];
    newAnswer[firstEmpty] = scrambled[srcIdx];
    newSrc[firstEmpty] = srcIdx;
    setAnswer(newAnswer);
    setAnswerSrcIdx(newSrc);
    setUsedIndices(prev => [...prev, srcIdx]);

    // Auto-check when all slots filled
    if (newAnswer.every(a => a !== null)) {
      const word = newAnswer.join('');
      const isCorrect = word === entry.word;
      const pts = isCorrect ? (showHint ? 5 : 10) : 0;
      if (isCorrect) {
        setScore(s => s + pts);
        setCorrectCount(c => c + 1);
        setStreak(s => s + 1);
        setPhase('correct');
        speak(`Correct! The word is ${entry.word.toLowerCase()}.`);
      } else {
        setStreak(0);
        setPhase('wrong');
        speak(`Not quite. The word was ${entry.word.toLowerCase()}.`);
      }
      timerRef.current = setTimeout(() => advance(), isCorrect ? 1400 : 2000);
    }
  }, [phase, usedIndices, answer, answerSrcIdx, scrambled, entry.word, showHint]);

  const removeLetter = useCallback((slotIdx: number) => {
    if (phase !== 'answering') return;
    const srcIdx = answerSrcIdx[slotIdx];
    if (srcIdx === null) return;
    const newAnswer = [...answer];
    const newSrc = [...answerSrcIdx];
    newAnswer[slotIdx] = null;
    newSrc[slotIdx] = null;
    setAnswer(newAnswer);
    setAnswerSrcIdx(newSrc);
    setUsedIndices(prev => prev.filter(i => i !== srcIdx));
  }, [phase, answer, answerSrcIdx]);

  const clearAnswer = useCallback(() => {
    setAnswer(Array(entry.word.length).fill(null));
    setAnswerSrcIdx(Array(entry.word.length).fill(null));
    setUsedIndices([]);
  }, [entry.word.length]);

  function advance() {
    if (qIdx + 1 >= TOTAL) {
      const stars = correctCount >= TOTAL * 0.9 ? 3 : correctCount >= TOTAL * 0.6 ? 2 : correctCount >= TOTAL * 0.3 ? 1 : 0;
      onComplete({ score, correct: correctCount, total: TOTAL, stars, maxScore: TOTAL * 10, durationSeconds: 0 });
    } else {
      setQIdx(i => i + 1);
    }
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const progress = (qIdx / TOTAL) * 100;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto px-4 py-6">

      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
        <span className="text-xs font-black text-muted-foreground whitespace-nowrap">{qIdx + 1}/{TOTAL}</span>
        <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2.5 py-1">
          <Star size={13} className="text-accent fill-accent" />
          <span className="text-xs font-black text-foreground">{score}</span>
        </div>
        {streak >= 2 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-orange-100 rounded-full px-2.5 py-1">
            <span className="text-xs font-black text-orange-600">🔥 {streak}</span>
          </motion.div>
        )}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-card rounded-3xl border-2 border-border shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="hero-bg px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Word Scramble</p>
              <h2 className="text-white font-black text-lg hero-title-shadow">Unscramble the letters!</h2>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => speak(`Hint: ${entry.hint}`)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Read hint aloud"
              >
                <Volume2 size={16} className="text-white" />
              </motion.button>
              {!showHint && phase === 'answering' && (
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowHint(true); setHintsUsed(h => h + 1); speak(entry.hint); }}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Show hint"
                >
                  <Lightbulb size={16} className="text-white" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="px-5 py-5 flex flex-col items-center gap-5">
            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full flex items-start gap-2 bg-accent/15 border border-accent/30 rounded-xl px-3 py-2.5"
                >
                  <Lightbulb size={14} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-foreground">{entry.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer slots */}
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wide text-center mb-3">Your answer</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {answer.map((letter, i) => (
                  <AnswerSlot
                    key={i}
                    letter={letter}
                    phase={phase}
                    index={i}
                    onClick={() => removeLetter(i)}
                  />
                ))}
              </div>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {phase === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-green-100 border border-green-300 rounded-xl px-4 py-2.5 w-full"
                >
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <p className="font-black text-green-800 text-sm">
                    {streak >= 3 ? `🔥 ${streak} in a row! ` : ''}Correct! {showHint ? '+5' : '+10'} points
                  </p>
                </motion.div>
              )}
              {phase === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-xl px-4 py-2.5 w-full"
                >
                  <XCircle size={18} className="text-red-500 shrink-0" />
                  <p className="font-black text-red-800 text-sm">
                    The word was <span className="text-red-700 uppercase">{entry.word}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrambled tiles */}
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wide text-center mb-3">Scrambled letters</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {scrambled.map((letter, i) => (
                  <LetterTile
                    key={i}
                    letter={letter}
                    used={usedIndices.includes(i)}
                    onClick={() => placeLetter(i)}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={clearAnswer}
                disabled={phase !== 'answering' || answer.every(a => a === null)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted text-muted-foreground font-bold text-sm border border-border disabled:opacity-40 hover:bg-muted/80 transition-colors"
              >
                <RotateCcw size={13} /> Clear
              </motion.button>
              <p className="text-xs text-muted-foreground">Hints: <span className="font-black">{hintsUsed}</span></p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function WordScrambleGame() {
  return (
    <>
      <Helmet>
        <title>Word Scramble — Sodafom | Fun Spelling Games for Kids</title>
        <meta name="description" content="Unscramble jumbled letters to spell the correct word! A fun spelling game for children aged 5–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/word-scramble" />
        <meta property="og:title" content="Word Scramble — Sodafom" />
        <meta property="og:description" content="Unscramble jumbled letters to spell the correct word!" />
        <meta property="og:url" content="https://sodafom.uk/games/word-scramble" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/word-scramble#webpage',
          name: 'Word Scramble — Sodafom',
          url: 'https://sodafom.uk/games/word-scramble',
          description: 'Unscramble jumbled letters to spell the correct word! A fun spelling game for children aged 5–13.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Word Scramble — Spelling Game for Kids — Sodafom</h1>
      <GameShell title="Word Scramble" emoji="🔤" subject="spelling" ageGroups={['5–7', '8–10', '11–13']}>
        {(onComplete) => <WordScrambleInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
