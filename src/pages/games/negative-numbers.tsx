import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is -3 + 5?', options: ['2','1','3','-2'], answer: '2' },
  { question: 'What is -5 + 3?', options: ['-2','-1','-3','2'], answer: '-2' },
  { question: 'What is -4 + 4?', options: ['0','-1','1','-4'], answer: '0' },
  { question: 'What is -2 + 7?', options: ['5','4','6','3'], answer: '5' },
  { question: 'What is -6 + 2?', options: ['-4','-3','-5','-2'], answer: '-4' },
  { question: 'What is -1 + 8?', options: ['7','6','8','5'], answer: '7' },
  { question: 'What is -3 - 2?', options: ['-5','-4','-6','-3'], answer: '-5' },
  { question: 'What is -4 - 3?', options: ['-7','-6','-8','-5'], answer: '-7' },
  { question: 'What is -2 - 5?', options: ['-7','-6','-8','-5'], answer: '-7' },
  { question: 'What is 3 - 7?', options: ['-4','-3','-5','-2'], answer: '-4' },
  { question: 'What is 5 - 9?', options: ['-4','-3','-5','-2'], answer: '-4' },
  { question: 'What is 2 - 8?', options: ['-6','-5','-7','-4'], answer: '-6' },
];
const L2: QuizQuestion[] = [
  { question: 'What is -8 + 3?', options: ['-5','-4','-6','-3'], answer: '-5' },
  { question: 'What is -12 + 7?', options: ['-5','-4','-6','-3'], answer: '-5' },
  { question: 'What is -15 + 20?', options: ['5','4','6','3'], answer: '5' },
  { question: 'What is -9 - 6?', options: ['-15','-14','-16','-13'], answer: '-15' },
  { question: 'What is -3 × 4?', options: ['-12','-8','-16','-10'], answer: '-12' },
  { question: 'What is -5 × -3?', options: ['15','12','18','10'], answer: '15' },
  { question: 'What is -20 ÷ 4?', options: ['-5','-4','-6','-3'], answer: '-5' },
  { question: 'What is -18 ÷ -3?', options: ['6','5','7','4'], answer: '6' },
  { question: 'What is -7 + -4?', options: ['-11','-10','-12','-9'], answer: '-11' },
  { question: 'What is -6 - -4?', options: ['-2','-1','-3','-4'], answer: '-2' },
  { question: 'What is -4 × -4?', options: ['16','12','20','8'], answer: '16' },
  { question: 'What is -24 ÷ -6?', options: ['4','3','5','2'], answer: '4' },
];
const L3: QuizQuestion[] = [
  { question: 'What is -3² ?', options: ['-9','9','-6','6'], answer: '-9' },
  { question: 'What is (-3)² ?', options: ['9','-9','6','-6'], answer: '9' },
  { question: 'What is -2³ ?', options: ['-8','8','-6','6'], answer: '-8' },
  { question: 'What is (-2)³ ?', options: ['-8','8','-6','6'], answer: '-8' },
  { question: 'Solve: -3x = 15', options: ['-5','5','-3','3'], answer: '-5' },
  { question: 'Solve: x + (-7) = -3', options: ['4','3','5','2'], answer: '4' },
  { question: 'What is -5 × 3 + 20?', options: ['5','4','6','3'], answer: '5' },
  { question: 'What is -4² + 3²?', options: ['-7','7','25','-25'], answer: '-7' },
  { question: 'Solve: -2x + 6 = 12', options: ['-3','3','-6','6'], answer: '-3' },
  { question: 'What is (-2)⁴?', options: ['16','-16','8','-8'], answer: '16' },
  { question: 'What is -3 × (-2) × (-4)?', options: ['-24','24','-12','12'], answer: '-24' },
  { question: 'Solve: x² = 25', options: ['x=5 or x=-5','x=5','x=-5','x=25'], answer: 'x=5 or x=-5' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'negative-numbers',
  title: 'Negative Numbers',
  emoji: '❄️',
  subject: 'maths',
  ageGroups: ['9–11', '12–13'],
  description: 'Master negative numbers — adding, subtracting, multiplying and dividing!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
