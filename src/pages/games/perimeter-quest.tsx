import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Perimeter of a 3×4 rectangle?', options: ['14','12','16','10'], answer: '14' },
  { question: 'Perimeter of a 5×5 square?', options: ['20','25','15','10'], answer: '20' },
  { question: 'Perimeter of a 2×6 rectangle?', options: ['16','12','8','14'], answer: '16' },
  { question: 'Perimeter of a 4×4 square?', options: ['16','8','12','20'], answer: '16' },
  { question: 'Perimeter of a 3×7 rectangle?', options: ['20','21','14','18'], answer: '20' },
  { question: 'Perimeter of a 6×6 square?', options: ['24','36','12','18'], answer: '24' },
  { question: 'Perimeter of a 5×8 rectangle?', options: ['26','40','13','30'], answer: '26' },
  { question: 'Perimeter of a 7×7 square?', options: ['28','49','14','21'], answer: '28' },
  { question: 'Perimeter of a 4×9 rectangle?', options: ['26','36','13','30'], answer: '26' },
  { question: 'Perimeter of a 8×8 square?', options: ['32','64','16','24'], answer: '32' },
  { question: 'Perimeter of a 6×10 rectangle?', options: ['32','60','16','28'], answer: '32' },
  { question: 'Perimeter of a 9×9 square?', options: ['36','81','18','27'], answer: '36' },
];
const L2: QuizQuestion[] = [
  { question: 'A rectangle has perimeter 24 cm and length 8 cm. What is its width?', options: ['4 cm','6 cm','8 cm','3 cm'], answer: '4 cm' },
  { question: 'A square has perimeter 36 cm. What is its side length?', options: ['9 cm','6 cm','12 cm','4 cm'], answer: '9 cm' },
  { question: 'Perimeter of a triangle with sides 5, 7, and 9 cm?', options: ['21 cm','18 cm','24 cm','15 cm'], answer: '21 cm' },
  { question: 'Perimeter of a regular pentagon with side 6 cm?', options: ['30 cm','24 cm','36 cm','18 cm'], answer: '30 cm' },
  { question: 'A rectangle has perimeter 40 cm and width 6 cm. What is its length?', options: ['14 cm','10 cm','18 cm','12 cm'], answer: '14 cm' },
  { question: 'Perimeter of a regular hexagon with side 5 cm?', options: ['30 cm','25 cm','35 cm','20 cm'], answer: '30 cm' },
  { question: 'A square has perimeter 52 cm. What is its side length?', options: ['13 cm','10 cm','16 cm','8 cm'], answer: '13 cm' },
  { question: 'Perimeter of a triangle with sides 8, 12, and 15 cm?', options: ['35 cm','30 cm','40 cm','25 cm'], answer: '35 cm' },
  { question: 'A rectangle has perimeter 56 cm and length 18 cm. What is its width?', options: ['10 cm','8 cm','12 cm','14 cm'], answer: '10 cm' },
  { question: 'Perimeter of a regular octagon with side 7 cm?', options: ['56 cm','48 cm','64 cm','42 cm'], answer: '56 cm' },
  { question: 'A square has perimeter 64 cm. What is its side length?', options: ['16 cm','12 cm','20 cm','8 cm'], answer: '16 cm' },
  { question: 'Perimeter of a triangle with sides 11, 14, and 17 cm?', options: ['42 cm','38 cm','46 cm','34 cm'], answer: '42 cm' },
];
const L3: QuizQuestion[] = [
  { question: 'Circumference of a circle with radius 7 cm? (π ≈ 3.14)', options: ['43.96 cm','21.98 cm','87.92 cm','14 cm'], answer: '43.96 cm' },
  { question: 'Circumference of a circle with diameter 10 cm? (π ≈ 3.14)', options: ['31.4 cm','15.7 cm','62.8 cm','10 cm'], answer: '31.4 cm' },
  { question: 'Perimeter of a compound shape: 10×6 rectangle with a 3×3 square removed from one corner?', options: ['38 cm','32 cm','44 cm','36 cm'], answer: '38 cm' },
  { question: 'Circumference of a circle with radius 5 cm? (π ≈ 3.14)', options: ['31.4 cm','15.7 cm','62.8 cm','10 cm'], answer: '31.4 cm' },
  { question: 'Perimeter of a semicircle with diameter 8 cm? (π ≈ 3.14)', options: ['20.56 cm','12.56 cm','25.12 cm','16 cm'], answer: '20.56 cm' },
  { question: 'Circumference of a circle with diameter 14 cm? (π ≈ 3.14)', options: ['43.96 cm','21.98 cm','87.92 cm','28 cm'], answer: '43.96 cm' },
  { question: 'Perimeter of a compound shape: 12×8 rectangle with a 4×4 square added on top?', options: ['56 cm','48 cm','64 cm','52 cm'], answer: '56 cm' },
  { question: 'Circumference of a circle with radius 9 cm? (π ≈ 3.14)', options: ['56.52 cm','28.26 cm','113.04 cm','18 cm'], answer: '56.52 cm' },
  { question: 'Perimeter of a semicircle with radius 6 cm? (π ≈ 3.14)', options: ['30.84 cm','18.84 cm','37.68 cm','12 cm'], answer: '30.84 cm' },
  { question: 'Circumference of a circle with diameter 20 cm? (π ≈ 3.14)', options: ['62.8 cm','31.4 cm','125.6 cm','40 cm'], answer: '62.8 cm' },
  { question: 'Perimeter of a compound shape: L-shape with outer dimensions 10×8 and inner cut 4×3?', options: ['34 cm','30 cm','38 cm','32 cm'], answer: '34 cm' },
  { question: 'Circumference of a circle with radius 12 cm? (π ≈ 3.14)', options: ['75.36 cm','37.68 cm','150.72 cm','24 cm'], answer: '75.36 cm' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'perimeter-quest',
  title: 'Perimeter Quest',
  emoji: '🔲',
  subject: 'maths',
  ageGroups: ['8–10', '11–13'],
  description: 'Calculate perimeters of shapes — from simple rectangles to circles!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
