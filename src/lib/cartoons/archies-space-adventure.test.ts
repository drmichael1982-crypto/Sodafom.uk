import { describe, expect, it } from 'vitest';
import {
  countNarrationWords,
  estimateEpisodeSeconds,
  SPACE_ADVENTURE,
  SPACE_FACTS_COVERED,
} from './archies-space-adventure';

describe("Archie's Space Adventure script", () => {
  it('is a complete 5–7 minute narrated episode, not a short placeholder', () => {
    expect(SPACE_ADVENTURE.scenes).toHaveLength(22);
    expect(countNarrationWords()).toBeGreaterThanOrEqual(750);
    expect(estimateEpisodeSeconds()).toBeGreaterThanOrEqual(300);
    expect(estimateEpisodeSeconds()).toBeLessThanOrEqual(420);
  });

  it('covers the requested child-friendly space topics accurately', () => {
    expect(SPACE_FACTS_COVERED.join(' ')).toMatch(/Rockets/);
    expect(SPACE_FACTS_COVERED.join(' ')).toMatch(/Earth/);
    expect(SPACE_FACTS_COVERED.join(' ')).toMatch(/Moon/);
    expect(SPACE_FACTS_COVERED.join(' ')).toMatch(/Sun/);
    expect(SPACE_FACTS_COVERED.join(' ')).toMatch(/eight planets/);
    expect(SPACE_FACTS_COVERED.join(' ')).toMatch(/Gravity/);
    expect(SPACE_FACTS_COVERED.join(' ')).toMatch(/International Space Station/);
  });

  it('weaves in answerable questions with correct answers', () => {
    const questions = SPACE_ADVENTURE.scenes.filter(scene => scene.question).map(scene => scene.question!);
    expect(questions).toHaveLength(3);
    expect(questions.map(question => question.choices[question.answerIndex])).toEqual([
      'The Sun',
      'Eight',
      'International Space Station',
    ]);
  });
});
