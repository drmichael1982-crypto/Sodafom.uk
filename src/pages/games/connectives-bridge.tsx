import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Choose the best connective: "I like cats ___ dogs."', options: ['because','although','and','however'], answer: 'and' },
  { question: 'Choose the best connective: "I was cold ___ I put on my coat."', options: ['although','however','so','but'], answer: 'so' },
  { question: 'Choose the best connective: "She was tired ___ she went to bed."', options: ['although','however','so','but'], answer: 'so' },
  { question: 'Choose the best connective: "I like pizza ___ I don\'t like pasta."', options: ['and','so','but','because'], answer: 'but' },
  { question: 'Choose the best connective: "I was hungry ___ I ate my lunch."', options: ['although','however','so','but'], answer: 'so' },
  { question: 'Choose the best connective: "She ran fast ___ she missed the bus."', options: ['and','so','but','because'], answer: 'but' },
  { question: 'Choose the best connective: "He was happy ___ he got a present."', options: ['although','however','because','but'], answer: 'because' },
  { question: 'Choose the best connective: "I like swimming ___ I like running."', options: ['but','however','and','so'], answer: 'and' },
  { question: 'Choose the best connective: "She was late ___ she ran to school."', options: ['although','however','so','and'], answer: 'so' },
  { question: 'Choose the best connective: "I wanted to go out ___ it was raining."', options: ['and','so','but','because'], answer: 'but' },
  { question: 'Which connective shows a reason?', options: ['however','although','because','furthermore'], answer: 'because' },
  { question: 'Which connective shows contrast?', options: ['because','therefore','however','so'], answer: 'however' },
];
const L2: QuizQuestion[] = [
  { question: 'Choose the best connective: "I was tired ___ I went to bed."', options: ['because','although','however','therefore'], answer: 'therefore' },
  { question: 'Choose the best connective: "___ it was raining, we went out."', options: ['Because','Although','Therefore','So'], answer: 'Although' },
  { question: 'Choose the best connective: "I like cats ___ I prefer dogs."', options: ['and','because','however','so'], answer: 'however' },
  { question: 'Choose the best connective: "She studied hard ___ she passed the test."', options: ['although','however','so','but'], answer: 'so' },
  { question: 'Which connective adds more information?', options: ['however','although','furthermore','therefore'], answer: 'furthermore' },
  { question: 'Which connective shows a result?', options: ['although','however','because','therefore'], answer: 'therefore' },
  { question: 'Choose the best connective: "First, ___ next, ___ finally" — what type are these?', options: ['Causal connectives','Time connectives','Contrast connectives','Adding connectives'], answer: 'Time connectives' },
  { question: 'Choose the best connective: "She was cold ___ she put on her coat."', options: ['although','however','so','furthermore'], answer: 'so' },
  { question: 'Which connective introduces an example?', options: ['however','therefore','for example','furthermore'], answer: 'for example' },
  { question: 'Which connective shows a concession?', options: ['because','therefore','admittedly','so'], answer: 'admittedly' },
  { question: 'Choose the best connective: "The weather was bad; ___, we still went out."', options: ['because','so','nevertheless','and'], answer: 'nevertheless' },
  { question: 'Which connective means "as a result"?', options: ['however','although','consequently','furthermore'], answer: 'consequently' },
];
const L3: QuizQuestion[] = [
  { question: 'Which connective is most formal?', options: ['but','however','yet','still'], answer: 'however' },
  { question: 'Which connective introduces a contrasting point in an essay?', options: ['and','so','on the other hand','because'], answer: 'on the other hand' },
  { question: 'Which connective means "in spite of this"?', options: ['therefore','consequently','nevertheless','furthermore'], answer: 'nevertheless' },
  { question: 'Which connective is used to summarise?', options: ['however','furthermore','in conclusion','for example'], answer: 'in conclusion' },
  { question: 'Which connective means "as well as this"?', options: ['however','moreover','therefore','although'], answer: 'moreover' },
  { question: 'Which connective introduces a condition?', options: ['because','therefore','provided that','however'], answer: 'provided that' },
  { question: 'Which connective means "at the same time"?', options: ['therefore','meanwhile','consequently','furthermore'], answer: 'meanwhile' },
  { question: 'Which connective is used to add a qualification?', options: ['however','therefore','that said','furthermore'], answer: 'that said' },
  { question: 'Which connective means "to put it another way"?', options: ['however','in other words','therefore','furthermore'], answer: 'in other words' },
  { question: 'Which connective introduces a reason in formal writing?', options: ['because','so','owing to','but'], answer: 'owing to' },
  { question: 'Which connective means "despite this"?', options: ['therefore','consequently','notwithstanding','furthermore'], answer: 'notwithstanding' },
  { question: 'Which connective is used to show a sequence in formal writing?', options: ['and then','next','subsequently','after'], answer: 'subsequently' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'connectives-bridge',
  title: 'Connectives Bridge',
  emoji: '🌉',
  subject: 'reading',
  ageGroups: ['8–10', '11–13'],
  description: 'Choose the right connective to join sentences. Build bridges between your ideas!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
