import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word is a verb?', options: ['happy','table','run','quickly'], answer: 'run' },
  { question: 'Which word is a verb?', options: ['beautiful','sunshine','think','slowly'], answer: 'think' },
  { question: 'Which word is a verb?', options: ['blue','dog','jump','fast'], answer: 'jump' },
  { question: 'Which word is a verb?', options: ['tall','book','eat','quietly'], answer: 'eat' },
  { question: 'What is the past tense of "go"?', options: ['goed','gone','went','goes'], answer: 'went' },
  { question: 'What is the past tense of "eat"?', options: ['eated','eaten','ate','eats'], answer: 'ate' },
  { question: 'What is the past tense of "run"?', options: ['runned','run','ran','runs'], answer: 'ran' },
  { question: 'What is the past tense of "see"?', options: ['seed','seen','saw','sees'], answer: 'saw' },
  { question: 'What is the past tense of "have"?', options: ['haved','has','had','have'], answer: 'had' },
  { question: 'What is the past tense of "come"?', options: ['comed','come','came','comes'], answer: 'came' },
  { question: 'Which sentence uses the correct verb form?', options: ['She runned fast.','She runs fast.','She run fast.','She running fast.'], answer: 'She runs fast.' },
  { question: 'Which sentence uses the correct verb form?', options: ['They was happy.','They is happy.','They were happy.','They be happy.'], answer: 'They were happy.' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the past tense of "swim"?', options: ['swimmed','swam','swum','swims'], answer: 'swam' },
  { question: 'What is the present participle of "write"?', options: ['wrote','written','writing','writes'], answer: 'writing' },
  { question: 'Which word is a modal verb?', options: ['run','happy','could','quickly'], answer: 'could' },
  { question: 'What is the past tense of "bring"?', options: ['bringed','brung','brought','brings'], answer: 'brought' },
  { question: 'Which sentence is in the passive voice?', options: ['The cat chased the mouse.','The mouse was chased by the cat.','The cat is chasing the mouse.','The cat will chase the mouse.'], answer: 'The mouse was chased by the cat.' },
  { question: 'What is the infinitive form of "running"?', options: ['ran','run','runs','runned'], answer: 'run' },
  { question: 'Which word is a linking verb?', options: ['run','jump','is','eat'], answer: 'is' },
  { question: 'What is the past tense of "fly"?', options: ['flied','flown','flew','flies'], answer: 'flew' },
  { question: 'What is the past tense of "break"?', options: ['breaked','broken','broke','breaks'], answer: 'broke' },
  { question: 'What is the past tense of "choose"?', options: ['choosed','chosen','chose','chooses'], answer: 'chose' },
  { question: 'What is the past tense of "speak"?', options: ['speaked','spoken','spoke','speaks'], answer: 'spoke' },
  { question: 'What is the past tense of "write"?', options: ['writed','written','wrote','writes'], answer: 'wrote' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the subjunctive form of "be" in "I suggest that he ___ present"?', options: ['is','was','be','being'], answer: 'be' },
  { question: 'What is the past perfect tense of "go"?', options: ['went','had gone','has gone','have gone'], answer: 'had gone' },
  { question: 'What is the future perfect tense of "finish"?', options: ['will finish','finished','will have finished','has finished'], answer: 'will have finished' },
  { question: 'What is the present perfect tense of "eat"?', options: ['ate','had eaten','has eaten','will eat'], answer: 'has eaten' },
  { question: 'What is the past continuous tense of "run"?', options: ['ran','was running','has run','will run'], answer: 'was running' },
  { question: 'What is the present continuous tense of "write"?', options: ['wrote','has written','is writing','will write'], answer: 'is writing' },
  { question: 'What is a transitive verb?', options: ['A verb that does not need an object','A verb that needs an object','A linking verb','A modal verb'], answer: 'A verb that needs an object' },
  { question: 'What is an intransitive verb?', options: ['A verb that needs an object','A verb that does not need an object','A linking verb','A modal verb'], answer: 'A verb that does not need an object' },
  { question: 'What is the conditional tense of "go"?', options: ['went','will go','would go','has gone'], answer: 'would go' },
  { question: 'What is the past perfect continuous tense of "work"?', options: ['worked','had been working','was working','has worked'], answer: 'had been working' },
  { question: 'What is the future continuous tense of "study"?', options: ['studied','will study','will be studying','has studied'], answer: 'will be studying' },
  { question: 'What is the present perfect continuous tense of "live"?', options: ['lived','has lived','has been living','will live'], answer: 'has been living' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'verb-volcano',
  title: 'Verb Volcano',
  emoji: '🌋',
  subject: 'reading',
  ageGroups: ['5–7', '8–10', '11–13'],
  description: 'Erupt with verbs! Identify action words and practise verb tenses.',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
