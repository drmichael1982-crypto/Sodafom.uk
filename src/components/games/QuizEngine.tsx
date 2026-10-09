/**
 * QuizEngine — reusable multiple-choice quiz component used by all new games.
 * Accepts a question bank, renders one question at a time, tracks score,
 * and calls onComplete(stars) when all rounds are done.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import ArchieGameHelper from '@/components/games/ArchieGameHelper';
import ArchieReadAloudButton from '@/components/games/ArchieReadAloudButton';
import { useVoice } from '@/lib/voice-context';
import './answer-snake.css';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
}

interface QuizEngineProps {
  title: string;
  emoji: string;
  questions: QuizQuestion[];
  onComplete: (stars: number, result?: {correct:number;total:number;firstAttemptCorrect:number;solved:number}) => void;
  accentClass?: string; // tailwind bg class for correct highlight
  onQuestionChange?: (question: string, options?: string[]) => void; // reports current question text upward
  sessionKey?: string;
  answerReward?: 'snake' | 'word-monster' | 'robot';
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function QuizEngine({
  title,
  emoji,
  questions,
  onComplete,
  accentClass = 'bg-primary',
  onQuestionChange,
  sessionKey = title,
  answerReward = 'snake',
}: QuizEngineProps) {
  const [pool] = useState(() => {
    const unique = [...new Map(questions.map(q => [`${q.question}|${q.answer}`, q])).values()];
    const storageKey = `sodafom_seen_questions_${sessionKey}`;
    let seen = new Set<string>();
    try { seen = new Set(JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]); } catch { /* ignore */ }
    let available = unique.filter(q => !seen.has(`${q.question}|${q.answer}`));
    if (available.length < Math.min(10, unique.length)) {
      seen = new Set();
      available = unique;
    }
    const selectedQuestions = shuffle(available).slice(0, 10);
    selectedQuestions.forEach(q => seen.add(`${q.question}|${q.answer}`));
    try { localStorage.setItem(storageKey, JSON.stringify([...seen].slice(-300))); } catch { /* ignore */ }
    return selectedQuestions.map(q => ({ ...q, options: shuffle(q.options) }));
  });
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [fitted, setFitted] = useState(0);
  const [tried, setTried] = useState<string[]>([]);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if(advanceTimer.current)clearTimeout(advanceTimer.current); }, []);
  const [done, setDone] = useState(false);
  const { speak } = useVoice();

  const reducedMotion = useReducedMotion();
  const feeding = selected !== null && selected === pool[idx]?.answer;
  const current = pool[idx];

  // Report current question text whenever it changes
  useEffect(() => {
    if (!done && current) onQuestionChange?.(current.question, current.options);
  }, [idx, done, current, onQuestionChange]);

  useEffect(() => {
    if (done || !current) return;
    const timer = window.setTimeout(() => {
      speak(`archie-question:${sessionKey}:${idx}`, `${current.question}. ${current.options.join('. ')}`);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [current, done, idx, sessionKey, speak]);

  const pick = useCallback((opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    const isCorrect = opt === current.answer;
    if (isCorrect) {
      if(tried.length===0)setCorrect(c => c + 1);
      setFitted(value=>value+1);
    } else setTried(values=>[...values,opt]);

    const feedback = isCorrect
      ? `You chose ${opt}. That's correct! Well done.`
      : `You chose ${opt}. Let's try a clue. ${current.hint || "Read the question again and try a different answer. You can ask Archie for help."}`;
    speak(`archie-answer:${current.question}:${opt}`, feedback);
    if(!isCorrect)return;
    advanceTimer.current=setTimeout(() => {
      if (idx + 1 >= pool.length) {
        setDone(true);
      } else {
        setIdx(i => i + 1);
        setSelected(null);
        setTried([]);
      }
    }, isCorrect && !reducedMotion ? 1900 : 900);
  }, [selected, current, idx, pool.length, speak, reducedMotion, tried]);

  useEffect(() => {
    if (done) {
      const pct = correct / pool.length;
      const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
      const t = setTimeout(() => onComplete(stars,{correct,total:pool.length,firstAttemptCorrect:correct,solved:fitted}), 1200);
      return () => clearTimeout(t);
    }
  }, [done, correct, fitted, pool.length, onComplete]);

  if (done) {
    const pct = correct / pool.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="text-6xl">{emoji}</div>
        <h2 className="text-2xl font-black text-foreground">
          {correct}/{pool.length} right first time!
        </h2>
        <div className="flex gap-1">
          {[1,2,3].map(s => (
            <Star key={s} size={32} className={s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
          ))}
        </div>
        <p className="text-muted-foreground text-sm">Finishing up…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto w-full px-2">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>{title} {emoji}</span>
        <span>{idx + 1} / {pool.length}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${accentClass}`}
          animate={{ width: `${((idx) / pool.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="quiz-picture-jigsaw" aria-label={`${fitted} picture pieces earned`}>{pool.map((_,i)=><span key={i} className={i<fitted?'quiz-picture-fit':'quiz-picture-gap'} style={{backgroundSize:`${pool.length*100}% 100%`,backgroundPosition:`${pool.length===1?0:i/(pool.length-1)*100}% center`}}/>)}</div>
      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-2xl p-5 border border-border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-black text-foreground text-lg leading-snug text-center">
                {current.question}
              </p>
              {current.hint && (
                <p className="text-muted-foreground text-xs text-center mt-1">{current.hint}</p>
              )}
            </div>
            <ArchieReadAloudButton question={current.question} options={current.options} />
            <ArchieGameHelper />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div key={`answers-${idx}`} className={`answer-snake-board grid grid-cols-1 sm:grid-cols-2 gap-3 ${feeding ? 'is-feeding' : ''} answer-reward-${answerReward}`}>
        {feeding && <span className="answer-snake" aria-hidden="true">{answerReward==='word-monster'?'👾':answerReward==='robot'?'🤖':'🐍'}</span>}
        {current.options.map(opt => {
          const isSelected = selected === opt;
          const isCorrect = opt === current.answer;
          let cls = 'bg-card border-border text-foreground hover:border-primary/50';
          if (selected !== null) {
            if (isSelected && isCorrect) cls = 'bg-green-100 border-green-500 text-green-800';
            else if (isSelected && !isCorrect) cls = 'bg-red-100 border-red-400 text-red-800';
            else cls = 'bg-card border-border text-muted-foreground opacity-60';
          }
          return (
            <motion.button
              type="button"
              key={opt}
              whileHover={selected === null ? { scale: 1.03 } : {}}
              whileTap={selected === null ? { scale: 0.97 } : {}}
              disabled={selected !== null || tried.includes(opt)}
              onClick={() => pick(opt)}
              className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 font-bold text-sm text-left transition-all ${feeding ? isCorrect ? 'snake-right-answer' : 'snake-wrong-answer' : ''} ${cls}`}
            >
              <span>{opt}</span>
              {selected !== null && isSelected && isCorrect && <CheckCircle size={16} className="text-green-600 shrink-0" />}
              {selected !== null && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 shrink-0" />}
            </motion.button>
          );
        })}
      </div>
      {selected !== null && !feeding && <div role="alert" className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950"><p className="font-bold">Good effort. Let’s try a clue!</p><p>{current.hint || "Read the question again and try a different answer. Ask Archie if you need help."}</p><button type="button" className="mt-3 min-h-11 rounded-xl bg-blue-700 px-5 py-2 font-bold text-white" onClick={()=>setSelected(null)}>Try again</button></div>}
      {feeding && <p role="status" className="answer-snake-notice">{answerReward==='word-monster'?'Correct! The word monster is gobbling up the wrong words.':answerReward==='robot'?'Correct! Your discovery robot is collecting the wrong answers.':'Correct! The snake is gobbling up the wrong answers.'}</p>}
    </div>
  );
}
