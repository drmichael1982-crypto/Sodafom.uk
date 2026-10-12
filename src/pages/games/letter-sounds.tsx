import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What sound does "b" make?', options: ['/b/ as in ball','/p/ as in pin','/d/ as in dog','/g/ as in get'], answer: '/b/ as in ball' },
  { question: 'What sound does "c" make in "cat"?', options: ['/k/ as in cat','/s/ as in sit','/ch/ as in chip','/sh/ as in ship'], answer: '/k/ as in cat' },
  { question: 'What sound does "d" make?', options: ['/d/ as in dog','/t/ as in top','/b/ as in ball','/g/ as in get'], answer: '/d/ as in dog' },
  { question: 'What sound does "f" make?', options: ['/f/ as in fan','/v/ as in van','/th/ as in the','/ph/ as in phone'], answer: '/f/ as in fan' },
  { question: 'What sound does "g" make in "get"?', options: ['/g/ as in get','/j/ as in jet','/k/ as in cat','/ch/ as in chip'], answer: '/g/ as in get' },
  { question: 'What sound does "h" make?', options: ['/h/ as in hat','/ch/ as in chip','/sh/ as in ship','/wh/ as in when'], answer: '/h/ as in hat' },
  { question: 'What sound does "j" make?', options: ['/j/ as in jet','/g/ as in get','/y/ as in yes','/ch/ as in chip'], answer: '/j/ as in jet' },
  { question: 'What sound does "k" make?', options: ['/k/ as in kit','/g/ as in get','/c/ as in cat','/ch/ as in chip'], answer: '/k/ as in kit' },
  { question: 'What sound does "l" make?', options: ['/l/ as in lip','/r/ as in rip','/w/ as in win','/n/ as in nip'], answer: '/l/ as in lip' },
  { question: 'What sound does "m" make?', options: ['/m/ as in map','/n/ as in nap','/ng/ as in ring','/mb/ as in lamb'], answer: '/m/ as in map' },
  { question: 'What sound does "n" make?', options: ['/n/ as in nap','/m/ as in map','/ng/ as in ring','/kn/ as in knee'], answer: '/n/ as in nap' },
  { question: 'What sound does "p" make?', options: ['/p/ as in pin','/b/ as in bin','/f/ as in fin','/ph/ as in phone'], answer: '/p/ as in pin' },
];
const L2: QuizQuestion[] = [
  { question: 'What digraph makes the /sh/ sound?', options: ['sh','ch','th','ph'], answer: 'sh' },
  { question: 'What digraph makes the /ch/ sound?', options: ['ch','sh','th','ph'], answer: 'ch' },
  { question: 'What digraph makes the /th/ sound?', options: ['th','sh','ch','ph'], answer: 'th' },
  { question: 'What digraph makes the /ph/ sound like /f/?', options: ['ph','gh','wh','ch'], answer: 'ph' },
  { question: 'What digraph makes the /wh/ sound?', options: ['wh','ph','gh','ch'], answer: 'wh' },
  { question: 'What trigraph makes the /tch/ sound?', options: ['tch','sch','dge','nge'], answer: 'tch' },
  { question: 'What digraph makes the /ng/ sound?', options: ['ng','nk','gn','kn'], answer: 'ng' },
  { question: 'What digraph makes the /kn/ sound like /n/?', options: ['kn','gn','pn','mn'], answer: 'kn' },
  { question: 'What digraph makes the /wr/ sound like /r/?', options: ['wr','rh','rw','hr'], answer: 'wr' },
  { question: 'What digraph makes the /gh/ sound like /f/?', options: ['gh','ph','wh','ch'], answer: 'gh' },
  { question: 'What trigraph makes the /dge/ sound?', options: ['dge','tch','sch','nge'], answer: 'dge' },
  { question: 'What digraph makes the /qu/ sound?', options: ['qu','kw','cw','qw'], answer: 'qu' },
];
const L3: QuizQuestion[] = [
  { question: 'Which word has the long /a/ sound spelled "ai"?', options: ['rain','ran','ruin','rein'], answer: 'rain' },
  { question: 'Which word has the long /e/ sound spelled "ee"?', options: ['feet','fat','fit','fate'], answer: 'feet' },
  { question: 'Which word has the long /i/ sound spelled "igh"?', options: ['night','nit','neat','note'], answer: 'night' },
  { question: 'Which word has the long /o/ sound spelled "oa"?', options: ['boat','bat','bit','but'], answer: 'boat' },
  { question: 'Which word has the long /u/ sound spelled "ue"?', options: ['blue','blot','blat','blet'], answer: 'blue' },
  { question: 'Which word has the /ow/ sound spelled "ou"?', options: ['cloud','clod','clad','clued'], answer: 'cloud' },
  { question: 'Which word has the /oi/ sound spelled "oy"?', options: ['boy','bay','buy','bow'], answer: 'boy' },
  { question: 'Which word has the /ar/ sound spelled "ar"?', options: ['car','core','cure','care'], answer: 'car' },
  { question: 'Which word has the /or/ sound spelled "or"?', options: ['corn','can','cone','coin'], answer: 'corn' },
  { question: 'Which word has the /er/ sound spelled "er"?', options: ['her','here','hire','hare'], answer: 'her' },
  { question: 'Which word has the /air/ sound spelled "are"?', options: ['care','car','core','cure'], answer: 'care' },
  { question: 'Which word has the /ear/ sound spelled "ear"?', options: ['near','nor','nare','nore'], answer: 'near' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'letter-sounds',
  title: 'Letter Sounds',
  emoji: '🔤',
  subject: 'spelling',
  ageGroups: ['4–6', '7–8'],
  description: 'Learn the sounds that letters and letter combinations make in English!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
