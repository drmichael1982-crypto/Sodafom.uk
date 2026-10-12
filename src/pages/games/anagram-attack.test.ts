import { describe, expect, it } from 'vitest';
import { ANAGRAM_QUESTION_BANKS } from './anagram-attack';

const letters = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '').split('').sort().join('');

describe('Anagram Attack question banks', () => {
  it('contains answerable prompts with one visible correct answer and unique options', () => {
    for (const [levelIndex, bank] of ANAGRAM_QUESTION_BANKS.entries()) {
      expect(bank, `level ${levelIndex + 1}`).toHaveLength(12);
      for (const item of bank) {
        const scrambled = item.question.match(/^Unscramble: ([A-Z]+)/)?.[1];
        expect(scrambled, item.question).toBeTruthy();
        expect(letters(scrambled ?? ''), item.question).toBe(letters(item.answer));
        expect(item.options, item.question).toHaveLength(4);
        expect(new Set(item.options).size, item.question).toBe(4);
        expect(item.options, item.question).toContain(item.answer);
      }
    }
  });
});
