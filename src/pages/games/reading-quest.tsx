import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';
import { useVoice } from '@/lib/voice-context';

interface Passage {
  title: string;
  emoji: string;
  tier: 1 | 2 | 3;
  text: string;
  questions: { q: string; answer: string; options: string[]; hint: string }[];
}

export const READING_PASSAGES: Passage[] = [
  // ── Tier 1 (ages 5–7): short, simple sentences ────────────────────────────
  {
    tier: 1, title: 'The Red Balloon', emoji: '🎈',
    text: `Tom had a big red balloon. He took it to the park. The wind blew and the balloon flew up into the sky. Tom was sad. Then a kind girl gave him a blue balloon. Tom smiled.`,
    questions: [
      { q: 'What colour was Tom\'s balloon?', answer: 'Red', options: ['Red', 'Blue', 'Green', 'Yellow'], hint: 'Look at the first sentence and find the colour word.' },
      { q: 'Where did Tom go?', answer: 'The park', options: ['The park', 'School', 'Home', 'The shops'], hint: 'Look at the sentence that begins “He took it…”' },
      { q: 'How did Tom feel when his balloon flew away?', answer: 'Sad', options: ['Sad', 'Happy', 'Angry', 'Scared'], hint: 'Find the feeling word just after the balloon flies away.' },
    ],
  },
  {
    tier: 1, title: 'The Hungry Cat', emoji: '🐱',
    text: `Mia had a cat called Pip. Pip was very hungry. He sat by his bowl and meowed loudly. Mia gave him some fish. Pip ate it all up and purred. Then he curled up and went to sleep.`,
    questions: [
      { q: 'What was the cat\'s name?', answer: 'Pip', options: ['Pip', 'Tom', 'Mia', 'Fish'], hint: 'The cat is introduced in the first sentence.' },
      { q: 'What did Mia give Pip to eat?', answer: 'Fish', options: ['Fish', 'Milk', 'Biscuits', 'Chicken'], hint: 'Look for the sentence immediately after Pip meows.' },
      { q: 'What did Pip do after eating?', answer: 'Went to sleep', options: ['Went to sleep', 'Ran outside', 'Meowed more', 'Played'], hint: 'Read the final sentence again.' },
    ],
  },
  // ── Tier 2 (ages 8–10): longer passages, some inference ──────────────────
  {
    tier: 2, title: 'The Lost Compass', emoji: '🧭',
    text: `Maya found an old compass in her grandmother's attic. It was made of brass and had strange symbols around the edge. When she held it up, the needle didn't point north — it pointed towards the old oak tree in the garden. Maya followed it and discovered a small wooden box buried beneath the roots. Inside was a letter from her great-great-grandmother, written in 1923, describing a treasure hidden long ago.`,
    questions: [
      { q: 'Where did Maya find the compass?', answer: "Her grandmother's attic", options: ["Her grandmother's attic", 'The garden', 'A museum', 'Her bedroom'], hint: 'The place is named in the opening sentence.' },
      { q: 'What was unusual about the compass?', answer: "It didn't point north", options: ["It didn't point north", 'It was broken', 'It was invisible', 'It was made of gold'], hint: 'Compare where a compass usually points with where this needle pointed.' },
      { q: 'What did Maya find under the oak tree?', answer: 'A wooden box', options: ['A wooden box', 'A golden key', 'A map', 'A coin'], hint: 'Look for what was buried beneath the roots.' },
    ],
  },
  {
    tier: 2, title: 'The Robot Chef', emoji: '🤖',
    text: `In the year 2150, every kitchen had a robot chef. Zara's robot was called Biscuit. One morning, Biscuit decided to make a surprise breakfast. He searched the internet for the most popular recipe and found "Galaxy Pancakes" — pancakes that changed colour when you poured syrup on them. Zara woke up to find purple, blue, and gold pancakes stacked high on the table. "Biscuit," she said, "you're the best chef in the universe."`,
    questions: [
      { q: 'What was the name of Zara\'s robot?', answer: 'Biscuit', options: ['Biscuit', 'Sparky', 'Bolt', 'Chip'], hint: 'The robot is named in the second sentence.' },
      { q: 'What did Biscuit make for breakfast?', answer: 'Galaxy Pancakes', options: ['Galaxy Pancakes', 'Robot Waffles', 'Space Toast', 'Star Eggs'], hint: 'Find the recipe name inside quotation marks.' },
      { q: 'What happened when you poured syrup on the pancakes?', answer: 'They changed colour', options: ['They changed colour', 'They exploded', 'They grew bigger', 'They disappeared'], hint: 'The passage explains this straight after the recipe name.' },
    ],
  },
  // ── Tier 3 (ages 11–13): complex passages, inference and vocabulary ────────
  {
    tier: 3, title: 'The Midnight Library', emoji: '📚',
    text: `Every night at midnight, the old library on Elm Street came to life. The books would float off the shelves and whisper their stories to each other. The librarian, Mr. Finch, had known about this for forty years but kept it secret. One night, a young girl named Priya stayed late to finish her homework. She heard the whispering and crept between the shelves. A book about dragons floated towards her and opened to the first page. "I've been waiting for you," it said.`,
    questions: [
      { q: 'What happened to the books at midnight?', answer: 'They floated and whispered', options: ['They floated and whispered', 'They caught fire', 'They disappeared', 'They sang songs'], hint: 'Reread what the books do in the second sentence.' },
      { q: 'How long had Mr. Finch known the secret?', answer: 'Forty years', options: ['Forty years', 'Ten years', 'One year', 'A hundred years'], hint: 'Find the number linked to the librarian.' },
      { q: 'Why was Priya in the library late?', answer: 'To finish her homework', options: ['To finish her homework', 'To steal a book', 'To meet Mr. Finch', 'To sleep'], hint: 'Her reason appears immediately after she is introduced.' },
    ],
  },
  {
    tier: 3, title: "The Inventor's Dilemma", emoji: '⚙️',
    text: `Professor Elara had spent twenty years building a machine that could translate the language of animals. When she finally switched it on, the first voice she heard was her cat's: "You've been sitting on my favourite cushion for two decades." Elara laughed, but then the machine began picking up signals from the forest outside — thousands of voices, all speaking at once. She realised, with a mixture of wonder and dread, that she had not invented a translator. She had invented a receiver. The animals had been talking all along.`,
    questions: [
      { q: 'What had Professor Elara spent twenty years building?', answer: 'A machine to translate animal language', options: ['A machine to translate animal language', 'A time machine', 'A radio telescope', 'A robot cat'], hint: 'The purpose of the machine is stated in the first sentence.' },
      { q: 'What did Elara realise about her invention?', answer: 'It was a receiver, not a translator', options: ['It was a receiver, not a translator', 'It was broken', 'It could only hear cats', 'It was too loud'], hint: 'Contrast what she meant to build with what she says she invented.' },
      { q: 'What does "dread" most likely mean in this passage?', answer: 'A feeling of fear or worry', options: ['A feeling of fear or worry', 'Excitement', 'Boredom', 'Hunger'], hint: 'Use the nearby clue “wonder” and the unsettling flood of voices to infer the feeling.' },
    ],
  },
];

export default function ReadingQuestGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  return (
    <>
      <Helmet>
        <title>Reading Quest — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Go on a reading adventure! Comprehension questions and stories for children aged 8–13." />
        <link rel="canonical" href="https://sodafom.uk/games/reading-quest" />
        <meta property="og:title" content="Reading Quest — Sodafom" />
        <meta property="og:description" content="Go on a reading adventure! Comprehension questions and stories for children aged 8–13." />
        <meta property="og:url" content="https://sodafom.uk/games/reading-quest" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Reading Quest — Sodafom" />
        <meta name="twitter:description" content="Go on a reading adventure! Comprehension questions and stories for children aged 8–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/reading-quest#webpage","name":"Reading Quest — Sodafom","url":"https://sodafom.uk/games/reading-quest","description":"Go on a reading adventure! Comprehension questions and stories for children aged 8–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Reading Quest — Reading Game for Kids — Sodafom
      </h1>

      <GameShell title="Reading Quest" emoji="🗺️" subject="reading" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion} screenMode="scroll">
        {(onComplete) => <ReadingQuestPlay onComplete={onComplete} onQuestionChange={setCurrentQuestion} />}
      </GameShell>
    </>
  );
}

export function ReadingQuestPlay({ onComplete, onQuestionChange }: { onComplete: (r: GameResult) => void; onQuestionChange?: (q: string) => void }) {
  const { tier } = useChildAge();
  const { speak, stop, playing } = useVoice();
  const pool = READING_PASSAGES.filter(p => p.tier === tier);
  const activePool = pool.length > 0 ? pool : READING_PASSAGES.filter(p => p.tier === 2);
  // Shuffle each question's options once on mount so the correct answer isn't always first
  const [shuffledPassage] = useState(() => {
    const p = activePool[Math.floor(Math.random() * activePool.length)];
    return {
      ...p,
      questions: p.questions.map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) })),
    };
  });
  const [phase, setPhase] = useState<'read' | 'quiz'>('read');
  const [qIdx, setQIdx] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [hadWrongAttempt, setHadWrongAttempt] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [paused, setPaused] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const completionSent = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const passage = shuffledPassage;

  // Report current question to Archie
  useEffect(() => {
    if (phase === 'quiz' && passage.questions[qIdx]) {
      onQuestionChange?.(passage.questions[qIdx].q);
    } else if (phase === 'read') {
      onQuestionChange?.(`Read the passage: "${passage.title}" — then answer the comprehension questions.`);
    }
  }, [phase, qIdx, passage, onQuestionChange]);
  useEffect(() => () => {
    stop();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [stop]);
  const total = passage.questions.length;
  const passageCardId = 'reading-quest-passage';

  const goToQuiz = () => {
    stop();
    if (!quizStarted) {
      setQuizStarted(true);
      setQIdx(0);
      setChosen(null);
      setWrongChoice(null);
      setHadWrongAttempt(false);
      setShowHint(false);
      setFirstTryCorrect(0);
    }
    setPhase('quiz');
  };

  const answerQ = (opt: string) => {
    if (paused || chosen || opt === wrongChoice || completionSent.current) return;
    const isRight = opt === passage.questions.at(qIdx)?.answer;
    if (!isRight) {
      setWrongChoice(opt);
      setHadWrongAttempt(true);
      setShowHint(true);
      return;
    }

    setChosen(opt);
    const nextFirstTryCorrect = firstTryCorrect + (hadWrongAttempt ? 0 : 1);
    setFirstTryCorrect(nextFirstTryCorrect);
    timerRef.current = setTimeout(() => {
      const next = qIdx + 1;
      if (next >= total) {
        const score = Math.round((nextFirstTryCorrect / total) * 100);
        completionSent.current = true;
        onComplete({ score, correct: nextFirstTryCorrect, total, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 });
      } else {
        setQIdx(next);
        setChosen(null);
        setWrongChoice(null);
        setHadWrongAttempt(false);
        setShowHint(false);
      }
    }, 900);
  };

  // Progress fills to 100% once the last answer is chosen
  const answeredCount = chosen ? qIdx + 1 : qIdx;
  const progressPct = Math.round((answeredCount / total) * 100);

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 bg-gradient-to-b from-green-50 to-background max-w-2xl mx-auto w-full">
      <AnimatePresence mode="wait">
        {phase === 'read' && (
          <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{passage.emoji}</span>
              <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>{passage.title}</h2>
            </div>

            <div id={passageCardId} className="bg-card rounded-2xl p-6 border-2 border-border shadow-sm mb-4 leading-relaxed">
              <p className="text-foreground text-base">{passage.text}</p>
            </div>

            <div className="flex gap-3 mb-6">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                type="button"
                aria-controls={passageCardId}
                aria-pressed={playing}
                aria-label={playing ? 'Stop reading aloud' : 'Read passage aloud'}
                onClick={() => playing ? stop() : speak(`read:reading-quest:${passage.title}`, passage.text)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-primary/10 text-primary border border-primary/20">
                🔊 {playing ? 'Stop reading' : 'Read aloud'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={goToQuiz}
                className="flex-1 py-3 rounded-xl font-black bg-primary text-primary-foreground">
                {quizStarted ? 'Return to question 🎯' : 'Answer questions 🎯'}
              </motion.button>
            </div>

            <p className="text-xs text-muted-foreground text-center">Read the passage carefully — then answer {total} questions!</p>
          </motion.div>
        )}

        {phase === 'quiz' && (
          <motion.div key={`quiz-${qIdx}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full">
            <div className="w-full mb-6">
              <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
                <span>Question {qIdx + 1}/{total}</span>
                <span>⭐ {firstTryCorrect} first-try correct</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' as const }}
                />
              </div>
            </div>

            <div className="text-4xl mb-3 text-center">🗺️</div>
            <h2 data-reading-question className="text-xl font-black text-foreground mb-6 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
              {passage.questions.at(qIdx)?.q}
            </h2>

            <p className="mb-4 text-center text-sm font-bold text-muted-foreground">
              Choose an answer. If it is not right, use the clue and try this question again.
            </p>

            <div aria-label="Reading Quest answers" className="flex flex-col gap-3">
              {passage.questions.at(qIdx)?.options.map(opt => {
                const isCorrect = opt === passage.questions.at(qIdx)?.answer;
                const isWrong = opt === wrongChoice;
                let cls = 'bg-card border-border hover:border-primary/50';
                if (chosen) {
                  if (isCorrect) cls = 'bg-green-100 border-green-500 text-green-900';
                } else if (isWrong) {
                  cls = 'bg-amber-100 border-amber-500 text-amber-950';
                }
                return (
                  <motion.button
                    key={opt}
                    whileHover={!chosen ? { scale: 1.02 } : {}}
                    whileTap={!chosen ? { scale: 0.98 } : {}}
                    onClick={() => answerQ(opt)}
                    disabled={paused || !!chosen || isWrong}
                    aria-describedby={isWrong ? 'reading-quest-feedback' : undefined}
                    className={`min-h-12 py-3 px-4 rounded-2xl font-bold text-base border-2 transition-all text-left ${cls} disabled:cursor-default`}
                  >
                    {opt}
                    {chosen && isCorrect && ' ✅'}
                    {isWrong && ' — try again'}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setShowHint(true)} disabled={paused || !!chosen}
                aria-pressed={showHint}
                className="min-h-12 rounded-xl border-2 border-blue-300 bg-blue-50 px-3 py-2 font-black text-blue-950 disabled:opacity-60">
                Show reading clue
              </button>
              <button type="button" onClick={() => setPaused(value => !value)} disabled={!!chosen}
                className="min-h-12 rounded-xl border-2 border-blue-800 bg-blue-700 px-3 py-2 font-black text-white disabled:opacity-60">
                {paused ? 'Resume quest' : 'Pause quest'}
              </button>
            </div>

            {(wrongChoice || showHint) && !chosen && (
              <div id="reading-quest-feedback" role="status" aria-live="polite"
                className="mt-3 w-full rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center text-amber-950">
                <p className="font-black">{wrongChoice ? 'Good try. Keep this question and look for evidence.' : 'Reading clue'}</p>
                <p className="mt-1 text-sm font-bold">{passage.questions[qIdx].hint}</p>
              </div>
            )}

            {paused && (
              <div role="status" className="mt-3 w-full rounded-2xl border-2 border-blue-300 bg-blue-50 px-4 py-3 text-center text-blue-950">
                <p className="font-black">Paused. Your question is saved.</p>
                <p className="text-sm font-bold">Take a break and resume whenever you are ready.</p>
              </div>
            )}

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setPhase('read')} disabled={paused || !!chosen}
              className="mt-4 min-h-12 w-full py-2 rounded-xl text-sm font-bold text-muted-foreground border border-border bg-muted disabled:opacity-60">
              Re-read the passage
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
