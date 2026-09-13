import { describe, expect, it } from 'vitest';

import {
  clampLessonDay,
  isLessonDuration,
  lessonAccuracyPercent,
  lessonProgressPercent,
  nextCurriculumLessonDay,
} from './lesson-flow';

describe('lesson flow safeguards', () => {
  it.each([15, 20, 30, 60])('accepts %i-minute lessons', (duration) => {
    expect(isLessonDuration(duration)).toBe(true);
  });

  it('rejects unsupported lesson lengths', () => {
    expect(isLessonDuration(10)).toBe(false);
    expect(isLessonDuration(45)).toBe(false);
  });

  it('keeps daily lesson paths in range and never wraps inside a session', () => {
    expect(clampLessonDay(-4)).toBe(1);
    expect(clampLessonDay(800)).toBe(365);
    expect(nextCurriculumLessonDay(1)).toBe(2);
    expect(nextCurriculumLessonDay(364)).toBe(365);
    expect(nextCurriculumLessonDay(365)).toBeNull();
  });

  it('reports bounded duration progress and answer accuracy', () => {
    expect(lessonProgressPercent(900, 900)).toBe(0);
    expect(lessonProgressPercent(900, 450)).toBe(50);
    expect(lessonProgressPercent(900, -30)).toBe(100);
    expect(lessonAccuracyPercent(3, 4)).toBe(75);
    expect(lessonAccuracyPercent(0, 0)).toBe(0);
  });
});
