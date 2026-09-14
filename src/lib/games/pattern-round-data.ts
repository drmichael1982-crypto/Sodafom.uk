import { nextRound, shuffle } from './ten-question-round';
export type PatternItem = {
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'diamond';
  color: string;
  label: string; // for accessibility / speech
};

export type Question = {
  id: string;
  type: 'shape-color' | 'number' | 'emoji';
  sequence: (PatternItem | string)[];
  blankIndex: number; // which position is the blank
  options: (PatternItem | string)[];
  answer: PatternItem | string;
  hint: string;
  ageGroup: '4-6' | '7-9' | '10-13';
};

const C = (shape: PatternItem['shape'], color: string): PatternItem => ({ shape, color, label: `${color} ${shape}` });

export const PATTERN_QUESTIONS: Question[] = [
  // ── Easy (ages 4–6): simple 2-element repeating colour/shape patterns ──────
  {
    id: 'q1', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('circle','red'), C('circle','blue'), C('circle','red'), C('circle','blue'), C('circle','red'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('circle','blue'), C('circle','red'), C('circle','green'), C('circle','yellow')],
    answer: C('circle','blue'),
    hint: 'Red, blue, red, blue… what comes next?',
  },
  {
    id: 'q2', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('square','yellow'), C('square','green'), C('square','yellow'), C('square','green'), null as unknown as PatternItem],
    blankIndex: 4,
    options: [C('square','yellow'), C('square','green'), C('square','blue'), C('square','red')],
    answer: C('square','yellow'),
    hint: 'Yellow, green, yellow, green… what comes next?',
  },
  {
    id: 'q3', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('triangle','red'), C('circle','red'), C('triangle','red'), C('circle','red'), C('triangle','red'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('triangle','red'), C('circle','red'), C('square','red'), C('diamond','red')],
    answer: C('circle','red'),
    hint: 'Triangle, circle, triangle, circle… what comes next?',
  },
  {
    id: 'q4', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('star','yellow'), C('star','yellow'), C('circle','blue'), C('star','yellow'), C('star','yellow'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('star','yellow'), C('circle','blue'), C('star','blue'), C('circle','yellow')],
    answer: C('circle','blue'),
    hint: 'Star, star, circle, star, star… what comes next?',
  },
  {
    id: 'q5', type: 'shape-color', ageGroup: '4-6',
    sequence: [C('circle','purple'), C('square','orange'), C('circle','purple'), C('square','orange'), null as unknown as PatternItem],
    blankIndex: 4,
    options: [C('circle','purple'), C('square','orange'), C('circle','orange'), C('square','purple')],
    answer: C('circle','purple'),
    hint: 'Purple circle, orange square… what comes next?',
  },
  // ── Medium (ages 7–9): 3-element patterns + growing patterns ──────────────
  {
    id: 'q6', type: 'shape-color', ageGroup: '7-9',
    sequence: [C('circle','red'), C('square','blue'), C('triangle','green'), C('circle','red'), C('square','blue'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('triangle','green'), C('circle','red'), C('square','blue'), C('diamond','green')],
    answer: C('triangle','green'),
    hint: 'Red circle, blue square, green triangle… the pattern repeats!',
  },
  {
    id: 'q7', type: 'shape-color', ageGroup: '7-9',
    sequence: [C('diamond','pink'), C('star','yellow'), C('diamond','pink'), C('star','yellow'), C('diamond','pink'), null as unknown as PatternItem],
    blankIndex: 5,
    options: [C('star','yellow'), C('diamond','pink'), C('star','pink'), C('diamond','yellow')],
    answer: C('star','yellow'),
    hint: 'Pink diamond, yellow star… what comes after the pink diamond?',
  },
  {
    id: 'q8', type: 'number', ageGroup: '7-9',
    sequence: ['2', '4', '6', '8', '?'],
    blankIndex: 4,
    options: ['9', '10', '11', '12'],
    answer: '10',
    hint: 'Add 2 each time: 2, 4, 6, 8…',
  },
  {
    id: 'q9', type: 'number', ageGroup: '7-9',
    sequence: ['5', '10', '15', '20', '?'],
    blankIndex: 4,
    options: ['22', '24', '25', '30'],
    answer: '25',
    hint: 'Count in 5s!',
  },
  {
    id: 'q10', type: 'emoji', ageGroup: '7-9',
    sequence: ['🔴', '🔵', '🟡', '🔴', '🔵', '?'],
    blankIndex: 5,
    options: ['🟡', '🔴', '🔵', '🟢'],
    answer: '🟡',
    hint: 'Red, blue, yellow, red, blue… what comes next?',
  },
  // ── Hard (ages 10–13): number sequences, Fibonacci, square numbers ─────────
  {
    id: 'q11', type: 'number', ageGroup: '10-13',
    sequence: ['1', '4', '9', '16', '?'],
    blankIndex: 4,
    options: ['20', '24', '25', '36'],
    answer: '25',
    hint: 'These are square numbers: 1², 2², 3², 4²…',
  },
  {
    id: 'q12', type: 'number', ageGroup: '10-13',
    sequence: ['2', '4', '8', '16', '?'],
    blankIndex: 4,
    options: ['24', '28', '32', '36'],
    answer: '32',
    hint: 'Double each time!',
  },
  {
    id: 'q13', type: 'number', ageGroup: '10-13',
    sequence: ['1', '1', '2', '3', '5', '8', '?'],
    blankIndex: 6,
    options: ['10', '11', '12', '13'],
    answer: '13',
    hint: 'Add the two previous numbers together — Fibonacci!',
  },
  {
    id: 'q14', type: 'number', ageGroup: '10-13',
    sequence: ['3', '9', '27', '81', '?'],
    blankIndex: 4,
    options: ['162', '243', '324', '405'],
    answer: '243',
    hint: 'Multiply by 3 each time!',
  },
  {
    id: 'q15', type: 'number', ageGroup: '10-13',
    sequence: ['100', '90', '80', '70', '?'],
    blankIndex: 4,
    options: ['55', '60', '65', '75'],
    answer: '60',
    hint: 'Count backwards in 10s!',
  },
];


// Extend the existing repeating and growing patterns within each stated age band.
for (let i = 0; i < 12; i++) {
  const colors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];
  const shapes: PatternItem['shape'][] = ['circle', 'square', 'triangle', 'star'];
  const a = C(shapes[Math.floor(i / 6)], colors[i % 6]);
  const b = C(shapes[(Math.floor(i / 6) + 1) % shapes.length], colors[(i + 1) % 6]);
  PATTERN_QUESTIONS.push({id: `easy-${i}`, type: 'shape-color', ageGroup: '4-6', sequence: [a, b, a, b, a, '?'], blankIndex: 5, answer: b, options: [b, a, C('diamond', 'pink'), C('star', 'yellow')], hint: `Repeat ${a.label}, ${b.label}.`});
  const step = i % 2 === 0 ? 2 : 5, start = i + 1, answer = start + step * 4;
  PATTERN_QUESTIONS.push({id: `medium-${i}`, type: 'number', ageGroup: '7-9', sequence: [...Array.from({length: 4}, (_, n) => String(start + n * step)), '?'], blankIndex: 4, answer: String(answer), options: [answer, answer + 1, answer - 1, answer + 2].map(String), hint: `Add ${step} each time.`});
  const first = i + 2, square = (first + 4) ** 2;
  PATTERN_QUESTIONS.push({id: `hard-${i}`, type: 'number', ageGroup: '10-13', sequence: [...Array.from({length: 4}, (_, n) => String((first + n) ** 2)), '?'], blankIndex: 4, answer: String(square), options: [square, square + 1, square - 1, square + 2].map(String), hint: `These are consecutive square numbers, starting at ${first} squared.`});
}
export function patternRound(ageGroup: Question['ageGroup']) {
  return nextRound(PATTERN_QUESTIONS.filter(q => q.ageGroup === ageGroup), q => JSON.stringify(q.sequence), `patterns-${ageGroup}`).map(q => ({...q, options: shuffle(q.options)}));
}
