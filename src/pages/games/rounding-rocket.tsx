import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Round 13 to the nearest 10.', options: ['10','15','20','30'], answer: '10' },
  { question: 'Round 17 to the nearest 10.', options: ['10','15','20','30'], answer: '20' },
  { question: 'Round 25 to the nearest 10.', options: ['20','25','30','40'], answer: '30' },
  { question: 'Round 42 to the nearest 10.', options: ['30','40','45','50'], answer: '40' },
  { question: 'Round 68 to the nearest 10.', options: ['60','65','70','80'], answer: '70' },
  { question: 'Round 35 to the nearest 10.', options: ['30','35','40','50'], answer: '40' },
  { question: 'Round 91 to the nearest 10.', options: ['80','90','95','100'], answer: '90' },
  { question: 'Round 55 to the nearest 10.', options: ['50','55','60','70'], answer: '60' },
  { question: 'Round 14 to the nearest 10.', options: ['10','15','20','30'], answer: '10' },
  { question: 'Round 76 to the nearest 10.', options: ['70','75','80','90'], answer: '80' },
  { question: 'Round 49 to the nearest 10.', options: ['40','45','50','60'], answer: '50' },
  { question: 'Round 82 to the nearest 10.', options: ['70','80','85','90'], answer: '80' },
];
const L2: QuizQuestion[] = [
  { question: 'Round 47 to the nearest 10.', options: ['40','45','50','60'], answer: '50' },
  { question: 'Round 83 to the nearest 10.', options: ['70','80','85','90'], answer: '80' },
  { question: 'Round 345 to the nearest 100.', options: ['300','340','350','400'], answer: '300' },
  { question: 'Round 650 to the nearest 100.', options: ['500','600','700','800'], answer: '700' },
  { question: 'Round 2,480 to the nearest 1,000.', options: ['1,000','2,000','3,000','4,000'], answer: '2,000' },
  { question: 'Round 7,600 to the nearest 1,000.', options: ['7,000','7,500','8,000','9,000'], answer: '8,000' },
  { question: 'Round 3.7 to the nearest whole number.', options: ['3','3.5','4','5'], answer: '4' },
  { question: 'Round 12.3 to the nearest whole number.', options: ['11','12','12.5','13'], answer: '12' },
  { question: 'Round 99 to the nearest 10.', options: ['90','95','100','110'], answer: '100' },
  { question: 'Round 4,501 to the nearest 1,000.', options: ['4,000','4,500','5,000','6,000'], answer: '5,000' },
  { question: 'Round 8,450 to the nearest 1,000.', options: ['7,000','8,000','9,000','10,000'], answer: '8,000' },
  { question: 'Round 6.75 to the nearest whole number.', options: ['6','6.5','7','8'], answer: '7' },
];
const L3: QuizQuestion[] = [
  { question: 'Round 3.456 to 2 decimal places.', options: ['3.45','3.46','3.5','3.4'], answer: '3.46' },
  { question: 'Round 7.891 to 1 decimal place.', options: ['7.8','7.9','8.0','7.89'], answer: '7.9' },
  { question: 'Round 0.0456 to 3 significant figures.', options: ['0.045','0.046','0.0456','0.04'], answer: '0.0456' },
  { question: 'Round 12,345 to 3 significant figures.', options: ['12,300','12,400','12,000','12,350'], answer: '12,300' },
  { question: 'Round 0.00789 to 2 significant figures.', options: ['0.0078','0.0079','0.008','0.007'], answer: '0.0079' },
  { question: 'Round 456,789 to 4 significant figures.', options: ['456,700','456,800','457,000','456,000'], answer: '456,800' },
  { question: 'Round 2.9999 to 3 decimal places.', options: ['2.999','3.000','2.998','3.001'], answer: '3.000' },
  { question: 'Round 0.00345 to 2 significant figures.', options: ['0.003','0.0034','0.0035','0.004'], answer: '0.0035' },
  { question: 'Round 9,876 to 2 significant figures.', options: ['9,800','9,900','10,000','9,876'], answer: '9,900' },
  { question: 'Round 1.2345 to 3 significant figures.', options: ['1.23','1.234','1.235','1.24'], answer: '1.23' },
  { question: 'Round 0.5555 to 3 decimal places.', options: ['0.555','0.556','0.55','0.6'], answer: '0.556' },
  { question: 'Round 99,950 to 3 significant figures.', options: ['99,900','100,000','99,950','99,000'], answer: '100,000' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'rounding-rocket',
  title: 'Rounding Rocket',
  emoji: '🚀',
  subject: 'maths',
  ageGroups: ['8–10', '11–13'],
  description: 'Round numbers to the nearest 10, 100 or 1000 to fuel the rocket!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
