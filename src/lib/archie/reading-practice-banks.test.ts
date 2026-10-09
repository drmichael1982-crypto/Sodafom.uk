import { describe, expect, it } from 'vitest';
import { POETRY_DISCOVERY_BANKS, READING_COMPREHENSION_BANKS, READING_FLUENCY_BANKS } from './reading-practice-banks';

const normalise = (text: string) => text.trim().toLowerCase().replace(/[.!?]+$/, '');
const find = (banks: typeof READING_COMPREHENSION_BANKS, text: string) => {
  const question = banks.flat().find(item => item.question.includes(text));
  expect(question, `Missing passage ${text}`).toBeDefined();
  return question!;
};

describe('reading practice subject integrity', () => {
  it('keeps ten usable, distinct passage questions per level with one selectable answer and a method hint', () => {
    for (const banks of [READING_COMPREHENSION_BANKS, READING_FLUENCY_BANKS, POETRY_DISCOVERY_BANKS]) {
      for (const bank of banks) {
        expect(bank).toHaveLength(10);
        expect(new Set(bank.map(item => item.question)).size).toBe(10);
        for (const item of bank) {
          expect(item.question).toMatch(/^Read: “.+” .+\?$/);
          expect(item.options.filter(option => normalise(option) === normalise(item.answer))).toHaveLength(1);
          expect(new Set(item.options.map(normalise)).size).toBe(item.options.length);
          expect(item.options.length).toBeGreaterThanOrEqual(3);
          expect(item.hint?.length).toBeGreaterThan(15);
        }
      }
    }
    expect(READING_COMPREHENSION_BANKS).toHaveLength(5);
    expect(READING_FLUENCY_BANKS).toHaveLength(5);
  });
  it('never turns the reading activity into calculation or adult linguistic theory at higher levels', () => {
    const text = JSON.stringify([READING_COMPREHENSION_BANKS, READING_FLUENCY_BANKS, POETRY_DISCOVERY_BANKS]);
    expect(text).not.toMatch(/differentiat|integrat(?:e|ion)|det\(|sin\(|log₂|e\^x|compound interest|factorise|metafunction|Grice|Halliday|synecdoche|objective correlative|negative capability|\bsolve\s*:/i);
  });
  it('retrieves facts and event order from the supplied passages rather than requiring arithmetic', () => {
    expect(find(READING_COMPREHENSION_BANKS, 'Mina put her red hat').answer).toBe('Beside the door');
    expect(find(READING_COMPREHENSION_BANKS, 'First the class planted seeds').answer).toBe('Green shoots appeared');
    expect(find(READING_COMPREHENSION_BANKS, 'outdoor concert').answer).toBe('In the garden');
  });
  it('grounds inference and evidence questions in the passage without claiming missing information', () => {
    const kindness = find(READING_COMPREHENSION_BANKS, 'last biscuit');
    expect(kindness.question).toContain('she had been looking forward to it');
    expect(kindness.answer).toBe('She gives up something she wanted');
    expect(find(READING_COMPREHENSION_BANKS, 'Neither report describes the sports field').answer).toBe('Different parts of the site can be affected differently by rain');
    expect(find(READING_COMPREHENSION_BANKS, 'no comments from other visitors').answer).toBe('The article includes some views, but not every visitor’s view');
  });
  it('supports accurate, expressive rereading without requiring universal rising intonation or a speed score', () => {
    expect(find(READING_FLUENCY_BANKS, '“hoped” instead of “hopped”').answer).toBe('Check the letters and reread the sentence');
    expect(find(READING_FLUENCY_BANKS, '“Is that our train?”').answer).toBe('Its meaning and Mum’s uncertainty');
    expect(find(READING_FLUENCY_BANKS, '“I did not say it was your fault,”').answer).toBe('Keep “not” clear and use a gentle tone');
    for (const item of READING_FLUENCY_BANKS.flat()) expect(item.answer).not.toMatch(/as fast as possible|speed record|every question.*rising|guess.*first letter/i);
  });
  it('uses actual supplied poetic images and distinguishes a fictional speaker from the poet', () => {
    expect(find(POETRY_DISCOVERY_BANKS, 'A puddle holds a patch of sky').answer).toBe('The sky reflected in the puddle');
    expect(find(POETRY_DISCOVERY_BANKS, 'Text A:').answer).toBe('A is a metaphor; B is a simile using “like”');
    expect(find(POETRY_DISCOVERY_BANKS, 'I am a fox beneath the stars').answer).toBe('An imagined fox speaker');
  });
});
