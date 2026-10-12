import { describe, expect, it, vi } from 'vitest';
vi.mock('@/components/games/GameShell', () => ({ default: () => null }));
import { QUESTIONS } from './human-body';

describe('human body learning answers', () => {
  it('distinguishes the iris controlling light from the pupil opening', () => {
    const question = QUESTIONS.find(item => item.question === 'Which part of the eye controls how much light enters?');
    expect(question).toBeDefined();
    expect(question!.answer).toBe('Iris');
    expect(question!.choices).toContain('Pupil');
    expect(question!.choices.filter(choice => choice === question!.answer)).toEqual(['Iris']);
    expect(question!.funFact).toContain('Muscles in the iris change the size of the pupil');
  });
  it('provides one selectable correct answer for every body question', () => {
    for (const question of QUESTIONS) {
      expect(question.choices.filter(choice => choice === question.answer), question.question).toHaveLength(1);
      expect(new Set(question.choices).size, question.question).toBe(question.choices.length);
    }
  });
});
