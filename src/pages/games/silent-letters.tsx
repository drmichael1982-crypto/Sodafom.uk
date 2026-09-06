import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which letter is silent in "knife"?', options: ['k','n','i','e'], answer: 'k' },
  { question: 'Which letter is silent in "write"?', options: ['w','r','i','e'], answer: 'w' },
  { question: 'Which letter is silent in "lamb"?', options: ['b','l','a','m'], answer: 'b' },
  { question: 'Which letter is silent in "knee"?', options: ['k','n','e','ee'], answer: 'k' },
  { question: 'Which letter is silent in "gnome"?', options: ['g','n','o','m'], answer: 'g' },
  { question: 'Which letter is silent in "wrap"?', options: ['w','r','a','p'], answer: 'w' },
  { question: 'Which letter is silent in "comb"?', options: ['b','c','o','m'], answer: 'b' },
  { question: 'Which letter is silent in "hour"?', options: ['h','o','u','r'], answer: 'h' },
  { question: 'Which letter is silent in "island"?', options: ['s','i','l','a'], answer: 's' },
  { question: 'Which letter is silent in "castle"?', options: ['t','c','a','s'], answer: 't' },
  { question: 'Which letter is silent in "thumb"?', options: ['b','t','h','u'], answer: 'b' },
  { question: 'Which letter is silent in "knight"?', options: ['k','n','i','g'], answer: 'k' },
];
const L2: QuizQuestion[] = [
  { question: 'Which word has a silent "p"?', options: ['psychology','purple','pepper','paper'], answer: 'psychology' },
  { question: 'Which word has a silent "gh"?', options: ['night','ghost','eight','both night and eight'], answer: 'both night and eight' },
  { question: 'Which word has a silent "c"?', options: ['science','circle','cycle','scone'], answer: 'science' },
  { question: 'Which word has a silent "d"?', options: ['handsome','handle','dandle','candle'], answer: 'handsome' },
  { question: 'Which word has a silent "l"?', options: ['calm','call','ball','tall'], answer: 'calm' },
  { question: 'Which word has a silent "n"?', options: ['autumn','antenna','annual','annex'], answer: 'autumn' },
  { question: 'Which word has a silent "u"?', options: ['guard','guru','gust','gull'], answer: 'guard' },
  { question: 'Which word has a silent "e"?', options: ['cake','cake (the e is silent)','cake (the a is silent)','cake (the c is silent)'], answer: 'cake (the e is silent)' },
  { question: 'Which word has a silent "h"?', options: ['vehicle','hedge','harsh','harsh'], answer: 'vehicle' },
  { question: 'Which word has a silent "t"?', options: ['listen','litter','letter','latter'], answer: 'listen' },
  { question: 'Which word has a silent "b"?', options: ['debt','debut','debate','debit'], answer: 'debt' },
  { question: 'Which word has a silent "g"?', options: ['sign','sing','sting','ring'], answer: 'sign' },
];
const L3: QuizQuestion[] = [
  { question: 'Which word has a silent "mn"?', options: ['condemn','column','autumn','hymn'], answer: 'condemn' },
  { question: 'Which word has a silent "pt"?', options: ['receipt','concept','except','accept'], answer: 'receipt' },
  { question: 'Which word has a silent "ch"?', options: ['yacht','church','churn','charm'], answer: 'yacht' },
  { question: 'Which word has a silent "sc"?', options: ['scissors','science','scone','scene'], answer: 'scissors' },
  { question: 'Which word has a silent "rh"?', options: ['rhyme','rhythm','rhino','all of these'], answer: 'all of these' },
  { question: 'Which word has a silent "ps"?', options: ['psalm','pseudo','psyche','all of these'], answer: 'all of these' },
  { question: 'Which word has a silent "wr"?', options: ['wrong','wring','wrist','all of these'], answer: 'all of these' },
  { question: 'Which word has a silent "kn"?', options: ['know','kneel','knit','all of these'], answer: 'all of these' },
  { question: 'Which word has a silent "gn"?', options: ['gnaw','gnarl','gnome','all of these'], answer: 'all of these' },
  { question: 'Which word has a silent "mb"?', options: ['climb','comb','bomb','all of these'], answer: 'all of these' },
  { question: 'Which word has a silent "lk"?', options: ['walk','talk','chalk','all of these'], answer: 'all of these' },
  { question: 'Which word has a silent "lf"?', options: ['half','calf','behalf','all of these'], answer: 'all of these' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'silent-letters',
  title: 'Silent Letters',
  emoji: '🤫',
  subject: 'spelling',
  ageGroups: ['7–9', '10–13'],
  description: 'Spot the letters that hide in words but make no sound!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
