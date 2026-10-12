import { describe, expect, it } from 'vitest';
import { PERIMETER_LEVEL_3_QUESTIONS } from './perimeter-quest';

describe('Perimeter Quest compound shapes', () => {
  it('keeps the replacement edges in a rectangular corner cut-out', () => {
    const question = PERIMETER_LEVEL_3_QUESTIONS.find(item =>
      item.question.includes('10×6 rectangle with a 3×3 square removed from one corner'),
    );

    // Removing 3 cm from each of two outside edges adds the same two 3 cm
    // edges around the notch, so the original 2 × (10 + 6) perimeter remains.
    expect(question).toMatchObject({
      answer: '32 cm',
      options: expect.arrayContaining(['32 cm', '38 cm']),
    });
  });
});
