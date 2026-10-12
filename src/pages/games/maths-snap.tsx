import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Quick! 3 + 4 = ?', options: ['7','6','8','5'], answer: '7' },
  { question: 'Quick! 5 + 6 = ?', options: ['11','10','12','9'], answer: '11' },
  { question: 'Quick! 8 - 3 = ?', options: ['5','4','6','3'], answer: '5' },
  { question: 'Quick! 9 - 4 = ?', options: ['5','4','6','3'], answer: '5' },
  { question: 'Quick! 2 × 6 = ?', options: ['12','10','14','8'], answer: '12' },
  { question: 'Quick! 3 × 5 = ?', options: ['15','12','18','10'], answer: '15' },
  { question: 'Quick! 10 ÷ 2 = ?', options: ['5','4','6','3'], answer: '5' },
  { question: 'Quick! 12 ÷ 3 = ?', options: ['4','3','5','6'], answer: '4' },
  { question: 'Quick! 7 + 8 = ?', options: ['15','14','16','13'], answer: '15' },
  { question: 'Quick! 15 - 7 = ?', options: ['8','7','9','6'], answer: '8' },
  { question: 'Quick! 4 × 4 = ?', options: ['16','12','20','8'], answer: '16' },
  { question: 'Quick! 20 ÷ 4 = ?', options: ['5','4','6','3'], answer: '5' },
];
const L2: QuizQuestion[] = [
  { question: 'Quick! 13 + 27 = ?', options: ['40','38','42','36'], answer: '40' },
  { question: 'Quick! 52 - 18 = ?', options: ['34','32','36','30'], answer: '34' },
  { question: 'Quick! 7 × 8 = ?', options: ['56','54','58','48'], answer: '56' },
  { question: 'Quick! 63 ÷ 9 = ?', options: ['7','6','8','5'], answer: '7' },
  { question: 'Quick! 45 + 36 = ?', options: ['81','79','83','77'], answer: '81' },
  { question: 'Quick! 84 - 37 = ?', options: ['47','45','49','43'], answer: '47' },
  { question: 'Quick! 9 × 9 = ?', options: ['81','79','83','72'], answer: '81' },
  { question: 'Quick! 72 ÷ 8 = ?', options: ['9','8','10','7'], answer: '9' },
  { question: 'Quick! 67 + 48 = ?', options: ['115','113','117','111'], answer: '115' },
  { question: 'Quick! 100 - 43 = ?', options: ['57','55','59','53'], answer: '57' },
  { question: 'Quick! 12 × 7 = ?', options: ['84','82','86','78'], answer: '84' },
  { question: 'Quick! 96 ÷ 12 = ?', options: ['8','7','9','6'], answer: '8' },
];
const L3: QuizQuestion[] = [
  { question: 'Quick! 15% of 80 = ?', options: ['12','10','14','8'], answer: '12' },
  { question: 'Quick! 3² + 4² = ?', options: ['25','20','30','15'], answer: '25' },
  { question: 'Quick! 2.5 × 6 = ?', options: ['15','12','18','10'], answer: '15' },
  { question: 'Quick! √81 = ?', options: ['9','8','10','7'], answer: '9' },
  { question: 'Quick! 3/4 of 48 = ?', options: ['36','32','40','24'], answer: '36' },
  { question: 'Quick! 125 + 378 = ?', options: ['503','493','513','483'], answer: '503' },
  { question: 'Quick! 25% of 240 = ?', options: ['60','50','70','40'], answer: '60' },
  { question: 'Quick! 4³ = ?', options: ['64','48','32','128'], answer: '64' },
  { question: 'Quick! 1.8 × 5 = ?', options: ['9','8','10','7'], answer: '9' },
  { question: 'Quick! √121 = ?', options: ['11','10','12','9'], answer: '11' },
  { question: 'Quick! 2/3 of 90 = ?', options: ['60','45','75','30'], answer: '60' },
  { question: 'Quick! 456 + 287 = ?', options: ['743','733','753','723'], answer: '743' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'maths-snap',
  title: 'Maths Snap',
  emoji: '⚡',
  subject: 'maths',
  ageGroups: ['7–9', '10–13'],
  description: 'Fast-fire mental maths — snap the right answer before time runs out!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
