import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: '"I can ___ the birds singing." (hear/here)', options: ['hear','here','heer','hare'], answer: 'hear' },
  { question: '"Come over ___." (hear/here)', options: ['here','hear','heer','hire'], answer: 'here' },
  { question: '"The sun is ___." (bright/brite)', options: ['bright','brite','brigt','brigh'], answer: 'bright' },
  { question: '"___ is my book?" (where/wear)', options: ['Where','Wear','Ware','Were'], answer: 'Where' },
  { question: '"I will ___ my coat." (where/wear)', options: ['wear','where','ware','were'], answer: 'wear' },
  { question: '"The ___ is blue." (sea/see)', options: ['sea','see','si','cea'], answer: 'sea' },
  { question: '"I can ___ the stars." (sea/see)', options: ['see','sea','si','cee'], answer: 'see' },
  { question: '"She ___ a letter." (wrote/rote)', options: ['wrote','rote','wrought','rot'], answer: 'wrote' },
  { question: '"The ___ is cold." (air/heir)', options: ['air','heir','are','err'], answer: 'air' },
  { question: '"He is the ___ to the throne." (air/heir)', options: ['heir','air','are','err'], answer: 'heir' },
  { question: '"I ___ the ball." (threw/through)', options: ['threw','through','thru','throo'], answer: 'threw' },
  { question: '"Walk ___ the door." (threw/through)', options: ['through','threw','thru','throo'], answer: 'through' },
];
const L2: QuizQuestion[] = [
  { question: '"The ___ of the story is kindness." (moral/morale)', options: ['moral','morale','morall','morle'], answer: 'moral' },
  { question: '"The team\'s ___ was high." (moral/morale)', options: ['morale','moral','morall','morle'], answer: 'morale' },
  { question: '"She had a ___ effect on him." (affect/effect)', options: ['affect','effect','afect','efect'], answer: 'affect' },
  { question: '"The ___ was immediate." (affect/effect)', options: ['effect','affect','efect','afect'], answer: 'effect' },
  { question: '"I ___ to the meeting." (assent/ascent)', options: ['assent','ascent','asent','acent'], answer: 'assent' },
  { question: '"The ___ was steep." (assent/ascent)', options: ['ascent','assent','asent','acent'], answer: 'ascent' },
  { question: '"She ___ the throne." (ascended/assented)', options: ['ascended','assented','asended','asented'], answer: 'ascended' },
  { question: '"He ___ to the plan." (ascended/assented)', options: ['assented','ascended','asended','asented'], answer: 'assented' },
  { question: '"The ___ of the mountain was hard." (ascent/assent)', options: ['ascent','assent','asent','acent'], answer: 'ascent' },
  { question: '"They gave their ___ to the plan." (ascent/assent)', options: ['assent','ascent','asent','acent'], answer: 'assent' },
  { question: '"The ___ of the story is kindness." (moral/morale)', options: ['moral','morale','morall','morle'], answer: 'moral' },
  { question: '"The team\'s ___ was high." (moral/morale)', options: ['morale','moral','morall','morle'], answer: 'morale' },
];
const L3: QuizQuestion[] = [
  { question: '"The ___ of the argument was clear." (crux/cruks)', options: ['crux','cruks','crucks','cruxe'], answer: 'crux' },
  { question: '"She ___ the document." (pored/poured)', options: ['pored','poured','pord','pourd'], answer: 'pored' },
  { question: '"He ___ the tea." (pored/poured)', options: ['poured','pored','pord','pourd'], answer: 'poured' },
  { question: '"The ___ of the matter is trust." (kernel/colonel)', options: ['kernel','colonel','kernl','colonl'], answer: 'kernel' },
  { question: '"The ___ led the troops." (kernel/colonel)', options: ['colonel','kernel','kernl','colonl'], answer: 'colonel' },
  { question: '"She ___ over the books." (pored/poured)', options: ['pored','poured','pord','pourd'], answer: 'pored' },
  { question: '"He ___ the water." (pored/poured)', options: ['poured','pored','pord','pourd'], answer: 'poured' },
  { question: '"The ___ of the argument was clear." (crux/cruks)', options: ['crux','cruks','crucks','cruxe'], answer: 'crux' },
  { question: '"She ___ the document." (pored/poured)', options: ['pored','poured','pord','pourd'], answer: 'pored' },
  { question: '"He ___ the tea." (pored/poured)', options: ['poured','pored','pord','pourd'], answer: 'poured' },
  { question: '"The ___ of the matter is trust." (kernel/colonel)', options: ['kernel','colonel','kernl','colonl'], answer: 'kernel' },
  { question: '"The ___ led the troops." (kernel/colonel)', options: ['colonel','kernel','kernl','colonl'], answer: 'colonel' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'homophones',
  title: 'Homophones',
  emoji: '👂',
  subject: 'spelling',
  ageGroups: ['7–9', '10–13'],
  description: 'Words that sound the same but mean different things. Can you choose the right one?',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
