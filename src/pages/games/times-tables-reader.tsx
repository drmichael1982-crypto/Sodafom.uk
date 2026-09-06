import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Volume2 } from 'lucide-react';
import GameShell, { type GameResult } from '@/components/games/GameShell';

// ── Times Tables Reader ───────────────────────────────────────────────────────
// Browse any times table 1–12, hear each fact read aloud, then test yourself.

// Each table gets a hue (0–360) — we derive colours via hsl() so no hex literals
const TABLE_HUES: Record<number, number> = {
  1: 0, 2: 25, 3: 50, 4: 140, 5: 210, 6: 270,
  7: 330, 8: 175, 9: 38, 10: 245, 11: 160, 12: 345,
};

const TABLE_EMOJIS: Record<number, string> = {
  1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣',
  5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣',
  9: '9️⃣', 10: '🔟', 11: '🔢', 12: '🌟',
};

function tableColour(t: number) { return `hsl(${Object.hasOwn(TABLE_HUES, t) ? TABLE_HUES[t as keyof typeof TABLE_HUES] : 0}, 70%, 48%)`; }
function tableBg(t: number)     { return `hsl(${Object.hasOwn(TABLE_HUES, t) ? TABLE_HUES[t as keyof typeof TABLE_HUES] : 0}, 70%, 96%)`; }
function tableBorder(t: number) { return `hsl(${Object.hasOwn(TABLE_HUES, t) ? TABLE_HUES[t as keyof typeof TABLE_HUES] : 0}, 70%, 60%)`; }
function tableEmoji(t: number)  { return Object.hasOwn(TABLE_EMOJIS, t) ? TABLE_EMOJIS[t as keyof typeof TABLE_EMOJIS] : '🔢'; }

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.8;
  utt.pitch = 1.05;
  window.speechSynthesis.speak(utt);
}

function speakFact(table: number, multiplier: number) {
  speak(`${table} times ${multiplier} equals ${table * multiplier}`);
}

function speakWholeTable(table: number) {
  const lines = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return `${table} times ${m} equals ${table * m}`;
  }).join('. ');
  speak(lines);
}

type Mode = 'browse' | 'test';

interface TestQuestion {
  table: number;
  multiplier: number;
  answer: number;
  options: number[];
}

function buildQuestion(table: number, usedMultipliers: Set<number>): TestQuestion | null {
  const available = Array.from({ length: 12 }, (_, i) => i + 1).filter(m => !usedMultipliers.has(m));
  if (available.length === 0) return null;
  const multiplier = available[Math.floor(Math.random() * available.length)];
  const answer = table * multiplier;
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const m = Math.floor(Math.random() * 12) + 1;
    const w = table * m;
    if (w !== answer) wrongs.add(w);
  }
  const options = [...wrongs, answer].sort(() => Math.random() - 0.5);
  return { table, multiplier, answer, options };
}

function TimesTablesInner({ onComplete }: { onComplete: (result: GameResult) => void }) {
  const [selectedTable, setSelectedTable] = useState(2);
  const [mode, setMode] = useState<Mode>('browse');
  const [highlightRow, setHighlightRow] = useState<number | null>(null);

  // Test state
  const [question, setQuestion] = useState<TestQuestion | null>(null);
  const [usedMultipliers, setUsedMultipliers] = useState<Set<number>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const TOTAL_Q = 12;

  const colour = tableColour(selectedTable);
  const bg = tableBg(selectedTable);
  const border = tableBorder(selectedTable);

  const startTest = useCallback(() => {
    const used = new Set<number>();
    setUsedMultipliers(used);
    setCorrectCount(0);
    setFeedback(null);
    setQuestion(buildQuestion(selectedTable, used));
    setMode('test');
  }, [selectedTable]);

  const handleAnswer = (chosen: number) => {
    if (!question || feedback) return;
    const isCorrect = chosen === question.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;

    setTimeout(() => {
      const newUsed = new Set(usedMultipliers).add(question.multiplier);
      if (newUsed.size >= TOTAL_Q) {
        const score = Math.round((newCorrect / TOTAL_Q) * 100);
        const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
        onComplete({ score, correct: newCorrect, total: TOTAL_Q, stars });
      } else {
        setUsedMultipliers(newUsed);
        setCorrectCount(newCorrect);
        setQuestion(buildQuestion(selectedTable, newUsed));
        setFeedback(null);
      }
    }, 900);
  };

  // ── Browse mode ───────────────────────────────────────────────────────────────
  if (mode === 'browse') {
    return (
      <div className="flex flex-col items-center gap-5 p-4 w-full max-w-md mx-auto">
        {/* Table selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(t => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.85 }}
              onClick={() => { setSelectedTable(t); setHighlightRow(null); }}
              className="w-10 h-10 rounded-xl font-black text-sm border-2 transition-all"
              style={
                t === selectedTable
                  ? { backgroundColor: tableColour(t), borderColor: tableBorder(t), color: 'hsl(var(--primary-foreground))' }
                  : { borderColor: 'hsl(var(--border))', backgroundColor: 'transparent' }
              }
            >
              {t}
            </motion.button>
          ))}
        </div>

        {/* Table header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tableEmoji(selectedTable)}</span>
          <h2 className="text-2xl font-black" style={{ color: colour }}>
            {selectedTable} Times Table
          </h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => speakWholeTable(selectedTable)}
            className="p-2 rounded-full border-2 border-border hover:border-primary transition-all"
            title="Read whole table aloud"
          >
            <Volume2 className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Table rows */}
        <div className="w-full flex flex-col gap-1">
          {Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const answer = selectedTable * m;
            const isHl = highlightRow === m;
            return (
              <motion.div
                key={m}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setHighlightRow(m); speakFact(selectedTable, m); }}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none"
                style={
                  isHl
                    ? { backgroundColor: bg, borderColor: border }
                    : { borderColor: 'hsl(var(--border))', backgroundColor: 'transparent' }
                }
              >
                <span className="text-lg font-bold text-muted-foreground w-6">{m}</span>
                <span className="text-lg font-black text-foreground flex-1 text-center">
                  {selectedTable} × {m}
                </span>
                <span className="text-xl font-black" style={{ color: colour }}>= {answer}</span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={e => { e.stopPropagation(); speakFact(selectedTable, m); }}
                  className="ml-3 p-1.5 rounded-full hover:bg-muted transition-all"
                  aria-label={`Read ${selectedTable} times ${m}`}
                >
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Test button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startTest}
          className="w-full py-3 rounded-2xl font-black text-lg shadow-lg hover:opacity-90 transition-all"
          style={{ backgroundColor: colour, color: 'hsl(var(--primary-foreground))' }}
        >
          🎯 Test the {selectedTable}× table!
        </motion.button>
      </div>
    );
  }

  // ── Test mode ─────────────────────────────────────────────────────────────────
  if (!question) return null;
  const progress = (usedMultipliers.size / TOTAL_Q) * 100;

  return (
    <div className="flex flex-col items-center gap-5 p-4 w-full max-w-sm mx-auto">
      {/* Progress */}
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colour }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{usedMultipliers.size} of {TOTAL_Q} questions</p>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${question.table}-${question.multiplier}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-muted-foreground font-bold">What is…</p>
          <div
            className="text-5xl font-black px-8 py-4 rounded-3xl"
            style={{ color: colour, backgroundColor: bg }}
          >
            {question.table} × {question.multiplier} = ?
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => speak(`What is ${question.table} times ${question.multiplier}?`)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Volume2 className="w-4 h-4" /> Hear the question
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {question.options.map(opt => {
          const isCorrectOpt = opt === question.answer;
          const feedbackClass =
            feedback === null
              ? 'border-border hover:border-primary bg-card'
              : isCorrectOpt
              ? 'bg-green-100 border-green-500 text-green-800'
              : 'bg-red-100 border-red-400 text-red-700 opacity-70';
          return (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              className={`py-4 rounded-2xl border-2 text-3xl font-black transition-all ${feedbackClass}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      {feedback && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}
        >
          {feedback === 'correct' ? '⭐ Correct!' : `❌ It was ${question.answer}!`}
        </motion.p>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => { setMode('browse'); setFeedback(null); }}
        className="text-sm text-muted-foreground underline"
      >
        Back to table
      </motion.button>
    </div>
  );
}

export default function TimesTablesReaderGame() {
  return (
    <>
      <Helmet>
        <title>Times Tables Reader — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Learn and practise all your times tables with this interactive reader for children aged 7–13." />
        <link rel="canonical" href="https://sodafom.uk/games/times-tables-reader" />
        <meta property="og:title" content="Times Tables Reader — Sodafom" />
        <meta property="og:description" content="Learn and practise all your times tables with this interactive reader for children aged 7–13." />
        <meta property="og:url" content="https://sodafom.uk/games/times-tables-reader" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Times Tables Reader — Sodafom" />
        <meta name="twitter:description" content="Learn and practise all your times tables with this interactive reader for children aged 7–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/times-tables-reader#webpage","name":"Times Tables Reader — Sodafom","url":"https://sodafom.uk/games/times-tables-reader","description":"Learn and practise all your times tables with this interactive reader for children aged 7–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Times Tables Reader — Maths Game for Kids — Sodafom
      </h1>
      <GameShell
        title="Times Tables Reader"
        emoji="📖"
        subject="maths"
        ageGroups={['5–7', '8–10', '11–13']}
      >
        {(onComplete) => <TimesTablesInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
