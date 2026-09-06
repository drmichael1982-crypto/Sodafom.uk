import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

const TOTAL_ROUNDS = 10;

const WORD_SETS = {
  easy: ['cat', 'dog', 'sun', 'hat', 'run', 'big', 'red', 'cup', 'map', 'bed', 'hop', 'wet', 'fun', 'log', 'pin'],
  medium: ['spell', 'magic', 'brave', 'cloud', 'plant', 'stone', 'light', 'dream', 'flame', 'frost'],
  hard: ['wizard', 'castle', 'dragon', 'forest', 'bridge', 'silver', 'golden', 'purple', 'mirror', 'candle'],
  // Tier 3 extra: longer, trickier words
  expert: ['champion', 'treasure', 'adventure', 'discover', 'mystery', 'brilliant', 'fantastic', 'enormous', 'invisible', 'wonderful'],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function WordWizardGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Word Wizard — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Unscramble letters to make words and become a Word Wizard! A spelling game for ages 5–10." />
        <link rel="canonical" href="https://sodafom.uk/games/word-wizard" />
        <meta property="og:title" content="Word Wizard — Sodafom" />
        <meta property="og:description" content="Unscramble letters to make words and become a Word Wizard! A spelling game for ages 5–10." />
        <meta property="og:url" content="https://sodafom.uk/games/word-wizard" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Word Wizard — Sodafom" />
        <meta name="twitter:description" content="Unscramble letters to make words and become a Word Wizard! A spelling game for ages 5–10." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/word-wizard#webpage","name":"Word Wizard — Sodafom","url":"https://sodafom.uk/games/word-wizard","description":"Unscramble letters to make words and become a Word Wizard! A spelling game for ages 5–10.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Word Wizard — Spelling Game for Kids — Sodafom
      </h1>

      <GameShell title="Word Wizard" emoji="🧙" subject="spelling" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => <WordWizardPlay onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}

function WordWizardPlay({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const { tier } = useChildAge();

  function getWords(round: number): string[] {
    if (tier === 1) return round < 6 ? WORD_SETS.easy : WORD_SETS.medium;
    if (tier === 2) {
      if (round < 4) return WORD_SETS.easy;
      if (round < 7) return WORD_SETS.medium;
      return WORD_SETS.hard;
    }
    // Tier 3
    if (round < 4) return WORD_SETS.medium;
    if (round < 7) return WORD_SETS.hard;
    return WORD_SETS.expert;
  }
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [word, setWord] = useState('');
  const [letters, setLetters] = useState<{ char: string; id: number }[]>([]);
  const [placed, setPlaced] = useState<{ char: string; id: number }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const pool = getWords(round);
    const w = pool[Math.floor(Math.random() * pool.length)];
    setWord(w);
    setLetters(shuffle(w.split('').map((c, i) => ({ char: c, id: i }))));
    setPlaced([]);
    setFeedback(null);
    onQuestionChange?.(`Unscramble the letters to make a word: ${shuffle(w.split('')).join(' ')}`);
  }, [round]);

  const speakWord = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const placeLetter = (l: { char: string; id: number }) => {
    if (feedback) return;
    setLetters(prev => prev.filter(x => x.id !== l.id));
    setPlaced(prev => [...prev, l]);
  };

  const removeLetter = (l: { char: string; id: number }) => {
    if (feedback) return;
    setPlaced(prev => prev.filter(x => x.id !== l.id));
    setLetters(prev => [...prev, l]);
  };

  const checkSpelling = () => {
    if (feedback) return;
    const attempt = placed.map(l => l.char).join('');
    const isRight = attempt === word;
    setFeedback(isRight ? 'correct' : 'wrong');
    if (isRight) {
      setCorrect(c => c + 1);
      setStars(s => s + 1);
    }
    setTimeout(() => {
      const next = round + 1;
      if (next >= TOTAL_ROUNDS) {
        const newCorrect = correct + (isRight ? 1 : 0);
        onComplete({ score: Math.round((newCorrect / TOTAL_ROUNDS) * 100), correct: newCorrect, total: TOTAL_ROUNDS, stars: 0 });
      } else {
        setRound(next);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-purple-50 to-background">
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
          <span>Spell {round + 1}/{TOTAL_ROUNDS}</span>
          <span>⭐ {stars} stars</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-secondary rounded-full" animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      {/* Wizard + hint */}
      <motion.div
        key={round}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-7xl mb-2 select-none"
      >
        🧙
      </motion.div>

      <div className="flex items-center gap-3 mb-6">
        <p className="text-lg font-bold text-muted-foreground">Unscramble the letters to cast the spell!</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={speakWord}
          className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-xl"
          title="Hear the word"
        >
          🔊
        </motion.button>
      </div>

      {/* Answer slots */}
      <div className="flex gap-2 mb-4 min-h-[56px] flex-wrap justify-center">
        {placed.map(l => (
          <motion.button
            key={l.id}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            onClick={() => removeLetter(l)}
            className="w-12 h-12 rounded-xl bg-secondary text-secondary-foreground font-black text-xl shadow-md border-2 border-secondary/50 uppercase"
          >
            {l.char}
          </motion.button>
        ))}
        {[...Array(word.length - placed.length)].map((_, i) => (
          <div key={i} className="w-12 h-12 rounded-xl border-2 border-dashed border-border bg-muted/50" />
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-2xl font-black mb-3 ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}
          >
            {feedback === 'correct' ? '✨ Spell cast!' : `❌ It was: ${word}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter tiles */}
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {letters.map(l => (
          <motion.button
            key={l.id}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => placeLetter(l)}
            className="w-12 h-12 rounded-xl bg-accent text-accent-foreground font-black text-xl shadow-md border-2 border-accent/50 uppercase"
          >
            {l.char}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setLetters(shuffle(word.split('').map((c, i) => ({ char: c, id: i }))));
            setPlaced([]);
          }}
          disabled={!!feedback}
          className="px-5 py-3 rounded-xl font-bold bg-muted text-foreground border border-border disabled:opacity-50"
        >
          Reset
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={checkSpelling}
          disabled={!!feedback || placed.length !== word.length}
          className="px-8 py-3 rounded-xl font-black bg-secondary text-secondary-foreground disabled:opacity-50"
        >
          Cast Spell! ✨
        </motion.button>
      </div>
    </div>
  );
}
