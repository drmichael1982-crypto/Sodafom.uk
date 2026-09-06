import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word has double letters?', options: ['ball','bat','cat','dog'], answer: 'ball' },
  { question: 'Which word has double letters?', options: ['bell','belt','best','bend'], answer: 'bell' },
  { question: 'Which word has double letters?', options: ['hill','hilt','hint','hire'], answer: 'hill' },
  { question: 'Which word has double letters?', options: ['full','fuel','fume','fuse'], answer: 'full' },
  { question: 'Which word has double letters?', options: ['well','weld','welt','went'], answer: 'well' },
  { question: 'Which word has double letters?', options: ['miss','mist','mint','mild'], answer: 'miss' },
  { question: 'Which word has double letters?', options: ['buzz','bust','bulk','burn'], answer: 'buzz' },
  { question: 'Which word has double letters?', options: ['add','aid','aim','air'], answer: 'add' },
  { question: 'Which word has double letters?', options: ['egg','end','era','eve'], answer: 'egg' },
  { question: 'Which word has double letters?', options: ['odd','old','oil','oak'], answer: 'odd' },
  { question: 'Which word has double letters?', options: ['off','oak','oar','oat'], answer: 'off' },
  { question: 'Which word has double letters?', options: ['inn','ink','ion','ice'], answer: 'inn' },
];
const L2: QuizQuestion[] = [
  { question: 'Which spelling is correct?', options: ['rabbit','rabit','rabitt','rabbitt'], answer: 'rabbit' },
  { question: 'Which spelling is correct?', options: ['button','buton','buttton','buttn'], answer: 'button' },
  { question: 'Which spelling is correct?', options: ['kitten','kiten','kittten','kittn'], answer: 'kitten' },
  { question: 'Which spelling is correct?', options: ['happen','hapen','happenn','hapn'], answer: 'happen' },
  { question: 'Which spelling is correct?', options: ['dinner','diner','dinnerr','dinr'], answer: 'dinner' },
  { question: 'Which spelling is correct?', options: ['letter','leter','letterr','letr'], answer: 'letter' },
  { question: 'Which spelling is correct?', options: ['mirror','miror','mirrorr','mirr'], answer: 'mirror' },
  { question: 'Which spelling is correct?', options: ['pillow','pilow','pilllow','pilw'], answer: 'pillow' },
  { question: 'Which spelling is correct?', options: ['yellow','yelow','yelllow','yelw'], answer: 'yellow' },
  { question: 'Which spelling is correct?', options: ['follow','folow','followw','folw'], answer: 'follow' },
  { question: 'Which spelling is correct?', options: ['hollow','holow','holllow','holw'], answer: 'hollow' },
  { question: 'Which spelling is correct?', options: ['borrow','borow','borroww','borw'], answer: 'borrow' },
];
const L3: QuizQuestion[] = [
  { question: 'Which word doubles the consonant before -ing?', options: ['running','runing','runninng','runnning'], answer: 'running' },
  { question: 'Which word doubles the consonant before -ed?', options: ['stopped','stoped','stoppedd','stoppped'], answer: 'stopped' },
  { question: 'Which word doubles the consonant before -er?', options: ['bigger','biger','biggerr','biggger'], answer: 'bigger' },
  { question: 'Which word doubles the consonant before -est?', options: ['biggest','bigest','biggestt','bigggest'], answer: 'biggest' },
  { question: 'Which word doubles the consonant before -ing?', options: ['swimming','swiming','swimminng','swimmming'], answer: 'swimming' },
  { question: 'Which word doubles the consonant before -ed?', options: ['planned','planed','plannedd','plannnned'], answer: 'planned' },
  { question: 'Which word doubles the consonant before -er?', options: ['thinner','thiner','thinnerr','thinnner'], answer: 'thinner' },
  { question: 'Which word doubles the consonant before -est?', options: ['thinnest','thinest','thinnestt','thinnest'], answer: 'thinnest' },
  { question: 'Which word doubles the consonant before -ing?', options: ['sitting','siting','sittinng','sittting'], answer: 'sitting' },
  { question: 'Which word doubles the consonant before -ed?', options: ['dropped','droped','droppedd','droppped'], answer: 'dropped' },
  { question: 'Which word doubles the consonant before -er?', options: ['hotter','hoter','hotterr','hottter'], answer: 'hotter' },
  { question: 'Which word doubles the consonant before -est?', options: ['hottest','hotest','hottestt','hottttest'], answer: 'hottest' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'double-letters',
  title: 'Double Letters',
  emoji: '✌️',
  subject: 'spelling',
  ageGroups: ['6–8', '9–11'],
  description: 'Spot the double letters and learn when to double consonants in spelling!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
