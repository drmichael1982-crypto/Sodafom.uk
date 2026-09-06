/**
 * /games/synonyms-antonyms — match words with same/opposite meanings (spelling/reading, ages 8–13)
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star, BookOpen } from 'lucide-react';

interface WordQ {
  word: string;
  type: 'synonym' | 'antonym';
  choices: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QUESTIONS: WordQ[] = [
  // Easy synonyms
  { word: 'happy', type: 'synonym', choices: ['joyful', 'sad', 'angry', 'tired'], answer: 'joyful', explanation: '"Happy" and "joyful" both mean feeling very pleased and content.', difficulty: 'easy' },
  { word: 'big', type: 'synonym', choices: ['large', 'tiny', 'short', 'thin'], answer: 'large', explanation: '"Big" and "large" both describe something of great size.', difficulty: 'easy' },
  { word: 'fast', type: 'synonym', choices: ['quick', 'slow', 'heavy', 'quiet'], answer: 'quick', explanation: '"Fast" and "quick" both mean moving at great speed.', difficulty: 'easy' },
  // Easy antonyms
  { word: 'hot', type: 'antonym', choices: ['cold', 'warm', 'boiling', 'sunny'], answer: 'cold', explanation: '"Hot" and "cold" are opposites — one is high temperature, the other is low.', difficulty: 'easy' },
  { word: 'day', type: 'antonym', choices: ['night', 'morning', 'afternoon', 'dusk'], answer: 'night', explanation: '"Day" and "night" are opposites — one is when the sun is up, the other when it\'s down.', difficulty: 'easy' },
  // Medium synonyms
  { word: 'brave', type: 'synonym', choices: ['courageous', 'frightened', 'weak', 'lazy'], answer: 'courageous', explanation: '"Brave" and "courageous" both mean showing great courage in the face of danger.', difficulty: 'medium' },
  { word: 'angry', type: 'synonym', choices: ['furious', 'calm', 'gentle', 'pleased'], answer: 'furious', explanation: '"Angry" and "furious" both describe a feeling of strong displeasure.', difficulty: 'medium' },
  { word: 'begin', type: 'synonym', choices: ['commence', 'finish', 'stop', 'end'], answer: 'commence', explanation: '"Begin" and "commence" both mean to start something.', difficulty: 'medium' },
  // Medium antonyms
  { word: 'ancient', type: 'antonym', choices: ['modern', 'old', 'historic', 'aged'], answer: 'modern', explanation: '"Ancient" means very old, while "modern" means new or current.', difficulty: 'medium' },
  { word: 'generous', type: 'antonym', choices: ['selfish', 'kind', 'giving', 'helpful'], answer: 'selfish', explanation: '"Generous" means giving freely; "selfish" means only thinking of yourself.', difficulty: 'medium' },
  // Hard synonyms
  { word: 'peculiar', type: 'synonym', choices: ['bizarre', 'normal', 'ordinary', 'typical'], answer: 'bizarre', explanation: '"Peculiar" and "bizarre" both mean strange or unusual.', difficulty: 'hard' },
  { word: 'exhausted', type: 'synonym', choices: ['weary', 'energetic', 'lively', 'refreshed'], answer: 'weary', explanation: '"Exhausted" and "weary" both mean extremely tired.', difficulty: 'hard' },
  { word: 'tranquil', type: 'synonym', choices: ['serene', 'noisy', 'chaotic', 'turbulent'], answer: 'serene', explanation: '"Tranquil" and "serene" both mean calm and peaceful.', difficulty: 'hard' },
  // Hard antonyms
  { word: 'transparent', type: 'antonym', choices: ['opaque', 'clear', 'see-through', 'glassy'], answer: 'opaque', explanation: '"Transparent" means you can see through it; "opaque" means you cannot.', difficulty: 'hard' },
  { word: 'abundant', type: 'antonym', choices: ['scarce', 'plentiful', 'ample', 'plenty'], answer: 'scarce', explanation: '"Abundant" means there is a lot; "scarce" means there is very little.', difficulty: 'hard' },
];

const TOTAL = 10;

function SynonymsAntonymsInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<WordQ[]>(() => {
    const easy = QUESTIONS.filter(q => q.difficulty === 'easy').sort(() => Math.random() - 0.5).slice(0, 3);
    const medium = QUESTIONS.filter(q => q.difficulty === 'medium').sort(() => Math.random() - 0.5).slice(0, 4);
    const hard = QUESTIONS.filter(q => q.difficulty === 'hard').sort(() => Math.random() - 0.5).slice(0, 3);
    return [...easy, ...medium, ...hard];
  });
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);

  const q = questions[qIdx];

  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
    const isRight = choice === q.answer;
    const newScore = isRight ? score + 10 : score;
    const newCorrect = isRight ? correct + 1 : correct;
    if (isRight) { setScore(newScore); setCorrect(newCorrect); }

    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= TOTAL) {
        const stars = newCorrect >= 9 ? 3 : newCorrect >= 6 ? 2 : newCorrect >= 3 ? 1 : 0;
        onComplete({ score: newScore, correct: newCorrect, total: TOTAL, stars, maxScore: TOTAL * 10, durationSeconds: 0 });
      } else {
        setQIdx(next);
        setSelected(null);
      }
    }, 2000);
  }, [selected, q.answer, score, correct, qIdx, onComplete]);

  const progress = (qIdx / TOTAL) * 100;
  const phase = selected === null ? 'answering' : selected === q.answer ? 'correct' : 'wrong';
  const isSynonym = q.type === 'synonym';
  const typeColour = isSynonym ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700';
  const typeLabel = isSynonym ? '🔗 Synonym' : '↔️ Antonym';
  const prompt = isSynonym
    ? `Which word means the SAME as "${q.word}"?`
    : `Which word means the OPPOSITE of "${q.word}"?`;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto px-4 py-6">
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
        <span className="text-xs font-black text-muted-foreground">{qIdx + 1}/{TOTAL}</span>
        <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2.5 py-1">
          <Star size={13} className="text-accent fill-accent" />
          <span className="text-xs font-black text-foreground">{score}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full bg-card rounded-3xl border-2 border-border shadow-lg overflow-hidden"
        >
          <div className={`px-6 py-4 flex items-center gap-3 ${isSynonym ? 'bg-gradient-to-br from-purple-500 to-violet-600' : 'bg-gradient-to-br from-orange-500 to-amber-600'}`}>
            <BookOpen size={20} className="text-white shrink-0" />
            <div className="flex-1">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Synonyms &amp; Antonyms</p>
              <p className="text-white font-black text-sm">{isSynonym ? 'Same meaning' : 'Opposite meaning'}</p>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${typeColour}`}>{typeLabel}</span>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Word spotlight */}
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                className={`inline-block px-8 py-4 rounded-2xl mb-3 ${isSynonym ? 'bg-purple-50 border-2 border-purple-200' : 'bg-orange-50 border-2 border-orange-200'}`}
              >
                <p className={`text-4xl font-black ${isSynonym ? 'text-purple-700' : 'text-orange-700'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  {q.word}
                </p>
              </motion.div>
              <p className="text-sm font-bold text-foreground">{prompt}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {q.choices.map((c) => {
                let style = 'bg-background border-border hover:border-primary hover:bg-primary/5 text-foreground';
                if (selected !== null) {
                  if (c === q.answer) style = 'bg-green-100 border-green-500 text-green-800';
                  else if (c === selected) style = 'bg-red-100 border-red-400 text-red-800';
                  else style = 'bg-muted border-border text-muted-foreground';
                }
                return (
                  <motion.button
                    key={c}
                    whileHover={selected === null ? { scale: 1.04 } : {}}
                    whileTap={selected === null ? { scale: 0.96 } : {}}
                    onClick={() => handleAnswer(c)}
                    disabled={selected !== null}
                    className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${style}`}
                  >
                    {selected !== null && c === q.answer && <CheckCircle2 size={14} className="text-green-600 shrink-0" />}
                    {selected !== null && c === selected && c !== q.answer && <XCircle size={14} className="text-red-500 shrink-0" />}
                    {c}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`flex items-start gap-2 rounded-2xl px-4 py-3 ${phase === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}
                >
                  <span className="text-lg shrink-0">📖</span>
                  <div>
                    <p className={`font-black text-sm mb-0.5 ${phase === 'correct' ? 'text-green-800' : 'text-blue-800'}`}>
                      {phase === 'correct' ? `✓ Correct! "${q.answer}" is the ${q.type}.` : `The ${q.type} is "${q.answer}".`}
                    </p>
                    <p className="text-xs text-muted-foreground font-bold">{q.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SynonymsAntonymsGame() {
  return (
    <>
      <Helmet>
        <title>Synonyms &amp; Antonyms — Sodafom | Spelling Games for Kids</title>
        <meta name="description" content="Match words with the same or opposite meanings! A fun vocabulary game for children aged 8–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/synonyms-antonyms" />
        <meta property="og:title" content="Synonyms & Antonyms — Sodafom" />
        <meta property="og:description" content="Match words with the same or opposite meanings!" />
        <meta property="og:url" content="https://sodafom.uk/games/synonyms-antonyms" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/synonyms-antonyms#webpage',
          name: 'Synonyms & Antonyms — Sodafom', url: 'https://sodafom.uk/games/synonyms-antonyms',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Synonyms and Antonyms — Spelling Game for Kids — Sodafom</h1>
      <GameShell title="Synonyms and Antonyms" emoji="🔗" subject="spelling" ageGroups={['8–10', '11–13']}>
        {(onComplete) => <SynonymsAntonymsInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
