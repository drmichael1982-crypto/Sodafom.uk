import { beforeEach, expect, it } from 'vitest';
import { loadTutorMemory, recordQuestionAnswer } from './memory';

beforeEach(() => localStorage.clear());

function select(id: number, name: string, ageGroup: '5-7' | '8-10' | '11-13') {
  localStorage.setItem('sodafom_active_child', JSON.stringify({ id, name, ageGroup }));
}

it('keeps local tutor mastery and learner names scoped to the active child', () => {
  select(1, 'Mia', '5-7');
  recordQuestionAnswer('Maths', 'Addition', true);
  expect(loadTutorMemory()).toMatchObject({ childName: 'Mia', ageGroup: '5-7' });
  expect(loadTutorMemory().topics['maths:addition']?.totalAttempted).toBe(1);

  select(2, 'Leo', '11-13');
  expect(loadTutorMemory()).toMatchObject({ childName: 'Leo', ageGroup: '11-13', topics: {} });
  recordQuestionAnswer('Science', 'Forces', false);

  select(1, 'Mia', '5-7');
  expect(loadTutorMemory().topics['maths:addition']?.totalAttempted).toBe(1);
  expect(loadTutorMemory().topics['science:forces']).toBeUndefined();
});
