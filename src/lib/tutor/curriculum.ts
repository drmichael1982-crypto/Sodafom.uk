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
  },

  // ── HISTORY ───────────────────────────────────────────────────────────────
  {
    id: 'history-stonehenge',
    subject: 'History',
    topic: 'Stone Age Britain',
    ageGroup: '8-10',
    title: 'Stonehenge and Prehistoric Britain',
    explanation: 'Stonehenge is a prehistoric monument in Wiltshire. Its stones were raised in stages thousands of years ago, before written records in Britain.',
    simplerExplanation: 'People long ago moved huge stones and arranged them in a circle. Historians use evidence to work out how and why.',
    examples: ['Archaeologists study objects and places from the past.', 'Prehistory means the time before written records.'],
    questions: [
      {
        id: 'hist-1',
        question: 'What does prehistory mean?',
        options: ['Before written records', 'After the Romans', 'A made-up story', 'Last year'],
        answer: 'Before written records',
        hint: 'Think about a time before people wrote events down.',
        explanation: 'Prehistory is the period before written records were made.',
        simplerExplanation: 'It means a very long time ago, before history was written down.',
        difficulty: 1
      },
      {
        id: 'hist-2',
        question: 'Who studies objects and places to learn about people from the past?',
        options: ['Archaeologists', 'Astronauts', 'Dentists', 'Meteorologists'],
        answer: 'Archaeologists',
        hint: 'They may carefully excavate the ground.',
        explanation: 'Archaeologists use physical evidence to investigate the past.',
        simplerExplanation: 'Archaeologists are history detectives who study old objects and places.',
        difficulty: 1
      }
    ]
  },

  // ── PHYSICAL EDUCATION ────────────────────────────────────────────────────
  {
    id: 'pe-heart-fitness',
    subject: 'PE',
    topic: 'healthy movement',
    ageGroup: '8-10',
    title: 'Movement, Warm-ups and Fitness',
    explanation: 'A warm-up gradually raises your heart rate and prepares muscles and joints for activity. A cool-down helps the body return towards its resting state.',
    simplerExplanation: 'Start gently before exercise, move safely, drink water and slow down at the end.',
    examples: ['Warm-up: brisk walking and gentle movement.', 'Cool-down: slower movement and calm breathing.'],
    questions: [
      {
        id: 'pe-1',
        question: 'Why should we warm up before energetic exercise?',
        options: ['To prepare the body', 'To make shoes heavier', 'To avoid drinking water', 'To finish immediately'],
        answer: 'To prepare the body',
        hint: 'Think about your muscles, joints and heart rate.',
        explanation: 'A gradual warm-up prepares the body for more energetic movement.',
        simplerExplanation: 'Warming up gets your body ready to move safely.',
        difficulty: 1
      },
      {
        id: 'pe-2',
        question: 'Which is a sensible cool-down?',
        options: ['Slower movement and calm breathing', 'Stopping suddenly after a sprint', 'Holding your breath', 'Skipping water all day'],
        answer: 'Slower movement and calm breathing',
        hint: 'A cool-down should be gentle.',
        explanation: 'Gentle movement and controlled breathing help the body recover gradually.',
        simplerExplanation: 'Slow down bit by bit and breathe calmly.',
        difficulty: 1
      }
    ]
  },

  // ── FRENCH ────────────────────────────────────────────────────────────────
  {
    id: 'french-greetings',
    subject: 'French',
    topic: 'greetings',
    ageGroup: '8-10',
    title: 'Bonjour! French Greetings',
    explanation: 'In French, bonjour means hello or good day, au revoir means goodbye, and merci means thank you.',
    simplerExplanation: 'Bonjour is hello. Merci is thank you. Au revoir is goodbye.',
    examples: ['Bonjour, Archie!', 'Merci beaucoup.', 'Au revoir!'],
    questions: [
      {
        id: 'fr-1',
        question: 'What does “bonjour” mean?',
        options: ['Hello', 'Goodbye', 'Please', 'Night'],
        answer: 'Hello',
        hint: 'You can say it when you meet someone.',
        explanation: 'Bonjour is a common French greeting meaning hello or good day.',
        simplerExplanation: 'Bonjour means hello.',
        difficulty: 1
      },
      {
        id: 'fr-2',
        question: 'Which French word means “thank you”?',
        options: ['Merci', 'Bonjour', 'Rouge', 'Chat'],
        answer: 'Merci',
        hint: 'It begins with M.',
        explanation: 'Merci is the French word for thank you.',
        simplerExplanation: 'Say “merci” when somebody helps you.',
        difficulty: 1
      }
    ]
  },

  // ── GERMAN ────────────────────────────────────────────────────────────────
  {
    id: 'german-greetings',
    subject: 'German',
    topic: 'greetings',
    ageGroup: '8-10',
    title: 'Hallo! German Greetings',
    explanation: 'In German, hallo means hello, danke means thank you, and auf Wiedersehen means goodbye.',
    simplerExplanation: 'Hallo is hello. Danke is thank you. Auf Wiedersehen is goodbye.',
    examples: ['Hallo, Archie!', 'Danke schön.', 'Auf Wiedersehen!'],
    questions: [
      {
        id: 'de-1',
        question: 'What does “hallo” mean?',
        options: ['Hello', 'Goodbye', 'Please', 'Morning'],
        answer: 'Hello',
        hint: 'It looks a little like the English word.',
        explanation: 'Hallo is a common German greeting meaning hello.',
        simplerExplanation: 'Hallo means hello.',
        difficulty: 1
      },
      {
        id: 'de-2',
        question: 'Which German word means “thank you”?',
        options: ['Danke', 'Hallo', 'Blau', 'Hund'],
        answer: 'Danke',
        hint: 'It begins with D.',
        explanation: 'Danke is the German word for thank you.',
        simplerExplanation: 'Say “danke” when somebody helps you.',
        difficulty: 1
      }
    ]
  }
];
