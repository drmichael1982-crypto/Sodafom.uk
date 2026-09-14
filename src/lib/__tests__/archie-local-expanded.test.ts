import { beforeEach, describe, expect, it, vi } from 'vitest';
import { safeEvaluateMath, tryLocalArchieResponse, tryLocalMaths, tryLocalSpelling } from '../archie-local';
import { clearActivePendingQuestion, tryLocalTutor } from '../tutor/engine';
import { loadLearnedAnswers, findLearnedAnswer, rememberOnlineAnswer, clearLearnedAnswers } from '../archie-device-memory';

beforeEach(() => { localStorage.clear(); clearActivePendingQuestion(); });
describe('bounded arithmetic and explanations', () => {
  it.each([
    ['2 + 3 * 4', 14], ['(2 + 3) * 4', 20], ['2^3^2', 512], ['-2^2', -4], ['(-2)^2', 4],
    ['2^-2', 0.25], ['sqrt(144)', 12], ['.5 + .25', 0.75],
  ])('%s respects arithmetic rules', (input, expected) => { expect(safeEvaluateMath(input)).toBe(expected); });
  it.each(['1..2 + 3', '1 / 0', '2 % 0', 'sqrt(-4)', '2^9999', '9007199254740992 + 1', 'globalThis.alert(1)', '1;2', '('.repeat(200) + '1' + ')'.repeat(200)])('rejects invalid/unsafe %s', input => { expect(safeEvaluateMath(input)).toBeNull(); });
  it.each([
    ['three subtracted from ten', '7.'], ['one hundred and twenty-three plus two', '125.'],
    ['two million times three', '6,000,000.'], ['2 million times three', '6,000,000.'],
    ['what is 25% of 80?', '20.'], ['what is 3/4 of 24?', '18.'], ['double twenty-one', '42.'],
    ['half of twelve', '6.'], ['what is one million times one million', '1,000,000,000,000.'],
  ])('%s gives an answer and a teaching step', (input, expected) => { const text = tryLocalMaths(input)?.text; expect(text).toContain(`is ${expected}`); expect(text!.split('. ').length).toBeGreaterThan(1); });
  it('labels rounded recurring decimals', () => { expect(tryLocalMaths('1 / 3')?.text).toContain('approximately'); });
  it('rejects ambiguous repeated number words', () => { expect(tryLocalMaths('one two plus three')).toBeNull(); });
  it('provides an older learner an inverse check', () => { expect(tryLocalArchieResponse('12 / 3', { age: 12 })?.text).toContain('Check by multiplying'); });
});
describe('curated vocabulary, facts and honest boundaries', () => {
  it('defines grammar accurately including abstract nouns', () => { expect(tryLocalArchieResponse('What is a noun?')?.text).toContain('idea'); });
  it('corrects a known spelling and does not spell the word THE', () => { expect(tryLocalSpelling('spell the word becuase')?.text).toContain('B, E, C, A, U, S, E'); });
  it('does not validate an unknown spelling', () => { expect(tryLocalSpelling('spell flibberty')?.text).toContain('not checked'); });
  it('answers a geography question locally', () => { expect(tryLocalArchieResponse('What continent is the UK in?')).toMatchObject({ intent: 'geography', text: 'The United Kingdom is in Europe.' }); });
  it('answers a planet question locally', () => { expect(tryLocalArchieResponse('Which planet is closest to the Sun?')?.text).toContain('Mercury'); });
  it('preserves an existing lesson request', () => { expect(tryLocalArchieResponse('teach me water cycle')?.text).toContain('Ready for a question?'); });
  it('does not turn an unsupported planet question into an eight-planets answer', () => { expect(tryLocalArchieResponse('How many planets are outside the solar system?')).toBeNull(); });
  it('does not pretend to answer arbitrary writing requests', () => { expect(tryLocalArchieResponse('Write a 5-paragraph creative story about a magical dragon visiting London')).toBeNull(); });
  it('does not mistake a sentence about feelings for a name', () => { expect(tryLocalArchieResponse('I am worried about my homework')).toBeNull(); });
});
describe('pending tutor answers', () => {
  it('routes a bare numeric answer to the lesson', () => { tryLocalTutor('quiz me on fractions'); expect(tryLocalArchieResponse('10')?.text).toContain('Spot on'); });
  it('does not mark a substring match correct', () => { tryLocalTutor('quiz me on fractions'); expect(tryLocalArchieResponse('100')?.text).toContain('Not quite'); });
  it('does not mark a negated answer correct', () => { tryLocalTutor('quiz me on geography'); expect(tryLocalArchieResponse('not Europe')?.text).toContain('Not quite'); });
  it('keeps name commands separate from grading', () => { tryLocalTutor('quiz me on fractions'); expect(tryLocalArchieResponse('my name is Sophie')?.text).toContain('Nice to meet you'); expect(tryLocalArchieResponse('10')?.text).toContain('Spot on'); });
  it('still teaches when optional progress storage is blocked', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked'); });
    try { expect(tryLocalArchieResponse('quiz me on fractions')?.text).toContain('practice'); expect(tryLocalArchieResponse('10')?.text).toContain('Spot on'); } finally { spy.mockRestore(); }
  });
  it('allows a natural answer wrapper', () => { tryLocalTutor('quiz me on fractions'); expect(tryLocalArchieResponse('The answer is ten.')?.text).toContain('Spot on'); });
});
describe('legacy online-answer cache disabled', () => {
  it('never reuses prior account/age answers or fuzzy matches and purges legacy data', () => {
    localStorage.setItem('sodafom_archie_learned_answers_v1', JSON.stringify([{ q: 'what is gravity', a: 'unvalidated prior child answer' }]));
    expect(findLearnedAnswer('what is gravity')).toBeNull();
    expect(loadLearnedAnswers()).toEqual([]);
    rememberOnlineAnswer('new question', 'new model output');
    expect(localStorage.getItem('sodafom_archie_learned_answers_v1')).toBeNull();
  });
  it('survives denied storage', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw Error('blocked'); });
    expect(() => clearLearnedAnswers()).not.toThrow(); expect(findLearnedAnswer('question')).toBeNull(); spy.mockRestore();
  });
});
