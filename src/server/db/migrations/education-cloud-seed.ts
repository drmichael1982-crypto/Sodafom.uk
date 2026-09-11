import { sql } from 'drizzle-orm';
import { db } from '@/server/db/client';

type AgeBand = '5-7' | '8-10' | '11-13';

type Topic = { slug: string; title: string; objective: string; vocabulary: string[] };

const egyptFacts: Array<[string, string]> = [
  ['Who were the Ancient Egyptians?', 'The Ancient Egyptians were people who lived along the River Nile in north-east Africa for thousands of years. Their civilisation built towns, temples and pyramids, used hieroglyphic writing and was ruled for long periods by pharaohs.'],
  ['Why was the River Nile important?', 'The Nile provided water, fertile soil, food, transport and trade routes. Annual flooding left rich silt on fields and supported farming.'],
  ['What was a pharaoh?', 'A pharaoh was the ruler of ancient Egypt, combining political and religious authority and overseeing laws, armies and major building projects.'],
  ['Why did Egyptians build pyramids?', 'Many pyramids were monumental tombs for pharaohs. They reflected beliefs about kingship and the afterlife.'],
  ['What is the Great Pyramid of Giza?', 'The Great Pyramid was built for Pharaoh Khufu during the Old Kingdom and is the largest of the pyramids at Giza.'],
  ['Why did Egyptians make mummies?', 'Mummification preserved bodies because many Egyptians believed the body mattered in the afterlife.'],
  ['What are hieroglyphs?', 'Hieroglyphs are an ancient Egyptian writing system whose signs could represent sounds, words or ideas.'],
  ['What did scribes do?', 'Scribes were trained readers and writers who kept records, wrote letters, recorded taxes and helped government and temples.'],
  ['Who was Tutankhamun?', 'Tutankhamun was a young New Kingdom pharaoh whose tomb was discovered in 1922 with many objects still inside.'],
  ['Who was Howard Carter?', 'Howard Carter was the archaeologist who led the excavation that discovered Tutankhamun’s tomb in 1922.'],
  ['Who was Cleopatra VII?', 'Cleopatra VII was the last active ruler of Ptolemaic Egypt. She lived more than two thousand years after the Great Pyramid was built.'],
  ['Which gods did Ancient Egyptians worship?', 'Ancient Egyptians worshipped many gods and goddesses, including Ra, Osiris, Isis, Horus and Anubis.'],
  ['Who was Anubis?', 'Anubis was a god associated with embalming, cemeteries and care of the dead, often shown with a jackal head.'],
  ['Who was Ra?', 'Ra was an important sun god associated with the daily journey of the sun.'],
  ['Who was Osiris?', 'Osiris was a god associated with death, rebirth and the afterlife.'],
  ['What was daily life like in Ancient Egypt?', 'Most people lived in farming communities or towns. Life differed greatly between farmers, craftspeople, scribes, priests, officials and wealthy families.'],
  ['What did Ancient Egyptians eat?', 'Common foods included bread, onions, dates, figs, vegetables and fish. Wheat and barley were important crops.'],
  ['What were houses made from?', 'Many homes were built from mud bricks. Flat roofs could provide extra living and working space in the hot climate.'],
  ['What clothes did Ancient Egyptians wear?', 'Linen made from flax was common. Clothing was generally light, although quality and style varied with wealth and status.'],
  ['How did Ancient Egyptians farm?', 'Farmers used Nile water, fertile floodplain soil and irrigation channels to grow wheat, barley, flax and vegetables.'],
  ['Why were boats important?', 'The Nile was a major transport route. Boats moved people, stone, food and trade goods.'],
  ['What did Ancient Egypt trade?', 'Egypt traded grain, linen and crafted goods and imported timber, metals, incense and luxury materials.'],
  ['What was papyrus?', 'Papyrus was a Nile plant used to make writing material as well as baskets, mats and some boats.'],
  ['Why is the Rosetta Stone important?', 'The Rosetta Stone contains the same decree in different scripts and helped scholars understand ancient Egyptian hieroglyphs.'],
  ['What is the Valley of the Kings?', 'The Valley of the Kings is an area near ancient Thebes where many New Kingdom rulers were buried in rock-cut tombs.'],
  ['What were temples used for?', 'Temples were religious centres where priests carried out rituals. Temple estates also had important economic and administrative roles.'],
  ['Did Ancient Egyptians use maths?', 'Yes. Egyptians used arithmetic and geometry for trade, building, measuring land, taxation and practical problems.'],
  ['What did Ancient Egyptians know about medicine?', 'Medical texts describe treatments for injuries and illnesses using observation, bandaging, medicines and religious practices.'],
  ['When did Ancient Egyptian civilisation exist?', 'Dynastic Egypt began around 3100 BCE and continued for more than three thousand years, ending as an independent kingdom before Roman rule in 30 BCE.'],
  ['Why is chronology important in Ancient Egypt?', 'Ancient Egypt lasted so long that famous people and monuments can be separated by thousands of years. For example, Cleopatra lived much closer to our time than to the building of the Great Pyramid.'],
];

const founderFacts: Array<[string, string]> = [
  ['Who founded Sodafom?', 'Michael Davis is the founder and creator of Sodafom. He built it to help his son Archie and other children enjoy learning.'],
  ['When was Sodafom founder Michael Davis born?', 'Michael Davis was born on 11 November 1982 at 2:30 in the morning at Chase Farm Hospital.'],
  ['Where did Sodafom founder Michael Davis grow up?', 'Michael Davis grew up in Broxbourne.'],
  ['How old is Sodafom founder Michael Davis?', 'Michael Davis is 43 years old in 2026.'],
];

const maths: Record<AgeBand, Topic[]> = {
  '5-7': [
    ['number-to-100','Numbers to 100','Read, write, compare and order numbers to 100',['number','digit','tens','ones']],
    ['place-value','Place Value','Understand tens and ones and partition two-digit numbers',['place value','tens','ones','partition']],
    ['addition-subtraction','Addition and Subtraction','Use number facts and strategies to add and subtract',['sum','difference','number line','inverse']],
    ['multiplication','Equal Groups and Multiplication','Recognise equal groups, arrays and repeated addition',['groups','array','times','multiply']],
    ['division','Sharing and Division','Share and group objects equally',['share','group','divide','equal']],
    ['fractions','Halves and Quarters','Recognise and find halves and quarters',['half','quarter','whole','equal parts']],
    ['money','Money','Recognise UK money and solve simple money problems',['pence','pounds','coin','change']],
    ['time-shape-measure','Time, Shape and Measure','Tell simple times and compare common measures and shapes',['hour','minute','length','mass','shape']],
  ].map(([slug,title,objective,vocabulary]) => ({slug,title,objective,vocabulary})) as Topic[],
  '8-10': [
    ['large-number-place-value','Large Number Place Value','Read, compare, round and partition large whole numbers',['place value','round','partition','million']],
    ['four-operations','Four Operations','Use efficient mental and written calculation methods',['operation','estimate','inverse','remainder']],
    ['times-tables','Multiplication and Division Facts','Recall and apply facts up to 12 × 12',['factor','multiple','product','quotient']],
    ['fractions','Fractions','Compare, order and calculate with age-appropriate fractions',['numerator','denominator','equivalent','mixed number']],
    ['decimals-percent','Decimals and Percentages','Connect fractions, decimals and percentages',['decimal','tenths','hundredths','percent']],
    ['measurement','Measurement','Convert common metric measures and solve problems',['length','mass','capacity','convert']],
    ['area-perimeter-angles','Area, Perimeter and Angles','Calculate measures and use angle facts',['area','perimeter','acute','obtuse','degrees']],
    ['data','Statistics and Data','Read charts, tables and graphs and answer comparison questions',['data','bar chart','line graph','average']],
  ].map(([slug,title,objective,vocabulary]) => ({slug,title,objective,vocabulary})) as Topic[],
  '11-13': [
    ['integers','Integers','Calculate confidently with positive and negative integers',['integer','negative','absolute value','order']],
    ['algebra','Algebra','Use expressions and simple equations to represent relationships',['variable','expression','equation','coefficient']],
    ['ratio','Ratio and Proportion','Use ratio notation and solve direct proportion problems',['ratio','proportion','scale','unitary']],
    ['fdp','Fractions, Decimals and Percentages','Convert between forms and solve percentage problems',['fraction','decimal','percentage','multiplier']],
    ['powers','Powers and Roots','Use square, cube, root and index notation',['square','cube','root','index']],
    ['geometry','Geometry','Use angle and shape facts accurately',['parallel','polygon','interior angle','bearing']],
    ['area-volume','Area and Volume','Calculate area, surface area and volume',['area','surface area','volume','prism']],
    ['graphs-stats-probability','Graphs, Statistics and Probability','Interpret graphs, averages and simple probability',['coordinate','mean','probability','sample space']],
  ].map(([slug,title,objective,vocabulary]) => ({slug,title,objective,vocabulary})) as Topic[],
};

const english: Record<AgeBand, Topic[]> = {
  '5-7': [
    ['phonics','Phonics and Decoding','Blend sounds to read and segment words for spelling',['phoneme','grapheme','blend','segment']],
    ['sentences','Building Sentences','Write sentences with capitals, spaces and full stops',['sentence','capital','full stop','word']],
    ['nouns-verbs','Nouns and Verbs','Identify nouns and verbs and use them in sentences',['noun','verb','action','name']],
    ['adjectives','Adjectives and Description','Choose useful adjectives for clear description',['adjective','describe','detail','choice']],
    ['punctuation','Basic Punctuation','Use full stops, question marks and exclamation marks',['punctuation','question mark','exclamation mark','statement']],
    ['story-sequence','Story Sequence','Retell and write events in a sensible order',['beginning','middle','end','sequence']],
    ['reading','Reading Retrieval and Inference','Find facts and use clues to make simple inferences',['retrieve','fact','inference','clue']],
    ['spelling-conjunctions','Spelling and Joining Ideas','Apply common spelling patterns and join ideas',['spelling','pattern','and','but','because']],
  ].map(([slug,title,objective,vocabulary]) => ({slug,title,objective,vocabulary})) as Topic[],
  '8-10': [
    ['word-classes','Word Classes','Identify and use nouns, verbs, adjectives, adverbs and pronouns',['noun','verb','adjective','adverb','pronoun']],
    ['sentence-variety','Sentence Variety','Use main and subordinate clauses for clarity and effect',['clause','main clause','subordinate clause','sentence']],
    ['speech-punctuation','Speech Punctuation','Punctuate direct speech accurately',['speech marks','comma','reporting clause','speaker']],
    ['paragraphs','Paragraphs and Cohesion','Organise related ideas and link paragraphs clearly',['paragraph','cohesion','topic sentence','link']],
    ['vocabulary','Vocabulary','Choose precise vocabulary and understand shades of meaning',['synonym','antonym','precision','context']],
    ['inference','Reading Inference','Support inferences with evidence from a text',['inference','evidence','quotation','explain']],
    ['summary-purpose','Summary and Author Purpose','Identify main ideas and explain purpose and effect',['summary','main idea','purpose','effect']],
    ['writing','Non-fiction and Creative Writing','Plan, draft and improve informative and imaginative writing',['audience','heading','setting','plot']],
  ].map(([slug,title,objective,vocabulary]) => ({slug,title,objective,vocabulary})) as Topic[],
  '11-13': [
    ['sentence-control','Sentence Control','Use sentence structures deliberately for accuracy and effect',['syntax','clause','coordination','subordination']],
    ['advanced-punctuation','Advanced Punctuation','Use colons, semicolons, dashes and parentheses accurately',['colon','semicolon','dash','parenthesis']],
    ['language-analysis','Analysing Language','Explain how language choices shape meaning and response',['connotation','imagery','metaphor','effect']],
    ['structure-analysis','Analysing Structure','Explain how structure guides a reader through a text',['structure','focus','contrast','shift']],
    ['argument','Argument Writing','Build a reasoned argument with evidence and counterargument',['thesis','evidence','counterargument','conclusion']],
    ['transactional','Transactional Writing','Adapt form, tone and register for audience and purpose',['audience','purpose','register','tone']],
    ['narrative-poetry','Narrative and Poetry','Analyse and create effective narrative and poetic writing',['viewpoint','pacing','stanza','imagery']],
    ['comparison-editing','Comparison and Editing','Compare texts and edit writing for accuracy and cohesion',['compare','evidence','proofread','cohesion']],
  ].map(([slug,title,objective,vocabulary]) => ({slug,title,objective,vocabulary})) as Topic[],
};

const egyptTopics: Topic[] = [
  ['nile','The River Nile','Explain how the Nile supported settlement, farming, transport and trade',['Nile','floodplain','silt','irrigation']],
  ['pharaohs','Pharaohs and Society','Understand the role of pharaohs and different groups in society',['pharaoh','scribe','priest','artisan']],
  ['pyramids','Pyramids and Tombs','Explain why tombs were built and what evidence they provide',['pyramid','tomb','afterlife','archaeology']],
  ['mummies','Mummies and Beliefs','Describe mummification and connect it to beliefs about the afterlife',['mummification','natron','linen','afterlife']],
  ['writing','Hieroglyphs and Scribes','Understand how writing supported religion and government',['hieroglyph','scribe','papyrus','record']],
  ['tutankhamun','Tutankhamun','Explain who Tutankhamun was and why his tomb matters',['Tutankhamun','Howard Carter','Valley of the Kings','artefact']],
  ['gods','Gods and Religion','Explore major gods and how religion shaped life',['Ra','Osiris','Isis','Horus','Anubis']],
  ['daily-life','Daily Life','Compare farmers, craftspeople, scribes, priests and wealthy families',['farmer','craftsperson','scribe','status']],
  ['trade','Trade, Boats and Technology','Explain how the Nile connected communities and supported trade',['trade','boat','transport','resource']],
  ['timeline','Egypt Through Time','Place major periods and people on a simple timeline',['timeline','BCE','Old Kingdom','New Kingdom','Ptolemaic']],
].map(([slug,title,objective,vocabulary]) => ({slug,title,objective,vocabulary})) as Topic[];

function curriculum(ageBand: AgeBand, subject: string) {
  if (subject === 'history') return ageBand === '8-10' ? 'England National Curriculum History: achievements of the earliest civilisations; Ancient Egypt depth study' : 'UK history enrichment: chronology, evidence and ancient civilisation';
  return `England National Curriculum ${ageBand === '5-7' ? 'KS1' : ageBand === '8-10' ? 'KS2' : 'KS3'} ${subject}`;
}

function genericQuiz(subject: string, ageBand: AgeBand) {
  if (subject === 'maths') {
    if (ageBand === '5-7') return [{q:'What is 18 + 7?',a:'25'},{q:'What is 34 - 9?',a:'25'},{q:'How many tens are in 64?',a:'6'},{q:'What is half of 18?',a:'9'},{q:'How many pence are in £1?',a:'100'},{q:'How many minutes are in one hour?',a:'60'}];
    if (ageBand === '8-10') return [{q:'What is 8 × 7?',a:'56'},{q:'What is 25% of 80?',a:'20'},{q:'Write 0.75 as a fraction.',a:'3/4'},{q:'Round 4,768 to the nearest hundred.',a:'4,800'},{q:'What is 3/5 of 40?',a:'24'},{q:'How many degrees are in a right angle?',a:'90'}];
    return [{q:'Solve x + 8 = 21.',a:'x = 13'},{q:'Write 0.35 as a percentage.',a:'35%'},{q:'Simplify 18:24.',a:'3:4'},{q:'What is 7²?',a:'49'},{q:'Find the mean of 4, 7, 9 and 12.',a:'8'},{q:'What is -4 + 11?',a:'7'}];
  }
  if (subject === 'english') {
    if (ageBand === '5-7') return [{q:'Which word is the verb in: The dog runs quickly?',a:'runs'},{q:'Add punctuation: Where are you going',a:'Where are you going?'},{q:'What does an adjective do?',a:'Describes a noun'},{q:'Which word needs a capital letter: london?',a:'London'},{q:'Join: I wore a coat. It was cold.',a:'I wore a coat because it was cold.'}];
    if (ageBand === '8-10') return [{q:'Identify the adverb: The fox moved silently.',a:'silently'},{q:'What punctuation surrounds direct speech?',a:'Speech marks'},{q:'What is a synonym for enormous?',a:'Huge / gigantic'},{q:'What is a paragraph for?',a:'To group related ideas'},{q:'What should an inference use?',a:'Evidence from the text'}];
    return [{q:'What is a metaphor?',a:'A comparison that says one thing is another'},{q:'What is a counterargument?',a:'An argument against the main position'},{q:'What does connotation mean?',a:'Ideas or feelings associated with a word'},{q:'What is register?',a:'Language style suited to context/audience'},{q:'Name one proofreading check.',a:'Grammar, punctuation, spelling, vocabulary or cohesion'}];
  }
  return [
    {q:'Why was the Nile important?',a:'Water, fertile soil, food, transport and trade'},
    {q:'What was a pharaoh?',a:'A ruler of ancient Egypt'},
    {q:'What are hieroglyphs?',a:'An ancient Egyptian writing system'},
    {q:'Why were bodies mummified?',a:'Because of beliefs about preservation and the afterlife'},
    {q:'Who led the discovery of Tutankhamun’s tomb?',a:'Howard Carter'},
  ];
}

function lessonJson(subject: 'maths'|'english'|'history', ageBand: AgeBand, topic: Topic, variant: number) {
  return {
    version: 1,
    subject,
    topic: topic.slug,
    ageBand,
    title: `${topic.title} — Lesson ${variant}`,
    durationMinutes: 60,
    curriculumRef: curriculum(ageBand, subject),
    objective: topic.objective,
    vocabulary: topic.vocabulary,
    phases: [
      {minutes:5,name:'Warm-up',activities:['Five retrieval questions from prior learning','Say one thing you already know about today’s topic']},
      {minutes:10,name:'Teach',activities:[`Explain ${topic.title.toLowerCase()} with clear age-appropriate worked examples`,`Teach vocabulary: ${topic.vocabulary.join(', ')}`,'Ask two quick check-for-understanding questions']},
      {minutes:15,name:'Guided practice',activities:[`Work through four ${subject} examples together`,'Give hints before answers','Include one common mistake for the learner to correct']},
      {minutes:15,name:'Independent practice',activities:[`Complete six progressively harder tasks on ${topic.title.toLowerCase()}`,'Include one real-life, source-based or writing application','If two answers are wrong in a row, reteach with a simpler example']},
      {minutes:10,name:'Quiz',activities:['Use the stored quiz bank below; randomise order and avoid repeats']},
      {minutes:5,name:'Recap',activities:['Explain one new thing learned','Answer one exit question without help','Choose: confident / nearly there / need more practice']},
    ],
    quiz: genericQuiz(subject, ageBand),
    adaptation: {easier:'Reduce numbers/text load, model another example and use visual or spoken prompts.',harder:'Add a multi-step reasoning, explanation or evidence challenge.'},
    voiceFriendly: true,
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

    for (let i = 0; i < egyptFacts.length; i++) {
      const [question, answer] = egyptFacts[i];
      const key = `ancient-egypt-${String(i + 1).padStart(2, '0')}`;
      await db.execute(sql`
        INSERT INTO education_cloud_knowledge
          (knowledge_key, subject, topic, age_band, question, answer, source_type, confidence, active)
        VALUES (${key}, 'history', 'ancient-egypt', 'all', ${question}, ${answer}, 'built_in', 1.000, 1)
        ON DUPLICATE KEY UPDATE question=VALUES(question), answer=VALUES(answer), active=1, updated_at=CURRENT_TIMESTAMP
      `);
    }

    for (let i = 0; i < founderFacts.length; i++) {
      const [question, answer] = founderFacts[i];
      const key = `sodafom-founder-${String(i + 1).padStart(2, '0')}`;
      await db.execute(sql`
        INSERT INTO education_cloud_knowledge
          (knowledge_key, subject, topic, age_band, question, answer, source_type, confidence, active)
        VALUES (${key}, 'sodafom', 'founder', 'all', ${question}, ${answer}, 'founder_verified', 1.000, 1)
        ON DUPLICATE KEY UPDATE question=VALUES(question), answer=VALUES(answer), active=1, updated_at=CURRENT_TIMESTAMP
      `);
    }

    let mathsCount = 0, englishCount = 0, historyCount = 0;
    for (const ageBand of ['5-7','8-10','11-13'] as AgeBand[]) {
      for (const topic of maths[ageBand]) {
        for (let variant=1; variant<=6; variant++) {
          const body = lessonJson('maths', ageBand, topic, variant);
          const key = `maths:${ageBand}:${topic.slug}:${variant}`;
          await db.execute(sql`INSERT INTO education_cloud_lessons (lesson_key,subject,topic,age_band,title,duration_minutes,curriculum_ref,lesson_json,source_type,active) VALUES (${key},'maths',${topic.slug},${ageBand},${body.title},60,${body.curriculumRef},${JSON.stringify(body)},'built_in',1) ON DUPLICATE KEY UPDATE title=VALUES(title), curriculum_ref=VALUES(curriculum_ref), lesson_json=VALUES(lesson_json), active=1, updated_at=CURRENT_TIMESTAMP`);
          mathsCount++;
        }
      }
      for (const topic of english[ageBand]) {
        for (let variant=1; variant<=6; variant++) {
          const body = lessonJson('english', ageBand, topic, variant);
          const key = `english:${ageBand}:${topic.slug}:${variant}`;
          await db.execute(sql`INSERT INTO education_cloud_lessons (lesson_key,subject,topic,age_band,title,duration_minutes,curriculum_ref,lesson_json,source_type,active) VALUES (${key},'english',${topic.slug},${ageBand},${body.title},60,${body.curriculumRef},${JSON.stringify(body)},'built_in',1) ON DUPLICATE KEY UPDATE title=VALUES(title), curriculum_ref=VALUES(curriculum_ref), lesson_json=VALUES(lesson_json), active=1, updated_at=CURRENT_TIMESTAMP`);
          englishCount++;
        }
      }
      for (const topic of egyptTopics) {
        const body = lessonJson('history', ageBand, topic, 1);
        const key = `history:${ageBand}:ancient-egypt:${topic.slug}`;
        await db.execute(sql`INSERT INTO education_cloud_lessons (lesson_key,subject,topic,age_band,title,duration_minutes,curriculum_ref,lesson_json,source_type,active) VALUES (${key},'history','ancient-egypt',${ageBand},${body.title},60,${body.curriculumRef},${JSON.stringify(body)},'built_in',1) ON DUPLICATE KEY UPDATE title=VALUES(title), curriculum_ref=VALUES(curriculum_ref), lesson_json=VALUES(lesson_json), active=1, updated_at=CURRENT_TIMESTAMP`);
        historyCount++;
      }
    }

    console.log(`[EducationCloud] ready: ${egyptFacts.length} Ancient Egypt knowledge items; ${founderFacts.length} founder facts; ${mathsCount} Maths 60-minute lessons; ${englishCount} English 60-minute lessons; ${historyCount} Ancient Egypt 60-minute lessons.`);
  } catch (err) {
    console.error('[EducationCloud] seed failed:', err);
  }
}
