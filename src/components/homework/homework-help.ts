import { tryLocalMaths, tryLocalReading, tryLocalScience, tryLocalSpelling } from '@/lib/archie-local';

/** Only recognise a complete, simple sum; never take one sum out of a word problem. */
function simpleSum(question: string) {
  const expression = question.trim()
    .replace(/^(?:please\s+)?(?:explain|work out|calculate|what is|what's|help me with|how do I work out)\s+/i, '')
    .replace(/\s+(?:with (?:a )?(?:simple )?example|step by step)[.?!]*$/i, '')
    .replace(/[.?!]+$/, '').trim();
  const match = expression.match(/^(\d{1,4})\s*(×|\*|x|times|multiplied by|\+|plus|-|−|minus|÷|\/|divided by)\s*(\d{1,4})$/i);
  if (!match) return null;
  const left = Number(match[1]);
  const right = Number(match[3]);
  if (left > 1000 || right > 1000) return null;
  const operator = /^(?:×|\*|x|times|multiplied by)$/i.test(match[2]) ? '×'
    : /^(?:\+|plus)$/i.test(match[2]) ? '+'
    : /^(?:-|−|minus)$/i.test(match[2]) ? '−' : '÷';
  if ((operator === '÷' && (right === 0 || left % right !== 0)) || (operator === '−' && left < right)) return null;
  return { left, right, operator };
}

/** A small, stateless homework helper. It does not start or mark a tutor lesson. */
export function localHomeworkHelp(question: string, hint: boolean): string | null {
  const sum = simpleSum(question);
  if (sum) {
    const { left, right, operator } = sum;
    let method: string;
    let answer: number;
    if (operator === '×') {
      answer = left * right;
      method = left === 0 || right === 0
        ? 'Think about a group with nothing in it. How many counters would there be?'
        : left <= 12 && right <= 12
          ? `Picture ${left} bags with ${right} counters in each bag. Count in groups of ${right} to find the total.`
          : `Break ${left} into smaller parts. Multiply each part by ${right}, then add those results.`;
    } else if (operator === '+') {
      answer = left + right;
      method = `Start with ${left} counters and add ${right} more. Count both groups together.`;
    } else if (operator === '−') {
      answer = left - right;
      method = `Start with ${left} counters. Take away ${right}, then count what is left.`;
    } else {
      answer = left / right;
      method = `Share ${left} counters equally between ${right} groups. Count how many are in one group.`;
    }
    return hint ? `${method} What do you think the answer is?`
      : `${left} ${operator} ${right} = ${answer}.\n\n${method}\n\nHave a try with counters or a drawing, then check your total.`;
  }
  if (hint) return null;
  // Use known, stateless answers only. The general tutor also holds pending quiz
  // answers, so it must not interpret a homework question as a quiz submission.
  return (tryLocalMaths(question) ?? tryLocalSpelling(question)
    ?? tryLocalScience(question) ?? tryLocalReading(question))?.text ?? null;
}
