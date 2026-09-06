import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word has the short "a" sound?', options: ['cake','kite','cat','cube'], answer: 'cat' },
  { question: 'Which word has the short "e" sound?', options: ['bee','kite','cake','bed'], answer: 'bed' },
  { question: 'Which word has the short "i" sound?', options: ['kite','bike','bit','bite'], answer: 'bit' },
  { question: 'Which word has the short "o" sound?', options: ['bone','boat','bob','bowl'], answer: 'bob' },
  { question: 'Which word has the short "u" sound?', options: ['cube','cute','cup','mule'], answer: 'cup' },
  { question: 'Which word has the long "a" sound?', options: ['cat','cap','can','cake'], answer: 'cake' },
  { question: 'Which word has the long "e" sound?', options: ['bed','bet','beg','bee'], answer: 'bee' },
  { question: 'Which word has the long "i" sound?', options: ['bit','bin','bike','big'], answer: 'bike' },
  { question: 'Which word has the long "o" sound?', options: ['bob','box','bone','bog'], answer: 'bone' },
  { question: 'Which word has the long "u" sound?', options: ['cup','cut','cube','cub'], answer: 'cube' },
  { question: 'How many vowels are in the alphabet?', options: ['4','5','6','7'], answer: '5' },
  { question: 'Which letters are vowels?', options: ['a, b, c, d, e','a, e, i, o, u','b, c, d, f, g','a, e, i, o, y'], answer: 'a, e, i, o, u' },
];
const L2: QuizQuestion[] = [
  { question: 'Which word has the "oo" sound (as in moon)?', options: ['book','boot','brook','bull'], answer: 'boot' },
  { question: 'Which word has the "ou" sound (as in out)?', options: ['could','cloud','cold','cord'], answer: 'cloud' },
  { question: 'Which word has the "oi" sound?', options: ['oil','old','owl','owe'], answer: 'oil' },
  { question: 'Which word has the "er" sound?', options: ['bird','bad','bed','bid'], answer: 'bird' },
  { question: 'Which word has the "air" sound?', options: ['ear','are','air','ore'], answer: 'air' },
  { question: 'Which word has the "aw" sound?', options: ['saw','sow','sew','sue'], answer: 'saw' },
  { question: 'Which word has the "ure" sound?', options: ['cure','core','care','car'], answer: 'cure' },
  { question: 'Which word has the "oo" sound (as in book)?', options: ['boot','moon','food','book'], answer: 'book' },
  { question: 'Which word has the "ear" sound?', options: ['air','are','ear','ore'], answer: 'ear' },
  { question: 'Which word has the "or" sound?', options: ['car','her','for','fur'], answer: 'for' },
  { question: 'Which word has the "ar" sound?', options: ['her','for','car','fur'], answer: 'car' },
  { question: 'Which word has the "ur" sound?', options: ['car','for','her','air'], answer: 'her' },
];
const L3: QuizQuestion[] = [
  { question: 'What is a diphthong?', options: ['A single vowel sound','A vowel sound that glides from one position to another','A consonant sound','A silent letter'], answer: 'A vowel sound that glides from one position to another' },
  { question: 'Which word contains a diphthong?', options: ['bit','bed','boy','bus'], answer: 'boy' },
  { question: 'What is a schwa?', options: ['A long vowel sound','The unstressed "uh" sound in many English words','A short vowel sound','A diphthong'], answer: 'The unstressed "uh" sound in many English words' },
  { question: 'Which syllable contains the schwa in "about"?', options: ['a-','both','neither','-bout'], answer: 'a-' },
  { question: 'What is a vowel digraph?', options: ['Two vowels that make one sound','Two consonants that make one sound','A silent vowel','A long vowel'], answer: 'Two vowels that make one sound' },
  { question: 'Which word contains a vowel digraph?', options: ['cat','bit','rain','cup'], answer: 'rain' },
  { question: 'What does "silent e" do in a word like "cake"?', options: ['Makes the "e" sound','Makes the "a" long','Makes the "c" soft','Has no effect'], answer: 'Makes the "a" long' },
  { question: 'What is the vowel sound in "caught"?', options: ['short "a"','long "a"','aw sound','short "o"'], answer: 'aw sound' },
  { question: 'Which word has the same vowel sound as "eight"?', options: ['eat','it','ate','out'], answer: 'ate' },
  { question: 'Which word has the same vowel sound as "through"?', options: ['though','thought','threw','thorough'], answer: 'threw' },
  { question: 'What is the vowel sound in "myth"?', options: ['short "a"','short "e"','short "i"','short "o"'], answer: 'short "i"' },
  { question: 'Which word has the same vowel sound as "bear"?', options: ['beer','bar','bare','bore'], answer: 'bare' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'vowel-sounds',
  title: 'Vowel Sounds',
  emoji: '🗣️',
  subject: 'spelling',
  ageGroups: ['4–6', '5–7', '8–10'],
  description: 'Identify long and short vowel sounds in words. Master all the vowel patterns!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
