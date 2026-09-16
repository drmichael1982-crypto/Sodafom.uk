import { describe, expect, it } from 'vitest';
import { buildCurriculumYear, buildDailyCurriculumLesson, type CurriculumAgeGroup } from './curriculum-year-plan';

const ages: CurriculumAgeGroup[] = ['5-7', '8-10', '11-13'];
const planningLanguage = /learning goal matches|which word belongs|curriculum-informed focus|spiral challenge|Explain, apply and compare|linked steps and independent examples|Archie model: say what you notice|strategy matches/i;

describe('child-facing Maths lessons', () => {
  it.each([
    // Independent expected answers for the first question of each scheduled
    // strand, in youngest / middle / oldest age order.
    [1, ['11', '10', '0.1']],
    [6, ['8', '14', '-1']],
    [11, ['1', '6', '6']],
    [16, ['8', '195', '250']],
    [21, ['3', '18', '95']],
    [26, ['13', '17', '13']],
    [31, ['7', '18', '10']],
    [36, ['5', '11', '40']],
  ] as const)('teaches and marks actual Maths on day %i at each age', (day, answers) => {
    ages.forEach((ageGroup, index) => {
      const lesson = buildDailyCurriculumLesson({ subject: 'Maths', ageGroup, day });
      expect(lesson.questions[0].answer).toBe(answers[index]);
      expect(lesson.examples.join(' ')).toMatch(/\d/);
      expect(lesson.explanation).not.toMatch(planningLanguage);
      expect(lesson.questions[0].question).not.toMatch(planningLanguage);
    });
  });

  it.each(ages)('keeps every %s daily practice question distinct and answerable', (ageGroup) => {
    for (const lesson of buildCurriculumYear('Maths', ageGroup)) {
      expect(lesson.questions).toHaveLength(10);
      expect(new Set(lesson.questions.map((question) => question.id)).size).toBe(10);
      expect(new Set(lesson.questions.map((question) => question.question)).size).toBe(10);
      const childText = [lesson.explanation, lesson.simplerExplanation, ...lesson.examples,
        ...lesson.lessonPhases.map((phase) => phase.activity),
        ...lesson.questions.flatMap((question) => [question.question, question.hint, question.explanation])].join(' ');
      expect(childText).not.toMatch(planningLanguage);
      for (const question of lesson.questions) {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.options!.filter((option) => option === question.answer)).toHaveLength(1);
        expect(question.options!.join(' ')).not.toMatch(/NaN|Infinity|undefined/);
        if (ageGroup === '5-7') {
          expect(question.question).not.toMatch(/percentage|ratio|mean|decimal|hundredths/);
          for (const option of question.options!) {
            if (/^-?\d/.test(option)) expect(Number(option)).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  it('checks every generated answer against the numbers and shape facts in its question', () => {
    const shapeAnswers: Record<string, string> = {
      'How many straight sides does a triangle have?': '3',
      'How many corners does a square have?': '4',
      'How many straight sides does a circle have?': '0',
      'How many corners does a triangle have?': '3',
      'How many straight sides does a rectangle have?': '4',
      'How many corners does a circle have?': '0',
      'Which shape has 3 straight sides?': 'Triangle',
      'Which shape has no corners?': 'Circle',
      'How many straight sides does a square have?': '4',
      'How many corners does a rectangle have?': '4',
    };
    let checked = 0;
    for (const ageGroup of ages) {
      for (const lesson of buildCurriculumYear('Maths', ageGroup)) {
        for (const question of lesson.questions) {
          const numbers = (question.question.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
          if (question.question in shapeAnswers) {
            expect(question.answer).toBe(shapeAnswers[question.question]);
          } else if (question.question.startsWith('What number is')) {
            expect(Number(question.answer)).toBe(numbers[0] * 10 + numbers[1]);
          } else if (question.question.startsWith('In ') && ageGroup === '8-10') {
            const value = question.question.includes('hundreds')
              ? Math.floor(numbers[0] / 100) * 100 : Math.floor(numbers[0] / 10) % 10 * 10;
            expect(Number(question.answer)).toBe(value);
          } else if (question.question.startsWith('In ') && ageGroup === '11-13') {
            const digits = question.question.match(/\d+\.(\d{2})/)![1];
            const value = question.question.includes('hundredths') ? Number(digits[1]) / 100 : Number(digits[0]) / 10;
            expect(Number(question.answer)).toBe(value);
          } else if (/^What is \d+ \+ \d+\?$/.test(question.question)) {
            expect(Number(question.answer)).toBe(numbers[0] + numbers[1]);
          } else if (question.question.startsWith('There are') && question.question.includes('marbles')) {
            expect(Number(question.answer)).toBe(numbers[0] * numbers[1]);
          } else if (question.question.startsWith('What is half of')) {
            expect(Number(question.answer)).toBe(numbers[0] / 2);
          } else if (question.question.startsWith('What is 3/4 of')) {
            expect(Number(question.answer)).toBe(numbers[2] / 4 * 3);
          } else if (question.question.startsWith('What is 15% of')) {
            expect(Number(question.answer)).toBe(numbers[1] / 100 * 15);
          } else if (question.question.startsWith('What is −')) {
            expect(Number(question.answer)).toBe(-numbers[0] + numbers[1]);
          } else if (question.question.startsWith('What is the mean of')) {
            expect(Number(question.answer)).toBe(numbers.reduce((sum, value) => sum + value, 0) / numbers.length);
          } else if (question.question.startsWith('Two inside angles')) {
            expect(Number(question.answer) + numbers[0] + numbers[1]).toBe(180);
          } else if (question.question.startsWith('A rectangle is')) {
            expect(Number(question.answer)).toBe(2 * numbers[0] + 2 * numbers[1]);
          } else if (question.question.startsWith('How many centimetres are in')) {
            expect(Number(question.answer)).toBeCloseTo(numbers[0] * 100);
          } else if (question.question.startsWith('Two ribbons are') || question.question.startsWith('Archie records')) {
            expect(Number(question.answer)).toBe(numbers[0] + numbers[1]);
          } else if (question.question.startsWith('How many minutes are in')) {
            expect(Number(question.answer)).toBe(numbers[0] * 60 + numbers[1]);
          } else if (question.question.startsWith('Each child chooses one fruit')) {
            expect(Number(question.answer)).toBe(numbers.reduce((sum, value) => sum + value, 0));
          } else if (question.question.startsWith('Add 2 each time')) {
            expect(Number(question.answer)).toBe(numbers[3] + numbers[0]);
          } else if (question.question.startsWith('□ +')) {
            expect(Number(question.answer)).toBe(numbers[1] - numbers[0]);
          } else if (question.question.startsWith('Archie has')) {
            expect(Number(question.answer)).toBe(numbers[0] + numbers[1] - numbers[2]);
          } else if (/^\d+ tickets cost/.test(question.question)) {
            expect(Number(question.answer)).toBe(numbers[0] * numbers[1] + numbers[2]);
          } else if (question.question.startsWith('Three books cost')) {
            expect(Number(question.answer)).toBe(numbers[0] * 3 * 0.8 + 4);
          } else if (question.question.startsWith('Red and blue beads')) {
            expect(Number(question.answer)).toBe(numbers[2] * numbers[0] / (numbers[0] + numbers[1]));
          } else {
            throw new Error(`Missing independent answer check: ${question.question}`);
          }
          checked += 1;
        }
      }
    }
    expect(checked).toBe(365 * 3 * 10);
  });

  it('varies the Maths start by age and day while retaining the duration plan', () => {
    const starts = ages.map((ageGroup) => buildDailyCurriculumLesson({ subject: 'Maths', ageGroup, day: 1 }));
    expect(new Set(starts.map((lesson) => lesson.explanation)).size).toBe(3);
    const tomorrow = buildDailyCurriculumLesson({ subject: 'Maths', ageGroup: '8-10', day: 2, durationMinutes: 15 });
    expect(tomorrow.questions[0].question).not.toBe(starts[1].questions[0].question);
    expect(tomorrow.lessonPhases.reduce((sum, phase) => sum + phase.minutes, 0)).toBe(15);
    expect(tomorrow.reviewStatus).toBe('curriculum-informed-teacher-review-required');
  });
});
