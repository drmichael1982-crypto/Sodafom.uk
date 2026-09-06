import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Share 10 in the ratio 1:1', options: ['5 and 5','4 and 6','3 and 7','2 and 8'], answer: '5 and 5' },
  { question: 'Share 12 in the ratio 1:2', options: ['4 and 8','3 and 9','6 and 6','2 and 10'], answer: '4 and 8' },
  { question: 'Share 15 in the ratio 1:2', options: ['5 and 10','3 and 12','6 and 9','4 and 11'], answer: '5 and 10' },
  { question: 'Share 20 in the ratio 1:3', options: ['5 and 15','4 and 16','6 and 14','8 and 12'], answer: '5 and 15' },
  { question: 'Share 18 in the ratio 1:2', options: ['6 and 12','4 and 14','9 and 9','3 and 15'], answer: '6 and 12' },
  { question: 'Share 24 in the ratio 1:3', options: ['6 and 18','4 and 20','8 and 16','12 and 12'], answer: '6 and 18' },
  { question: 'Share 30 in the ratio 1:2', options: ['10 and 20','6 and 24','15 and 15','5 and 25'], answer: '10 and 20' },
  { question: 'Share 40 in the ratio 1:3', options: ['10 and 30','8 and 32','20 and 20','5 and 35'], answer: '10 and 30' },
  { question: 'Share 25 in the ratio 2:3', options: ['10 and 15','5 and 20','12 and 13','8 and 17'], answer: '10 and 15' },
  { question: 'Share 35 in the ratio 2:5', options: ['10 and 25','7 and 28','14 and 21','5 and 30'], answer: '10 and 25' },
  { question: 'Share 42 in the ratio 1:2', options: ['14 and 28','7 and 35','21 and 21','6 and 36'], answer: '14 and 28' },
  { question: 'Share 45 in the ratio 2:3', options: ['18 and 27','9 and 36','15 and 30','12 and 33'], answer: '18 and 27' },
];
const L2: QuizQuestion[] = [
  { question: 'A recipe uses flour and sugar in ratio 3:1. For 240g flour, how much sugar?', options: ['80g','60g','120g','40g'], answer: '80g' },
  { question: 'Orange and apple juice in ratio 2:3. For 500ml total, how much orange?', options: ['200ml','250ml','150ml','300ml'], answer: '200ml' },
  { question: 'Share £60 in ratio 2:3', options: ['£24 and £36','£20 and £40','£30 and £30','£18 and £42'], answer: '£24 and £36' },
  { question: 'A map scale is 1:50,000. 2 cm on map = ? km in real life?', options: ['1 km','2 km','0.5 km','5 km'], answer: '1 km' },
  { question: 'Simplify the ratio 12:18', options: ['2:3','3:4','4:6','6:9'], answer: '2:3' },
  { question: 'Simplify the ratio 15:25', options: ['3:5','5:8','1:2','6:10'], answer: '3:5' },
  { question: 'Share £90 in ratio 1:2:3', options: ['£15, £30, £45','£10, £30, £50','£20, £30, £40','£18, £27, £45'], answer: '£15, £30, £45' },
  { question: 'A recipe for 4 people needs 300g rice. How much for 6 people?', options: ['450g','400g','500g','350g'], answer: '450g' },
  { question: 'Simplify the ratio 24:36', options: ['2:3','3:4','4:6','6:9'], answer: '2:3' },
  { question: 'Share 120 in ratio 3:5', options: ['45 and 75','40 and 80','60 and 60','30 and 90'], answer: '45 and 75' },
  { question: 'A map scale is 1:25,000. 4 cm on map = ? km in real life?', options: ['1 km','2 km','0.5 km','4 km'], answer: '1 km' },
  { question: 'Simplify the ratio 30:45', options: ['2:3','3:4','5:7','6:9'], answer: '2:3' },
];
const L3: QuizQuestion[] = [
  { question: 'If a:b = 3:4 and b:c = 2:5, what is a:c?', options: ['3:10','6:20','3:5','6:10'], answer: '3:10' },
  { question: 'Share £200 in ratio 3:5:2', options: ['£60, £100, £40','£50, £100, £50','£60, £80, £60','£40, £120, £40'], answer: '£60, £100, £40' },
  { question: 'A mixture is 40% water. What is the ratio of water to non-water?', options: ['2:3','4:6','2:5','4:10'], answer: '2:3' },
  { question: 'If x:y = 5:3 and x = 35, what is y?', options: ['21','15','28','18'], answer: '21' },
  { question: 'A recipe for 8 people needs 600g flour. How much for 5 people?', options: ['375g','400g','350g','450g'], answer: '375g' },
  { question: 'Increase £150 in ratio 3:5', options: ['£250','£225','£275','£200'], answer: '£250' },
  { question: 'If a:b:c = 2:3:5, what fraction of the total is b?', options: ['3/10','2/10','5/10','3/5'], answer: '3/10' },
  { question: 'A map scale is 1:200,000. 5 cm on map = ? km in real life?', options: ['10 km','5 km','20 km','1 km'], answer: '10 km' },
  { question: 'Share 360° in ratio 2:3:4', options: ['80°, 120°, 160°','72°, 108°, 180°','90°, 120°, 150°','60°, 120°, 180°'], answer: '80°, 120°, 160°' },
  { question: 'If p:q = 7:4 and q = 28, what is p?', options: ['49','35','56','42'], answer: '49' },
  { question: 'A recipe uses butter and flour in ratio 1:4. For 500g total, how much butter?', options: ['100g','125g','80g','150g'], answer: '100g' },
  { question: 'Simplify the ratio 0.6:0.9', options: ['2:3','6:9','3:4','1:2'], answer: '2:3' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'ratio-recipe',
  title: 'Ratio Recipe',
  emoji: '🍳',
  subject: 'maths',
  ageGroups: ['10–13'],
  description: 'Master ratios and proportions through cooking and real-world problems!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
