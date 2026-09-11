import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2 } from 'lucide-react';

import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelBadge from '@/components/games/LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';
import {
  getLearningArenaQuestion,
  learningArenaActionSucceeds,
  learningArenaConfigs,
  type LearningArenaConfig,
} from '@/lib/games/learning-arena-data';

const TOTAL_ROUNDS = 8;

function speakAsArchie(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.84;
  speech.pitch = 1.12;
  window.speechSynthesis.speak(speech);
}

function LearningArenaPlay({
  config,
  level,
  onComplete,
  onLevelChange,
  onQuestionChange,
}: {
  config: LearningArenaConfig;
  level: number;
  onComplete: (result: GameResult) => void;
  onLevelChange: (stars: number) => void;
  onQuestionChange: (question: string, options: string[]) => void;
}) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [actionPoints, setActionPoints] = useState(0);
  const [phase, setPhase] = useState<'question' | 'action'>('question');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chosenAnswer, setChosenAnswer] = useState<string | null>(null);
  const [chosenTarget, setChosenTarget] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = useMemo(() => getLearningArenaQuestion(config.slug, round, level), [config.slug, level, round]);

  useEffect(() => {
    onQuestionChange(question.prompt, question.options);
  }, [onQuestionChange, question]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  }, []);

  const finishOrContinue = useCallback((nextCorrect: number) => {
    const nextRound = round + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      const score = Math.round((nextCorrect / TOTAL_ROUNDS) * 100);
      const stars = score >= 90 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;
      onLevelChange(stars);
      onComplete({ score, correct: nextCorrect, total: TOTAL_ROUNDS, stars });
      return;
    }
    setRound(nextRound);
    setPhase('question');
    setFeedback(null);
    setChosenAnswer(null);
    setChosenTarget(null);
    setActionSuccess(null);
  }, [onComplete, onLevelChange, round]);

  function chooseAnswer(option: string) {
    if (feedback || phase !== 'question') return;
    const isCorrect = option === question.answer;
    setChosenAnswer(option);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrect((value) => value + 1);
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        setPhase('action');
      }, 750);
    } else {
      timerRef.current = setTimeout(() => finishOrContinue(correct), 1500);
    }
  }

  function chooseTarget(targetIndex: number) {
    if (chosenTarget !== null || phase !== 'action') return;
    const success = learningArenaActionSucceeds(config.slug, round, targetIndex);
    setChosenTarget(targetIndex);
    setActionSuccess(success);
    setActionPoints((value) => value + (success ? 2 : 1));
    timerRef.current = setTimeout(() => finishOrContinue(correct), 1600);
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-sky-50 via-background to-emerald-50 p-3 sm:p-5">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Round {round + 1} of {TOTAL_ROUNDS}</p>
            <p className="text-sm font-bold text-foreground">Learning ⭐ {correct} · Action points 🏆 {actionPoints}</p>
          </div>
          <LevelBadge level={level} />
        </div>

        <AnimatePresence mode="wait">
          {phase === 'question' ? (
            <motion.section
              key={`question-${round}`}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className="rounded-3xl border-2 border-primary/20 bg-card p-4 shadow-lg sm:p-6"
              aria-labelledby="arena-question"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-3xl" aria-hidden="true">🐶</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-wide text-primary">Archie asks</p>
                  <h2 id="arena-question" className="text-xl font-black leading-snug text-foreground sm:text-2xl">{question.prompt}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => speakAsArchie(`${question.prompt} ${question.options.join('. ')}`)}
                  className="flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                  aria-label="Hear Archie read the question and answers"
                >
                  <Volume2 aria-hidden="true" size={22} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {question.options.map((option) => {
                  const selected = chosenAnswer === option;
                  const isAnswer = option === question.answer;
                  const style = feedback
                    ? selected && feedback === 'wrong'
                      ? 'border-red-500 bg-red-500 text-white'
                      : isAnswer
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-border bg-muted text-muted-foreground opacity-60'
                    : 'border-border bg-background text-foreground hover:border-primary hover:bg-primary/5';
                  return (
                    <motion.button
                      key={option}
                      type="button"
                      whileTap={!feedback ? { scale: 0.97 } : undefined}
                      onClick={() => chooseAnswer(option)}
                      disabled={feedback !== null}
                      className={`min-h-16 rounded-2xl border-2 px-4 py-3 text-left text-lg font-black shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${style}`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-4 min-h-14" aria-live="polite">
                {feedback === 'correct' && <p className="rounded-xl bg-green-50 p-3 font-black text-green-800">✅ Correct! You unlocked your action.</p>}
                {feedback === 'wrong' && <p className="rounded-xl bg-red-50 p-3 font-bold text-red-800">Let’s learn it: {question.explanation}</p>}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key={`action-${round}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-sky-400 to-emerald-500 p-4 text-white shadow-xl sm:p-6"
              aria-labelledby="arena-action"
            >
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-emerald-600/70" aria-hidden="true" />
              <div className="relative z-10">
                <p className="text-center text-sm font-black uppercase tracking-wide text-white/85">Question right — action unlocked</p>
                <h2 id="arena-action" className="mb-4 text-center text-2xl font-black sm:text-3xl">{config.actionPrompt}</h2>
                <div className="relative grid min-h-64 grid-cols-3 gap-3 rounded-2xl border-4 border-white/80 bg-black/10 p-3" role="group" aria-label="Choose an action target">
                  {config.targets.map((target, targetIndex) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => chooseTarget(targetIndex)}
                      disabled={chosenTarget !== null}
                      className="min-h-24 rounded-xl border-2 border-dashed border-white/80 bg-white/15 p-2 text-sm font-black text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 disabled:cursor-default"
                    >
                      <span className="block text-2xl" aria-hidden="true">🎯</span>
                      {target}
                    </button>
                  ))}
                  <AnimatePresence>
                    {chosenTarget !== null && (
                      <motion.div
                        className="pointer-events-none absolute bottom-2 left-1/2 text-5xl drop-shadow-xl"
                        initial={{ x: '-50%', y: 0, scale: 1 }}
                        animate={{
                          x: `${((chosenTarget % 3) - 1) * 145 - 50}%`,
                          y: chosenTarget < 3 ? -185 : -78,
                          scale: [1, 1.2, 0.8],
                          rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        aria-hidden="true"
                      >
                        {config.actionEmoji}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-4 min-h-12 text-center text-xl font-black" aria-live="polite">
                  {actionSuccess === true && `🎉 ${config.actionSuccess}`}
                  {actionSuccess === false && `👏 ${config.actionTryAgain}`}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <p className="text-center text-xs font-semibold text-muted-foreground">Learning points come from correct answers. Action points are a fun extra, so every attempt counts.</p>
      </div>
    </div>
  );
}

export default function LearningArenaGame({ slug }: { slug: string }) {
  const config = learningArenaConfigs[slug];
  if (!config) throw new Error(`Unknown learning arena: ${slug}`);
  const { level, loading, recordResult } = useGameLevel(config.slug);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!loading) setDisplayLevel(level);
  }, [level, loading]);

  const handleQuestionChange = useCallback((question: string, options: string[]) => {
    setCurrentQuestion(question);
    setCurrentOptions(options);
  }, []);

  async function handleLevelChange(stars: number) {
    const next = await recordResult(stars);
    setDisplayLevel(next);
  }

  return (
    <>
      <Helmet>
        <title>{config.title} — Sodafom Educational Games</title>
        <meta name="description" content={config.description} />
        <link rel="canonical" href={`https://sodafom.uk/games/${config.slug}`} />
      </Helmet>
      <GameShell
        title={config.title}
        emoji={config.emoji}
        subject={config.subject}
        ageGroups={config.ageGroups}
        currentQuestion={currentQuestion}
        currentOptions={currentOptions}
      >
        {(onComplete) => loading ? (
          <div className="flex flex-1 items-center justify-center"><p className="font-bold text-muted-foreground">Getting your game ready…</p></div>
        ) : (
          <LearningArenaPlay
            config={config}
            level={displayLevel}
            onComplete={onComplete}
            onLevelChange={handleLevelChange}
            onQuestionChange={handleQuestionChange}
          />
        )}
      </GameShell>
    </>
  );
}

export const FootballTimesTablesGame = () => <LearningArenaGame slug="football-times-tables" />;
export const BasketballGrammarGame = () => <LearningArenaGame slug="basketball-grammar" />;
export const NetballSpellingGame = () => <LearningArenaGame slug="netball-spelling" />;
export const PoolScienceGame = () => <LearningArenaGame slug="pool-science" />;
export const ShopkeeperChangeGame = () => <LearningArenaGame slug="shopkeeper-change" />;
export const ClockQuestGame = () => <LearningArenaGame slug="clock-quest" />;
export const TrainTimetableGame = () => <LearningArenaGame slug="train-timetable" />;
export const ClinicScienceGame = () => <LearningArenaGame slug="clinic-science" />;
