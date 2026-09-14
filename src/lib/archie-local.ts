import { arithmeticAnswer } from './archie-maths';
import { localWordAnswer, localKnowledgeAnswer } from './archie-knowledge';
export { safeEvaluateMath } from './archie-maths';
export type LocalArchieResult = {
  text: string;
  intent: 'maths' | 'spelling' | 'app-help' | 'repeat' | 'science' | 'reading' | 'geography';
};

// ── Child Name Memory ─────────────────────────────────────────────────────────

export function getRememberedChildName(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const direct = localStorage.getItem('sodafom_child_name')?.trim();
    if (direct) return direct;
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
  try { localStorage.setItem('sodafom_child_name', name.trim()); } catch { /* Optional memory. */ }
}

export function clearRememberedChildName(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem('sodafom_child_name'); } catch { /* Optional memory. */ }
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

  const nameMatch = lower.match(/^(?:my name is|call me)\s+([a-z][a-z'-]{0,29})[.!]?$/i);
  if (nameMatch) {
    const rawName = nameMatch[1];
    const commonWords = ['fine', 'good', 'happy', 'ready', 'sad', 'tired', 'playing', 'learning', 'here', 'doing', 'great', 'archie', 'bot', 'sodafom'];
    if (!commonWords.includes(rawName.toLowerCase())) {
      const capitalized = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      saveRememberedChildName(capitalized);
      return {
        text: `Nice to meet you, ${capitalized}! You can ask me to forget your name.`,
        intent: 'app-help'
      };
    }
  }

  return null;
}

export function tryLocalMaths(input: string, age = 9): LocalArchieResult | null {
  const answer = arithmeticAnswer(input, age);
  if (!answer) return null;
  const name = getRememberedChildName();
  return { text: `${name ? `Well done, ${name}! ` : ''}${answer}`, intent: 'maths' };
}

export function tryLocalSpelling(input: string): LocalArchieResult | null {
  return localWordAnswer(input);
}

const SCIENCE_FACTS: Array<[RegExp, string]> = [
  [/^(?:(?:what is|explain|tell me about) (?:the )?)?water cycle[?!.*]?$/i, 'The water cycle has four main stages: evaporation, condensation, precipitation and collection.'],
  [/^(?:how many planets(?: are there)?(?: in (?:the|our) solar system)?|planets in (?:the|our) solar system)[?!]?$/i, 'There are eight planets in our solar system.'],
  [/^(?:(?:what is|explain|tell me about) )?photosynthesis[?!]?$/i, 'Plants use sunlight, water and carbon dioxide to make food in a process called photosynthesis.'],
  [/^(?:what is|explain) gravity[?!]?$/i, 'Gravity is a force that pulls objects towards each other. On Earth, it pulls us towards the ground.'],
];

export function tryLocalScience(input: string): LocalArchieResult | null {
  for (const [pattern, answer] of SCIENCE_FACTS) {
    if (pattern.test(input.trim())) return { text: answer, intent: 'science' };
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

import { tryLocalTutor, getActivePendingQuestion } from './tutor/engine';

export function tryLocalArchieResponse(input: string, options: { age?: number } = {}): LocalArchieResult | null {
  if (!input.trim() || input.length > 2000) return null;
  const childNameAnswer = tryLocalChildName(input);
  if (childNameAnswer) return childNameAnswer;
  if (/\b(?:teach|quiz|practice|learn)\b/i.test(input)) {
    const lesson = tryLocalTutor(input);
    if (lesson) return lesson;
  }
  // A short answer to an active lesson belongs to its question, not the calculator.
  if (getActivePendingQuestion() && (/^\s*-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+)?[.!]?\s*$/.test(input) || (!/[?=+*/^]/.test(input) && input.trim().split(/\s+/).length <= 8 && !/\b(?:what|how|why|where|which|who|teach|explain|quiz|practice|spell)\b/i.test(input)))) {
    return tryLocalTutor(input);
  }
  return tryLocalFounderKnowledge(input)
    ?? tryLocalMaths(input, options.age)
    ?? localKnowledgeAnswer(input, options.age)
    ?? tryLocalSpelling(input)
    ?? tryLocalScience(input)
    ?? tryLocalReading(input)
    ?? tryLocalAppHelp(input)
    ?? (/^(?:explain|continue|recent|previous)\b|^what was i\b/i.test(input.trim()) ? tryLocalTutor(input) : null);
}
