import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: '2, 4, ___, 8, 10', options: ['6','5','7','4'], answer: '6' },
  { question: '5, 10, ___, 20, 25', options: ['15','12','18','14'], answer: '15' },
  { question: '1, 2, 3, ___, 5', options: ['4','3','5','6'], answer: '4' },
  { question: '10, 20, ___, 40, 50', options: ['30','25','35','28'], answer: '30' },
  { question: '3, 6, ___, 12, 15', options: ['9','8','10','7'], answer: '9' },
  { question: '4, 8, ___, 16, 20', options: ['12','10','14','11'], answer: '12' },
  { question: '7, 14, ___, 28, 35', options: ['21','18','24','20'], answer: '21' },
  { question: '2, 4, 6, ___, 10', options: ['8','7','9','6'], answer: '8' },
  { question: '9, 18, ___, 36, 45', options: ['27','24','30','25'], answer: '27' },
  { question: '6, 12, ___, 24, 30', options: ['18','15','21','16'], answer: '18' },
  { question: '8, 16, ___, 32, 40', options: ['24','20','28','22'], answer: '24' },
  { question: '11, 22, ___, 44, 55', options: ['33','30','36','32'], answer: '33' },
];
const L2: QuizQuestion[] = [
  { question: '100, 90, ___, 70, 60', options: ['80','75','85','78'], answer: '80' },
  { question: '1, 4, 9, ___, 25', options: ['16','12','20','14'], answer: '16' },
  { question: '2, 6, 18, ___, 162', options: ['54','36','72','48'], answer: '54' },
  { question: '1, 1, 2, 3, ___, 8', options: ['5','4','6','7'], answer: '5' },
  { question: '3, 7, 11, ___, 19', options: ['15','13','17','14'], answer: '15' },
  { question: '100, 50, ___, 12.5, 6.25', options: ['25','20','30','15'], answer: '25' },
  { question: '1, 8, 27, ___, 125', options: ['64','36','81','49'], answer: '64' },
  { question: '5, 10, 20, ___, 80', options: ['40','30','50','35'], answer: '40' },
  { question: '2, 5, 10, 17, ___', options: ['26','24','28','22'], answer: '26' },
  { question: '1, 3, 6, 10, ___', options: ['15','12','18','14'], answer: '15' },
  { question: '4, 9, 16, 25, ___', options: ['36','30','42','32'], answer: '36' },
  { question: '3, 6, 12, 24, ___', options: ['48','36','60','42'], answer: '48' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the nth term of 3, 7, 11, 15…?', options: ['4n-1','3n+1','4n+3','2n+1'], answer: '4n-1' },
  { question: 'What is the nth term of 5, 8, 11, 14…?', options: ['3n+2','5n-1','3n+5','2n+3'], answer: '3n+2' },
  { question: 'What is the nth term of 2, 5, 10, 17…?', options: ['n²+1','n²-1','2n+1','n+2'], answer: 'n²+1' },
  { question: 'What is the 10th term of 4n-3?', options: ['37','34','40','31'], answer: '37' },
  { question: 'What is the 8th term of 3n+2?', options: ['26','23','29','20'], answer: '26' },
  { question: 'What is the nth term of 1, 4, 9, 16…?', options: ['n²','2n-1','n²+1','n+3'], answer: 'n²' },
  { question: 'What is the 12th term of 5n-2?', options: ['58','55','61','52'], answer: '58' },
  { question: 'What is the nth term of 6, 11, 16, 21…?', options: ['5n+1','6n-1','5n+6','4n+2'], answer: '5n+1' },
  { question: 'What is the 15th term of 2n+3?', options: ['33','30','36','27'], answer: '33' },
  { question: 'What is the nth term of 3, 8, 15, 24…?', options: ['n²+2n','n²+n','2n²','n²+3'], answer: 'n²+2n' },
  { question: 'What is the 20th term of 4n-1?', options: ['79','76','82','73'], answer: '79' },
  { question: 'What is the nth term of 2, 6, 12, 20…?', options: ['n²+n','n²+2n','2n²','n²+3'], answer: 'n²+n' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'missing-numbers',
  title: 'Missing Numbers',
  emoji: '❓',
  subject: 'maths',
  ageGroups: ['6–8', '9–11'],
  description: 'Find the missing numbers in sequences and patterns!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
