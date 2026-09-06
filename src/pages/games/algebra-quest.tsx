import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'If x + 3 = 7, what is x?', options: ['4','3','5','6'], answer: '4' },
  { question: 'If x + 5 = 9, what is x?', options: ['4','3','5','6'], answer: '4' },
  { question: 'If x - 2 = 5, what is x?', options: ['7','5','6','8'], answer: '7' },
  { question: 'If x - 4 = 3, what is x?', options: ['7','5','6','8'], answer: '7' },
  { question: 'If 2x = 8, what is x?', options: ['4','3','5','6'], answer: '4' },
  { question: 'If 3x = 9, what is x?', options: ['3','2','4','5'], answer: '3' },
  { question: 'If x + 1 = 6, what is x?', options: ['5','4','6','7'], answer: '5' },
  { question: 'If x - 1 = 4, what is x?', options: ['5','4','6','7'], answer: '5' },
  { question: 'If 2x = 10, what is x?', options: ['5','4','6','7'], answer: '5' },
  { question: 'If x + 2 = 8, what is x?', options: ['6','5','7','8'], answer: '6' },
  { question: 'If x - 3 = 4, what is x?', options: ['7','6','8','9'], answer: '7' },
  { question: 'If 4x = 12, what is x?', options: ['3','2','4','5'], answer: '3' },
];
const L2: QuizQuestion[] = [
  { question: 'If x + 5 = 12, what is x?', options: ['7','6','8','9'], answer: '7' },
  { question: 'If 3x = 18, what is x?', options: ['6','5','7','8'], answer: '6' },
  { question: 'If x - 4 = 9, what is x?', options: ['13','11','12','14'], answer: '13' },
  { question: 'If 2x + 1 = 11, what is x?', options: ['5','4','6','7'], answer: '5' },
  { question: 'If x/4 = 7, what is x?', options: ['28','21','32','35'], answer: '28' },
  { question: 'If 5x - 3 = 22, what is x?', options: ['5','4','6','7'], answer: '5' },
  { question: 'If x + 8 = 15, what is x?', options: ['7','6','8','9'], answer: '7' },
  { question: 'If 4x = 24, what is x?', options: ['6','5','7','8'], answer: '6' },
  { question: 'If x - 7 = 8, what is x?', options: ['15','13','14','16'], answer: '15' },
  { question: 'If 3x + 2 = 14, what is x?', options: ['4','3','5','6'], answer: '4' },
  { question: 'If x/3 = 6, what is x?', options: ['18','15','21','24'], answer: '18' },
  { question: 'If 6x - 4 = 26, what is x?', options: ['5','4','6','7'], answer: '5' },
];
const L3: QuizQuestion[] = [
  { question: 'Simplify: 3a + 2a', options: ['5a','5a²','6a','a⁵'], answer: '5a' },
  { question: 'Expand: 3(x + 4)', options: ['3x + 12','3x + 4','3x + 7','x + 12'], answer: '3x + 12' },
  { question: 'If 4x + 2 = 3x + 8, what is x?', options: ['6','5','7','8'], answer: '6' },
  { question: 'What is the value of 2x² when x = 3?', options: ['18','12','36','54'], answer: '18' },
  { question: 'Factorise: 6x + 9', options: ['3(2x+3)','2(3x+9)','6(x+3)','3(2x+9)'], answer: '3(2x+3)' },
  { question: 'If y = 2x + 3 and x = 4, what is y?', options: ['11','9','10','12'], answer: '11' },
  { question: 'Simplify: 4b - b + 2b', options: ['5b','3b','6b','7b'], answer: '5b' },
  { question: 'Expand: 2(3x - 5)', options: ['6x - 10','6x - 5','3x - 10','2x - 10'], answer: '6x - 10' },
  { question: 'If 5x - 3 = 2x + 9, what is x?', options: ['4','3','5','6'], answer: '4' },
  { question: 'What is the value of 3x + 2y when x = 2 and y = 3?', options: ['12','10','14','16'], answer: '12' },
  { question: 'Factorise: 8x + 12', options: ['4(2x+3)','2(4x+6)','8(x+4)','4(2x+12)'], answer: '4(2x+3)' },
  { question: 'If y = x² - 1 and x = 3, what is y?', options: ['8','6','9','10'], answer: '8' },
];
const L4: QuizQuestion[] = [
  { question: 'Solve: 2x² + 3x - 2 = 0', options: ['x = 0.5 or x = -2','x = 1 or x = -2','x = 0.5 or x = 2','x = -0.5 or x = 2'], answer: 'x = 0.5 or x = -2' },
  { question: 'Expand: (x + 3)(x + 2)', options: ['x² + 5x + 6','x² + 6x + 5','x² + 5x + 5','x² + 6x + 6'], answer: 'x² + 5x + 6' },
  { question: 'Factorise: x² + 7x + 12', options: ['(x+3)(x+4)','(x+2)(x+6)','(x+1)(x+12)','(x+4)(x+3)'], answer: '(x+3)(x+4)' },
  { question: 'If f(x) = 2x² - 3x + 1, find f(2)', options: ['3','1','5','7'], answer: '3' },
  { question: 'Solve: 3x + 2y = 12 and x + y = 5', options: ['x=2, y=3','x=3, y=2','x=1, y=4','x=4, y=1'], answer: 'x=2, y=3' },
  { question: 'Simplify: (3x²)(2x³)', options: ['6x⁵','5x⁵','6x⁶','5x⁶'], answer: '6x⁵' },
  { question: 'Expand: (2x - 1)(3x + 4)', options: ['6x² + 5x - 4','6x² - 5x - 4','6x² + 5x + 4','6x² - 5x + 4'], answer: '6x² + 5x - 4' },
  { question: 'Factorise: 2x² - 8', options: ['2(x+2)(x-2)','2(x-2)²','(2x+4)(x-2)','2(x²-4)'], answer: '2(x+2)(x-2)' },
  { question: 'If y = 3x - 2, what is x when y = 10?', options: ['4','3','5','6'], answer: '4' },
  { question: 'Simplify: (x³)²', options: ['x⁶','x⁵','2x³','x⁹'], answer: 'x⁶' },
  { question: 'Solve: x² - 5x + 6 = 0', options: ['x=2 or x=3','x=1 or x=6','x=2 or x=-3','x=-2 or x=-3'], answer: 'x=2 or x=3' },
  { question: 'Expand: (x - 4)²', options: ['x² - 8x + 16','x² - 4x + 16','x² - 8x - 16','x² + 8x + 16'], answer: 'x² - 8x + 16' },
];
const L5: QuizQuestion[] = [
  { question: 'Solve: x² + 4x + 4 = 0', options: ['x = -2 (repeated)','x = 2 (repeated)','x = -2 or x = 2','x = -4 or x = 0'], answer: 'x = -2 (repeated)' },
  { question: 'Simplify: (2x²y³)³', options: ['8x⁶y⁹','6x⁵y⁶','8x⁵y⁶','6x⁶y⁹'], answer: '8x⁶y⁹' },
  { question: 'Factorise completely: 3x³ - 12x', options: ['3x(x+2)(x-2)','3x(x²-4)','3(x³-4x)','x(3x²-12)'], answer: '3x(x+2)(x-2)' },
  { question: 'If f(x) = x² - 4x + 3, find the roots', options: ['x=1 and x=3','x=1 and x=-3','x=-1 and x=3','x=-1 and x=-3'], answer: 'x=1 and x=3' },
  { question: 'Solve simultaneously: 2x + 3y = 13 and 4x - y = 5', options: ['x=2, y=3','x=3, y=2','x=1, y=4','x=4, y=1'], answer: 'x=2, y=3' },
  { question: 'Expand and simplify: (x+2)² - (x-1)²', options: ['6x+3','6x-3','2x+3','2x-3'], answer: '6x+3' },
  { question: 'Factorise: 6x² + 11x - 10', options: ['(2x+5)(3x-2)','(3x+5)(2x-2)','(2x-5)(3x+2)','(6x-5)(x+2)'], answer: '(2x+5)(3x-2)' },
  { question: 'If g(x) = 2x³ - 3x² + x, find g(-1)', options: ['-6','-4','-2','0'], answer: '-6' },
  { question: 'Solve: 2x² - 7x + 3 = 0', options: ['x=3 or x=0.5','x=3 or x=-0.5','x=-3 or x=0.5','x=1 or x=1.5'], answer: 'x=3 or x=0.5' },
  { question: 'Simplify: (x²-9)/(x-3)', options: ['x+3','x-3','x²+3','x²-3'], answer: 'x+3' },
  { question: 'Expand: (x+1)(x-1)(x+2)', options: ['x³+2x²-x-2','x³-2x²+x-2','x³+2x²+x-2','x³-2x²-x+2'], answer: 'x³+2x²-x-2' },
  { question: 'Factorise: x³ - 8', options: ['(x-2)(x²+2x+4)','(x-2)(x²-2x+4)','(x+2)(x²-2x+4)','(x-2)³'], answer: '(x-2)(x²+2x+4)' },
];

export default makeGame({
  slug: 'algebra-quest',
  title: 'Algebra Quest',
  emoji: '🔮',
  subject: 'maths',
  ageGroups: ['11–13'],
  description: 'Solve algebraic equations and find the value of x. Algebra made accessible!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
