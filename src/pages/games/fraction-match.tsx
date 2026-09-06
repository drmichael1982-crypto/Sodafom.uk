import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is 1/2 of 10?', options: ['5','2','4','6'], answer: '5' },
  { question: 'What is 1/4 of 12?', options: ['3','4','6','2'], answer: '3' },
  { question: 'What is 1/3 of 9?', options: ['3','2','4','6'], answer: '3' },
  { question: 'What is 1/2 of 8?', options: ['4','2','6','3'], answer: '4' },
  { question: 'What is 1/4 of 8?', options: ['2','4','1','3'], answer: '2' },
  { question: 'What is 1/3 of 12?', options: ['4','3','6','2'], answer: '4' },
  { question: 'What is 1/2 of 20?', options: ['10','5','15','8'], answer: '10' },
  { question: 'What is 1/4 of 20?', options: ['5','4','10','2'], answer: '5' },
  { question: 'What is 1/5 of 15?', options: ['3','5','2','4'], answer: '3' },
  { question: 'What is 1/2 of 14?', options: ['7','6','8','5'], answer: '7' },
  { question: 'What is 1/3 of 15?', options: ['5','3','6','4'], answer: '5' },
  { question: 'What is 1/4 of 16?', options: ['4','3','5','2'], answer: '4' },
];
const L2: QuizQuestion[] = [
  { question: 'What is 3/4 of 20?', options: ['15','10','12','18'], answer: '15' },
  { question: 'What is 2/3 of 18?', options: ['12','9','15','6'], answer: '12' },
  { question: 'What is 3/5 of 25?', options: ['15','10','20','12'], answer: '15' },
  { question: 'What fraction is equivalent to 2/4?', options: ['1/2','1/3','3/4','2/3'], answer: '1/2' },
  { question: 'What fraction is equivalent to 3/9?', options: ['1/3','1/2','2/3','1/4'], answer: '1/3' },
  { question: 'What fraction is equivalent to 4/8?', options: ['1/2','1/4','3/4','2/3'], answer: '1/2' },
  { question: 'What is 2/5 of 30?', options: ['12','10','15','18'], answer: '12' },
  { question: 'What is 3/4 of 40?', options: ['30','20','35','25'], answer: '30' },
  { question: 'What fraction is equivalent to 6/9?', options: ['2/3','1/3','3/4','1/2'], answer: '2/3' },
  { question: 'What is 5/6 of 24?', options: ['20','18','22','16'], answer: '20' },
  { question: 'What fraction is equivalent to 8/12?', options: ['2/3','1/3','3/4','1/2'], answer: '2/3' },
  { question: 'What is 4/5 of 35?', options: ['28','21','35','24'], answer: '28' },
];
const L3: QuizQuestion[] = [
  { question: '1/2 + 1/4 = ?', options: ['3/4','2/6','1/6','2/4'], answer: '3/4' },
  { question: '2/3 + 1/6 = ?', options: ['5/6','3/9','1/2','3/6'], answer: '5/6' },
  { question: '3/4 - 1/8 = ?', options: ['5/8','2/4','1/4','6/8'], answer: '5/8' },
  { question: '1/3 × 3 = ?', options: ['1','3/9','1/9','3/3'], answer: '1' },
  { question: '2/5 × 5 = ?', options: ['2','10/25','2/25','10/5'], answer: '2' },
  { question: '3/4 ÷ 3 = ?', options: ['1/4','9/4','3/12','1/3'], answer: '1/4' },
  { question: '1/2 + 1/3 = ?', options: ['5/6','2/5','2/6','3/5'], answer: '5/6' },
  { question: '3/5 - 1/10 = ?', options: ['5/10','2/5','4/10','1/2'], answer: '5/10' },
  { question: '2/3 × 3/4 = ?', options: ['1/2','6/12','5/12','6/7'], answer: '1/2' },
  { question: '3/4 ÷ 1/2 = ?', options: ['3/2','3/8','6/4','1/2'], answer: '3/2' },
  { question: '5/6 - 1/3 = ?', options: ['1/2','4/3','4/6','1/6'], answer: '1/2' },
  { question: '2/3 + 3/4 = ?', options: ['17/12','5/7','5/12','6/7'], answer: '17/12' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'fraction-match',
  title: 'Fraction Match',
  emoji: '🍕',
  subject: 'maths',
  ageGroups: ['8–10', '11–13'],
  description: 'Match equivalent fractions and solve fraction problems!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
