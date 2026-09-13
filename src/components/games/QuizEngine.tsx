/**
 * QuizEngine — reusable multiple-choice quiz component used by all new games.
 * Accepts a question bank, renders one question at a time, tracks score,
 * and calls onComplete(stars) when all rounds are done.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle, XCircle, Star } from 'lucide-react';
import ArchieGameHelper from '@/components/games/ArchieGameHelper';
import ArchieReadAloudButton from '@/components/games/ArchieReadAloudButton';
import { useVoice } from '@/lib/voice-context';

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
  onComplete: (stars: number) => void;
  accentClass?: string; // tailwind bg class for correct highlight
  onQuestionChange?: (question: string, options?: string[]) => void; // reports current question text upward
  sessionKey?: string;
}

/**
 * Randomise without mutating the supplied array.
 *
 * Array.sort with a random comparator is biased and can leave the same answer
 * position appearing too often. Fisher–Yates gives every order an equal chance.
 */
export function shuffleQuizItems<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

/** Return the zero-based answer index for a 1–9 keyboard shortcut. */
export function optionIndexForShortcut(key: string, optionCount: number): number | null {
  if (!/^[1-9]$/.test(key)) return null;
  const index = Number(key) - 1;
  return index < optionCount ? index : null;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export default function QuizEngine({
  title,
  emoji,
  questions,
  onComplete,
  accentClass = 'bg-primary',
  onQuestionChange,
  sessionKey = title,
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
    const selectedQuestions = shuffleQuizItems(available).slice(0, 10);
    selectedQuestions.forEach(q => seen.add(`${q.question}|${q.answer}`));
    try { localStorage.setItem(storageKey, JSON.stringify([...seen].slice(-300))); } catch { /* ignore */ }
    return selectedQuestions.map(q => ({ ...q, options: shuffleQuizItems(q.options) }));
  });
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const answerLockedRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);
  const { speak } = useVoice();

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

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    if (!answerLockedRef.current) return;
    clearAdvanceTimer();
    answerLockedRef.current = false;

    if (idx + 1 >= pool.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setSelected(null);
    }
  }, [clearAdvanceTimer, idx, pool.length]);

  const pick = useCallback((opt: string) => {
    if (answerLockedRef.current || selected !== null || !current) return;
    answerLockedRef.current = true;
    setSelected(opt);
    const isCorrect = opt === current.answer;
    if (isCorrect) setCorrect(c => c + 1);

    const feedback = isCorrect
      ? `You chose ${opt}. That's correct! Well done.`
      : `You chose ${opt}. That's not quite right. The correct answer is ${current.answer}.`;
    speak(`archie-answer:${current.question}:${opt}`, feedback);
    advanceTimerRef.current = window.setTimeout(advance, 1200);
  }, [advance, current, selected, speak]);

  // Number keys make the shuffled answer positions accessible without a mouse.
  // Enter or Space advances once feedback is shown. Ignore keys typed into forms.
  useEffect(() => {
    if (done || !current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) return;

      if (answerLockedRef.current) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          advance();
        }
        return;
      }

      const optionIndex = optionIndexForShortcut(event.key, current.options.length);
      if (optionIndex === null) return;
      event.preventDefault();
      pick(current.options[optionIndex]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance, current, done, pick]);

  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  useEffect(() => {
    if (done) {
      const pct = correct / pool.length;
      const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
      const t = setTimeout(() => onComplete(stars), 1200);
      return () => clearTimeout(t);
    }
  }, [done, correct, pool.length, onComplete]);

  if (pool.length === 0) {
    return (
      <div role="alert" className="mx-auto max-w-lg rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-center text-amber-950">
        <p className="text-3xl" aria-hidden="true">🛠️</p>
        <h2 className="mt-2 text-xl font-black">This game is being prepared</h2>
        <p className="mt-1 text-sm font-medium">Please choose another game and come back soon.</p>
      </div>
    );
  }

  if (done) {
    const pct = correct / pool.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="text-6xl">{emoji}</div>
        <h2 className="text-2xl font-black text-foreground">
          {correct}/{pool.length} correct!
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
    <div className="flex flex-col gap-5 max-w-lg mx-auto w-full px-2" aria-describedby="quiz-keyboard-help">
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
              <p id="quiz-question" className="font-black text-foreground text-lg leading-snug text-center">
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

      <p id="quiz-keyboard-help" className="-mt-2 text-center text-xs font-medium text-muted-foreground">
        Choose an answer below, or use number keys 1–{Math.min(current.options.length, 9)}. Tap Archie to hear the question.
      </p>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((opt, optionIndex) => {
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
              key={`${optionIndex}-${opt}`}
              whileHover={selected === null ? { scale: 1.03 } : {}}
              whileTap={selected === null ? { scale: 0.97 } : {}}
              onClick={() => pick(opt)}
              aria-label={`Answer ${optionIndex + 1}: ${opt}`}
              aria-describedby="quiz-question quiz-keyboard-help"
              aria-keyshortcuts={optionIndex < 9 ? String(optionIndex + 1) : undefined}
              aria-disabled={selected !== null}
              className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 font-bold text-sm text-left transition-all ${cls}`}
            >
              <span className="flex items-center gap-2">
                {optionIndex < 9 && (
                  <kbd aria-hidden="true" className="inline-flex min-h-6 min-w-6 items-center justify-center rounded border border-current/30 bg-background/60 px-1 text-xs font-black">
                    {optionIndex + 1}
                  </kbd>
                )}
                <span>{opt}</span>
              </span>
              {selected !== null && isSelected && isCorrect && <CheckCircle size={16} className="text-green-600 shrink-0" />}
              {selected !== null && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
          <p className="text-center text-sm font-bold text-foreground">
            {selected === current.answer ? 'Correct — brilliant work!' : `The answer is ${current.answer}.`}
          </p>
          <button
            type="button"
            onClick={advance}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-black text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          >
            {idx + 1 >= pool.length ? 'See my result' : 'Next question'} <ArrowRight size={16} aria-hidden="true" />
          </button>
          <p className="text-center text-xs text-muted-foreground">Or press Enter or Space. The next question starts automatically.</p>
        </div>
      )}
    </div>
  );
}
