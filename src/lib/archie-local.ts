export type LocalArchieResult = {
  text: string;
  intent: 'maths' | 'spelling' | 'app-help' | 'repeat' | 'science' | 'reading';
};

// ── Child Name Memory ─────────────────────────────────────────────────────────

export function getRememberedChildName(): string | null {
  if (typeof window === 'undefined') return null;
  const direct = localStorage.getItem('sodafom_child_name')?.trim();
  if (direct) return direct;
  try {
    const rawActive = localStorage.getItem('sodafom_active_child');
    if (rawActive) {
      const parsed = JSON.parse(rawActive);
      if (parsed?.name && parsed.name !== 'Learner') {
        return parsed.name.trim();
      }
    }
  } catch { /* ignore */ }
  return null;
}

export function saveRememberedChildName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sodafom_child_name', name.trim());
}

export function clearRememberedChildName(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sodafom_child_name');
}

export function tryLocalChildName(input: string): LocalArchieResult | null {
  const t = input.trim();
  const lower = t.toLowerCase();

  if (/\b(?:forget|clear|delete|remove)\s+(?:my\s+)?name\b/i.test(lower)) {
    clearRememberedChildName();
    return {
      text: "Okay, I have forgotten your name!",
      intent: 'app-help'
    };
  }

  if (/\b(?:what\s+is|what's|do\s+you\s+know|remember)\s+my\s+name\b/i.test(lower)) {
    const name = getRememberedChildName();
    if (name) {
      return {
        text: `Your name is ${name}!`,
        intent: 'app-help'
      };
    } else {
      return {
        text: "I don't know your name yet. What is your name?",
        intent: 'app-help'
      };
    }
  }

  const nameMatch = lower.match(/(?:my name is|i am|i'm|call me)\s+([a-z'-]+)/i);
  if (nameMatch) {
    const rawName = nameMatch[1];
    const commonWords = ['fine', 'good', 'happy', 'ready', 'sad', 'tired', 'playing', 'learning', 'here', 'doing', 'great', 'archie', 'bot', 'sodafom'];
    if (!commonWords.includes(rawName.toLowerCase())) {
      const capitalized = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      saveRememberedChildName(capitalized);
      return {
        text: `Nice to meet you, ${capitalized}! I will remember your name.`,
        intent: 'app-help'
      };
    }
  }

  return null;
}

// ── Word to Number Normalizer & Maths Parser ──────────────────────────────────

const WORD_NUMBERS: Array<[RegExp, string]> = [
  [/\bzero\b/gi, '0'],
  [/\bone\b/gi, '1'],
  [/\btwo\b/gi, '2'],
  [/\bthree\b/gi, '3'],
  [/\bfour\b/gi, '4'],
  [/\bfive\b/gi, '5'],
  [/\bsix\b/gi, '6'],
  [/\bseven\b/gi, '7'],
  [/\beight\b/gi, '8'],
  [/\bnine\b/gi, '9'],
  [/\bten\b/gi, '10'],
  [/\beleven\b/gi, '11'],
  [/\btwelve\b/gi, '12'],
  [/\bthirteen\b/gi, '13'],
  [/\bfourteen\b/gi, '14'],
  [/\bfifteen\b/gi, '15'],
  [/\bsixteen\b/gi, '16'],
  [/\bseventeen\b/gi, '17'],
  [/\beighteen\b/gi, '18'],
  [/\bnineteen\b/gi, '19'],
  [/\btwenty\b/gi, '20'],
  [/\bthirty\b/gi, '30'],
  [/\bforty\b/gi, '40'],
  [/\bfifty\b/gi, '50'],
  [/\bsixty\b/gi, '60'],
  [/\bseventy\b/gi, '70'],
  [/\beighty\b/gi, '80'],
  [/\bninety\b/gi, '90'],
];

function replaceWordNumbers(input: string): string {
  let s = input.toLowerCase();

  // Multiplier scale phrases
  s = s.replace(/\b(?:a|one)\s+trillion\b/g, '1000000000000');
  s = s.replace(/\b(?:a|one)\s+billion\b/g, '1000000000');
  s = s.replace(/\b(?:a|one)\s+million\b/g, '1000000');
  s = s.replace(/\b(?:a|one)\s+thousand\b/g, '1000');
  s = s.replace(/\b(?:a|one)\s+hundred\b/g, '100');

  // Handle number + scale e.g. "2 million", "5 thousand"
  s = s.replace(/(\d+)\s+trillion\b/g, (_m, n) => String(Number(n) * 1000000000000));
  s = s.replace(/(\d+)\s+billion\b/g, (_m, n) => String(Number(n) * 1000000000));
  s = s.replace(/(\d+)\s+million\b/g, (_m, n) => String(Number(n) * 1000000));
  s = s.replace(/(\d+)\s+thousand\b/g, (_m, n) => String(Number(n) * 1000));
  s = s.replace(/(\d+)\s+hundred\b/g, (_m, n) => String(Number(n) * 100));

  for (const [pattern, replacement] of WORD_NUMBERS) {
    s = s.replace(pattern, replacement);
  }

  // Handle compound tens like "20 5" -> "25", "80 1" -> "81"
  s = s.replace(/\b(20|30|40|50|60|70|80|90)\s+([1-9])\b/g, (_m, tens, units) => String(Number(tens) + Number(units)));

  return s;
}

function tokenizeMath(expr: string): string[] | null {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let fnStr = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        fnStr += expr[i];
        i++;
      }
      if (fnStr.toLowerCase() === 'sqrt') {
        tokens.push('sqrt');
      } else {
        return null;
      }
      continue;
    }
    if (['+', '-', '*', '/', '^', '%', '(', ')'].includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    return null;
  }
  return tokens;
}

function parseTokens(tokens: string[]): number | null {
  let pos = 0;

  function parseExpression(): number | null {
    let left = parseTerm();
    if (left === null) return null;

    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++];
      const right = parseTerm();
      if (right === null) return null;
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number | null {
    let left = parseFactor();
    if (left === null) return null;

    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/' || tokens[pos] === '%')) {
      const op = tokens[pos++];
      const right = parseFactor();
      if (right === null) return null;
      if (op === '*') left = left * right;
      else if (op === '/') {
        if (right === 0) return null;
        left = left / right;
      } else {
        left = left % right;
      }
    }
    return left;
  }

  function parseFactor(): number | null {
    let left = parsePower();
    if (left === null) return null;

    while (pos < tokens.length && tokens[pos] === '^') {
      tokens[pos++];
      const right = parsePower();
      if (right === null) return null;
      left = Math.pow(left, right);
    }
    return left;
  }

  function parsePower(): number | null {
    if (pos >= tokens.length) return null;

    const token = tokens[pos];

    if (token === '-') {
      pos++;
      const val = parsePower();
      return val !== null ? -val : null;
    }
    if (token === '+') {
      pos++;
      return parsePower();
    }
    if (token === 'sqrt') {
      pos++;
      const val = parsePower();
      return val !== null && val >= 0 ? Math.sqrt(val) : null;
    }
    if (token === '(') {
      pos++;
      const val = parseExpression();
      if (pos >= tokens.length || tokens[pos] !== ')') return null;
      pos++;
      return val;
    }

    const num = Number(token);
    if (!isNaN(num)) {
      pos++;
      return num;
    }

    return null;
  }

  const result = parseExpression();
  if (pos !== tokens.length) return null;
  return result;
}

export function safeEvaluateMath(expr: string): number | null {
  const tokens = tokenizeMath(expr);
  if (!tokens || tokens.length === 0) return null;
  return parseTokens(tokens);
}

export function tryLocalMaths(input: string): LocalArchieResult | null {
  const lowered = input.toLowerCase().replace(/,/g, '');

  // 1. Check percentage "X% of Y" or "X percent of Y"
  const percentMatch = lowered.match(/(?:what\s+is\s+)?(?:the\s+)?(\d+(?:\.\d+)?)\s*(?:percent|%)\s+of\s+(.+)/i);
  if (percentMatch) {
    const pct = Number(percentMatch[1]);
    const targetExpr = replaceWordNumbers(percentMatch[2]);
    const targetVal = safeEvaluateMath(targetExpr);
    if (targetVal !== null) {
      const answer = (pct / 100) * targetVal;
      const tidy = Number.isInteger(answer) ? answer.toLocaleString('en-GB') : (Math.round(answer * 10000) / 10000).toLocaleString('en-GB');
      const name = getRememberedChildName();
      const prefix = name ? `Well done, ${name}! ` : '';
      return {
        text: `${prefix}${pct} percent of ${targetVal.toLocaleString('en-GB')} is ${tidy}.`,
        intent: 'maths'
      };
    }
  }

  // 2. Check special phrases: "double X", "half of X", "quarter of X"
  const specialMatch = lowered.match(/\b(double|half\s+of|quarter\s+of)\s+(.+)/i);
  if (specialMatch) {
    const mode = specialMatch[1].toLowerCase();
    const valExpr = replaceWordNumbers(specialMatch[2]);
    const val = safeEvaluateMath(valExpr);
    if (val !== null) {
      const answer = mode.includes('double') ? val * 2 : mode.includes('half') ? val / 2 : val / 4;
      const tidy = Number.isInteger(answer) ? answer.toLocaleString('en-GB') : (Math.round(answer * 10000) / 10000).toLocaleString('en-GB');
      const name = getRememberedChildName();
      const prefix = name ? `Well done, ${name}! ` : '';
      return {
        text: `${prefix}${mode} ${val.toLocaleString('en-GB')} is ${tidy}.`,
        intent: 'maths'
      };
    }
  }

  // 3. Prepare normalized mathematical expression
  let expr = replaceWordNumbers(lowered);

  // Strip question prefixes
  expr = expr.replace(/^(?:what\s+is|what's|calculate|work\s+out|please|archie|can\s+you\s+tell\s+me|how\s+much\s+is|how\s+many\s+is)\s+/i, '');

  // Operator replacements
  expr = expr.replace(/\b(?:the\s+)?square\s+root\s+of\s+([0-9.]+)\b/gi, 'sqrt($1)');
  expr = expr.replace(/\b([0-9.]+)\s+squared\b/gi, '($1 ^ 2)');
  expr = expr.replace(/\b([0-9.]+)\s+cubed\b/gi, '($1 ^ 3)');
  expr = expr.replace(/\b([0-9.]+)\s+to\s+the\s+power\s+of\s+([0-9.]+)\b/gi, '($1 ^ $2)');
  expr = expr.replace(/\bmultiplied\s+by\b|\btimes\b|\bx\b|×/gi, '*');
  expr = expr.replace(/\bdivided\s+by\b|\bdivide\s+by\b|[÷]/gi, '/');
  expr = expr.replace(/\bplus\b|\badded\s+to\b/gi, '+');
  expr = expr.replace(/\bminus\b|\btake\s+away\b|\bsubtracted\s+from\b/gi, '-');
  expr = expr.replace(/equals?/gi, '');
  expr = expr.replace(/[?,!]/g, '');

  const answer = safeEvaluateMath(expr);
  if (answer !== null && Number.isFinite(answer)) {
    const name = getRememberedChildName();
    const prefix = name ? `Well done, ${name}! ` : '';
    const tidy = Number.isInteger(answer) ? answer.toLocaleString('en-GB') : (Math.round(answer * 10000) / 10000).toLocaleString('en-GB');

    // Clean original phrase for speech output
    let cleanPrompt = input.trim().replace(/[?,!]/g, '');
    cleanPrompt = cleanPrompt.replace(/^(?:what\s+is|what's|calculate|work\s+out|please|archie|can\s+you\s+tell\s+me)\s+/i, '');
    cleanPrompt = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);

    return {
      text: `${prefix}${cleanPrompt} is ${tidy}.`,
      intent: 'maths'
    };
  }

  return null;
}

export function tryLocalSpelling(input: string): LocalArchieResult | null {
  const lower = input.trim().toLowerCase();
  const match = lower.match(/(?:how do you spell|spell|spell the word)\s+["']?([a-z-]+)["']?/i);
  if (!match) return null;
  const word = match[1].replace(/[^a-z-]/gi, '');
  if (!word || word.length > 30) return null;
  const letters = word.replace(/-/g, '').toUpperCase().split('').join(', ');
  return { text: `${word}. ${letters}. ${word}.`, intent: 'spelling' };
}

const SCIENCE_FACTS: Array<[RegExp, string]> = [
  [/\bwater cycle\b/i, 'The water cycle has four main stages: evaporation, condensation, precipitation and collection.'],
  [/\bhow many planets\b|\bplanets in (?:the )?solar system\b/i, 'There are eight planets in our solar system.'],
  [/\bplants? (?:make|makes) food|photosynthesis/i, 'Plants use sunlight, water and carbon dioxide to make food in a process called photosynthesis.'],
  [/\bwhat is gravity\b/i, 'Gravity is a force that pulls objects towards each other. On Earth, it pulls us towards the ground.'],
];

export function tryLocalScience(input: string): LocalArchieResult | null {
  for (const [pattern, answer] of SCIENCE_FACTS) {
    if (pattern.test(input)) return { text: answer, intent: 'science' };
  }
  return null;
}

export function tryLocalAppHelp(input: string): LocalArchieResult | null {
  const t = input.toLowerCase();
  if (/\bcan you hear me\b|\bcan you speak\b|\bsay hello\b|\bhello archie\b|\bhi archie\b/.test(t)) {
    return {
      text: "Yes, I can hear you! Hi, I'm Archie. What would you like to learn today?",
      intent: 'app-help'
    };
  }
  if (/open (?:my )?sticker book|show (?:me )?my stickers/.test(t)) {
    return { text: 'Your Sticker Book is on the Sodafom home screen. Tap Sticker Book to see your collection.', intent: 'app-help' };
  }
  if (/where is maths|find maths|maths world/.test(t)) {
    return { text: 'Tap Explore My World on the home screen, then choose Maths World.', intent: 'app-help' };
  }
  if (/where is reading|find reading|reading world/.test(t)) {
    return { text: 'Tap Explore My World on the home screen, then choose Reading World.', intent: 'app-help' };
  }
  if (/where is spelling|find spelling|spelling world/.test(t)) {
    return { text: 'Tap Explore My World on the home screen, then choose Spelling World.', intent: 'app-help' };
  }
  if (/where is science|find science|science world/.test(t)) {
    return { text: 'Tap Explore My World on the home screen, then choose Science World.', intent: 'app-help' };
  }
  if (/what games|show all games|how many games/.test(t)) {
    return { text: 'Sodafom has lots of learning games. You can explore them by World or tap Show all games on the home screen.', intent: 'app-help' };
  }
  if (/next (?:game|round)|another ten|play again/.test(t)) {
    return { text: 'Finish the ten questions and the next, harder round starts automatically. You can also tap Next 10 straight away.', intent: 'app-help' };
  }
  if (/certificate|print|save png/.test(t)) {
    return { text: 'After a strong result, tap View Certificate. You can print it, save it as a picture, or share it.', intent: 'app-help' };
  }
  return null;
}

export function tryLocalReading(input: string): LocalArchieResult | null {
  const t = input.toLowerCase();
  if (/main idea|what is this (?:story|text) about/.test(t)) {
    return { text: 'Look for the person or topic mentioned most, then ask what the text mainly tells you about it.', intent: 'reading' };
  }
  if (/unknown word|word meaning|do not know (?:this|the) word/.test(t)) {
    return { text: 'Read the words before and after it for clues. Then replace the unknown word with your best guess and see if the sentence still makes sense.', intent: 'reading' };
  }
  if (/read (?:it|this|the question)|say (?:it|this) aloud/.test(t)) {
    return { text: 'Tap the round Archie button beside the question. I will read the question and every answer choice aloud.', intent: 'reading' };
  }
  return null;
}

export function tryLocalFounderKnowledge(input: string): LocalArchieResult | null {
  const t = input.toLowerCase().replace(/soda[\s-]+(?:from|foam)/g, 'sodafom');
  if (!/(sodafom|sodafoam|founder|michael davis)/.test(t)) return null;

  if (/who (?:is|was).*(?:founder|made|created|started)|who.*(?:sodafom|sodafoam)/.test(t)) {
    return {
      text: 'Michael Davis is the founder and creator of Sodafom. He built it to help his son Archie and other children enjoy learning.',
      intent: 'app-help',
    };
  }
  if (/born|birthday|age|old|grew up|broxbourne|chase farm/.test(t)) {
    return {
      text: 'Sodafom founder Michael Davis was born at Chase Farm Hospital at 2:30 in the morning on 11 November 1982. He grew up in Broxbourne and is 43 years old in 2026.',
      intent: 'app-help',
    };
  }
  if (/job|work|career|train|driver|electrician|platform|ipswich/.test(t)) {
    return {
      text: 'Before founding Sodafom, Michael Davis worked as a qualified electrician, a train driver, and on the platform at Ipswich railway station. He then created Sodafom to help children learn.',
      intent: 'app-help',
    };
  }
  return null;
}

import { tryLocalTutor } from './tutor/engine';

export function tryLocalArchieResponse(input: string): LocalArchieResult | null {
  return tryLocalChildName(input)
    ?? tryLocalFounderKnowledge(input)
    ?? tryLocalMaths(input)
    ?? tryLocalTutor(input)
    ?? tryLocalSpelling(input)
    ?? tryLocalScience(input)
    ?? tryLocalReading(input)
    ?? tryLocalAppHelp(input);
}
