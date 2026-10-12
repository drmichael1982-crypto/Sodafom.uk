import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word comes first in a dictionary?', options: ['apple','banana','cherry','date'], answer: 'apple' },
  { question: 'Which word comes first in a dictionary?', options: ['cat','dog','elephant','fox'], answer: 'cat' },
  { question: 'Which word comes last in a dictionary?', options: ['zoo','yak','xray','wolf'], answer: 'zoo' },
  { question: 'Which word comes first in a dictionary?', options: ['ant','bee','cow','duck'], answer: 'ant' },
  { question: 'Which word comes first in a dictionary?', options: ['hat','igloo','jar','kite'], answer: 'hat' },
  { question: 'Which word comes last in a dictionary?', options: ['sun','tree','umbrella','van'], answer: 'van' },
  { question: 'Which word comes first in a dictionary?', options: ['mango','noodle','orange','pear'], answer: 'mango' },
  { question: 'Which word comes first in a dictionary?', options: ['queen','rabbit','snake','tiger'], answer: 'queen' },
  { question: 'Which word comes last in a dictionary?', options: ['lamp','moon','night','owl'], answer: 'owl' },
  { question: 'Which word comes first in a dictionary?', options: ['ball','cake','door','egg'], answer: 'ball' },
  { question: 'Which word comes last in a dictionary?', options: ['fish','gate','hill','iron'], answer: 'iron' },
  { question: 'Which word comes first in a dictionary?', options: ['jump','king','lion','map'], answer: 'jump' },
];
const L2: QuizQuestion[] = [
  { question: 'Which word comes first alphabetically?', options: ['bread','break','brew','bream'], answer: 'bread' },
  { question: 'Which word comes last alphabetically?', options: ['stamp','stand','star','stare'], answer: 'stare' },
  { question: 'Which word comes first alphabetically?', options: ['flight','fling','flip','flit'], answer: 'flight' },
  { question: 'Which word comes last alphabetically?', options: ['plant','plane','plan','plank'], answer: 'plant' },
  { question: 'Which word comes first alphabetically?', options: ['cream','creak','creek','creep'], answer: 'creak' },
  { question: 'Which word comes last alphabetically?', options: ['grin','grip','grit','gripe'], answer: 'grit' },
  { question: 'Which word comes first alphabetically?', options: ['sport','spore','spoke','spool'], answer: 'spoke' },
  { question: 'Which word comes last alphabetically?', options: ['train','trail','trait','traitor'], answer: 'traitor' },
  { question: 'Which word comes first alphabetically?', options: ['blend','bleat','bleed','bless'], answer: 'bleat' },
  { question: 'Which word comes last alphabetically?', options: ['clamp','clam','clan','clang'], answer: 'clamp' },
  { question: 'Which word comes first alphabetically?', options: ['frost','frown','froze','froth'], answer: 'frost' },
  { question: 'Which word comes last alphabetically?', options: ['shred','shrew','shriek','shrine'], answer: 'shrine' },
];
const L3: QuizQuestion[] = [
  { question: 'What does "benevolent" mean?', options: ['kind and generous','cruel and mean','brave and bold','shy and quiet'], answer: 'kind and generous' },
  { question: 'What does "melancholy" mean?', options: ['deep sadness','great joy','fierce anger','mild surprise'], answer: 'deep sadness' },
  { question: 'What does "eloquent" mean?', options: ['speaking fluently and persuasively','speaking quietly and slowly','speaking rudely and loudly','speaking rarely and briefly'], answer: 'speaking fluently and persuasively' },
  { question: 'What does "tenacious" mean?', options: ['holding firmly to a purpose','giving up easily','moving very quickly','thinking very deeply'], answer: 'holding firmly to a purpose' },
  { question: 'What does "ambiguous" mean?', options: ['having more than one meaning','having no meaning','having a clear meaning','having a hidden meaning'], answer: 'having more than one meaning' },
  { question: 'What does "diligent" mean?', options: ['hardworking and careful','lazy and careless','quick and reckless','slow and thoughtful'], answer: 'hardworking and careful' },
  { question: 'What does "frugal" mean?', options: ['careful with money','generous with money','earning lots of money','spending lots of money'], answer: 'careful with money' },
  { question: 'What does "gregarious" mean?', options: ['enjoying company of others','preferring to be alone','being very shy','being very loud'], answer: 'enjoying company of others' },
  { question: 'What does "inquisitive" mean?', options: ['curious and eager to learn','bored and uninterested','happy and content','sad and withdrawn'], answer: 'curious and eager to learn' },
  { question: 'What does "lethargic" mean?', options: ['lacking energy','full of energy','very angry','very happy'], answer: 'lacking energy' },
  { question: 'What does "meticulous" mean?', options: ['very careful and precise','very careless and rough','very fast and efficient','very slow and thorough'], answer: 'very careful and precise' },
  { question: 'What does "nonchalant" mean?', options: ['appearing calm and unconcerned','appearing worried and anxious','appearing happy and excited','appearing sad and depressed'], answer: 'appearing calm and unconcerned' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'dictionary-dash',
  title: 'Dictionary Dash',
  emoji: '📖',
  subject: 'spelling',
  ageGroups: ['7–9', '10–13'],
  description: 'Race through the dictionary — alphabetical order and word meanings!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
