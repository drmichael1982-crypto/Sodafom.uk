import { describe, expect, it } from 'vitest';

import {
  buildCurriculumYear,
  buildDailyCurriculumLesson,
  CURRICULUM_DAYS,
  CURRICULUM_SUBJECTS,
  type CurriculumAgeGroup,
} from './curriculum-year-plan';

const ageGroups: CurriculumAgeGroup[] = ['5-7', '8-10', '11-13'];

describe('365-day curriculum engine', () => {
  it('covers every supported subject and age group for all 365 days', () => {
    expect(CURRICULUM_SUBJECTS).toHaveLength(16);
    for (const subject of CURRICULUM_SUBJECTS) {
      for (const ageGroup of ageGroups) {
        const year = buildCurriculumYear(subject, ageGroup);
        expect(year).toHaveLength(CURRICULUM_DAYS);
        expect(new Set(year.map((lesson) => lesson.id)).size).toBe(CURRICULUM_DAYS);
        expect(year[0].ageGroup).toBe(ageGroup);
        expect(year[364].subject).toBe(subject);
      }
    }
  });

  it.each([15, 20, 30, 60] as const)('keeps the five lesson phases within a %i-minute lesson', (durationMinutes) => {
    const lesson = buildDailyCurriculumLesson({ subject: 'Maths', ageGroup: '8-10', day: 123, durationMinutes });
    expect(lesson.lessonPhases.reduce((total, phase) => total + phase.minutes, 0)).toBe(durationMinutes);
  });

  it('clamps day numbers and makes every question answerable', () => {
    const first = buildDailyCurriculumLesson({ subject: 'Science', ageGroup: '5-7', day: -12 });
    const last = buildDailyCurriculumLesson({ subject: 'Science', ageGroup: '11-13', day: 900 });
    expect(first.lessonDay).toBe(1);
    expect(last.lessonDay).toBe(365);
    for (const question of [...first.questions, ...last.questions]) {
      expect(question.options).toBeDefined();
      expect(question.options!).toContain(question.answer);
      expect(new Set(question.options!).size).toBe(question.options!.length);
    }
  });

  it('provides non-colour-only and sensory-access adaptations in every lesson', () => {
    const lesson = buildDailyCurriculumLesson({ subject: 'Art & Design', ageGroup: '8-10', day: 40 });
    expect(lesson.accessibility.colourVision).toContain('Never rely on colour alone');
    expect(lesson.accessibility.dyslexia).toContain('read-aloud');
    expect(lesson.accessibility.autism).toContain('now/next');
    expect(lesson.accessibility.deafOrHardOfHearing).toContain('captions');
    expect(lesson.accessibility.blindOrLowVision).toContain('screen-reader');
  });
});
