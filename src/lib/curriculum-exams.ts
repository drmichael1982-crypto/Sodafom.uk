export interface ExamQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface YearExam {
  year: number;
  subject: string;
  questions: ExamQuestion[];
}

export const PRIMARY_EXAMS: YearExam[] = [
  // --- YEAR 1 ---
  {
    year: 1,
    subject: 'Maths',
    questions: [
      { question: 'What is 8 + 7?', options: ['13', '14', '15', '16'], answer: '15', explanation: '8 + 2 = 10, then add the remaining 5 to get 15.' },
      { question: 'Which number comes next: 2, 4, 6, 8, ...?', options: ['9', '10', '11', '12'], answer: '10', explanation: 'The pattern is adding 2 each time.' },
      { question: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], answer: '3', explanation: 'A triangle always has 3 sides and 3 corners.' },
      { question: 'What is one more than 19?', options: ['18', '20', '21', '22'], answer: '20', explanation: 'Adding 1 to 19 makes 20.' },
      { question: 'Double 5 is...?', options: ['8', '10', '12', '15'], answer: '10', explanation: 'Double means two of the same: 5 + 5 = 10.' },
      { question: 'What is 10 minus 4?', options: ['5', '6', '7', '8'], answer: '6', explanation: 'If you have 10 and take away 4, you have 6 left.' },
      { question: 'Which is the largest number?', options: ['12', '19', '15', '17'], answer: '19', explanation: '19 is further along the number line than 12, 15, or 17.' },
      { question: 'What shape is a football?', options: ['Square', 'Circle', 'Sphere', 'Triangle'], answer: 'Sphere', explanation: 'A 3D circle shape is called a sphere.' },
      { question: 'How many pennies are in a £1 coin?', options: ['10', '50', '100', '200'], answer: '100', explanation: 'One pound is made of 100 pence.' },
      { question: 'What is half of 10?', options: ['3', '4', '5', '6'], answer: '5', explanation: 'Sharing 10 into two equal groups gives 5 in each.' }
    ]
  },
  {
    year: 1,
    subject: 'Spelling',
    questions: [
      { question: 'How do you spell the number 1?', options: ['Won', 'One', 'Own', 'Oun'], answer: 'One', explanation: 'The number 1 is spelled O-N-E.' },
      { question: 'Which word is spelled correctly?', options: ['Whent', 'Went', 'Wente', 'Whnet'], answer: 'Went', explanation: 'W-E-N-T is the past tense of go.' },
      { question: 'Spell the word for "the opposite of down".', options: ['Up', 'Upp', 'Ap', 'Upe'], answer: 'Up', explanation: 'U-P is the correct spelling.' },
      { question: 'Which is a "high frequency" word?', options: ['Said', 'Sed', 'Sade', 'Siad'], answer: 'Said', explanation: 'S-A-I-D is a very common word you need to know.' },
      { question: 'What is the missing letter: C_T (an animal)?', options: ['A', 'E', 'I', 'O'], answer: 'A', explanation: 'C-A-T spells cat.' }
    ]
  },

  // --- YEAR 2 ---
  {
    year: 2,
    subject: 'Maths',
    questions: [
      { question: 'What is 45 + 32?', options: ['75', '77', '78', '87'], answer: '77', explanation: '40 + 30 = 70, and 5 + 2 = 7. Together they make 77.' },
      { question: 'What is 5 × 10?', options: ['15', '50', '55', '100'], answer: '50', explanation: 'Counting in tens five times gives 10, 20, 30, 40, 50.' },
      { question: 'What is half of 24?', options: ['10', '11', '12', '14'], answer: '12', explanation: '24 divided by 2 is 12.' },
      { question: 'How many minutes are in one hour?', options: ['30', '50', '60', '100'], answer: '60', explanation: 'There are 60 minutes in a full hour.' },
      { question: 'What is 30 ÷ 5?', options: ['4', '5', '6', '7'], answer: '6', explanation: '5 times 6 is 30, so 30 divided by 5 is 6.' },
      { question: 'Which shape has 5 sides?', options: ['Square', 'Hexagon', 'Pentagon', 'Octagon'], answer: 'Pentagon', explanation: 'A pentagon is a 2D shape with 5 straight sides.' },
      { question: 'What is 100 - 25?', options: ['65', '75', '85', '95'], answer: '75', explanation: '100 minus 20 is 80, minus 5 is 75.' },
      { question: 'How many grams in 1kg?', options: ['10', '100', '1000', '10000'], answer: '1000', explanation: 'Kilo means thousand, so 1000 grams.' }
    ]
  },
  {
    year: 2,
    subject: 'Science',
    questions: [
      { question: 'Which of these is a living thing?', options: ['Rock', 'Tree', 'Car', 'Cloud'], answer: 'Tree', explanation: 'Trees grow, reproduce, and need nutrients, making them living things.' },
      { question: 'What do plants need to grow?', options: ['Darkness', 'Juice', 'Sunlight and Water', 'Sand'], answer: 'Sunlight and Water', explanation: 'Plants use sunlight to make food and water to stay healthy.' },
      { question: 'Which animal is a bird?', options: ['Frog', 'Owl', 'Shark', 'Lion'], answer: 'Owl', explanation: 'Owls have feathers and lay eggs, which defines them as birds.' },
      { question: 'Which material is waterproof?', options: ['Paper', 'Sponge', 'Plastic', 'Fabric'], answer: 'Plastic', explanation: 'Plastic does not let water through, so it is waterproof.' }
    ]
  },

  // --- YEAR 3 ---
  {
    year: 3,
    subject: 'Maths',
    questions: [
      { question: 'What is 342 + 157?', options: ['489', '499', '509', '519'], answer: '499', explanation: '342 + 157 = 499.' },
      { question: 'What is 8 × 4?', options: ['24', '28', '32', '36'], answer: '32', explanation: '8, 16, 24, 32.' },
      { question: 'Which of these is a right angle?', options: ['45 degrees', '90 degrees', '180 degrees', '360 degrees'], answer: '90 degrees', explanation: 'A right angle is exactly 90 degrees.' },
      { question: 'What is 1/4 of 40?', options: ['5', '10', '15', '20'], answer: '10', explanation: 'Divide 40 by 4 to get 10.' },
      { question: 'What is the value of the 7 in 725?', options: ['7', '70', '700', '7000'], answer: '700', explanation: 'The 7 is in the hundreds column.' },
      { question: 'How many days are in a leap year?', options: ['364', '365', '366', '367'], answer: '366', explanation: 'A leap year has one extra day in February.' }
    ]
  },

  // --- YEAR 4 ---
  {
    year: 4,
    subject: 'Maths',
    questions: [
      { question: 'What is 7 × 9?', options: ['56', '63', '72', '81'], answer: '63', explanation: '7 multiplied by 9 is 63.' },
      { question: 'What is 1000 - 350?', options: ['550', '650', '750', '850'], answer: '650', explanation: '1000 minus 300 is 700, minus 50 is 650.' },
      { question: 'Convert 2.5 kilograms to grams.', options: ['25g', '250g', '2500g', '25000g'], answer: '2500g', explanation: '2.5 × 1000 = 2500.' },
      { question: 'What is the perimeter of a square with 5cm sides?', options: ['10cm', '15cm', '20cm', '25cm'], answer: '20cm', explanation: '5 + 5 + 5 + 5 = 20cm.' },
      { question: 'What is 0.5 as a fraction?', options: ['1/2', '1/4', '1/5', '1/10'], answer: '1/2', explanation: '0.5 is exactly half.' },
      { question: 'What is 12 × 11?', options: ['122', '132', '142', '152'], answer: '132', explanation: '12 × 10 = 120, plus one more 12 is 132.' }
    ]
  },

  // --- YEAR 5 ---
  {
    year: 5,
    subject: 'Maths',
    questions: [
      { question: 'Which of these is a prime number?', options: ['9', '15', '17', '21'], answer: '17', explanation: '17 only has two factors: 1 and itself.' },
      { question: 'What is 0.6 as a percentage?', options: ['6%', '60%', '0.6%', '66%'], answer: '60%', explanation: '0.6 × 100 = 60.' },
      { question: 'What is 3/5 of 200?', options: ['100', '120', '140', '160'], answer: '120', explanation: '1/5 of 200 is 40. 3 × 40 = 120.' },
      { question: 'How many degrees are in a straight line?', options: ['90', '180', '270', '360'], answer: '180', explanation: 'A straight line is 180 degrees.' },
      { question: 'What is 12²?', options: ['24', '122', '144', '164'], answer: '144', explanation: '12 multiplied by 12 is 144.' },
      { question: 'What is 1,000,000 divided by 1,000?', options: ['10', '100', '1,000', '10,000'], answer: '1,000', explanation: 'Move the decimal point 3 places to the left.' }
    ]
  },

  // --- YEAR 6 (SATs Prep) ---
  {
    year: 6,
    subject: 'Maths',
    questions: [
      { question: 'Simplify the ratio 12:18.', options: ['2:3', '3:2', '4:6', '6:9'], answer: '2:3', explanation: 'Divide both sides by 6.' },
      { question: 'Solve for x: 3x + 5 = 20.', options: ['3', '5', '10', '15'], answer: '5', explanation: '3x = 15, so x = 5.' },
      { question: 'What is 15% of 80?', options: ['8', '10', '12', '14'], answer: '12', explanation: '10% is 8, 5% is 4. 8 + 4 = 12.' },
      { question: 'Calculate the area of a triangle with base 10cm and height 6cm.', options: ['30cm²', '60cm²', '16cm²', '20cm²'], answer: '30cm²', explanation: '(base × height) / 2 = 30.' },
      { question: 'What is 3/4 + 1/8?', options: ['4/12', '5/8', '7/8', '1/2'], answer: '7/8', explanation: '3/4 is 6/8. 6/8 + 1/8 = 7/8.' },
      { question: 'What is the mean of: 4, 7, 9, 12?', options: ['7', '8', '9', '10'], answer: '8', explanation: 'Add them up (32) and divide by 4.' },
      { question: 'Which is bigger: 0.7 or 3/4?', options: ['0.7', '3/4', 'They are equal', 'Cannot tell'], answer: '3/4', explanation: '3/4 is 0.75, which is bigger than 0.7.' },
      { question: 'A cube has a volume of 64cm³. How long is each side?', options: ['2cm', '4cm', '8cm', '16cm'], answer: '4cm', explanation: '4 × 4 × 4 = 64.' }
    ]
  },
  {
    year: 6,
    subject: 'Science',
    questions: [
      { question: 'Which part of the eye controls light?', options: ['Iris', 'Pupil', 'Retina', 'Cornea'], answer: 'Iris', explanation: 'The iris is the colored part that adjusts the size of the pupil.' },
      { question: 'What is the speed of light approx. (km/s)?', options: ['300', '3,000', '300,000', '3,000,000'], answer: '300,000', explanation: 'Light travels at roughly 300,000 kilometers per second.' },
      { question: 'Which is a reversible change?', options: ['Burning wood', 'Baking a cake', 'Melting ice', 'Rusting iron'], answer: 'Melting ice', explanation: 'You can freeze the water back into ice.' },
      { question: 'What keeps the planets in orbit?', options: ['Magnets', 'Gravity', 'Wind', 'Magic'], answer: 'Gravity', explanation: 'Gravity pulls objects towards each other, keeping planets around the sun.' }
    ]
  }
];
