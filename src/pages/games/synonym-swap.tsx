import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word is a synonym for "happy"?', options: ['sad','angry','joyful','tired'], answer: 'joyful' },
  { question: 'Which word is a synonym for "big"?', options: ['tiny','enormous','quick','silent'], answer: 'enormous' },
  { question: 'Which word is a synonym for "fast"?', options: ['slow','quiet','rapid','heavy'], answer: 'rapid' },
  { question: 'Which word is a synonym for "cold"?', options: ['warm','hot','chilly','bright'], answer: 'chilly' },
  { question: 'Which word is a synonym for "said"?', options: ['ran','whispered','jumped','ate'], answer: 'whispered' },
  { question: 'Which word is a synonym for "small"?', options: ['huge','large','tiny','tall'], answer: 'tiny' },
  { question: 'Which word is a synonym for "nice"?', options: ['mean','rude','kind','angry'], answer: 'kind' },
  { question: 'Which word is a synonym for "look"?', options: ['listen','smell','glance','touch'], answer: 'glance' },
  { question: 'Which word is a synonym for "run"?', options: ['walk','sit','sprint','sleep'], answer: 'sprint' },
  { question: 'Which word is a synonym for "sad"?', options: ['happy','joyful','miserable','excited'], answer: 'miserable' },
  { question: 'Which word is a synonym for "funny"?', options: ['serious','boring','hilarious','quiet'], answer: 'hilarious' },
  { question: 'Which word is a synonym for "scared"?', options: ['brave','calm','terrified','happy'], answer: 'terrified' },
];
const L2: QuizQuestion[] = [
  { question: 'Which word is a synonym for "brave"?', options: ['cowardly','fearful','courageous','timid'], answer: 'courageous' },
  { question: 'Which word is a synonym for "begin"?', options: ['end','finish','stop','commence'], answer: 'commence' },
  { question: 'Which word is a synonym for "angry"?', options: ['calm','furious','happy','tired'], answer: 'furious' },
  { question: 'Which word is a synonym for "walk"?', options: ['fly','swim','stroll','jump'], answer: 'stroll' },
  { question: 'Which word is a synonym for "old"?', options: ['new','modern','ancient','fresh'], answer: 'ancient' },
  { question: 'Which word is a synonym for "strange"?', options: ['normal','ordinary','peculiar','usual'], answer: 'peculiar' },
  { question: 'Which word is a synonym for "tired"?', options: ['energetic','exhausted','lively','active'], answer: 'exhausted' },
  { question: 'Which word is a synonym for "smart"?', options: ['foolish','clever','slow','careless'], answer: 'clever' },
  { question: 'Which word is a synonym for "beautiful"?', options: ['ugly','plain','gorgeous','dull'], answer: 'gorgeous' },
  { question: 'Which word is a synonym for "difficult"?', options: ['easy','simple','challenging','quick'], answer: 'challenging' },
  { question: 'Which word is a synonym for "quiet"?', options: ['loud','noisy','silent','booming'], answer: 'silent' },
  { question: 'Which word is a synonym for "important"?', options: ['trivial','minor','crucial','unimportant'], answer: 'crucial' },
];
const L3: QuizQuestion[] = [
  { question: 'Which word is a synonym for "benevolent"?', options: ['cruel','malevolent','philanthropic','selfish'], answer: 'philanthropic' },
  { question: 'Which word is a synonym for "verbose"?', options: ['concise','brief','loquacious','quiet'], answer: 'loquacious' },
  { question: 'Which word is a synonym for "transient"?', options: ['permanent','lasting','ephemeral','eternal'], answer: 'ephemeral' },
  { question: 'Which word is a synonym for "apathy"?', options: ['enthusiasm','passion','indifference','energy'], answer: 'indifference' },
  { question: 'Which word is a synonym for "obscure"?', options: ['clear','obvious','abstruse','prominent'], answer: 'abstruse' },
  { question: 'Which word is a synonym for "frugal"?', options: ['extravagant','wasteful','parsimonious','generous'], answer: 'parsimonious' },
  { question: 'Which word is a synonym for "candid"?', options: ['evasive','deceptive','forthright','dishonest'], answer: 'forthright' },
  { question: 'Which word is a synonym for "serene"?', options: ['turbulent','agitated','tranquil','chaotic'], answer: 'tranquil' },
  { question: 'Which word is a synonym for "diligent"?', options: ['negligent','lazy','assiduous','careless'], answer: 'assiduous' },
  { question: 'Which word is a synonym for "meticulous"?', options: ['careless','sloppy','scrupulous','hasty'], answer: 'scrupulous' },
  { question: 'Which word is a synonym for "tenacious"?', options: ['yielding','weak','resolute','feeble'], answer: 'resolute' },
  { question: 'Which word is a synonym for "eloquent"?', options: ['inarticulate','mumbling','articulate','confused'], answer: 'articulate' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'synonym-swap',
  title: 'Synonym Swap',
  emoji: '🔄',
  subject: 'reading',
  ageGroups: ['8–10', '11–13'],
  description: 'Swap the word for a synonym! Find words that mean the same thing.',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
