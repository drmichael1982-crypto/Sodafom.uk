import { beforeEach, expect, it } from 'vitest';
import { getRecentLessonSummary, loadTutorMemory, loadTutorMemoryForChild, recordQuestionAnswer, saveTutorMemory } from './memory';

beforeEach(() => localStorage.clear());

function select(id: number, name: string, ageGroup: '5-7' | '8-10' | '11-13') {
  localStorage.setItem('sodafom_active_child', JSON.stringify({ id, name, ageGroup }));
}

it('keeps local tutor mastery and learner names scoped to the active child', () => {
  select(1, 'Mia', '5-7');
  saveTutorMemory({ ...loadTutorMemory(), schoolYear: 'Year 2' });
  recordQuestionAnswer('Maths', 'Addition', true);
  expect(loadTutorMemory()).toMatchObject({ childName: 'Mia', ageGroup: '5-7', schoolYear: 'Year 2' });
  expect(loadTutorMemory().topics['maths:addition']?.totalAttempted).toBe(1);
  expect(getRecentLessonSummary()).toContain('Mia');
  expect(getRecentLessonSummary()).toContain('Addition');

  select(2, 'Leo', '11-13');
  expect(loadTutorMemory()).toMatchObject({ childName: 'Leo', ageGroup: '11-13', topics: {} });
  saveTutorMemory({ ...loadTutorMemory(), schoolYear: 'Year 7' });
  recordQuestionAnswer('Science', 'Forces', false);
  expect(loadTutorMemory()).toMatchObject({ childName: 'Leo', ageGroup: '11-13', schoolYear: 'Year 7' });
  expect(getRecentLessonSummary()).toContain('Leo');
  expect(getRecentLessonSummary()).toContain('Forces');

  select(1, 'Mia', '5-7');
  expect(loadTutorMemory()).toMatchObject({ childName: 'Mia', schoolYear: 'Year 2' });
  expect(loadTutorMemory().topics['maths:addition']?.totalAttempted).toBe(1);
  expect(loadTutorMemory().topics['science:forces']).toBeUndefined();
  expect(getRecentLessonSummary()).toContain('Addition');

  expect(loadTutorMemoryForChild({ id: 2, name: 'Leo', ageGroup: '11-13' })).toMatchObject({
    childName: 'Leo', schoolYear: 'Year 7', recentTopic: 'Forces',
  });
  expect(loadTutorMemory()).toMatchObject({ childName: 'Mia', schoolYear: 'Year 2', recentTopic: 'Addition' });
});
