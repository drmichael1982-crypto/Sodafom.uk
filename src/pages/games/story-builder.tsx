import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';

const CHARACTERS = [
  { name: 'Zara the Brave', emoji: '🦸‍♀️' },
  { name: 'Max the Explorer', emoji: '🧭' },
  { name: 'Luna the Wizard', emoji: '🧙‍♀️' },
  { name: 'Finn the Knight', emoji: '⚔️' },
];

const SETTINGS = [
  { name: 'an Enchanted Forest', emoji: '🌲' },
  { name: 'a Magical Castle', emoji: '🏰' },
  { name: 'a Faraway Planet', emoji: '🪐' },
  { name: 'an Underwater Kingdom', emoji: '🌊' },
];

const ADVENTURES = [
  { name: 'find a hidden treasure', emoji: '💎' },
  { name: 'rescue a friendly dragon', emoji: '🐉' },
  { name: 'solve a mysterious puzzle', emoji: '🧩' },
  { name: 'make a new friend', emoji: '🤝' },
];

const STORY_ENDINGS = [
  'And they lived happily ever after, with many more adventures to come! 🌟',
  'The whole kingdom celebrated their bravery and kindness! 🎉',
  'From that day on, they were the greatest hero the land had ever known! 🏆',
  'And so began the most amazing friendship the world had ever seen! 💫',
];

function buildStory(char: typeof CHARACTERS[0], setting: typeof SETTINGS[0], adventure: typeof ADVENTURES[0]) {
  const ending = STORY_ENDINGS[Math.floor(Math.random() * STORY_ENDINGS.length)];
  return [
    `Once upon a time, ${char.name} ${char.emoji} set off on a great journey to ${setting.name} ${setting.emoji}.`,
    `The path was long and full of surprises, but ${char.name.split(' ')[0]} was not afraid.`,
    `Deep in ${setting.name}, ${char.name.split(' ')[0]} discovered a chance to ${adventure.name} ${adventure.emoji}.`,
    `It wasn't easy — there were riddles to solve and obstacles to overcome.`,
    `But with courage, kindness, and a little bit of magic, ${char.name.split(' ')[0]} succeeded!`,
    ending,
  ];
}

type Phase = 'pick-char' | 'pick-setting' | 'pick-adventure' | 'story' | 'quiz';

const QUIZ_QUESTIONS = (char: typeof CHARACTERS[0], setting: typeof SETTINGS[0], adventure: typeof ADVENTURES[0]) => [
  {
    q: `Who is the hero of our story?`,
    answer: char.name,
    options: [char.name, ...CHARACTERS.filter(c => c.name !== char.name).slice(0, 2).map(c => c.name)].sort(() => Math.random() - 0.5),
  },
  {
    q: `Where did the adventure take place?`,
    answer: setting.name,
    options: [setting.name, ...SETTINGS.filter(s => s.name !== setting.name).slice(0, 2).map(s => s.name)].sort(() => Math.random() - 0.5),
  },
  {
    q: `What did our hero set out to do?`,
    answer: adventure.name,
    options: [adventure.name, ...ADVENTURES.filter(a => a.name !== adventure.name).slice(0, 2).map(a => a.name)].sort(() => Math.random() - 0.5),
  },
];

export default function StoryBuilderGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Story Builder — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Build creative stories by choosing characters, settings and events. A writing game for ages 8–13." />
        <link rel="canonical" href="https://sodafom.uk/games/story-builder" />
        <meta property="og:title" content="Story Builder — Sodafom" />
        <meta property="og:description" content="Build creative stories by choosing characters, settings and events. A writing game for ages 8–13." />
        <meta property="og:url" content="https://sodafom.uk/games/story-builder" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Story Builder — Sodafom" />
        <meta name="twitter:description" content="Build creative stories by choosing characters, settings and events. A writing game for ages 8–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/story-builder#webpage","name":"Story Builder — Sodafom","url":"https://sodafom.uk/games/story-builder","description":"Build creative stories by choosing characters, settings and events. A writing game for ages 8–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Story Builder — Reading Game for Kids — Sodafom
      </h1>

      <GameShell title="Story Builder" emoji="📜" subject="reading" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion}>
        {(onComplete) => <StoryBuilderPlay onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}

function StoryBuilderPlay({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const [phase, setPhase] = useState<Phase>('pick-char');
  const [char, setChar] = useState<typeof CHARACTERS[0] | null>(null);
  const [setting, setSetting] = useState<typeof SETTINGS[0] | null>(null);
  const [adventure, setAdventure] = useState<typeof ADVENTURES[0] | null>(null);
  const [storyLines, setStoryLines] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [quizQ, setQuizQ] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    const prompts: Record<string, string> = {
      'pick-char': 'Choose a character for your story!',
      'pick-setting': 'Choose a setting for your story!',
      'pick-adventure': 'Choose an adventure for your story!',
      'story': 'Read your story carefully — there will be questions after!',
      'quiz': 'Answer the comprehension question about your story.',
    };
    onQuestionChange?.(prompts[phase] ?? 'Build your story!');
  }, [phase, onQuestionChange]);

  const speakLine = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const startStory = (adv: typeof ADVENTURES[0]) => {
    setAdventure(adv);
    const lines = buildStory(char!, setting!, adv);
    setStoryLines(lines);
    setLineIndex(0);
    setPhase('story');
    setTimeout(() => speakLine(lines[0]), 300);
  };

  const nextLine = () => {
    const next = lineIndex + 1;
    if (next >= storyLines.length) {
      setPhase('quiz');
      setQuizQ(0);
      setChosen(null);
    } else {
      setLineIndex(next);
      const nextLine = storyLines.at(next);
      if (nextLine) speakLine(nextLine);
    }
  };

  const answerQuiz = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    const questions = QUIZ_QUESTIONS(char!, setting!, adventure!);
    const isRight = opt === questions.at(quizQ)?.answer;
    if (isRight) setQuizCorrect(c => c + 1);
    setTimeout(() => {
      const nextQ = quizQ + 1;
      if (nextQ >= questions.length) {
        const newCorrect = quizCorrect + (isRight ? 1 : 0);
        const score = Math.round((newCorrect / questions.length) * 100);
        onComplete({ score, correct: newCorrect, total: questions.length, stars: 0 });
      } else {
        setQuizQ(nextQ);
        setChosen(null);
      }
    }, 1000);
  };

  const questions = char && setting && adventure ? QUIZ_QUESTIONS(char, setting, adventure) : [];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-background">
      <AnimatePresence mode="wait">
        {phase === 'pick-char' && (
          <motion.div key="char" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-md text-center">
            <div className="text-5xl mb-3">📜</div>
            <h2 className="text-2xl font-black text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Choose your hero!</h2>
            <div className="grid grid-cols-2 gap-3">
              {CHARACTERS.map(c => (
                <motion.button key={c.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setChar(c); setPhase('pick-setting'); }}
                  className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/50">
                  <span className="text-4xl">{c.emoji}</span>
                  <span className="font-bold text-sm text-foreground">{c.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'pick-setting' && (
          <motion.div key="setting" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-md text-center">
            <div className="text-4xl mb-2">{char?.emoji}</div>
            <h2 className="text-2xl font-black text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Where does the adventure happen?</h2>
            <div className="grid grid-cols-2 gap-3">
              {SETTINGS.map(s => (
                <motion.button key={s.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSetting(s); setPhase('pick-adventure'); }}
                  className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/50">
                  <span className="text-4xl">{s.emoji}</span>
                  <span className="font-bold text-sm text-foreground">{s.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'pick-adventure' && (
          <motion.div key="adventure" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-md text-center">
            <h2 className="text-2xl font-black text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>What is the quest?</h2>
            <div className="grid grid-cols-2 gap-3">
              {ADVENTURES.map(a => (
                <motion.button key={a.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => startStory(a)}
                  className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/50">
                  <span className="text-4xl">{a.emoji}</span>
                  <span className="font-bold text-sm text-foreground capitalize">{a.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'story' && (
          <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg text-center">
            <div className="text-sm font-bold text-muted-foreground mb-2">Page {lineIndex + 1} of {storyLines.length}</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((lineIndex + 1) / storyLines.length) * 100}%` }} />
            </div>
            <motion.div
              key={lineIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-8 border-2 border-border shadow-md mb-6 min-h-[120px] flex items-center justify-center"
            >
              <p className="text-xl font-bold text-foreground leading-relaxed">{storyLines.at(lineIndex) ?? ''}</p>
            </motion.div>
            <div className="flex gap-3 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => speakLine(storyLines.at(lineIndex) ?? '')}
                className="px-5 py-3 rounded-xl font-bold bg-primary/10 text-primary border border-primary/20">
                🔊 Read aloud
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={nextLine}
                className="px-8 py-3 rounded-xl font-black bg-primary text-primary-foreground">
                {lineIndex < storyLines.length - 1 ? 'Next ➡️' : 'Answer questions! 🎯'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'quiz' && questions.length > 0 && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-md text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm font-bold text-muted-foreground mb-2">Question {quizQ + 1} of {questions.length}</p>
            <h2 className="text-xl font-black text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              {questions.at(quizQ)?.q}
            </h2>
            <div className="flex flex-col gap-3">
              {questions.at(quizQ)?.options.map(opt => {
                const isCorrect = opt === questions.at(quizQ)?.answer;
                const isChosen = opt === chosen;
                let cls = 'bg-card border-border hover:border-primary/50';
                if (chosen) {
                  if (isCorrect) cls = 'bg-green-100 border-green-500';
                  else if (isChosen) cls = 'bg-red-100 border-red-500';
                }
                return (
                  <motion.button key={opt} whileHover={!chosen ? { scale: 1.03 } : {}} whileTap={!chosen ? { scale: 0.97 } : {}}
                    onClick={() => answerQuiz(opt)}
                    className={`py-3 px-4 rounded-2xl font-bold text-base border-2 transition-all text-left ${cls}`}>
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
