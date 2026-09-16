import type { LessonQuestion, TopicLesson } from './curriculum';
import type { CurriculumAgeGroup } from './curriculum-year-plan';

type MathsTeaching = Pick<TopicLesson, 'title' | 'explanation' | 'simplerExplanation' | 'examples' | 'questions'>;
type QuestionContent = Pick<LessonQuestion, 'question' | 'answer' | 'hint' | 'explanation'> & { options?: string[] };

function numberQuestion(question: string, answer: number, hint: string, explanation: string): QuestionContent {
  return { question, answer: String(answer), hint, explanation };
}

/**
 * Child-facing Maths practice, separate from curriculum planning notes.
 * These are focused practice activities, not a claim of a complete reviewed syllabus.
 * Keep this strand order aligned with the eight Maths strands in curriculum-year-plan.
 */
export function buildMathsTeaching(age: CurriculumAgeGroup, strand: number, day: number): MathsTeaching {
  const variant = (day - 1) % 17;
  const difficulty = age === '5-7' ? 1 : age === '8-10' ? 2 : 3;
  const build = (
    title: string,
    explanation: string,
    simplerExplanation: string,
    examples: string[],
    questionAt: (index: number) => QuestionContent,
  ): MathsTeaching => ({
    title,
    explanation,
    simplerExplanation,
    examples,
    questions: Array.from({ length: 10 }, (_, index) => {
      const question = questionAt(index);
      const answer = Number(question.answer);
      const options = question.options ?? [answer, answer + 1, answer - 1, answer + 2, answer + 3]
        .filter((value) => age === '11-13' || value >= 0)
        .slice(0, 4)
        .map(String);
      const offset = (day + index) % options.length;
      return {
        ...question,
        id: `maths:${age}:day-${day}:question-${index + 1}`,
        options: [...options.slice(offset), ...options.slice(0, offset)],
        simplerExplanation: question.explanation,
        difficulty,
      };
    }),
  });

  if (strand === 0) {
    if (age === '5-7') return build(
      'Tens and ones',
      'Let’s build numbers with tens and ones. One group of ten and 3 extra ones make 13.',
      'Count 10, then 11, 12, 13. That is 1 ten and 3 ones.',
      ['1 ten + 3 ones = 10 + 3 = 13.', '2 tens + 4 ones = 20 + 4 = 24.'],
      (index) => {
        const tens = 1 + Math.floor((variant + index) / 9) % 3;
        const ones = 1 + (variant + index) % 9;
        return numberQuestion(`What number is ${tens} ${tens === 1 ? 'ten' : 'tens'} and ${ones} ${ones === 1 ? 'one' : 'ones'}?`, tens * 10 + ones,
          'Count the tens first. Then add the ones.', `${tens} tens make ${tens * 10}. Add ${ones} to make ${tens * 10 + ones}.`);
      },
    );
    if (age === '8-10') return build(
      'What is each digit worth?',
      'A digit’s place tells us its value. In 462, the 4 means 400, the 6 means 60, and the 2 means 2.',
      'Read the columns from left to right: hundreds, tens, ones. 462 = 400 + 60 + 2.',
      ['In 462, the digit 6 is in the tens column, so its value is 60.', 'In 735, the digit 7 is in the hundreds column, so its value is 700.'],
      (index) => {
        const hundreds = 2 + (variant + index) % 7;
        const tens = 1 + (variant + index * 2) % 9;
        const ones = (variant + index * 3) % 10;
        const number = hundreds * 100 + tens * 10 + ones;
        const place = index % 2 === 0 ? 'tens' : 'hundreds';
        const digit = place === 'tens' ? tens : hundreds;
        const value = digit * (place === 'tens' ? 10 : 100);
        return numberQuestion(`In ${number}, what is the value of the digit in the ${place} column?`, value,
          `Find the ${place} column, then work out what that digit is worth.`, `There are ${digit} ${place} in ${number}. Their value is ${value}.`);
      },
    );
    return build(
      'Decimal place value',
      'The first digit after the decimal point shows tenths. The next shows hundredths. In 3.47, the 4 is worth 0.4 and the 7 is worth 0.07.',
      'Ten tenths make one whole. One hundred hundredths make one whole.',
      ['3.47 = 3 + 0.4 + 0.07.', 'In 6.28, the 8 is in the hundredths column, so its value is 0.08.'],
      (index) => {
        const whole = 1 + Math.floor((variant + index) / 9) % 8;
        const tenths = 1 + (variant + index) % 9;
        const hundredths = 1 + (variant + index * 2) % 9;
        const decimal = `${whole}.${tenths}${hundredths}`;
        const place = index % 2 === 0 ? 'tenths' : 'hundredths';
        const digit = place === 'tenths' ? tenths : hundredths;
        const value = digit / (place === 'tenths' ? 10 : 100);
        return {
          ...numberQuestion(`In ${decimal}, what is the value of the digit in the ${place} column?`, value,
            'Look at the position after the decimal point: tenths first, then hundredths.', `${digit} ${place} = ${value}.`),
          options: [String(value), String(digit), String(digit * 10), String(place === 'tenths' ? digit / 100 : digit / 10)],
        };
      },
    );
  }

  if (strand === 1) {
    if (age === '5-7') return build(
      'Adding a little more',
      'Adding puts groups together. Archie has 4 shells and finds 3 more. Count on from 4: 5, 6, 7. Now he has 7 shells.',
      'Start with the first number. Count on one step for each extra shell.',
      ['4 + 3 = 7.', '6 + 2 = 8: count 7, 8.'],
      (index) => {
        const first = 2 + (variant + index) % 10;
        const more = 1 + (variant + index) % 5;
        return numberQuestion(`What is ${first} + ${more}?`, first + more,
          `Start at ${first} and count on ${more}.`, `${first} + ${more} = ${first + more}.`);
      },
    );
    if (age === '8-10') return build(
      'Equal groups',
      'Multiplication is a quick way to count equal groups. Four bags with 6 marbles in each hold 4 × 6 = 24 marbles.',
      'Add one group at a time: 6 + 6 + 6 + 6 = 24.',
      ['4 × 6 = 6 + 6 + 6 + 6 = 24.', '3 × 8 = 8 + 8 + 8 = 24.'],
      (index) => {
        const groups = 2 + (variant + index) % 11;
        const each = 2 + Math.floor((variant + index) / 11) % 8;
        return numberQuestion(`There are ${groups} bags with ${each} marbles in each. How many marbles altogether?`, groups * each,
          `Multiply ${groups} by ${each}, or add ${each} for each bag.`, `${groups} × ${each} = ${groups * each} marbles.`);
      },
    );
    return build(
      'Adding across zero',
      'Negative numbers are below zero. Start at −4 and add 7. Four steps reach zero; the next 3 steps reach 3. So −4 + 7 = 3.',
      'When you add a positive number, move right along the number line.',
      ['−4 + 7 = 3.', '−8 + 5 = −3: move 5 steps towards zero from −8.'],
      (index) => {
        const below = 2 + (variant + index) % 10;
        const add = 1 + (variant + index * 3) % 15;
        return numberQuestion(`What is −${below} + ${add}?`, add - below,
          `Start at −${below} and move ${add} steps to the right.`, `−${below} + ${add} = ${add - below}.`);
      },
    );
  }

  if (strand === 2) {
    if (age === '5-7') return build(
      'Sharing in halves',
      'A half is one of two equal parts. Share 8 apples equally between two baskets. Each basket gets 4 apples, so half of 8 is 4.',
      'Make two groups with the same number in each. One group is half.',
      ['Half of 8 is 4: 4 + 4 = 8.', 'Half of 6 is 3: 3 + 3 = 6.'],
      (index) => {
        const half = 1 + (variant + index) % 10;
        return numberQuestion(`What is half of ${half * 2}?`, half,
          'Share the number equally between two groups.', `${half * 2} shared equally between 2 groups gives ${half} in each.`);
      },
    );
    if (age === '8-10') return build(
      'Three quarters of a group',
      'To find three quarters, first split the whole into 4 equal parts. Then take 3 parts. Three quarters of 20 is 15: 20 ÷ 4 = 5, then 5 × 3 = 15.',
      'Find one quarter by dividing by 4. Add that quarter three times.',
      ['3/4 of 20: 20 ÷ 4 = 5, then 5 × 3 = 15.', '3/4 of 12: 12 ÷ 4 = 3, then 3 × 3 = 9.'],
      (index) => {
        const quarter = 2 + (variant + index) % 10;
        return numberQuestion(`What is 3/4 of ${quarter * 4}?`, quarter * 3,
          `Divide ${quarter * 4} by 4 first. Then multiply the answer by 3.`, `${quarter * 4} ÷ 4 = ${quarter}; ${quarter} × 3 = ${quarter * 3}.`);
      },
    );
    return build(
      'Finding a percentage',
      'Percent means out of 100. To find 15% of 80, find 10% (8) and 5% (4), then add them: 15% is 12.',
      '10% is one tenth. 5% is half of 10%. Add them to find 15%.',
      ['15% of 80 = 8 + 4 = 12.', '15% of 200 = 20 + 10 = 30.'],
      (index) => {
        const whole = (2 + (variant + index) % 10) * 20;
        return numberQuestion(`What is 15% of ${whole}?`, whole * 3 / 20,
          'Find 10%, halve it to get 5%, then add the two amounts.', `10% is ${whole / 10}; 5% is ${whole / 20}; together they make ${whole * 3 / 20}.`);
      },
    );
  }

  if (strand === 3) {
    if (age === '5-7') return build(
      'Measuring joined lengths',
      'We can measure short lengths in centimetres, written cm. A 5 cm ribbon joined end to end with a 3 cm ribbon makes 8 cm.',
      'Add the lengths to find how long the two pieces are together.',
      ['5 cm + 3 cm = 8 cm.', '2 cm + 4 cm = 6 cm.'],
      (index) => {
        const first = 1 + (variant + index) % 10;
        const second = 2 + (variant + index) % 5;
        return numberQuestion(`Two ribbons are ${first} cm and ${second} cm long. Joined end to end, how many centimetres long are they?`, first + second,
          'Add the two lengths.', `${first} + ${second} = ${first + second}, so the joined length is ${first + second} cm.`);
      },
    );
    if (age === '8-10') return build(
      'Hours and minutes',
      'One hour is 60 minutes. Two hours and 15 minutes is 120 + 15 = 135 minutes.',
      'Count 60 for each whole hour. Then add the extra minutes.',
      ['2 hours 15 minutes = 60 + 60 + 15 = 135 minutes.', '1 hour 20 minutes = 60 + 20 = 80 minutes.'],
      (index) => {
        const hours = 1 + Math.floor((variant + index) / 6) % 3;
        const minutes = ((variant + index) % 6) * 5;
        return numberQuestion(`How many minutes are in ${hours} ${hours === 1 ? 'hour' : 'hours'} and ${minutes} minutes?`, hours * 60 + minutes,
          'Multiply the hours by 60, then add the extra minutes.', `${hours} × 60 + ${minutes} = ${hours * 60 + minutes} minutes.`);
      },
    );
    return build(
      'Metres and centimetres',
      'There are 100 centimetres in one metre. To change metres to centimetres, multiply by 100. So 1.25 m = 125 cm.',
      '1 m is 100 cm. 0.25 m is another 25 cm. Together they make 125 cm.',
      ['1.25 × 100 = 125, so 1.25 m = 125 cm.', '0.8 × 100 = 80, so 0.8 m = 80 cm.'],
      (index) => {
        const centimetres = 25 + (variant + index) * 15;
        return numberQuestion(`How many centimetres are in ${centimetres / 100} metres?`, centimetres,
          'Multiply the number of metres by 100.', `${centimetres / 100} × 100 = ${centimetres} cm.`);
      },
    );
  }

  if (strand === 4) {
    if (age === '5-7') {
      const shapes: QuestionContent[] = [
        { question: 'How many straight sides does a triangle have?', answer: '3', hint: 'Count the sides of a triangle: one, two…', explanation: 'A triangle has 3 straight sides.' },
        { question: 'How many corners does a square have?', answer: '4', hint: 'A square has a corner where each pair of sides meets.', explanation: 'A square has 4 corners.' },
        { question: 'How many straight sides does a circle have?', answer: '0', hint: 'A circle is curved all the way round.', explanation: 'A circle has 0 straight sides.' },
        { question: 'How many corners does a triangle have?', answer: '3', hint: 'Count where the sides of a triangle meet.', explanation: 'A triangle has 3 corners.' },
        { question: 'How many straight sides does a rectangle have?', answer: '4', hint: 'Count the top, bottom, left and right sides.', explanation: 'A rectangle has 4 straight sides.' },
        { question: 'How many corners does a circle have?', answer: '0', hint: 'A circle has no sharp turns.', explanation: 'A circle has 0 corners.' },
        { question: 'Which shape has 3 straight sides?', answer: 'Triangle', options: ['Circle', 'Square', 'Triangle', 'Rectangle'], hint: 'Its name starts with tri.', explanation: 'A triangle has 3 straight sides.' },
        { question: 'Which shape has no corners?', answer: 'Circle', options: ['Triangle', 'Circle', 'Rectangle', 'Square'], hint: 'Think of a round shape.', explanation: 'A circle is curved and has no corners.' },
        { question: 'How many straight sides does a square have?', answer: '4', hint: 'Count each of the equal sides.', explanation: 'A square has 4 equal straight sides.' },
        { question: 'How many corners does a rectangle have?', answer: '4', hint: 'Count where the four sides meet.', explanation: 'A rectangle has 4 corners.' },
      ];
      return build('Sides and corners',
        'A triangle has 3 straight sides and 3 corners. Squares and rectangles each have 4 straight sides and 4 corners. A circle has no straight sides or corners.',
        'Trace a shape with your finger. Count its straight sides, then its corners.',
        ['Triangle: 3 sides and 3 corners.', 'Square or rectangle: 4 sides and 4 corners. Circle: 0 straight sides and 0 corners.'],
        (index) => shapes[(variant + index) % shapes.length]);
    }
    if (age === '8-10') return build(
      'Around a rectangle',
      'Perimeter is the distance all the way around a shape. A rectangle 6 cm long and 3 cm wide has perimeter 6 + 3 + 6 + 3 = 18 cm.',
      'Add all four sides. Opposite sides of a rectangle have the same length.',
      ['6 + 3 + 6 + 3 = 18 cm.', 'A 4 cm by 2 cm rectangle has perimeter 4 + 2 + 4 + 2 = 12 cm.'],
      (index) => {
        const length = 4 + (variant + index) % 10;
        const width = 2 + Math.floor((variant + index) / 10) % 3;
        return numberQuestion(`A rectangle is ${length} cm long and ${width} cm wide. What is its perimeter in centimetres?`, 2 * (length + width),
          'Add the length and width, then double the answer.', `${length} + ${width} + ${length} + ${width} = ${2 * (length + width)} cm.`);
      },
    );
    return build(
      'Missing angles in triangles',
      'The three inside angles of a triangle add up to 180°. If two angles are 50° and 60°, the missing angle is 180 − 50 − 60 = 70°.',
      'Add the two known angles. Subtract that total from 180.',
      ['50° + 60° + 70° = 180°.', 'If two angles are 90° and 35°, the third is 180 − 125 = 55°.'],
      (index) => {
        const first = 30 + ((variant + index) % 10) * 5;
        const second = 40 + (variant % 3) * 5;
        return numberQuestion(`Two inside angles of a triangle are ${first}° and ${second}°. How many degrees is the third angle?`, 180 - first - second,
          'The three angles must add up to 180°.', `180 − ${first} − ${second} = ${180 - first - second}°.`);
      },
    );
  }

  if (strand === 5) {
    if (age === '5-7') return build(
      'Counting our results',
      'Archie counted 3 dogs and 4 cats at the park. He can record the numbers and add them: 3 + 4 = 7 animals altogether.',
      'Read each group’s number, then count how many there are altogether.',
      ['Dogs: 3. Cats: 4. Total: 3 + 4 = 7.', 'Red cars: 2. Blue cars: 5. Total: 2 + 5 = 7.'],
      (index) => {
        const dogs = 1 + (variant + index) % 10;
        const cats = 1 + (variant + index) % 5;
        return numberQuestion(`Archie records ${dogs} dogs and ${cats} cats. How many animals did he record altogether?`, dogs + cats,
          'Add the number of dogs to the number of cats.', `${dogs} + ${cats} = ${dogs + cats} animals.`);
      },
    );
    if (age === '8-10') return build(
      'Reading a class survey',
      'A survey records people’s choices. In one class, 8 children chose apples, 6 chose bananas and 5 chose pears. Add the groups: 8 + 6 + 5 = 19 children.',
      'Each child chooses once. Add the three groups to find how many children answered.',
      ['Apples: 8. Bananas: 6. Pears: 5. Total: 19.', '8 + 6 = 14, then 14 + 5 = 19.'],
      (index) => {
        const apples = 2 + (variant + index) % 10;
        const bananas = 3 + (variant + index) % 4;
        const pears = 2 + (variant + index) % 3;
        return numberQuestion(`Each child chooses one fruit. Apples: ${apples}, bananas: ${bananas}, pears: ${pears}. How many children answered?`, apples + bananas + pears,
          'Add all three recorded groups.', `${apples} + ${bananas} + ${pears} = ${apples + bananas + pears} children.`);
      },
    );
    return build(
      'Finding the mean',
      'The mean shares a total equally between the values. For 4, 7 and 10, the total is 21. There are 3 values, so the mean is 21 ÷ 3 = 7.',
      'Add all the values. Divide by how many values there are.',
      ['Mean of 4, 7, 10 = (4 + 7 + 10) ÷ 3 = 7.', 'Mean of 2, 6, 10 = 18 ÷ 3 = 6.'],
      (index) => {
        const middle = 5 + variant + index;
        const gap = 2 + (variant + index) % 3;
        return numberQuestion(`What is the mean of ${middle - gap}, ${middle} and ${middle + gap}?`, middle,
          'Add the three values, then divide by 3.', `${middle - gap} + ${middle} + ${middle + gap} = ${middle * 3}; ${middle * 3} ÷ 3 = ${middle}.`);
      },
    );
  }

  if (strand === 6) {
    if (age === '5-7') return build(
      'Counting in twos',
      'A number pattern can use the same jump each time. In 2, 4, 6, 8, we add 2 each time. The next number is 10.',
      'Count on two from the last number to find the next one.',
      ['2, 4, 6, 8, 10: add 2 each time.', '5, 7, 9, 11: the jumps are still 2.'],
      (index) => {
        const start = (variant + index) % 12;
        return numberQuestion(`Add 2 each time: ${start}, ${start + 2}, ${start + 4}, __. What comes next?`, start + 6,
          `Count two more than ${start + 4}.`, `${start + 4} + 2 = ${start + 6}.`);
      },
    );
    if (age === '8-10') return build(
      'Find the missing number',
      'A box can stand for a missing number. In □ + 8 = 23, take 8 away from 23 to find the box: □ = 15.',
      'Subtraction undoes addition. Take away the number you already know.',
      ['□ + 8 = 23, so □ = 23 − 8 = 15.', 'Check: 15 + 8 = 23.'],
      (index) => {
        const missing = 5 + variant + index;
        const add = 3 + (variant + index) % 9;
        return numberQuestion(`□ + ${add} = ${missing + add}. What is the missing number?`, missing,
          `Subtract ${add} from ${missing + add}.`, `${missing + add} − ${add} = ${missing}. Check: ${missing} + ${add} = ${missing + add}.`);
      },
    );
    return build(
      'Sharing in a ratio',
      'Red and blue beads are in the ratio 2:3. That means 2 red parts and 3 blue parts: 5 parts altogether. With 20 beads, each part is 4 beads, so 8 are red.',
      'Add the ratio parts. Divide the total by that number. Multiply by the number of red parts.',
      ['20 ÷ (2 + 3) = 4 beads per part. Red beads: 2 × 4 = 8.', 'Blue beads: 3 × 4 = 12. Check: 8 + 12 = 20.'],
      (index) => {
        const part = 2 + (variant + index) % 10;
        return numberQuestion(`Red and blue beads are in the ratio 2:3. There are ${part * 5} beads altogether. How many are red?`, part * 2,
          'There are 5 parts altogether. Find one part, then take 2 parts.', `${part * 5} ÷ 5 = ${part}; ${part} × 2 = ${part * 2} red beads.`);
      },
    );
  }

  if (strand === 7) {
    if (age === '5-7') return build(
      'Two small steps',
      'Archie has 5 stickers. He gets 3 more, then gives 2 to a friend. First add: 5 + 3 = 8. Then take away: 8 − 2 = 6 stickers left.',
      'Do one step at a time. Add the new stickers, then take away the ones Archie gives away.',
      ['5 + 3 = 8, then 8 − 2 = 6.', 'Check with counters or a drawing.'],
      (index) => {
        const start = 3 + (variant + index) % 10;
        const more = 2 + (variant + index) % 3;
        const give = 1 + (variant + index) % 2;
        return numberQuestion(`Archie has ${start} stickers. He gets ${more} more, then gives away ${give}. How many stickers are left?`, start + more - give,
          'Add first. Then take away the stickers he gives away.', `${start} + ${more} = ${start + more}; ${start + more} − ${give} = ${start + more - give}.`);
      },
    );
    if (age === '8-10') return build(
      'Tickets and a snack',
      'Three tickets cost £4 each. That is 3 × £4 = £12. A snack costs another £2, making £14 altogether.',
      'Work out the ticket cost first. Then add the snack.',
      ['3 × £4 = £12. £12 + £2 = £14.', 'Two £5 tickets and a £3 snack cost £10 + £3 = £13.'],
      (index) => {
        const tickets = 2 + (variant + index) % 5;
        const price = 3 + Math.floor((variant + index) / 5) % 5;
        const snack = 1 + (variant + index) % 3;
        return numberQuestion(`${tickets} tickets cost £${price} each. One snack costs £${snack}. What is the total cost in pounds?`, tickets * price + snack,
          'Multiply the ticket price by the number of tickets, then add the snack.', `${tickets} × £${price} = £${tickets * price}; add £${snack} to get £${tickets * price + snack}.`);
      },
    );
    return build(
      'A discount, then delivery',
      'Three books cost £15 each: £45. A 20% discount saves £9, leaving £36. Delivery costs £4, so the final total is £40.',
      'Find the cost before the discount. Take away 20% of that cost. Add delivery last.',
      ['3 × £15 = £45. 20% of £45 = £9. £45 − £9 = £36.', 'Add £4 delivery after the discount: £36 + £4 = £40.'],
      (index) => {
        const price = (2 + variant + index) * 5;
        const before = price * 3;
        const discount = before / 5;
        return numberQuestion(`Three books cost £${price} each. Take 20% off the books, then add £4 delivery. What is the final total in pounds?`, before - discount + 4,
          'Multiply by 3. Find 20% by dividing by 5. Subtract the discount, then add £4.', `Books: £${before}. Discount: £${discount}. £${before} − £${discount} + £4 = £${before - discount + 4}.`);
      },
    );
  }

  throw new Error(`Unsupported Maths strand: ${strand}`);
}
