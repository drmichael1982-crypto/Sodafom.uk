import { describe, expect, it } from 'vitest';
import { WORD_ADVENTURE, WORD_ADVENTURE_QUESTIONS, WORD_ADVENTURE_RUNTIME_SECONDS } from './word-adventure';

describe("Archie's Word Adventure episode data", () => {
  it('is a 5–7 minute subtitle-led episode', () => {
    expect(WORD_ADVENTURE.subtitles).toBe(true);
    expect(WORD_ADVENTURE_RUNTIME_SECONDS).toBeGreaterThanOrEqual(300);
    expect(WORD_ADVENTURE_RUNTIME_SECONDS).toBeLessThanOrEqual(420);
    expect(WORD_ADVENTURE.scenes).toHaveLength(42);
    expect(WORD_ADVENTURE.scenes.reduce((total, scene) => total + scene.durationMs, 0)).toBe(WORD_ADVENTURE.durationMs);
  });

  it('covers every promised English learning area', () => {
    const script = WORD_ADVENTURE.scenes.map(scene => `${scene.dialogue} ${scene.subtitle}`).join(' ').toLowerCase();
    for (const term of ['sounds', 'spelling', 'rhyme', 'capital letter', 'punctuation', 'noun', 'verb', 'adjective', 'curious', 'comprehension', 'story']) expect(script).toContain(term);
  });

  it('has checked multiple-choice questions with exactly one correct answer', () => {
    expect(WORD_ADVENTURE_QUESTIONS).toHaveLength(10);
    for (const scene of WORD_ADVENTURE_QUESTIONS) {
      expect(scene.question.prompt).toBeTruthy();
      expect(scene.question.choices.filter(choice => choice.correct)).toHaveLength(1);
      expect(scene.question.answerExplanation).toBeTruthy();
    }
  });

  it('keeps all answers accurate', () => {
    expect(WORD_ADVENTURE_QUESTIONS.map(scene => scene.question.choices.find(choice => choice.correct)?.label)).toEqual([
      'kite', 'ship', 'ai', 'kite', 'The fox ran home.', 'A question mark (?)', 'fluffy', 'very big', 'She watered it and put it in sunlight.', 'The fox ran home and shared the apple.',
    ]);
  });
});
