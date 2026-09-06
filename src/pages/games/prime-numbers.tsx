import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Is 7 a prime number?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Is 4 a prime number?', options: ['No','Yes'], answer: 'No' },
  { question: 'Is 11 a prime number?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Is 9 a prime number?', options: ['No','Yes'], answer: 'No' },
  { question: 'Is 13 a prime number?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Is 15 a prime number?', options: ['No','Yes'], answer: 'No' },
  { question: 'Is 17 a prime number?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Is 21 a prime number?', options: ['No','Yes'], answer: 'No' },
  { question: 'Is 19 a prime number?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Is 25 a prime number?', options: ['No','Yes'], answer: 'No' },
  { question: 'Is 23 a prime number?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Is 27 a prime number?', options: ['No','Yes'], answer: 'No' },
];
const L2: QuizQuestion[] = [
  { question: 'Which of these is prime?', options: ['29','27','25','33'], answer: '29' },
  { question: 'Which of these is NOT prime?', options: ['35','31','37','41'], answer: '35' },
  { question: 'Which of these is prime?', options: ['43','45','49','51'], answer: '43' },
  { question: 'Which of these is NOT prime?', options: ['57','53','59','61'], answer: '57' },
  { question: 'How many prime numbers are between 1 and 10?', options: ['4','3','5','2'], answer: '4' },
  { question: 'What is the smallest prime number?', options: ['2','1','3','5'], answer: '2' },
  { question: 'Is 1 a prime number?', options: ['No','Yes'], answer: 'No' },
  { question: 'Is 2 the only even prime number?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Which of these is prime?', options: ['67','65','69','63'], answer: '67' },
  { question: 'Which of these is NOT prime?', options: ['77','71','73','79'], answer: '77' },
  { question: 'How many prime numbers are between 10 and 20?', options: ['4','3','5','2'], answer: '4' },
  { question: 'Which of these is prime?', options: ['83','81','85','87'], answer: '83' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the prime factorisation of 12?', options: ['2² × 3','2 × 6','3 × 4','2 × 2 × 3'], answer: '2² × 3' },
  { question: 'What is the prime factorisation of 30?', options: ['2 × 3 × 5','2 × 15','5 × 6','3 × 10'], answer: '2 × 3 × 5' },
  { question: 'What is the prime factorisation of 48?', options: ['2⁴ × 3','2³ × 6','4 × 12','2 × 24'], answer: '2⁴ × 3' },
  { question: 'What is the HCF of 12 and 18?', options: ['6','3','9','12'], answer: '6' },
  { question: 'What is the LCM of 4 and 6?', options: ['12','8','24','6'], answer: '12' },
  { question: 'What is the prime factorisation of 100?', options: ['2² × 5²','2 × 50','4 × 25','10 × 10'], answer: '2² × 5²' },
  { question: 'What is the HCF of 24 and 36?', options: ['12','6','18','24'], answer: '12' },
  { question: 'What is the LCM of 6 and 9?', options: ['18','12','27','54'], answer: '18' },
  { question: 'What is the prime factorisation of 72?', options: ['2³ × 3²','2² × 18','8 × 9','2 × 36'], answer: '2³ × 3²' },
  { question: 'What is the HCF of 48 and 60?', options: ['12','6','24','48'], answer: '12' },
  { question: 'What is the LCM of 8 and 12?', options: ['24','16','48','96'], answer: '24' },
  { question: 'What is the prime factorisation of 360?', options: ['2³ × 3² × 5','2² × 3 × 30','8 × 45','2 × 180'], answer: '2³ × 3² × 5' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'prime-numbers',
  title: 'Prime Numbers',
  emoji: '🔑',
  subject: 'maths',
  ageGroups: ['9–11', '12–13'],
  description: 'Identify prime numbers and explore prime factorisation!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
