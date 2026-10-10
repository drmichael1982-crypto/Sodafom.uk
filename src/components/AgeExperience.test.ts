import { beforeEach, describe, expect, it } from 'vitest';
import { experienceBand, readLearningAge, saveLearningAge } from './AgeExperience';

describe('age-tailored home presentation', () => {
  beforeEach(() => localStorage.clear());
  it('uses the requested age bands at every boundary', () => {
    expect([5,7,8,9,10,12,13].map(age => experienceBand(age,4))).toEqual(['starter','starter','explorer','explorer','challenger','challenger','challenger']);
  });
  it('retains an explicit age independently of a school-year override', () => {
    expect(saveLearningAge(10)).toBe(true);
    expect(experienceBand(readLearningAge(),3)).toBe('challenger');
  });
  it('rejects invalid ages and permits removing age for year-based presentation', () => {
    expect(saveLearningAge(13)).toBe(true);
    expect(readLearningAge()).toBe(13);
    expect(saveLearningAge(14)).toBe(false);
    expect(saveLearningAge(5.5)).toBe(false);
    localStorage.setItem('sodafom_learning_age','4');
    expect(readLearningAge()).toBeNull();
    saveLearningAge(7);
    saveLearningAge(null);
    expect(readLearningAge()).toBeNull();
    expect(experienceBand(null,4)).toBe('explorer');
  });
});
