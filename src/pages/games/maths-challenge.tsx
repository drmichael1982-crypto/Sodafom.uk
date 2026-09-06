import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: '15 + 27 = ?', options: ['42','40','44','38'], answer: '42' },
  { question: '36 - 18 = ?', options: ['18','16','20','14'], answer: '18' },
  { question: '7 × 8 = ?', options: ['56','54','58','48'], answer: '56' },
  { question: '48 ÷ 6 = ?', options: ['8','7','9','6'], answer: '8' },
  { question: '23 + 45 = ?', options: ['68','66','70','64'], answer: '68' },
  { question: '72 - 35 = ?', options: ['37','35','39','33'], answer: '37' },
  { question: '9 × 6 = ?', options: ['54','52','56','48'], answer: '54' },
  { question: '63 ÷ 7 = ?', options: ['9','8','10','7'], answer: '9' },
  { question: '34 + 58 = ?', options: ['92','90','94','88'], answer: '92' },
  { question: '85 - 47 = ?', options: ['38','36','40','34'], answer: '38' },
  { question: '8 × 7 = ?', options: ['56','54','58','48'], answer: '56' },
  { question: '72 ÷ 8 = ?', options: ['9','8','10','7'], answer: '9' },
];
const L2: QuizQuestion[] = [
  { question: '125 + 378 = ?', options: ['503','493','513','483'], answer: '503' },
  { question: '500 - 237 = ?', options: ['263','253','273','243'], answer: '263' },
  { question: '24 × 5 = ?', options: ['120','110','130','100'], answer: '120' },
  { question: '144 ÷ 12 = ?', options: ['12','11','13','10'], answer: '12' },
  { question: '456 + 287 = ?', options: ['743','733','753','723'], answer: '743' },
  { question: '800 - 365 = ?', options: ['435','425','445','415'], answer: '435' },
  { question: '36 × 4 = ?', options: ['144','134','154','124'], answer: '144' },
  { question: '196 ÷ 14 = ?', options: ['14','13','15','12'], answer: '14' },
  { question: '567 + 348 = ?', options: ['915','905','925','895'], answer: '915' },
  { question: '1000 - 437 = ?', options: ['563','553','573','543'], answer: '563' },
  { question: '48 × 6 = ?', options: ['288','278','298','268'], answer: '288' },
  { question: '225 ÷ 15 = ?', options: ['15','14','16','13'], answer: '15' },
];
const L3: QuizQuestion[] = [
  { question: '15% of 200 = ?', options: ['30','25','35','20'], answer: '30' },
  { question: '25% of 160 = ?', options: ['40','30','50','35'], answer: '40' },
  { question: '3/4 of 96 = ?', options: ['72','64','80','68'], answer: '72' },
  { question: '2.5 × 4 = ?', options: ['10','8','12','9'], answer: '10' },
  { question: '3.6 + 2.8 = ?', options: ['6.4','6.2','6.6','6.0'], answer: '6.4' },
  { question: '7.5 - 3.8 = ?', options: ['3.7','3.5','3.9','3.3'], answer: '3.7' },
  { question: '12² = ?', options: ['144','124','164','134'], answer: '144' },
  { question: '√64 = ?', options: ['8','6','10','7'], answer: '8' },
  { question: '40% of 350 = ?', options: ['140','130','150','120'], answer: '140' },
  { question: '5/8 of 64 = ?', options: ['40','32','48','36'], answer: '40' },
  { question: '1.25 × 8 = ?', options: ['10','9','11','8'], answer: '10' },
  { question: '15² = ?', options: ['225','215','235','205'], answer: '225' },
];
const L4: QuizQuestion[] = [
  { question: 'What is 35% of 480?', options: ['168','148','188','158'], answer: '168' },
  { question: 'Increase 250 by 20%?', options: ['300','270','280','320'], answer: '300' },
  { question: 'Decrease 400 by 15%?', options: ['340','360','320','380'], answer: '340' },
  { question: '3.6 × 2.5 = ?', options: ['9','8','10','7'], answer: '9' },
  { question: '√144 = ?', options: ['12','11','13','10'], answer: '12' },
  { question: '2³ × 3² = ?', options: ['72','54','64','81'], answer: '72' },
  { question: 'What is 7/8 of 96?', options: ['84','72','90','78'], answer: '84' },
  { question: '0.4 × 0.6 = ?', options: ['0.24','0.24','0.12','0.36'], answer: '0.24' },
  { question: 'What is 45% of 360?', options: ['162','144','180','126'], answer: '162' },
  { question: '√225 = ?', options: ['15','12','18','14'], answer: '15' },
  { question: '4³ = ?', options: ['64','48','32','128'], answer: '64' },
  { question: 'What is 5/6 of 120?', options: ['100','90','110','80'], answer: '100' },
];
const L5: QuizQuestion[] = [
  { question: 'What is 17.5% of 640?', options: ['112','96','128','104'], answer: '112' },
  { question: 'If 3x + 7 = 22, what is x?', options: ['5','4','6','7'], answer: '5' },
  { question: 'What is the LCM of 12 and 18?', options: ['36','24','18','72'], answer: '36' },
  { question: 'What is the HCF of 48 and 36?', options: ['12','6','18','24'], answer: '12' },
  { question: '2.4² = ?', options: ['5.76','4.8','6.4','4.96'], answer: '5.76' },
  { question: 'What is 3/7 of 343?', options: ['147','98','196','126'], answer: '147' },
  { question: 'Increase 360 by 12.5%?', options: ['405','396','414','387'], answer: '405' },
  { question: '√(3² + 4²) = ?', options: ['5','6','7','4'], answer: '5' },
  { question: 'What is 0.35 as a fraction in its simplest form?', options: ['7/20','35/100','7/10','3/5'], answer: '7/20' },
  { question: 'What is 2⁵?', options: ['32','16','64','24'], answer: '32' },
  { question: 'What is the nth term of: 3, 7, 11, 15…?', options: ['4n-1','3n+1','4n+3','2n+1'], answer: '4n-1' },
  { question: 'What is 5/9 of 270?', options: ['150','135','165','120'], answer: '150' },
];

export default makeGame({
  slug: 'maths-challenge',
  title: 'Maths Challenge',
  emoji: '🧮',
  subject: 'maths',
  ageGroups: ['10–13'],
  description: 'A challenging maths workout covering all key topics — are you up to it?',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
