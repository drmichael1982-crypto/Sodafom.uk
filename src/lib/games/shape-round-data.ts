import { nextRound, shuffle } from './ten-question-round';
import { numberOptions } from './maths-round-data';
const SHAPES_BASIC = [
  { name: 'Circle', emoji: '⭕', sides: 0, type: '2D', vertices: 0, faces: 1 },
  { name: 'Triangle', emoji: '🔺', sides: 3, type: '2D', vertices: 3, faces: 1 },
  { name: 'Square', emoji: '🟥', sides: 4, type: '2D', vertices: 4, faces: 1 },
  { name: 'Rectangle', emoji: '▬', sides: 4, type: '2D', vertices: 4, faces: 1 },
];

const SHAPES_ALL = [
  ...SHAPES_BASIC,
  { name: 'Pentagon', emoji: '⬠', sides: 5, type: '2D', vertices: 5, faces: 1 },
  { name: 'Hexagon', emoji: '⬡', sides: 6, type: '2D', vertices: 6, faces: 1 },
  { name: 'Cube', emoji: '🎲', sides: 12, type: '3D', vertices: 8, faces: 6 },
  { name: 'Sphere', emoji: '🔵', sides: 0, type: '3D', vertices: 0, faces: 0 },
  { name: 'Cylinder', emoji: '🥫', sides: 0, type: '3D', vertices: 0, faces: 2 },
  { name: 'Cone', emoji: '🍦', sides: 0, type: '3D', vertices: 1, faces: 1 },
  { name: 'Square-based pyramid', emoji: '🔺', sides: 8, type: '3D', vertices: 5, faces: 5 },
];


export function shapeBank(tier: 1 | 2 | 3) {
  const pool = tier === 1 ? SHAPES_BASIC : SHAPES_ALL;
  return pool.flatMap(shape => {
    const questions = [{shape, question: `Is a ${shape.name.toLowerCase()} 2D or 3D?`, answer: shape.type, options: shuffle(['2D', '3D'])}];
    if (shape.type === '2D') {
      questions.push({shape, question: 'What shape is this?', answer: shape.name, options: shuffle([shape.name, ...shuffle(pool.filter(s => s.type === '2D' && s.name !== shape.name)).slice(0, 3).map(s => s.name)])});
      questions.push({shape, question: `How many straight sides does a ${shape.name.toLowerCase()} have?`, answer: String(shape.sides), options: numberOptions(shape.sides).map(String)});
    }
    if (tier === 3 || shape.type === '2D') questions.push({shape, question: `How many vertices (corners) does a ${shape.name.toLowerCase()} have?`, answer: String(shape.vertices), options: numberOptions(shape.vertices).map(String)});
    if (tier === 3 && shape.type === '3D') questions.push({shape, question: `How many flat faces does a ${shape.name.toLowerCase()} have?`, answer: String(shape.faces), options: numberOptions(shape.faces).map(String)});
    return questions;
  });
}
export function shapeRound(tier: 1 | 2 | 3) {
  return nextRound(shapeBank(tier), q => `${q.shape.name}|${q.question}`, `shapes-${tier}`);
}
