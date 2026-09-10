import { sql } from 'drizzle-orm';
import { db } from '@/server/db/client';

type AgeBand = '5-7' | '8-10' | '11-13';

type LessonTemplate = {
  subject: 'maths' | 'english' | 'history';
  topic: string;
  title: string;
  ageBand: AgeBand;
  curriculumRef: string;
  objective: string;
  vocabulary: string[];
  warmup: string[];
  teach: string[];
  guided: string[];
  independent: string[];
  quiz: Array<{ q: string; a: string }>;
  recap: string[];
};

const ancientEgyptKnowledge = [
  ['ancient-egypt-overview', 'history', 'ancient-egypt', 'all', 'Who were the Ancient Egyptians?', 'The Ancient Egyptians were people who lived along the River Nile in north-east Africa for thousands of years. Their civilisation built cities, temples and pyramids, used hieroglyphic writing, farmed the Nile valley and was ruled for long periods by pharaohs.'],
  ['ancient-egypt-nile', 'history', 'ancient-egypt', 'all', 'Why was the River Nile important?', 'The Nile provided water, fertile soil, food, transport and trade routes. Its yearly flooding left rich silt on nearby fields, helping farmers grow crops such as wheat and barley.'],
  ['ancient-egypt-pharaoh', 'history', 'ancient-egypt', 'all', 'What was a pharaoh?', 'A pharaoh was the ruler of ancient Egypt. Pharaohs were political and religious leaders, made laws, led armies, ordered major building projects and were believed to have a special relationship with the gods.'],
  ['ancient-egypt-pyramids', 'history', 'ancient-egypt', 'all', 'Why did Egyptians build pyramids?', 'Many pyramids were built as monumental tombs for pharaohs. Egyptians believed in an afterlife, so royal burials included objects thought to be useful after death.'],
  ['ancient-egypt-giza', 'history', 'ancient-egypt', 'all', 'What is the Great Pyramid of Giza?', 'The Great Pyramid at Giza was built for Pharaoh Khufu during the Old Kingdom. It is the largest of the Giza pyramids and was made from millions of stone blocks.'],
  ['ancient-egypt-mummies', 'history', 'ancient-egypt', 'all', 'Why did Egyptians make mummies?', 'Mummification preserved a dead body because many Egyptians believed the body was important for the afterlife. The process could involve drying the body with natron, wrapping it in linen and placing it in a coffin.'],
  ['ancient-egypt-hieroglyphs', 'history', 'ancient-egypt', 'all', 'What are hieroglyphs?', 'Hieroglyphs are a writing system used in ancient Egypt. Signs could represent sounds, words or ideas and were written on monuments, tombs, papyrus and other surfaces.'],
  ['ancient-egypt-scribes', 'history', 'ancient-egypt', 'all', 'What did scribes do?', 'Scribes were trained readers and writers who kept records, wrote letters, recorded taxes and helped the government and temples. Their work was important because most people could not read or write.'],
  ['ancient-egypt-tutankhamun', 'history', 'ancient-egypt', 'all', 'Who was Tutankhamun?', 'Tutankhamun was a young pharaoh of Egypt’s New Kingdom. He became famous in modern times because Howard Carter’s team discovered his tomb in the Valley of the Kings in 1922 with many objects still inside.'],
  ['ancient-egypt-howard-carter', 'history', 'ancient-egypt', 'all', 'Who was Howard Carter?', 'Howard Carter was a British archaeologist who led the excavation that discovered Tutankhamun’s tomb in 1922. The discovery greatly increased modern interest in ancient Egypt.'],
  ['ancient-egypt-cleopatra', 'history', 'ancient-egypt', 'all', 'Who was Cleopatra VII?', 'Cleopatra VII was the last active ruler of the Ptolemaic Kingdom of Egypt. She lived much later than the pyramid builders and was connected politically with Julius Caesar and Mark Antony.'],
  ['ancient-egypt-gods', 'history', 'ancient-egypt', 'all', 'Which gods did Ancient Egyptians worship?', 'Ancient Egyptians worshipped many gods and goddesses, including Ra, Osiris, Isis, Horus and Anubis. Different gods were associated with ideas such as the sun, kingship, protection, death and rebirth.'],
  ['ancient-egypt-anubis', 'history', 'ancient-egypt', 'all', 'Who was Anubis?', 'Anubis was an ancient Egyptian god associated with embalming, cemeteries and care of the dead. He was often shown with the head of a jackal.'],
  ['ancient-egypt-ra', 'history', 'ancient-egypt', 'all', 'Who was Ra?', 'Ra was an important ancient Egyptian sun god. He was often shown with a sun disk and was linked with the daily journey of the sun across the sky.'],
  ['ancient-egypt-osiris', 'history', 'ancient-egypt', 'all', 'Who was Osiris?', 'Osiris was a god associated with the dead, rebirth and the afterlife. Stories about Osiris, Isis and Horus were important parts of ancient Egyptian religion.'],
  ['ancient-egypt-daily-life', 'history', 'ancient-egypt', 'all', 'What was daily life like in Ancient Egypt?', 'Most people lived in farming communities or towns. Families worked, cooked, made clothes and tools, cared for children, worshipped gods and took part in festivals. Life varied greatly between farmers, craftspeople, officials, priests and the wealthy.'],
  ['ancient-egypt-food', 'history', 'ancient-egypt', 'all', 'What did Ancient Egyptians eat?', 'Common foods included bread, onions, dates, figs, vegetables and fish. Barley and wheat were important crops. Wealthier people could have a wider variety of meat and other foods.'],
  ['ancient-egypt-houses', 'history', 'ancient-egypt', 'all', 'What were Ancient Egyptian houses made from?', 'Many homes were built from mud bricks made with Nile mud and plant material. Flat roofs could provide extra living or working space in the hot, dry climate.'],
  ['ancient-egypt-clothes', 'history', 'ancient-egypt', 'all', 'What clothes did Ancient Egyptians wear?', 'Linen was a common fabric because flax grew in Egypt. Clothing was generally light for the hot climate, although style and quality depended on a person’s wealth and status.'],
  ['ancient-egypt-farming', 'history', 'ancient-egypt', 'all', 'How did Ancient Egyptians farm?', 'Farmers used the Nile’s water and fertile floodplain to grow crops. They used tools, irrigation channels and seasonal knowledge to plant and harvest crops such as wheat, barley, flax and vegetables.'],
  ['ancient-egypt-boats', 'history', 'ancient-egypt', 'all', 'Why were boats important in Ancient Egypt?', 'The Nile was a major transport route. Boats moved people, stone, food and trade goods between settlements and building sites.'],
  ['ancient-egypt-trade', 'history', 'ancient-egypt', 'all', 'What did Ancient Egypt trade?', 'Egypt traded goods such as grain, linen and crafted objects and imported resources including timber, metals, incense and luxury materials from neighbouring regions.'],
  ['ancient-egypt-papyrus', 'history', 'ancient-egypt', 'all', 'What was papyrus?', 'Papyrus was a plant that grew near the Nile. Egyptians used it to make writing material and also used the plant for items such as baskets, mats and boats.'],
  ['ancient-egypt-rosetta-stone', 'history', 'ancient-egypt', 'all', 'Why is the Rosetta Stone important?', 'The Rosetta Stone contains the same decree written in different scripts, including Greek and Egyptian scripts. It helped scholars such as Jean-François Champollion understand how to read ancient Egyptian hieroglyphs.'],
  ['ancient-egypt-valley-kings', 'history', 'ancient-egypt', 'all', 'What is the Valley of the Kings?', 'The Valley of the Kings is an area near ancient Thebes where many New Kingdom rulers were buried in rock-cut tombs, including Tutankhamun.'],
  ['ancient-egypt-temples', 'history', 'ancient-egypt', 'all', 'What were temples used for?', 'Temples were religious centres dedicated to gods and goddesses. Priests carried out rituals there, and large temple estates also played important economic and administrative roles.'],
  ['ancient-egypt-calendar', 'history', 'ancient-egypt', 'all', 'How did Egyptians use a calendar?', 'Ancient Egyptians developed calendars linked to seasons, farming and the movement of the sun and stars. A civil calendar of 365 days was used for administration.'],
  ['ancient-egypt-maths', 'history', 'ancient-egypt', 'all', 'Did Ancient Egyptians use maths?', 'Yes. Egyptians used arithmetic and geometry for trade, building, measuring land, taxation and practical problems. Surviving papyri show examples of their mathematical methods.'],
  ['ancient-egypt-medicine', 'history', 'ancient-egypt', 'all', 'What did Ancient Egyptians know about medicine?', 'Ancient Egyptian medical texts describe treatments for injuries and illnesses using observation, bandaging, medicines and religious practices. Some remedies were practical while others reflected beliefs of the time.'],
  ['ancient-egypt-timeline', 'history', 'ancient-egypt', 'all', 'When did Ancient Egyptian civilisation exist?', 'Ancient Egyptian civilisation lasted for more than three thousand years. Early dynastic rule began around 3100 BCE, while Egypt became part of the Roman Empire in 30 BCE.'],
] as const;

const mathsTopics: Record<AgeBand, Array<[string, string, string, string[]]>> = {
  '5-7': [
    ['number-to-100', 'Numbers to 100', 'Read, write, compare and order numbers up to 100.', ['number', 'digit', 'tens', 'ones', 'greater', 'less']],
    ['addition-subtraction', 'Addition and Subtraction', 'Use number facts and strategies to add and subtract within 100.', ['add', 'subtract', 'sum', 'difference', 'number line']],
    ['place-value', 'Place Value', 'Understand tens and ones in two-digit numbers.', ['place value', 'tens', 'ones', 'partition']],
    ['multiplication-groups', 'Equal Groups and Multiplication', 'Recognise equal groups and connect them to multiplication.', ['groups', 'times', 'multiply', 'array']],
    ['division-sharing', 'Sharing and Division', 'Share and group objects equally.', ['share', 'group', 'divide', 'equal']],
    ['fractions-halves-quarters', 'Halves and Quarters', 'Recognise and find halves and quarters of shapes and amounts.', ['half', 'quarter', 'whole', 'equal parts']],
    ['money', 'Money', 'Recognise UK coins and notes and solve simple money problems.', ['pence', 'pounds', 'coin', 'change']],
    ['time', 'Time', 'Tell the time to the hour, half hour and quarter hour.', ['hour', 'minute', 'clock', 'quarter past', 'half past']],
    ['measure', 'Length, Mass and Capacity', 'Compare and measure everyday quantities.', ['centimetre', 'metre', 'gram', 'kilogram', 'litre']],
    ['shapes', '2D and 3D Shapes', 'Name common shapes and describe their properties.', ['side', 'corner', 'face', 'edge', 'vertex']],
  ],
  '8-10': [
    ['place-value-1000000', 'Place Value to 1,000,000', 'Read, compare, round and partition large whole numbers.', ['place value', 'digit', 'round', 'partition', 'million']],
    ['four-operations', 'Four Operations', 'Use efficient written and mental methods for addition, subtraction, multiplication and division.', ['operation', 'estimate', 'inverse', 'remainder']],
    ['times-tables', 'Multiplication Facts', 'Recall and apply multiplication and division facts up to 12 × 12.', ['factor', 'multiple', 'product', 'quotient']],
    ['fractions', 'Fractions', 'Compare, order, add and subtract fractions in age-appropriate contexts.', ['numerator', 'denominator', 'equivalent', 'mixed number']],
    ['decimals', 'Decimals', 'Understand tenths, hundredths and thousandths and connect decimals to fractions.', ['decimal', 'tenths', 'hundredths', 'thousandths']],
    ['percentages', 'Percentages', 'Understand percentages as parts per hundred and solve simple percentage problems.', ['percent', 'hundred', 'fraction', 'decimal']],
    ['measurement', 'Measurement and Conversion', 'Convert common metric units and solve measurement problems.', ['length', 'mass', 'capacity', 'convert']],
    ['area-perimeter', 'Area and Perimeter', 'Calculate perimeter and area of rectangles and compound rectilinear shapes.', ['area', 'perimeter', 'square unit', 'rectangle']],
    ['angles', 'Angles', 'Identify, compare and calculate angles in shapes and turns.', ['acute', 'obtuse', 'right angle', 'degrees']],
    ['data', 'Statistics and Data', 'Read tables, charts and graphs and answer comparison questions.', ['data', 'table', 'bar chart', 'line graph', 'average']],
  ],
  '11-13': [
    ['integers', 'Integers and Number', 'Use positive and negative integers confidently in calculations and contexts.', ['integer', 'negative', 'absolute value', 'order']],
    ['algebra', 'Introduction to Algebra', 'Use symbols, expressions and simple equations to represent relationships.', ['variable', 'expression', 'equation', 'coefficient']],
    ['ratio', 'Ratio and Proportion', 'Use ratio notation and solve direct proportion problems.', ['ratio', 'proportion', 'scale', 'unitary method']],
    ['fractions-decimals-percent', 'Fractions, Decimals and Percentages', 'Convert between forms and solve multi-step percentage problems.', ['fraction', 'decimal', 'percentage', 'multiplier']],
    ['powers-roots', 'Powers and Roots', 'Understand squares, cubes, roots and index notation.', ['square', 'cube', 'root', 'index']],
    ['geometry', 'Geometry and Angles', 'Use angle facts and properties of triangles and quadrilaterals.', ['parallel', 'polygon', 'interior angle', 'bearing']],
    ['area-volume', 'Area, Surface Area and Volume', 'Calculate area and volume in common 2D and 3D shapes.', ['area', 'surface area', 'volume', 'prism']],
    ['coordinates', 'Coordinates and Graphs', 'Plot coordinates and interpret simple linear graphs.', ['coordinate', 'axis', 'gradient', 'graph']],
    ['probability', 'Probability', 'Describe and calculate simple probabilities.', ['probability', 'outcome', 'event', 'sample space']],
    ['statistics', 'Statistics', 'Calculate and interpret averages and represent data appropriately.', ['mean', 'median', 'mode', 'range']],
  ],
};

const englishTopics: Record<AgeBand, Array<[string, string, string, string[]]>> = {
  '5-7': [
    ['phonics', 'Phonics and Decoding', 'Blend sounds to read unfamiliar words and segment words for spelling.', ['phoneme', 'grapheme', 'blend', 'segment']],
    ['sentences', 'Building Sentences', 'Write clear sentences using capital letters, spaces and full stops.', ['sentence', 'capital letter', 'full stop', 'word']],
    ['nouns-verbs', 'Nouns and Verbs', 'Identify nouns and verbs and use them to build sentences.', ['noun', 'verb', 'action', 'name']],
    ['adjectives', 'Adjectives and Description', 'Choose adjectives to make descriptions precise and interesting.', ['adjective', 'describe', 'detail']],
    ['punctuation', 'Basic Punctuation', 'Use full stops, question marks and exclamation marks appropriately.', ['punctuation', 'question mark', 'exclamation mark']],
    ['story-sequence', 'Story Sequence', 'Retell and write events in a sensible order.', ['beginning', 'middle', 'end', 'sequence']],
    ['reading-retrieval', 'Finding Information', 'Retrieve simple facts from a short text.', ['retrieve', 'fact', 'text', 'clue']],
    ['inference', 'Simple Inference', 'Use clues in a text and pictures to explain how a character may feel.', ['inference', 'clue', 'feeling']],
    ['spelling-patterns', 'Spelling Patterns', 'Recognise common spelling patterns and apply them in writing.', ['spelling', 'pattern', 'suffix']],
    ['conjunctions', 'Joining Ideas', 'Use and, but, because and so to join ideas.', ['conjunction', 'and', 'but', 'because']],
  ],
  '8-10': [
    ['grammar-classes', 'Word Classes', 'Identify and use nouns, verbs, adjectives, adverbs, pronouns and determiners.', ['noun', 'verb', 'adjective', 'adverb', 'pronoun']],
    ['sentence-variety', 'Sentence Variety', 'Use different sentence structures for clarity and effect.', ['clause', 'main clause', 'subordinate clause', 'sentence']],
    ['punctuation-dialogue', 'Speech Punctuation', 'Punctuate direct speech accurately.', ['speech marks', 'comma', 'reporting clause']],
    ['paragraphs', 'Paragraphs and Cohesion', 'Organise related ideas into paragraphs and link them clearly.', ['paragraph', 'cohesion', 'topic sentence']],
    ['vocabulary', 'Powerful Vocabulary', 'Choose precise vocabulary and understand shades of meaning.', ['synonym', 'antonym', 'precision', 'context']],
    ['reading-inference', 'Reading Inference', 'Support inferences with evidence from a text.', ['inference', 'evidence', 'quotation', 'explain']],
    ['summarising', 'Summarising', 'Identify main ideas and summarise them concisely.', ['summary', 'main idea', 'key detail']],
    ['author-purpose', 'Author’s Purpose', 'Explain how language and structure influence a reader.', ['purpose', 'audience', 'effect', 'structure']],
    ['nonfiction', 'Non-fiction Writing', 'Plan and write an informative text with headings and clear organisation.', ['heading', 'subheading', 'fact', 'formal']],
    ['creative-writing', 'Creative Writing', 'Develop setting, character and plot using descriptive detail.', ['setting', 'character', 'plot', 'imagery']],
  ],
  '11-13': [
    ['sentence-control', 'Sentence Control', 'Use sentence structures deliberately for accuracy, fluency and effect.', ['syntax', 'clause', 'coordination', 'subordination']],
    ['advanced-punctuation', 'Advanced Punctuation', 'Use colons, semicolons, dashes and parentheses accurately.', ['colon', 'semicolon', 'dash', 'parenthesis']],
    ['analysis-language', 'Analysing Language', 'Explain how writers use language choices to shape meaning and response.', ['connotation', 'imagery', 'metaphor', 'effect']],
    ['analysis-structure', 'Analysing Structure', 'Explain how text structure guides a reader through ideas and events.', ['structure', 'focus', 'contrast', 'shift']],
    ['argument', 'Argument Writing', 'Build a reasoned argument with evidence and counterargument.', ['thesis', 'evidence', 'counterargument', 'conclusion']],
    ['transactional', 'Transactional Writing', 'Adapt form, tone and register for audience and purpose.', ['audience', 'purpose', 'register', 'tone']],
    ['narrative', 'Narrative Craft', 'Control viewpoint, pacing, setting and character in narrative writing.', ['viewpoint', 'pacing', 'motif', 'characterisation']],
    ['poetry', 'Understanding Poetry', 'Analyse imagery, sound, rhythm and form in poetry.', ['stanza', 'rhythm', 'alliteration', 'metaphor']],
    ['comparison', 'Comparing Texts', 'Compare writers’ ideas, methods and viewpoints using evidence.', ['compare', 'contrast', 'method', 'evidence']],
    ['editing', 'Editing and Accuracy', 'Edit writing for grammar, punctuation, spelling, vocabulary and cohesion.', ['proofread', 'edit', 'cohesion', 'accuracy']],
  ],
};

function mathsQuiz(topic: string, ageBand: AgeBand, variant: number) {
  const shift = variant * 3;
  if (ageBand === '5-7') {
    return [
      { q: `What is ${12 + shift} + ${7 + variant}?`, a: String(19 + shift + variant) },
      { q: `What is ${30 + shift} - ${8 + variant}?`, a: String(22 + shift - variant) },
      { q: 'Which is greater: 47 or 39?', a: '47' },
      { q: 'How many tens are in 64?', a: '6 tens' },
      { q: 'What is half of 18?', a: '9' },
      { q: 'How many pence are in £1?', a: '100 pence' },
      { q: 'How many minutes are in one hour?', a: '60 minutes' },
      { q: 'Name a shape with three sides.', a: 'Triangle' },
    ];
  }
  if (ageBand === '8-10') {
    return [
      { q: `Calculate ${240 + shift * 10} + ${175 + variant * 5}.`, a: String(415 + shift * 10 + variant * 5) },
      { q: `What is ${8 + variant} × 7?`, a: String((8 + variant) * 7) },
      { q: 'Write 0.75 as a fraction in simplest form.', a: '3/4' },
      { q: 'What is 25% of 80?', a: '20' },
      { q: 'Find the perimeter of a rectangle 8 cm by 5 cm.', a: '26 cm' },
      { q: 'How many degrees are in a right angle?', a: '90°' },
      { q: 'Round 4,768 to the nearest hundred.', a: '4,800' },
      { q: 'What is 3/5 of 40?', a: '24' },
    ];
  }
  return [
    { q: `Solve x + ${6 + variant} = ${19 + variant}.`, a: 'x = 13' },
    { q: 'Write 0.35 as a percentage.', a: '35%' },
    { q: 'Simplify the ratio 18:24.', a: '3:4' },
    { q: 'What is 7²?', a: '49' },
    { q: 'Calculate the mean of 4, 7, 9 and 12.', a: '8' },
    { q: 'A fair die is rolled. What is the probability of rolling a 6?', a: '1/6' },
    { q: 'Find the area of a triangle with base 10 cm and height 6 cm.', a: '30 cm²' },
    { q: 'What is -4 + 11?', a: '7' },
  ];
}

function englishQuiz(ageBand: AgeBand) {
  if (ageBand === '5-7') return [
    { q: 'Which word is the verb in: The dog runs quickly?', a: 'runs' },
    { q: 'Add the missing punctuation: Where are you going', a: 'Where are you going?' },
    { q: 'Give an adjective to describe a giant.', a: 'Any suitable describing word, e.g. enormous.' },
    { q: 'Which word should have a capital letter: london?', a: 'London' },
    { q: 'Join these ideas with because: I wore a coat. It was cold.', a: 'I wore a coat because it was cold.' },
    { q: 'What comes at the end of a statement?', a: 'A full stop.' },
  ];
  if (ageBand === '8-10') return [
    { q: 'Identify the adverb: The fox moved silently through the grass.', a: 'silently' },
    { q: 'What punctuation is normally used around direct speech?', a: 'Speech marks / inverted commas.' },
    { q: 'What is a synonym for enormous?', a: 'Huge, gigantic or another suitable synonym.' },
    { q: 'What is the purpose of a paragraph?', a: 'To group related ideas or information.' },
    { q: 'What should an inference be supported by?', a: 'Evidence or clues from the text.' },
    { q: 'Give one feature of an informative non-fiction text.', a: 'For example: headings, subheadings, facts or organised paragraphs.' },
  ];
  return [
    { q: 'What is a metaphor?', a: 'A comparison that says one thing is another to create meaning or imagery.' },
    { q: 'What is a counterargument?', a: 'A viewpoint or argument that challenges the main argument.' },
    { q: 'Why might a writer use a short sentence?', a: 'For emphasis, tension, clarity or a sudden change of pace.' },
    { q: 'What does connotation mean?', a: 'The ideas or feelings associated with a word beyond its literal meaning.' },
    { q: 'What is the difference between audience and purpose?', a: 'Audience is who the text is for; purpose is what the writer wants the text to achieve.' },
    { q: 'Name one thing to check when proofreading.', a: 'Grammar, punctuation, spelling, vocabulary, clarity or cohesion.' },
  ];
}

function makeLesson(subject: 'maths' | 'english', ageBand: AgeBand, tuple: [string, string, string, string[]], variant: number): LessonTemplate {
  const [topic, title, objective, vocabulary] = tuple;
  const curriculumRef = ageBand === '5-7' ? 'England National Curriculum: KS1' : ageBand === '8-10' ? 'England National Curriculum: KS2' : 'England National Curriculum: KS3';
  const isMaths = subject === 'maths';
  const quiz = isMaths ? mathsQuiz(topic, ageBand, variant) : englishQuiz(ageBand);
  return {
    subject,
    topic,
    title: `${title} — Lesson ${variant}`,
    ageBand,
    curriculumRef,
    objective,
    vocabulary,
    warmup: isMaths
      ? ['5-minute retrieval: answer five quick questions from prior learning.', 'Say one strategy you remember and when it is useful.']
      : ['5-minute retrieval: correct three short spelling, grammar or punctuation examples.', 'Read a short sentence aloud and identify one feature.'],
    teach: [
      `Teacher explanation: introduce ${title.toLowerCase()} using clear worked examples suitable for ages ${ageBand}.`,
      `Model the key vocabulary: ${vocabulary.join(', ')}.`,
      'Check understanding with two quick questions before moving on.',
    ],
    guided: [
      `Work through four examples of ${title.toLowerCase()} together, asking the learner to explain each step or choice.`,
      'Use hints before answers; praise reasoning rather than speed.',
      'Include one common mistake and ask the learner to correct it.',
    ],
    independent: [
      `Complete six progressively harder ${subject} tasks on ${title.toLowerCase()}.`,
      'Include at least one real-life or reading/writing application.',
      'If two answers in a row are incorrect, step down difficulty and reteach with a new example.',
    ],
    quiz,
    recap: [
      `Explain one thing learned about ${title.toLowerCase()}.`,
      'Answer one exit question without help.',
      'Choose: confident / nearly there / need more practice.',
    ],
  };
}

function egyptLesson(ageBand: AgeBand, variant: number): LessonTemplate {
  const focus = [
    ['The River Nile', 'Explain why the Nile was central to settlement, farming, transport and trade.', ['Nile', 'floodplain', 'silt', 'irrigation']],
    ['Pharaohs and Society', 'Understand the role of pharaohs and how ancient Egyptian society was organised.', ['pharaoh', 'scribe', 'priest', 'artisan']],
    ['Pyramids and Tombs', 'Explain why tombs were built and what archaeological evidence can tell us.', ['pyramid', 'tomb', 'afterlife', 'archaeology']],
    ['Mummies and Beliefs', 'Describe mummification and connect it to beliefs about the afterlife.', ['mummification', 'natron', 'linen', 'afterlife']],
    ['Hieroglyphs and Scribes', 'Understand how writing helped government, religion and communication.', ['hieroglyph', 'scribe', 'papyrus', 'record']],
    ['Tutankhamun', 'Explain who Tutankhamun was and why his tomb is historically important.', ['Tutankhamun', 'Howard Carter', 'Valley of the Kings', 'artefact']],
    ['Gods and Religion', 'Explore several important gods and how religion shaped Egyptian life.', ['Ra', 'Osiris', 'Isis', 'Horus', 'Anubis']],
    ['Daily Life', 'Compare the lives of farmers, craftspeople, scribes, priests and wealthy families.', ['farmer', 'craftsperson', 'scribe', 'status']],
    ['Trade, Boats and Technology', 'Explain how the Nile linked communities and supported trade and building.', ['trade', 'boat', 'transport', 'resource']],
    ['Egypt Through Time', 'Place major periods and people on a simple timeline and avoid common chronology mistakes.', ['timeline', 'BCE', 'Old Kingdom', 'New Kingdom', 'Ptolemaic']],
  ][variant - 1];
  const [title, objective, vocabulary] = focus as [string, string, string[]];
  const curriculumRef = ageBand === '5-7' ? 'History enrichment / chronological understanding' : ageBand === '8-10' ? 'England National Curriculum History: achievements of earliest civilisations, Ancient Egypt depth study' : 'KS3 History enrichment: ancient civilisation and historical evidence';
  const quizPool = [
    { q: 'Why was the River Nile important to Ancient Egypt?', a: 'It provided water, fertile soil, food, transport and trade routes.' },
    { q: 'What was a pharaoh?', a: 'A ruler of ancient Egypt with political and religious authority.' },
    { q: 'What are hieroglyphs?', a: 'An ancient Egyptian writing system using signs for sounds, words and ideas.' },
    { q: 'Why were some bodies mummified?', a: 'Because preservation of the body was connected to beliefs about the afterlife.' },
    { q: 'Who discovered Tutankhamun’s tomb in 1922?', a: 'Howard Carter’s excavation team.' },
    { q: 'What was papyrus used for?', a: 'Among other things, as a writing material.' },
    { q: 'Why were boats important?', a: 'They transported people and goods along the Nile.' },
    { q: 'Did Cleopatra live before or after the Great Pyramid was built?', a: 'Long after; Cleopatra lived more than two thousand years later.' },
  ];
  return {
    subject: 'history', topic: 'ancient-egypt', title: `Ancient Egypt: ${title}`, ageBand, curriculumRef, objective, vocabulary,
    warmup: ['5-minute retrieval: locate Egypt and the River Nile on a map.', 'Recall two facts from the previous Ancient Egypt lesson.'],
    teach: [`10-minute explanation of ${title.toLowerCase()} with age-appropriate chronology and evidence.`, `Introduce vocabulary: ${vocabulary.join(', ')}.`],
    guided: ['15-minute guided source/evidence activity: discuss what an artefact, image, map or short text could tell a historian.', 'Ask four oral questions and require a reason or piece of evidence for each answer.'],
    independent: [`15-minute task: create a labelled explanation, short paragraph, comparison table or timeline about ${title.toLowerCase()}.`, 'Include one challenge question that asks why or how, not just what.'],
    quiz: quizPool,
    recap: ['5-minute recap: three facts, two new words, one question still to explore.', 'Give one-sentence answer to the lesson objective.'],
  };
}

export async function runEducationCloudSeed() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS education_cloud_knowledge (
        id INT AUTO_INCREMENT PRIMARY KEY,
        knowledge_key VARCHAR(160) NOT NULL UNIQUE,
        subject VARCHAR(40) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        age_band VARCHAR(16) NOT NULL DEFAULT 'all',
        question TEXT NOT NULL,
        answer LONGTEXT NOT NULL,
        source_type VARCHAR(32) NOT NULL DEFAULT 'built_in',
        source_model VARCHAR(80) DEFAULT NULL,
        confidence DECIMAL(4,3) NOT NULL DEFAULT 1.000,
        times_used INT NOT NULL DEFAULT 0,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_knowledge_subject_topic (subject, topic),
        INDEX idx_knowledge_age (age_band)
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS education_cloud_lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_key VARCHAR(180) NOT NULL UNIQUE,
        subject VARCHAR(40) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        age_band VARCHAR(16) NOT NULL,
        title VARCHAR(255) NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 60,
        curriculum_ref VARCHAR(500) DEFAULT NULL,
        lesson_json LONGTEXT NOT NULL,
        source_type VARCHAR(32) NOT NULL DEFAULT 'built_in',
        active TINYINT(1) NOT NULL DEFAULT 1,
        times_used INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lessons_subject_age (subject, age_band),
        INDEX idx_lessons_topic (topic)
      )
    `);

    for (const [key, subject, topic, ageBand, question, answer] of ancientEgyptKnowledge) {
      await db.execute(sql`
        INSERT INTO education_cloud_knowledge
          (knowledge_key, subject, topic, age_band, question, answer, source_type, confidence, active)
        VALUES
          (${key}, ${subject}, ${topic}, ${ageBand}, ${question}, ${answer}, 'built_in', 1.000, 1)
        ON DUPLICATE KEY UPDATE
          question = VALUES(question), answer = VALUES(answer), active = 1, updated_at = CURRENT_TIMESTAMP
      `);
    }

    const lessons: LessonTemplate[] = [];
    for (const ageBand of ['5-7', '8-10', '11-13'] as AgeBand[]) {
      for (const topic of mathsTopics[ageBand]) {
        for (let variant = 1; variant <= 3; variant++) lessons.push(makeLesson('maths', ageBand, topic, variant));
      }
      for (const topic of englishTopics[ageBand]) {
        for (let variant = 1; variant <= 3; variant++) lessons.push(makeLesson('english', ageBand, topic, variant));
      }
      for (let variant = 1; variant <= 10; variant++) lessons.push(egyptLesson(ageBand, variant));
    }

    for (const lesson of lessons) {
      const lessonKey = `${lesson.subject}:${lesson.topic}:${lesson.ageBand}:${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
      await db.execute(sql`
        INSERT INTO education_cloud_lessons
          (lesson_key, subject, topic, age_band, title, duration_minutes, curriculum_ref, lesson_json, source_type, active)
        VALUES
          (${lessonKey}, ${lesson.subject}, ${lesson.topic}, ${lesson.ageBand}, ${lesson.title}, 60, ${lesson.curriculumRef}, ${JSON.stringify(lesson)}, 'built_in', 1)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title), duration_minutes = 60, curriculum_ref = VALUES(curriculum_ref),
          lesson_json = VALUES(lesson_json), active = 1, updated_at = CURRENT_TIMESTAMP
      `);
    }

    const mathsCount = lessons.filter(l => l.subject === 'maths').length;
    const englishCount = lessons.filter(l => l.subject === 'english').length;
    const egyptCount = lessons.filter(l => l.subject === 'history').length;
    console.log(`[EducationCloud] ready: ${ancientEgyptKnowledge.length} Ancient Egypt knowledge items; ${mathsCount} Maths 60-min lessons; ${englishCount} English 60-min lessons; ${egyptCount} Ancient Egypt 60-min lessons.`);
  } catch (err) {
    console.error('[EducationCloud] seed failed:', err);
  }
}
