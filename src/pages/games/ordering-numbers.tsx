import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which is the smallest? 3, 7, 1, 5', options: ['1','3','5','7'], answer: '1' },
  { question: 'Which is the largest? 4, 9, 2, 6', options: ['9','6','4','2'], answer: '9' },
  { question: 'Put in order (smallest first): 5, 2, 8, 1', options: ['1,2,5,8','2,1,5,8','1,5,2,8','2,5,1,8'], answer: '1,2,5,8' },
  { question: 'Which is the smallest? 12, 7, 19, 4', options: ['4','7','12','19'], answer: '4' },
  { question: 'Which is the largest? 23, 45, 12, 67', options: ['67','45','23','12'], answer: '67' },
  { question: 'Put in order (largest first): 8, 3, 11, 6', options: ['11,8,6,3','8,11,6,3','11,6,8,3','8,6,11,3'], answer: '11,8,6,3' },
  { question: 'Which is the smallest? 100, 50, 75, 25', options: ['25','50','75','100'], answer: '25' },
  { question: 'Which is the largest? 99, 101, 98, 100', options: ['101','100','99','98'], answer: '101' },
  { question: 'Put in order (smallest first): 30, 10, 50, 20', options: ['10,20,30,50','20,10,30,50','10,30,20,50','20,30,10,50'], answer: '10,20,30,50' },
  { question: 'Which is the smallest? 500, 250, 750, 125', options: ['125','250','500','750'], answer: '125' },
  { question: 'Which is the largest? 999, 1000, 998, 1001', options: ['1001','1000','999','998'], answer: '1001' },
  { question: 'Put in order (largest first): 45, 54, 44, 55', options: ['55,54,45,44','54,55,45,44','55,45,54,44','54,45,55,44'], answer: '55,54,45,44' },
];
const L2: QuizQuestion[] = [
  { question: 'Which is the smallest? 0.5, 0.25, 0.75, 0.1', options: ['0.1','0.25','0.5','0.75'], answer: '0.1' },
  { question: 'Which is the largest? 1/2, 1/4, 3/4, 1/3', options: ['3/4','1/2','1/3','1/4'], answer: '3/4' },
  { question: 'Put in order (smallest first): -3, 1, -5, 2', options: ['-5,-3,1,2','-3,-5,1,2','-5,1,-3,2','-3,1,-5,2'], answer: '-5,-3,1,2' },
  { question: 'Which is the smallest? 2.5, 2.05, 2.55, 2.50', options: ['2.05','2.5','2.50','2.55'], answer: '2.05' },
  { question: 'Which is the largest? 3/5, 2/3, 5/8, 7/10', options: ['2/3','3/5','5/8','7/10'], answer: '2/3' },
  { question: 'Put in order (largest first): -1, -4, 0, -2', options: ['0,-1,-2,-4','-1,0,-2,-4','0,-2,-1,-4','-1,-2,0,-4'], answer: '0,-1,-2,-4' },
  { question: 'Which is the smallest? 1.23, 1.32, 1.2, 1.3', options: ['1.2','1.23','1.3','1.32'], answer: '1.2' },
  { question: 'Which is the largest? 5/6, 7/8, 11/12, 3/4', options: ['11/12','7/8','5/6','3/4'], answer: '11/12' },
  { question: 'Put in order (smallest first): 0.3, 1/3, 0.33, 33%', options: ['0.3,1/3,0.33,33%','1/3,0.3,0.33,33%','0.3,0.33,1/3,33%','0.33,0.3,1/3,33%'], answer: '0.3,1/3,0.33,33%' },
  { question: 'Which is the smallest? -7, -3, -10, -1', options: ['-10','-7','-3','-1'], answer: '-10' },
  { question: 'Which is the largest? 0.9, 9/10, 89%, 0.89', options: ['0.9','9/10','89%','0.89'], answer: '0.9' },
  { question: 'Put in order (largest first): 2/3, 0.6, 65%, 0.67', options: ['2/3,0.67,65%,0.6','0.67,2/3,65%,0.6','2/3,0.67,0.6,65%','0.67,0.6,2/3,65%'], answer: '2/3,0.67,65%,0.6' },
];
const L3: QuizQuestion[] = [
  { question: 'Put in order (smallest first): 3/4, 0.7, 70%, 7/10', options: ['0.7,70%,7/10,3/4','3/4,0.7,70%,7/10','0.7,7/10,70%,3/4','All are equal'], answer: 'All are equal' },
  { question: 'Which is the largest? √2, 1.4, 1.41, 1.415', options: ['√2','1.4','1.41','1.415'], answer: '√2' },
  { question: 'Put in order (smallest first): -0.5, -1/2, -0.49, -0.51', options: ['-0.51,-0.5,-1/2,-0.49','-0.49,-0.5,-1/2,-0.51','-0.5,-1/2,-0.49,-0.51','-0.51,-1/2,-0.5,-0.49'], answer: '-0.51,-0.5,-1/2,-0.49' },
  { question: 'Which is the smallest? 2⁻¹, 0.4, 2/5, 40%', options: ['2⁻¹','0.4','2/5','All are equal'], answer: 'All are equal' },
  { question: 'Put in order (largest first): 1.5², √5, 2.2, 2.25', options: ['1.5²,2.25,√5,2.2','2.25,1.5²,√5,2.2','√5,2.25,1.5²,2.2','2.25,√5,1.5²,2.2'], answer: '2.25,1.5²,√5,2.2' },
  { question: 'Which is the largest? 5/3, 1.6, 1.67, 1.666...', options: ['5/3','1.6','1.67','1.666...'], answer: '1.67' },
  { question: 'Put in order (smallest first): -2², (-2)², -4, 4', options: ['-4,-2²,-2²,4','-4,-2²,4,(-2)²','(-2)² and -2² are equal, then -4 and 4','−4,−2²,4,(−2)²'], answer: '−4,−2²,4,(−2)²' },
  { question: 'Which is the smallest? 0.1%, 0.001, 1/1000, 0.0001', options: ['0.1%','0.001','1/1000','0.0001'], answer: '0.0001' },
  { question: 'Put in order (largest first): π, 3.14, 22/7, 3.142', options: ['22/7,π,3.142,3.14','π,22/7,3.142,3.14','22/7,3.142,π,3.14','3.142,π,22/7,3.14'], answer: '22/7,3.142,π,3.14' },
  { question: 'Which is the largest? 2³, 3², 8, 9', options: ['2³','3²','8','3² and 9 are equal, and larger'], answer: '3² and 9 are equal, and larger' },
  { question: 'Put in order (smallest first): 1/3, 0.333, 33.3%, 0.3', options: ['0.3,0.333,33.3%,1/3','0.3,1/3,0.333,33.3%','0.3,0.333,1/3,33.3%','1/3,0.333,33.3%,0.3'], answer: '0.3,0.333,33.3%,1/3' },
  { question: 'Which is the smallest? 10⁻², 0.01, 1%, 0.009', options: ['10⁻²','0.01','1%','0.009'], answer: '0.009' },
];
const L4: QuizQuestion[] = [
  { question: 'Put in order (smallest first): log₁₀(100), √10, π, e', options: ['e,π,√10,log₁₀(100)','log₁₀(100),e,π,√10','√10,π,e,log₁₀(100)','π,e,√10,log₁₀(100)'], answer: 'log₁₀(100),e,π,√10' },
  { question: 'Which is the largest? 2^10, 10^3, 1000, 1024', options: ['2^10 and 1024 are equal, and largest','10^3 and 1000 are equal, and largest','All are equal','2^10 is largest'], answer: '2^10 and 1024 are equal, and largest' },
  { question: 'Put in order (smallest first): -π, -3.14, -22/7, -3.142', options: ['-22/7,-3.142,-π,-3.14','-3.14,-π,-3.142,-22/7','-22/7,-π,-3.142,-3.14','-3.14,-3.142,-π,-22/7'], answer: '-22/7,-3.142,-π,-3.14' },
  { question: 'Which is the smallest? 0.1^2, 0.01, 1/100, 1%', options: ['0.1^2','0.01','1/100','All are equal'], answer: 'All are equal' },
  { question: 'Put in order (largest first): 5!, 120, 5^3, 100', options: ['5! and 120 are equal, then 5^3, then 100','5^3,100,5!,120','100,5^3,5!,120','5!,5^3,120,100'], answer: '5! and 120 are equal, then 5^3, then 100' },
  { question: 'Which is the largest? sin(90°), cos(0°), tan(45°), 1', options: ['sin(90°)','cos(0°)','tan(45°)','All are equal (= 1)'], answer: 'All are equal (= 1)' },
  { question: 'Put in order (smallest first): 1/∞, 0, -1/∞, 0.0001', options: ['-1/∞,1/∞,0,0.0001','-1/∞,0,1/∞,0.0001','0,1/∞,-1/∞,0.0001','0.0001,0,1/∞,-1/∞'], answer: '-1/∞,0,1/∞,0.0001' },
  { question: 'Which is the largest? 3/7, 4/9, 5/11, 6/13', options: ['3/7','4/9','5/11','6/13'], answer: '3/7' },
  { question: 'Put in order (largest first): 2^0.5, 4^0.25, 8^(1/6), 16^(1/8)', options: ['All are equal (= √2)','2^0.5,4^0.25,8^(1/6),16^(1/8)','16^(1/8),8^(1/6),4^0.25,2^0.5','8^(1/6),4^0.25,2^0.5,16^(1/8)'], answer: 'All are equal (= √2)' },
  { question: 'Which is the smallest? 1 - 0.1, 9/10, 0.9, 90%', options: ['1 - 0.1','9/10','0.9','All are equal'], answer: 'All are equal' },
  { question: 'Put in order (smallest first): -√2, -1.41, -1.415, -1.4', options: ['-√2,-1.415,-1.41,-1.4','-1.4,-1.41,-1.415,-√2','-1.415,-√2,-1.41,-1.4','-1.4,-1.41,-√2,-1.415'], answer: '-√2,-1.415,-1.41,-1.4' },
  { question: 'Which is the largest? 100^0.5, 10, √100, 10^1', options: ['100^0.5','10','√100','All are equal (= 10)'], answer: 'All are equal (= 10)' },
];
const L5: QuizQuestion[] = [
  { question: 'Put in order (smallest first): e^0, ln(e), e^(1/e), e^0.5', options: ['e^0,ln(e),e^(1/e),e^0.5','e^0 and ln(e) are equal, then e^(1/e), then e^0.5','e^(1/e),e^0,ln(e),e^0.5','e^0.5,e^(1/e),e^0,ln(e)'], answer: 'e^0 and ln(e) are equal, then e^(1/e), then e^0.5' },
  { question: 'Which is the largest? ⁴√256, ³√64, √16, 4', options: ['⁴√256','³√64','√16','All are equal (= 4)'], answer: 'All are equal (= 4)' },
  { question: 'Put in order (largest first): 0.999..., 1, 1.000...1, 1 - 10^(-100)', options: ['1.000...1,0.999...,1,1-10^(-100)','1.000...1 and 1 are equal, then 0.999... and 1-10^(-100)','0.999... and 1 are equal, then 1.000...1','All are equal'], answer: '1.000...1 and 1 are equal, then 0.999... and 1-10^(-100)' },
  { question: 'Which is the smallest? Googol (10^100), 2^333, 10^100, googol', options: ['Googol and 10^100 are equal, and 2^333 is smaller','2^333','10^100','All are equal'], answer: 'Googol and 10^100 are equal, and 2^333 is smaller' },
  { question: 'Put in order (smallest first): 1/e, 1/π, 1/3, 0.3', options: ['1/π,1/e,0.3,1/3','0.3,1/3,1/e,1/π','1/π,1/e,1/3,0.3','0.3,1/3,1/π,1/e'], answer: '1/π,1/e,0.3,1/3' },
  { question: 'Which is the largest? i², -1, cos(π), -cos(0)', options: ['i²','-1','cos(π)','All are equal (= -1)'], answer: 'All are equal (= -1)' },
  { question: 'Put in order (largest first): 10!, 10^6, 3628800, 10^7', options: ['10^7,10! and 3628800 are equal,10^6','10!,3628800,10^7,10^6','10^7,10^6,10!,3628800','10! and 3628800 are equal, then 10^7, then 10^6'], answer: '10^7,10! and 3628800 are equal,10^6' },
  { question: 'Which is the smallest? Aleph-null (ℵ₀), infinity (∞), countable infinity, ω', options: ['All represent the same concept of countable infinity','Aleph-null','Infinity','Omega'], answer: 'All represent the same concept of countable infinity' },
  { question: 'Put in order (smallest first): 2^(2^2), 4^4, 2^16, 65536', options: ['All are equal (= 65536)','2^(2^2),4^4,2^16,65536','65536,2^16,4^4,2^(2^2)','2^(2^2),2^16,4^4,65536'], answer: 'All are equal (= 65536)' },
  { question: 'Which is the largest? sin²(x) + cos²(x), 1, sec²(x) - tan²(x), csc²(x) - cot²(x)', options: ['sin²(x)+cos²(x)','1','sec²(x)-tan²(x)','All are equal (= 1) by Pythagorean identities'], answer: 'All are equal (= 1) by Pythagorean identities' },
  { question: 'Put in order (smallest first): 0.1, 10^(-1), 1/10, 10%', options: ['All are equal (= 0.1)','0.1,10^(-1),1/10,10%','10%,1/10,10^(-1),0.1','10^(-1),0.1,1/10,10%'], answer: 'All are equal (= 0.1)' },
  { question: 'Which is the largest? lim(n→∞) (1+1/n)^n, e, 2.718, 2.71828', options: ['lim(n→∞)(1+1/n)^n and e are equal, and largest','e','2.718','2.71828'], answer: 'lim(n→∞)(1+1/n)^n and e are equal, and largest' },
];

export default function OrderingNumbersGame() {
  return (
    <>
      <Helmet>
        <title>Ordering Numbers — Sodafom</title>
        <meta name="description" content="Practice ordering numbers from smallest to largest!" />
        <link rel="canonical" href="https://sodafom.uk/games/ordering-numbers" />
        <meta property="og:title" content="Ordering Numbers — Sodafom" />
        <meta property="og:description" content="Practice ordering numbers from smallest to largest!" />
        <meta property="og:url" content="https://sodafom.uk/games/ordering-numbers" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Ordering Numbers — Maths Game for Kids — Sodafom</h1>
      <GameShell title="Ordering Numbers" emoji="🔢" subject="maths" ageGroups={['5–7', '7–9']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="ordering-numbers"
            title="Ordering Numbers"
            emoji="🔢"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-secondary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
