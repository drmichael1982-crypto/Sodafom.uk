import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'I am thinking of a number. I add 5 and get 12. What is my number?', options: ['7','6','8','9'], answer: '7' },
  { question: 'I am thinking of a number. I double it and get 16. What is my number?', options: ['8','6','10','7'], answer: '8' },
  { question: 'I am thinking of a number. I subtract 3 and get 7. What is my number?', options: ['10','9','11','8'], answer: '10' },
  { question: 'I am thinking of a number. I multiply by 3 and get 15. What is my number?', options: ['5','4','6','3'], answer: '5' },
  { question: 'I am thinking of a number. I add 8 and get 15. What is my number?', options: ['7','6','8','9'], answer: '7' },
  { question: 'I am thinking of a number. I halve it and get 6. What is my number?', options: ['12','10','14','8'], answer: '12' },
  { question: 'I am thinking of a number. I subtract 7 and get 4. What is my number?', options: ['11','10','12','9'], answer: '11' },
  { question: 'I am thinking of a number. I multiply by 4 and get 20. What is my number?', options: ['5','4','6','3'], answer: '5' },
  { question: 'I am thinking of a number. I add 9 and get 17. What is my number?', options: ['8','7','9','10'], answer: '8' },
  { question: 'I am thinking of a number. I divide by 3 and get 4. What is my number?', options: ['12','9','15','6'], answer: '12' },
  { question: 'I am thinking of a number. I subtract 6 and get 9. What is my number?', options: ['15','14','16','13'], answer: '15' },
  { question: 'I am thinking of a number. I multiply by 5 and get 35. What is my number?', options: ['7','6','8','5'], answer: '7' },
];
const L2: QuizQuestion[] = [
  { question: 'I add 15 to my number and get 42. What is my number?', options: ['27','25','29','23'], answer: '27' },
  { question: 'I multiply my number by 7 and get 56. What is my number?', options: ['8','7','9','6'], answer: '8' },
  { question: 'I subtract 23 from my number and get 45. What is my number?', options: ['68','66','70','64'], answer: '68' },
  { question: 'I divide my number by 9 and get 8. What is my number?', options: ['72','63','81','54'], answer: '72' },
  { question: 'I double my number and add 5 to get 25. What is my number?', options: ['10','9','11','8'], answer: '10' },
  { question: 'I triple my number and subtract 6 to get 24. What is my number?', options: ['10','9','11','8'], answer: '10' },
  { question: 'I add 37 to my number and get 100. What is my number?', options: ['63','61','65','59'], answer: '63' },
  { question: 'I multiply my number by 8 and get 96. What is my number?', options: ['12','11','13','10'], answer: '12' },
  { question: 'I subtract 48 from my number and get 37. What is my number?', options: ['85','83','87','81'], answer: '85' },
  { question: 'I divide my number by 12 and get 9. What is my number?', options: ['108','96','120','84'], answer: '108' },
  { question: 'I double my number and subtract 7 to get 33. What is my number?', options: ['20','18','22','16'], answer: '20' },
  { question: 'I triple my number and add 11 to get 50. What is my number?', options: ['13','12','14','11'], answer: '13' },
];
const L3: QuizQuestion[] = [
  { question: 'I am a 2-digit number. My digits add to 9. I am between 50 and 60. What am I?', options: ['54','45','63','72'], answer: '54' },
  { question: 'I am a 2-digit number. My digits multiply to 12. I am less than 40. What am I?', options: ['34','43','26','62'], answer: '34' },
  { question: 'I am a 3-digit number. I am a multiple of 5. My digits add to 12. I am between 300 and 400. What am I?', options: ['345','435','315','405'], answer: '345' },
  { question: 'I am a prime number between 20 and 30. What am I?', options: ['23','21','25','27'], answer: '23' },
  { question: 'I am a square number between 50 and 100. I am odd. What am I?', options: ['81','64','49','100'], answer: '81' },
  { question: 'I am a multiple of both 4 and 6. I am less than 30. What am I?', options: ['24','12','18','36'], answer: '24' },
  { question: 'I am a 2-digit number. My tens digit is twice my units digit. What am I?', options: ['42','24','63','36'], answer: '42' },
  { question: 'I am a factor of 60 and a multiple of 6. I am between 10 and 20. What am I?', options: ['12','15','18','6'], answer: '12' },
  { question: 'I am a 3-digit palindrome. My digits add to 15. What am I?', options: ['696','969','888','777'], answer: '696' },
  { question: 'I am a cube number less than 100. I am greater than 10. What am I?', options: ['27','8','64','125'], answer: '27' },
  { question: 'I am a 2-digit number. I am a multiple of 7 and 3. What am I?', options: ['42','21','63','84'], answer: '42' },
  { question: 'I am a prime number. I am between 40 and 50. What am I?', options: ['41','43','47','all of these'], answer: 'all of these' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'maths-mystery',
  title: 'Maths Mystery',
  emoji: '🕵️',
  subject: 'maths',
  ageGroups: ['8–10', '11–13'],
  description: 'Solve number mysteries and riddles using your maths detective skills!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
