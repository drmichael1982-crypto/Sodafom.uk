import type { QuizQuestion } from '@/components/games/QuizEngine';

const mix = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function choices(answer: number, spread = 6): string[] {
  const values = new Set<number>([answer]);
  let step = 1;
  while (values.size < 4) {
    const candidate = answer + (step % 2 ? step : -step);
    if (candidate >= 0 && candidate !== answer) {
      values.add(candidate);
    } else {
      values.add(answer + step * 3);
    }
    step++;
  }
  const opts = [...values].map(String);
  // Ensure exactly 4 unique options
  while (opts.length < 4) {
    const fallback = answer + opts.length * 5;
    if (!opts.includes(String(fallback))) opts.push(String(fallback));
  }
  return mix(opts);
}

export function generateMathQuestions(slug: string, ageTier: 1 | 2 | 3, level: number): QuizQuestion[] {
  const difficulty = Math.max(1, level + ageTier - 1);
  const generated: QuizQuestion[] = [];
  const lowerSlug = slug.toLowerCase();

  for (let i = 1; i <= 20; i += 1) {
    let question = '';
    let answerVal = 0;
    let options: string[] = [];
    let correctStr = '';

    if (/times|multiplication|tables/.test(lowerSlug)) {
      const left = 2 + (i % 11); // 2 to 12
      const right = 2 + ((i * 3 + difficulty) % 11); // 2 to 12
      question = `What is ${left} × ${right}?`;
      answerVal = left * right;
      options = choices(answerVal, Math.max(4, difficulty * 3));
      correctStr = String(answerVal);
    } else if (/division|divide/.test(lowerSlug)) {
      const divisor = 2 + (i % 10);
      const quotient = 2 + ((i * 2) % 12);
      const dividend = divisor * quotient;
      question = `What is ${dividend} ÷ ${divisor}?`;
      answerVal = quotient;
      options = choices(answerVal, 4);
      correctStr = String(answerVal);
    } else if (/number-bonds|bonds/.test(lowerSlug)) {
      const target = i % 2 === 0 ? 10 : 20;
      const a = 1 + (i % (target - 1));
      answerVal = target - a;
      question = `What number makes ${target} when added to ${a}? (${a} + ? = ${target})`;
      options = choices(answerVal, 3);
      correctStr = String(answerVal);
    } else if (/place-value|place/.test(lowerSlug)) {
      const val = 10 * (1 + (i % 9)) + (i % 10);
      const tens = Math.floor(val / 10) * 10;
      question = `What is the value of the digit in the tens place in ${val}?`;
      answerVal = tens;
      options = choices(answerVal, 10);
      correctStr = String(answerVal);
    } else if (/counting|count/.test(lowerSlug)) {
      const step = 2 + (i % 4);
      const start = (i % 3) * step;
      const seq = [start, start + step, start + step * 2];
      answerVal = start + step * 3;
      question = `What comes next in the sequence: ${seq.join(', ')}, ...?`;
      options = choices(answerVal, step);
      correctStr = String(answerVal);
    } else if (/odd-even|odd|even/.test(lowerSlug)) {
      const value = difficulty * 3 + i * 2;
      const correct = value % 2 === 0 ? 'Even' : 'Odd';
      generated.push({
        question: `Is ${value} odd or even?`,
        options: mix(['Odd', 'Even']),
        answer: correct
      });
      continue;
    } else if (/comparing|compare/.test(lowerSlug)) {
      const a = 10 + (i * 3) % 80;
      const b = 10 + ((i * 7) + 5) % 80;
      if (a === b) continue;
      const correct = a > b ? '>' : '<';
      generated.push({
        question: `Which sign correctly compares these numbers: ${a} [ ? ] ${b}?`,
        options: mix(['<', '>', '=']),
        answer: correct
      });
      continue;
    } else if (/fractions|fraction/.test(lowerSlug)) {
      const denom = i % 2 === 0 ? 2 : 4;
      const multiplier = 2 + (i % 5);
      const total = denom * multiplier;
      const fractionText = denom === 2 ? 'half' : 'quarter';
      answerVal = multiplier;
      question = `What is 1/${denom} of ${total}?`;
      options = choices(answerVal, 2);
      correctStr = String(answerVal);
    } else if (/decimals|decimal/.test(lowerSlug)) {
      const a = (i % 8) + 1.2;
      const b = (i % 5) + 0.5;
      answerVal = Math.round((a + b) * 10) / 10;
      question = `What is ${Math.round(a * 10) / 10} + ${Math.round(b * 10) / 10}?`;
      const opts = new Set<string>([String(answerVal), String(answerVal + 1), String(Math.max(0, answerVal - 1)), String(answerVal + 0.5)]);
      generated.push({
        question,
        options: mix([...opts]),
        answer: String(answerVal)
      });
      continue;
    } else if (/percentages|percentage|percent/.test(lowerSlug)) {
      const pct = i % 2 === 0 ? 50 : 25;
      const base = pct === 50 ? 40 + (i * 2) : 60 + (i * 4);
      answerVal = (pct / 100) * base;
      question = `What is ${pct}% of ${base}?`;
      options = choices(answerVal, 5);
      correctStr = String(answerVal);
    } else if (/money|coins/.test(lowerSlug)) {
      const startPence = 50 + (i * 25);
      const spendPence = 20 + (i * 10);
      if (startPence <= spendPence) continue;
      answerVal = (startPence - spendPence) / 100;
      question = `If you have £${(startPence / 100).toFixed(2)} and spend £${(spendPence / 100).toFixed(2)}, how much do you have left (£)?`;
      options = choices(answerVal, 1);
      correctStr = String(answerVal);
    } else if (/time|clock/.test(lowerSlug)) {
      const hours = 1 + (i % 4);
      answerVal = hours * 60;
      question = `How many minutes are in ${hours} hour${hours > 1 ? 's' : ''}?`;
      options = choices(answerVal, 15);
      correctStr = String(answerVal);
    } else if (/measurement|length|weight|mass|capacity/.test(lowerSlug)) {
      const meters = 1 + (i % 5);
      answerVal = meters * 100;
      question = `How many centimeters are in ${meters} meter${meters > 1 ? 's' : ''}?`;
      options = choices(answerVal, 50);
      correctStr = String(answerVal);
    } else if (/shapes|geometry|angle/.test(lowerSlug)) {
      const shapes = [
        { q: 'How many sides does a triangle have?', a: 3 },
        { q: 'How many corners does a square have?', a: 4 },
        { q: 'How many sides does a pentagon have?', a: 5 },
        { q: 'How many sides does a hexagon have?', a: 6 },
      ];
      const chosen = shapes[i % shapes.length];
      question = chosen.q;
      answerVal = chosen.a;
      options = choices(answerVal, 1);
      correctStr = String(answerVal);
    } else if (/perimeter/.test(lowerSlug)) {
      const width = 2 + (i % 6);
      const height = 2 + ((i * 2) % 6);
      answerVal = 2 * (width + height);
      question = `What is the perimeter of a ${width} by ${height} rectangle?`;
      options = choices(answerVal, 4);
      correctStr = String(answerVal);
    } else if (/area/.test(lowerSlug)) {
      const width = 2 + (i % 6);
      const height = 2 + ((i * 2) % 6);
      answerVal = width * height;
      question = `What is the area of a ${width} by ${height} rectangle?`;
      options = choices(answerVal, 5);
      correctStr = String(answerVal);
    } else if (/subtraction|minus/.test(lowerSlug)) {
      const a = 10 + (i * 3);
      const b = 2 + (i % 8);
      answerVal = a - b;
      question = `What is ${a} − ${b}?`;
      options = choices(answerVal, 4);
      correctStr = String(answerVal);
    } else {
      // Default Addition / Word problem / multi-step
      const a = difficulty * 2 + (i * 3);
      const b = difficulty + (i * 2);
      answerVal = a + b;
      question = `What is ${a} + ${b}?`;
      options = choices(answerVal, 5);
      correctStr = String(answerVal);
    }

    generated.push({
      question,
      options,
      answer: correctStr,
    });
  }

  return generated;
}
