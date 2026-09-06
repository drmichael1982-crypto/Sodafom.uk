import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is a contents page?', options: ['A page with pictures','A list of chapters and page numbers','A glossary of words','A summary of the book'], answer: 'A list of chapters and page numbers' },
  { question: 'What is a heading?', options: ['A type of punctuation','A title for a section of text','A type of sentence','A type of paragraph'], answer: 'A title for a section of text' },
  { question: 'What is a subheading?', options: ['A main title','A smaller title that introduces a new section','A type of sentence','A type of paragraph'], answer: 'A smaller title that introduces a new section' },
  { question: 'What is a caption?', options: ['A type of heading','Text that explains a picture or diagram','A type of bullet point','A type of subheading'], answer: 'Text that explains a picture or diagram' },
  { question: 'What is a bullet point used for?', options: ['To end a sentence','To list items clearly','To start a paragraph','To add punctuation'], answer: 'To list items clearly' },
  { question: 'What is bold text used for?', options: ['To make text smaller','To emphasise important words','To make text italic','To add colour'], answer: 'To emphasise important words' },
  { question: 'What is a diagram?', options: ['A type of story','A visual representation of information','A type of poem','A type of letter'], answer: 'A visual representation of information' },
  { question: 'What is a label on a diagram?', options: ['A type of heading','A word or phrase identifying a part of the diagram','A type of caption','A type of title'], answer: 'A word or phrase identifying a part of the diagram' },
  { question: 'What does a glossary contain?', options: ['A list of chapters','A list of difficult words and their meanings','A summary of the book','An index of names'], answer: 'A list of difficult words and their meanings' },
  { question: 'What is an index?', options: ['A list of chapters','A list of topics and the pages they appear on','A summary','A glossary'], answer: 'A list of topics and the pages they appear on' },
  { question: 'What does "skim reading" mean?', options: ['Reading every word carefully','Reading quickly to get the main idea','Reading aloud','Reading backwards'], answer: 'Reading quickly to get the main idea' },
  { question: 'What does "scan reading" mean?', options: ['Reading every word','Reading quickly to find specific information','Reading aloud','Reading slowly'], answer: 'Reading quickly to find specific information' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the purpose of a contents page?', options: ['To summarise the book','To list chapters and page numbers','To explain difficult words','To list the author\'s other books'], answer: 'To list chapters and page numbers' },
  { question: 'What is a glossary?', options: ['A list of contents','A list of difficult words and their meanings','A summary of the book','An index of names'], answer: 'A list of difficult words and their meanings' },
  { question: 'What does a subheading do?', options: ['Ends a section','Introduces a new section or topic','Summarises the whole text','Lists key words'], answer: 'Introduces a new section or topic' },
  { question: 'What is a bibliography?', options: ['A list of contents','A list of sources used','A glossary','An index'], answer: 'A list of sources used' },
  { question: 'What is a text feature?', options: ['A type of story','An element that helps organise or explain text (e.g. headings, diagrams)','A type of sentence','A type of punctuation'], answer: 'An element that helps organise or explain text (e.g. headings, diagrams)' },
  { question: 'What is the purpose of a diagram in a non-fiction text?', options: ['To make the text longer','To show information visually','To replace the text','To add colour'], answer: 'To show information visually' },
  { question: 'What is a fact box?', options: ['A type of story','A box containing key facts about a topic','A type of poem','A type of letter'], answer: 'A box containing key facts about a topic' },
  { question: 'What is a timeline?', options: ['A type of clock','A visual representation of events in chronological order','A type of diagram','A type of graph'], answer: 'A visual representation of events in chronological order' },
  { question: 'What is a cross-section diagram?', options: ['A diagram showing the outside of something','A diagram showing the inside of something cut through','A diagram showing the top of something','A diagram showing the bottom of something'], answer: 'A diagram showing the inside of something cut through' },
  { question: 'What is a flow chart?', options: ['A type of bar chart','A diagram showing steps or a process in order','A type of pie chart','A type of line graph'], answer: 'A diagram showing steps or a process in order' },
  { question: 'What is a primary source?', options: ['A source written by someone else','An original source from the time being studied','A textbook','A secondary source'], answer: 'An original source from the time being studied' },
  { question: 'What is a secondary source?', options: ['An original source from the time being studied','A source that analyses or interprets primary sources','A type of diagram','A type of glossary'], answer: 'A source that analyses or interprets primary sources' },
];
const L3: QuizQuestion[] = [
  { question: 'What is a "peer-reviewed source"?', options: ['A source written by a friend','A source checked by experts in the field before publication','A source from a newspaper','A source from a website'], answer: 'A source checked by experts in the field before publication' },
  { question: 'What is "academic integrity"?', options: ['Copying from other sources','Being honest and ethical in academic work, including citing sources','Writing quickly','Writing neatly'], answer: 'Being honest and ethical in academic work, including citing sources' },
  { question: 'What is "plagiarism"?', options: ['Citing your sources correctly','Using someone else\'s work without acknowledgement','Writing in your own words','Summarising a source'], answer: 'Using someone else\'s work without acknowledgement' },
  { question: 'What is "paraphrasing"?', options: ['Copying text word for word','Expressing someone else\'s ideas in your own words','Quoting directly','Summarising the whole text'], answer: 'Expressing someone else\'s ideas in your own words' },
  { question: 'What is "synthesising" information?', options: ['Copying from one source','Combining information from multiple sources to form a new understanding','Summarising one source','Quoting from one source'], answer: 'Combining information from multiple sources to form a new understanding' },
  { question: 'What is "evaluating a source"?', options: ['Reading a source quickly','Assessing the reliability, relevance and bias of a source','Copying from a source','Summarising a source'], answer: 'Assessing the reliability, relevance and bias of a source' },
  { question: 'What is the CRAAP test used for?', options: ['Testing reading speed','Evaluating sources (Currency, Relevance, Authority, Accuracy, Purpose)','Testing comprehension','Testing vocabulary'], answer: 'Evaluating sources (Currency, Relevance, Authority, Accuracy, Purpose)' },
  { question: 'What is "lateral reading"?', options: ['Reading from left to right','Checking a source by reading other sources about it','Reading quickly','Reading slowly'], answer: 'Checking a source by reading other sources about it' },
  { question: 'What is "confirmation bias"?', options: ['Seeking information that confirms existing beliefs','Seeking information that challenges existing beliefs','Reading all sources equally','Evaluating sources carefully'], answer: 'Seeking information that confirms existing beliefs' },
  { question: 'What is "misinformation"?', options: ['Deliberately false information','False information spread without intent to deceive','True information','Biased information'], answer: 'False information spread without intent to deceive' },
  { question: 'What is "disinformation"?', options: ['False information spread without intent to deceive','Deliberately false information spread to deceive','True information','Biased information'], answer: 'Deliberately false information spread to deceive' },
  { question: 'What is "media literacy"?', options: ['The ability to read quickly','The ability to access, analyse, evaluate and create media','The ability to write well','The ability to use technology'], answer: 'The ability to access, analyse, evaluate and create media' },
];
const L4: QuizQuestion[] = [
  { question: 'What is "information architecture"?', options: ['The design of buildings','The organisation and structure of information to aid understanding','The design of websites only','The design of books only'], answer: 'The organisation and structure of information to aid understanding' },
  { question: 'What is "data visualisation"?', options: ['A type of graph','The representation of data in visual form to aid understanding','A type of table','A type of diagram'], answer: 'The representation of data in visual form to aid understanding' },
  { question: 'What is "hypertext"?', options: ['Very large text','Text with links to other text or resources','A type of font','A type of formatting'], answer: 'Text with links to other text or resources' },
  { question: 'What is "non-linear reading"?', options: ['Reading from beginning to end','Reading that does not follow a fixed sequence (e.g. following hyperlinks)','Reading backwards','Reading quickly'], answer: 'Reading that does not follow a fixed sequence (e.g. following hyperlinks)' },
  { question: 'What is "digital literacy"?', options: ['The ability to read digital text only','The ability to use, evaluate and create digital content effectively and safely','The ability to type quickly','The ability to use social media'], answer: 'The ability to use, evaluate and create digital content effectively and safely' },
  { question: 'What is "algorithmic bias"?', options: ['A type of computer error','Systematic unfairness in algorithms that can affect what information people see','A type of programming language','A type of data storage'], answer: 'Systematic unfairness in algorithms that can affect what information people see' },
  { question: 'What is a "filter bubble"?', options: ['A type of internet filter','A state where algorithms show only content that matches existing views','A type of social media','A type of search engine'], answer: 'A state where algorithms show only content that matches existing views' },
  { question: 'What is "echo chamber"?', options: ['A type of room','An environment where people only encounter views that reinforce their own','A type of social media','A type of search engine'], answer: 'An environment where people only encounter views that reinforce their own' },
  { question: 'What is "source triangulation"?', options: ['Using one source','Verifying information by checking multiple independent sources','Using two sources','Using only primary sources'], answer: 'Verifying information by checking multiple independent sources' },
  { question: 'What is "open access" in publishing?', options: ['Research that is freely available to everyone online','Research that requires payment to access','Research that is only available in libraries','Research that is only available to academics'], answer: 'Research that is freely available to everyone online' },
  { question: 'What is "citation"?', options: ['Copying text without acknowledgement','Acknowledging the source of information you have used','Summarising a source','Paraphrasing a source'], answer: 'Acknowledging the source of information you have used' },
  { question: 'What is "annotated bibliography"?', options: ['A list of sources with no description','A list of sources with a brief description and evaluation of each','A list of contents','A glossary'], answer: 'A list of sources with a brief description and evaluation of each' },
];
const L5: QuizQuestion[] = [
  { question: 'What is "epistemology"?', options: ['The study of language','The study of knowledge — what it is, how we acquire it, and its limits','The study of ethics','The study of logic'], answer: 'The study of knowledge — what it is, how we acquire it, and its limits' },
  { question: 'What is "hermeneutics"?', options: ['The study of grammar','The theory and practice of interpretation, especially of texts','The study of vocabulary','The study of punctuation'], answer: 'The theory and practice of interpretation, especially of texts' },
  { question: 'What is "semiotics"?', options: ['The study of grammar','The study of signs and symbols and their use or interpretation','The study of vocabulary','The study of punctuation'], answer: 'The study of signs and symbols and their use or interpretation' },
  { question: 'What is "the signifier and the signified" (Saussure)?', options: ['The signifier is the sound/image; the signified is the concept it represents','The signifier is the concept; the signified is the sound/image','Both are the same thing','Neither has meaning without context'], answer: 'The signifier is the sound/image; the signified is the concept it represents' },
  { question: 'What is "the arbitrariness of the sign" (Saussure)?', options: ['Signs always have a natural connection to what they represent','The relationship between signifier and signified is arbitrary (conventional, not natural)','Signs are always visual','Signs are always verbal'], answer: 'The relationship between signifier and signified is arbitrary (conventional, not natural)' },
  { question: 'What is "the rhizome" as a model of knowledge (Deleuze and Guattari)?', options: ['A hierarchical, tree-like model','A non-hierarchical, multi-directional model of knowledge with no fixed centre','A linear model','A circular model'], answer: 'A non-hierarchical, multi-directional model of knowledge with no fixed centre' },
  { question: 'What is "Foucault\'s concept of discourse"?', options: ['A type of grammar','A system of knowledge and power that shapes what can be said and thought','A type of vocabulary','A type of punctuation'], answer: 'A system of knowledge and power that shapes what can be said and thought' },
  { question: 'What is "the panopticon" (Foucault)?', options: ['A type of library','A metaphor for surveillance and power — the feeling of being always watched','A type of archive','A type of text'], answer: 'A metaphor for surveillance and power — the feeling of being always watched' },
  { question: 'What is "the archive" as a concept (Foucault)?', options: ['A physical storage of documents','The system of rules that determines what can be said in a given period','A type of library','A type of database'], answer: 'The system of rules that determines what can be said in a given period' },
  { question: 'What is "the concept of the simulacrum" (Baudrillard)?', options: ['A copy of something real','A copy of something that has no original — a representation without a referent','A type of metaphor','A type of simile'], answer: 'A copy of something that has no original — a representation without a referent' },
  { question: 'What is "hyperreality" (Baudrillard)?', options: ['A very realistic image','A condition where simulations replace reality and become more real than the real','A type of virtual reality','A type of augmented reality'], answer: 'A condition where simulations replace reality and become more real than the real' },
  { question: 'What is "the concept of the gaze" (Lacan/Mulvey)?', options: ['The act of looking','The power dynamics embedded in looking, especially in media and art','A type of metaphor','A type of simile'], answer: 'The power dynamics embedded in looking, especially in media and art' },
];

export default function ReadingMapGame() {
  return (
    <>
      <Helmet>
        <title>Reading Map — Sodafom</title>
        <meta name="description" content="Map out stories, characters, and plot structures!" />
        <link rel="canonical" href="https://sodafom.uk/games/reading-map" />
        <meta property="og:title" content="Reading Map — Sodafom" />
        <meta property="og:description" content="Map out stories, characters, and plot structures!" />
        <meta property="og:url" content="https://sodafom.uk/games/reading-map" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Reading Map — English Game for Kids — Sodafom</h1>
      <GameShell title="Reading Map" emoji="🗺️" subject="reading" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="reading-map"
            title="Reading Map"
            emoji="🗺️"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
