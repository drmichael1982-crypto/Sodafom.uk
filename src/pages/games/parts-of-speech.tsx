/**
 * /games/parts-of-speech — identify nouns, verbs, adjectives in sentences
 * Ages 8–13 · Spelling/Reading subject
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star, BookOpen } from 'lucide-react';

type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb';

interface PosQ {
  sentence: string;
  targetWord: string;
  targetPos: PartOfSpeech;
  question: string;
  explanation: string;
}

const QUESTIONS: PosQ[] = [
  { sentence: 'The dog barked loudly at the postman.', targetWord: 'dog', targetPos: 'noun', question: 'What part of speech is the word "dog"?', explanation: '"Dog" is a noun — it names a person, place, animal or thing.' },
  { sentence: 'She quickly ran across the muddy field.', targetWord: 'ran', targetPos: 'verb', question: 'What part of speech is the word "ran"?', explanation: '"Ran" is a verb — it describes an action.' },
  { sentence: 'The enormous elephant splashed in the river.', targetWord: 'enormous', targetPos: 'adjective', question: 'What part of speech is the word "enormous"?', explanation: '"Enormous" is an adjective — it describes the noun "elephant".' },
  { sentence: 'He carefully placed the fragile vase on the shelf.', targetWord: 'carefully', targetPos: 'adverb', question: 'What part of speech is the word "carefully"?', explanation: '"Carefully" is an adverb — it describes how he placed the vase.' },
  { sentence: 'The bright stars twinkled in the dark sky.', targetWord: 'bright', targetPos: 'adjective', question: 'What part of speech is the word "bright"?', explanation: '"Bright" is an adjective — it describes the noun "stars".' },
  { sentence: 'The children laughed happily at the funny clown.', targetWord: 'laughed', targetPos: 'verb', question: 'What part of speech is the word "laughed"?', explanation: '"Laughed" is a verb — it describes what the children did.' },
  { sentence: 'The old castle stood on top of the hill.', targetWord: 'castle', targetPos: 'noun', question: 'What part of speech is the word "castle"?', explanation: '"Castle" is a noun — it names a thing.' },
  { sentence: 'She whispered softly so as not to wake the baby.', targetWord: 'softly', targetPos: 'adverb', question: 'What part of speech is the word "softly"?', explanation: '"Softly" is an adverb — it tells us how she whispered.' },
  { sentence: 'The tiny kitten curled up on the warm blanket.', targetWord: 'tiny', targetPos: 'adjective', question: 'What part of speech is the word "tiny"?', explanation: '"Tiny" is an adjective — it describes the noun "kitten".' },
  { sentence: 'The teacher wrote the answer on the whiteboard.', targetWord: 'wrote', targetPos: 'verb', question: 'What part of speech is the word "wrote"?', explanation: '"Wrote" is a verb — it describes the action the teacher did.' },
  { sentence: 'The brave knight defeated the fearsome dragon.', targetWord: 'knight', targetPos: 'noun', question: 'What part of speech is the word "knight"?', explanation: '"Knight" is a noun — it names a person.' },
  { sentence: 'The rain fell heavily on the empty streets.', targetWord: 'heavily', targetPos: 'adverb', question: 'What part of speech is the word "heavily"?', explanation: '"Heavily" is an adverb — it describes how the rain fell.' },
  { sentence: 'The curious fox sniffed the strange object.', targetWord: 'curious', targetPos: 'adjective', question: 'What part of speech is the word "curious"?', explanation: '"Curious" is an adjective — it describes the noun "fox".' },
  { sentence: 'The children played noisily in the playground.', targetWord: 'playground', targetPos: 'noun', question: 'What part of speech is the word "playground"?', explanation: '"Playground" is a noun — it names a place.' },
  { sentence: 'She danced gracefully across the stage.', targetWord: 'danced', targetPos: 'verb', question: 'What part of speech is the word "danced"?', explanation: '"Danced" is a verb — it describes the action she performed.' },
];

const POS_CHOICES: PartOfSpeech[] = ['noun', 'verb', 'adjective', 'adverb'];

const POS_META: Record<PartOfSpeech, { label: string; emoji: string; colour: string; bg: string; hint: string }> = {
  noun:      { label: 'Noun',      emoji: '🏷️', colour: 'text-blue-700',   bg: 'bg-blue-100 border-blue-400',   hint: 'A person, place, animal or thing' },
  verb:      { label: 'Verb',      emoji: '⚡',  colour: 'text-red-700',    bg: 'bg-red-100 border-red-400',     hint: 'An action or doing word' },
  adjective: { label: 'Adjective', emoji: '🎨', colour: 'text-purple-700', bg: 'bg-purple-100 border-purple-400', hint: 'Describes a noun' },
  adverb:    { label: 'Adverb',    emoji: '💨', colour: 'text-green-700',  bg: 'bg-green-100 border-green-400',  hint: 'Describes a verb, adjective or other adverb' },
};

const TOTAL = 10;

function HighlightedSentence({ sentence, targetWord }: { sentence: string; targetWord: string }) {
  const parts = sentence.split(new RegExp(`(\\b${targetWord}\\b)`, 'i'));
  return (
    <p className="text-lg font-bold text-foreground text-center leading-relaxed">
      {parts.map((part, i) =>
        part.toLowerCase() === targetWord.toLowerCase()
          ? <span key={i} className="bg-accent text-accent-foreground font-black px-1.5 py-0.5 rounded-lg mx-0.5">{part}</span>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}

function PartsOfSpeechInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<PosQ[]>(() =>
    [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL)
  );
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<PartOfSpeech | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);

  const q = questions[qIdx];

  const handleAnswer = useCallback((choice: PartOfSpeech) => {
    if (selected !== null) return;
    setSelected(choice);
    const isRight = choice === q.targetPos;
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
    }, 1900);
  }, [selected, q.targetPos, score, correct, qIdx, onComplete]);

  const progress = (qIdx / TOTAL) * 100;
  const phase = selected === null ? 'answering' : selected === q.targetPos ? 'correct' : 'wrong';

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto px-4 py-6">
      {/* Progress */}
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
          {/* Header */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-6 py-4 flex items-center gap-3">
            <BookOpen size={20} className="text-white shrink-0" />
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Parts of Speech</p>
              <p className="text-white font-black text-sm">Identify the word type</p>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Sentence */}
            <div className="bg-muted/40 rounded-2xl px-5 py-4">
              <HighlightedSentence sentence={q.sentence} targetWord={q.targetWord} />
            </div>

            {/* Question */}
            <p className="text-sm font-black text-foreground text-center" style={{ fontFamily: 'var(--font-heading)' }}>
              {q.question}
            </p>

            {/* Hint strip */}
            <div className="grid grid-cols-2 gap-1.5">
              {POS_CHOICES.map(pos => {
                const meta = POS_META[pos];
                return (
                  <div key={pos} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/40">
                    <span className="text-sm">{meta.emoji}</span>
                    <div>
                      <p className="text-xs font-black text-foreground leading-none">{meta.label}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{meta.hint}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-3">
              {POS_CHOICES.map((pos) => {
                const meta = POS_META[pos];
                let style = `bg-background border-border hover:border-primary hover:bg-primary/5 ${meta.colour}`;
                if (selected !== null) {
                  if (pos === q.targetPos) style = `${meta.bg} ${meta.colour}`;
                  else if (pos === selected) style = 'bg-red-100 border-red-400 text-red-800';
                  else style = 'bg-muted border-border text-muted-foreground';
                }
                return (
                  <motion.button
                    key={pos}
                    whileHover={selected === null ? { scale: 1.04 } : {}}
                    whileTap={selected === null ? { scale: 0.96 } : {}}
                    onClick={() => handleAnswer(pos)}
                    disabled={selected !== null}
                    className={`py-3.5 px-3 rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center gap-2 ${style}`}
                  >
                    <span className="text-lg">{meta.emoji}</span>
                    {meta.label}
                    {selected !== null && pos === q.targetPos && <CheckCircle2 size={14} className="text-green-600" />}
                    {selected !== null && pos === selected && pos !== q.targetPos && <XCircle size={14} className="text-red-500" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`flex items-start gap-2 rounded-2xl px-4 py-3 ${phase === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                >
                  {phase === 'correct'
                    ? <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
                  <p className={`font-bold text-sm ${phase === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {phase === 'correct' ? '✓ Correct! ' : `"${q.targetWord}" is a ${q.targetPos}. `}{q.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function PartsOfSpeechGame() {
  return (
    <>
      <Helmet>
        <title>Parts of Speech — Sodafom | Spelling Games for Kids</title>
        <meta name="description" content="Identify nouns, verbs, adjectives and adverbs in sentences! A fun grammar game for children aged 8–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/parts-of-speech" />
        <meta property="og:title" content="Parts of Speech — Sodafom" />
        <meta property="og:description" content="Identify nouns, verbs, adjectives and adverbs in sentences!" />
        <meta property="og:url" content="https://sodafom.uk/games/parts-of-speech" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/parts-of-speech#webpage',
          name: 'Parts of Speech — Sodafom', url: 'https://sodafom.uk/games/parts-of-speech',
          description: 'Identify nouns, verbs, adjectives and adverbs. Grammar game for children aged 8–13.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">Parts of Speech — Grammar Game for Kids — Sodafom</h1>
      <GameShell title="Parts of Speech" emoji="📚" subject="spelling" ageGroups={['8–10', '11–13']}>
        {(onComplete) => <PartsOfSpeechInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
