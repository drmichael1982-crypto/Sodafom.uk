import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: '"Once upon a time…" What type of text is this?', options: ['Instructions','Newspaper report','Narrative story','Persuasive text'], answer: 'Narrative story' },
  { question: '"First, wash your hands. Then, mix the ingredients." What type of text is this?', options: ['Story','Newspaper report','Instructions','Diary'], answer: 'Instructions' },
  { question: '"Dear Diary, Today was amazing…" What type of text is this?', options: ['Formal letter','Newspaper report','Diary','Instructions'], answer: 'Diary' },
  { question: 'Which text type uses numbered steps?', options: ['Story','Diary','Instructions','Poem'], answer: 'Instructions' },
  { question: 'Which text type uses the first person ("I", "we")?', options: ['Newspaper report','Instructions','Diary','Formal letter'], answer: 'Diary' },
  { question: 'Which text type tells a made-up story?', options: ['Newspaper report','Instructions','Fiction narrative','Diary'], answer: 'Fiction narrative' },
  { question: 'Which text type reports real events?', options: ['Fiction narrative','Instructions','Newspaper report','Diary'], answer: 'Newspaper report' },
  { question: 'Which text type uses rhyme?', options: ['Instructions','Newspaper report','Diary','Poem'], answer: 'Poem' },
  { question: 'Which text type has a greeting and a sign-off?', options: ['Instructions','Newspaper report','Letter','Diary'], answer: 'Letter' },
  { question: 'Which text type uses bullet points?', options: ['Story','Diary','Instructions','Poem'], answer: 'Instructions' },
  { question: 'Which text type is written in the past tense to retell events?', options: ['Instructions','Persuasive text','Recount','Poem'], answer: 'Recount' },
  { question: 'Which text type tries to change your opinion?', options: ['Instructions','Persuasive text','Diary','Poem'], answer: 'Persuasive text' },
];
const L2: QuizQuestion[] = [
  { question: '"Mix the flour and butter until crumbly." What type of text is this?', options: ['Story','Newspaper report','Instructions','Persuasive letter'], answer: 'Instructions' },
  { question: '"Scientists have discovered a new species of frog in the Amazon." What type of text is this?', options: ['Story','Newspaper report','Instructions','Diary'], answer: 'Newspaper report' },
  { question: '"Dear Sir, I am writing to complain about…" What type of text is this?', options: ['Story','Instructions','Formal letter','Poem'], answer: 'Formal letter' },
  { question: '"You should buy our amazing product because…" What type of text is this?', options: ['Instructions','Persuasive text','Diary','Story'], answer: 'Persuasive text' },
  { question: 'Which text type uses the past tense to tell events in order?', options: ['Instructions','Persuasive text','Recount','Poem'], answer: 'Recount' },
  { question: 'Which feature is typical of a persuasive text?', options: ['Numbered steps','Rhyming words','Rhetorical questions','Bullet points only'], answer: 'Rhetorical questions' },
  { question: 'What is the purpose of an explanation text?', options: ['To entertain','To persuade','To explain how or why something works','To instruct'], answer: 'To explain how or why something works' },
  { question: 'What is the purpose of a report text?', options: ['To entertain','To persuade','To give factual information about a topic','To instruct'], answer: 'To give factual information about a topic' },
  { question: 'What is the purpose of a discussion text?', options: ['To entertain','To present different viewpoints on an issue','To explain how something works','To instruct'], answer: 'To present different viewpoints on an issue' },
  { question: 'What is the purpose of an argument text?', options: ['To entertain','To present one viewpoint and persuade the reader','To explain how something works','To instruct'], answer: 'To present one viewpoint and persuade the reader' },
  { question: 'What is the purpose of a biography?', options: ['To entertain with a made-up story','To give factual information about a person\'s life','To explain how something works','To instruct'], answer: 'To give factual information about a person\'s life' },
  { question: 'What is the purpose of an autobiography?', options: ['To give factual information about someone else\'s life','To write about your own life','To explain how something works','To instruct'], answer: 'To write about your own life' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the purpose of an analytical essay?', options: ['To entertain','To examine and interpret a text or topic in depth','To persuade','To instruct'], answer: 'To examine and interpret a text or topic in depth' },
  { question: 'What is the purpose of a critical review?', options: ['To summarise only','To evaluate the strengths and weaknesses of a text, film or product','To persuade','To instruct'], answer: 'To evaluate the strengths and weaknesses of a text, film or product' },
  { question: 'What is the purpose of a manifesto?', options: ['To entertain','To publicly declare intentions, policies or views','To instruct','To report'], answer: 'To publicly declare intentions, policies or views' },
  { question: 'What is the purpose of a speech?', options: ['To entertain only','To communicate ideas to an audience, often to persuade or inspire','To instruct','To report'], answer: 'To communicate ideas to an audience, often to persuade or inspire' },
  { question: 'What is the purpose of a travel writing text?', options: ['To instruct','To describe and reflect on experiences of travel','To persuade','To report'], answer: 'To describe and reflect on experiences of travel' },
  { question: 'What is the purpose of a literary non-fiction text?', options: ['To instruct','To inform and engage using literary techniques','To persuade only','To report only'], answer: 'To inform and engage using literary techniques' },
  { question: 'What is the purpose of a polemic?', options: ['To present balanced views','To argue strongly for one side of a controversial issue','To instruct','To report'], answer: 'To argue strongly for one side of a controversial issue' },
  { question: 'What is the purpose of a satire?', options: ['To entertain only','To criticise society or individuals through humour and irony','To instruct','To report'], answer: 'To criticise society or individuals through humour and irony' },
  { question: 'What is the purpose of a parody?', options: ['To imitate a text seriously','To imitate a text for comic effect','To instruct','To report'], answer: 'To imitate a text for comic effect' },
  { question: 'What is the purpose of a pastiche?', options: ['To criticise a text','To imitate the style of another text or artist as a tribute','To instruct','To report'], answer: 'To imitate the style of another text or artist as a tribute' },
  { question: 'What is the purpose of a prospectus?', options: ['To entertain','To provide information about an institution or investment opportunity','To instruct','To report'], answer: 'To provide information about an institution or investment opportunity' },
  { question: 'What is the purpose of a white paper?', options: ['To entertain','To present authoritative information and proposals on a complex issue','To instruct','To report news'], answer: 'To present authoritative information and proposals on a complex issue' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the concept of "genre" in text types?', options: ['A fixed category with unchanging rules','A set of conventions that texts use and adapt to achieve social purposes','A type of grammar','A type of vocabulary'], answer: 'A set of conventions that texts use and adapt to achieve social purposes' },
  { question: 'What is "genre hybridity"?', options: ['A text that belongs to one genre only','A text that combines features of multiple genres','A type of grammar','A type of vocabulary'], answer: 'A text that combines features of multiple genres' },
  { question: 'What is the concept of "mode" in text types?', options: ['The genre of a text','The channel of communication (written, spoken, digital, multimodal)','The purpose of a text','The audience of a text'], answer: 'The channel of communication (written, spoken, digital, multimodal)' },
  { question: 'What is the concept of "audience" in text types?', options: ['The author of a text','The intended readers or viewers of a text','The purpose of a text','The genre of a text'], answer: 'The intended readers or viewers of a text' },
  { question: 'What is the concept of "purpose" in text types?', options: ['The audience of a text','The reason a text was created','The genre of a text','The mode of a text'], answer: 'The reason a text was created' },
  { question: 'What is the concept of "context" in text analysis?', options: ['The grammar of a text','The circumstances in which a text was produced and received','The vocabulary of a text','The punctuation of a text'], answer: 'The circumstances in which a text was produced and received' },
  { question: 'What is the concept of "register" in text types?', options: ['A type of grammar','The level of formality and style appropriate to a context','A type of vocabulary','A type of punctuation'], answer: 'The level of formality and style appropriate to a context' },
  { question: 'What is the concept of "discourse community"?', options: ['A group of people who share a language','A group of people who share communicative goals and conventions','A type of grammar','A type of vocabulary'], answer: 'A group of people who share communicative goals and conventions' },
  { question: 'What is the concept of "intertextuality" in text types?', options: ['A text that has no references','The way texts draw on and respond to other texts','A type of grammar','A type of vocabulary'], answer: 'The way texts draw on and respond to other texts' },
  { question: 'What is the concept of "multimodality" in text types?', options: ['A text with only words','A text that uses multiple modes (text, image, sound, gesture) to make meaning','A type of grammar','A type of vocabulary'], answer: 'A text that uses multiple modes (text, image, sound, gesture) to make meaning' },
  { question: 'What is the concept of "ideology" in text types?', options: ['A type of grammar','The set of values and beliefs embedded in a text','A type of vocabulary','A type of punctuation'], answer: 'The set of values and beliefs embedded in a text' },
  { question: 'What is the concept of "representation" in text types?', options: ['A type of grammar','How people, places and events are portrayed in a text','A type of vocabulary','A type of punctuation'], answer: 'How people, places and events are portrayed in a text' },
];
const L5: QuizQuestion[] = [
  { question: 'What is "Bakhtin\'s concept of the chronotope"?', options: ['A type of character','The intrinsic connectedness of time and space in a narrative','A type of setting','A type of theme'], answer: 'The intrinsic connectedness of time and space in a narrative' },
  { question: 'What is "the concept of the carnivalesque" (Bakhtin) in text types?', options: ['A type of comedy','The subversion of social hierarchies and norms in literature','A type of tragedy','A type of romance'], answer: 'The subversion of social hierarchies and norms in literature' },
  { question: 'What is "the concept of dialogism" (Bakhtin)?', options: ['A text with only one voice','The idea that all language is inherently dialogic — shaped by and responding to other voices','A type of grammar','A type of vocabulary'], answer: 'The idea that all language is inherently dialogic — shaped by and responding to other voices' },
  { question: 'What is "the concept of the utterance" (Bakhtin)?', options: ['A type of sentence','The basic unit of communication, shaped by context and addressed to others','A type of grammar','A type of vocabulary'], answer: 'The basic unit of communication, shaped by context and addressed to others' },
  { question: 'What is "the concept of the speech genre" (Bakhtin)?', options: ['A type of grammar','Relatively stable types of utterances associated with particular spheres of activity','A type of vocabulary','A type of punctuation'], answer: 'Relatively stable types of utterances associated with particular spheres of activity' },
  { question: 'What is "the concept of the text as social action" (Miller)?', options: ['A text that describes social actions','The idea that genres are forms of social action that respond to recurring situations','A type of grammar','A type of vocabulary'], answer: 'The idea that genres are forms of social action that respond to recurring situations' },
  { question: 'What is "the concept of the rhetorical situation" (Bitzer)?', options: ['A type of grammar','The context of exigence, audience and constraints that calls a text into being','A type of vocabulary','A type of punctuation'], answer: 'The context of exigence, audience and constraints that calls a text into being' },
  { question: 'What is "the concept of kairos" in rhetoric?', options: ['A type of grammar','The right or opportune moment for a particular rhetorical act','A type of vocabulary','A type of punctuation'], answer: 'The right or opportune moment for a particular rhetorical act' },
  { question: 'What is "the concept of ethos" in rhetoric?', options: ['An appeal to emotion','An appeal to the speaker\'s credibility and character','An appeal to logic','An appeal to authority'], answer: 'An appeal to the speaker\'s credibility and character' },
  { question: 'What is "the concept of pathos" in rhetoric?', options: ['An appeal to credibility','An appeal to emotion','An appeal to logic','An appeal to authority'], answer: 'An appeal to emotion' },
  { question: 'What is "the concept of logos" in rhetoric?', options: ['An appeal to emotion','An appeal to credibility','An appeal to logic and reason','An appeal to authority'], answer: 'An appeal to logic and reason' },
  { question: 'What is "the concept of the ideological state apparatus" (Althusser) in relation to texts?', options: ['A type of grammar','Institutions (schools, media, religion) that reproduce ideology through texts and practices','A type of vocabulary','A type of punctuation'], answer: 'Institutions (schools, media, religion) that reproduce ideology through texts and practices' },
];

export default function TextTypesGame() {
  return (
    <>
      <Helmet>
        <title>Text Types — Sodafom</title>
        <meta name="description" content="Identify and understand different types of texts!" />
        <link rel="canonical" href="https://sodafom.uk/games/text-types" />
        <meta property="og:title" content="Text Types — Sodafom" />
        <meta property="og:description" content="Identify and understand different types of texts!" />
        <meta property="og:url" content="https://sodafom.uk/games/text-types" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Text Types — English Game for Kids — Sodafom</h1>
      <GameShell title="Text Types" emoji="📄" subject="reading" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="text-types"
            title="Text Types"
            emoji="📄"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
