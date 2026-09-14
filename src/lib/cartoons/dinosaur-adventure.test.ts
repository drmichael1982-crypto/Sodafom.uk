import { describe, expect, it } from 'vitest';
import { DINOSAUR_ADVENTURE } from './dinosaur-adventure';
import { getEpisodeRuntimeSeconds } from './episode-contract';

describe("Archie's Dinosaur Adventure", () => {
  it('is a complete 5–7 minute episode with subtitles enabled', () => {
    expect(getEpisodeRuntimeSeconds(DINOSAUR_ADVENTURE)).toBe(360);
    expect(DINOSAUR_ADVENTURE.targetDurationSeconds).toBe(360);
    expect(DINOSAUR_ADVENTURE.subtitleDefault).toBe(true);
    expect(DINOSAUR_ADVENTURE.scenes).toHaveLength(18);
  });

  it('covers every promised dinosaur learning point', () => {
    const episodeText = DINOSAUR_ADVENTURE.scenes.map(scene => scene.title + ' ' + scene.dialogue + ' ' + scene.fact).join(' ').toLowerCase();
    for (const expectedFact of ['tyrannosaurus rex', 'triceratops', 'stegosaurus', 'sauropod', 'herbivore', 'carnivore', 'fossil', 'extinction']) {
      expect(episodeText).toContain(expectedFact);
    }
  });

  it('contains age-appropriate questions with valid answers', () => {
    const questions = DINOSAUR_ADVENTURE.scenes.flatMap(scene => scene.question ? [scene.question] : []);
    expect(questions).toHaveLength(3);
    for (const question of questions) {
      expect(question.choices).toContain(question.answer);
      expect(question.correctResponse).not.toEqual('');
    }
  });

  it('is ready to move to Agent 22’s reusable renderer when it lands', () => {
    expect(DINOSAUR_ADVENTURE.engine.preferredRenderer).toBe('SOD-CARTOON-ENGINE-22');
    expect(DINOSAUR_ADVENTURE.engine.integrationStatus).toBe('ready-for-agent-22-engine');
  });
});
