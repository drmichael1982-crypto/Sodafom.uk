/**
 * /games/geography-uk — UK countries, capitals, flags and landmarks (ages 8–13)
 */
import { useState, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import { CheckCircle2, XCircle, Star, Globe } from 'lucide-react';

interface GeoQ {
  question: string;
  emoji: string;
  choices: string[];
  answer: string;
  funFact: string;
  category: 'capital' | 'flag' | 'landmark' | 'fact';
}

const QUESTIONS: GeoQ[] = [
  { question: 'What is the capital city of England?', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', choices: ['London', 'Manchester', 'Birmingham', 'Leeds'], answer: 'London', funFact: 'London has been the capital of England for over 1,000 years!', category: 'capital' },
  { question: 'What is the capital city of Scotland?', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', choices: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'], answer: 'Edinburgh', funFact: 'Edinburgh Castle sits on an ancient volcano that last erupted 350 million years ago!', category: 'capital' },
  { question: 'What is the capital city of Wales?', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', choices: ['Cardiff', 'Swansea', 'Newport', 'Bangor'], answer: 'Cardiff', funFact: 'Cardiff became the official capital of Wales in 1955 — the youngest capital in the UK!', category: 'capital' },
  { question: 'What is the capital city of Northern Ireland?', emoji: '🇬🇧', choices: ['Belfast', 'Derry', 'Armagh', 'Newry'], answer: 'Belfast', funFact: 'The famous Titanic ship was built in Belfast\'s shipyards in 1912!', category: 'capital' },
  { question: 'Which famous clock tower is in London?', emoji: '🕰️', choices: ['Big Ben', 'Eiffel Tower', 'Blackpool Tower', 'Canary Wharf'], answer: 'Big Ben', funFact: 'Big Ben is actually the name of the bell inside the tower — the tower itself is called Elizabeth Tower!', category: 'landmark' },
  { question: 'What is the longest river in the UK?', emoji: '🌊', choices: ['River Severn', 'River Thames', 'River Trent', 'River Clyde'], answer: 'River Severn', funFact: 'The River Severn is 354 km long and flows through England and Wales!', category: 'fact' },
  { question: 'Which mountain is the highest in the UK?', emoji: '⛰️', choices: ['Ben Nevis', 'Snowdon', 'Scafell Pike', 'Cairn Gorm'], answer: 'Ben Nevis', funFact: 'Ben Nevis in Scotland is 1,345 metres tall — about 4,413 feet!', category: 'fact' },
  { question: 'How many countries make up the United Kingdom?', emoji: '🗺️', choices: ['4', '3', '5', '2'], answer: '4', funFact: 'England, Scotland, Wales and Northern Ireland make up the United Kingdom!', category: 'fact' },
  { question: 'Which famous prehistoric monument is in Wiltshire, England?', emoji: '🪨', choices: ['Stonehenge', 'Hadrian\'s Wall', 'Avebury', 'Maiden Castle'], answer: 'Stonehenge', funFact: 'Stonehenge was built around 3000 BC — that\'s over 5,000 years ago!', category: 'landmark' },
  { question: 'What is the largest lake in the UK?', emoji: '🏞️', choices: ['Loch Lomond', 'Loch Ness', 'Lake Windermere', 'Loch Tay'], answer: 'Loch Lomond', funFact: 'Loch Lomond in Scotland covers 71 square kilometres — bigger than any lake in England!', category: 'fact' },
  { question: 'Which city is home to the famous Clifton Suspension Bridge?', emoji: '🌉', choices: ['Bristol', 'Bath', 'Exeter', 'Plymouth'], answer: 'Bristol', funFact: 'The Clifton Suspension Bridge was designed by Isambard Kingdom Brunel and opened in 1864!', category: 'landmark' },
  { question: 'What colour is the cross on the Scottish flag (Saltire)?', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', choices: ['White', 'Red', 'Gold', 'Blue'], answer: 'White', funFact: 'The Scottish Saltire is one of the oldest national flags in the world, dating back to the 9th century!', category: 'flag' },
  { question: 'Which English city is famous for its Beatles history?', emoji: '🎸', choices: ['Liverpool', 'Manchester', 'Leeds', 'Sheffield'], answer: 'Liverpool', funFact: 'The Beatles formed in Liverpool in 1960 and became the best-selling music artists of all time!', category: 'fact' },
  { question: 'What animal appears on the Welsh flag?', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', choices: ['Dragon', 'Lion', 'Eagle', 'Unicorn'], answer: 'Dragon', funFact: 'The red dragon on the Welsh flag is one of the oldest national symbols in the world!', category: 'flag' },
  { question: 'Which UK city hosted the 2012 Olympic Games?', emoji: '🏅', choices: ['London', 'Manchester', 'Birmingham', 'Glasgow'], answer: 'London', funFact: 'London is the only city to have hosted the Summer Olympics three times: 1908, 1948 and 2012!', category: 'fact' },
];

const CAT_META: Record<string, { label: string; colour: string }> = {
  capital:  { label: 'Capital city', colour: 'bg-blue-100 text-blue-700' },
  flag:     { label: 'Flag',         colour: 'bg-red-100 text-red-700' },
  landmark: { label: 'Landmark',     colour: 'bg-green-100 text-green-700' },
  fact:     { label: 'UK fact',      colour: 'bg-purple-100 text-purple-700' },
};

const TOTAL = 10;

function GeographyUKInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [questions] = useState<GeoQ[]>(() =>
    [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL)
  );
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
  const catMeta = CAT_META[q.category];

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
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-4 flex items-center gap-3">
            <Globe size={20} className="text-white shrink-0" />
            <div className="flex-1">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wide">UK Geography</p>
              <p className="text-white font-black text-sm">Countries, capitals &amp; landmarks</p>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${catMeta.colour}`}>{catMeta.label}</span>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                className="text-6xl mb-3"
              >
                {q.emoji}
              </motion.div>
              <p className="text-base font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {q.question}
              </p>
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
                    className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 text-center ${style}`}
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
                  <span className="text-lg shrink-0">🗺️</span>
                  <div>
                    <p className={`font-black text-sm mb-0.5 ${phase === 'correct' ? 'text-green-800' : 'text-blue-800'}`}>
                      {phase === 'correct' ? `✓ Correct! ${q.answer}.` : `The answer is ${q.answer}.`}
                    </p>
                    <p className="text-xs text-muted-foreground font-bold">Did you know? {q.funFact}</p>
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

export default function GeographyUKGame() {
  return (
    <>
      <Helmet>
        <title>UK Geography — Sodafom | Science Games for Kids</title>
        <meta name="description" content="Learn about UK countries, capitals, flags and landmarks! A fun geography game for children aged 8–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/geography-uk" />
        <meta property="og:title" content="UK Geography — Sodafom" />
        <meta property="og:description" content="Learn about UK countries, capitals, flags and landmarks!" />
        <meta property="og:url" content="https://sodafom.uk/games/geography-uk" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          '@id': 'https://sodafom.uk/games/geography-uk#webpage',
          name: 'UK Geography — Sodafom', url: 'https://sodafom.uk/games/geography-uk',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>
      <h1 className="sr-only">UK Geography — Science Game for Kids — Sodafom</h1>
      <GameShell title="UK Geography" emoji="🗺️" subject="science" ageGroups={['8–10', '11–13']}>
        {(onComplete) => <GeographyUKInner onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
