import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the antonym of "happy"?', options: ['joyful','sad','excited','calm'], answer: 'sad' },
  { question: 'What is the antonym of "hot"?', options: ['warm','cool','cold','chilly'], answer: 'cold' },
  { question: 'What is the antonym of "fast"?', options: ['quick','rapid','slow','speedy'], answer: 'slow' },
  { question: 'What is the antonym of "big"?', options: ['large','huge','small','tall'], answer: 'small' },
  { question: 'What is the antonym of "day"?', options: ['morning','evening','night','dusk'], answer: 'night' },
  { question: 'What is the antonym of "up"?', options: ['high','above','down','over'], answer: 'down' },
  { question: 'What is the antonym of "open"?', options: ['ajar','wide','shut','loose'], answer: 'shut' },
  { question: 'What is the antonym of "start"?', options: ['begin','launch','end','go'], answer: 'end' },
  { question: 'What is the antonym of "clean"?', options: ['tidy','neat','dirty','fresh'], answer: 'dirty' },
  { question: 'What is the antonym of "loud"?', options: ['noisy','booming','quiet','shrill'], answer: 'quiet' },
  { question: 'What is the antonym of "full"?', options: ['packed','stuffed','empty','loaded'], answer: 'empty' },
  { question: 'What is the antonym of "old"?', options: ['aged','ancient','new','worn'], answer: 'new' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the antonym of "light"?', options: ['bright','pale','dark','dim'], answer: 'dark' },
  { question: 'What is the antonym of "ancient"?', options: ['old','aged','modern','historic'], answer: 'modern' },
  { question: 'What is the antonym of "brave"?', options: ['courageous','bold','cowardly','daring'], answer: 'cowardly' },
  { question: 'What is the antonym of "generous"?', options: ['kind','giving','selfish','helpful'], answer: 'selfish' },
  { question: 'What is the antonym of "transparent"?', options: ['clear','see-through','opaque','shiny'], answer: 'opaque' },
  { question: 'What is the antonym of "expand"?', options: ['grow','enlarge','contract','increase'], answer: 'contract' },
  { question: 'What is the antonym of "victory"?', options: ['win','triumph','success','defeat'], answer: 'defeat' },
  { question: 'What is the antonym of "innocent"?', options: ['pure','blameless','guilty','honest'], answer: 'guilty' },
  { question: 'What is the antonym of "optimistic"?', options: ['hopeful','positive','pessimistic','cheerful'], answer: 'pessimistic' },
  { question: 'What is the antonym of "construct"?', options: ['build','make','demolish','create'], answer: 'demolish' },
  { question: 'What is the antonym of "ascend"?', options: ['rise','climb','descend','soar'], answer: 'descend' },
  { question: 'What is the antonym of "include"?', options: ['add','contain','exclude','involve'], answer: 'exclude' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the antonym of "benevolent"?', options: ['kind','generous','malevolent','caring'], answer: 'malevolent' },
  { question: 'What is the antonym of "verbose"?', options: ['wordy','talkative','concise','chatty'], answer: 'concise' },
  { question: 'What is the antonym of "transient"?', options: ['brief','fleeting','permanent','temporary'], answer: 'permanent' },
  { question: 'What is the antonym of "apathy"?', options: ['indifference','boredom','enthusiasm','laziness'], answer: 'enthusiasm' },
  { question: 'What is the antonym of "obscure"?', options: ['hidden','vague','prominent','unclear'], answer: 'prominent' },
  { question: 'What is the antonym of "frugal"?', options: ['thrifty','careful','extravagant','economical'], answer: 'extravagant' },
  { question: 'What is the antonym of "candid"?', options: ['honest','frank','evasive','open'], answer: 'evasive' },
  { question: 'What is the antonym of "serene"?', options: ['calm','peaceful','turbulent','tranquil'], answer: 'turbulent' },
  { question: 'What is the antonym of "diligent"?', options: ['hardworking','careful','negligent','thorough'], answer: 'negligent' },
  { question: 'What is the antonym of "meticulous"?', options: ['precise','careful','careless','thorough'], answer: 'careless' },
  { question: 'What is the antonym of "tenacious"?', options: ['determined','persistent','yielding','firm'], answer: 'yielding' },
  { question: 'What is the antonym of "eloquent"?', options: ['fluent','articulate','inarticulate','persuasive'], answer: 'inarticulate' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'antonym-arena',
  title: 'Antonym Arena',
  emoji: '⚔️',
  subject: 'reading',
  ageGroups: ['8–10', '11–13'],
  description: 'Find the opposite! Match each word to its antonym in this vocabulary battle.',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
