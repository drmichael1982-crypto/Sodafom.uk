import { CURRICULUM_DAYS } from './curriculum-year-plan';

export const LESSON_DURATIONS = [15, 20, 30, 60] as const;

export type LessonDuration = (typeof LESSON_DURATIONS)[number];

export function isLessonDuration(value: number): value is LessonDuration {
  return (LESSON_DURATIONS as readonly number[]).includes(value);
}

export function clampLessonDay(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(CURRICULUM_DAYS, Math.max(1, Math.trunc(value)));
}

/**
 * Returns the next unused daily lesson, or null once the 365-day path is
 * complete. Returning null is important: wrapping within one live session
 * would repeat questions the learner has already seen.
 */
export function nextCurriculumLessonDay(currentDay: number): number | null {
  const safeDay = clampLessonDay(currentDay);
  return safeDay >= CURRICULUM_DAYS ? null : safeDay + 1;
}

export function lessonProgressPercent(totalSeconds: number, secondsRemaining: number): number {
  if (totalSeconds <= 0) return 0;
  return Math.min(100, Math.max(0, ((totalSeconds - secondsRemaining) / totalSeconds) * 100));
}

export function lessonAccuracyPercent(correctAnswers: number, attemptedQuestions: number): number {
  if (attemptedQuestions <= 0) return 0;
  return Math.round((Math.max(0, correctAnswers) / attemptedQuestions) * 100);
}
