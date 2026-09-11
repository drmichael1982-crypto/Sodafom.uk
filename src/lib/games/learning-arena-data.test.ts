import { describe, expect, it } from 'vitest';

import {
  getLearningArenaQuestion,
  learningArenaActionSucceeds,
  learningArenaConfigs,
} from './learning-arena-data';

describe('learning arena games', () => {
  it('defines eight complete, uniquely routed games', () => {
    const configs = Object.values(learningArenaConfigs);
    expect(configs).toHaveLength(8);
    expect(new Set(configs.map((config) => config.slug)).size).toBe(8);
    expect(configs.every((config) => config.targets.length === 6)).toBe(true);
  });

  it.each(Object.keys(learningArenaConfigs))('%s supplies valid questions at every level', (slug) => {
    for (let level = 1; level <= 5; level += 1) {
      for (let round = 0; round < 8; round += 1) {
        const question = getLearningArenaQuestion(slug, round, level);
        expect(question.prompt.length).toBeGreaterThan(8);
        expect(question.options).toContain(question.answer);
        expect(new Set(question.options).size).toBe(question.options.length);
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(question.explanation.length).toBeGreaterThan(5);
      }
    }
  });

  it('makes action outcomes deterministic and gives every game successful targets', () => {
    for (const slug of Object.keys(learningArenaConfigs)) {
      const firstRun = Array.from({ length: 6 }, (_, index) => learningArenaActionSucceeds(slug, 0, index));
      const secondRun = Array.from({ length: 6 }, (_, index) => learningArenaActionSucceeds(slug, 0, index));
      expect(firstRun).toEqual(secondRun);
      expect(firstRun).toContain(true);
    }
  });
});
