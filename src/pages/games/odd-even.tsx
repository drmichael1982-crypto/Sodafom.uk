import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Is 4 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 7 odd or even?', options: ['odd','even'], answer: 'odd' },
  { question: 'Is 10 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 13 odd or even?', options: ['odd','even'], answer: 'odd' },
  { question: 'Is 20 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 15 odd or even?', options: ['odd','even'], answer: 'odd' },
  { question: 'Is 8 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 11 odd or even?', options: ['odd','even'], answer: 'odd' },
  { question: 'Is 6 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 9 odd or even?', options: ['odd','even'], answer: 'odd' },
  { question: 'Is 2 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 17 odd or even?', options: ['odd','even'], answer: 'odd' },
];
const L2: QuizQuestion[] = [
  { question: 'Is 124 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 357 odd or even?', options: ['odd','even'], answer: 'odd' },
  { question: 'Is 1000 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 999 odd or even?', options: ['odd','even'], answer: 'odd' },
  { question: 'Even + Even = ?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'Odd + Odd = ?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'Even + Odd = ?', options: ['odd','even','sometimes even','sometimes odd'], answer: 'odd' },
  { question: 'Even × Even = ?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'Odd × Odd = ?', options: ['odd','even','sometimes even','sometimes odd'], answer: 'odd' },
  { question: 'Even × Odd = ?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'Is 2,468 odd or even?', options: ['even','odd'], answer: 'even' },
  { question: 'Is 13,579 odd or even?', options: ['odd','even'], answer: 'odd' },
];
const L3: QuizQuestion[] = [
  { question: 'Which of these is always even?', options: ['2n','2n+1','n²','n+1'], answer: '2n' },
  { question: 'Which of these is always odd?', options: ['2n+1','2n','n²','n+2'], answer: '2n+1' },
  { question: 'If n is even, is n² odd or even?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'If n is odd, is n² odd or even?', options: ['odd','even','sometimes even','sometimes odd'], answer: 'odd' },
  { question: 'If n is even, is n+1 odd or even?', options: ['odd','even','sometimes even','sometimes odd'], answer: 'odd' },
  { question: 'If n is odd, is 2n odd or even?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'If n is even, is n³ odd or even?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'If n is odd, is n+n odd or even?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'Prove: even + even = even. Which shows this?', options: ['2m + 2n = 2(m+n)','2m + 2n = 4mn','2m + 2n = 2m+n','2m + 2n = m+n'], answer: '2m + 2n = 2(m+n)' },
  { question: 'Prove: odd × odd = odd. Which shows this?', options: ['(2m+1)(2n+1) = 2(2mn+m+n)+1','(2m+1)(2n+1) = 4mn+1','(2m+1)(2n+1) = 2mn+1','(2m+1)(2n+1) = 4mn+2'], answer: '(2m+1)(2n+1) = 2(2mn+m+n)+1' },
  { question: 'If n is odd, is n(n+1) odd or even?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
  { question: 'If n is even, is n(n-1) odd or even?', options: ['even','odd','sometimes even','sometimes odd'], answer: 'even' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'odd-even',
  title: 'Odd & Even',
  emoji: '🔢',
  subject: 'maths',
  ageGroups: ['5–7', '8–10'],
  description: 'Sort numbers into odd and even — and discover the rules!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
