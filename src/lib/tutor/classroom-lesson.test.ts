import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CURRICULUM_LESSONS } from './curriculum';
import {
  buildClassroomStages,
  classroomAnswerMatches,
  classroomInstruction,
  createPeLesson,
  formatLessonTime,
  getPeActivity,
  selectClassroomLesson,
  teacherConnectionMessage,
} from './classroom-lesson';

describe('classroom lesson plan', () => {
  it.each([15, 20, 30, 60] as const)('allocates every academic minute for a %i-minute lesson', duration => {
    const stages = buildClassroomStages(duration, false);
    expect(stages).toHaveLength(8);
    expect(stages.reduce((sum, stage) => sum + stage.minutes, 0)).toBe(duration);
    expect(stages.every(stage => stage.minutes >= 1)).toBe(true);
    expect(stages.map(stage => stage.kind)).toEqual(['intro', 'teach', 'example', 'activity', 'guided', 'practice', 'assessment', 'reflection']);
  });

  it('uses a distinct PE plan with a safety-first introduction and cool-down', () => {
    const stages = buildClassroomStages(30, true);
    expect(stages[0].label).toBe('Safety check');
    expect(stages.find(stage => stage.kind === 'assessment')?.label).toBe('Cool-down');
    expect(stages.reduce((sum, stage) => sum + stage.minutes, 0)).toBe(30);
  });
});

describe('child-safe lesson content', () => {
  it('rotates PE safely and never treats movement as a performance test', () => {
    expect(getPeActivity(1).key).toBe('football');
    expect(getPeActivity(7).key).toBe('football');
    const peLesson = createPeLesson('8-10', 4);
    expect(peLesson.subject).toBe('PE');
    expect(classroomInstruction('assessment', peLesson, getPeActivity(4))).toContain('not a performance test');
    expect(classroomInstruction('intro', peLesson, getPeActivity(4))).toContain('Safety first');
  });

  it('selects an age-matched local lesson and normalises answer spacing and punctuation', () => {
    const lesson = selectClassroomLesson(CURRICULUM_LESSONS, 'Maths', '8-10', 1);
    expect(lesson?.ageGroup).toBe('8-10');
    expect(classroomAnswerMatches('  Ten! ', '10', ['ten'])).toBe(true);
    expect(classroomAnswerMatches('eleven', '10', ['ten'])).toBe(false);
  });

  it('keeps teacher connection and time messages privacy-safe', () => {
    expect(teacherConnectionMessage(true)).toContain('does not send answers, recordings, or marks');
    expect(teacherConnectionMessage(false)).toContain('stays on this device');
    expect(formatLessonTime(65)).toBe('01:05');
    expect(formatLessonTime(-1)).toBe('00:00');
  });

  it('keeps the classroom page local-first while making voice input an explicit action', () => {
    const page = readFileSync(resolve(process.cwd(), 'src/pages/tutor/ClassroomLessonPage.tsx'), 'utf8');
    expect(page).toContain("import { getTeacherProfile } from '@/lib/teacher-auth'");
    expect(page).toContain('onClick={startVoiceAnswer}');
    expect(page).not.toMatch(/\bfetch\s*\(|API_PREFIX|localStorage/);
  });
});
