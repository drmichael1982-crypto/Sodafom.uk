import { describe, expect, it } from 'vitest';
import { ARCHIES_AMAZING_SCIENCE_ADVENTURE, scienceAdventureRuntimeSeconds } from './archies-amazing-science-adventure';

describe("Archie's Amazing Science Adventure", () => {
  it('is a consistent five-to-seven-minute story', () => {
    expect(scienceAdventureRuntimeSeconds).toBe(375);
    expect(scienceAdventureRuntimeSeconds).toBe(ARCHIES_AMAZING_SCIENCE_ADVENTURE.runtimeSeconds);
    expect(ARCHIES_AMAZING_SCIENCE_ADVENTURE.scenes).toHaveLength(12);
  });

  it('covers the requested science learning areas', () => {
    const topics = ARCHIES_AMAZING_SCIENCE_ADVENTURE.scenes.flatMap((scene) => scene.topics).join(' ');
    ['solids', 'liquids', 'gases', 'forces', 'gravity', 'light', 'shadows', 'electricity', 'plants', 'animals', 'habitats', 'human body', 'safe simple experiments'].forEach((topic) => expect(topics).toContain(topic));
  });

  it('has one correct, kindly-explained answer for every pause-and-think question', () => {
    const questions = ARCHIES_AMAZING_SCIENCE_ADVENTURE.scenes.flatMap((scene) => scene.question ? [scene.question] : []);
    expect(questions).toHaveLength(4);
    questions.forEach((question) => {
      expect(question.choices.filter((choice) => choice.correct)).toHaveLength(1);
      expect(question.choices.every((choice) => choice.feedback.length > 25)).toBe(true);
    });
  });

  it('makes the safety boundaries explicit', () => {
    const words = ARCHIES_AMAZING_SCIENCE_ADVENTURE.scenes.map((scene) => `${scene.narration} ${scene.safety ?? ''}`).join(' ').toLowerCase();
    expect(words).toContain('never put anything into a socket');
    expect(words).toContain('never stare at the sun');
    expect(words).toContain('grown-up');
    expect(words).toContain('keep water away from electricity');
  });
});

