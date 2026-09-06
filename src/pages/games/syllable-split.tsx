import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'How many syllables in "cat"?', options: ['1','2','3','4'], answer: '1' },
  { question: 'How many syllables in "happy"?', options: ['2','1','3','4'], answer: '2' },
  { question: 'How many syllables in "elephant"?', options: ['3','1','2','4'], answer: '3' },
  { question: 'How many syllables in "dog"?', options: ['1','2','3','4'], answer: '1' },
  { question: 'How many syllables in "butter"?', options: ['2','1','3','4'], answer: '2' },
  { question: 'How many syllables in "banana"?', options: ['3','1','2','4'], answer: '3' },
  { question: 'How many syllables in "sun"?', options: ['1','2','3','4'], answer: '1' },
  { question: 'How many syllables in "garden"?', options: ['2','1','3','4'], answer: '2' },
  { question: 'How many syllables in "computer"?', options: ['3','1','2','4'], answer: '3' },
  { question: 'How many syllables in "run"?', options: ['1','2','3','4'], answer: '1' },
  { question: 'How many syllables in "window"?', options: ['2','1','3','4'], answer: '2' },
  { question: 'How many syllables in "umbrella"?', options: ['3','1','2','4'], answer: '3' },
];
const L2: QuizQuestion[] = [
  { question: 'How many syllables in "information"?', options: ['4','3','5','2'], answer: '4' },
  { question: 'How many syllables in "education"?', options: ['4','3','5','2'], answer: '4' },
  { question: 'How many syllables in "celebration"?', options: ['4','3','5','2'], answer: '4' },
  { question: 'How many syllables in "communication"?', options: ['5','4','6','3'], answer: '5' },
  { question: 'How many syllables in "understanding"?', options: ['4','3','5','2'], answer: '4' },
  { question: 'How many syllables in "imagination"?', options: ['5','4','6','3'], answer: '5' },
  { question: 'How many syllables in "responsibility"?', options: ['6','5','7','4'], answer: '6' },
  { question: 'How many syllables in "extraordinary"?', options: ['6','5','7','4'], answer: '6' },
  { question: 'How many syllables in "approximately"?', options: ['5','4','6','3'], answer: '5' },
  { question: 'How many syllables in "unfortunately"?', options: ['5','4','6','3'], answer: '5' },
  { question: 'How many syllables in "international"?', options: ['5','4','6','3'], answer: '5' },
  { question: 'How many syllables in "environmental"?', options: ['5','4','6','3'], answer: '5' },
];
const L3: QuizQuestion[] = [
  { question: 'Where is the stress in "photograph"?', options: ['PHO-to-graph','pho-TO-graph','pho-to-GRAPH','equal stress'], answer: 'PHO-to-graph' },
  { question: 'Where is the stress in "photography"?', options: ['pho-TOG-ra-phy','PHO-tog-ra-phy','pho-tog-RA-phy','pho-tog-ra-PHY'], answer: 'pho-TOG-ra-phy' },
  { question: 'Where is the stress in "photographic"?', options: ['pho-to-GRAPH-ic','PHO-to-graph-ic','pho-TO-graph-ic','pho-to-graph-IC'], answer: 'pho-to-GRAPH-ic' },
  { question: 'Where is the stress in "record" (noun)?', options: ['REC-ord','rec-ORD','RE-cord','rec-ord'], answer: 'REC-ord' },
  { question: 'Where is the stress in "record" (verb)?', options: ['rec-ORD','REC-ord','RE-cord','rec-ord'], answer: 'rec-ORD' },
  { question: 'Where is the stress in "present" (noun)?', options: ['PRE-sent','pre-SENT','PRES-ent','pres-ENT'], answer: 'PRE-sent' },
  { question: 'Where is the stress in "present" (verb)?', options: ['pre-SENT','PRE-sent','PRES-ent','pres-ENT'], answer: 'pre-SENT' },
  { question: 'Where is the stress in "permit" (noun)?', options: ['PER-mit','per-MIT','PERM-it','perm-IT'], answer: 'PER-mit' },
  { question: 'Where is the stress in "permit" (verb)?', options: ['per-MIT','PER-mit','PERM-it','perm-IT'], answer: 'per-MIT' },
  { question: 'Where is the stress in "conflict" (noun)?', options: ['CON-flict','con-FLICT','CONF-lict','conf-LICT'], answer: 'CON-flict' },
  { question: 'Where is the stress in "conflict" (verb)?', options: ['con-FLICT','CON-flict','CONF-lict','conf-LICT'], answer: 'con-FLICT' },
  { question: 'Where is the stress in "object" (noun)?', options: ['OB-ject','ob-JECT','OBJ-ect','obj-ECT'], answer: 'OB-ject' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'syllable-split',
  title: 'Syllable Split',
  emoji: '✂️',
  subject: 'spelling',
  ageGroups: ['5–7', '8–10'],
  description: 'Count and split syllables to improve your reading and spelling skills!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
