import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'How many lines of symmetry does a square have?', options: ['1','2','3','4'], answer: '4' },
  { question: 'How many lines of symmetry does a rectangle have?', options: ['1','2','3','4'], answer: '2' },
  { question: 'How many lines of symmetry does an equilateral triangle have?', options: ['1','2','3','4'], answer: '3' },
  { question: 'How many lines of symmetry does a circle have?', options: ['0','1','4','Infinite'], answer: 'Infinite' },
  { question: 'How many lines of symmetry does a regular hexagon have?', options: ['3','4','5','6'], answer: '6' },
  { question: 'Which letter has a vertical line of symmetry?', options: ['F','G','A','J'], answer: 'A' },
  { question: 'Which letter has a horizontal line of symmetry?', options: ['A','B','C','D'], answer: 'B' },
  { question: 'How many lines of symmetry does a regular pentagon have?', options: ['3','4','5','6'], answer: '5' },
  { question: 'Which shape has NO lines of symmetry?', options: ['Square','Circle','Scalene triangle','Equilateral triangle'], answer: 'Scalene triangle' },
  { question: 'How many lines of symmetry does an isosceles triangle have?', options: ['0','1','2','3'], answer: '1' },
  { question: 'How many lines of symmetry does a regular octagon have?', options: ['4','6','8','10'], answer: '8' },
  { question: 'A shape is reflected in a mirror line. The image is…', options: ['Larger','Smaller','The same size','Rotated'], answer: 'The same size' },
];
const L2: QuizQuestion[] = [
  { question: 'What is rotational symmetry?', options: ['When a shape looks the same after a reflection','When a shape looks the same after a rotation','When a shape has no symmetry','When a shape has only one line of symmetry'], answer: 'When a shape looks the same after a rotation' },
  { question: 'What is the order of rotational symmetry of a square?', options: ['1','2','3','4'], answer: '4' },
  { question: 'What is the order of rotational symmetry of an equilateral triangle?', options: ['1','2','3','4'], answer: '3' },
  { question: 'What is the order of rotational symmetry of a regular hexagon?', options: ['3','4','5','6'], answer: '6' },
  { question: 'What is the order of rotational symmetry of a rectangle?', options: ['1','2','3','4'], answer: '2' },
  { question: 'What is the order of rotational symmetry of a circle?', options: ['1','4','8','Infinite'], answer: 'Infinite' },
  { question: 'A shape has rotational symmetry of order 1. What does this mean?', options: ['It looks the same once during a full rotation','It looks the same twice during a full rotation','It has no rotational symmetry','It has infinite rotational symmetry'], answer: 'It has no rotational symmetry' },
  { question: 'What is the order of rotational symmetry of a regular pentagon?', options: ['3','4','5','6'], answer: '5' },
  { question: 'What is the order of rotational symmetry of a parallelogram?', options: ['1','2','3','4'], answer: '2' },
  { question: 'How many lines of symmetry does a parallelogram have?', options: ['0','1','2','4'], answer: '0' },
  { question: 'What is the order of rotational symmetry of a rhombus?', options: ['1','2','3','4'], answer: '2' },
  { question: 'How many lines of symmetry does a rhombus have?', options: ['0','1','2','4'], answer: '2' },
];
const L3: QuizQuestion[] = [
  { question: 'What is point symmetry?', options: ['A shape looks the same after a 180° rotation about a central point','A shape has a line of symmetry','A shape has rotational symmetry of order 4','A shape has no symmetry'], answer: 'A shape looks the same after a 180° rotation about a central point' },
  { question: 'How many lines of symmetry does a kite have?', options: ['0','1','2','4'], answer: '1' },
  { question: 'How many lines of symmetry does a trapezium have?', options: ['0','1','2','4'], answer: '0' },
  { question: 'How many lines of symmetry does an isosceles trapezium have?', options: ['0','1','2','4'], answer: '1' },
  { question: 'What is the order of rotational symmetry of a kite?', options: ['1','2','3','4'], answer: '1' },
  { question: 'What is the order of rotational symmetry of a regular decagon?', options: ['5','8','10','12'], answer: '10' },
  { question: 'How many lines of symmetry does a regular decagon have?', options: ['5','8','10','12'], answer: '10' },
  { question: 'What is the relationship between lines of symmetry and order of rotational symmetry for regular polygons?', options: ['They are always equal','Lines of symmetry is always double','Order of rotation is always double','They are unrelated'], answer: 'They are always equal' },
  { question: 'A shape has rotational symmetry of order 6. What is the angle of rotation?', options: ['30°','45°','60°','90°'], answer: '60°' },
  { question: 'What is the order of rotational symmetry of a regular 12-sided polygon?', options: ['6','8','10','12'], answer: '12' },
  { question: 'How many lines of symmetry does a regular 9-sided polygon have?', options: ['3','6','9','12'], answer: '9' },
  { question: 'What is the angle of rotational symmetry of a regular pentagon?', options: ['60°','72°','90°','120°'], answer: '72°' },
];
const L4: QuizQuestion[] = [
  { question: 'What is a line of symmetry in coordinate geometry?', options: ['A line that maps a shape onto itself by reflection','A line that bisects a shape','A line that passes through the centre','A line that is perpendicular to the x-axis'], answer: 'A line that maps a shape onto itself by reflection' },
  { question: 'What is the equation of the line of symmetry of y = x²?', options: ['x = 0','y = 0','x = 1','y = 1'], answer: 'x = 0' },
  { question: 'What is the equation of the line of symmetry of y = (x-3)² + 2?', options: ['x = 3','x = 2','x = -3','y = 2'], answer: 'x = 3' },
  { question: 'What is a plane of symmetry?', options: ['A flat surface that divides a 3D shape into two mirror images','A line of symmetry in 3D','A point of symmetry in 3D','A rotational axis in 3D'], answer: 'A flat surface that divides a 3D shape into two mirror images' },
  { question: 'How many planes of symmetry does a cube have?', options: ['3','6','9','12'], answer: '9' },
  { question: 'How many planes of symmetry does a sphere have?', options: ['1','6','12','Infinite'], answer: 'Infinite' },
  { question: 'What is rotational symmetry in 3D?', options: ['A shape looks the same after rotation about an axis','A shape looks the same after reflection','A shape looks the same after translation','A shape looks the same after enlargement'], answer: 'A shape looks the same after rotation about an axis' },
  { question: 'What is the axis of symmetry of a cone?', options: ['The line through the apex and centre of the base','A line through the base only','A line through the apex only','A line parallel to the base'], answer: 'The line through the apex and centre of the base' },
  { question: 'What is the concept of symmetry in functions?', options: ['Even functions are symmetric about the y-axis; odd functions about the origin','All functions are symmetric','No functions are symmetric','Functions are symmetric about the x-axis'], answer: 'Even functions are symmetric about the y-axis; odd functions about the origin' },
  { question: 'What is an even function?', options: ['f(-x) = f(x) for all x','f(-x) = -f(x) for all x','f(x) = f(x+1) for all x','f(x) = -f(x) for all x'], answer: 'f(-x) = f(x) for all x' },
  { question: 'What is an odd function?', options: ['f(-x) = -f(x) for all x','f(-x) = f(x) for all x','f(x) = f(x+1) for all x','f(x) = -f(x) for all x'], answer: 'f(-x) = -f(x) for all x' },
  { question: 'What is the symmetry of y = sin(x)?', options: ['Odd function — symmetric about the origin','Even function — symmetric about the y-axis','No symmetry','Symmetric about x = π/2'], answer: 'Odd function — symmetric about the origin' },
];
const L5: QuizQuestion[] = [
  { question: 'What is a symmetry group?', options: ['The set of all symmetry operations of an object that form a mathematical group','A group of symmetric shapes','A group of symmetric functions','A group of symmetric equations'], answer: 'The set of all symmetry operations of an object that form a mathematical group' },
  { question: 'What is the cyclic group Cₙ?', options: ['The symmetry group of a regular n-gon with only rotational symmetry','The symmetry group of a regular n-gon with all symmetries','A group of n reflections','A group of n translations'], answer: 'The symmetry group of a regular n-gon with only rotational symmetry' },
  { question: 'What is the dihedral group Dₙ?', options: ['The symmetry group of a regular n-gon including rotations and reflections','The symmetry group with only rotations','A group of n translations','A group of n reflections only'], answer: 'The symmetry group of a regular n-gon including rotations and reflections' },
  { question: 'What is the order of the dihedral group D₄?', options: ['4','6','8','12'], answer: '8' },
  { question: 'What is Noether\'s theorem?', options: ['Every symmetry of a physical system corresponds to a conservation law','Every symmetry has a corresponding group','Every group has a corresponding symmetry','Symmetry is always broken in nature'], answer: 'Every symmetry of a physical system corresponds to a conservation law' },
  { question: 'What conservation law corresponds to time translation symmetry?', options: ['Conservation of energy','Conservation of momentum','Conservation of angular momentum','Conservation of charge'], answer: 'Conservation of energy' },
  { question: 'What conservation law corresponds to spatial translation symmetry?', options: ['Conservation of momentum','Conservation of energy','Conservation of angular momentum','Conservation of charge'], answer: 'Conservation of momentum' },
  { question: 'What conservation law corresponds to rotational symmetry?', options: ['Conservation of angular momentum','Conservation of energy','Conservation of momentum','Conservation of charge'], answer: 'Conservation of angular momentum' },
  { question: 'What is the concept of spontaneous symmetry breaking?', options: ['A system\'s ground state has less symmetry than its equations of motion','A system gains symmetry over time','A system always maintains its symmetry','Symmetry is always preserved in quantum mechanics'], answer: 'A system\'s ground state has less symmetry than its equations of motion' },
  { question: 'What is the concept of gauge symmetry in physics?', options: ['A symmetry under local transformations that gives rise to fundamental forces','A symmetry under global transformations','A symmetry of geometric shapes','A symmetry of mathematical functions'], answer: 'A symmetry under local transformations that gives rise to fundamental forces' },
  { question: 'What is the concept of supersymmetry (SUSY)?', options: ['A proposed symmetry between bosons and fermions','A symmetry between matter and antimatter','A symmetry between space and time','A symmetry between energy and mass'], answer: 'A proposed symmetry between bosons and fermions' },
  { question: 'What is the concept of CPT symmetry?', options: ['The combined symmetry of charge conjugation, parity and time reversal','A symmetry of geometric shapes','A symmetry of mathematical functions','A symmetry of chemical reactions'], answer: 'The combined symmetry of charge conjugation, parity and time reversal' },
];

export default function SymmetryStudioGame() {
  return (
    <>
      <Helmet>
        <title>Symmetry Studio — Sodafom</title>
        <meta name="description" content="Explore lines of symmetry and symmetrical shapes!" />
        <link rel="canonical" href="https://sodafom.uk/games/symmetry-studio" />
        <meta property="og:title" content="Symmetry Studio — Sodafom" />
        <meta property="og:description" content="Explore lines of symmetry and symmetrical shapes!" />
        <meta property="og:url" content="https://sodafom.uk/games/symmetry-studio" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Symmetry Studio — Maths Game for Kids — Sodafom</h1>
      <GameShell title="Symmetry Studio" emoji="🪞" subject="maths" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="symmetry-studio"
            title="Symmetry Studio"
            emoji="🪞"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-secondary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
