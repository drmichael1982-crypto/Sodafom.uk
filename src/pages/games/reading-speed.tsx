import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Read: "Tom has 3 red apples and 2 green apples." How many apples in total?', options: ['3','4','5','6'], answer: '5' },
  { question: 'Read: "There are 4 cats and 3 dogs in the garden." How many animals in total?', options: ['4','5','6','7'], answer: '7' },
  { question: 'Read: "Mia has 6 sweets. She eats 2." How many does she have left?', options: ['2','3','4','5'], answer: '4' },
  { question: 'Read: "The shop opens at 9am and closes at 5pm." How many hours is it open?', options: ['6','7','8','9'], answer: '8' },
  { question: 'Read: "Ben has 10p. He spends 4p." How much does he have left?', options: ['4p','5p','6p','7p'], answer: '6p' },
  { question: 'Read: "There are 5 boys and 4 girls in the class." How many children in total?', options: ['7','8','9','10'], answer: '9' },
  { question: 'Read: "A book has 20 pages. Sam reads 8 pages." How many pages are left?', options: ['8','10','12','14'], answer: '12' },
  { question: 'Read: "The train leaves at 10am and arrives at 12pm." How long is the journey?', options: ['1 hour','2 hours','3 hours','4 hours'], answer: '2 hours' },
  { question: 'Read: "There are 3 bags with 4 apples in each." How many apples in total?', options: ['7','10','12','15'], answer: '12' },
  { question: 'Read: "A box has 6 rows of 5 chocolates." How many chocolates in total?', options: ['11','25','30','36'], answer: '30' },
  { question: 'Read: "Lily has 15 stickers. She gives 6 away." How many does she have left?', options: ['6','7','8','9'], answer: '9' },
  { question: 'Read: "A class has 24 children. Half go to lunch first." How many go first?', options: ['8','10','12','14'], answer: '12' },
];
const L2: QuizQuestion[] = [
  { question: 'Read: "The quick brown fox jumps over the lazy dog." How many animals are mentioned?', options: ['1','2','3','4'], answer: '2' },
  { question: 'Read: "She had three red apples, two green pears and one yellow banana." How many fruits in total?', options: ['3','5','6','7'], answer: '6' },
  { question: 'Read: "The train left at 9:15 and arrived at 11:45." How long was the journey?', options: ['1h 30m','2h','2h 30m','3h'], answer: '2h 30m' },
  { question: 'Read: "Tom is taller than Sam but shorter than Jack." Who is the tallest?', options: ['Tom','Sam','Jack','Cannot tell'], answer: 'Jack' },
  { question: 'Read: "The shop opens at 8am and closes at 6pm." How many hours is it open?', options: ['8','9','10','11'], answer: '10' },
  { question: 'Read: "There were 24 children. A third went home early." How many stayed?', options: ['8','12','16','18'], answer: '16' },
  { question: 'Read: "The book has 5 chapters. Each chapter has 12 pages." How many pages in total?', options: ['50','55','60','65'], answer: '60' },
  { question: 'Read: "She bought 3 pens at 45p each." How much did she spend?', options: ['£1.15','£1.25','£1.35','£1.45'], answer: '£1.35' },
  { question: 'Read: "The temperature dropped from 8°C to -4°C." By how many degrees did it drop?', options: ['4','8','12','16'], answer: '12' },
  { question: 'Read: "The class has 15 boys and 13 girls." How many children in total?', options: ['26','27','28','29'], answer: '28' },
  { question: 'Read: "A recipe needs 200g flour for 4 people. How much for 6 people?"', options: ['250g','300g','350g','400g'], answer: '300g' },
  { question: 'Read: "A car travels at 60 mph for 2.5 hours." How far does it travel?', options: ['120 miles','140 miles','150 miles','160 miles'], answer: '150 miles' },
];
const L3: QuizQuestion[] = [
  { question: 'Read: "A train travels at 80 mph. How far does it travel in 90 minutes?"', options: ['100 miles','110 miles','120 miles','130 miles'], answer: '120 miles' },
  { question: 'Read: "A rectangle has a perimeter of 36cm. Its length is 10cm. What is its width?"', options: ['6cm','7cm','8cm','9cm'], answer: '8cm' },
  { question: 'Read: "A bag of 5 apples costs £1.20. How much do 8 apples cost?"', options: ['£1.80','£1.92','£2.00','£2.10'], answer: '£1.92' },
  { question: 'Read: "A tank holds 240 litres. It is 3/4 full. How many litres are in it?"', options: ['160','180','200','220'], answer: '180' },
  { question: 'Read: "A shop reduces a £45 item by 20%. What is the sale price?"', options: ['£34','£35','£36','£37'], answer: '£36' },
  { question: 'Read: "A class of 30 pupils: 40% are boys. How many girls are there?"', options: ['12','15','18','20'], answer: '18' },
  { question: 'Read: "A car uses 8 litres per 100km. How many litres for 350km?"', options: ['24','26','28','30'], answer: '28' },
  { question: 'Read: "A recipe for 6 people needs 450g flour. How much for 10 people?"', options: ['700g','725g','750g','775g'], answer: '750g' },
  { question: 'Read: "A worker earns £12.50 per hour and works 37.5 hours per week. What is the weekly wage?"', options: ['£450','£462.50','£468.75','£475'], answer: '£468.75' },
  { question: 'Read: "A square has an area of 196cm². What is its perimeter?"', options: ['52cm','56cm','60cm','64cm'], answer: '56cm' },
  { question: 'Read: "A journey of 180 miles takes 2.5 hours. What is the average speed?"', options: ['68 mph','70 mph','72 mph','74 mph'], answer: '72 mph' },
  { question: 'Read: "A price increases from £80 to £92. What is the percentage increase?"', options: ['12%','13%','14%','15%'], answer: '15%' },
];
const L4: QuizQuestion[] = [
  { question: 'Read: "A cylinder has radius 5cm and height 12cm. What is its volume? (π ≈ 3.14)"', options: ['900cm³','942cm³','960cm³','980cm³'], answer: '942cm³' },
  { question: 'Read: "Solve: 3x + 7 = 22. What is x?"', options: ['4','5','6','7'], answer: '5' },
  { question: 'Read: "A triangle has sides 5cm, 12cm and 13cm. Is it right-angled?"', options: ['No','Yes, because 5²+12²=13²','Yes, because 5+12=17','Cannot tell'], answer: 'Yes, because 5²+12²=13²' },
  { question: 'Read: "A sum of £500 is invested at 4% compound interest for 2 years. What is the total?"', options: ['£540','£540.80','£541.20','£542'], answer: '£540.80' },
  { question: 'Read: "The nth term of a sequence is 3n - 1. What is the 10th term?"', options: ['28','29','30','31'], answer: '29' },
  { question: 'Read: "A sphere has radius 3cm. What is its volume? (V = 4/3πr³, π ≈ 3.14)"', options: ['108.5cm³','110.2cm³','113.1cm³','115.0cm³'], answer: '113.1cm³' },
  { question: 'Read: "Solve: 2x² - 8 = 0. What are the solutions?"', options: ['x = 2 only','x = ±2','x = 4 only','x = ±4'], answer: 'x = ±2' },
  { question: 'Read: "A map has scale 1:50,000. A distance of 4cm on the map represents how many km?"', options: ['1km','2km','3km','4km'], answer: '2km' },
  { question: 'Read: "The probability of event A is 0.3 and event B is 0.5. If independent, what is P(A and B)?"', options: ['0.10','0.15','0.20','0.25'], answer: '0.15' },
  { question: 'Read: "A trapezium has parallel sides 8cm and 12cm, and height 5cm. What is its area?"', options: ['45cm²','48cm²','50cm²','52cm²'], answer: '50cm²' },
  { question: 'Read: "Factorise: x² + 5x + 6."', options: ['(x+2)(x+3)','(x+1)(x+6)','(x+2)(x+4)','(x+3)(x+3)'], answer: '(x+2)(x+3)' },
  { question: 'Read: "A cone has radius 4cm and height 9cm. What is its volume? (V = 1/3πr²h, π ≈ 3.14)"', options: ['148.5cm³','150.7cm³','152.1cm³','153.9cm³'], answer: '150.7cm³' },
];
const L5: QuizQuestion[] = [
  { question: 'Read: "Solve: x² - 5x + 6 = 0. What are the solutions?"', options: ['x = 2 and x = 3','x = -2 and x = -3','x = 1 and x = 6','x = -1 and x = -6'], answer: 'x = 2 and x = 3' },
  { question: 'Read: "A geometric sequence has first term 3 and common ratio 2. What is the 8th term?"', options: ['192','256','384','512'], answer: '384' },
  { question: 'Read: "Differentiate: y = 3x² + 2x - 5. What is dy/dx?"', options: ['6x + 2','3x + 2','6x - 5','3x² + 2'], answer: '6x + 2' },
  { question: 'Read: "Integrate: ∫(2x + 3)dx. What is the result?"', options: ['x² + 3x + C','2x² + 3x + C','x² + 3 + C','2x + 3 + C'], answer: 'x² + 3x + C' },
  { question: 'Read: "A circle has equation x² + y² = 25. What is its radius?"', options: ['5','10','25','√5'], answer: '5' },
  { question: 'Read: "Solve: log₂(x) = 4. What is x?"', options: ['8','12','16','20'], answer: '16' },
  { question: 'Read: "A vector has components (3, 4). What is its magnitude?"', options: ['5','6','7','8'], answer: '5' },
  { question: 'Read: "Solve: sin(x) = 0.5 for 0° ≤ x ≤ 360°. What are the solutions?"', options: ['30° only','30° and 150°','60° and 120°','45° and 135°'], answer: '30° and 150°' },
  { question: 'Read: "The sum of an arithmetic series with first term 2, last term 50 and 25 terms is…"', options: ['600','625','650','675'], answer: '650' },
  { question: 'Read: "Expand: (2x + 3)². What is the result?"', options: ['4x² + 9','4x² + 6x + 9','4x² + 12x + 9','4x² + 12x + 6'], answer: '4x² + 12x + 9' },
  { question: 'Read: "A matrix A = [[1,2],[3,4]]. What is det(A)?"', options: ['-2','2','-4','4'], answer: '-2' },
  { question: 'Read: "Solve: e^x = 10. What is x? (ln 10 ≈ 2.303)"', options: ['2.303','2.5','3.0','3.303'], answer: '2.303' },
];

export default function ReadingSpeedGame() {
  return (
    <>
      <Helmet>
        <title>Reading Speed — Sodafom</title>
        <meta name="description" content="Improve your reading speed and comprehension!" />
        <link rel="canonical" href="https://sodafom.uk/games/reading-speed" />
        <meta property="og:title" content="Reading Speed — Sodafom" />
        <meta property="og:description" content="Improve your reading speed and comprehension!" />
        <meta property="og:url" content="https://sodafom.uk/games/reading-speed" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Reading Speed — English Game for Kids — Sodafom</h1>
      <GameShell title="Reading Speed" emoji="⚡" subject="reading" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="reading-speed"
            title="Reading Speed"
            emoji="⚡"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
