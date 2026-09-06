import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Match: "big" means…', options: ['large','small','fast','slow'], answer: 'large' },
  { question: 'Match: "happy" means…', options: ['joyful','sad','angry','tired'], answer: 'joyful' },
  { question: 'Match: "fast" means…', options: ['quick','slow','big','small'], answer: 'quick' },
  { question: 'Match: "cold" means…', options: ['chilly','hot','warm','cool'], answer: 'chilly' },
  { question: 'Match: "start" means…', options: ['begin','end','stop','finish'], answer: 'begin' },
  { question: 'Match: "small" means…', options: ['tiny','huge','big','large'], answer: 'tiny' },
  { question: 'Match: "angry" means…', options: ['furious','happy','sad','calm'], answer: 'furious' },
  { question: 'Match: "tired" means…', options: ['sleepy','awake','energetic','lively'], answer: 'sleepy' },
  { question: 'Match: "pretty" means…', options: ['beautiful','ugly','plain','dull'], answer: 'beautiful' },
  { question: 'Match: "brave" means…', options: ['courageous','scared','timid','shy'], answer: 'courageous' },
  { question: 'Match: "smart" means…', options: ['clever','stupid','dull','slow'], answer: 'clever' },
  { question: 'Match: "kind" means…', options: ['caring','cruel','mean','harsh'], answer: 'caring' },
];
const L2: QuizQuestion[] = [
  { question: 'Match: "ancient" means…', options: ['very old','very new','very big','very small'], answer: 'very old' },
  { question: 'Match: "enormous" means…', options: ['very large','very small','very fast','very slow'], answer: 'very large' },
  { question: 'Match: "furious" means…', options: ['very angry','very happy','very sad','very calm'], answer: 'very angry' },
  { question: 'Match: "exhausted" means…', options: ['very tired','very awake','very energetic','very lively'], answer: 'very tired' },
  { question: 'Match: "magnificent" means…', options: ['very beautiful','very ugly','very plain','very dull'], answer: 'very beautiful' },
  { question: 'Match: "terrified" means…', options: ['very scared','very brave','very calm','very bold'], answer: 'very scared' },
  { question: 'Match: "brilliant" means…', options: ['very clever','very stupid','very dull','very slow'], answer: 'very clever' },
  { question: 'Match: "generous" means…', options: ['very giving','very selfish','very mean','very harsh'], answer: 'very giving' },
  { question: 'Match: "peculiar" means…', options: ['very strange','very normal','very common','very usual'], answer: 'very strange' },
  { question: 'Match: "tranquil" means…', options: ['very peaceful','very noisy','very busy','very chaotic'], answer: 'very peaceful' },
  { question: 'Match: "vivid" means…', options: ['very bright','very dull','very dark','very faint'], answer: 'very bright' },
  { question: 'Match: "wretched" means…', options: ['very unhappy','very happy','very content','very pleased'], answer: 'very unhappy' },
];
const L3: QuizQuestion[] = [
  { question: 'Match: "benevolent" means…', options: ['kind and generous','cruel and mean','brave and bold','shy and quiet'], answer: 'kind and generous' },
  { question: 'Match: "melancholy" means…', options: ['deep sadness','great joy','fierce anger','mild surprise'], answer: 'deep sadness' },
  { question: 'Match: "eloquent" means…', options: ['speaking fluently','speaking quietly','speaking rudely','speaking rarely'], answer: 'speaking fluently' },
  { question: 'Match: "tenacious" means…', options: ['holding firmly to purpose','giving up easily','moving quickly','thinking deeply'], answer: 'holding firmly to purpose' },
  { question: 'Match: "ambiguous" means…', options: ['having more than one meaning','having no meaning','having a clear meaning','having a hidden meaning'], answer: 'having more than one meaning' },
  { question: 'Match: "diligent" means…', options: ['hardworking and careful','lazy and careless','quick and reckless','slow and thoughtful'], answer: 'hardworking and careful' },
  { question: 'Match: "frugal" means…', options: ['careful with money','generous with money','earning lots','spending lots'], answer: 'careful with money' },
  { question: 'Match: "gregarious" means…', options: ['enjoying company','preferring solitude','being very shy','being very loud'], answer: 'enjoying company' },
  { question: 'Match: "inquisitive" means…', options: ['curious and eager','bored and uninterested','happy and content','sad and withdrawn'], answer: 'curious and eager' },
  { question: 'Match: "lethargic" means…', options: ['lacking energy','full of energy','very angry','very happy'], answer: 'lacking energy' },
  { question: 'Match: "meticulous" means…', options: ['very careful and precise','very careless','very fast','very slow'], answer: 'very careful and precise' },
  { question: 'Match: "nonchalant" means…', options: ['calm and unconcerned','worried and anxious','happy and excited','sad and depressed'], answer: 'calm and unconcerned' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'word-match',
  title: 'Word Match',
  emoji: '🎯',
  subject: 'spelling',
  ageGroups: ['6–8', '9–11'],
  description: 'Match words to their meanings and build your vocabulary!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
