import { describe, it, expect, beforeEach } from 'vitest';
import { ROUND_LENGTH, selectRound, nextRound, roundResult } from './ten-question-round';
import { coinRound, numberBondRound, numberOptions } from './maths-round-data';
import { FRACTION_SETS } from './fraction-round-data';
import { MONEY_QUESTIONS } from './money-round-data';
import { PATTERN_QUESTIONS, patternRound } from './pattern-round-data';
import { shapeBank, shapeRound } from './shape-round-data';
import { getLearningArenaQuestion } from './learning-arena-data';
import { ageToDifficulty } from '@/hooks/useChildAge';

beforeEach(() => localStorage.clear());
const unique = <T,>(items: T[], key: (q: T) => string) => {
  expect(items).toHaveLength(ROUND_LENGTH);
  expect(new Set(items.map(key)).size).toBe(ROUND_LENGTH);
};
describe('ten-question maths content', () => {
  it('rejects insufficient banks and fills exhausted rounds without repeating a question', () => {
    expect(() => selectRound([1,2], String)).toThrow();
    const bank = Array.from({length: 23}, (_, i) => i);
    const first = nextRound(bank, String, 'test');
    const second = nextRound(bank, String, 'test');
    unique(first, String); unique(second, String);
    expect(second.some(q => first.includes(q))).toBe(false);
    const remaining = bank.filter(q => !first.includes(q) && !second.includes(q));
    const third = nextRound(bank, String, 'test');
    unique(third, String);
    remaining.forEach(q => expect(third).toContain(q));
  });
  it('reports exact scores for zero, partial and perfect ten-question rounds', () => {
    for (let correct = 0; correct <= 10; correct++) expect(roundResult(correct)).toMatchObject({correct, total: 10, score: correct * 10});
  });
  it.each([1,2,3,4,5])('generates unique valid UK purses at level %i', level => {
    const round = coinRound(level);
    unique(round, q => q.map(c => `${c.coin.value}:${c.count}`).join('|'));
    for (const purse of round) {
      expect(new Set(purse.map(c => c.coin.value)).size).toBe(purse.length);
      const total = purse.reduce((sum, c) => sum + c.coin.value * c.count, 0);
      const options = numberOptions(total);
      expect(options).toHaveLength(4); expect(new Set(options).size).toBe(4); expect(options).toContain(total);
      purse.forEach(c => { expect([1,2,5,10,20,50,100,200]).toContain(c.coin.value); expect(c.count).toBeGreaterThan(0); });
    }
  });
  it.each([10,20] as const)('includes zero bonds and generates ten unique bonds to %i', target => {
    const round = numberBondRound(target); unique(round, q => String(q.given));
    round.forEach(q => { expect(q.given + q.answer).toBe(target); expect(q.choices).toContain(q.answer); });
  });
  it.each(['Easy','Medium','Hard'] as const)('%s fractions use exact slice counts and ten unique representations', difficulty => {
    const bank = FRACTION_SETS[difficulty];
    unique(selectRound(bank, q => q.label), q => q.label);
    bank.forEach(q => { expect(q.fill / q.slices).toBe(q.numerator / q.denominator); expect(q.fill).toBeGreaterThanOrEqual(0); expect(q.fill).toBeLessThanOrEqual(q.slices); });
  });
  it.each(['easy','medium','hard'] as const)('Money Maths %s has ten unique tasks with valid answer choices', difficulty => {
    const bank = MONEY_QUESTIONS.filter(q => q.difficulty === difficulty);
    unique(selectRound(bank, q => q.question + q.visual), q => q.question + q.visual);
    bank.forEach(q => { expect(q.choices).toContain(q.answer); expect(new Set(q.choices).size).toBe(4); });
    const generated = bank.slice(5);
    const pence = (s: string) => s.trim().startsWith('£') ? Math.round(Number(s.trim().slice(1)) * 100) : Number(s.trim().replace('p',''));
    generated.forEach(q => {
      const values = q.visual.split(/ [−+] /).map(pence);
      const total = difficulty === 'easy' ? values.reduce((a,b) => a+b, 0) : values.slice(1).reduce((a,b) => a-b, values[0]);
      expect(pence(q.answer)).toBe(total);
    });
  });
  it.each(['4-6','7-9','10-13'] as const)('patterns preserve the explicit %s age bank and unique choices', age => {
    const round = patternRound(age); unique(round, q => JSON.stringify(q.sequence));
    round.forEach(q => { expect(q.ageGroup).toBe(age); expect(q.options.map(item => JSON.stringify(item))).toContain(JSON.stringify(q.answer)); expect(new Set(q.options.map(item => JSON.stringify(item))).size).toBe(4); });
    PATTERN_QUESTIONS.filter(q => q.id.startsWith('medium-') || q.id.startsWith('hard-')).forEach(q => {
      const sequence = q.sequence.slice(0,-1).map(Number); const answer = Number(q.answer);
      if (q.id.startsWith('medium-')) expect(answer - sequence[3]).toBe(sequence[1] - sequence[0]);
      else expect(Math.sqrt(answer)).toBe(Math.sqrt(sequence[3]) + 1);
    });
  });
  it.each([1,2,3] as const)('shape tier %i draws ten different tasks without 3D sides or ambiguous 3D naming', tier => {
    unique(shapeRound(tier), q => q.shape.name + q.question);
    shapeBank(tier).forEach(q => { expect(q.options).toContain(q.answer); expect(new Set(q.options).size).toBe(q.options.length); if (q.shape.type === '3D') { expect(q.question).not.toContain('straight sides'); expect(q.question).not.toBe('What shape is this?'); } });
    const faces = shapeBank(3).filter(q => q.question.includes('flat faces'));
    expect(faces.find(q => q.shape.name === 'Sphere')?.answer).toBe('0');
    expect(faces.find(q => q.shape.name === 'Cylinder')?.answer).toBe('2');
    expect(faces.find(q => q.shape.name === 'Cone')?.answer).toBe('1');
  });
  it.each([1,2,3,4,5])('Shopkeeper level %i has forty unique mathematically correct changes', level => {
    const bank = Array.from({length:40}, (_, n) => getLearningArenaQuestion('shopkeeper-change',n,level));
    expect(new Set(bank.map(q => q.prompt)).size).toBe(40);
    const pence = (s: string) => s.startsWith('£') ? Math.round(Number(s.slice(1))*100) : Number(s.slice(0,-1));
    bank.forEach(q => { const amounts = q.prompt.match(/£\d+\.\d{2}|\d+p/g)!; expect(pence(q.answer)).toBe(pence(amounts[1])-pence(amounts[0])); expect(q.options).toContain(q.answer); });
  });
  it('maps the oldest supported age band to the hardest tier', () => {
    expect(ageToDifficulty('5-7')).toBe(1); expect(ageToDifficulty('8-10')).toBe(2); expect(ageToDifficulty('11-13')).toBe(3);
  });
});
