import { describe, expect, it, vi } from 'vitest';
import { generateCard } from './maths-bingo';

describe('Maths Bingo card generation', () => {
  it.each([1, 2, 3] as const)('creates a bounded unique card for tier %s with repeated random values', tier => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const card = generateCard(tier);
      expect(card).toHaveLength(tier === 1 ? 9 : 16);
      expect(new Set(card).size).toBe(card.length);
      expect(card.every(n => n >= 1 && n <= (tier === 1 ? 10 : tier === 2 ? 25 : 64))).toBe(true);
      expect(random.mock.calls.length).toBeLessThan(64);
    } finally { random.mockRestore(); }
  });
});
