import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the mode of: 2, 3, 3, 4, 5?', options: ['3','2','4','5'], answer: '3' },
  { question: 'What is the median of: 1, 3, 5, 7, 9?', options: ['5','3','7','1'], answer: '5' },
  { question: 'What is the mean of: 2, 4, 6?', options: ['4','2','6','3'], answer: '4' },
  { question: 'What is the range of: 3, 7, 2, 9, 5?', options: ['7','5','9','3'], answer: '7' },
  { question: 'What is the mode of: 1, 2, 2, 3, 4?', options: ['2','1','3','4'], answer: '2' },
  { question: 'What is the median of: 2, 4, 6, 8, 10?', options: ['6','4','8','2'], answer: '6' },
  { question: 'What is the mean of: 3, 6, 9?', options: ['6','3','9','4'], answer: '6' },
  { question: 'What is the range of: 5, 10, 15, 20?', options: ['15','5','20','10'], answer: '15' },
  { question: 'What is the mode of: 4, 4, 5, 6, 7?', options: ['4','5','6','7'], answer: '4' },
  { question: 'What is the median of: 3, 5, 7?', options: ['5','3','7','4'], answer: '5' },
  { question: 'What is the mean of: 10, 20, 30?', options: ['20','10','30','15'], answer: '20' },
  { question: 'What is the range of: 8, 3, 11, 6?', options: ['8','3','11','6'], answer: '8' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the mean of: 5, 8, 11, 14, 17?', options: ['11','8','14','10'], answer: '11' },
  { question: 'What is the median of: 4, 7, 2, 9, 5?', options: ['5','4','7','6'], answer: '5' },
  { question: 'What is the mode of: 3, 5, 3, 7, 5, 3?', options: ['3','5','7','4'], answer: '3' },
  { question: 'What is the range of: 12, 7, 19, 4, 15?', options: ['15','12','19','7'], answer: '15' },
  { question: 'What is the mean of: 6, 9, 12, 15?', options: ['10.5','9','12','11'], answer: '10.5' },
  { question: 'What is the median of: 1, 3, 5, 7, 9, 11?', options: ['6','5','7','4'], answer: '6' },
  { question: 'What is the mode of: 2, 4, 6, 4, 8, 4?', options: ['4','2','6','8'], answer: '4' },
  { question: 'What is the range of: 23, 15, 31, 8, 19?', options: ['23','15','31','16'], answer: '23' },
  { question: 'What is the mean of: 7, 14, 21, 28?', options: ['17.5','14','21','15'], answer: '17.5' },
  { question: 'What is the median of: 6, 2, 8, 4, 10?', options: ['6','4','8','5'], answer: '6' },
  { question: 'What is the mode of: 5, 7, 5, 9, 7, 5?', options: ['5','7','9','6'], answer: '5' },
  { question: 'What is the range of: 45, 23, 67, 12, 56?', options: ['55','45','67','44'], answer: '55' },
];
const L3: QuizQuestion[] = [
  { question: 'A bar chart shows: Maths 8, English 6, Science 10. What is the total?', options: ['24','20','22','26'], answer: '24' },
  { question: 'A pie chart has 4 equal sections. What % is each section?', options: ['25%','20%','30%','40%'], answer: '25%' },
  { question: 'A line graph shows temperatures: Mon 12°, Tue 15°, Wed 18°. What is the mean?', options: ['15°','12°','18°','14°'], answer: '15°' },
  { question: 'A frequency table shows: red 5, blue 8, green 3. What is the mode?', options: ['blue','red','green','none'], answer: 'blue' },
  { question: 'A scatter graph shows positive correlation. As x increases, y…', options: ['increases','decreases','stays the same','varies randomly'], answer: 'increases' },
  { question: 'A scatter graph shows negative correlation. As x increases, y…', options: ['decreases','increases','stays the same','varies randomly'], answer: 'decreases' },
  { question: 'A pie chart has 360°. A section is 90°. What fraction is it?', options: ['1/4','1/3','1/2','1/6'], answer: '1/4' },
  { question: 'A bar chart shows 5 bars. The tallest is 20, shortest is 5. What is the range?', options: ['15','20','5','10'], answer: '15' },
  { question: 'A line graph shows: Jan 10, Feb 15, Mar 20, Apr 15. What is the mean?', options: ['15','10','20','12.5'], answer: '15' },
  { question: 'A frequency table: 1→3, 2→5, 3→2. What is the median?', options: ['2','1','3','1.5'], answer: '2' },
  { question: 'A pie chart section is 120°. What fraction is it?', options: ['1/3','1/4','1/2','1/6'], answer: '1/3' },
  { question: 'A bar chart shows: A=12, B=8, C=16, D=4. What is the mean?', options: ['10','12','8','11'], answer: '10' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'data-detective',
  title: 'Data Detective',
  emoji: '🔍',
  subject: 'maths',
  ageGroups: ['9–11', '12–13'],
  description: 'Analyse data, find averages and read charts like a true data detective!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
