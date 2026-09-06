import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import GameShell, { type GameResult } from '@/components/games/GameShell';

// ── Original alphabet data — all content written in-house ────────────────────

const ALPHABET: Array<{ letter: string; word: string; emoji: string; sound: string; colour: string }> = [
  { letter: 'A', word: 'Apple',     emoji: '🍎', sound: 'ay',   colour: '#EF4444' },
  { letter: 'B', word: 'Bear',      emoji: '🐻', sound: 'buh',  colour: '#F97316' },
  { letter: 'C', word: 'Cat',       emoji: '🐱', sound: 'kuh',  colour: '#FACC15' },
  { letter: 'D', word: 'Dog',       emoji: '🐶', sound: 'duh',  colour: '#22C55E' },
  { letter: 'E', word: 'Elephant',  emoji: '🐘', sound: 'eh',   colour: '#3B82F6' },
  { letter: 'F', word: 'Frog',      emoji: '🐸', sound: 'fuh',  colour: '#8B5CF6' },
  { letter: 'G', word: 'Giraffe',   emoji: '🦒', sound: 'guh',  colour: '#EC4899' },
  { letter: 'H', word: 'Horse',     emoji: '🐴', sound: 'huh',  colour: '#EF4444' },
  { letter: 'I', word: 'Igloo',     emoji: '🏔️', sound: 'ih',   colour: '#F97316' },
  { letter: 'J', word: 'Jellyfish', emoji: '🪼', sound: 'juh',  colour: '#FACC15' },
  { letter: 'K', word: 'Kite',      emoji: '🪁', sound: 'kuh',  colour: '#22C55E' },
  { letter: 'L', word: 'Lion',      emoji: '🦁', sound: 'luh',  colour: '#3B82F6' },
  { letter: 'M', word: 'Monkey',    emoji: '🐒', sound: 'muh',  colour: '#8B5CF6' },
  { letter: 'N', word: 'Nest',      emoji: '🪺', sound: 'nuh',  colour: '#EC4899' },
  { letter: 'O', word: 'Octopus',   emoji: '🐙', sound: 'oh',   colour: '#EF4444' },
  { letter: 'P', word: 'Penguin',   emoji: '🐧', sound: 'puh',  colour: '#F97316' },
  { letter: 'Q', word: 'Queen',     emoji: '👑', sound: 'kwuh', colour: '#FACC15' },
  { letter: 'R', word: 'Rainbow',   emoji: '🌈', sound: 'ruh',  colour: '#22C55E' },
  { letter: 'S', word: 'Sun',       emoji: '☀️', sound: 'sss',  colour: '#3B82F6' },
  { letter: 'T', word: 'Tiger',     emoji: '🐯', sound: 'tuh',  colour: '#8B5CF6' },
  { letter: 'U', word: 'Umbrella',  emoji: '☂️', sound: 'uh',   colour: '#EC4899' },
  { letter: 'V', word: 'Volcano',   emoji: '🌋', sound: 'vuh',  colour: '#EF4444' },
  { letter: 'W', word: 'Whale',     emoji: '🐋', sound: 'wuh',  colour: '#F97316' },
  { letter: 'X', word: 'X-ray',     emoji: '🦴', sound: 'ks',   colour: '#FACC15' },
  { letter: 'Y', word: 'Yak',       emoji: '🦬', sound: 'yuh',  colour: '#22C55E' },
  { letter: 'Z', word: 'Zebra',     emoji: '🦓', sound: 'zzz',  colour: '#3B82F6' },
];

// Quiz mode: pick the right letter for the word shown
function buildQuizRound(exclude: Set<number>) {
  const available = ALPHABET.map((_, i) => i).filter(i => !exclude.has(i));
  if (available.length === 0) return null;
  const correctIdx = available[Math.floor(Math.random() * available.length)] ?? 0;
  const correct = ALPHABET.at(correctIdx);
  if (!correct) return null;
  // 3 wrong options
  const others = ALPHABET.filter((_, i) => i !== correctIdx);
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...shuffled, correct].sort(() => Math.random() - 0.5);
  return { correctIdx, correct, options };
}

type Mode = 'explore' | 'quiz';

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.85;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
}

function AlphabetExplorerInner({ onComplete }: { onComplete: (result: GameResult) => void }) {
  const [mode, setMode] = useState<Mode>('explore');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [quizRound, setQuizRound] = useState(() => buildQuizRound(new Set()));
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [, setDone] = useState(false);
  const QUIZ_TOTAL = 10;

  const current = ALPHABET.at(currentIdx) ?? ALPHABET[0]!;

  const handleSpeak = useCallback(() => {
    speak(`${current.letter} is for ${current.word}. The sound is ${current.sound}.`);
  }, [current]);

  const goTo = (idx: number) => {
    const next = (idx + 26) % 26;
    setCurrentIdx(next);
    const entry = ALPHABET.at(next);
    if (entry) speak(`${entry.letter} is for ${entry.word}`);
  };

  const startQuiz = () => {
    setMode('quiz');
    setAnswered(new Set());
    setCorrect(0);
    setQuizRound(buildQuizRound(new Set()));
    setFeedback(null);
    setDone(false);
  };

  const handleAnswer = (letter: string) => {
    if (feedback || !quizRound) return;
    const isCorrect = letter === quizRound.correct.letter;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newAnswered = new Set(answered).add(quizRound.correctIdx);

    setTimeout(() => {
      if (newAnswered.size >= QUIZ_TOTAL) {
        const score = Math.round((newCorrect / QUIZ_TOTAL) * 100);
        const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
        setDone(true);
        onComplete({ score, correct: newCorrect, total: QUIZ_TOTAL, stars });
      } else {
        setAnswered(newAnswered);
        setCorrect(newCorrect);
        setQuizRound(buildQuizRound(newAnswered));
        setFeedback(null);
      }
    }, 900);
  };

  // ── Explore mode ─────────────────────────────────────────────────────────────
  if (mode === 'explore') {
    return (
      <div className="flex flex-col items-center gap-5 p-4 w-full max-w-sm mx-auto">
        {/* A–Z strip */}
        <div className="flex flex-wrap gap-1 justify-center">
          {ALPHABET.map((a, i) => (
            <motion.button
              key={a.letter}
              whileTap={{ scale: 0.85 }}
              onClick={() => { setCurrentIdx(i); speak(`${a.letter} is for ${a.word}`); }}
              className={`w-8 h-8 rounded-lg text-sm font-black transition-all border-2 ${i === currentIdx ? 'border-primary text-primary-foreground scale-110' : 'border-border bg-card hover:border-primary/50'}`}
              style={i === currentIdx ? { backgroundColor: current.colour, borderColor: current.colour } : {}}
            >
              {a.letter}
            </motion.button>
          ))}
        </div>

        {/* Main card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' as const }}
            className="w-full rounded-3xl border-4 p-6 flex flex-col items-center gap-3 shadow-xl"
            style={{ borderColor: current.colour, backgroundColor: current.colour + '18' }}
          >
            <span className="text-8xl">{current.emoji}</span>
            <div
              className="text-7xl font-black leading-none"
              style={{ color: current.colour }}
            >
              {current.letter}
            </div>
            <div className="text-2xl font-black text-foreground">{current.word}</div>
            <div className="text-sm text-muted-foreground">
              Sound: <span className="font-bold text-foreground">"{current.sound}"</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSpeak}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white shadow-md mt-1"
              style={{ backgroundColor: current.colour }}
            >
              <Volume2 className="w-4 h-4" />
              Hear it!
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => goTo(currentIdx - 1)}
            className="p-3 rounded-full border-2 border-border bg-card hover:border-primary transition-all">
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <span className="text-sm text-muted-foreground font-bold">{currentIdx + 1} / 26</span>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => goTo(currentIdx + 1)}
            className="p-3 rounded-full border-2 border-border bg-card hover:border-primary transition-all">
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Start quiz */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startQuiz}
          className="w-full py-3 rounded-2xl font-black text-lg bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all"
        >
          🎯 Take the Quiz!
        </motion.button>
      </div>
    );
  }

  // ── Quiz mode ─────────────────────────────────────────────────────────────────
  if (!quizRound) return null;
  const progress = (answered.size / QUIZ_TOTAL) * 100;

  return (
    <div className="flex flex-col items-center gap-5 p-4 w-full max-w-sm mx-auto">
      {/* Progress */}
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>
      <p className="text-xs text-muted-foreground">{answered.size} of {QUIZ_TOTAL} questions</p>

      {/* Question */}
      <motion.div
        key={quizRound.correctIdx}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-lg font-bold text-muted-foreground">Which letter is this?</p>
        <span className="text-8xl">{quizRound.correct.emoji}</span>
        <p className="text-2xl font-black">{quizRound.correct.word}</p>
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {quizRound.options.map(opt => {
          const isCorrectOpt = opt.letter === quizRound.correct.letter;
          const bgClass =
            feedback === null ? 'bg-card border-border hover:border-primary'
            : isCorrectOpt ? 'bg-green-100 border-green-500 text-green-800'
            : feedback === 'wrong' ? 'bg-red-100 border-red-400 text-red-700'
            : 'bg-card border-border opacity-50';
          return (
            <motion.button
              key={opt.letter}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAnswer(opt.letter)}
              disabled={!!feedback}
              className={`py-4 rounded-2xl border-2 text-4xl font-black transition-all ${bgClass}`}
            >
              {opt.letter}
            </motion.button>
          );
        })}
      </div>

      {feedback && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}
        >
          {feedback === 'correct' ? '⭐ Brilliant!' : `❌ It was ${quizRound.correct.letter}!`}
        </motion.p>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setMode('explore')}
        className="text-sm text-muted-foreground underline"
      >
        Back to explore
      </motion.button>
    </div>
  );
}

export default function AlphabetExplorerGame() {
  return (
    <>
      <Helmet>
        <title>Alphabet Explorer — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Learn every letter A–Z with pictures, sounds and words. Perfect for children aged 4–7 learning to read." />
        <link rel="canonical" href="https://sodafom.uk/games/alphabet-explorer" />
        <meta property="og:title" content="Alphabet Explorer — Sodafom" />
        <meta property="og:description" content="Learn every letter A–Z with pictures, sounds and words. Perfect for children aged 4–7 learning to read." />
        <meta property="og:url" content="https://sodafom.uk/games/alphabet-explorer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Alphabet Explorer — Sodafom" />
        <meta name="twitter:description" content="Learn every letter A–Z with pictures, sounds and words. Perfect for children aged 4–7 learning to read." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/alphabet-explorer#webpage","name":"Alphabet Explorer — Sodafom","url":"https://sodafom.uk/games/alphabet-explorer","description":"Learn every letter A–Z with pictures, sounds and words. Perfect for children aged 4–7 learning to read.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Alphabet Explorer — Spelling Game for Kids — Sodafom
      </h1>
      <GameShell
        title="Alphabet Explorer"
        emoji="🔤"
        subject="spelling"
        ageGroups={['4–6', '5–7']}
      >
        {(onComplete) => <AlphabetExplorerInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
