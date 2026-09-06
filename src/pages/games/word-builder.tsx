import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Add a letter to make a word: _at', options: ['c','x','q','z'], answer: 'c' },
  { question: 'Add a letter to make a word: _og', options: ['d','x','q','z'], answer: 'd' },
  { question: 'Add a letter to make a word: _un', options: ['s','x','q','z'], answer: 's' },
  { question: 'Add a letter to make a word: _ig', options: ['b','x','q','z'], answer: 'b' },
  { question: 'Add a letter to make a word: _op', options: ['t','x','q','z'], answer: 't' },
  { question: 'Add a letter to make a word: _en', options: ['h','x','q','z'], answer: 'h' },
  { question: 'Add a letter to make a word: _ed', options: ['r','x','q','z'], answer: 'r' },
  { question: 'Add a letter to make a word: _in', options: ['p','x','q','z'], answer: 'p' },
  { question: 'Add a letter to make a word: _up', options: ['c','x','q','z'], answer: 'c' },
  { question: 'Add a letter to make a word: _et', options: ['n','x','q','z'], answer: 'n' },
  { question: 'Add a letter to make a word: _ot', options: ['h','x','q','z'], answer: 'h' },
  { question: 'Add a letter to make a word: _ug', options: ['m','x','q','z'], answer: 'm' },
];
const L2: QuizQuestion[] = [
  { question: 'Which letters complete "spl_sh"?', options: ['a','e','i','o'], answer: 'a' },
  { question: 'Which letters complete "str_ng"?', options: ['o','a','e','i'], answer: 'o' },
  { question: 'Which letters complete "scr_m"?', options: ['ea','ee','ai','oa'], answer: 'ea' },
  { question: 'Which letters complete "thr_w"?', options: ['e','a','i','o'], answer: 'e' },
  { question: 'Which letters complete "shr_nk"?', options: ['i','a','e','o'], answer: 'i' },
  { question: 'Which letters complete "spr_ng"?', options: ['i','a','e','o'], answer: 'i' },
  { question: 'Which letters complete "str_ke"?', options: ['i','a','e','o'], answer: 'i' },
  { question: 'Which letters complete "scr_tch"?', options: ['a','e','i','o'], answer: 'a' },
  { question: 'Which letters complete "thr_bb"?', options: ['o','a','e','i'], answer: 'o' },
  { question: 'Which letters complete "spl_nter"?', options: ['i','a','e','o'], answer: 'i' },
  { question: 'Which letters complete "str_tch"?', options: ['e','a','i','o'], answer: 'e' },
  { question: 'Which letters complete "scr_wl"?', options: ['a','e','i','o'], answer: 'a' },
];
const L3: QuizQuestion[] = [
  { question: 'Build a word: "photo" + "graph" = ?', options: ['photograph','photograp','photgraph','photograff'], answer: 'photograph' },
  { question: 'Build a word: "tele" + "scope" = ?', options: ['telescope','telescop','telscope','telescoppe'], answer: 'telescope' },
  { question: 'Build a word: "micro" + "scope" = ?', options: ['microscope','microscp','micrscope','microscoppe'], answer: 'microscope' },
  { question: 'Build a word: "bio" + "logy" = ?', options: ['biology','biolog','biolgy','biologgy'], answer: 'biology' },
  { question: 'Build a word: "geo" + "logy" = ?', options: ['geology','geolog','geolgy','geologgy'], answer: 'geology' },
  { question: 'Build a word: "astro" + "nomy" = ?', options: ['astronomy','astronmy','astrnomy','astronommy'], answer: 'astronomy' },
  { question: 'Build a word: "thermo" + "meter" = ?', options: ['thermometer','thermomter','thermmetr','thermometerr'], answer: 'thermometer' },
  { question: 'Build a word: "baro" + "meter" = ?', options: ['barometer','baromter','barmetr','barometerr'], answer: 'barometer' },
  { question: 'Build a word: "chron" + "ology" = ?', options: ['chronology','chronolgy','chrnology','chronologgy'], answer: 'chronology' },
  { question: 'Build a word: "arch" + "ology" = ?', options: ['archaeology','archeolgy','archlogy','archaeologgy'], answer: 'archaeology' },
  { question: 'Build a word: "psych" + "ology" = ?', options: ['psychology','psycholgy','psyclogy','psychologgy'], answer: 'psychology' },
  { question: 'Build a word: "anthrop" + "ology" = ?', options: ['anthropology','anthropolgy','anthrlogy','anthropologgy'], answer: 'anthropology' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'word-builder',
  title: 'Word Builder',
  emoji: '🏗️',
  subject: 'spelling',
  ageGroups: ['5–7', '8–10'],
  description: 'Build words from letters and word parts — a spelling construction challenge!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
