import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What does "un-" mean?', options: ['not','again','before','after'], answer: 'not' },
  { question: '"Unhappy" means…', options: ['not happy','very happy','a bit happy','too happy'], answer: 'not happy' },
  { question: '"Redo" means…', options: ['do again','not do','do before','do after'], answer: 'do again' },
  { question: 'What does "re-" mean?', options: ['again','not','before','after'], answer: 'again' },
  { question: '"Dislike" means…', options: ['not like','like again','like before','like after'], answer: 'not like' },
  { question: 'What does "dis-" mean?', options: ['not','again','before','after'], answer: 'not' },
  { question: '"Preview" means…', options: ['view before','view again','not view','view after'], answer: 'view before' },
  { question: 'What does "pre-" mean?', options: ['before','after','again','not'], answer: 'before' },
  { question: '"Misread" means…', options: ['read wrongly','read again','not read','read before'], answer: 'read wrongly' },
  { question: 'What does "mis-" mean?', options: ['wrongly','again','not','before'], answer: 'wrongly' },
  { question: '"Overeat" means…', options: ['eat too much','eat again','not eat','eat before'], answer: 'eat too much' },
  { question: 'What does "over-" mean?', options: ['too much','again','not','before'], answer: 'too much' },
];
const L2: QuizQuestion[] = [
  { question: 'What does "sub-" mean?', options: ['under','above','before','after'], answer: 'under' },
  { question: '"Submarine" means…', options: ['under the sea','above the sea','beside the sea','through the sea'], answer: 'under the sea' },
  { question: 'What does "super-" mean?', options: ['above/beyond','under','before','after'], answer: 'above/beyond' },
  { question: '"Superhero" means…', options: ['a hero beyond normal','a hero under normal','a hero before normal','a hero after normal'], answer: 'a hero beyond normal' },
  { question: 'What does "inter-" mean?', options: ['between','within','before','after'], answer: 'between' },
  { question: '"International" means…', options: ['between nations','within a nation','before a nation','after a nation'], answer: 'between nations' },
  { question: 'What does "trans-" mean?', options: ['across','under','above','before'], answer: 'across' },
  { question: '"Transport" means…', options: ['carry across','carry under','carry above','carry before'], answer: 'carry across' },
  { question: 'What does "anti-" mean?', options: ['against','for','before','after'], answer: 'against' },
  { question: '"Anticlockwise" means…', options: ['against the clock direction','with the clock direction','before the clock','after the clock'], answer: 'against the clock direction' },
  { question: 'What does "auto-" mean?', options: ['self','other','before','after'], answer: 'self' },
  { question: '"Autobiography" means…', options: ['story of your own life','story of another\'s life','story before life','story after life'], answer: 'story of your own life' },
];
const L3: QuizQuestion[] = [
  { question: 'What does "circum-" mean?', options: ['around','through','before','after'], answer: 'around' },
  { question: '"Circumnavigate" means…', options: ['sail around','sail through','sail before','sail after'], answer: 'sail around' },
  { question: 'What does "contra-" mean?', options: ['against','for','before','after'], answer: 'against' },
  { question: '"Contradict" means…', options: ['say against','say for','say before','say after'], answer: 'say against' },
  { question: 'What does "extra-" mean?', options: ['beyond/outside','within','before','after'], answer: 'beyond/outside' },
  { question: '"Extraordinary" means…', options: ['beyond ordinary','within ordinary','before ordinary','after ordinary'], answer: 'beyond ordinary' },
  { question: 'What does "hyper-" mean?', options: ['over/above','under','before','after'], answer: 'over/above' },
  { question: '"Hyperactive" means…', options: ['overly active','under active','active before','active after'], answer: 'overly active' },
  { question: 'What does "micro-" mean?', options: ['very small','very large','before','after'], answer: 'very small' },
  { question: '"Microscope" means…', options: ['tool to see small things','tool to see large things','tool to see before','tool to see after'], answer: 'tool to see small things' },
  { question: 'What does "mono-" mean?', options: ['one','many','before','after'], answer: 'one' },
  { question: '"Monologue" means…', options: ['speech by one person','speech by many','speech before','speech after'], answer: 'speech by one person' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'prefix-power',
  title: 'Prefix Power',
  emoji: '⚡',
  subject: 'spelling',
  ageGroups: ['8–10', '11–13'],
  description: 'Master prefixes and unlock the meaning of hundreds of new words!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
