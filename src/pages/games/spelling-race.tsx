import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';

// [correct, wrong1, wrong2, wrong3]
const WORDS: [string, string, string, string][] = [
  ['because',      'becaus',      'becuase',      'becose'],
  ['friend',       'freind',      'frend',        'freiend'],
  ['school',       'scool',       'shcool',       'skool'],
  ['people',       'pepole',      'peaple',       'peopel'],
  ['beautiful',    'beautifull',  'beutiful',     'beautful'],
  ['necessary',    'nessesary',   'necesary',     'necessery'],
  ['different',    'diferent',    'diffrent',     'diferant'],
  ['possible',     'posible',     'possibel',     'possibble'],
  ['separate',     'seperate',    'separete',     'seperrate'],
  ['definitely',   'definately',  'definitly',    'definetly'],
  ['environment',  'enviroment',  'enviornment',  'enviorment'],
  ['government',   'goverment',   'governement',  'govenment'],
  ['immediately',  'imediately',  'immediatly',   'immedietly'],
  ['occasionally', 'ocasionally', 'occassionally','ocassionally'],
  ['particularly', 'particulary', 'particuarly',  'particullarly'],
  ['recommend',    'recomend',    'reccomend',    'recommand'],
  ['relevant',     'relevent',    'relavant',     'relevnt'],
  ['sufficient',   'suficient',   'sufficent',    'sufficiant'],
  ['temperature',  'temprature',  'temperture',   'temperrature'],
  ['unfortunately','unfortunatly','unfortunetly', 'unfortuantely'],
];

function RaceInner({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [shuffled] = useState<string[][]>(() => WORDS.map(w => [...w].sort(() => Math.random() - 0.5)));

  const word = WORDS[idx][0];
  const opts = shuffled[idx];

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`Which is the correct spelling? (Hint: it means "${word}")`); }, [idx, word, onQuestionChange]);

  useEffect(() => {
    if (feedback) return;
    if (timeLeft <= 0) {
      // Time's up — mark wrong and advance
      setFeedback('wrong');
      const nr = idx + 1;
      setTimeout(() => {
        setFeedback(null);
        setChosen(null);
        if (nr >= WORDS.length) {
          const score = Math.round((correct / WORDS.length) * 100);
          onComplete({ score, correct, total: WORDS.length, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 });
        } else { setIdx(nr); setTimeLeft(15); }
      }, 800);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, feedback, idx, correct, onComplete]);

  function pick(opt: string) {
    if (feedback) return;
    setChosen(opt);
    const isCorrect = opt === word;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const nc = correct + (isCorrect ? 1 : 0);
    setTimeout(() => {
      setFeedback(null);
      setChosen(null);
      const nr = idx + 1;
      if (nr >= WORDS.length) {
        const score = Math.round((nc / WORDS.length) * 100);
        onComplete({ score, correct: nc, total: WORDS.length, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 });
      } else { setIdx(nr); setCorrect(nc); setTimeLeft(15); }
    }, 800);
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4 max-w-sm mx-auto">
      <div className="flex justify-between w-full text-sm font-bold">
        <span className="text-muted-foreground">{idx + 1}/{WORDS.length} · ⭐ {correct}</span>
        <span className={timeLeft <= 5 ? 'text-secondary' : 'text-foreground'}>⏱ {timeLeft}s</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(timeLeft / 15) * 100}%` }} />
      </div>

      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-border rounded-2xl p-5 w-full text-center">
        <p className="text-xs font-bold text-muted-foreground mb-1">Which is the correct spelling?</p>
        <p className="text-2xl font-black">Hear it: <button onClick={() => {
          if (!window.speechSynthesis) return;
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(word);
          u.rate = 0.7;
          window.speechSynthesis.speak(u);
        }} className="text-secondary underline">🔊 Listen</button></p>
      </motion.div>

      <AnimatePresence>
        {feedback && (
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
            className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? '✅ Correct!' : `❌ It was "${word}"`}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 w-full">
        {opts.map((opt) => {
          const isChosen = chosen === opt;
          const isCorrect = opt === word;
          let cls = 'bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5';
          if (feedback && isChosen && feedback === 'correct') cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback && isChosen && feedback === 'wrong') cls = 'bg-red-500 border-red-500 text-white';
          else if (feedback && isCorrect) cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback) cls = 'bg-muted border-border text-muted-foreground opacity-50';
          return (
            <motion.button key={opt} whileHover={!feedback ? { scale: 1.04 } : {}} whileTap={!feedback ? { scale: 0.96 } : {}}
              onClick={() => pick(opt)} disabled={!!feedback}
              className={`py-4 px-3 rounded-2xl text-base font-black shadow-sm transition-all text-center break-all ${cls}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function SpellingRace() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Spelling Race — Sodafom</title>
        <meta name="description" content="Race against the clock to choose the correct spelling as fast as possible!" />
        <link rel="canonical" href="https://sodafom.uk/games/spelling-race" />
        <meta property="og:title" content="Spelling Race — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Spelling Race — Spelling Game for Kids — Sodafom
      </h1>
      <GameShell title="Spelling Race" emoji="🏁" subject="spelling" ageGroups={['8–10', '11–13']} currentQuestion={currentQuestion}>
        {(oc) => <RaceInner onComplete={oc} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}
