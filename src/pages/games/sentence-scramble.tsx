/**
 * /games/sentence-scramble — Drag words into the correct sentence order
 * Ages 5–13 · Reading subject
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, RotateCcw, Star, Lightbulb } from 'lucide-react';

// ── Sentence bank ─────────────────────────────────────────────────────────────
const SENTENCES_EASY = [
  { words: ['The', 'cat', 'sat', 'on', 'the', 'mat.'], hint: 'A cat is resting somewhere.' },
  { words: ['I', 'like', 'to', 'eat', 'apples.'], hint: 'Someone enjoys a fruit.' },
  { words: ['The', 'dog', 'ran', 'fast.'], hint: 'An animal is moving quickly.' },
  { words: ['She', 'has', 'a', 'red', 'ball.'], hint: 'Someone owns a colourful toy.' },
  { words: ['We', 'play', 'in', 'the', 'park.'], hint: 'Children enjoy an outdoor space.' },
  { words: ['He', 'can', 'jump', 'very', 'high.'], hint: 'Someone is good at leaping.' },
  { words: ['The', 'sun', 'is', 'bright', 'today.'], hint: 'The weather is sunny.' },
  { words: ['My', 'mum', 'bakes', 'yummy', 'cakes.'], hint: 'A parent is cooking something sweet.' },
];

const SENTENCES_MEDIUM = [
  { words: ['The', 'children', 'played', 'happily', 'in', 'the', 'garden.'], hint: 'Kids are having fun outside.' },
  { words: ['She', 'read', 'a', 'long', 'book', 'about', 'dinosaurs.'], hint: 'Someone is learning about prehistoric creatures.' },
  { words: ['Every', 'morning', 'he', 'eats', 'toast', 'for', 'breakfast.'], hint: 'A daily routine involving food.' },
  { words: ['The', 'teacher', 'wrote', 'the', 'answer', 'on', 'the', 'board.'], hint: 'A lesson is happening in school.' },
  { words: ['We', 'went', 'to', 'the', 'beach', 'on', 'a', 'sunny', 'day.'], hint: 'A trip to the seaside.' },
  { words: ['The', 'little', 'bird', 'sang', 'a', 'beautiful', 'song.'], hint: 'An animal is making music.' },
];

const SENTENCES_HARD = [
  { words: ['Despite', 'the', 'rain,', 'they', 'decided', 'to', 'go', 'for', 'a', 'walk.'], hint: 'The weather did not stop them.' },
  { words: ['The', 'scientist', 'discovered', 'a', 'new', 'species', 'of', 'butterfly.'], hint: 'A researcher found something in nature.' },
  { words: ['After', 'finishing', 'her', 'homework,', 'she', 'watched', 'television.'], hint: 'Work before play.' },
  { words: ['The', 'ancient', 'castle', 'stood', 'on', 'top', 'of', 'a', 'steep', 'hill.'], hint: 'A historic building in a high place.' },
  { words: ['Without', 'water,', 'plants', 'cannot', 'survive', 'for', 'long.'], hint: 'Something plants need to live.' },
  { words: ['The', 'astronaut', 'floated', 'weightlessly', 'inside', 'the', 'space', 'station.'], hint: 'Life in zero gravity.' },
];

type SentenceEntry = { words: string[]; hint: string };

// ── Word chip ─────────────────────────────────────────────────────────────────
function WordChip({
  word, placed, onClick, phase,
}: {
  word: string; placed: boolean; onClick: () => void; phase: 'answering' | 'correct' | 'wrong';
}) {
  return (
    <motion.button
      whileHover={!placed && phase === 'answering' ? { scale: 1.06, y: -2 } : {}}
      whileTap={!placed && phase === 'answering' ? { scale: 0.94 } : {}}
      onClick={!placed && phase === 'answering' ? onClick : undefined}
      className={`px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all select-none
        ${placed
          ? 'bg-muted border-border text-muted-foreground/30 cursor-default'
          : phase === 'answering'
          ? 'bg-card border-primary/40 text-foreground shadow-sm hover:border-primary cursor-pointer'
          : 'bg-muted border-border text-muted-foreground cursor-default'
        }`}
    >
      {placed ? '' : word}
    </motion.button>
  );
}

// ── Answer slot ───────────────────────────────────────────────────────────────
function AnswerWord({
  word, phase, onClick,
}: {
  word: string | null; phase: 'answering' | 'correct' | 'wrong'; onClick: () => void;
}) {
  const filled = word !== null;
  const base = filled
    ? phase === 'correct' ? 'bg-green-100 border-green-500 text-green-800'
    : phase === 'wrong'   ? 'bg-red-100 border-red-400 text-red-800'
    : 'bg-primary/10 border-primary text-foreground cursor-pointer hover:opacity-80'
    : 'border-dashed border-muted-foreground/40 bg-muted/30 text-transparent';

  return (
    <motion.button
      initial={filled ? { scale: 0.8, opacity: 0 } : {}}
      animate={{ scale: 1, opacity: 1 }}
      onClick={filled && phase === 'answering' ? onClick : undefined}
      className={`px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all min-w-[40px] ${base}`}
    >
      {word ?? '—'}
    </motion.button>
  );
}

// ── Game inner ────────────────────────────────────────────────────────────────
function SentenceScrambleInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const allSentences: SentenceEntry[] = [...SENTENCES_EASY, ...SENTENCES_MEDIUM, ...SENTENCES_HARD];
  const TOTAL = 10;

  const [sentences] = useState<SentenceEntry[]>(() =>
    [...allSentences].sort(() => Math.random() - 0.5).slice(0, TOTAL)
  );
  const [qIdx, setQIdx] = useState(0);
  const [shuffled, setShuffled] = useState<string[]>(() =>
    [...sentences[0].words].sort(() => Math.random() - 0.5)
  );
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [answer, setAnswer] = useState<(string | null)[]>([]);
  const [answerSrc, setAnswerSrc] = useState<(number | null)[]>([]);
  const [phase, setPhase] = useState<'answering' | 'correct' | 'wrong'>('answering');
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const entry = sentences[qIdx];

  const resetQuestion = useCallback((idx: number) => {
    const s = [...sentences[idx].words].sort(() => Math.random() - 0.5);
    setShuffled(s);
    setUsedIndices([]);
    setAnswer(Array(sentences[idx].words.length).fill(null));
    setAnswerSrc(Array(sentences[idx].words.length).fill(null));
    setPhase('answering');
    setShowHint(false);
  }, [sentences]);

  const placeWord = useCallback((srcIdx: number) => {
    if (phase !== 'answering' || usedIndices.includes(srcIdx)) return;
    const firstEmpty = answer.findIndex(a => a === null);
    if (firstEmpty === -1) return;
    const newAnswer = [...answer];
    const newSrc = [...answerSrc];
    newAnswer[firstEmpty] = shuffled[srcIdx];
    newSrc[firstEmpty] = srcIdx;
    setAnswer(newAnswer);
    setAnswerSrc(newSrc);
    setUsedIndices(prev => [...prev, srcIdx]);

    if (newAnswer.every(a => a !== null)) {
      const sentence = newAnswer.join(' ');
      const isCorrect = sentence === entry.words.join(' ');
      if (isCorrect) {
        setScore(s => s + (showHint ? 5 : 10));
        setCorrect(c => c + 1);
        setPhase('correct');
      } else {
        setPhase('wrong');
      }
      setTimeout(() => {
        const next = qIdx + 1;
        if (next >= TOTAL) {
          const finalScore = isCorrect ? score + (showHint ? 5 : 10) : score;
          const finalCorrect = isCorrect ? correct + 1 : correct;
          const stars = finalCorrect >= TOTAL * 0.9 ? 3 : finalCorrect >= TOTAL * 0.6 ? 2 : finalCorrect >= TOTAL * 0.3 ? 1 : 0;
          onComplete({ score: finalScore, correct: finalCorrect, total: TOTAL, stars, maxScore: TOTAL * 10, durationSeconds: 0 });
        } else {
          setQIdx(next);
          resetQuestion(next);
        }
      }, isCorrect ? 1200 : 1800);
    }
  }, [phase, usedIndices, answer, answerSrc, shuffled, entry.words, showHint, qIdx, score, correct, onComplete, resetQuestion]);

  const removeWord = useCallback((slotIdx: number) => {
    if (phase !== 'answering') return;
    const src = answerSrc[slotIdx];
    if (src === null) return;
    const newAnswer = [...answer];
    const newSrc = [...answerSrc];
    newAnswer[slotIdx] = null;
    newSrc[slotIdx] = null;
    setAnswer(newAnswer);
    setAnswerSrc(newSrc);
    setUsedIndices(prev => prev.filter(i => i !== src));
  }, [phase, answer, answerSrc]);

  const clearAll = useCallback(() => {
    setAnswer(Array(entry.words.length).fill(null));
    setAnswerSrc(Array(entry.words.length).fill(null));
    setUsedIndices([]);
  }, [entry.words.length]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto px-4 py-6">
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(qIdx / TOTAL) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
        <span className="text-xs font-black text-muted-foreground">{qIdx + 1}/{TOTAL}</span>
        <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2.5 py-1">
          <Star size={13} className="text-accent fill-accent" />
          <span className="text-xs font-black text-foreground">{score}</span>
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-card rounded-3xl border-2 border-border shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="hero-bg px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Sentence Scramble</p>
              <h2 className="text-white font-black text-lg">Put the words in order!</h2>
            </div>
            <div className="flex gap-2">
              {!showHint && phase === 'answering' && (
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHint(true)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  aria-label="Show hint"
                >
                  <Lightbulb size={16} className="text-white" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="px-5 py-5 flex flex-col items-center gap-5">
            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="w-full flex items-start gap-2 bg-accent/15 border border-accent/30 rounded-xl px-3 py-2.5"
                >
                  <Lightbulb size={14} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-foreground">{entry.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer area */}
            <div className="w-full">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wide text-center mb-3">Your sentence</p>
              <div className="flex flex-wrap gap-2 justify-center min-h-[44px] p-3 rounded-2xl border-2 border-dashed border-border bg-muted/20">
                {answer.map((word, i) => (
                  <AnswerWord key={i} word={word} phase={phase} onClick={() => removeWord(i)} />
                ))}
              </div>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {phase !== 'answering' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className={`w-full flex items-start gap-2 rounded-2xl px-4 py-3 ${
                    phase === 'correct' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                  }`}
                >
                  {phase === 'correct'
                    ? <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  }
                  <p className={`font-black text-sm ${phase === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {phase === 'correct'
                      ? `🎉 Correct! ${showHint ? '+5' : '+10'} points`
                      : `The correct order was: "${entry.words.join(' ')}"`
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Word bank */}
            <div className="w-full">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wide text-center mb-3">Word bank</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {shuffled.map((word, i) => (
                  <WordChip
                    key={i}
                    word={word}
                    placed={usedIndices.includes(i)}
                    onClick={() => placeWord(i)}
                    phase={phase}
                  />
                ))}
              </div>
            </div>

            {/* Clear button */}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={clearAll}
              disabled={phase !== 'answering' || answer.every(a => a === null)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted text-muted-foreground font-bold text-sm border border-border disabled:opacity-40"
            >
              <RotateCcw size={13} /> Clear
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function SentenceScrambleGame() {
  return (
    <>
      <Helmet>
        <title>Sentence Scramble — Sodafom | Reading Games for Kids</title>
        <meta name="description" content="Put the jumbled words back in the right order to make a sentence! A fun reading and grammar game for children aged 5–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/sentence-scramble" />
        <meta property="og:title" content="Sentence Scramble — Sodafom" />
        <meta property="og:description" content="Put the jumbled words back in the right order to make a sentence!" />
        <meta property="og:url" content="https://sodafom.uk/games/sentence-scramble" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/sentence-scramble#webpage',
          name: 'Sentence Scramble — Sodafom',
          url: 'https://sodafom.uk/games/sentence-scramble',
          description: 'Put the jumbled words back in the right order to make a sentence! Reading game for children aged 5–13.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Sentence Scramble — Reading Game for Kids — Sodafom</h1>
      <GameShell title="Sentence Scramble" emoji="📝" subject="reading" ageGroups={['5–7', '8–10', '11–13']}>
        {(onComplete) => <SentenceScrambleInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
