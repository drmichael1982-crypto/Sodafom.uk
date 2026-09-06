import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelBadge from '@/components/games/LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';

const SLUG = 'spelling-bee';
const TOTAL_ROUNDS = 10;

// [correct, wrong1, wrong2, wrong3] — 5 tiers of difficulty
const WORD_POOLS: [string, string, string, string][][] = [
  // Level 1 — simple 3-letter words
  [['cat','kat','catt','cet'],['dog','dag','doge','dob'],['hat','hatt','het','hut'],['run','ran','rune','runn'],['big','bige','bigg','bag'],['red','rad','reed','rede'],['cup','kup','cupp','cap'],['map','mapp','mep','mape'],['bed','bad','bede','bedd'],['hop','hopp','hap','hops']],
  // Level 2 — common KS1/KS2 words
  [['because','becaus','becuase','becose'],['friend','freind','frend','freiend'],['school','scool','shcool','skool'],['people','pepole','peaple','peopel'],['again','agian','agein','agen'],['could','coud','cuold','coold'],['would','woud','wuold','woold'],['their','thier','ther','thear'],['where','wher','whare','wheer'],['every','evry','evrey','everi']],
  // Level 3 — KS2 tricky words
  [['beautiful','beautifull','beutiful','beautful'],['different','diferent','diffrent','diferant'],['important','importent','importnat','importint'],['together','togather','togeather','togeter'],['thought','thougt','thort','thougth'],['through','throo','throgh','thruogh'],['favourite','favorit','favrite','favouirite'],['knowledge','knowlege','knoweldge','knolwedge'],['language','langauge','languige','languaje'],['mountain','mountian','mounten','mountaine']],
  // Level 4 — KS3 challenging
  [['necessary','nessesary','necesary','necessery'],['separate','seperate','separete','seperrate'],['definitely','definately','definitly','definetly'],['environment','enviroment','enviornment','enviorment'],['government','goverment','governement','govenment'],['immediately','imediately','immediatly','immedietly'],['recommend','recomend','reccomend','recommand'],['relevant','relevent','relavant','relevnt'],['sufficient','suficient','sufficent','sufficiant'],['temperature','temprature','temperture','temperrature']],
  // Level 5 — expert
  [['accommodation','accomodation','acommodation','accomodtion'],['achievement','acheivment','achievment','acheivement'],['conscience','consience','consciense','concience'],['embarrass','embarass','embarras','embarres'],['exaggerate','exagerate','exaggerrate','exaggarate'],['guarantee','guarentee','garantee','guarrantee'],['millennium','millenium','milennium','millenneum'],['occurrence','occurence','occurance','occurrance'],['parliament','parliment','parliment','parlamente'],['possession','posession','possesion','possesssion']],
];

function getEntry(level: number): [string, string, string, string] {
  const pool = WORD_POOLS[Math.min(level - 1, 4)];
  return pool[Math.floor(Math.random() * pool.length)];
}

function SpellingBeePlay({ onComplete, level, onLevelChange, onQuestionChange }: {
  onComplete: (r: GameResult) => void;
  onQuestionChange?: (q: string) => void;
  level: number;
  onLevelChange: (stars: number) => void;
}) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [entry, setEntry] = useState<[string, string, string, string]>(() => getEntry(level));
  const [options, setOptions] = useState<string[]>(() => [...getEntry(level)].sort(() => Math.random() - 0.5));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [hearCount, setHearCount] = useState(0);

  const word = entry[0];

  // Report current question to Archie hint button
  useEffect(() => { onQuestionChange?.(`Spell this word: ${word}`); }, [word, onQuestionChange]);

  useEffect(() => {
    const e = getEntry(level);
    setEntry(e);
    setOptions([...e].sort(() => Math.random() - 0.5));
    setFeedback(null); setChosen(null); setHearCount(0);
    setTimeout(() => speakWord(e[0]), 400);
  }, [round, level]);

  const speakWord = (w: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(w);
    u.rate = 0.7;
    window.speechSynthesis.speak(u);
    setHearCount(c => c + 1);
  };

  const handlePick = (opt: string) => {
    if (feedback) return;
    setChosen(opt);
    const isRight = opt === word;
    setFeedback(isRight ? 'correct' : 'wrong');
    const nc = correct + (isRight ? 1 : 0);
    if (isRight) setCorrect(nc);
    setTimeout(() => {
      const nr = round + 1;
      if (nr >= TOTAL_ROUNDS) {
        const score = Math.round((nc / TOTAL_ROUNDS) * 100);
        const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
        onLevelChange(stars);
        onComplete({ score, correct: nc, total: TOTAL_ROUNDS, stars });
      } else { setRound(nr); }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-yellow-50 to-background">
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <div>
          <div className="flex justify-between text-sm font-bold text-muted-foreground mb-1">
            <span>Word {round + 1}/{TOTAL_ROUNDS} · ⭐ {correct}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden w-48">
            <motion.div className="h-full bg-secondary rounded-full" animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
          </div>
        </div>
        <LevelBadge level={level} />
      </div>

      <motion.div key={round} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl mb-3 select-none">🐝</motion.div>
      <p className="text-lg font-bold text-muted-foreground mb-3 text-center">Listen and choose the correct spelling!</p>

      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={() => speakWord(word)}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-secondary text-secondary-foreground font-black text-lg shadow-lg mb-5">
        🔊 Hear the word {hearCount > 0 && `(×${hearCount})`}
      </motion.button>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className={`text-2xl font-black mb-3 ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? '🎉 Correct!' : `❌ It was: ${word}`}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {options.map((opt) => {
          const isChosen = chosen === opt; const isCorrect = opt === word;
          let cls = 'bg-card border-2 border-border text-foreground hover:border-secondary hover:bg-secondary/5';
          if (feedback && isChosen && feedback === 'correct') cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback && isChosen && feedback === 'wrong') cls = 'bg-red-500 border-red-500 text-white';
          else if (feedback && isCorrect) cls = 'bg-green-500 border-green-500 text-white';
          else if (feedback) cls = 'bg-muted border-border text-muted-foreground opacity-50';
          return (
            <motion.button key={opt} whileHover={!feedback ? { scale: 1.04 } : {}} whileTap={!feedback ? { scale: 0.96 } : {}}
              onClick={() => handlePick(opt)} disabled={!!feedback}
              className={`py-4 px-3 rounded-2xl text-lg font-black shadow-sm transition-all text-center break-all ${cls}`}>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function SpellingBeeGame() {
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
        <title>Spelling Bee — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Listen to the word and pick the correct spelling. Adaptive difficulty from simple words to expert level." />
        <link rel="canonical" href="https://sodafom.uk/games/spelling-bee" />
        <meta property="og:title" content="Spelling Bee — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Spelling Bee — Spelling Game for Kids — Sodafom
      </h1>
      <GameShell title="Spelling Bee" emoji="🐝" subject="spelling" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => loading ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground font-bold">Loading your level…</p></div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            {levelToast && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
              <LevelBadge level={displayLevel} showToast={levelToast} onToastDone={() => setLevelToast(null)} />
            </div>}
            <SpellingBeePlay onComplete={onComplete} level={displayLevel} onLevelChange={handleLevelChange} onQuestionChange={setCurrentQuestion} />
          </div>
        )}
      </GameShell>
    </>
  );
}
