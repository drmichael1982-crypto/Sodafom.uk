/**
 * LevelledQuizEngine
 *
 * Drop-in replacement for the raw QuizEngine pattern used in stub games.
 * Adds adaptive difficulty (levels 1–5) via useGameLevel — no other changes needed.
 *
 * Usage:
 *   <GameShell ...>
 *     {(oc) => (
 *       <LevelledQuizEngine
 *         gameSlug="anagram-attack"
 *         title="Anagram Attack"
 *         emoji="🔀"
 *         questionsByLevel={QUESTIONS_BY_LEVEL}
 *         accentClass="bg-secondary"
 *         onComplete={oc}
 *       />
 *     )}
 *   </GameShell>
 *
 * questionsByLevel: array of 5 question banks (index 0 = level 1, …, index 4 = level 5).
 * If fewer than 5 banks are provided the last bank is reused for higher levels.
 */
import { useState, useRef } from 'react';
import QuizEngine, { type QuizQuestion } from './QuizEngine';
import LevelBadge from './LevelBadge';
import { useGameLevel } from '@/hooks/useGameLevel';
import { useChildAge } from '@/hooks/useChildAge';
import { generateMathQuestions } from '@/lib/adaptive-question-generator';
import type { GameResult } from './GameShell';
import catalog from '@/lib/archie/game-catalog.json';

interface LevelledQuizEngineProps {
  gameSlug: string;
  title: string;
  emoji: string;
  subject?: 'maths' | 'spelling' | 'reading' | 'science';
  /** 1–5 question banks ordered easy → hard. Shorter arrays reuse the last bank. */
  questionsByLevel: QuizQuestion[][];
  accentClass?: string;
  onComplete: (result: GameResult) => void;
  onQuestionChange?: (question: string, options?: string[]) => void;
}

export default function LevelledQuizEngine({
  gameSlug,
  title,
  emoji,
  subject,
  questionsByLevel,
  accentClass = 'bg-primary',
  onComplete,
  onQuestionChange,
}: LevelledQuizEngineProps) {
  const { level, loading, recordResult } = useGameLevel(gameSlug);
  const { tier } = useChildAge();
  const [toast, setToast] = useState<'up' | 'down' | null>(null);
  const prevLevel = useRef(level);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Pick the question bank for the current level (clamp to available banks)
  const ageStartLevel = tier === 1 ? 1 : tier === 2 ? 2 : 3;
  const effectiveLevel = Math.max(level, ageStartLevel);
  const bankIndex = Math.min(effectiveLevel - 1, questionsByLevel.length - 1);
  const baseQuestions = questionsByLevel[bankIndex] ?? questionsByLevel[questionsByLevel.length - 1] ?? [];
  const questions = subject === 'maths'
    ? [...baseQuestions, ...generateMathQuestions(gameSlug, tier, effectiveLevel)]
    : baseQuestions;

  async function handleComplete(stars: number, result?: { correct: number; total: number; firstAttemptCorrect: number; solved: number }) {
    const newLevel = await recordResult(stars);
    if (newLevel > prevLevel.current) setToast('up');
    else if (newLevel < prevLevel.current) setToast('down');
    prevLevel.current = newLevel;

    // A star band cannot recover the question count or the child's accuracy.
    // Preserve the actual first-attempt result, including short question banks.
    const correct = result?.firstAttemptCorrect ?? 0;
    const total = result?.total ?? 0;
    const score = total > 0 ? Math.round(correct / total * 100) : 0;
    onComplete({ score, correct, total, stars });
  }

  return (
    <div className="relative">
      {/* Level badge — top of game area */}
      <div className="flex justify-center pt-3 pb-1">
        <LevelBadge level={effectiveLevel} showToast={toast} onToastDone={() => setToast(null)} />
      </div>

      <QuizEngine
        key={`${gameSlug}-level-${effectiveLevel}`}
        sessionKey={gameSlug}
        title={title}
        emoji={emoji}
        answerReward={(() => {
          const rewardSubject = subject ?? catalog.find(game => game.slug === gameSlug)?.subject;
          return rewardSubject === 'spelling' || rewardSubject === 'reading' ? 'word-monster' : rewardSubject === 'maths' ? 'snake' : 'robot';
        })()}
        questions={questions}
        accentClass={accentClass}
        onComplete={handleComplete}
        onQuestionChange={onQuestionChange}
      />
    </div>
  );
}
