import { beforeEach, describe, expect, it } from 'vitest';
import { experienceBand, readLearningAge, resolveLearningAge, saveLearningAge } from './AgeExperience';

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
  it('keeps exact ages separate for numeric child profiles and falls back to each age group', () => {
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 1, ageGroup: '5-7' }));
    expect(saveLearningAge(7)).toBe(true);
    expect(localStorage.getItem('sodafom_learning_age')).toBeNull();
    expect(localStorage.getItem('sodafom_learning_age:1')).toBe('7');

    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 2, ageGroup: '11-13' }));
    expect(readLearningAge()).toBeNull();
    expect(resolveLearningAge()).toBe(12);
    expect(saveLearningAge(13)).toBe(true);

    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 1, ageGroup: '5-7' }));
    expect(resolveLearningAge()).toBe(7);
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 2, ageGroup: '11-13' }));
    expect(resolveLearningAge()).toBe(13);
  });
  it('does not let a legacy profile-less age override an active child', () => {
    localStorage.setItem('sodafom_learning_age', '6');
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 22, ageGroup: '11-13' }));
    expect(readLearningAge()).toBeNull();
    expect(resolveLearningAge()).toBe(12);
    localStorage.removeItem('sodafom_active_child');
    expect(readLearningAge()).toBe(6);
    expect(resolveLearningAge()).toBe(6);
  });
});
