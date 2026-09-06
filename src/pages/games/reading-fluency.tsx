import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What should you do when you see a full stop while reading aloud?', options: ['Speed up','Pause briefly','Stop and take a breath','Read louder'], answer: 'Stop and take a breath' },
  { question: 'What should you do when you see a comma while reading aloud?', options: ['Stop completely','Speed up','Pause briefly','Ignore it'], answer: 'Pause briefly' },
  { question: 'What does an exclamation mark tell you when reading aloud?', options: ['Read quietly','Read with excitement or emphasis','Read faster','Pause'], answer: 'Read with excitement or emphasis' },
  { question: 'What does a question mark tell you when reading aloud?', options: ['Read with a rising tone','Read with a falling tone','Read faster','Read slower'], answer: 'Read with a rising tone' },
  { question: 'What should you do if you do not know a word?', options: ['Skip it','Use context clues to work it out','Stop reading','Guess randomly'], answer: 'Use context clues to work it out' },
  { question: 'What is "expression" in reading?', options: ['Reading every word','Changing your voice to match the meaning','Reading silently','Reading quickly'], answer: 'Changing your voice to match the meaning' },
  { question: 'What does "fluency" mean in reading?', options: ['Reading very slowly','Reading smoothly and accurately with expression','Reading silently','Reading only easy words'], answer: 'Reading smoothly and accurately with expression' },
  { question: 'What is "decoding" mean in reading?', options: ['Understanding the meaning','Working out how to say a word from its letters','Reading aloud','Summarising'], answer: 'Working out how to say a word from its letters' },
  { question: 'What is "inference" in reading?', options: ['Reading aloud','Working out meaning not directly stated','Summarising','Decoding words'], answer: 'Working out meaning not directly stated' },
  { question: 'What is "retrieval" in reading?', options: ['Making inferences','Finding information directly stated in the text','Summarising','Predicting'], answer: 'Finding information directly stated in the text' },
  { question: 'What does "summarise" mean?', options: ['Read every word carefully','Give a brief account of the main points','Read aloud with expression','Decode difficult words'], answer: 'Give a brief account of the main points' },
  { question: 'What is "prediction" in reading?', options: ['Finding information in the text','Making inferences','Guessing what will happen next based on clues','Summarising the text'], answer: 'Guessing what will happen next based on clues' },
];
const L2: QuizQuestion[] = [
  { question: 'What is "skimming" a text?', options: ['Reading every word carefully','Reading quickly to get the main idea','Reading aloud','Reading backwards'], answer: 'Reading quickly to get the main idea' },
  { question: 'What is "scanning" a text?', options: ['Reading every word','Reading quickly to find specific information','Reading aloud','Reading slowly'], answer: 'Reading quickly to find specific information' },
  { question: 'What is a "context clue"?', options: ['A word in a dictionary','Information in the surrounding text that helps you understand a word','A type of punctuation','A type of grammar'], answer: 'Information in the surrounding text that helps you understand a word' },
  { question: 'What is "close reading"?', options: ['Reading from a short distance','Reading carefully and in detail','Reading quickly','Reading silently'], answer: 'Reading carefully and in detail' },
  { question: 'What is "author\'s purpose"?', options: ['The setting of the text','The reason the author wrote the text','The characters in the text','The plot of the text'], answer: 'The reason the author wrote the text' },
  { question: 'What are the three main author purposes?', options: ['To inform, to entertain, to persuade','To describe, to explain, to argue','To narrate, to report, to instruct','To compare, to contrast, to evaluate'], answer: 'To inform, to entertain, to persuade' },
  { question: 'What is "tone" in a text?', options: ['The volume of the text','The attitude or feeling conveyed by the writing','The speed of the text','The length of the text'], answer: 'The attitude or feeling conveyed by the writing' },
  { question: 'What is "bias" in a text?', options: ['A balanced view','A one-sided or unfair view','A factual view','A neutral view'], answer: 'A one-sided or unfair view' },
  { question: 'What is a "rhetorical question"?', options: ['A question that expects an answer','A question asked for effect, not expecting an answer','A question in a story','A question in a poem'], answer: 'A question asked for effect, not expecting an answer' },
  { question: 'What is "figurative language"?', options: ['Language that means exactly what it says','Language that uses figures and numbers','Language that uses imagery and non-literal meaning','Language that is very formal'], answer: 'Language that uses imagery and non-literal meaning' },
  { question: 'What is "literal meaning"?', options: ['The exact, direct meaning of words','The hidden or implied meaning','The figurative meaning','The emotional meaning'], answer: 'The exact, direct meaning of words' },
  { question: 'What is "implied meaning"?', options: ['The exact, direct meaning of words','The meaning suggested but not directly stated','The figurative meaning','The emotional meaning'], answer: 'The meaning suggested but not directly stated' },
];
const L3: QuizQuestion[] = [
  { question: 'What is "denotation"?', options: ['The implied meaning of a word','The literal, dictionary meaning of a word','The emotional meaning of a word','The figurative meaning of a word'], answer: 'The literal, dictionary meaning of a word' },
  { question: 'What is "connotation"?', options: ['The literal meaning of a word','The associations and implied meanings of a word','The dictionary definition','The grammatical function of a word'], answer: 'The associations and implied meanings of a word' },
  { question: 'What is "register" in language?', options: ['A type of grammar','The level of formality appropriate to a context','A type of punctuation','A type of sentence'], answer: 'The level of formality appropriate to a context' },
  { question: 'What is "cohesion" in a text?', options: ['The length of a text','The way a text is held together through language features','The number of paragraphs','The number of sentences'], answer: 'The way a text is held together through language features' },
  { question: 'What is a "discourse marker"?', options: ['A type of punctuation','A word or phrase that organises and connects ideas (e.g. "however", "furthermore")','A type of sentence','A type of paragraph'], answer: 'A word or phrase that organises and connects ideas (e.g. "however", "furthermore")' },
  { question: 'What is "hedging" in language?', options: ['Using definite statements','Using cautious language to avoid commitment (e.g. "it seems", "perhaps")','A type of metaphor','A type of simile'], answer: 'Using cautious language to avoid commitment (e.g. "it seems", "perhaps")' },
  { question: 'What is "modality" in language?', options: ['The tense of a verb','The degree of certainty or obligation expressed (e.g. "must", "might", "could")','A type of punctuation','A type of sentence'], answer: 'The degree of certainty or obligation expressed (e.g. "must", "might", "could")' },
  { question: 'What is "nominalisation"?', options: ['Turning a verb or adjective into a noun (e.g. "decide" → "decision")','Turning a noun into a verb','A type of punctuation','A type of sentence'], answer: 'Turning a verb or adjective into a noun (e.g. "decide" → "decision")' },
  { question: 'What is "passive voice"?', options: ['The subject performs the action','The subject receives the action (e.g. "The ball was kicked")','A type of metaphor','A type of simile'], answer: 'The subject receives the action (e.g. "The ball was kicked")' },
  { question: 'What is "active voice"?', options: ['The subject receives the action','The subject performs the action (e.g. "She kicked the ball")','A type of metaphor','A type of simile'], answer: 'The subject performs the action (e.g. "She kicked the ball")' },
  { question: 'What is "anaphoric reference"?', options: ['Referring forward to something not yet mentioned','Referring back to something already mentioned','A type of metaphor','A type of simile'], answer: 'Referring back to something already mentioned' },
  { question: 'What is "cataphoric reference"?', options: ['Referring back to something already mentioned','Referring forward to something not yet mentioned','A type of metaphor','A type of simile'], answer: 'Referring forward to something not yet mentioned' },
];
const L4: QuizQuestion[] = [
  { question: 'What is "deixis"?', options: ['Words that point to something in context (e.g. "here", "now", "this")','A type of metaphor','A type of simile','A type of punctuation'], answer: 'Words that point to something in context (e.g. "here", "now", "this")' },
  { question: 'What is "ellipsis" in grammar?', options: ['A punctuation mark (...)','The omission of words that can be understood from context','A type of metaphor','A type of simile'], answer: 'The omission of words that can be understood from context' },
  { question: 'What is "substitution" in cohesion?', options: ['Repeating the same word','Replacing a word or phrase with another to avoid repetition','A type of metaphor','A type of simile'], answer: 'Replacing a word or phrase with another to avoid repetition' },
  { question: 'What is "lexical cohesion"?', options: ['Cohesion through grammar','Cohesion through related vocabulary (synonyms, antonyms, repetition)','A type of metaphor','A type of simile'], answer: 'Cohesion through related vocabulary (synonyms, antonyms, repetition)' },
  { question: 'What is "semantic field"?', options: ['A group of words related to the same topic or concept','A type of metaphor','A type of simile','A type of punctuation'], answer: 'A group of words related to the same topic or concept' },
  { question: 'What is "pragmatics"?', options: ['The study of grammar','The study of how context affects meaning in language','The study of vocabulary','The study of punctuation'], answer: 'The study of how context affects meaning in language' },
  { question: 'What is "implicature" (Grice)?', options: ['The literal meaning of an utterance','What is implied but not directly stated in an utterance','A type of metaphor','A type of simile'], answer: 'What is implied but not directly stated in an utterance' },
  { question: 'What is "speech act theory" (Austin/Searle)?', options: ['The study of how words are pronounced','The study of how utterances perform actions (e.g. promising, warning)','The study of grammar','The study of vocabulary'], answer: 'The study of how utterances perform actions (e.g. promising, warning)' },
  { question: 'What is a "performative utterance"?', options: ['An utterance that describes an action','An utterance that performs an action (e.g. "I promise", "I declare")','A type of metaphor','A type of simile'], answer: 'An utterance that performs an action (e.g. "I promise", "I declare")' },
  { question: 'What is "Grice\'s cooperative principle"?', options: ['Speakers should be as helpful as possible in communication','Speakers should always be polite','Speakers should always be truthful','Speakers should always be brief'], answer: 'Speakers should be as helpful as possible in communication' },
  { question: 'What are Grice\'s maxims?', options: ['Quantity, Quality, Relation, Manner','Truth, Brevity, Clarity, Relevance','Politeness, Honesty, Brevity, Clarity','Quantity, Quality, Politeness, Manner'], answer: 'Quantity, Quality, Relation, Manner' },
  { question: 'What is "face-threatening act" (Brown and Levinson)?', options: ['An act that threatens someone physically','An act that threatens someone\'s public self-image','A type of metaphor','A type of simile'], answer: 'An act that threatens someone\'s public self-image' },
];
const L5: QuizQuestion[] = [
  { question: 'What is "critical discourse analysis"?', options: ['The study of grammar','The study of how language reflects and constructs power and ideology','The study of vocabulary','The study of punctuation'], answer: 'The study of how language reflects and constructs power and ideology' },
  { question: 'What is "systemic functional linguistics" (Halliday)?', options: ['The study of grammar only','A theory that language serves three metafunctions: ideational, interpersonal, textual','The study of vocabulary only','The study of pronunciation only'], answer: 'A theory that language serves three metafunctions: ideational, interpersonal, textual' },
  { question: 'What is the "ideational metafunction" (Halliday)?', options: ['Language expressing social relationships','Language representing the world and our experience of it','Language organising text','Language expressing emotion'], answer: 'Language representing the world and our experience of it' },
  { question: 'What is the "interpersonal metafunction" (Halliday)?', options: ['Language representing the world','Language expressing social relationships and roles','Language organising text','Language expressing emotion'], answer: 'Language expressing social relationships and roles' },
  { question: 'What is the "textual metafunction" (Halliday)?', options: ['Language representing the world','Language expressing social relationships','Language organising text into coherent messages','Language expressing emotion'], answer: 'Language organising text into coherent messages' },
  { question: 'What is "transitivity" in systemic functional linguistics?', options: ['A grammatical category of verbs','The system of processes and participants that represents experience in language','A type of cohesion','A type of register'], answer: 'The system of processes and participants that represents experience in language' },
  { question: 'What is "appraisal theory"?', options: ['The study of how language evaluates and expresses attitudes','The study of grammar','The study of vocabulary','The study of punctuation'], answer: 'The study of how language evaluates and expresses attitudes' },
  { question: 'What is "corpus linguistics"?', options: ['The study of individual texts','The study of language using large collections of real language data','The study of grammar only','The study of vocabulary only'], answer: 'The study of language using large collections of real language data' },
  { question: 'What is "multimodality" in text analysis?', options: ['The study of grammar','The study of how meaning is made through multiple modes (text, image, sound, gesture)','The study of vocabulary','The study of punctuation'], answer: 'The study of how meaning is made through multiple modes (text, image, sound, gesture)' },
  { question: 'What is "intertextuality" in language analysis?', options: ['A text that has no references','The way texts draw on and respond to other texts','A type of metaphor','A type of simile'], answer: 'The way texts draw on and respond to other texts' },
  { question: 'What is "genre theory" in linguistics?', options: ['The study of literary genres','The study of how texts are structured to achieve social purposes in specific contexts','The study of grammar','The study of vocabulary'], answer: 'The study of how texts are structured to achieve social purposes in specific contexts' },
  { question: 'What is "language ideology"?', options: ['A set of beliefs about language and its users that reflect and reproduce social power','A type of grammar','A type of vocabulary','A type of punctuation'], answer: 'A set of beliefs about language and its users that reflect and reproduce social power' },
];

export default function ReadingFluencyGame() {
  return (
    <>
      <Helmet>
        <title>Reading Fluency — Sodafom</title>
        <meta name="description" content="Build your reading fluency and expression!" />
        <link rel="canonical" href="https://sodafom.uk/games/reading-fluency" />
        <meta property="og:title" content="Reading Fluency — Sodafom" />
        <meta property="og:description" content="Build your reading fluency and expression!" />
        <meta property="og:url" content="https://sodafom.uk/games/reading-fluency" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Reading Fluency — English Game for Kids — Sodafom</h1>
      <GameShell title="Reading Fluency" emoji="📝" subject="reading" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="reading-fluency"
            title="Reading Fluency"
            emoji="📝"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
