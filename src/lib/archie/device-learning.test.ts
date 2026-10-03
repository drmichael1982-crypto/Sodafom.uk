import { beforeEach, describe, expect, it } from 'vitest';
import { answerFromDevice, clearSavedLearning, loadSavedLearning, saveLearningTurn } from './device-learning';

describe('Archie offline learning memory', () => {
  beforeEach(() => localStorage.clear());

  it('answers common history questions offline with an age-appropriate explanation', () => {
    const younger = answerFromDevice('Who was Christopher Columbus?', 6);
    const older = answerFromDevice('Tell me about Christopher Columbus', 12);
    expect(younger).toContain('sailor');
    expect(older).toContain('Indigenous');
    expect(older).not.toEqual(younger);
  });

  it('remembers a tutor answer on this device and reuses it for the same year age', () => {
    saveLearningTurn('Why do planets orbit the Sun?', 'Gravity keeps planets in orbit.', 9);
    expect(answerFromDevice('Why do planets orbit the Sun?', 9)).toBe('Gravity keeps planets in orbit.');
    expect(answerFromDevice('Why do planets orbit the Sun?', 6)).not.toBe('Gravity keeps planets in orbit.');
    expect(loadSavedLearning()).toHaveLength(1);
  });

  it('clears local learning turns when requested', () => {
    saveLearningTurn('What is a habitat?', 'A place where an organism lives.', 8);
    clearSavedLearning();
    expect(loadSavedLearning()).toEqual([]);
  });
});
