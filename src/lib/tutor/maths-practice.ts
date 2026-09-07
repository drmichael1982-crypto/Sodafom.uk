import type { LessonQuestion, TopicLesson } from './curriculum';

function q(id: string, question: string, answer: number | string, hint: string, explanation: string, difficulty: 1 | 2 | 3 = 1): LessonQuestion {
  const a = String(answer);
  return {
    id,
    question,
    answer: a,
    alternateAnswers: [],
    hint,
    explanation,
    simplerExplanation: explanation,
    difficulty,
  };
}

export function buildMathsPracticeLesson(ageGroup: '5-7' | '8-10' | '11-13'): TopicLesson {
  const questions: LessonQuestion[] = [];

  if (ageGroup === '5-7') {
    for (let i = 1; i <= 10; i++) questions.push(q(`m-add-${i}`, `What is ${i + 3} + ${i + 2}?`, (i + 3) + (i + 2), 'Count on carefully.', 'Add the two numbers together.'));
    for (let i = 1; i <= 10; i++) questions.push(q(`m-sub-${i}`, `What is ${i + 12} - ${i}?`, 12, 'Count backwards.', 'Subtract the smaller number from the larger number.'));
    for (let i = 1; i <= 10; i++) questions.push(q(`m-dbl-${i}`, `What is double ${i}?`, i * 2, 'Double means add the number to itself.', `${i} + ${i} = ${i * 2}.`));
  } else if (ageGroup === '8-10') {
    for (let i = 2; i <= 11; i++) questions.push(q(`m-times-${i}`, `What is ${i} × ${i + 1}?`, i * (i + 1), 'Use your times-table facts.', `${i} multiplied by ${i + 1} is ${i * (i + 1)}.`, 1));
    for (let i = 2; i <= 11; i++) questions.push(q(`m-div-${i}`, `What is ${i * 6} ÷ 6?`, i, 'Division is the inverse of multiplication.', `${i * 6} divided by 6 is ${i}.`, 1));
    const fractionData = [[20,2],[24,4],[30,5],[36,6],[40,8]] as const;
    fractionData.forEach(([whole, den], idx) => questions.push(q(`m-frac-${idx}`, `What is 1/${den} of ${whole}?`, whole / den, `Divide ${whole} by ${den}.`, `${whole} ÷ ${den} = ${whole / den}.`, 2)));
    [40,60,80,120,200].forEach((whole, idx) => questions.push(q(`m-pct-${idx}`, `What is 50% of ${whole}?`, whole / 2, '50% means one half.', `Half of ${whole} is ${whole / 2}.`, 2)));
  } else {
    for (let i = 3; i <= 12; i++) questions.push(q(`m-alg-${i}`, `If x + ${i} = ${i * 3}, what is x?`, i * 2, `Undo +${i} by subtracting ${i}.`, `${i * 3} - ${i} = ${i * 2}.`, 2));
    for (let i = 2; i <= 11; i++) questions.push(q(`m-square-${i}`, `What is ${i} squared?`, i * i, 'Squared means multiply the number by itself.', `${i} × ${i} = ${i * i}.`, 2));
    [120,160,240,360,480].forEach((whole, idx) => questions.push(q(`m-pct25-${idx}`, `What is 25% of ${whole}?`, whole / 4, '25% is one quarter.', `${whole} ÷ 4 = ${whole / 4}.`, 2)));
    [30,45,60,75,90].forEach((n, idx) => questions.push(q(`m-ratio-${idx}`, `Simplify the ratio ${n}:${n * 2}.`, '1:2', `Divide both parts by ${n}.`, `${n}:${n * 2} simplifies to 1:2.`, 3)));
  }

  return {
    id: `maths-practice-${ageGroup}`,
    subject: 'Maths',
    topic: 'mixed maths practice',
    ageGroup,
    title: 'Mixed Maths Practice',
    explanation: 'We will practise a mixture of number skills and build up step by step.',
    simplerExplanation: 'One maths question at a time. Take your time and use the hint if you need it.',
    examples: ['Work carefully and check each answer.'],
    questions,
  };
}
