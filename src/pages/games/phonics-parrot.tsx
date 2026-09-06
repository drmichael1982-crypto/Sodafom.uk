import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';

const TOTAL_ROUNDS = 10;

const PHONICS_SETS = [
  // Single sounds
  { letter: 'S', sound: 'ssss', word: 'sun', emoji: '☀️', example: 'S is for Sun' },
  { letter: 'A', sound: 'aaa', word: 'apple', emoji: '🍎', example: 'A is for Apple' },
  { letter: 'T', sound: 'ttt', word: 'tiger', emoji: '🐯', example: 'T is for Tiger' },
  { letter: 'P', sound: 'ppp', word: 'parrot', emoji: '🦜', example: 'P is for Parrot' },
  { letter: 'I', sound: 'iii', word: 'insect', emoji: '🐛', example: 'I is for Insect' },
  { letter: 'N', sound: 'nnn', word: 'nest', emoji: '🪺', example: 'N is for Nest' },
  // Blends
  { letter: 'SH', sound: 'shh', word: 'ship', emoji: '🚢', example: 'SH is for Ship' },
  { letter: 'CH', sound: 'ch', word: 'chair', emoji: '🪑', example: 'CH is for Chair' },
  { letter: 'TH', sound: 'th', word: 'thumb', emoji: '👍', example: 'TH is for Thumb' },
  { letter: 'OO', sound: 'oo', word: 'moon', emoji: '🌙', example: 'OO is for Moon' },
  { letter: 'EE', sound: 'ee', word: 'bee', emoji: '🐝', example: 'EE is for Bee' },
  { letter: 'AI', sound: 'ay', word: 'rain', emoji: '🌧️', example: 'AI is for Rain' },
];


export default function PhonicsParrotGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Phonics Parrot — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Learn phonics sounds with a friendly parrot! A reading and phonics game for children aged 5–7." />
        <link rel="canonical" href="https://sodafom.uk/games/phonics-parrot" />
        <meta property="og:title" content="Phonics Parrot — Sodafom" />
        <meta property="og:description" content="Learn phonics sounds with a friendly parrot! A reading and phonics game for children aged 5–7." />
        <meta property="og:url" content="https://sodafom.uk/games/phonics-parrot" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Phonics Parrot — Sodafom" />
        <meta name="twitter:description" content="Learn phonics sounds with a friendly parrot! A reading and phonics game for children aged 5–7." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/phonics-parrot#webpage","name":"Phonics Parrot — Sodafom","url":"https://sodafom.uk/games/phonics-parrot","description":"Learn phonics sounds with a friendly parrot! A reading and phonics game for children aged 5–7.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Phonics Parrot — Reading Game for Kids — Sodafom
      </h1>

      <GameShell title="Phonics Parrot" emoji="🦜" subject="reading" ageGroups={['5–7']} currentQuestion={currentQuestion}>
        {(onComplete) => <PhonicsParrotPlay onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}

function PhonicsParrotPlay({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [q] = useState(() => PHONICS_SETS.sort(() => Math.random() - 0.5));

  const item = q[round % q.length];
  const others = PHONICS_SETS.filter(p => p.letter !== item.letter).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...others.map(p => ({ word: p.word, emoji: p.emoji })), { word: item.word, emoji: item.emoji }].sort(() => Math.random() - 0.5);

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`${item.example} — which word starts with the sound "${item.letter}"?`); }, [round, item, onQuestionChange]);

  const speakSound = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(item.letter + '... ' + item.example);
    u.rate = 0.7;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  };

  const pick = (word: string) => {
    if (chosen) return;
    setChosen(word);
    const isRight = word === item.word;
    if (isRight) setCorrect(c => c + 1);
    setTimeout(() => {
      const next = round + 1;
      if (next >= TOTAL_ROUNDS) {
        const newCorrect = correct + (isRight ? 1 : 0);
        onComplete({ score: Math.round((newCorrect / TOTAL_ROUNDS) * 100), correct: newCorrect, total: TOTAL_ROUNDS, stars: 0 });
      } else {
        setRound(next);
        setChosen(null);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-background">
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
          <span>Sound {round + 1}/{TOTAL_ROUNDS}</span>
          <span>⭐ {correct} correct</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      {/* Parrot */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl mb-2 select-none"
      >
        🦜
      </motion.div>

      <p className="text-sm font-bold text-muted-foreground mb-4">Pip says:</p>

      {/* Sound card */}
      <motion.div
        key={round}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-primary text-primary-foreground rounded-3xl px-10 py-6 text-center mb-4 shadow-lg"
      >
        <div className="text-6xl font-black mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{item.letter}</div>
        <p className="text-primary-foreground/80 text-sm">{item.example}</p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={speakSound}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary font-bold mb-6"
      >
        🔊 Hear the sound
      </motion.button>

      <p className="text-base font-black text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        Which word starts with <span className="text-primary">{item.letter}</span>?
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {options.map(opt => {
          const isCorrect = opt.word === item.word;
          const isChosen = opt.word === chosen;
          let cls = 'bg-card border-border hover:border-primary/50';
          if (chosen) {
            if (isCorrect) cls = 'bg-green-100 border-green-500';
            else if (isChosen) cls = 'bg-red-100 border-red-500';
          }
          return (
            <motion.button
              key={opt.word}
              whileHover={!chosen ? { scale: 1.05 } : {}}
              whileTap={!chosen ? { scale: 0.95 } : {}}
              onClick={() => pick(opt.word)}
              className={`py-4 rounded-2xl font-black text-lg border-2 transition-all flex flex-col items-center gap-1 ${cls}`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span>{opt.word}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {chosen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-xl font-black ${chosen === item.word ? 'text-green-600' : 'text-red-500'}`}
          >
            {chosen === item.word ? `🎉 Yes! ${item.letter} is for ${item.word}!` : `❌ ${item.letter} is for ${item.word} ${item.emoji}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
