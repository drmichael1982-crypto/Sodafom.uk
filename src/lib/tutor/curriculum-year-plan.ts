import type { LessonQuestion, TopicLesson } from './curriculum';

export const CURRICULUM_DAYS = 365;
export const CURRICULUM_SOURCE_URL = 'https://www.gov.uk/government/collections/national-curriculum';

export type CurriculumAgeGroup = '5-7' | '8-10' | '11-13';
export type CurriculumSubject =
  | 'Maths'
  | 'English'
  | 'Reading'
  | 'Spelling'
  | 'Science'
  | 'History'
  | 'Geography'
  | 'Computing'
  | 'Design & Technology'
  | 'Art & Design'
  | 'Music'
  | 'PE'
  | 'RE'
  | 'PSHE'
  | 'French'
  | 'German';

type LessonDuration = 15 | 20 | 30 | 60;

interface CurriculumStrand {
  title: string;
  objective: string;
  vocabulary: string[];
}

interface LessonPhase {
  name: string;
  minutes: number;
  activity: string;
}

export interface DailyCurriculumLesson extends TopicLesson {
  lessonDay: number;
  week: number;
  durationMinutes: LessonDuration;
  sequenceStage: string;
  curriculumRef: string;
  reviewStatus: 'curriculum-informed-teacher-review-required';
  lessonPhases: LessonPhase[];
  accessibility: {
    dyslexia: string;
    autism: string;
    colourVision: string;
    deafOrHardOfHearing: string;
    blindOrLowVision: string;
  };
}

const subjectRows: Record<CurriculumSubject, Array<[string, string, string[]]>> = {
  Maths: [
    ['Number and place value', 'read, represent, compare and reason about numbers', ['digit', 'place value', 'compare', 'estimate']],
    ['Calculation', 'choose and explain accurate addition, subtraction, multiplication and division strategies', ['sum', 'difference', 'product', 'quotient']],
    ['Fractions, decimals and percentages', 'represent parts of a whole and connect equivalent forms', ['fraction', 'decimal', 'percentage', 'equivalent']],
    ['Measurement', 'measure and solve problems involving time, money, length, mass and capacity', ['unit', 'scale', 'duration', 'change']],
    ['Geometry', 'describe and reason about shape, position, direction and angles', ['angle', 'parallel', 'symmetry', 'coordinate']],
    ['Statistics and probability', 'collect, represent and interpret data and chance', ['data', 'graph', 'average', 'probability']],
    ['Ratio and algebra', 'notice relationships, express patterns and solve unknowns', ['ratio', 'sequence', 'variable', 'expression']],
    ['Reasoning and problem solving', 'use mathematical evidence to solve and explain multi-step problems', ['strategy', 'reasoning', 'justify', 'check']],
  ],
  English: [
    ['Spoken language', 'listen, discuss, present and respond clearly for different audiences', ['listen', 'question', 'present', 'audience']],
    ['Sentence construction', 'build accurate and varied sentences for meaning and effect', ['sentence', 'clause', 'subject', 'verb']],
    ['Grammar', 'recognise and use grammatical structures accurately', ['noun', 'verb', 'adjective', 'adverb']],
    ['Punctuation', 'select punctuation that makes meaning clear', ['capital', 'comma', 'apostrophe', 'paragraph']],
    ['Composition', 'plan, draft, improve and share purposeful writing', ['plan', 'draft', 'edit', 'publish']],
    ['Vocabulary', 'choose precise words and explore how language shapes meaning', ['synonym', 'antonym', 'context', 'effect']],
    ['Non-fiction communication', 'organise information for a clear audience and purpose', ['heading', 'fact', 'purpose', 'register']],
    ['Creative writing', 'develop characters, settings, viewpoint and structure', ['character', 'setting', 'viewpoint', 'structure']],
  ],
  Reading: [
    ['Phonics and decoding', 'use sound, spelling and word-part knowledge to read unfamiliar words', ['phoneme', 'grapheme', 'blend', 'decode']],
    ['Fluency', 'read accurately, smoothly and with appropriate expression', ['accuracy', 'pace', 'expression', 'phrasing']],
    ['Retrieval', 'find and record relevant information from a text', ['retrieve', 'fact', 'scan', 'evidence']],
    ['Inference', 'use clues and evidence to explain ideas that are implied', ['inference', 'clue', 'evidence', 'explain']],
    ['Summary and sequence', 'identify main ideas and organise events or information', ['summary', 'sequence', 'main idea', 'detail']],
    ['Author choices', 'discuss how vocabulary, structure and presentation affect a reader', ['author', 'purpose', 'structure', 'effect']],
  ],
  Spelling: [
    ['Sounds and graphemes', 'connect spoken sounds to common written spellings', ['sound', 'letter', 'grapheme', 'segment']],
    ['Word patterns', 'notice and apply reliable spelling patterns', ['pattern', 'vowel', 'consonant', 'syllable']],
    ['Prefixes and suffixes', 'use meaningful word parts to build and spell words', ['prefix', 'suffix', 'root', 'meaning']],
    ['Common exception words', 'read, practise and use important words with unusual spellings', ['exception', 'common', 'memory', 'check']],
    ['Word origins', 'use word families, roots and origins to support spelling', ['origin', 'etymology', 'family', 'morpheme']],
    ['Proofreading', 'spot, explain and correct spelling errors independently', ['proofread', 'dictionary', 'edit', 'accuracy']],
  ],
  Science: [
    ['Working scientifically', 'ask questions, investigate fairly, observe, measure and use evidence', ['observe', 'measure', 'variable', 'conclusion']],
    ['Plants and ecosystems', 'explain how plants live and how organisms depend on habitats', ['plant', 'habitat', 'ecosystem', 'food chain']],
    ['Animals and the human body', 'describe body systems, life cycles, health and variation', ['organ', 'skeleton', 'nutrition', 'life cycle']],
    ['Materials and matter', 'compare materials and explain solids, liquids, gases and changes', ['material', 'property', 'state', 'reversible']],
    ['Forces and magnets', 'investigate pushes, pulls, friction, gravity and magnetism', ['force', 'friction', 'gravity', 'magnet']],
    ['Light and sound', 'explain how light and sound travel and are detected', ['reflection', 'shadow', 'vibration', 'pitch']],
    ['Electricity', 'build, represent and reason about simple electrical circuits', ['circuit', 'cell', 'conductor', 'switch']],
    ['Earth and space', 'describe Earth, weather, rocks and the solar system', ['Earth', 'orbit', 'rock', 'weather']],
  ],
  History: [
    ['Chronology', 'place people, periods and events in chronological order', ['timeline', 'period', 'century', 'chronology']],
    ['Historical evidence', 'ask questions and use sources to make supported claims about the past', ['source', 'evidence', 'artefact', 'interpretation']],
    ['Britain before 1066', 'explore change and continuity in prehistoric, Roman and early medieval Britain', ['prehistoric', 'Roman', 'Anglo-Saxon', 'Viking']],
    ['Ancient civilisations', 'compare achievements and evidence from early civilisations', ['civilisation', 'Egypt', 'empire', 'archaeology']],
    ['Local history', 'investigate how a local place changed over time', ['local', 'community', 'map', 'archive']],
    ['Monarchy, power and society', 'explain how leadership, law and everyday life changed', ['monarchy', 'parliament', 'law', 'society']],
    ['World history', 'connect significant world events, people and movements', ['global', 'trade', 'migration', 'conflict']],
    ['Historical interpretation', 'compare accounts and explain why interpretations can differ', ['account', 'viewpoint', 'bias', 'corroborate']],
  ],
  Geography: [
    ['Location knowledge', 'locate and describe important places using maps and spatial language', ['continent', 'country', 'region', 'location']],
    ['Place knowledge', 'compare the human and physical features of contrasting places', ['place', 'settlement', 'culture', 'landscape']],
    ['Weather and climate', 'observe weather and explain climate patterns', ['weather', 'climate', 'temperature', 'rainfall']],
    ['Rivers, coasts and landscapes', 'explain how physical processes shape land and water', ['river', 'coast', 'erosion', 'deposition']],
    ['Population and settlements', 'investigate how and why people live and move in different places', ['population', 'urban', 'rural', 'migration']],
    ['Resources and sustainability', 'explore resources, environmental change and responsible choices', ['resource', 'energy', 'sustainable', 'environment']],
    ['Map and fieldwork skills', 'collect fieldwork evidence and use maps, scale, symbols and coordinates', ['fieldwork', 'scale', 'symbol', 'grid reference']],
    ['Global connections', 'explain how trade, travel and decisions connect places', ['trade', 'network', 'interdependence', 'globalisation']],
  ],
  Computing: [
    ['Algorithms', 'design and explain clear step-by-step solutions', ['algorithm', 'sequence', 'instruction', 'debug']],
    ['Programming', 'create, test and improve programs using suitable constructs', ['code', 'input', 'output', 'loop']],
    ['Data and information', 'collect, organise, represent and interpret digital data', ['data', 'table', 'database', 'visualisation']],
    ['Computer systems', 'explain how hardware, software and networks work together', ['hardware', 'software', 'network', 'internet']],
    ['Digital creativity', 'select digital tools to create and communicate', ['media', 'design', 'edit', 'audience']],
    ['Online safety', 'protect privacy, recognise risk and seek trusted help online', ['privacy', 'password', 'consent', 'report']],
  ],
  'Design & Technology': [
    ['User and purpose', 'identify a user, need and clear design criteria', ['user', 'purpose', 'criteria', 'research']],
    ['Ideas and communication', 'develop and communicate design ideas', ['sketch', 'annotate', 'model', 'prototype']],
    ['Materials and tools', 'choose and use materials, tools and techniques safely', ['material', 'tool', 'join', 'finish']],
    ['Mechanisms and structures', 'build and improve structures, mechanisms or systems', ['structure', 'mechanism', 'strength', 'movement']],
    ['Food and nutrition', 'prepare food safely and understand ingredients and nutrition', ['ingredient', 'nutrition', 'hygiene', 'recipe']],
    ['Evaluate and improve', 'test a product against criteria and make improvements', ['test', 'evaluate', 'feedback', 'improve']],
  ],
  'Art & Design': [
    ['Drawing', 'observe closely and develop control, line, tone and form', ['line', 'tone', 'shape', 'form']],
    ['Colour and painting', 'mix, select and apply colour for purpose and expression', ['primary', 'secondary', 'shade', 'contrast']],
    ['Pattern and print', 'create and refine repeated visual patterns', ['pattern', 'repeat', 'print', 'texture']],
    ['Sculpture and making', 'explore materials to create three-dimensional work', ['sculpture', 'form', 'texture', 'balance']],
    ['Artists and cultures', 'respond to art from different times, places and traditions', ['artist', 'culture', 'style', 'context']],
    ['Portfolio and critique', 'record ideas, reflect on choices and improve work', ['sketchbook', 'develop', 'critique', 'refine']],
  ],
  Music: [
    ['Pulse and rhythm', 'perform and create steady pulse and rhythmic patterns', ['pulse', 'rhythm', 'beat', 'rest']],
    ['Pitch and melody', 'recognise, perform and create changes in pitch', ['pitch', 'melody', 'high', 'low']],
    ['Listening and appraisal', 'listen closely and describe musical features and effect', ['listen', 'instrument', 'texture', 'mood']],
    ['Singing and performance', 'sing and perform with control, confidence and expression', ['voice', 'breath', 'ensemble', 'expression']],
    ['Composition', 'organise musical ideas and record or communicate them', ['compose', 'notation', 'motif', 'structure']],
    ['Music traditions and technology', 'explore musical traditions and use technology responsibly', ['tradition', 'genre', 'record', 'digital']],
  ],
  PE: [
    ['Movement skills', 'develop balance, coordination, agility and control', ['balance', 'coordination', 'agility', 'control']],
    ['Games and teamwork', 'apply skills, tactics, communication and fair play in games', ['teamwork', 'tactic', 'pass', 'fair play']],
    ['Dance', 'create, remember and perform movement sequences', ['sequence', 'rhythm', 'space', 'expression']],
    ['Gymnastics', 'link controlled actions using balance, travel and rotation', ['balance', 'travel', 'rotation', 'landing']],
    ['Athletics', 'develop running, jumping and throwing technique', ['speed', 'distance', 'technique', 'personal best']],
    ['Health and safety', 'prepare for activity and explain how movement supports health', ['warm-up', 'cool-down', 'heart rate', 'safety']],
  ],
  RE: [
    ['Beliefs and questions', 'explore how religious and non-religious worldviews answer important questions', ['belief', 'worldview', 'meaning', 'evidence']],
    ['Sacred stories and texts', 'interpret stories and texts within their traditions', ['sacred', 'text', 'interpret', 'tradition']],
    ['Worship and practice', 'describe and compare ways people express belief', ['worship', 'prayer', 'practice', 'community']],
    ['Festivals and belonging', 'explain how festivals and communities express identity and values', ['festival', 'belonging', 'symbol', 'celebration']],
    ['Ethics and action', 'discuss reasons for moral choices with respect for difference', ['ethics', 'choice', 'justice', 'responsibility']],
    ['Dialogue and reflection', 'ask thoughtful questions and compare viewpoints respectfully', ['dialogue', 'respect', 'similarity', 'difference']],
  ],
  PSHE: [
    ['Feelings and wellbeing', 'recognise emotions and use safe strategies to support wellbeing', ['emotion', 'wellbeing', 'calm', 'support']],
    ['Relationships', 'build respectful relationships and understand boundaries and consent', ['respect', 'boundary', 'consent', 'trust']],
    ['Health and safety', 'make age-appropriate choices that support physical and mental health', ['healthy', 'risk', 'first aid', 'trusted adult']],
    ['Online life', 'communicate safely online and respond to harmful content or contact', ['online', 'privacy', 'report', 'block']],
    ['Money and work', 'understand choices about money, skills, work and aspirations', ['budget', 'save', 'work', 'goal']],
    ['Community and citizenship', 'contribute fairly and respectfully to groups and communities', ['community', 'rule', 'right', 'responsibility']],
  ],
  French: [
    ['Greetings and identity', 'listen, speak, read and write simple personal information in French', ['bonjour', 'salut', 'nom', 'âge']],
    ['Numbers and time', 'use French numbers, dates and time expressions', ['nombre', 'heure', 'jour', 'mois']],
    ['Family and friends', 'describe people and relationships in French', ['famille', 'ami', 'frère', 'sœur']],
    ['School and hobbies', 'communicate about school subjects and interests', ['école', 'matière', 'sport', 'musique']],
    ['Food and places', 'ask for and understand familiar food and place information', ['manger', 'boire', 'ville', 'magasin']],
    ['Stories and culture', 'respond to simple French songs, stories and cultural material', ['histoire', 'chanson', 'France', 'culture']],
  ],
  German: [
    ['Greetings and identity', 'listen, speak, read and write simple personal information in German', ['hallo', 'Name', 'Alter', 'wohnen']],
    ['Numbers and time', 'use German numbers, dates and time expressions', ['Zahl', 'Uhr', 'Tag', 'Monat']],
    ['Family and friends', 'describe people and relationships in German', ['Familie', 'Freund', 'Bruder', 'Schwester']],
    ['School and hobbies', 'communicate about school subjects and interests', ['Schule', 'Fach', 'Sport', 'Musik']],
    ['Food and places', 'ask for and understand familiar food and place information', ['essen', 'trinken', 'Stadt', 'Laden']],
    ['Stories and culture', 'respond to simple German songs, stories and cultural material', ['Geschichte', 'Lied', 'Deutschland', 'Kultur']],
  ],
};

const subjects = Object.fromEntries(
  Object.entries(subjectRows).map(([subject, strands]) => [
    subject,
    strands.map(([title, objective, vocabulary]) => ({ title, objective, vocabulary })),
  ]),
) as Record<CurriculumSubject, CurriculumStrand[]>;

const ageProgression: Record<CurriculumAgeGroup, { keyStage: string; lead: string; challenge: string }> = {
  '5-7': { keyStage: 'KS1', lead: 'Recognise, describe and use', challenge: 'with objects, pictures, talk and short examples' },
  '8-10': { keyStage: 'KS2', lead: 'Explain, apply and compare', challenge: 'with evidence, linked steps and independent examples' },
  '11-13': { keyStage: 'KS3', lead: 'Analyse, justify and evaluate', challenge: 'with precise vocabulary, alternatives and extended reasoning' },
};

const sequenceStages = [
  { name: 'Discover', strategy: 'Notice examples, activate prior knowledge and ask a useful question.' },
  { name: 'Model', strategy: 'Watch Archie model a clear example and explain each decision.' },
  { name: 'Practise', strategy: 'Try scaffolded examples and use feedback to correct misconceptions.' },
  { name: 'Apply', strategy: 'Use the idea in a game, real-life task, investigation or short composition.' },
  { name: 'Present and review', strategy: 'Explain the learning aloud, answer retrieval questions and choose a next step.' },
];

const durationPlans: Record<LessonDuration, number[]> = {
  15: [2, 3, 4, 4, 2],
  20: [3, 4, 5, 5, 3],
  30: [4, 6, 8, 8, 4],
  60: [5, 10, 15, 20, 10],
};

export const CURRICULUM_SUBJECTS = Object.freeze(Object.keys(subjects) as CurriculumSubject[]);

function slugify(value: string): string {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function rotate<T>(values: T[], offset: number): T[] {
  const safeOffset = offset % values.length;
  return [...values.slice(safeOffset), ...values.slice(0, safeOffset)];
}

function lessonQuestion(id: string, question: string, options: string[], answer: string, hint: string, explanation: string, difficulty: 1 | 2 | 3): LessonQuestion {
  return { id, question, options, answer, hint, explanation, simplerExplanation: explanation, difficulty };
}

function buildQuestions(subject: CurriculumSubject, strandIndex: number, ageGroup: CurriculumAgeGroup, day: number, objective: string, stageIndex: number): LessonQuestion[] {
  const strands = subjects[subject];
  const strand = strands[strandIndex];
  const objectiveOptions = rotate(strands.map((item) => item.objective), day).slice(0, 4);
  if (!objectiveOptions.includes(strand.objective)) objectiveOptions[0] = strand.objective;
  const vocabularyOptions = rotate(strands.flatMap((item) => item.vocabulary), day + stageIndex).filter((term, index, all) => all.indexOf(term) === index);
  const vocabularyAnswer = strand.vocabulary[(day + stageIndex) % strand.vocabulary.length];
  const selectedVocabulary = vocabularyOptions.filter((term) => term !== vocabularyAnswer).slice(0, 3);
  selectedVocabulary.push(vocabularyAnswer);
  const stageOptions = rotate(sequenceStages.map((stage) => stage.strategy), day).slice(0, 4);
  const stageAnswer = sequenceStages[stageIndex].strategy;
  if (!stageOptions.includes(stageAnswer)) stageOptions[0] = stageAnswer;
  const difficulty = ageGroup === '5-7' ? 1 : ageGroup === '8-10' ? 2 : 3;

  return [
    lessonQuestion(`day-${day}-focus`, `Which learning goal matches today’s ${subject} lesson?`, rotate(objectiveOptions, day + strandIndex), strand.objective, 'Listen for the goal Archie introduced.', `Today’s goal is to ${objective}.`, difficulty),
    lessonQuestion(`day-${day}-word`, `Which word belongs to “${strand.title}”?`, rotate(selectedVocabulary, day), vocabularyAnswer, `It is one of today’s key words: ${strand.vocabulary.join(', ')}.`, `${vocabularyAnswer} is useful vocabulary for ${strand.title}.`, difficulty),
    lessonQuestion(`day-${day}-strategy`, `What is the best strategy for today’s “${sequenceStages[stageIndex].name}” stage?`, rotate(stageOptions, stageIndex), stageAnswer, 'Think about what Archie asked you to do in this stage.', stageAnswer, difficulty),
  ];
}

export function buildDailyCurriculumLesson({
  subject,
  ageGroup,
  day,
  durationMinutes = 30,
}: {
  subject: CurriculumSubject;
  ageGroup: CurriculumAgeGroup;
  day: number;
  durationMinutes?: LessonDuration;
}): DailyCurriculumLesson {
  const safeDay = Math.min(CURRICULUM_DAYS, Math.max(1, Math.trunc(day || 1)));
  const strands = subjects[subject];
  if (!strands) throw new Error(`Unsupported curriculum subject: ${subject}`);
  const blockIndex = Math.floor((safeDay - 1) / sequenceStages.length);
  const strandIndex = blockIndex % strands.length;
  const spiral = Math.floor(blockIndex / strands.length) + 1;
  const stageIndex = (safeDay - 1) % sequenceStages.length;
  const strand = strands[strandIndex];
  const stage = sequenceStages[stageIndex];
  const progression = ageProgression[ageGroup];
  const objective = `${progression.lead} ${strand.objective} ${progression.challenge}`;
  const minutes = durationPlans[durationMinutes];
  const phaseNames = ['Connect', 'Archie teaches', 'Practise together', 'Independent challenge', 'Present and reflect'];
  const phaseActivities = [
    `Retrieve earlier ${strand.title.toLowerCase()} learning and share one question.`,
    `Archie models ${strand.title.toLowerCase()} using spoken explanation, captions and a worked example.`,
    `Complete guided ${subject} examples with hints, immediate feedback and one misconception check.`,
    `${stage.strategy} Use spiral challenge ${spiral} at an age-appropriate level.`,
    `Give a short class-style presentation, answer the exit check and choose confident / nearly there / need help.`,
  ];

  return {
    id: `year:${slugify(subject)}:${ageGroup}:day-${String(safeDay).padStart(3, '0')}`,
    subject,
    topic: slugify(strand.title),
    ageGroup,
    title: `${subject} Day ${safeDay}: ${strand.title} — ${stage.name}`,
    explanation: `Today Archie will help you ${objective}. This is spiral ${spiral}, so familiar ideas return with a little more challenge.`,
    simplerExplanation: `We will learn ${strand.title.toLowerCase()} one small step at a time. You can listen, read, point, type or ask Archie to repeat.`,
    examples: [
      `${progression.keyStage} curriculum-informed focus: ${strand.objective}.`,
      `Archie model: say what you notice, show one example, then explain why it works.`,
      `Presentation prompt: “Today I learned… My evidence or example is…”`,
    ],
    questions: buildQuestions(subject, strandIndex, ageGroup, safeDay, objective, stageIndex),
    lessonDay: safeDay,
    week: Math.ceil(safeDay / 7),
    durationMinutes,
    sequenceStage: stage.name,
    curriculumRef: `${progression.keyStage} curriculum-informed planning reference: ${CURRICULUM_SOURCE_URL}`,
    reviewStatus: 'curriculum-informed-teacher-review-required',
    lessonPhases: phaseNames.map((name, index) => ({ name, minutes: minutes[index], activity: phaseActivities[index] })),
    accessibility: {
      dyslexia: 'Offer read-aloud, short chunks, extra spacing, repeatable instructions and reduced copying.',
      autism: 'Show a predictable now/next sequence, allow processing time, offer a low-sensory view and avoid forced eye contact.',
      colourVision: 'Never rely on colour alone; pair every colour with a label, symbol, pattern or spoken cue.',
      deafOrHardOfHearing: 'Provide captions, written instructions, visual turn-taking cues and a complete transcript.',
      blindOrLowVision: 'Keep keyboard and screen-reader order logical; describe visuals aloud and provide tactile or verbal alternatives.',
    },
  };
}

export function buildCurriculumYear(subject: CurriculumSubject, ageGroup: CurriculumAgeGroup, durationMinutes: LessonDuration = 30): DailyCurriculumLesson[] {
  return Array.from({ length: CURRICULUM_DAYS }, (_, index) => buildDailyCurriculumLesson({ subject, ageGroup, day: index + 1, durationMinutes }));
}
