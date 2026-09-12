/** The island menu owns subject mappings; never send an unrelated island to Science. */
export const ISLANDS = [
  { id: 'maths', name: 'Maths', icon: '🔢', description: 'Number puzzles, racing and counting adventures.', games: [
    ['Times Table Race', '/games/times-table-race', '🏎️'], ['Number Pop', '/games/number-pop', '🎈'], ['Fraction Pizza', '/games/fraction-pizza', '🍕'],
  ] },
  { id: 'english', name: 'English', icon: '📖', description: 'Explore stories, sentences and the meaning of words.', games: [
    ['Story Builder', '/games/story-builder', '📚'], ['Reading Quest', '/games/reading-quest', '🗺️'], ['Sentence Scramble', '/games/sentence-scramble', '✍️'],
  ] },
  { id: 'science', name: 'Science', icon: '🔬', description: 'Discover plants, space, materials and the natural world.', games: [
    ['Science Lab', '/games/science-lab', '🧪'], ['Animal Habitats', '/games/animal-habitats', '🐾'], ['Solar System', '/games/solar-system', '🪐'],
  ] },
  { id: 'history', name: 'History', icon: '🏰', description: 'Investigate the past in a History treasure challenge.', games: [] },
  { id: 'geography', name: 'Geography', icon: '🌍', description: 'Travel through maps, oceans and places around the world.', games: [
    ['Geography Quiz', '/games/geography-quiz', '🗺️'], ['UK Geography', '/games/geography-uk', '🧭'],
  ] },
  { id: 'pe', name: 'PE', icon: '⚽', description: 'Try a sports-knowledge challenge and sports-themed learning games.', games: [
    ['Football Times Tables', '/games/football-times-tables', '⚽'], ['Basketball Grammar', '/games/basketball-grammar', '🏀'], ['Netball Spelling', '/games/netball-spelling', '🏐'],
  ] },
  { id: 'technology', name: 'Technology', icon: '💻', description: 'Solve computing, sequencing and digital-safety puzzles.', games: [] },
  { id: 'french', name: 'French', icon: '🇫🇷', description: 'Practise everyday French words in a treasure challenge.', games: [] },
  { id: 'german', name: 'German', icon: '🇩🇪', description: 'Practise everyday German words in a treasure challenge.', games: [] },
  { id: 'spelling', name: 'Spelling', icon: '🐝', description: 'Play with letters, sounds and correctly spelled words.', games: [
    ['Spelling Bee', '/games/spelling-bee', '🐝'], ['Word Scramble', '/games/word-scramble', '🔤'], ['Word Wizard', '/games/word-wizard', '🪄'],
  ] },
] as const;

export type IslandId = (typeof ISLANDS)[number]['id'];
export function isIslandId(value: unknown): value is IslandId {
  return typeof value === 'string' && ISLANDS.some(island => island.id === value);
}
export function islandRoute(id: IslandId): string { return `/game-islands?island=${id}`; }

type QuestionSeed = readonly [prompt: string, answer: string, wrong1: string, wrong2: string];
/** Starter practice banks. Each round has ten unique questions, not a full curriculum. */
export const ISLAND_QUESTIONS: Record<IslandId, readonly QuestionSeed[]> = {
  maths: [
    ['What is 3 + 4?', '7', '6', '8'], ['What is 12 − 5?', '7', '5', '9'],
    ['What is 4 × 3?', '12', '7', '16'], ['What is 20 ÷ 5?', '4', '5', '10'],
    ['What is half of 18?', '9', '6', '12'], ['How many sides has a triangle?', '3', '4', '5'],
    ['What comes next: 5, 10, 15, ...?', '20', '16', '25'], ['Which number is even?', '14', '13', '15'],
    ['What is 10 more than 32?', '42', '33', '52'], ['What is one quarter of 12?', '3', '4', '6'],
  ],
  english: [
    ['Which word names an animal?', 'rabbit', 'quickly', 'under'], ['Which word is an action?', 'jump', 'blue', 'table'],
    ['Which word describes a noun?', 'sparkly', 'run', 'because'], ['Which mark usually ends a question?', 'Question mark', 'Comma', 'Full stop'],
    ['What is the opposite of happy?', 'sad', 'glad', 'cheerful'], ['Which word means nearly the same as small?', 'tiny', 'huge', 'wide'],
    ['Who writes a book?', 'An author', 'A reader', 'A character'], ['What is a story setting?', 'Where and when a story happens', 'Only its title', 'The number of pages'],
    ['Which word joins these ideas: I was cold ... I wore a coat?', 'so', 'or', 'but'], ['Which is a complete sentence?', 'The dog ran home.', 'A very big', 'Under the'],
  ],
  science: [
    ['Which part of a plant takes up water from the soil?', 'Roots', 'Petals', 'Fruit'], ['What is frozen water called?', 'Ice', 'Steam', 'Sand'],
    ['Which star is closest to Earth?', 'The Sun', 'Sirius', 'Polaris'], ['Which animal is a mammal?', 'Dolphin', 'Trout', 'Butterfly'],
    ['Which object is attracted to a magnet?', 'An iron nail', 'A wooden spoon', 'A plastic cup'], ['Which sense uses our ears?', 'Hearing', 'Smell', 'Taste'],
    ['What do caterpillars become?', 'Butterflies or moths', 'Frogs', 'Beetles'], ['What force pulls objects towards Earth?', 'Gravity', 'Sound', 'Light'],
    ['Which material is usually transparent?', 'Clear glass', 'Wood', 'Brick'], ['Which is a source of light?', 'A lit torch', 'A mirror alone', 'An unlit candle'],
  ],
  history: [
    ['What does a historian study?', 'The past', 'Only tomorrow', 'Only outer space'], ['Which helps us put past events in order?', 'A timeline', 'A shopping list', 'A weather forecast'],
    ['Which river was important to ancient Egypt?', 'The Nile', 'The Thames', 'The Amazon'], ['What were ancient Egyptian rulers called?', 'Pharaohs', 'Astronauts', 'Mayors'],
    ['What is an archaeologist most likely to study?', 'Objects and remains from the past', 'Tomorrow’s weather', 'Only modern traffic'], ['What was a castle moat?', 'A ditch around a castle', 'A type of crown', 'A royal dining table'],
    ['In which year did the Great Fire of London start?', '1666', '1066', '1966'], ['What was the Roman name for London?', 'Londinium', 'Pompeii', 'Athens'],
    ['What is a museum?', 'A place that cares for and displays collections', 'Only a sports pitch', 'Only a supermarket'], ['Which is a source made at the time of an event?', 'A diary written that day', 'A story invented centuries later', 'A future prediction'],
  ],
  geography: [
    ['What does a compass help you find?', 'Direction', 'Your age', 'The date'], ['Which is an ocean?', 'Pacific', 'Sahara', 'Himalayas'],
    ['What is an island?', 'Land surrounded by water', 'Water surrounded by land', 'A very tall building'], ['What is the capital of France?', 'Paris', 'Berlin', 'Rome'],
    ['Which continent is Egypt in?', 'Africa', 'Europe', 'South America'], ['What does a map key explain?', 'The map’s symbols', 'Only the weather', 'How old you are'],
    ['Which direction is opposite north?', 'South', 'East', 'West'], ['What is the capital of Scotland?', 'Edinburgh', 'Cardiff', 'Belfast'],
    ['What is a river mouth?', 'Where a river flows into another body of water', 'Where every river begins', 'A bridge across a river'], ['Which is a human-made feature?', 'A bridge', 'A mountain', 'A beach'],
  ],
  pe: [
    ['Which sport uses a bat, wickets and a ball?', 'Cricket', 'Swimming', 'Basketball'], ['Which sport uses a shuttlecock?', 'Badminton', 'Football', 'Rugby'],
    ['What is fair play?', 'Following rules and respecting others', 'Cheating to win', 'Leaving others out'], ['Which skill helps you stand on one leg?', 'Balance', 'Spelling', 'Drawing'],
    ['Which sport has goals and a goalkeeper?', 'Football', 'Gymnastics', 'Long jump'], ['What is a relay race?', 'A team race with runners taking turns', 'A race with no finish', 'A swimming lesson only'],
    ['What should you do when a referee stops play?', 'Stop and listen', 'Ignore the whistle', 'Push another player'], ['Which activity involves moving through water?', 'Swimming', 'Cycling', 'Running'],
    ['What does teamwork involve?', 'Helping and listening to your team', 'Never sharing', 'Ignoring everyone'], ['Which sport involves throwing a ball through a raised hoop?', 'Basketball', 'Tennis', 'Hockey'],
  ],
  technology: [
    ['What is an algorithm?', 'A clear sequence of instructions', 'A type of battery', 'A computer screen'], ['What is debugging?', 'Finding and fixing errors', 'Deleting every file', 'Painting a computer'],
    ['Which device is used to type?', 'Keyboard', 'Speaker', 'Monitor'], ['What does a loop do in a program?', 'Repeats instructions', 'Always deletes the program', 'Changes the keyboard colour'],
    ['Which should you keep private?', 'Your password', 'A made-up story', 'A drawing of a tree'], ['What should you do about a message that worries you?', 'Tell a trusted adult', 'Keep it secret', 'Share your password'],
    ['Which is an output device?', 'Speaker', 'Keyboard', 'Mouse'], ['Why do we save a file?', 'To keep our work', 'To break the screen', 'To turn off the internet'],
    ['What is a robot sensor used for?', 'Detecting information about its surroundings', 'Only decorating the robot', 'Writing every program'], ['What is a sequence?', 'Steps in a particular order', 'Steps with no order', 'Only one colour'],
  ],
  french: [
    ['What does bonjour mean?', 'Hello', 'Goodbye', 'Thank you'], ['What does merci mean?', 'Thank you', 'Please', 'Good night'],
    ['What does oui mean?', 'Yes', 'No', 'Maybe'], ['What does non mean?', 'No', 'Yes', 'Hello'],
    ['What does chat mean in French?', 'Cat', 'Dog', 'Bird'], ['What does chien mean?', 'Dog', 'Cat', 'Fish'],
    ['What colour is rouge?', 'Red', 'Blue', 'Green'], ['What colour is bleu?', 'Blue', 'Yellow', 'Red'],
    ['What number is trois?', '3', '2', '4'], ['What does au revoir mean?', 'Goodbye', 'Good morning', 'Please'],
  ],
  german: [
    ['What does hallo mean?', 'Hello', 'Goodbye', 'Thank you'], ['What does danke mean?', 'Thank you', 'Good night', 'Hello'],
    ['What does ja mean?', 'Yes', 'No', 'Maybe'], ['What does nein mean?', 'No', 'Yes', 'Please'],
    ['What does Katze mean?', 'Cat', 'Dog', 'Bird'], ['What does Hund mean?', 'Dog', 'Fish', 'Cat'],
    ['What colour is rot?', 'Red', 'Blue', 'Green'], ['What colour is blau?', 'Blue', 'Yellow', 'Red'],
    ['What number is drei?', '3', '2', '4'], ['What does guten Morgen mean?', 'Good morning', 'Goodbye', 'Thank you'],
  ],
  spelling: [
    ['Which is spelled correctly?', 'because', 'becaus', 'becose'], ['Which is spelled correctly?', 'friend', 'freind', 'frend'],
    ['Which is spelled correctly?', 'school', 'scool', 'shcool'], ['Which is spelled correctly?', 'people', 'peple', 'peopel'],
    ['Which is spelled correctly?', 'little', 'littel', 'litle'], ['Which is spelled correctly?', 'where', 'wher', 'whear'],
    ['Which word rhymes with light?', 'night', 'leaf', 'late'], ['Which word rhymes with cake?', 'lake', 'cat', 'coat'],
    ['Which is the plural of box?', 'boxes', 'boxs', 'boxies'], ['Which is the plural of baby?', 'babies', 'babys', 'babyes'],
  ],
};

export interface IslandQuestion { id: string; prompt: string; answer: string; choices: string[] }
export function shuffled<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createIslandRound(id: IslandId, random: () => number = Math.random): IslandQuestion[] {
  const questions = ISLAND_QUESTIONS[id].map(([prompt, answer, ...wrong], index) => ({
    id: `${id}-${index}`, prompt, answer, choices: shuffled([answer, ...wrong], random),
  }));
  return shuffled(questions, random).slice(0, 10);
}

export interface RoundState { questions: IslandQuestion[]; index: number; score: number; selected: string | null; complete: boolean }
export function beginRound(questions: IslandQuestion[]): RoundState {
  return { questions, index: 0, score: 0, selected: null, complete: questions.length === 0 };
}
/** Pure transitions make repeated taps and duplicate speech results harmless. */
export function chooseAnswer(state: RoundState, choice: string): RoundState {
  const question = state.questions[state.index];
  if (state.complete || state.selected !== null || !question?.choices.includes(choice)) return state;
  return { ...state, selected: choice, score: state.score + Number(choice === question.answer) };
}
export function nextQuestion(state: RoundState): RoundState {
  if (state.complete || state.selected === null) return state;
  return state.index + 1 >= state.questions.length
    ? { ...state, complete: true }
    : { ...state, index: state.index + 1, selected: null };
}
