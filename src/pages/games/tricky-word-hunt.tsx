import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

const TOTAL_ROUNDS = 10;

// Tricky words by tier
const TRICKY_WORDS_TIER1 = [
  { word: 'the', hint: 'You use this word all the time!' },
  { word: 'said', hint: 'What you do when you speak' },
  { word: 'have', hint: 'To own or possess something' },
  { word: 'like', hint: 'When you enjoy something' },
  { word: 'some', hint: 'A few, not all' },
  { word: 'come', hint: 'To move towards something' },
  { word: 'were', hint: 'Past tense of "are"' },
  { word: 'there', hint: 'In that place' },
  { word: 'their', hint: 'Belonging to them' },
  { word: 'people', hint: 'More than one person' },
  { word: 'water', hint: 'You drink this every day' },
  { word: 'again', hint: 'One more time' },
];

const TRICKY_WORDS_TIER2 = [
  { word: 'because', hint: 'Gives a reason why' },
  { word: 'different', hint: 'Not the same' },
  { word: 'enough', hint: 'As much as needed' },
  { word: 'through', hint: 'From one side to the other' },
  { word: 'thought', hint: 'Past tense of think' },
  { word: 'caught', hint: 'Past tense of catch' },
  { word: 'beautiful', hint: 'Very pretty or pleasing' },
  { word: 'favourite', hint: 'The one you like most' },
  { word: 'important', hint: 'Matters a great deal' },
  { word: 'together', hint: 'With each other' },
  { word: 'friend', hint: 'Someone you like and trust' },
  { word: 'school', hint: 'Where you go to learn' },
];

const TRICKY_WORDS_TIER3 = [
  { word: 'necessary', hint: 'Cannot be done without' },
  { word: 'definitely', hint: 'Without any doubt' },
  { word: 'immediately', hint: 'Right now, without delay' },
  { word: 'independent', hint: 'Not relying on others' },
  { word: 'embarrass', hint: 'To make someone feel awkward' },
  { word: 'conscience', hint: 'Your inner sense of right and wrong' },
  { word: 'occurrence', hint: 'Something that happens' },
  { word: 'possession', hint: 'Something you own' },
  { word: 'parliament', hint: 'The group that makes laws' },
  { word: 'privilege', hint: 'A special right or advantage' },
  { word: 'guarantee', hint: 'A firm promise' },
  { word: 'exaggerate', hint: 'To make something seem bigger than it is' },
];

function generateOptions(correct: string): string[] {
  const misspellings: Record<string, string[]> = {
    the: ['teh', 'tha', 'thee'], said: ['sed', 'sayd', 'siad'], have: ['hav', 'haev', 'hafe'],
    like: ['lik', 'lyke', 'liek'], some: ['sum', 'som', 'sume'], come: ['cum', 'kom', 'cume'],
    were: ['wer', 'wear', 'wher'], there: ['their', 'thier', 'ther'], their: ['there', 'thier', 'ther'],
    people: ['pepol', 'peple', 'peopel'], water: ['watar', 'watre', 'wotter'], again: ['agian', 'agen', 'agayn'],
    because: ['becaus', 'becuase', 'becoz'], different: ['diferent', 'diffrent', 'diferant'],
    enough: ['enuf', 'enought', 'enuph'], through: ['threw', 'throo', 'thru'],
    thought: ['thougt', 'thort', 'thout'], caught: ['cort', 'caght', 'cawt'],
    beautiful: ['beutiful', 'beautifull', 'beatiful'], favourite: ['favorit', 'favrite', 'favouirite'],
    important: ['importent', 'importint', 'importnat'], together: ['togther', 'togeather', 'togather'],
    friend: ['freind', 'frend', 'freiend'], school: ['skool', 'scool', 'shcool'],
    necessary: ['necesary', 'neccesary', 'necessery'], definitely: ['definately', 'definitly', 'defenitely'],
    immediately: ['imediately', 'immediatly', 'imediately'], independent: ['independant', 'independint', 'independet'],
    embarrass: ['embarass', 'embarras', 'embaras'], conscience: ['consience', 'concience', 'consceince'],
    occurrence: ['occurence', 'occurance', 'occurrance'], possession: ['posession', 'possesion', 'posesion'],
    parliament: ['parliment', 'parliment', 'parlamente'], privilege: ['priviledge', 'privelege', 'privilige'],
    guarantee: ['guarentee', 'garantee', 'guaruntee'], exaggerate: ['exagerate', 'exaggerrate', 'exaggarate'],
  };
  const wrongs = (Object.hasOwn(misspellings, correct) ? misspellings[correct as keyof typeof misspellings] : undefined) ?? ['wrng1', 'wrng2', 'wrng3'];
  return [...wrongs.slice(0, 3), correct].sort(() => Math.random() - 0.5);
}

export default function TrickyWordHuntGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Tricky Word Hunt — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Hunt for tricky high-frequency words! A spelling and sight-word game for children aged 5–10." />
        <link rel="canonical" href="https://sodafom.uk/games/tricky-word-hunt" />
        <meta property="og:title" content="Tricky Word Hunt — Sodafom" />
        <meta property="og:description" content="Hunt for tricky high-frequency words! A spelling and sight-word game for children aged 5–10." />
        <meta property="og:url" content="https://sodafom.uk/games/tricky-word-hunt" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tricky Word Hunt — Sodafom" />
        <meta name="twitter:description" content="Hunt for tricky high-frequency words! A spelling and sight-word game for children aged 5–10." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/tricky-word-hunt#webpage","name":"Tricky Word Hunt — Sodafom","url":"https://sodafom.uk/games/tricky-word-hunt","description":"Hunt for tricky high-frequency words! A spelling and sight-word game for children aged 5–10.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Tricky Word Hunt — Spelling Game for Kids — Sodafom
      </h1>

      <GameShell title="Tricky Word Hunt" emoji="🔍" subject="spelling" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => <TrickyWordPlay onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}

function TrickyWordPlay({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const { tier } = useChildAge();
  const wordList = tier === 1 ? TRICKY_WORDS_TIER1 : tier === 2 ? TRICKY_WORDS_TIER2 : TRICKY_WORDS_TIER3;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [shuffled] = useState(() => [...wordList].sort(() => Math.random() - 0.5));

  const item = shuffled[round % shuffled.length];
  const options = generateOptions(item.word);

  // Report current question to Archie
  useEffect(() => { onQuestionChange?.(`${item.hint} — which spelling is correct?`); }, [round, item, onQuestionChange]);

  const speakWord = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(item.word);
    u.rate = 0.75;
    window.speechSynthesis.speak(u);
  };

  const pick = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    const isRight = opt === item.word;
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-red-50 to-background">
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
          <span>Word {round + 1}/{TOTAL_ROUNDS}</span>
          <span>⭐ {correct} correct</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-secondary rounded-full" animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <motion.div
        key={round}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="text-6xl mb-3">🔍</div>
        <h2 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Find the correct spelling!
        </h2>
        <div className="bg-card rounded-2xl px-6 py-4 border-2 border-border shadow-sm mb-2">
          <p className="text-muted-foreground text-sm mb-1">Hint:</p>
          <p className="font-bold text-foreground">{item.hint}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={speakWord}
          className="mt-2 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-secondary/20 text-secondary font-bold text-sm"
        >
          🔊 Hear the word
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {options.map(opt => {
          const isCorrect = opt === item.word;
          const isChosen = opt === chosen;
          let cls = 'bg-card border-border hover:border-secondary/50';
          if (chosen) {
            if (isCorrect) cls = 'bg-green-100 border-green-500';
            else if (isChosen) cls = 'bg-red-100 border-red-500';
          }
          return (
            <motion.button
              key={opt}
              whileHover={!chosen ? { scale: 1.04 } : {}}
              whileTap={!chosen ? { scale: 0.96 } : {}}
              onClick={() => pick(opt)}
              className={`py-4 px-3 rounded-2xl font-black text-lg border-2 transition-all ${cls}`}
            >
              {opt}
              {chosen && isCorrect && ' ✅'}
              {chosen && isChosen && !isCorrect && ' ❌'}
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
            {chosen === item.word ? '🎉 Correct!' : `❌ The answer is: ${item.word}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
