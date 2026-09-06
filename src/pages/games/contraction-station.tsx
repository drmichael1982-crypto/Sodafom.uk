import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the contraction of "do not"?', options: ["don't","dont","do'nt","d'ont"], answer: "don't" },
  { question: 'What is the contraction of "is not"?', options: ["isn't","isnt","is'nt","i'snt"], answer: "isn't" },
  { question: 'What is the contraction of "I am"?', options: ["I'm","Im","I'am","Iam"], answer: "I'm" },
  { question: 'What is the contraction of "you are"?', options: ["you're","youre","you'are","y'oure"], answer: "you're" },
  { question: 'What is the contraction of "he is"?', options: ["he's","hes","he'is","h'eis"], answer: "he's" },
  { question: 'What is the contraction of "she is"?', options: ["she's","shes","she'is","sh'eis"], answer: "she's" },
  { question: 'What is the contraction of "it is"?', options: ["it's","its","it'is","i'tis"], answer: "it's" },
  { question: 'What is the contraction of "we are"?', options: ["we're","were","we'are","w'eare"], answer: "we're" },
  { question: 'What is the contraction of "they are"?', options: ["they're","theyre","they'are","th'eyare"], answer: "they're" },
  { question: 'What is the contraction of "I will"?', options: ["I'll","Ill","I'will","Iwill"], answer: "I'll" },
  { question: 'What is the contraction of "cannot"?', options: ["can't","cant","can'not","c'ant"], answer: "can't" },
  { question: 'What is the contraction of "will not"?', options: ["won't","wont","will'nt","w'ont"], answer: "won't" },
];
const L2: QuizQuestion[] = [
  { question: 'What is the contraction of "would not"?', options: ["wouldn't","wouldnt","would'nt","w'ouldnt"], answer: "wouldn't" },
  { question: 'What is the contraction of "could not"?', options: ["couldn't","couldnt","could'nt","c'ouldnt"], answer: "couldn't" },
  { question: 'What is the contraction of "should not"?', options: ["shouldn't","shouldnt","should'nt","sh'ouldnt"], answer: "shouldn't" },
  { question: 'What is the contraction of "have not"?', options: ["haven't","havent","have'nt","h'avent"], answer: "haven't" },
  { question: 'What is the contraction of "has not"?', options: ["hasn't","hasnt","has'nt","h'asnt"], answer: "hasn't" },
  { question: 'What is the contraction of "had not"?', options: ["hadn't","hadnt","had'nt","h'adnt"], answer: "hadn't" },
  { question: 'What is the contraction of "I have"?', options: ["I've","Ive","I'have","Ihave"], answer: "I've" },
  { question: 'What is the contraction of "I had"?', options: ["I'd","Id","I'had","Ihad"], answer: "I'd" },
  { question: 'What is the contraction of "I would"?', options: ["I'd","Id","I'would","Iwould"], answer: "I'd" },
  { question: 'What is the contraction of "they will"?', options: ["they'll","theyll","they'will","th'eywill"], answer: "they'll" },
  { question: 'What is the contraction of "we have"?', options: ["we've","weve","we'have","w'ehave"], answer: "we've" },
  { question: 'What is the contraction of "you have"?', options: ["you've","youve","you'have","y'ouhave"], answer: "you've" },
];
const L3: QuizQuestion[] = [
  { question: '"Its" vs "it\'s" — which is correct: "___ raining"?', options: ["It's","Its","Its'","It is'"], answer: "It's" },
  { question: '"Its" vs "it\'s" — which is correct: "The dog wagged ___ tail"?', options: ['its',"it's","its'","it is'"], answer: 'its' },
  { question: '"Your" vs "you\'re" — which is correct: "___ welcome"?', options: ["You're","Your","Your'","You are'"], answer: "You're" },
  { question: '"Your" vs "you\'re" — which is correct: "___ book is here"?', options: ['Your',"You're","Your'","You are'"], answer: 'Your' },
  { question: '"Their" vs "they\'re" — which is correct: "___ going home"?', options: ["They're","Their","Their'","They are'"], answer: "They're" },
  { question: '"Their" vs "they\'re" — which is correct: "___ house is big"?', options: ['Their',"They're","Their'","They are'"], answer: 'Their' },
  { question: '"Whose" vs "who\'s" — which is correct: "___ coming?"?', options: ["Who's","Whose","Whose'","Who is'"], answer: "Who's" },
  { question: '"Whose" vs "who\'s" — which is correct: "___ bag is this?"?', options: ['Whose',"Who's","Whose'","Who is'"], answer: 'Whose' },
  { question: '"There" vs "they\'re" vs "their" — "Put it over ___"?', options: ['there',"they're",'their','ther'], answer: 'there' },
  { question: '"There" vs "they\'re" vs "their" — "___ all here"?', options: ["They're",'there','their','ther'], answer: "They're" },
  { question: '"There" vs "they\'re" vs "their" — "___ coats are wet"?', options: ['their',"they're",'there','ther'], answer: 'their' },
  { question: 'Which sentence uses a contraction correctly?', options: ["I can't go.","I ca'nt go.","I cant go.","I can not' go."], answer: "I can't go." },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'contraction-station',
  title: 'Contraction Station',
  emoji: '🚉',
  subject: 'spelling',
  ageGroups: ['6–8', '9–11'],
  description: 'Learn to shorten words with apostrophes — contractions made easy!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
