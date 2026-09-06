import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word belongs to the "-at" family?', options: ['cat','cup','dog','sun'], answer: 'cat' },
  { question: 'Which word belongs to the "-og" family?', options: ['log','cat','hat','sun'], answer: 'log' },
  { question: 'Which word belongs to the "-un" family?', options: ['fun','cat','dog','hat'], answer: 'fun' },
  { question: 'Which word belongs to the "-ig" family?', options: ['pig','cat','dog','sun'], answer: 'pig' },
  { question: 'Which word belongs to the "-op" family?', options: ['top','cat','dog','sun'], answer: 'top' },
  { question: 'Which word belongs to the "-en" family?', options: ['hen','cat','dog','sun'], answer: 'hen' },
  { question: 'Which word belongs to the "-ed" family?', options: ['red','cat','dog','sun'], answer: 'red' },
  { question: 'Which word belongs to the "-in" family?', options: ['pin','cat','dog','sun'], answer: 'pin' },
  { question: 'Which word belongs to the "-up" family?', options: ['cup','cat','dog','sun'], answer: 'cup' },
  { question: 'Which word belongs to the "-et" family?', options: ['net','cat','dog','sun'], answer: 'net' },
  { question: 'Which word belongs to the "-ot" family?', options: ['pot','cat','dog','sun'], answer: 'pot' },
  { question: 'Which word belongs to the "-ug" family?', options: ['mug','cat','dog','sun'], answer: 'mug' },
];
const L2: QuizQuestion[] = [
  { question: 'Which word belongs to the "-ight" family?', options: ['night','nit','neat','note'], answer: 'night' },
  { question: 'Which word belongs to the "-ain" family?', options: ['train','tan','ten','ton'], answer: 'train' },
  { question: 'Which word belongs to the "-oat" family?', options: ['coat','cat','cut','cot'], answer: 'coat' },
  { question: 'Which word belongs to the "-eet" family?', options: ['meet','mat','mit','mot'], answer: 'meet' },
  { question: 'Which word belongs to the "-ue" family?', options: ['clue','cla','cli','clo'], answer: 'clue' },
  { question: 'Which word belongs to the "-oud" family?', options: ['loud','lad','lid','lod'], answer: 'loud' },
  { question: 'Which word belongs to the "-oy" family?', options: ['joy','jay','jiy','juy'], answer: 'joy' },
  { question: 'Which word belongs to the "-ar" family?', options: ['star','ster','stir','stor'], answer: 'star' },
  { question: 'Which word belongs to the "-orn" family?', options: ['horn','han','hin','hun'], answer: 'horn' },
  { question: 'Which word belongs to the "-er" family?', options: ['stir','star','ster','stor'], answer: 'stir' },
  { question: 'Which word belongs to the "-are" family?', options: ['share','shar','shir','shor'], answer: 'share' },
  { question: 'Which word belongs to the "-ear" family?', options: ['fear','far','fir','for'], answer: 'fear' },
];
const L3: QuizQuestion[] = [
  { question: 'Which words are in the same word family as "sign"?', options: ['signal, signature','sine, sigh','sin, sing','sigh, sigh'], answer: 'signal, signature' },
  { question: 'Which words are in the same word family as "nation"?', options: ['national, nationality','native, nature','natal, nativity','natter, natty'], answer: 'national, nationality' },
  { question: 'Which words are in the same word family as "act"?', options: ['action, actor','actual, actually','acute, acuity','acme, acne'], answer: 'action, actor' },
  { question: 'Which words are in the same word family as "press"?', options: ['pressure, impression','precise, precision','prey, prayer','preen, preening'], answer: 'pressure, impression' },
  { question: 'Which words are in the same word family as "form"?', options: ['formal, formation','force, forceful','fort, fortune','fore, forearm'], answer: 'formal, formation' },
  { question: 'Which words are in the same word family as "port"?', options: ['portable, transport','portion, portly','portal, portent','porch, pork'], answer: 'portable, transport' },
  { question: 'Which words are in the same word family as "dict"?', options: ['dictate, dictionary','diction, fiction','digit, digital','dim, dimly'], answer: 'dictate, dictionary' },
  { question: 'Which words are in the same word family as "vis"?', options: ['visible, vision','visit, visitor','vital, vitality','vine, vinegar'], answer: 'visible, vision' },
  { question: 'Which words are in the same word family as "aud"?', options: ['audio, audience','audit, auditor','audible, auditorium','all of these'], answer: 'all of these' },
  { question: 'Which words are in the same word family as "scrib/script"?', options: ['describe, prescription','scribe, scripture','inscribe, manuscript','all of these'], answer: 'all of these' },
  { question: 'Which words are in the same word family as "spec"?', options: ['spectacle, inspect','special, species','specific, specify','all of these'], answer: 'all of these' },
  { question: 'Which words are in the same word family as "rupt"?', options: ['rupture, interrupt','erupt, eruption','corrupt, corruption','all of these'], answer: 'all of these' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'word-families',
  title: 'Word Families',
  emoji: '👨‍👩‍👧‍👦',
  subject: 'spelling',
  ageGroups: ['5–7', '8–10'],
  description: 'Group words that share the same pattern or root — word families!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
