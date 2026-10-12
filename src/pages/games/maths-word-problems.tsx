import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Tom has 5 apples. He gets 3 more. How many does he have?', options: ['8','7','9','6'], answer: '8' },
  { question: 'There are 10 birds. 4 fly away. How many are left?', options: ['6','5','7','4'], answer: '6' },
  { question: 'A box has 3 rows of 4 chocolates. How many chocolates?', options: ['12','10','14','8'], answer: '12' },
  { question: 'Share 15 sweets equally between 3 children. How many each?', options: ['5','4','6','3'], answer: '5' },
  { question: 'A book has 20 pages. Sam reads 8. How many are left?', options: ['12','10','14','8'], answer: '12' },
  { question: 'There are 4 bags with 6 balls each. How many balls?', options: ['24','20','28','16'], answer: '24' },
  { question: 'A jar has 18 sweets. 6 are eaten. How many remain?', options: ['12','10','14','8'], answer: '12' },
  { question: 'Share 24 stickers equally between 4 friends. How many each?', options: ['6','5','7','4'], answer: '6' },
  { question: 'A shop sells 7 pens a day. How many in 5 days?', options: ['35','30','40','25'], answer: '35' },
  { question: 'A bag has 30 marbles. 12 are red. How many are not red?', options: ['18','16','20','14'], answer: '18' },
  { question: 'There are 5 shelves with 8 books each. How many books?', options: ['40','35','45','30'], answer: '40' },
  { question: 'Share 36 cookies equally between 6 children. How many each?', options: ['6','5','7','4'], answer: '6' },
];
const L2: QuizQuestion[] = [
  { question: 'A train travels 120 km in 2 hours. What is its speed?', options: ['60 km/h','50 km/h','70 km/h','40 km/h'], answer: '60 km/h' },
  { question: 'A rectangle is 8 cm long and 5 cm wide. What is its area?', options: ['40 cm²','35 cm²','45 cm²','30 cm²'], answer: '40 cm²' },
  { question: 'A shirt costs £12. There is a 25% discount. What is the sale price?', options: ['£9','£8','£10','£7'], answer: '£9' },
  { question: 'A bag of 48 sweets is shared equally between 8 children. How many each?', options: ['6','5','7','4'], answer: '6' },
  { question: 'A car uses 8 litres of fuel per 100 km. How much for 250 km?', options: ['20 litres','16 litres','24 litres','18 litres'], answer: '20 litres' },
  { question: 'A box holds 24 eggs. How many boxes for 144 eggs?', options: ['6','5','7','4'], answer: '6' },
  { question: 'A shop sells 35 items on Monday and 47 on Tuesday. How many in total?', options: ['82','80','84','78'], answer: '82' },
  { question: 'A field is 120 m long and 80 m wide. What is its perimeter?', options: ['400 m','200 m','300 m','480 m'], answer: '400 m' },
  { question: 'A book costs £7.50. How much for 4 books?', options: ['£30','£28','£32','£26'], answer: '£30' },
  { question: 'A class has 32 pupils. 3/8 are boys. How many boys?', options: ['12','8','16','10'], answer: '12' },
  { question: 'A recipe needs 250 g of flour for 10 biscuits. How much for 30 biscuits?', options: ['750 g','500 g','1000 g','600 g'], answer: '750 g' },
  { question: 'A cinema has 240 seats. 3/4 are filled. How many empty seats?', options: ['60','180','120','80'], answer: '60' },
];
const L3: QuizQuestion[] = [
  { question: 'A train travels at 90 km/h for 2.5 hours. How far does it travel?', options: ['225 km','180 km','270 km','200 km'], answer: '225 km' },
  { question: 'A shop increases prices by 15%. A coat was £80. What is the new price?', options: ['£92','£88','£96','£84'], answer: '£92' },
  { question: 'A rectangle has area 84 cm² and length 12 cm. What is its width?', options: ['7 cm','6 cm','8 cm','5 cm'], answer: '7 cm' },
  { question: 'A tank holds 360 litres. It is 3/4 full. How much water is in it?', options: ['270 litres','240 litres','300 litres','180 litres'], answer: '270 litres' },
  { question: 'A worker earns £12.50 per hour. How much for a 40-hour week?', options: ['£500','£450','£550','£480'], answer: '£500' },
  { question: 'A school has 480 pupils. 35% are in KS1. How many is that?', options: ['168','144','192','156'], answer: '168' },
  { question: 'A car travels 336 km on 42 litres of fuel. How many km per litre?', options: ['8','7','9','6'], answer: '8' },
  { question: 'A shop sells 3 items for £7.50. How much for 8 items?', options: ['£20','£18','£22','£16'], answer: '£20' },
  { question: 'A field has area 2400 m². Its width is 40 m. What is its length?', options: ['60 m','50 m','70 m','80 m'], answer: '60 m' },
  { question: 'A price is reduced by 20% to £64. What was the original price?', options: ['£80','£76','£84','£72'], answer: '£80' },
  { question: 'A recipe for 6 people needs 450 g of rice. How much for 10 people?', options: ['750 g','600 g','900 g','675 g'], answer: '750 g' },
  { question: 'A journey takes 3 hours 45 minutes. It starts at 09:20. When does it end?', options: ['13:05','12:55','13:15','13:00'], answer: '13:05' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'maths-word-problems',
  title: 'Maths Word Problems',
  emoji: '📝',
  subject: 'maths',
  ageGroups: ['8–10', '11–13'],
  description: 'Solve real-world maths problems — apply your skills to everyday situations!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
