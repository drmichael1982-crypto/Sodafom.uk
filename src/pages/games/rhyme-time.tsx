import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word rhymes with "cat"?', options: ['bat','cup','dog','sun'], answer: 'bat' },
  { question: 'Which word rhymes with "dog"?', options: ['log','cat','hat','sun'], answer: 'log' },
  { question: 'Which word rhymes with "sun"?', options: ['fun','cat','dog','hat'], answer: 'fun' },
  { question: 'Which word rhymes with "hat"?', options: ['mat','dog','sun','cup'], answer: 'mat' },
  { question: 'Which word rhymes with "big"?', options: ['pig','cat','dog','sun'], answer: 'pig' },
  { question: 'Which word rhymes with "hop"?', options: ['top','cat','dog','sun'], answer: 'top' },
  { question: 'Which word rhymes with "red"?', options: ['bed','cat','dog','sun'], answer: 'bed' },
  { question: 'Which word rhymes with "pin"?', options: ['tin','cat','dog','sun'], answer: 'tin' },
  { question: 'Which word rhymes with "cup"?', options: ['pup','cat','dog','sun'], answer: 'pup' },
  { question: 'Which word rhymes with "wet"?', options: ['net','cat','dog','sun'], answer: 'net' },
  { question: 'Which word rhymes with "hot"?', options: ['pot','cat','dog','sun'], answer: 'pot' },
  { question: 'Which word rhymes with "bug"?', options: ['mug','cat','dog','sun'], answer: 'mug' },
];
const L2: QuizQuestion[] = [
  { question: 'Which word rhymes with "night"?', options: ['light','nit','neat','note'], answer: 'light' },
  { question: 'Which word rhymes with "rain"?', options: ['train','ran','ruin','rein'], answer: 'train' },
  { question: 'Which word rhymes with "boat"?', options: ['coat','bat','bit','but'], answer: 'coat' },
  { question: 'Which word rhymes with "feet"?', options: ['meet','fat','fit','fate'], answer: 'meet' },
  { question: 'Which word rhymes with "blue"?', options: ['clue','blot','blat','blet'], answer: 'clue' },
  { question: 'Which word rhymes with "cloud"?', options: ['loud','clod','clad','clued'], answer: 'loud' },
  { question: 'Which word rhymes with "boy"?', options: ['joy','bay','buy','bow'], answer: 'joy' },
  { question: 'Which word rhymes with "car"?', options: ['star','core','cure','care'], answer: 'star' },
  { question: 'Which word rhymes with "corn"?', options: ['horn','can','cone','coin'], answer: 'horn' },
  { question: 'Which word rhymes with "her"?', options: ['stir','here','hire','hare'], answer: 'stir' },
  { question: 'Which word rhymes with "care"?', options: ['share','car','core','cure'], answer: 'share' },
  { question: 'Which word rhymes with "near"?', options: ['fear','nor','nare','nore'], answer: 'fear' },
];
const L3: QuizQuestion[] = [
  { question: 'Which word rhymes with "mountain"?', options: ['fountain','moaning','mounting','counting'], answer: 'fountain' },
  { question: 'Which word rhymes with "treasure"?', options: ['measure','treason','treble','trestle'], answer: 'measure' },
  { question: 'Which word rhymes with "beautiful"?', options: ['dutiful','bootful','bootiful','beautify'], answer: 'dutiful' },
  { question: 'Which word rhymes with "laughter"?', options: ['after','lofter','laughter','laughing'], answer: 'after' },
  { question: 'Which word rhymes with "daughter"?', options: ['water','dotter','doughter','dautier'], answer: 'water' },
  { question: 'Which word rhymes with "thought"?', options: ['caught','taut','taught','all of these'], answer: 'all of these' },
  { question: 'Which word rhymes with "through"?', options: ['blue','threw','thru','throo'], answer: 'blue' },
  { question: 'Which word rhymes with "colonel"?', options: ['kernel','corneal','coronal','coronel'], answer: 'kernel' },
  { question: 'Which word rhymes with "choir"?', options: ['fire','quire','choir','hire'], answer: 'fire' },
  { question: 'Which word rhymes with "sword"?', options: ['lord','sward','soared','stored'], answer: 'lord' },
  { question: 'Which word rhymes with "subtle"?', options: ['shuttle','suttle','subtle','buttle'], answer: 'shuttle' },
  { question: 'Which word rhymes with "aisle"?', options: ['isle','aisled','aisling','aisler'], answer: 'isle' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'rhyme-time',
  title: 'Rhyme Time',
  emoji: '🎵',
  subject: 'spelling',
  ageGroups: ['4–6', '7–9'],
  description: 'Find the rhyming words and develop your ear for sounds and patterns!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
