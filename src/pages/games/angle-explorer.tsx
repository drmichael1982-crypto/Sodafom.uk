import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'How many degrees in a right angle?', options: ['90°','45°','180°','360°'], answer: '90°' },
  { question: 'How many degrees in a straight line?', options: ['180°','90°','270°','360°'], answer: '180°' },
  { question: 'How many degrees in a full turn?', options: ['360°','180°','90°','270°'], answer: '360°' },
  { question: 'An angle less than 90° is called…', options: ['acute','obtuse','right','reflex'], answer: 'acute' },
  { question: 'An angle greater than 90° but less than 180° is called…', options: ['obtuse','acute','right','reflex'], answer: 'obtuse' },
  { question: 'An angle greater than 180° is called…', options: ['reflex','obtuse','acute','right'], answer: 'reflex' },
  { question: 'What type of angle is 45°?', options: ['acute','obtuse','right','reflex'], answer: 'acute' },
  { question: 'What type of angle is 120°?', options: ['obtuse','acute','right','reflex'], answer: 'obtuse' },
  { question: 'What type of angle is 90°?', options: ['right','acute','obtuse','reflex'], answer: 'right' },
  { question: 'What type of angle is 200°?', options: ['reflex','obtuse','acute','right'], answer: 'reflex' },
  { question: 'What type of angle is 30°?', options: ['acute','obtuse','right','reflex'], answer: 'acute' },
  { question: 'What type of angle is 150°?', options: ['obtuse','acute','right','reflex'], answer: 'obtuse' },
];
const L2: QuizQuestion[] = [
  { question: 'Angles on a straight line add up to…', options: ['180°','90°','270°','360°'], answer: '180°' },
  { question: 'Angles around a point add up to…', options: ['360°','180°','90°','270°'], answer: '360°' },
  { question: 'If one angle is 70°, what is the other angle on a straight line?', options: ['110°','70°','90°','180°'], answer: '110°' },
  { question: 'If one angle is 120°, what is the other angle on a straight line?', options: ['60°','120°','90°','180°'], answer: '60°' },
  { question: 'Vertically opposite angles are…', options: ['equal','supplementary','complementary','adjacent'], answer: 'equal' },
  { question: 'Two angles that add up to 90° are called…', options: ['complementary','supplementary','vertically opposite','adjacent'], answer: 'complementary' },
  { question: 'Two angles that add up to 180° are called…', options: ['supplementary','complementary','vertically opposite','adjacent'], answer: 'supplementary' },
  { question: 'What is the missing angle? 40° + ? = 90°', options: ['50°','40°','60°','70°'], answer: '50°' },
  { question: 'What is the missing angle? 65° + ? = 180°', options: ['115°','65°','90°','125°'], answer: '115°' },
  { question: 'What is the missing angle? 130° + ? = 360°', options: ['230°','130°','180°','220°'], answer: '230°' },
  { question: 'What is the missing angle? 55° + ? = 90°', options: ['35°','55°','45°','25°'], answer: '35°' },
  { question: 'What is the missing angle? 75° + ? = 180°', options: ['105°','75°','90°','115°'], answer: '105°' },
];
const L3: QuizQuestion[] = [
  { question: 'Angles in a triangle add up to…', options: ['180°','90°','270°','360°'], answer: '180°' },
  { question: 'Angles in a quadrilateral add up to…', options: ['360°','180°','270°','540°'], answer: '360°' },
  { question: 'In an equilateral triangle, each angle is…', options: ['60°','45°','90°','120°'], answer: '60°' },
  { question: 'In a right-angled triangle, the other two angles add up to…', options: ['90°','180°','270°','360°'], answer: '90°' },
  { question: 'What is the missing angle in a triangle with angles 60° and 70°?', options: ['50°','60°','70°','80°'], answer: '50°' },
  { question: 'What is the missing angle in a triangle with angles 45° and 90°?', options: ['45°','55°','35°','65°'], answer: '45°' },
  { question: 'What is the missing angle in a quadrilateral with angles 90°, 90°, and 80°?', options: ['100°','90°','110°','80°'], answer: '100°' },
  { question: 'An isosceles triangle has two angles of 70°. What is the third?', options: ['40°','70°','50°','60°'], answer: '40°' },
  { question: 'What is the exterior angle of a regular hexagon?', options: ['60°','45°','90°','120°'], answer: '60°' },
  { question: 'What is the interior angle of a regular hexagon?', options: ['120°','60°','90°','150°'], answer: '120°' },
  { question: 'What is the sum of interior angles of a pentagon?', options: ['540°','360°','720°','480°'], answer: '540°' },
  { question: 'What is the interior angle of a regular octagon?', options: ['135°','120°','150°','90°'], answer: '135°' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'angle-explorer',
  title: 'Angle Explorer',
  emoji: '📐',
  subject: 'maths',
  ageGroups: ['9–11', '12–13'],
  description: 'Explore angles — acute, obtuse, reflex and more. Geometry made fun!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
