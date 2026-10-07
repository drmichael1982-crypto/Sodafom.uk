import { describe, expect, it, vi } from 'vitest';
import { generateCard } from './maths-bingo';

describe('Maths Bingo card generation', () => {
  it.each([1, 2, 3] as const)('creates a full unique card for tier %s with repeated random values', tier => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const card = generateCard(tier);
      expect(card).toHaveLength(16);
      expect(new Set(card).size).toBe(16);
      expect(card.every(n => n >= 1 && n <= (tier === 1 ? 20 : tier === 2 ? 25 : 64))).toBe(true);
      expect(random.mock.calls.length).toBeLessThan(64);
    } finally { random.mockRestore(); }
  });
});
