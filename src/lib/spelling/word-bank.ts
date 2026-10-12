/**
 * Age-banded spelling word bank (British English).
 *
 * Sources:
 *  - Year 1: phonics examples and common exception words from the England
 *    national curriculum English programmes of study, spelling appendix
 *    (single letters "a" and "I" are left out because they cannot be dictated
 *    fairly). Simple CVC words come from the original Spelling Bee pool.
 *  - Year 2: the Year 2 common exception words (abbreviations "Mr"/"Mrs" left out).
 *  - Years 3–4: the full statutory Years 3–4 word list (with listed variants).
 *  - Years 5–6: the full statutory Years 5–6 word list.
 *  - Years 7–9: no statutory list exists; a short curated set of literacy terms
 *    and commonly misspelt KS3 words (including the original "expert" pool words
 *    that are not already in the primary lists).
 *
 * Within a band, stages are ordered from more familiar/regular words to harder
 * ones. Words that sound like another word (homophones) carry a sentence so a
 * dictated question is never ambiguous.
 */

export type BandId = 'y1' | 'y2' | 'y3-4' | 'y5-6' | 'y7-9';

export interface WordSpec {
  word: string;
  /** Sentence read and shown with the word; required for homophones. */
  sentence?: string;
  /** Short word-specific tip shown in hints and on the results screen. */
  tip?: string;
}

export interface StageSpec {
  title: string;
  /** Pattern explanation used when a word has no specific tip. */
  tip: string;
  words: (string | WordSpec)[];
}

export interface BandSpec {
  id: BandId;
  label: string;
  years: number[];
  stages: StageSpec[];
}

export interface SpellingWord {
  /** Stable id, e.g. "y3-4:separate". Never reuse an id for another word. */
  id: string;
  word: string;
  band: BandId;
  stage: number;
  sentence?: string;
  tip: string;
}

const s = (word: string, sentence: string, tip?: string): WordSpec => ({ word, sentence, tip });
const t = (word: string, tip: string): WordSpec => ({ word, tip });

export const BAND_SPECS: BandSpec[] = [
  {
    id: 'y1', label: 'Year 1', years: [1],
    stages: [
      { title: 'Short sound-it-out words', tip: 'Say each sound slowly, then write one letter for each sound.',
        words: ['cat', 'dog', 'hat', 'run', 'big', s('red', 'My coat is red.'), 'cup', 'map', 'bed', 'hop'] },
      { title: 'Double letters and sound pairs', tip: 'Some sounds use two letters together, like sh, ch, th, ng, ck, ll, ff and ss.',
        words: ['off', 'well', 'miss', 'buzz', 'back', 'bank', 'think', 'ship', 'chip', 'thing', 'much', 'fish'] },
      { title: 'Tricky words 1', tip: 'Tricky words do not follow the usual sound rules. Look, say, cover, write and check.',
        words: [s('the', 'The sun is hot.'), 'do', s('to', 'We walk to school.', 'This "to" means going towards something.'), 'today', s('of', 'A cup of milk.'), 'said', 'says', 'are', 'were', 'was', 'is', 'his', 'has'] },
      { title: 'Tricky words 2', tip: 'Many short tricky words end in a letter that says its own name, like he, me and go.',
        words: [s('you', 'Can you help me?'), 'your', 'they', s('be', 'I will be quiet.', 'This "be" has no extra letters.'), 'he', 'me', 'she', 'we', s('no', 'No, thank you.'), 'go', s('so', 'I am so happy.'), s('by', 'Sit by me.'), 'my'] },
      { title: 'Tricky words 3', tip: 'Spot the tricky part of each word and practise that part.',
        words: [s('here', 'Come over here.'), s('there', 'The cat is over there.', 'This "there" means a place.'), s('where', 'Where is my bag?'), 'love', 'come', s('some', 'Can I have some?'), s('one', 'I have one sister.', 'One sounds like "won" but is spelt o-n-e.'), 'once', 'ask', t('friend', 'Remember: a friend is there to the END.'), t('school', 'School has a silent h after the c.'), 'put', 'push', 'pull', 'full', 'house', s('our', 'This is our house.')] },
      { title: 'Days of the week', tip: 'Days of the week always start with a capital letter and end in "day".',
        words: [t('Monday', 'Monday sounds like "mun" but is spelt with an o.'), 'Tuesday', t('Wednesday', 'Say it in parts to remember: Wed-nes-day.'), 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    ],
  },
  {
    id: 'y2', label: 'Year 2', years: [2],
    stages: [
      { title: 'oor, ind and ild words', tip: 'In words like find and child, the i says its own name.',
        words: ['door', 'floor', s('poor', 'The poor dog was cold.'), s('find', 'I cannot find my shoe.'), 'kind', 'mind', 'behind', 'child', 'children', 'wild', t('climb', 'Climb has a silent b at the end.')] },
      { title: 'old and long o words', tip: 'In words like cold and most, the o says its own name.',
        words: ['most', 'only', 'both', 'old', 'cold', 'gold', 'hold', s('told', 'Mum told me a story.'), 'every', 'everybody', 'even'] },
      { title: 'Surprising ea and a', tip: 'Here "ea" can say "ay", and "a" can say "ar" as in fast and grass.',
        words: [s('great', 'We had a great day.'), s('break', 'Do not break the glass.'), s('steak', 'Dad cooked steak for tea.'), 'pretty', 'after', 'fast', 'last', s('past', 'We walked past the shop.'), s('father', 'My father is tall.'), 'class', 'grass', 'pass'] },
      { title: 'Unusual sounds', tip: 'These words hide a surprise: a silent h, an o that says "oo", or "ou" that says "u".',
        words: ['plant', 'path', 'bath', s('hour', 'The film lasts one hour.', 'Hour has a silent h.'), 'move', 'prove', 'improve', s('sure', 'Are you sure?'), 'sugar', s('eye', 'I have something in my eye.'), s('could', 'I could see the sea.', 'could, should and would all have "oul".'), 'should', s('would', 'Would you like a drink?')] },
      { title: 'Tricky Year 2 words', tip: 'Spot the tricky part of each word and practise that part.',
        words: ['who', s('whole', 'I ate the whole apple.', 'Whole (all of it) starts with wh.'), 'any', 'many', s('clothes', 'I put my clothes on.'), 'busy', t('people', 'People has a silent o: pe-o-ple.'), 'water', 'again', 'half', 'money', 'parents', t('Christmas', 'Christmas starts with a capital letter and has a silent t.'), t('because', 'Big elephants can always understand small elephants.'), t('beautiful', 'Beautiful starts with "beau".')] },
    ],
  },
  {
    id: 'y3-4', label: 'Years 3–4', years: [3, 4],
    stages: [
      { title: 'Everyday words', tip: 'Break the word into syllables and check each part.',
        words: [t('answer', 'Answer has a silent w.'), 'arrive', t('build', 'Build has "ui" in the middle.'), 'busy', 'early', 'earth', s('eight', 'I am eight years old.', 'Eight (the number) has "eigh".'), 'fruit', 'group', s('heard', 'I heard a noise.', 'You hear with your EAR: h-EAR-d.'), 'heart', 'learn'] },
      { title: 'Hidden letters', tip: 'Some words hide a silent letter or an unusual vowel pair. Say it as it is spelt to help.',
        words: [t('guard', 'Guard has a silent u after the g.'), 'guide', t('island', 'Island has a silent s.'), 'often', 'promise', 'quarter', 'question', 'recent', 'regular', 'strange', 'suppose', 'notice'] },
      { title: 'Sounds alike, spelt differently', tip: 'Listen to the sentence to choose the right spelling.',
        words: ['address', 'appear', s('breath', 'Take a deep breath.', 'Breath (the noun) has no e at the end.'), s('breathe', 'Breathe in slowly.', 'Breathe (the verb) ends in e.'), s('caught', 'I caught the ball.'), 'circle', 'decide', 'describe', 'enough', 'famous', 'height', s('weight', 'Check the weight of the bag.', 'Weight uses "eigh" like eight.')] },
      { title: 'Building longer words', tip: 'Longer words are easier in chunks. Say each syllable as you write it.',
        words: ['actual', t('believe', 'Never believe a lie: bel-IE-ve.'), t('bicycle', 'Bi means two: bi-cycle has two wheels.'), t('centre', 'British spelling ends in -re.'), 'century', 'certain', 'complete', 'consider', 'continue', s('forward', 'Step forward, please.'), 'imagine', 'increase'] },
      { title: 'Tricky middles', tip: 'The middle of a word is often where mistakes hide. Say every syllable clearly.',
        words: ['calendar', 'different', 'difficult', t('disappear', 'dis + appear: one s, two p.'), 'exercise', 'extreme', t('favourite', 'British spelling keeps the u: fav-our-ite.'), t('February', 'Feb-ru-ary: remember the first r.'), t('grammar', 'Grammar ends in -ar, not -er.'), 'history', 'important', 'interest'] },
      { title: 'Endings and syllables', tip: 'Watch the ending: -ary, -al, -ite, -ion.',
        words: [t('library', 'Say lib-RAR-y to remember both r letters.'), 'material', 'medicine', 'mention', s('minute', 'Wait one minute.'), 'natural', 'naughty', 'opposite', 'ordinary', 'perhaps', 'popular', 'position'] },
      { title: 'Double letters and word families', tip: 'Look for the root word, then add the prefix or suffix.',
        words: [t('accident', 'Accident has a double c.'), 'business', t('eighth', 'Eighth is eight + h.'), 'experience', 'experiment', t('knowledge', 'know + ledge: silent k and a d before ge.'), 'length', t('occasion', 'Two c letters, one s.'), 'particular', 'peculiar', t('possess', 'Possess has two sets of double s.'), 'possession'] },
      { title: 'Tricky statutory words', tip: 'Find the tricky part of each word and practise that part.',
        words: ['possible', 'potatoes', 'pressure', 'probably', 'purpose', s('reign', 'The queen had a long reign.', 'Reign (a king or queen rules) has "eig" and a silent g.'), 'remember', 'sentence', t('separate', 'There is "a rat" in sep-a-rate.'), 'special', 'straight', 'strength'] },
      { title: 'ough and adverbs', tip: '"ough" makes different sounds. For adverbs, add -ly to the whole word: actual + ly.',
        words: ['surprise', 'therefore', 'though', 'although', 'thought', s('through', 'We walked through the park.'), 'various', 'woman', 'women', t('accidentally', 'accidental + ly = accidentally.'), t('actually', 'actual + ly = actually.'), t('occasionally', 'occasional + ly = occasionally.')] },
    ],
  },
  {
    id: 'y5-6', label: 'Years 5–6', years: [5, 6],
    stages: [
      { title: 'Silent and unusual letters', tip: 'Spot silent or unexpected letters and say the word as it is spelt.',
        words: ['average', 'ancient', t('forty', 'Forty has no u, unlike four.'), s('muscle', 'I pulled a muscle in my leg.', 'Muscle has a silent c.'), 'shoulder', 'soldier', t('stomach', 'Stomach ends in -ach.'), s('symbol', 'A heart is a symbol of love.'), 'system', 'vegetable'] },
      { title: 'Building on root words', tip: 'Find the root word you know, then add the extra parts.',
        words: ['according', 'attached', 'available', 'bargain', 'bruise', 'category', 'develop', 'dictionary', 'familiar', 'language'] },
      { title: 'Endings to watch', tip: 'Listen to the end of the word: -ent, -ly, -ion, -al.',
        words: [t('achieve', 'i before e: ach-IE-ve.'), 'amateur', 'awkward', 'determined', 'excellent', 'explanation', 'frequently', 'identity', 'individual', 'physical'] },
      { title: 'Double consonants', tip: 'Double letters often come after a short vowel, or where a prefix joins a root.',
        words: ['apparent', 'appreciate', 'communicate', 'community', 'competition', t('definite', 'Definite contains "finite".'), 'desperate', 'interfere', t('interrupt', 'inter + rupt: two r letters.'), 'persuade'] },
      { title: 'Tricky vowel patterns', tip: 'Some vowels are spelt in unusual ways. Look carefully at ei, ie and ue.',
        words: ['aggressive', 'curiosity', 'equipment', 'especially', 'existence', t('foreign', 'Foreign has "eig" with a silent g.'), t('leisure', 'Leisure has "ei".'), s('lightning', 'We saw lightning in the storm.', 'Lightning (the flash) has no e.'), t('neighbour', 'British spelling keeps the u: neigh-bour.'), s('queue', 'We waited in a queue.', 'Queue: q then "ueue".')] },
      { title: 'Hidden sounds', tip: 'Some sounds are spelt with sc, ci or ise. Say the word in syllables.',
        words: ['cemetery', t('conscience', 'con + science.'), 'conscious', 'controversy', 'convenience', 'correspond', t('criticise', 'British spelling uses -ise.'), t('environment', 'Hear the n: enviro-N-ment.'), t('government', 'Govern + ment: keep the n.'), t('recognise', 'British spelling uses -ise.')] },
      { title: 'Tricky Year 5–6 words 1', tip: 'Find the tricky part of each word and practise that part.',
        words: ['hindrance', t('immediately', 'Double m: im + mediate + ly.'), t('marvellous', 'British spelling doubles the l.'), 'nuisance', 'occupy', 'occur', 'opportunity', t('parliament', 'Parliament has a hidden "ia".'), 'prejudice', 'privilege'] },
      { title: 'Tricky Year 5–6 words 2', tip: 'Break the word into chunks and check each chunk.',
        words: ['profession', s('programme', 'We watched a television programme.', 'British spelling for a show is programme.'), t('pronunciation', 'Pronounce changes to pronunciation: no o after the n.'), t('recommend', 'One c, two m.'), 'relevant', 'restaurant', s('rhyme', 'Cat and hat rhyme.'), t('rhythm', 'Rhythm Helps Your Two Hips Move.'), 'sacrifice', 'secretary'] },
      { title: 'Tricky Year 5–6 words 3', tip: 'Break the word into chunks and check each chunk.',
        words: ['signature', 'sincerely', 'sufficient', 'suggest', 'temperature', 'thorough', t('twelfth', 'twelve becomes twelfth: keep the f sound.'), 'variety', 'vehicle', t('yacht', 'Yacht has a silent "ch".')] },
      { title: 'The trickiest doubles', tip: 'Count the double letters carefully before you write.',
        words: [t('accommodate', 'Two c and two m.'), 'accompany', t('committee', 'Double m, double t, double e.'), 'disastrous', t('embarrass', 'Two r and two s.'), t('exaggerate', 'Double g.'), 'guarantee', t('harass', 'One r, two s.'), 'mischievous', t('necessary', 'One collar (c) and two sleeves (ss).')] },
    ],
  },
  {
    id: 'y7-9', label: 'Years 7–9', years: [7, 8, 9],
    stages: [
      { title: 'Grammar and literacy terms', tip: 'These words describe how language works. Spot the root you already know.',
        words: ['adjective', 'adverb', 'paragraph', 'pronoun', 'preposition', 'conjunction', 'apostrophe', 'punctuation', 'vocabulary', 'metaphor'] },
      { title: 'Common words, careful endings', tip: 'Check endings such as -ment, -sion and -ful.',
        words: ['argument', t('beginning', 'Double n before -ing.'), 'chocolate', 'decision', 'evidence', 'happened', t('receive', 'i before e except after c.'), 'success', t('successful', 'Two c, two s, one l.'), 'tomorrow'] },
      { title: 'Analysis words', tip: 'Many of these words come from Greek or Latin; learn the chunks.',
        words: [t('analyse', 'British spelling uses -yse.'), 'analysis', 'appearance', 'atmosphere', 'audience', 'benefit', 'conclusion', 'consequence', 'technique', 'tongue'] },
      { title: 'Language devices', tip: 'Say the word slowly in syllables, then check unusual letter groups.',
        words: ['alliteration', 'personification', 'simile', t('onomatopoeia', 'on-o-mat-o-poe-ia.'), t('playwright', 'A playwright makes (wrights) plays.'), 'soliloquy', 'persuasive', t('humorous', 'Humour drops its u in humorous.'), 'glamorous', t('weird', 'Weird breaks the i before e rule.')] },
      { title: 'Prefixes and doubled endings', tip: 'Add prefixes without changing the root; double the last consonant when the stress stays on it.',
        words: ['definitely', 'disappoint', 'discipline', 'fascinating', 'financial', 'independent', 'irrelevant', 'maintenance', 'preferred', 'referred'] },
      { title: 'Commonly misspelt words 1', tip: 'Count double letters and spot silent letters.',
        words: ['accommodation', 'achievement', 'acquire', 'colleague', t('column', 'Column has a silent n.'), 'committed', 'conscientious', 'embarrassment', 'harassment', 'hierarchy'] },
      { title: 'Commonly misspelt words 2', tip: 'Find the tricky part of each word and practise that part.',
        words: ['irresistible', 'knowledgeable', 'liaise', t('millennium', 'Double l and double n.'), 'miniature', t('occurrence', 'Double c, double r.'), 'questionnaire', 'reference', 'unnecessary', 'hypocrisy'] },
    ],
  },
];

const ALL_WORDS: SpellingWord[] = BAND_SPECS.flatMap(band => band.stages.flatMap((stage, stageIndex) =>
  stage.words.map(entry => {
    const spec: WordSpec = typeof entry === 'string' ? { word: entry } : entry;
    return { id: `${band.id}:${spec.word.toLowerCase()}`, word: spec.word, band: band.id, stage: stageIndex, sentence: spec.sentence, tip: spec.tip ?? stage.tip };
  })));

const BY_ID = new Map(ALL_WORDS.map(w => [w.id, w]));

export function allWords(): readonly SpellingWord[] { return ALL_WORDS; }
export function getWord(id: string): SpellingWord | undefined { return BY_ID.get(id); }
export function bandSpec(band: BandId): BandSpec { return BAND_SPECS.find(b => b.id === band)!; }
export function wordsInBand(band: BandId): SpellingWord[] { return ALL_WORDS.filter(w => w.band === band); }
export function wordsInStage(band: BandId, stage: number): SpellingWord[] { return ALL_WORDS.filter(w => w.band === band && w.stage === stage); }
export function stageCount(band: BandId): number { return bandSpec(band).stages.length; }

/** Years 1–9 map to their own curriculum band. Unknown values fall back to the Archie default (Year 4). */
export function bandForYear(year: number): BandId {
  const y = Number.isInteger(year) && year >= 1 && year <= 9 ? year : 4;
  return BAND_SPECS.find(b => b.years.includes(y))!.id;
}
