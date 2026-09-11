export type LearningArenaSubject = 'maths' | 'spelling' | 'reading' | 'science';

export interface LearningArenaQuestion {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface LearningArenaConfig {
  slug: string;
  title: string;
  emoji: string;
  subject: LearningArenaSubject;
  ageGroups: string[];
  description: string;
  actionPrompt: string;
  actionEmoji: string;
  actionSuccess: string;
  actionTryAgain: string;
  targets: string[];
  questions: LearningArenaQuestion[] | ((round: number, level: number) => LearningArenaQuestion);
}

function rotateOptions(options: string[], seed: number): string[] {
  const offset = seed % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}

function numericOptions(answer: number, step: number, seed: number, suffix = ''): string[] {
  const values = [answer, answer + step, Math.max(0, answer - step), answer + step * 2];
  return rotateOptions([...new Set(values)].map((value) => `${value}${suffix}`), seed);
}

function timesTableQuestion(round: number, level: number): LearningArenaQuestion {
  const tables = level <= 1 ? [2, 5, 10] : level <= 3 ? [2, 3, 4, 5, 6, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const first = tables[(round + level - 1) % tables.length];
  const second = 2 + ((round * 3 + level) % (level >= 4 ? 11 : 9));
  const answer = first * second;
  return {
    prompt: `What is ${first} times ${second}?`,
    options: numericOptions(answer, first, round + level),
    answer: String(answer),
    explanation: `${first} groups of ${second} make ${answer}.`,
  };
}

function shopkeeperQuestion(round: number, level: number): LearningArenaQuestion {
  const prices = level <= 2 ? [35, 42, 58, 65, 73, 84, 91, 47] : [125, 175, 230, 265, 340, 415, 550, 625];
  const price = prices[round % prices.length];
  const paid = level <= 2 ? 100 : Math.ceil(price / 500) * 500;
  const answer = paid - price;
  const money = (pence: number) => pence >= 100 ? `£${(pence / 100).toFixed(2)}` : `${pence}p`;
  const distractors = [answer, answer + 10, Math.max(5, answer - 10), answer + 20].map(money);
  return {
    prompt: `An item costs ${money(price)}. The customer pays ${money(paid)}. How much change?`,
    options: rotateOptions([...new Set(distractors)], round + level),
    answer: money(answer),
    explanation: `${money(paid)} minus ${money(price)} is ${money(answer)}.`,
  };
}

function clockQuestion(round: number, level: number): LearningArenaQuestion {
  const minutes = level <= 1 ? [0, 30, 0, 30, 0, 30, 0, 30] : level <= 3 ? [0, 15, 30, 45, 5, 20, 35, 50] : [7, 13, 22, 28, 37, 43, 52, 58];
  const hour = 1 + ((round * 2 + level) % 11);
  const minute = minutes[round % minutes.length];
  const digital = `${hour}:${String(minute).padStart(2, '0')}`;
  const alternatives = [
    digital,
    `${hour}:${String((minute + 15) % 60).padStart(2, '0')}`,
    `${(hour % 12) + 1}:${String(minute).padStart(2, '0')}`,
    `${hour}:${String((minute + 30) % 60).padStart(2, '0')}`,
  ];
  return {
    prompt: `The hour hand points to ${hour}, and the minute hand shows ${minute} minutes. What is the digital time?`,
    options: rotateOptions([...new Set(alternatives)], round + level),
    answer: digital,
    explanation: `The time is ${digital}.`,
  };
}

function trainQuestion(round: number, level: number): LearningArenaQuestion {
  const journeys = level <= 2
    ? [[9, 10, 9, 35], [10, 15, 10, 50], [11, 20, 12, 0], [13, 5, 13, 45]]
    : [[8, 47, 9, 32], [10, 38, 11, 26], [12, 55, 14, 7], [15, 43, 17, 18]];
  const [startHour, startMinute, endHour, endMinute] = journeys[round % journeys.length];
  const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  const display = (minutes: number) => minutes >= 60
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    : `${minutes} minutes`;
  return {
    prompt: `A train leaves at ${startHour}:${String(startMinute).padStart(2, '0')} and arrives at ${endHour}:${String(endMinute).padStart(2, '0')}. How long is the journey?`,
    options: rotateOptions([duration, duration + 10, Math.max(5, duration - 10), duration + 20].map(display), round + level),
    answer: display(duration),
    explanation: `Counting forward from departure to arrival gives ${display(duration)}.`,
  };
}

const grammarQuestions: LearningArenaQuestion[] = [
  { prompt: 'Which sentence uses a capital letter and full stop correctly?', options: ['the dog ran.', 'The dog ran.', 'The dog ran', 'the Dog ran.'], answer: 'The dog ran.', explanation: 'A sentence starts with a capital letter and ends with punctuation.' },
  { prompt: 'Choose the best word: Sam ___ the ball into the basket.', options: ['throw', 'threw', 'throwing', 'throws yesterday'], answer: 'threw', explanation: '“Threw” is the past tense of “throw”.' },
  { prompt: 'Which word is an adjective in “The quick player jumped”?', options: ['The', 'quick', 'player', 'jumped'], answer: 'quick', explanation: '“Quick” describes the player, so it is an adjective.' },
  { prompt: 'Which sentence is a question?', options: ['Pass the ball.', 'What a shot!', 'Did it go in?', 'The team scored.'], answer: 'Did it go in?', explanation: 'A direct question ends with a question mark.' },
  { prompt: 'Pick the noun in “Archie practises carefully.”', options: ['Archie', 'practises', 'carefully', 'the'], answer: 'Archie', explanation: 'Archie is a name, which is a proper noun.' },
  { prompt: 'Which word joins the ideas: “I trained ___ I improved”?', options: ['because', 'blue', 'quickly', 'team'], answer: 'because', explanation: '“Because” is a conjunction that explains a reason.' },
  { prompt: 'Choose the correctly punctuated list.', options: ['balls hoops and bibs', 'balls, hoops and bibs', 'balls hoops, and bibs', 'Balls hoops and, bibs'], answer: 'balls, hoops and bibs', explanation: 'Commas separate items in a list.' },
  { prompt: 'Which is written in the present tense?', options: ['Mia passed.', 'Mia will pass.', 'Mia passes.', 'Mia had passed.'], answer: 'Mia passes.', explanation: '“Passes” describes an action happening in the present.' },
];

const spellingQuestions: LearningArenaQuestion[] = [
  { prompt: 'Which spelling is correct?', options: ['becos', 'because', 'beacause', 'becouse'], answer: 'because', explanation: 'The correct spelling is b-e-c-a-u-s-e.' },
  { prompt: 'Choose the correctly spelled sports word.', options: ['team', 'teem', 'teim', 'tiem'], answer: 'team', explanation: 'Team is spelled t-e-a-m.' },
  { prompt: 'Which word correctly completes: “The player was ___ the ball”?', options: ['catching', 'cathing', 'catchhing', 'catcing'], answer: 'catching', explanation: 'Keep “catch” and add “ing”: catching.' },
  { prompt: 'Choose the correct spelling.', options: ['exercise', 'excercise', 'exersize', 'excersise'], answer: 'exercise', explanation: 'Exercise is spelled e-x-e-r-c-i-s-e.' },
  { prompt: 'Which word has a silent letter?', options: ['net', 'knee', 'run', 'ball'], answer: 'knee', explanation: 'The “k” in knee is silent.' },
  { prompt: 'Choose the correct plural of “match”.', options: ['matchs', 'matches', 'matchies', 'match'], answer: 'matches', explanation: 'Words ending in “ch” usually add “es”.' },
  { prompt: 'Which spelling is correct?', options: ['practice', 'practisee', 'practiss', 'practece'], answer: 'practice', explanation: 'The noun “practice” is spelled with “ice” at the end.' },
  { prompt: 'Choose the word with two double letters.', options: ['successful', 'succesful', 'successfull', 'sucessful'], answer: 'successful', explanation: 'Successful has double c and double s.' },
];

const scienceQuestions: LearningArenaQuestion[] = [
  { prompt: 'Which force slows a rolling ball?', options: ['friction', 'light', 'sound', 'electricity'], answer: 'friction', explanation: 'Friction acts against movement and slows the ball.' },
  { prompt: 'Which material is attracted to a magnet?', options: ['iron', 'wood', 'glass', 'rubber'], answer: 'iron', explanation: 'Iron is a magnetic material.' },
  { prompt: 'What do plants need to make food?', options: ['light', 'plastic', 'metal', 'wool'], answer: 'light', explanation: 'Plants use light energy during photosynthesis.' },
  { prompt: 'Which organ pumps blood around the body?', options: ['heart', 'lungs', 'stomach', 'skin'], answer: 'heart', explanation: 'The heart pumps blood around the body.' },
  { prompt: 'What state of matter is water vapour?', options: ['gas', 'solid', 'liquid', 'plasma'], answer: 'gas', explanation: 'Water vapour is water in its gas state.' },
  { prompt: 'Which planet do we live on?', options: ['Earth', 'Mars', 'Venus', 'Jupiter'], answer: 'Earth', explanation: 'Our home planet is Earth.' },
  { prompt: 'What helps us hear sounds?', options: ['ears', 'eyes', 'tongue', 'fingers'], answer: 'ears', explanation: 'Our ears detect sound vibrations.' },
  { prompt: 'Which is a healthy way to protect your body?', options: ['wear a helmet', 'skip sleep', 'never drink water', 'ignore pain'], answer: 'wear a helmet', explanation: 'A correctly fitted helmet helps protect your head.' },
];

const clinicQuestions: LearningArenaQuestion[] = [
  { prompt: 'Which professional helps care for patients in a hospital or clinic?', options: ['nurse', 'pilot', 'builder', 'chef'], answer: 'nurse', explanation: 'Nurses provide skilled care and support to patients.' },
  { prompt: 'What should you do before touching a clean dressing?', options: ['wash hands', 'play outside', 'eat a snack', 'touch the floor'], answer: 'wash hands', explanation: 'Clean hands reduce the spread of germs.' },
  { prompt: 'Which part of the body helps you breathe?', options: ['lungs', 'knees', 'elbows', 'teeth'], answer: 'lungs', explanation: 'The lungs take oxygen into the body.' },
  { prompt: 'If someone is seriously hurt, what should a child do first?', options: ['tell a trusted adult', 'hide it', 'guess a medicine', 'leave them alone'], answer: 'tell a trusted adult', explanation: 'A trusted adult can get the right help. Children should never guess medicines.' },
  { prompt: 'What does a thermometer measure?', options: ['temperature', 'height', 'speed', 'sound'], answer: 'temperature', explanation: 'A thermometer measures temperature.' },
  { prompt: 'Which habit helps keep teeth healthy?', options: ['brush twice daily', 'only eat sweets', 'never visit a dentist', 'share toothbrushes'], answer: 'brush twice daily', explanation: 'Brushing with fluoride toothpaste twice daily helps protect teeth.' },
  { prompt: 'Why does the body need sleep?', options: ['rest and recovery', 'to stop growing', 'to avoid water', 'to forget learning'], answer: 'rest and recovery', explanation: 'Sleep supports recovery, learning and healthy growth.' },
  { prompt: 'Which item may be used to listen to a heartbeat?', options: ['stethoscope', 'telescope', 'compass', 'paintbrush'], answer: 'stethoscope', explanation: 'A stethoscope helps a clinician listen to body sounds.' },
];

export const learningArenaConfigs: Record<string, LearningArenaConfig> = {
  'football-times-tables': {
    slug: 'football-times-tables', title: 'Football Times Tables', emoji: '⚽', subject: 'maths', ageGroups: ['5–7', '8–10', '11–13'],
    description: 'Answer a times-table question, then choose where to place your shot.',
    actionPrompt: 'Pick a part of the goal and take your shot!', actionEmoji: '⚽', actionSuccess: 'GOAL! Brilliant placement!', actionTryAgain: 'Great shot — the keeper saved it!',
    targets: ['Top left', 'Top centre', 'Top right', 'Bottom left', 'Bottom centre', 'Bottom right'], questions: timesTableQuestion,
  },
  'basketball-grammar': {
    slug: 'basketball-grammar', title: 'Basketball Grammar', emoji: '🏀', subject: 'reading', ageGroups: ['8–10', '11–13'],
    description: 'Solve a grammar question to earn a basketball shot.',
    actionPrompt: 'Choose your shooting position!', actionEmoji: '🏀', actionSuccess: 'Swish! Nothing but net!', actionTryAgain: 'Off the rim — good attempt!',
    targets: ['Left wing', 'Free-throw line', 'Right wing', 'Left corner', 'Centre court', 'Right corner'], questions: grammarQuestions,
  },
  'netball-spelling': {
    slug: 'netball-spelling', title: 'Netball Spelling', emoji: '🏐', subject: 'spelling', ageGroups: ['5–7', '8–10', '11–13'],
    description: 'Choose the correct spelling to unlock a netball shot.',
    actionPrompt: 'Choose where to stand in the shooting circle!', actionEmoji: '🏐', actionSuccess: 'Goal! What a confident shot!', actionTryAgain: 'So close — keep practising!',
    targets: ['Circle left', 'Near post', 'Circle right', 'Baseline left', 'Centre', 'Baseline right'], questions: spellingQuestions,
  },
  'pool-science': {
    slug: 'pool-science', title: 'Pool Science', emoji: '🎱', subject: 'science', ageGroups: ['8–10', '11–13'],
    description: 'Answer a science question to earn one pool shot.',
    actionPrompt: 'Choose a pocket for your shot!', actionEmoji: '🎱', actionSuccess: 'Potted! Excellent aim!', actionTryAgain: 'It rattled the pocket — nearly!',
    targets: ['Top left', 'Top middle', 'Top right', 'Bottom left', 'Bottom middle', 'Bottom right'], questions: scienceQuestions,
  },
  'shopkeeper-change': {
    slug: 'shopkeeper-change', title: 'Shopkeeper Change', emoji: '🏪', subject: 'maths', ageGroups: ['5–7', '8–10', '11–13'],
    description: 'Work out the correct change, serve customers and build confidence with UK money.',
    actionPrompt: 'Choose a friendly way to finish the sale!', actionEmoji: '🧾', actionSuccess: 'Customer served — till balanced!', actionTryAgain: 'Sale complete — remember to check the receipt!',
    targets: ['Give receipt', 'Count change aloud', 'Pack the bag', 'Say thank you', 'Check the till', 'Invite next customer'], questions: shopkeeperQuestion,
  },
  'clock-quest': {
    slug: 'clock-quest', title: 'Clock Quest', emoji: '🕰️', subject: 'maths', ageGroups: ['5–7', '8–10', '11–13'],
    description: 'Read clock clues and choose the matching digital time.',
    actionPrompt: 'Choose what Archie should do on time!', actionEmoji: '⏰', actionSuccess: 'Right on time!', actionTryAgain: 'Good plan — check the time again!',
    targets: ['Start class', 'Catch the bus', 'Eat lunch', 'Football practice', 'Read a book', 'Get ready for bed'], questions: clockQuestion,
  },
  'train-timetable': {
    slug: 'train-timetable', title: 'Train Timetable', emoji: '🚆', subject: 'maths', ageGroups: ['8–10', '11–13'],
    description: 'Read departure and arrival times to keep the railway running.',
    actionPrompt: 'Choose the next safe railway task!', actionEmoji: '🎟️', actionSuccess: 'All aboard — the service is on time!', actionTryAgain: 'Good check — safety comes first!',
    targets: ['Check tickets', 'Read platform sign', 'Help a passenger', 'Check the clock', 'Make announcement', 'Close the gate'], questions: trainQuestion,
  },
  'clinic-science': {
    slug: 'clinic-science', title: 'Clinic Science', emoji: '🩺', subject: 'science', ageGroups: ['5–7', '8–10', '11–13'],
    description: 'Learn safe body and health facts while helping at Archie’s pretend clinic.',
    actionPrompt: 'Choose a kind, safe way to help!', actionEmoji: '💚', actionSuccess: 'Kind care — patient reassured!', actionTryAgain: 'Good thinking — ask a trusted adult too!',
    targets: ['Listen carefully', 'Wash hands', 'Get a trusted adult', 'Offer a seat', 'Write a care note', 'Speak kindly'], questions: clinicQuestions,
  },
};

export function getLearningArenaQuestion(slug: string, round: number, level: number): LearningArenaQuestion {
  const config = learningArenaConfigs[slug];
  if (!config) throw new Error(`Unknown learning arena: ${slug}`);
  const source = config.questions;
  return typeof source === 'function' ? source(round, level) : source[(round + level - 1) % source.length];
}

export function learningArenaActionSucceeds(slug: string, round: number, targetIndex: number): boolean {
  const slugScore = [...slug].reduce((total, character) => total + character.charCodeAt(0), 0);
  return (slugScore + round * 2 + targetIndex) % 4 !== 0;
}
