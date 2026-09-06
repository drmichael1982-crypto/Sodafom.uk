import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelBadge from '@/components/games/LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';

const SLUG = 'spelling-challenge';

// [correct, wrong1, wrong2, wrong3] with a hint
const WORD_POOLS: { hint: string; options: [string, string, string, string] }[][] = [
  // Level 1
  [
    { hint: 'A furry pet that meows',           options: ['cat',     'kat',     'catt',    'cet']    },
    { hint: 'A furry pet that barks',            options: ['dog',     'dag',     'doge',    'dob']    },
    { hint: 'You wear it on your head',          options: ['hat',     'hatt',    'het',     'hut']    },
    { hint: 'Move your legs fast',               options: ['run',     'ran',     'rune',    'runn']   },
    { hint: 'The colour of fire',                options: ['red',     'rad',     'reed',    'rede']   },
  ],
  // Level 2
  [
    { hint: 'For the reason that',              options: ['because',   'becaus',   'becuase',   'becose']   },
    { hint: 'Someone you like and trust',        options: ['friend',    'freind',   'frend',     'freiend']  },
    { hint: 'Where children go to learn',        options: ['school',    'scool',    'shcool',    'skool']    },
    { hint: 'More than one person',              options: ['people',    'pepole',   'peaple',    'peopel']   },
    { hint: 'To think something is true',        options: ['believe',   'beleive',  'belive',    'beleave']  },
  ],
  // Level 3
  [
    { hint: 'Very pretty or attractive',         options: ['beautiful',   'beautifull', 'beutiful',   'beautful']    },
    { hint: 'Not the same',                      options: ['different',   'diferent',   'diffrent',   'diferant']    },
    { hint: 'Very important',                    options: ['essential',   'esential',   'essencial',  'essentiel']   },
    { hint: 'The world around us',               options: ['environment', 'enviroment', 'enviornment','enviorment']  },
    { hint: 'People who run a country',          options: ['government',  'goverment',  'governement','govenment']   },
  ],
  // Level 4
  [
    { hint: 'Something you must have',           options: ['necessary',   'nessesary',  'necesary',   'necessery']   },
    { hint: 'Without any doubt',                 options: ['definitely',  'definately', 'definitly',  'definetly']   },
    { hint: 'Right now, without delay',          options: ['immediately', 'imediately', 'immediatly', 'immedietly']  },
    { hint: 'To keep apart',                     options: ['separate',    'seperate',   'separete',   'seperrate']   },
    { hint: 'To suggest strongly',               options: ['recommend',   'recomend',   'reccomend',  'recommand']   },
  ],
  // Level 5
  [
    { hint: 'A place to stay on holiday',        options: ['accommodation','accomodation','acommodation','accomodtion'] },
    { hint: 'Something you feel bad about',      options: ['embarrass',   'embarass',   'embarras',   'embarres']    },
    { hint: 'To make something seem bigger',     options: ['exaggerate',  'exagerate',  'exaggerrate','exaggarate']  },
    { hint: 'A promise that something is true',  options: ['guarantee',   'guarentee',  'garantee',   'guarrantee']  },
    { hint: 'A thousand years',                  options: ['millennium',  'millenium',  'milennium',  'millenneum']  },
  ],
];

function getPool(level: number) { return WORD_POOLS[Math.min(level - 1, 4)]; }

function ChallengeInner({ onComplete, level, onLevelChange, onQuestionChange }: {
  onComplete: (r: GameResult) => void;
  level: number;
  onLevelChange: (stars: number) => void;
  onQuestionChange?: (q: string) => void;
}) {
  const pool = getPool(level);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [shuffled] = useState<string[][]>(() => pool.map(w => [...w.options].sort(() => Math.random() - 0.5)));

  const q = pool[idx];
  const correctWord = q.options[0];
  const opts = shuffled[idx];

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`${q.hint} — which spelling is correct?`); }, [idx, q.hint, onQuestionChange]);

  function pick(opt: string) {
    if (feedback) return;
    setChosen(opt);
    const isCorrect = opt === correctWord;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const nc = correct + (isCorrect ? 1 : 0);
    setTimeout(() => {
      setFeedback(null); setChosen(null);
      const nr = idx + 1;
      if (nr >= pool.length) {
        const score = Math.round((nc / pool.length) * 100);
        const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
        onLevelChange(stars);
        onComplete({ score, correct: nc, total: pool.length, stars });
      } else { setIdx(nr); setCorrect(nc); }
    }, 1000);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-sm mx-auto">
      <div className="flex justify-between w-full items-center">
        <p className="text-xs text-muted-foreground font-semibold">Word {idx + 1}/{pool.length} · ⭐ {correct}</p>
        <LevelBadge level={level} />
      </div>
      <div className="bg-card border-2 border-border rounded-2xl p-6 w-full text-center">
        <p className="text-xs font-bold text-muted-foreground mb-2">Which is the correct spelling?</p>
        <p className="text-xl font-black">{q.hint}</p>
      </div>
      <AnimatePresence>
        {feedback && (
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
            className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? '✅ Correct!' : `❌ It was: ${correctWord}`}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-2 gap-3 w-full">
        {opts.map((opt) => {
          const isChosen = chosen === opt; const isCorrect = opt === correctWord;
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

export default function SpellingChallenge() {
  const { level, loading, recordResult } = useGameLevel(SLUG);
  const [levelToast, setLevelToast] = useState<'up' | 'down' | null>(null);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleLevelChange = async (stars: number) => {
    const prev = displayLevel;
    const next = await recordResult(stars);
    if (next > prev) setLevelToast('up');
    else if (next < prev) setLevelToast('down');
    setDisplayLevel(next);
  };

  return (
    <>
      <Helmet>
        <title>Spelling Challenge — Sodafom</title>
        <meta name="description" content="Can you spot the correct spelling? Adaptive difficulty from simple to expert words." />
        <link rel="canonical" href="https://sodafom.uk/games/spelling-challenge" />
        <meta property="og:title" content="Spelling Challenge — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Spelling Challenge — Spelling Game for Kids — Sodafom
      </h1>
      <GameShell title="Spelling Challenge" emoji="📝" subject="spelling" ageGroups={['8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => loading ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground font-bold">Loading your level…</p></div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {levelToast && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
              <LevelBadge level={displayLevel} showToast={levelToast} onToastDone={() => setLevelToast(null)} />
            </div>}
            <ChallengeInner onComplete={onComplete} level={displayLevel} onLevelChange={handleLevelChange} onQuestionChange={setCurrentQuestion} />
          </div>
        )}
      </GameShell>
    </>
  );
}
