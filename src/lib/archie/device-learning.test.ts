import { beforeEach, describe, expect, it } from 'vitest';
import { answerFromDevice, answerLessonReply, clearSavedLearning, loadSavedLearning, saveLearningTurn } from './device-learning';

describe('Archie offline learning memory', () => {
  beforeEach(() => localStorage.clear());

  it('checks a spoken spelling reply locally against the active lesson word', () => {
    expect(answerLessonReply('Wednesday', 'Spell the word Wednesday.', 'Spelling')).toContain('spelled Wednesday correctly');
    expect(answerLessonReply('Wensday', 'Spell the word Wednesday.', 'Spelling')).toContain('Good try');
    expect(answerLessonReply('help me', 'Spell the word Wednesday.', 'Spelling')).toBeNull();
  });

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

  it('keeps saved answers separate for different child profiles on one device', () => {
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 'child-a' }));
    saveLearningTurn('What is a habitat?', 'A place where an organism lives.', 8);
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 'child-b' }));
    expect(answerFromDevice('What is a habitat?', 8)).toBeNull();
    saveLearningTurn('What is a habitat?', 'A home for living things.', 8);
    expect(answerFromDevice('What is a habitat?', 8)).toBe('A home for living things.');
  });

  it('clears local learning turns when requested', () => {
    saveLearningTurn('What is a habitat?', 'A place where an organism lives.', 8);
    clearSavedLearning();
    expect(loadSavedLearning()).toEqual([]);
  });
});

it('explains each new jigsaw history topic offline across the child age range',()=>{localStorage.clear();for(const age of [5,8,12])for(const topic of ['Ancient Egypt','1066','Henry VIII','Anglo-Saxons'])expect(answerFromDevice(`Tell me about ${topic}`,age)).toBeTruthy();});
