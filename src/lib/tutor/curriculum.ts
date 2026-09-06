/**
 * Offline-First Curriculum Knowledge Base
 * Covering UK Primary & KS3 Subjects (Maths, English, Reading, Spelling, Science, Geography, RE, Technology, General Knowledge)
 */

export interface LessonQuestion {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  alternateAnswers?: string[];
  hint: string;
  explanation: string;
  simplerExplanation: string;
  difficulty: 1 | 2 | 3; // 1 = Easy, 2 = Medium, 3 = Challenge
}

export interface TopicLesson {
  id: string;
  subject: string;
  topic: string;
  ageGroup: '5-7' | '8-10' | '11-13';
  title: string;
  explanation: string;
  simplerExplanation: string;
  examples: string[];
  questions: LessonQuestion[];
}

export const CURRICULUM_LESSONS: TopicLesson[] = [
  // ── MATHS ──────────────────────────────────────────────────────────────────
  {
    id: 'maths-fractions',
    subject: 'Maths',
    topic: 'fractions',
    ageGroup: '8-10',
    title: 'Understanding Fractions',
    explanation: 'A fraction shows equal parts of a whole! The top number is the numerator (parts we have), and the bottom number is the denominator (total equal parts). For example, 1/2 means 1 part out of 2.',
    simplerExplanation: 'Imagine a pizza cut into 4 equal slices. If you eat 1 slice, you ate 1/4 of the pizza!',
    examples: ['1/2 of 20 = 10', '1/4 of 100 = 25', '3/4 of 12 = 9'],
    questions: [
      {
        id: 'frac-1',
        question: 'What is 1/2 of 20?',
        options: ['5', '10', '15', '20'],
        answer: '10',
        alternateAnswers: ['ten'],
        hint: 'Divide 20 by 2!',
        explanation: '20 divided by 2 is 10.',
        simplerExplanation: 'Share 20 into 2 equal piles: 10 and 10!',
        difficulty: 1
      },
      {
        id: 'frac-2',
        question: 'What is 3/4 of 24?',
        options: ['12', '16', '18', '20'],
        answer: '18',
        alternateAnswers: ['eighteen'],
        hint: 'First find 1/4 of 24 by dividing by 4, then multiply by 3!',
        explanation: '24 ÷ 4 = 6. Then 6 × 3 = 18.',
        simplerExplanation: 'Cut 24 into 4 equal groups of 6. Three of those groups give 6 + 6 + 6 = 18.',
        difficulty: 2
      }
    ]
  },
  {
    id: 'maths-percentages',
    subject: 'Maths',
    topic: 'percentages',
    ageGroup: '8-10',
    title: 'Percentages',
    explanation: 'Percent means "out of 100". 50% is half, 25% is one quarter, and 10% is one tenth.',
    simplerExplanation: 'Think of 100 pence in £1. 50% is 50p, which is half!',
    examples: ['50% of 80 = 40', '10% of 200 = 20', '25% of 40 = 10'],
    questions: [
      {
        id: 'pct-1',
        question: 'What is 50% of 60?',
        options: ['20', '30', '40', '50'],
        answer: '30',
        alternateAnswers: ['thirty'],
        hint: '50% means half!',
        explanation: 'Half of 60 is 30.',
        simplerExplanation: 'Divide 60 by 2 to get 30.',
        difficulty: 1
      }
    ]
  },

  // ── ENGLISH / GRAMMAR ──────────────────────────────────────────────────────
  {
    id: 'english-nouns-verbs',
    subject: 'English',
    topic: 'grammar',
    ageGroup: '5-7',
    title: 'Nouns and Verbs',
    explanation: 'A noun is a naming word for a person, place, or thing (like "dog", "London", or "apple"). A verb is an action word (like "run", "jump", or "sing").',
    simplerExplanation: 'Nouns are things you can see or touch. Verbs are things you CAN DO!',
    examples: ['The cat (noun) sleeps (verb).', 'Archie (noun) dances (verb).'],
    questions: [
      {
        id: 'eng-1',
        question: 'In the sentence "The happy dog barked loudly", which word is the verb?',
        options: ['dog', 'happy', 'barked', 'loudly'],
        answer: 'barked',
        hint: 'Find the action word!',
        explanation: '"Barked" is the action the dog did, making it a verb.',
        simplerExplanation: 'A verb is a doing word. Barking is something the dog does!',
        difficulty: 1
      }
    ]
  },
  {
    id: 'english-phonics',
    subject: 'English',
    topic: 'phonics',
    ageGroup: '5-7',
    title: 'Phonics and Sound Blending',
    explanation: 'Phonics helps us read by matching letters to sounds. For example, "c-a-t" blends together to make "cat"!',
    simplerExplanation: 'Say each sound slowly, then speed up to blend the word!',
    examples: ['sh + ip = ship', 'ch + ip = chip', 'th + in = thin'],
    questions: [
      {
        id: 'phon-1',
        question: 'Which digraph sound is in the word "ship"?',
        options: ['ch', 'sh', 'th', 'ph'],
        answer: 'sh',
        hint: 'Listen to the sound at the start of "ship"!',
        explanation: 'S and H together make the "sh" sound.',
        simplerExplanation: 'Say "shhh" like putting your finger to your lips!',
        difficulty: 1
      }
    ]
  },

  // ── SCIENCE ────────────────────────────────────────────────────────────────
  {
    id: 'science-water-cycle',
    subject: 'Science',
    topic: 'water cycle',
    ageGroup: '8-10',
    title: 'The Water Cycle',
    explanation: 'The water cycle is how water moves around Earth! Heat from the Sun turns water into gas (evaporation). Gas rises and cools into clouds (condensation), then falls as rain (precipitation).',
    simplerExplanation: 'Sun warms water -> Water goes UP -> Clouds form -> Rain comes DOWN!',
    examples: ['Evaporation: water turning into steam.', 'Precipitation: rain, snow, or hail.'],
    questions: [
      {
        id: 'sci-1',
        question: 'What is the word for water turning into gas when heated by the sun?',
        options: ['Condensation', 'Evaporation', 'Precipitation', 'Freezing'],
        answer: 'Evaporation',
        hint: 'It starts with E and water goes UP!',
        explanation: 'Evaporation happens when warm water turns into vapour/gas.',
        simplerExplanation: 'Think of steam rising from a warm bath. That is evaporation!',
        difficulty: 1
      }
    ]
  },
  {
    id: 'science-solar-system',
    subject: 'Science',
    topic: 'solar system',
    ageGroup: '8-10',
    title: 'The Solar System',
    explanation: 'Our solar system has 8 planets orbiting the Sun. Mercury is closest, followed by Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune!',
    simplerExplanation: 'The Sun is a giant star in the middle, and 8 planets travel around it!',
    examples: ['Earth is the 3rd planet from the Sun.', 'Jupiter is the largest planet.'],
    questions: [
      {
        id: 'sol-1',
        question: 'How many planets orbit the Sun in our solar system?',
        options: ['7', '8', '9', '10'],
        answer: '8',
        hint: 'Count Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune!',
        explanation: 'There are 8 official planets in our solar system.',
        simplerExplanation: 'Remember: 8 planets round our Sun!',
        difficulty: 1
      }
    ]
  },

  // ── GEOGRAPHY ──────────────────────────────────────────────────────────────
  {
    id: 'geography-continents',
    subject: 'Geography',
    topic: 'geography',
    ageGroup: '8-10',
    title: 'Continents of the World',
    explanation: 'There are 7 continents on Earth: Asia, Africa, North America, South America, Antarctica, Europe, and Australia!',
    simplerExplanation: 'Continents are huge land masses containing many countries.',
    examples: ['The UK is in Europe.', 'The Amazon rainforest is in South America.'],
    questions: [
      {
        id: 'geo-1',
        question: 'Which continent is the United Kingdom located in?',
        options: ['Asia', 'Africa', 'Europe', 'North America'],
        answer: 'Europe',
        hint: 'It starts with E!',
        explanation: 'The UK is part of the continent of Europe.',
        simplerExplanation: 'The UK sits in Europe, near France and Spain.',
        difficulty: 1
      }
    ]
  },

  // ── RE (RELIGIOUS EDUCATION) ────────────────────────────────────────────────
  {
    id: 're-festivals',
    subject: 'RE',
    topic: 'festivals',
    ageGroup: '8-10',
    title: 'World Festivals',
    explanation: 'People around the world celebrate special festivals. Diwali is the Hindu festival of lights, Eid marks the end of Ramadan in Islam, and Christmas celebrates the birth of Jesus in Christianity.',
    simplerExplanation: 'Festivals bring families together to celebrate light, peace, and giving!',
    examples: ['Diwali: Festival of lights.', 'Eid al-Fitr: Festival after Ramadan.'],
    questions: [
      {
        id: 're-1',
        question: 'Diwali is known as the festival of what?',
        options: ['Colors', 'Lights', 'Harvest', 'Spring'],
        answer: 'Lights',
        hint: 'People light diyas (small lamps) during Diwali!',
        explanation: 'Diwali is the Hindu festival of lights symbolizing good over dark.',
        simplerExplanation: 'Lights and oil lamps shine during Diwali!',
        difficulty: 1
      }
    ]
  },

  // ── TECHNOLOGY / COMPUTING ─────────────────────────────────────────────────
  {
    id: 'tech-algorithms',
    subject: 'Technology',
    topic: 'computing',
    ageGroup: '8-10',
    title: 'Algorithms and Coding',
    explanation: 'An algorithm is a set of step-by-step instructions to complete a task, just like a baking recipe or directions on a map!',
    simplerExplanation: 'An algorithm is a clear list of steps a computer follows.',
    examples: ['Brushing teeth steps: 1. Put toothpaste, 2. Brush, 3. Rinse.'],
    questions: [
      {
        id: 'tech-1',
        question: 'What is a step-by-step set of instructions for a computer called?',
        options: ['Algorithm', 'Bug', 'Hardware', 'Pixel'],
        answer: 'Algorithm',
        hint: 'It starts with A!',
        explanation: 'An algorithm gives clear steps for a computer or person to follow.',
        simplerExplanation: 'Algorithms are step-by-step recipes for computers!',
        difficulty: 1
      }
    ]
  }
];
