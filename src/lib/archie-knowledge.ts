import { CURRICULUM_LESSONS } from './tutor/curriculum';
import type { LocalArchieResult } from './archie-local';

// Small curated vocabulary, including words already used by word-meaning.tsx.
// An exact dictionary lookup, never a guessed definition or cached model answer.
const WORDS: Record<string, [string, string]> = {
  big: ['large in size', 'The elephant is big.'], happy: ['feeling pleased or joyful', 'I feel happy when we play together.'],
  brave: ['doing something even when you feel afraid', 'She was brave when she tried something new.'],
  begin: ['to start', 'We begin the lesson after lunch.'], diligent: ['hardworking and careful', 'The diligent learner checked each answer.'],
  serene: ['calm and peaceful', 'The garden was serene.'], resilient: ['able to recover after difficulties', 'The resilient team tried again.'],
  noun: ['a word naming a person, place, thing or idea', 'Teacher, London, pencil and kindness are nouns.'],
  verb: ['a word showing an action or a state of being', 'Run and is are verbs.'],
  adjective: ['a word that describes a noun', 'In a red apple, red is an adjective.'],
  synonym: ['a word with a similar meaning to another word', 'Big and large are synonyms.'],
  antonym: ['a word with an opposite meaning', 'Hot and cold are antonyms.'],
  fraction: ['a number that can describe equal parts of a whole', 'One half is one of two equal parts.'],
  numerator: ['the top number in a fraction', 'In 3/4, the numerator is 3.'],
  denominator: ['the bottom number in a fraction', 'In 3/4, the denominator is 4.'],
  habitat: ['the place where a living thing lives', 'A pond is a habitat for frogs.'],
  evaporation: ['the change from liquid water to water vapour', 'A puddle gets smaller as its water evaporates.'],
  condensation: ['the change from water vapour to liquid water', 'Drops can form on the outside of a cold glass.'],
  precipitation: ['water falling from clouds, such as rain, snow or hail', 'Rain is a type of precipitation.'],
  gravity: ['the attraction between objects that have mass', 'Earth’s gravity pulls a falling ball towards the ground.'],
  photosynthesis: ['the process plants use to make food using light, water and carbon dioxide', 'Leaves absorb light for photosynthesis.'],
  continent: ['one of the large land areas of Earth', 'Europe is a continent.'],
  algorithm: ['a set of steps for completing a task', 'A recipe is an example of an algorithm.'],
};
const SPELLING_FIXES: Record<string, string> = { becaus: 'because', becuase: 'because', freind: 'friend', seperate: 'separate', definately: 'definitely', recieve: 'receive', dinasor: 'dinosaur', dinosor: 'dinosaur', tommorow: 'tomorrow', enviroment: 'environment', beautifull: 'beautiful' };
const SPELLING_WORDS = new Set([...Object.keys(WORDS), ...Object.values(SPELLING_FIXES), 'cat', 'dog', 'school', 'teacher', 'science', 'geography', 'Wednesday', 'February'].map(word => word.toLowerCase()));
const clean = (input: string) => input.toLowerCase().trim().replace(/[?!.,]+$/, '').replace(/\s+/g, ' ');

export function localWordAnswer(input: string): LocalArchieResult | null {
  const text = clean(input);
  const definition = text.match(/^(?:what does ["']?([a-z-]+)["']? mean|(?:define|meaning of|what is|what's) (?:an? )?["']?([a-z-]+)["']?)$/);
  const word = definition?.[1] || definition?.[2];
  if (word && WORDS[word]) return { text: `${word}: ${WORDS[word][0]}. ${WORDS[word][1]}`, intent: 'reading' };
  const spelling = text.match(/^(?:how do you spell|spell(?: the word)?)\s+["']?([a-z-]{1,30})["']?$/);
  if (!spelling) return null;
  const typed = spelling[1];
  const corrected = SPELLING_FIXES[typed];
  const target = corrected || typed;
  const letters = target.toUpperCase().split('').join(', ');
  return { text: corrected ? `Did you mean ${target}? It is spelled ${letters}.` : SPELLING_WORDS.has(target) ? `${target}. ${letters}. ${target}.` : `The letters you typed are ${letters}. I have not checked that spelling in my word list.`, intent: 'spelling' };
}

/** Direct questions reuse the existing curriculum; lesson/quiz requests retain their route. */
export function localKnowledgeAnswer(input: string, age = 9): LocalArchieResult | null {
  const text = clean(input);
  const dictionary = localWordAnswer(text);
  if (dictionary) return dictionary;
  const aliases: Record<string, string> = {
    'how many planets are there': 'There are eight planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.',
    'how many planets are in the solar system': 'There are eight planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.',
    'which planet is closest to the sun': 'Mercury is the closest planet to the Sun.',
    'what is the largest planet': 'Jupiter is the largest planet in our solar system.',
    'which planet is earth': 'Earth is the third planet from the Sun.',
    'how many continents are there': 'In the seven-continent model, they are Asia, Africa, North America, South America, Antarctica, Europe and Australia.',
    'what continent is the uk in': 'The United Kingdom is in Europe.',
    'which continent is the united kingdom in': 'The United Kingdom is in Europe.',
    'where is the amazon rainforest': 'The Amazon rainforest is in South America.',
    'how do plants make food': WORDS.photosynthesis[0] + '.',
  };
  if (aliases[text]) return { text: aliases[text], intent: /continent|kingdom|rainforest|\buk\b/.test(text) ? 'geography' : 'science' };
  for (const lesson of CURRICULUM_LESSONS.filter(item => ['Science', 'Geography'].includes(item.subject))) {
    const question = lesson.questions.find(item => clean(item.question) === text);
    if (question) return { text: age <= 7 ? question.simplerExplanation : question.explanation, intent: lesson.subject === 'Science' ? 'science' : 'geography' };
  }
  return null;
}
