/** Bounded arithmetic grammar: numbers and operators only; never executes input. */
export function safeEvaluateMath(expression: string): number | null {
  if (expression.length > 256) return null;
  const tokens = expression.match(/(?:\d+(?:\.\d+)?|\.\d+)|sqrt|[()+\-*/^%]|\S/g) ?? [];
  if (!tokens.length || tokens.length > 128) return null;
  let position = 0;
  function parse(minimum = 0, depth = 0): number | null {
    if (depth > 32) return null;
    const token = tokens[position++];
    let value: number | null;
    if (token === '-' || token === '+') {
      value = parse(3, depth + 1);
      if (value !== null && token === '-') value = -value;
    } else if (token === 'sqrt') {
      value = parse(4, depth + 1);
      value = value !== null && value >= 0 ? Math.sqrt(value) : null;
    } else if (token === '(') {
      value = parse(0, depth + 1);
      if (tokens[position++] !== ')') return null;
    } else if (token && /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(token)) value = Number(token);
    else return null;
    if (value === null || !Number.isFinite(value)) return null;
    while (position < tokens.length) {
      const operator = tokens[position];
      const precedence = operator === '+' || operator === '-' ? 1 : ['*', '/', '%'].includes(operator) ? 2 : operator === '^' ? 3 : 0;
      if (!precedence || precedence < minimum) break;
      position++;
      const right = parse(operator === '^' ? precedence : precedence + 1, depth + 1);
      if (right === null || ((operator === '/' || operator === '%') && right === 0)) return null;
      if (operator === '+') value += right;
      else if (operator === '-') value -= right;
      else if (operator === '*') value *= right;
      else if (operator === '/') value /= right;
      else if (operator === '%') value %= right;
      else value = Math.pow(value, right);
      // Do not present rounded unsafe integers or overflow as exact answers.
      if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) return null;
    }
    return value;
  }
  const value = parse();
  return position === tokens.length && value !== null && Math.abs(value) <= Number.MAX_SAFE_INTEGER ? value : null;
}

const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES: Record<string, number> = { thousand: 1000, million: 1e6, billion: 1e9, trillion: 1e12 };
const numberWords = [...SMALL, ...TENS, 'hundred', ...Object.keys(SCALES)].join('|');
export function normaliseMathWords(input: string): string {
  const phrase = new RegExp(`\\b(?:${numberWords})(?:(?:[ -]+(?:and[ -]+)?)(?:${numberWords}))*\\b`, 'g');
  return input.toLowerCase().replace(/\b(\d+)\s+(hundred|thousand|million|billion|trillion)\b/g, (_, n, scale) => String(Number(n) * (scale === 'hundred' ? 100 : SCALES[scale]))).replace(/\ba (hundred|thousand|million|billion|trillion)\b/g, 'one $1').replace(phrase, matched => {
    let total = 0, group = 0;
    let previous = '', lastScale = Infinity;
    for (const word of matched.split(/[ -]+/)) {
      if (word === 'and') continue;
      if ((SMALL.includes(word) && (SMALL.includes(previous) || (TENS.includes(previous) && SMALL.indexOf(word) >= 10))) || (TENS.includes(word) && (SMALL.includes(previous) || TENS.includes(previous)))) return matched;
      if (SCALES[word] && SCALES[word] >= lastScale) return matched;
      if (SCALES[word]) lastScale = SCALES[word];
      if (SMALL.includes(word)) group += SMALL.indexOf(word);
      else if (TENS.includes(word)) group += (TENS.indexOf(word) + 2) * 10;
      else if (word === 'hundred') group = (group || 1) * 100;
      else { total += (group || 1) * SCALES[word]; group = 0; }
      previous = word;
    }
    return String(total + group);
  }).replace(/\b(\d+)\s+(hundred|thousand|million|billion|trillion)\b/g, (_, n, scale) => String(Number(n) * (scale === 'hundred' ? 100 : SCALES[scale])));
}

function tidy(value: number): string { return Number(value.toPrecision(12)).toLocaleString('en-GB', { maximumFractionDigits: 10 }); }
export function arithmeticAnswer(input: string, age = 9): string | null {
  if (input.length > 400) return null;
  let expression = normaliseMathWords(input.replace(/(?<=\d),(?=\d{3}(?:\D|$))/g, '')).trim().replace(/[?!]+$/, '');
  expression = expression.replace(/^(?:(?:please|archie)[, ]+)?(?:(?:what is|what's|calculate|work out|how much is|how many is|can you tell me)\s+)?/i, '');
  const percent = expression.match(/^(?:the )?(\d+(?:\.\d+)?)\s*(?:%|percent) of (.+)$/);
  const fraction = expression.match(/^(\d+)\s*\/\s*(\d+) of (.+)$/);
  const special = expression.match(/^(double|half(?: of)?|quarter(?: of)?) (.+)$/);
  let explanation = '';
  if (percent) {
    expression = `(${percent[2]}) * ${percent[1]} / 100`;
    explanation = `Percent means out of 100: divide by 100, then multiply by ${percent[1]}.`;
  } else if (fraction) {
    expression = `(${fraction[3]}) / ${fraction[2]} * ${fraction[1]}`;
    explanation = `Divide the whole by ${fraction[2]} to find one equal part, then take ${fraction[1]} parts.`;
  } else if (special) {
    expression = `(${special[2]}) ${special[1] === 'double' ? '* 2' : special[1].startsWith('half') ? '/ 2' : '/ 4'}`;
    explanation = special[1] === 'double' ? 'Doubling means adding the same amount again.' : 'Share the amount into equal parts.';
  }
  expression = expression.replace(/^(.*?) subtracted from (.*?)$/, '($2) - ($1)');
  expression = expression.replace(/^(.*?) added to (.*?)$/, '($2) + ($1)');
  expression = expression.replace(/\b(?:the )?square root of ([0-9.]+)\b/g, 'sqrt($1)')
    .replace(/\b([0-9.]+) squared\b/g, '($1 ^ 2)').replace(/\b([0-9.]+) cubed\b/g, '($1 ^ 3)')
    .replace(/\bto the power of\b/g, '^').replace(/\bmultiplied by\b|\btimes\b|\bx\b|×/g, '*')
    .replace(/\bdivided by\b|\bdivide by\b|÷/g, '/').replace(/\bplus\b/g, '+').replace(/\bminus\b|\btake away\b/g, '-')
    .replace(/\s*(?:equals?|=)\s*$/, '');
  if (!/[+*/^%-]|sqrt/.test(expression)) return null;
  const result = safeEvaluateMath(expression);
  if (result === null) return null;
  if (!explanation) {
    const simple = expression.match(/^\s*([0-9.]+)\s*([+*/-])\s*([0-9.]+)\s*$/);
    if (simple) {
      const [, a, op, b] = simple;
      explanation = op === '+' ? `Start with ${a} and add ${b}.` : op === '-' ? `Start with ${a} and take away ${b}.` : op === '*' ? `${a} groups of ${b} give ${tidy(result)} altogether.` : `Share ${a} into ${b} equal groups. Each group has ${tidy(result)}.`;
      if (age >= 11 && op === '/') explanation += ` Check by multiplying the result by ${b}.`;
    } else explanation = age <= 7 ? 'Work out the parts inside brackets first, one small step at a time.' : 'Work inside brackets first, then powers, then multiplication and division, then addition and subtraction.';
  }
  const rounded = Math.abs(result - Number(result.toPrecision(12))) > 0 || (!Number.isInteger(result) && String(result).split('.')[1]?.length > 10);
  return `${input.trim().replace(/[?!]+$/, '')} is ${rounded ? 'approximately ' : ''}${tidy(result)}. ${explanation}`;
}
