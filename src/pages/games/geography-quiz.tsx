import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

const TOTAL_ROUNDS = 10;

type Question = { question: string; answer: string; options: string[]; emoji: string };

const TIER1_QUESTIONS: Question[] = [
  { question: "What is the capital of England?", answer: "London", options: ["London", "Manchester", "Birmingham", "Leeds"], emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { question: "What is the capital of Scotland?", answer: "Edinburgh", options: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"], emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { question: "What is the capital of Wales?", answer: "Cardiff", options: ["Cardiff", "Swansea", "Newport", "Bangor"], emoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { question: "What is the capital of France?", answer: "Paris", options: ["Paris", "Lyon", "Marseille", "Nice"], emoji: "🇫🇷" },
  { question: "What is the capital of Germany?", answer: "Berlin", options: ["Berlin", "Munich", "Hamburg", "Frankfurt"], emoji: "🇩🇪" },
  { question: "What is the capital of Spain?", answer: "Madrid", options: ["Madrid", "Barcelona", "Seville", "Valencia"], emoji: "🇪🇸" },
  { question: "What is the capital of Italy?", answer: "Rome", options: ["Rome", "Milan", "Naples", "Turin"], emoji: "🇮🇹" },
  { question: "What is the capital of the USA?", answer: "Washington D.C.", options: ["Washington D.C.", "New York", "Los Angeles", "Chicago"], emoji: "🇺🇸" },
  { question: "What is the capital of Australia?", answer: "Canberra", options: ["Canberra", "Sydney", "Melbourne", "Brisbane"], emoji: "🇦🇺" },
  { question: "What is the capital of Japan?", answer: "Tokyo", options: ["Tokyo", "Osaka", "Kyoto", "Hiroshima"], emoji: "🇯🇵" },
  { question: "Which country has the Eiffel Tower?", answer: "France", options: ["France", "Italy", "Spain", "Germany"], emoji: "🗼" },
  { question: "Which ocean is the largest?", answer: "Pacific", options: ["Pacific", "Atlantic", "Indian", "Arctic"], emoji: "🌊" },
];

const TIER2_QUESTIONS: Question[] = [
  { question: "What is the capital of Northern Ireland?", answer: "Belfast", options: ["Belfast", "Derry", "Armagh", "Newry"], emoji: "🇬🇧" },
  { question: "What is the capital of Canada?", answer: "Ottawa", options: ["Ottawa", "Toronto", "Vancouver", "Montreal"], emoji: "🇨🇦" },
  { question: "What is the capital of Brazil?", answer: "Brasília", options: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"], emoji: "🇧🇷" },
  { question: "What is the capital of Russia?", answer: "Moscow", options: ["Moscow", "St Petersburg", "Novosibirsk", "Kazan"], emoji: "🇷🇺" },
  { question: "What is the capital of China?", answer: "Beijing", options: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"], emoji: "🇨🇳" },
  { question: "What is the capital of India?", answer: "New Delhi", options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"], emoji: "🇮🇳" },
  { question: "Which is the longest river in the world?", answer: "Nile", options: ["Nile", "Amazon", "Mississippi", "Yangtze"], emoji: "🌍" },
  { question: "Which country has the most population?", answer: "India", options: ["India", "China", "USA", "Indonesia"], emoji: "👥" },
  { question: "What is the capital of Egypt?", answer: "Cairo", options: ["Cairo", "Alexandria", "Luxor", "Aswan"], emoji: "🇪🇬" },
  { question: "What is the capital of South Africa?", answer: "Pretoria", options: ["Pretoria", "Cape Town", "Johannesburg", "Durban"], emoji: "🇿🇦" },
  { question: "Which mountain is the tallest in the world?", answer: "Everest", options: ["Everest", "K2", "Kangchenjunga", "Lhotse"], emoji: "🏔️" },
  { question: "What is the capital of Argentina?", answer: "Buenos Aires", options: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"], emoji: "🇦🇷" },
];

const TIER3_QUESTIONS: Question[] = [
  { question: "What is the capital of Kazakhstan?", answer: "Astana", options: ["Astana", "Almaty", "Shymkent", "Karaganda"], emoji: "🇰🇿" },
  { question: "What is the capital of Myanmar?", answer: "Naypyidaw", options: ["Naypyidaw", "Yangon", "Mandalay", "Bago"], emoji: "🇲🇲" },
  { question: "Which country has the most time zones?", answer: "France", options: ["France", "Russia", "USA", "China"], emoji: "🕐" },
  { question: "What is the capital of New Zealand?", answer: "Wellington", options: ["Wellington", "Auckland", "Christchurch", "Hamilton"], emoji: "🇳🇿" },
  { question: "What is the capital of Pakistan?", answer: "Islamabad", options: ["Islamabad", "Karachi", "Lahore", "Peshawar"], emoji: "🇵🇰" },
  { question: "Which is the smallest country in the world?", answer: "Vatican City", options: ["Vatican City", "Monaco", "San Marino", "Liechtenstein"], emoji: "🏛️" },
  { question: "What is the capital of Nigeria?", answer: "Abuja", options: ["Abuja", "Lagos", "Kano", "Ibadan"], emoji: "🇳🇬" },
  { question: "What is the capital of Saudi Arabia?", answer: "Riyadh", options: ["Riyadh", "Jeddah", "Mecca", "Medina"], emoji: "🇸🇦" },
  { question: "Which country has the Amazon rainforest mostly?", answer: "Brazil", options: ["Brazil", "Peru", "Colombia", "Venezuela"], emoji: "🌿" },
  { question: "What is the capital of Ukraine?", answer: "Kyiv", options: ["Kyiv", "Kharkiv", "Odessa", "Lviv"], emoji: "🇺🇦" },
  { question: "What is the capital of Indonesia?", answer: "Jakarta", options: ["Jakarta", "Surabaya", "Bandung", "Medan"], emoji: "🇮🇩" },
  { question: "Which African country has the largest area?", answer: "Algeria", options: ["Algeria", "Sudan", "Libya", "DR Congo"], emoji: "🌍" },
];

function getQuestions(tier: 1 | 2 | 3): Question[] {
  const pool = tier === 1 ? TIER1_QUESTIONS : tier === 2 ? TIER2_QUESTIONS : TIER3_QUESTIONS;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
}

function GeographyQuizGame({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const { tier } = useChildAge();
  const [questions] = useState(() => getQuestions(tier));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const q = questions[round];

  const handleAnswer = useCallback((opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === q.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      if (round + 1 >= TOTAL_ROUNDS) {
        const finalScore = correct ? score + 1 : score;
        onComplete({ correct: finalScore, total: TOTAL_ROUNDS, score: Math.round((finalScore / TOTAL_ROUNDS) * 100), stars: finalScore >= 9 ? 3 : finalScore >= 6 ? 2 : 1 });
      } else {
        setRound(r => r + 1);
      }
    }, 1100);
  }, [selected, q, round, score, onComplete]);

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-lg mx-auto">
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((round) / TOTAL_ROUNDS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-sm font-bold text-muted-foreground">{round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="w-full bg-card border-2 border-border rounded-3xl p-6 text-center shadow-lg"
        >
          <div className="text-5xl mb-3">{q.emoji}</div>
          <p className="text-foreground font-black text-xl leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
            {q.question}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {q.options.map(opt => {
          const isSelected = selected === opt;
          const isCorrect = opt === q.answer;
          let cls = 'bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5';
          if (isSelected && feedback === 'correct') cls = 'bg-green-500 border-green-500 text-white scale-105';
          else if (isSelected && feedback === 'wrong') cls = 'bg-red-500 border-red-500 text-white';
          else if (selected && isCorrect) cls = 'bg-green-500 border-green-500 text-white';
          return (
            <motion.button
              key={opt}
              onClick={() => handleAnswer(opt)}
              whileHover={!selected ? { scale: 1.03 } : {}}
              whileTap={!selected ? { scale: 0.97 } : {}}
              className={`rounded-2xl px-4 py-3 font-bold text-sm transition-all shadow-sm ${cls}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      {/* Score */}
      <p className="text-muted-foreground text-sm font-semibold">⭐ Score: {score}/{round}</p>
    </div>
  );
}

export default function GeographyQuizPage() {
  return (
    <>
      <Helmet>
        <title>Geography Quiz — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Test your world geography knowledge! A fun quiz covering countries, capitals and flags for ages 8–13." />
        <link rel="canonical" href="https://sodafom.uk/games/geography-quiz" />
        <meta property="og:title" content="Geography Quiz — Sodafom" />
        <meta property="og:description" content="Test your world geography knowledge! A fun quiz covering countries, capitals and flags for ages 8–13." />
        <meta property="og:url" content="https://sodafom.uk/games/geography-quiz" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Geography Quiz — Sodafom" />
        <meta name="twitter:description" content="Test your world geography knowledge! A fun quiz covering countries, capitals and flags for ages 8–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/geography-quiz#webpage","name":"Geography Quiz — Sodafom","url":"https://sodafom.uk/games/geography-quiz","description":"Test your world geography knowledge! A fun quiz covering countries, capitals and flags for ages 8–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Geography Quiz — Maths Game for Kids — Sodafom
      </h1>
      <GameShell
        title="Geography Quiz"
        emoji="🗺️"
        subject="science"
        ageGroups={['8–10', '11–13']}
      >
        {(onComplete) => <GeographyQuizGame onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
