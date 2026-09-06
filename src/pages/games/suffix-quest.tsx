import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What does "-ful" mean?', options: ['full of','without','one who','the act of'], answer: 'full of' },
  { question: '"Hopeful" means…', options: ['full of hope','without hope','one who hopes','the act of hoping'], answer: 'full of hope' },
  { question: 'What does "-less" mean?', options: ['without','full of','one who','the act of'], answer: 'without' },
  { question: '"Hopeless" means…', options: ['without hope','full of hope','one who hopes','the act of hoping'], answer: 'without hope' },
  { question: 'What does "-er" mean?', options: ['one who','full of','without','the act of'], answer: 'one who' },
  { question: '"Teacher" means…', options: ['one who teaches','full of teaching','without teaching','the act of teaching'], answer: 'one who teaches' },
  { question: 'What does "-ness" mean?', options: ['the state of','full of','without','one who'], answer: 'the state of' },
  { question: '"Happiness" means…', options: ['the state of being happy','full of happy','without happy','one who is happy'], answer: 'the state of being happy' },
  { question: 'What does "-ly" mean?', options: ['in a way','full of','without','one who'], answer: 'in a way' },
  { question: '"Quickly" means…', options: ['in a quick way','full of quick','without quick','one who is quick'], answer: 'in a quick way' },
  { question: 'What does "-able" mean?', options: ['can be done','full of','without','one who'], answer: 'can be done' },
  { question: '"Readable" means…', options: ['can be read','full of reading','without reading','one who reads'], answer: 'can be read' },
];
const L2: QuizQuestion[] = [
  { question: 'What does "-tion" mean?', options: ['the act/state of','full of','without','one who'], answer: 'the act/state of' },
  { question: '"Education" means…', options: ['the act of educating','full of educating','without educating','one who educates'], answer: 'the act of educating' },
  { question: 'What does "-ment" mean?', options: ['the result of','full of','without','one who'], answer: 'the result of' },
  { question: '"Enjoyment" means…', options: ['the result of enjoying','full of enjoying','without enjoying','one who enjoys'], answer: 'the result of enjoying' },
  { question: 'What does "-ous" mean?', options: ['having the quality of','without','one who','the act of'], answer: 'having the quality of' },
  { question: '"Dangerous" means…', options: ['having the quality of danger','without danger','one who is dangerous','the act of danger'], answer: 'having the quality of danger' },
  { question: 'What does "-ive" mean?', options: ['tending to','without','one who','the act of'], answer: 'tending to' },
  { question: '"Creative" means…', options: ['tending to create','without creating','one who creates','the act of creating'], answer: 'tending to create' },
  { question: 'What does "-al" mean?', options: ['relating to','without','one who','the act of'], answer: 'relating to' },
  { question: '"Musical" means…', options: ['relating to music','without music','one who plays music','the act of music'], answer: 'relating to music' },
  { question: 'What does "-ism" mean?', options: ['a belief or practice','without','one who','the act of'], answer: 'a belief or practice' },
  { question: '"Realism" means…', options: ['a belief in reality','without reality','one who is real','the act of being real'], answer: 'a belief in reality' },
];
const L3: QuizQuestion[] = [
  { question: 'What does "-ology" mean?', options: ['the study of','without','one who','the act of'], answer: 'the study of' },
  { question: '"Biology" means…', options: ['the study of life','without life','one who studies life','the act of living'], answer: 'the study of life' },
  { question: 'What does "-ist" mean?', options: ['one who practises','without','the study of','the act of'], answer: 'one who practises' },
  { question: '"Scientist" means…', options: ['one who practises science','without science','the study of science','the act of science'], answer: 'one who practises science' },
  { question: 'What does "-ify" mean?', options: ['to make or become','without','one who','the study of'], answer: 'to make or become' },
  { question: '"Simplify" means…', options: ['to make simple','without simple','one who is simple','the study of simple'], answer: 'to make simple' },
  { question: 'What does "-itude" mean?', options: ['the state or quality of','without','one who','the study of'], answer: 'the state or quality of' },
  { question: '"Gratitude" means…', options: ['the state of being grateful','without gratitude','one who is grateful','the study of gratitude'], answer: 'the state of being grateful' },
  { question: 'What does "-archy" mean?', options: ['rule or government','without','one who','the study of'], answer: 'rule or government' },
  { question: '"Monarchy" means…', options: ['rule by one person','rule by many','without rule','the study of rule'], answer: 'rule by one person' },
  { question: 'What does "-cracy" mean?', options: ['rule or government','without','one who','the study of'], answer: 'rule or government' },
  { question: '"Democracy" means…', options: ['rule by the people','rule by one','without rule','the study of rule'], answer: 'rule by the people' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'suffix-quest',
  title: 'Suffix Quest',
  emoji: '🔚',
  subject: 'spelling',
  ageGroups: ['8–10', '11–13'],
  description: 'Learn suffixes and unlock the meaning of hundreds of new words!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
