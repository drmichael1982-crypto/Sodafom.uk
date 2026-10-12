import { expect, it } from 'vitest';
import { tryLocalMaths } from '../archie-local';
it('answers homework fractions and percentages with question punctuation locally',()=>{
  expect(tryLocalMaths('What is half of 12?')?.text).toMatch(/half of 12 is 6/i);
  expect(tryLocalMaths('What is 25% of 40?')?.text).toMatch(/is 10/);
});
