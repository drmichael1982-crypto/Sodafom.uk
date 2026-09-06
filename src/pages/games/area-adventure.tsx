import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the area of a 3×4 rectangle?', options: ['12','7','14','10'], answer: '12' },
  { question: 'What is the area of a 2×5 rectangle?', options: ['10','7','12','8'], answer: '10' },
  { question: 'What is the area of a 4×4 square?', options: ['16','8','12','20'], answer: '16' },
  { question: 'What is the area of a 5×3 rectangle?', options: ['15','8','16','12'], answer: '15' },
  { question: 'What is the area of a 6×2 rectangle?', options: ['12','8','16','10'], answer: '12' },
  { question: 'What is the area of a 3×3 square?', options: ['9','6','12','15'], answer: '9' },
  { question: 'What is the area of a 7×2 rectangle?', options: ['14','9','16','12'], answer: '14' },
  { question: 'What is the area of a 5×5 square?', options: ['25','10','20','30'], answer: '25' },
  { question: 'What is the area of a 4×6 rectangle?', options: ['24','10','20','28'], answer: '24' },
  { question: 'What is the area of a 8×3 rectangle?', options: ['24','11','22','28'], answer: '24' },
  { question: 'What is the area of a 2×2 square?', options: ['4','2','6','8'], answer: '4' },
  { question: 'What is the area of a 9×2 rectangle?', options: ['18','11','20','16'], answer: '18' },
];
const L2: QuizQuestion[] = [
  { question: 'Area of a triangle with base 6 and height 4?', options: ['12','24','10','8'], answer: '12' },
  { question: 'Area of a triangle with base 8 and height 5?', options: ['20','40','13','16'], answer: '20' },
  { question: 'Area of a triangle with base 10 and height 6?', options: ['30','60','16','20'], answer: '30' },
  { question: 'Area of a parallelogram with base 7 and height 3?', options: ['21','10','14','28'], answer: '21' },
  { question: 'Area of a parallelogram with base 9 and height 4?', options: ['36','13','18','40'], answer: '36' },
  { question: 'Area of a rectangle with length 12 and width 5?', options: ['60','17','24','55'], answer: '60' },
  { question: 'Area of a square with side 8?', options: ['64','16','32','48'], answer: '64' },
  { question: 'Area of a triangle with base 12 and height 8?', options: ['48','96','20','24'], answer: '48' },
  { question: 'Area of a parallelogram with base 11 and height 5?', options: ['55','16','22','60'], answer: '55' },
  { question: 'Area of a rectangle with length 15 and width 4?', options: ['60','19','30','56'], answer: '60' },
  { question: 'Area of a square with side 11?', options: ['121','22','44','110'], answer: '121' },
  { question: 'Area of a triangle with base 14 and height 6?', options: ['42','84','20','28'], answer: '42' },
];
const L3: QuizQuestion[] = [
  { question: 'Area of a circle with radius 5? (π ≈ 3.14)', options: ['78.5','31.4','15.7','157'], answer: '78.5' },
  { question: 'Area of a circle with radius 7? (π ≈ 3.14)', options: ['153.86','43.96','21.98','307.72'], answer: '153.86' },
  { question: 'Area of a trapezium with parallel sides 6 and 10, height 4?', options: ['32','16','64','24'], answer: '32' },
  { question: 'Area of a trapezium with parallel sides 8 and 12, height 5?', options: ['50','25','100','40'], answer: '50' },
  { question: 'Area of a circle with diameter 10? (π ≈ 3.14)', options: ['78.5','31.4','157','15.7'], answer: '78.5' },
  { question: 'Area of a compound shape: 4×6 rectangle + 3×3 square?', options: ['33','27','36','30'], answer: '33' },
  { question: 'Area of a trapezium with parallel sides 5 and 9, height 6?', options: ['42','21','84','36'], answer: '42' },
  { question: 'Area of a circle with radius 3? (π ≈ 3.14)', options: ['28.26','18.84','9.42','56.52'], answer: '28.26' },
  { question: 'Area of a compound shape: 10×8 rectangle minus 3×3 square?', options: ['71','80','89','62'], answer: '71' },
  { question: 'Area of a trapezium with parallel sides 7 and 11, height 8?', options: ['72','36','144','56'], answer: '72' },
  { question: 'Area of a circle with radius 6? (π ≈ 3.14)', options: ['113.04','37.68','18.84','226.08'], answer: '113.04' },
  { question: 'Area of a compound shape: 12×5 rectangle + 4×4 square?', options: ['76','60','76','80'], answer: '76' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'area-adventure',
  title: 'Area Adventure',
  emoji: '📏',
  subject: 'maths',
  ageGroups: ['9–11', '12–13'],
  description: 'Calculate areas of rectangles, triangles, circles and more!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
