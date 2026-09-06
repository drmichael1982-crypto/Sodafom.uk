import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'In coordinates (3, 5), which number is the x-axis value?', options: ['3','5','Both','Neither'], answer: '3' },
  { question: 'A point is at (0, 4). Where is it on the grid?', options: ['On the x-axis','On the y-axis','At the origin','In quadrant 1'], answer: 'On the y-axis' },
  { question: 'What are the coordinates of the origin?', options: ['(1,0)','(0,1)','(0,0)','(1,1)'], answer: '(0,0)' },
  { question: 'A point is at (2, 0). Where is it?', options: ['On the y-axis','On the x-axis','At the origin','In quadrant 1'], answer: 'On the x-axis' },
  { question: 'What are the coordinates of a point 3 right and 4 up from the origin?', options: ['(4,3)','(3,4)','(3,0)','(0,4)'], answer: '(3,4)' },
  { question: 'A point is at (5, 2). Which quadrant is it in?', options: ['Quadrant 1','Quadrant 2','Quadrant 3','Quadrant 4'], answer: 'Quadrant 1' },
  { question: 'What are the coordinates of a point 2 right and 3 up from (1,1)?', options: ['(2,3)','(3,4)','(3,2)','(2,4)'], answer: '(3,4)' },
  { question: 'A point moves 4 right from (0,3). New coordinates?', options: ['(4,3)','(3,4)','(0,7)','(4,0)'], answer: '(4,3)' },
  { question: 'A point moves 2 up from (3,1). New coordinates?', options: ['(3,3)','(5,1)','(3,2)','(1,3)'], answer: '(3,3)' },
  { question: 'What are the coordinates of a point 5 right and 0 up from the origin?', options: ['(0,5)','(5,5)','(5,0)','(0,0)'], answer: '(5,0)' },
  { question: 'A square has corners at (1,1), (3,1), (3,3) and (__,3). What is the missing x?', options: ['1','2','3','4'], answer: '1' },
  { question: 'What is the x-coordinate of the point (7, 2)?', options: ['2','7','9','5'], answer: '7' },
];
const L2: QuizQuestion[] = [
  { question: 'A point moves 3 right and 2 up from (1,1). New coordinates?', options: ['(3,2)','(4,3)','(4,2)','(3,3)'], answer: '(4,3)' },
  { question: 'In which quadrant is the point (-2, 3)?', options: ['Quadrant 1','Quadrant 2','Quadrant 3','Quadrant 4'], answer: 'Quadrant 2' },
  { question: 'In which quadrant is the point (4, -1)?', options: ['Quadrant 1','Quadrant 2','Quadrant 3','Quadrant 4'], answer: 'Quadrant 4' },
  { question: 'A square has corners at (0,0), (4,0), (4,4) and (__,4). What is the missing x?', options: ['0','2','4','8'], answer: '0' },
  { question: 'What is the midpoint of (2,4) and (6,8)?', options: ['(3,5)','(4,6)','(4,5)','(3,6)'], answer: '(4,6)' },
  { question: 'A point is reflected in the y-axis from (3,2). New coordinates?', options: ['(-3,2)','(3,-2)','(-3,-2)','(2,3)'], answer: '(-3,2)' },
  { question: 'What is the distance between (1,1) and (4,1)?', options: ['2','3','4','5'], answer: '3' },
  { question: 'In which quadrant is the point (-3, -4)?', options: ['Quadrant 1','Quadrant 2','Quadrant 3','Quadrant 4'], answer: 'Quadrant 3' },
  { question: 'A point is reflected in the x-axis from (2,5). New coordinates?', options: ['(-2,5)','(2,-5)','(-2,-5)','(5,2)'], answer: '(2,-5)' },
  { question: 'What is the midpoint of (0,0) and (8,6)?', options: ['(4,3)','(3,4)','(4,6)','(8,3)'], answer: '(4,3)' },
  { question: 'A point moves 3 left and 4 down from (5,6). New coordinates?', options: ['(2,2)','(8,2)','(2,10)','(8,10)'], answer: '(2,2)' },
  { question: 'What is the distance between (0,0) and (3,4)?', options: ['3','4','5','7'], answer: '5' },
];
const L3: QuizQuestion[] = [
  { question: 'A point is translated by vector (3,-2) from (1,4). New coordinates?', options: ['(4,2)','(2,6)','(-2,6)','(4,6)'], answer: '(4,2)' },
  { question: 'A point is rotated 90° clockwise about the origin from (2,3). New coordinates?', options: ['(3,-2)','(-3,2)','(-2,-3)','(3,2)'], answer: '(3,-2)' },
  { question: 'A point is rotated 180° about the origin from (4,1). New coordinates?', options: ['(-4,-1)','(4,-1)','(-4,1)','(1,4)'], answer: '(-4,-1)' },
  { question: 'What is the gradient of the line through (0,0) and (4,8)?', options: ['0.5','2','4','8'], answer: '2' },
  { question: 'What is the y-intercept of the line y = 3x + 5?', options: ['3','5','8','0'], answer: '5' },
  { question: 'A point is translated by vector (-2,3) from (5,1). New coordinates?', options: ['(3,4)','(7,-2)','(3,-2)','(7,4)'], answer: '(3,4)' },
  { question: 'What is the gradient of the line y = 4x - 7?', options: ['-7','4','7','-4'], answer: '4' },
  { question: 'A point is rotated 90° anticlockwise about the origin from (3,2). New coordinates?', options: ['(-2,3)','(2,-3)','(-3,-2)','(2,3)'], answer: '(-2,3)' },
  { question: 'What is the midpoint of (-4,2) and (6,-8)?', options: ['(1,-3)','(-1,3)','(1,3)','(-1,-3)'], answer: '(1,-3)' },
  { question: 'What is the equation of a line with gradient 2 passing through (0,3)?', options: ['y = 2x','y = 3x + 2','y = 2x + 3','y = 3x'], answer: 'y = 2x + 3' },
  { question: 'A point is reflected in the line y = x from (3,5). New coordinates?', options: ['(5,3)','(-3,-5)','(-5,-3)','(3,5)'], answer: '(5,3)' },
  { question: 'What is the distance between (-1,2) and (3,5)?', options: ['3','4','5','7'], answer: '5' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'coordinates-grid',
  title: 'Coordinates Grid',
  emoji: '🎯',
  subject: 'maths',
  ageGroups: ['8–10', '11–13'],
  description: 'Plot and read coordinates in all four quadrants. Find the treasure!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
