import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which two words make "sunshine"?', options: ['sun + shine','sun + fine','son + shine','sun + shone'], answer: 'sun + shine' },
  { question: 'Which two words make "football"?', options: ['foot + ball','food + ball','foot + bell','for + ball'], answer: 'foot + ball' },
  { question: 'Which two words make "bedroom"?', options: ['bed + room','bad + room','bed + roam','bid + room'], answer: 'bed + room' },
  { question: 'Which two words make "rainbow"?', options: ['rain + bow','rain + row','ran + bow','rein + bow'], answer: 'rain + bow' },
  { question: 'Which two words make "toothbrush"?', options: ['tooth + brush','tooth + rush','too + brush','teeth + brush'], answer: 'tooth + brush' },
  { question: 'Which two words make "birthday"?', options: ['birth + day','bird + day','birth + way','birch + day'], answer: 'birth + day' },
  { question: 'Which two words make "playground"?', options: ['play + ground','play + round','play + found','plan + ground'], answer: 'play + ground' },
  { question: 'Which two words make "snowflake"?', options: ['snow + flake','snow + lake','slow + flake','snob + flake'], answer: 'snow + flake' },
  { question: 'Which two words make "butterfly"?', options: ['butter + fly','butter + fry','butt + fly','butter + lie'], answer: 'butter + fly' },
  { question: 'Which two words make "starfish"?', options: ['star + fish','star + dish','stare + fish','star + wish'], answer: 'star + fish' },
  { question: 'Which two words make "doorbell"?', options: ['door + bell','door + ball','doe + bell','door + bill'], answer: 'door + bell' },
  { question: 'Which two words make "bookshelf"?', options: ['book + shelf','book + self','look + shelf','book + shell'], answer: 'book + shelf' },
];
const L2: QuizQuestion[] = [
  { question: 'What compound word means "a place to park cars"?', options: ['carpark','carspace','autopark','vehiclepark'], answer: 'carpark' },
  { question: 'What compound word means "a brush for your hair"?', options: ['hairbrush','hairbroom','headbrush','hairsweep'], answer: 'hairbrush' },
  { question: 'What compound word means "a bag for your back"?', options: ['backpack','backbag','rucksack','shoulderbag'], answer: 'backpack' },
  { question: 'What compound word means "a cloth for washing dishes"?', options: ['dishcloth','dishrag','platerag','washcloth'], answer: 'dishcloth' },
  { question: 'What compound word means "a light from the sun"?', options: ['sunlight','daylight','sunbeam','sunshine'], answer: 'sunlight' },
  { question: 'What compound word means "a storm with thunder"?', options: ['thunderstorm','rainstorm','lightstorm','cloudstorm'], answer: 'thunderstorm' },
  { question: 'What compound word means "a board for surfing"?', options: ['surfboard','waveboard','seaboard','rideboard'], answer: 'surfboard' },
  { question: 'What compound word means "a fall of water"?', options: ['waterfall','waterfall','raindrop','streamfall'], answer: 'waterfall' },
  { question: 'What compound word means "a bow made of fire"?', options: ['firebow','firework','flamebow','heatbow'], answer: 'firework' },
  { question: 'What compound word means "a side of the road"?', options: ['roadside','roadedge','streetside','pathside'], answer: 'roadside' },
  { question: 'What compound word means "a bird that is black"?', options: ['blackbird','darkbird','nightbird','coalbird'], answer: 'blackbird' },
  { question: 'What compound word means "a house for a dog"?', options: ['doghouse','dogden','pethouse','houndhouse'], answer: 'doghouse' },
];
const L3: QuizQuestion[] = [
  { question: 'Which is a closed compound word?', options: ['notebook','note book','note-book','noted book'], answer: 'notebook' },
  { question: 'Which is a hyphenated compound word?', options: ['well-known','wellknown','well known','known well'], answer: 'well-known' },
  { question: 'Which is an open compound word?', options: ['post office','postoffice','post-office','postaloffice'], answer: 'post office' },
  { question: 'Which compound word means "a person who guards a door"?', options: ['doorkeeper','doorman','gatekeeper','doorguard'], answer: 'doorkeeper' },
  { question: 'Which compound word means "a light that is a flash"?', options: ['flashlight','flashlamp','quicklight','speedlight'], answer: 'flashlight' },
  { question: 'Which compound word means "a stone that is precious"?', options: ['gemstone','preciousstone','valuestone','rarestone'], answer: 'gemstone' },
  { question: 'Which compound word means "a work done by hand"?', options: ['handwork','handcraft','manualwork','fingerwork'], answer: 'handwork' },
  { question: 'Which compound word means "a book of notes"?', options: ['notebook','notebook','notesbook','writingbook'], answer: 'notebook' },
  { question: 'Which compound word means "a fall of snow"?', options: ['snowfall','snowdrop','icedrop','frostfall'], answer: 'snowfall' },
  { question: 'Which compound word means "a man made of straw"?', options: ['scarecrow','strawman','fieldman','cornman'], answer: 'scarecrow' },
  { question: 'Which compound word means "a bow that is long"?', options: ['longbow','longbow','arrowbow','tallbow'], answer: 'longbow' },
  { question: 'Which compound word means "a house for a fire"?', options: ['firehouse','firehouse','flamehouse','heathouse'], answer: 'firehouse' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'compound-words',
  title: 'Compound Words',
  emoji: '🔗',
  subject: 'spelling',
  ageGroups: ['7–9', '10–11'],
  description: 'Join two words together to make compound words. A fun spelling challenge!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
