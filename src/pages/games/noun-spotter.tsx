import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word is a noun?', options: ['run','happy','table','quickly'], answer: 'table' },
  { question: 'Which word is a noun?', options: ['jump','blue','dog','slowly'], answer: 'dog' },
  { question: 'Which word is a noun?', options: ['eat','tall','book','quietly'], answer: 'book' },
  { question: 'Which word is a noun?', options: ['swim','red','flower','fast'], answer: 'flower' },
  { question: 'Which word is a noun?', options: ['sleep','cold','house','gently'], answer: 'house' },
  { question: 'Which word is a noun?', options: ['fly','green','bird','loudly'], answer: 'bird' },
  { question: 'Which word is a noun?', options: ['walk','big','school','quickly'], answer: 'school' },
  { question: 'Which word is a noun?', options: ['sing','small','song','softly'], answer: 'song' },
  { question: 'Which word is a noun?', options: ['dance','happy','music','brightly'], answer: 'music' },
  { question: 'Which word is a noun?', options: ['read','long','story','carefully'], answer: 'story' },
  { question: 'Which word is a noun?', options: ['draw','round','circle','neatly'], answer: 'circle' },
  { question: 'Which word is a noun?', options: ['play','sunny','park','wildly'], answer: 'park' },
];
const L2: QuizQuestion[] = [
  { question: 'Which word is a proper noun?', options: ['city','london','river','mountain'], answer: 'london' },
  { question: 'Which word is a collective noun for a group of fish?', options: ['pack','flock','shoal','herd'], answer: 'shoal' },
  { question: 'Which word is a collective noun for a group of wolves?', options: ['pack','flock','shoal','herd'], answer: 'pack' },
  { question: 'Which word is an abstract noun?', options: ['table','dog','happiness','run'], answer: 'happiness' },
  { question: 'Which word is a concrete noun?', options: ['love','freedom','chair','anger'], answer: 'chair' },
  { question: 'In "The brave knight fought the dragon", which word is a noun?', options: ['brave','fought','knight','the'], answer: 'knight' },
  { question: 'Which of these is a collective noun for birds?', options: ['pack','flock','shoal','pride'], answer: 'flock' },
  { question: 'Which word is a proper noun?', options: ['country','france','ocean','mountain'], answer: 'france' },
  { question: 'Which word is an abstract noun?', options: ['book','tree','courage','house'], answer: 'courage' },
  { question: 'In "The children played in the garden", how many nouns are there?', options: ['1','2','3','4'], answer: '2' },
  { question: 'Which collective noun goes with "lions"?', options: ['pack','flock','pride','herd'], answer: 'pride' },
  { question: 'Which word is a collective noun for a group of cows?', options: ['pack','flock','shoal','herd'], answer: 'herd' },
];
const L3: QuizQuestion[] = [
  { question: 'What is a gerund?', options: ['A verb used as a noun','A type of adjective','A type of adverb','A type of conjunction'], answer: 'A verb used as a noun' },
  { question: 'In "Swimming is fun", what type of noun is "swimming"?', options: ['Concrete noun','Abstract noun','Gerund','Proper noun'], answer: 'Gerund' },
  { question: 'What is a compound noun?', options: ['A noun made from two words','A noun that names a group','A noun that names a feeling','A noun that names a place'], answer: 'A noun made from two words' },
  { question: 'Which of these is a compound noun?', options: ['happy','football','run','quickly'], answer: 'football' },
  { question: 'What is a countable noun?', options: ['A noun that can be counted (e.g. one book, two books)','A noun that cannot be counted','A noun that names a feeling','A noun that names a group'], answer: 'A noun that can be counted (e.g. one book, two books)' },
  { question: 'What is an uncountable noun?', options: ['A noun that can be counted','A noun that cannot be counted (e.g. water, music)','A noun that names a group','A noun that names a place'], answer: 'A noun that cannot be counted (e.g. water, music)' },
  { question: 'Which of these is an uncountable noun?', options: ['book','chair','water','dog'], answer: 'water' },
  { question: 'What is a noun phrase?', options: ['A noun on its own','A noun and its modifiers','A verb phrase','A prepositional phrase'], answer: 'A noun and its modifiers' },
  { question: 'In "the old red car", what is the noun phrase?', options: ['the old','old red car','the old red car','red car'], answer: 'the old red car' },
  { question: 'What is an appositive noun?', options: ['A noun that renames another noun next to it','A noun that names a group','A noun that names a feeling','A noun that names a place'], answer: 'A noun that renames another noun next to it' },
  { question: 'In "My friend, the doctor, arrived.", what is the appositive?', options: ['My friend','the doctor','arrived','My'], answer: 'the doctor' },
  { question: 'What is a possessive noun?', options: ['A noun showing ownership (e.g. the dog\'s bone)','A noun that names a group','A noun that names a feeling','A noun that names a place'], answer: 'A noun showing ownership (e.g. the dog\'s bone)' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'noun-spotter',
  title: 'Noun Spotter',
  emoji: '🔎',
  subject: 'reading',
  ageGroups: ['5–7', '8–10', '11–13'],
  description: 'Spot the nouns! Identify common, proper, abstract and collective nouns.',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
