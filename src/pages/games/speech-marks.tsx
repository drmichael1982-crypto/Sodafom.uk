import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which sentence uses speech marks correctly?', options: ['"Hello," said Tom.','Hello," said Tom.','Hello, "said Tom."','"Hello, said Tom."'], answer: '"Hello," said Tom.' },
  { question: 'Which sentence uses speech marks correctly?', options: ['"Where are you going?" she asked.','Where are you going?" she asked.','Where are you going? she asked.','"Where are you going? she asked."'], answer: '"Where are you going?" she asked.' },
  { question: 'Where does the comma go in: "Come here" said Mum?', options: ['"Come here" said Mum.','Come here, said Mum.','"Come here," said Mum.','Come here said, Mum.'], answer: '"Come here," said Mum.' },
  { question: 'Which sentence is punctuated correctly?', options: ['"I am tired" she said.','I am tired," she said.','"I am tired," she said.','"I am tired", she said.'], answer: '"I am tired," she said.' },
  { question: 'What punctuation goes inside the speech marks?', options: ['Nothing','The comma or full stop','Only full stops','Only commas'], answer: 'The comma or full stop' },
  { question: 'Which sentence is correct?', options: ['"Stop!" he shouted.','"Stop"! he shouted.','Stop!" he shouted.','"Stop! he shouted."'], answer: '"Stop!" he shouted.' },
  { question: 'Which sentence is correct?', options: ['"Can I help?" asked the shopkeeper.','Can I help?" asked the shopkeeper.','"Can I help? asked the shopkeeper."','"Can I help", asked the shopkeeper.'], answer: '"Can I help?" asked the shopkeeper.' },
  { question: 'A new speaker starts on a…', options: ['New sentence','New paragraph','New chapter','New page'], answer: 'New paragraph' },
  { question: 'Which sentence is correct?', options: ['"I love reading," said Priya.','I love reading," said Priya.','"I love reading" said Priya.','"I love reading", said Priya.'], answer: '"I love reading," said Priya.' },
  { question: 'Which sentence is correct?', options: ['"We won!" cheered the team.','We won!" cheered the team.','"We won"! cheered the team.','"We won! cheered the team."'], answer: '"We won!" cheered the team.' },
  { question: 'Which sentence is correct?', options: ['"Let\'s go," she said.','"Let\'s go" she said.','"Let\'s go", she said.','Let\'s go," she said.'], answer: '"Let\'s go," she said.' },
  { question: 'Which sentence is correct?', options: ['"I\'m hungry," said Jack.','"I\'m hungry" said Jack.','"I\'m hungry", said Jack.','I\'m hungry," said Jack.'], answer: '"I\'m hungry," said Jack.' },
];
const L2: QuizQuestion[] = [
  { question: 'Which sentence correctly punctuates interrupted speech?', options: ['"I think," said Tom, "we should go."','"I think" said Tom "we should go."','"I think," said Tom "we should go."','"I think" said Tom, "we should go."'], answer: '"I think," said Tom, "we should go."' },
  { question: 'Which sentence correctly punctuates a question followed by a reporting clause?', options: ['"Are you ready?" she asked.','"Are you ready"? she asked.','"Are you ready?" She asked.','"Are you ready", she asked.'], answer: '"Are you ready?" she asked.' },
  { question: 'Which sentence correctly punctuates an exclamation followed by a reporting clause?', options: ['"Watch out!" he yelled.','"Watch out"! he yelled.','"Watch out!" He yelled.','"Watch out", he yelled.'], answer: '"Watch out!" he yelled.' },
  { question: 'Which sentence correctly uses a colon before speech?', options: ['She said: "I\'m ready."','She said, "I\'m ready."','She said "I\'m ready."','She said; "I\'m ready."'], answer: 'She said: "I\'m ready."' },
  { question: 'Which sentence correctly punctuates speech that ends with a full stop?', options: ['"I am going home," she said.','"I am going home." she said.','"I am going home", she said.','"I am going home" she said.'], answer: '"I am going home," she said.' },
  { question: 'Which sentence correctly punctuates speech that starts mid-sentence?', options: ['She whispered, "Follow me."','She whispered "Follow me."','She whispered; "Follow me."','She whispered: "Follow me."'], answer: 'She whispered, "Follow me."' },
  { question: 'Which sentence correctly punctuates a long speech split by a reporting clause?', options: ['"I was walking home," he explained, "when I saw it."','"I was walking home" he explained, "when I saw it."','"I was walking home," he explained "when I saw it."','"I was walking home" he explained "when I saw it."'], answer: '"I was walking home," he explained, "when I saw it."' },
  { question: 'Which sentence correctly uses a reporting clause before speech?', options: ['Tom said, "I\'m ready."','Tom said "I\'m ready."','Tom said; "I\'m ready."','Tom said: "I\'m ready."'], answer: 'Tom said, "I\'m ready."' },
  { question: 'Which sentence correctly punctuates speech ending with a question mark?', options: ['"Where are you?" she called.','"Where are you"? she called.','"Where are you?" She called.','"Where are you", she called.'], answer: '"Where are you?" she called.' },
  { question: 'Which sentence correctly punctuates speech ending with an exclamation mark?', options: ['"Help!" he cried.','"Help"! he cried.','"Help!" He cried.','"Help", he cried.'], answer: '"Help!" he cried.' },
  { question: 'Which sentence correctly punctuates speech with a comma before the reporting clause?', options: ['"I\'m tired," she yawned.','"I\'m tired." she yawned.','"I\'m tired" she yawned.','"I\'m tired"; she yawned.'], answer: '"I\'m tired," she yawned.' },
  { question: 'Which sentence correctly uses a new paragraph for a new speaker?', options: ['"Hello," said Tom. "Hi," said Mia.','"Hello," said Tom.\n"Hi," said Mia.','"Hello," said Tom, "Hi," said Mia.','"Hello," said Tom; "Hi," said Mia.'], answer: '"Hello," said Tom.\n"Hi," said Mia.' },
];
const L3: QuizQuestion[] = [
  { question: 'Which sentence correctly punctuates speech with an embedded reporting clause?', options: ['"I believe," she said quietly, "that we are lost."','"I believe" she said quietly, "that we are lost."','"I believe," she said quietly "that we are lost."','"I believe" she said quietly "that we are lost."'], answer: '"I believe," she said quietly, "that we are lost."' },
  { question: 'Which sentence correctly uses a semicolon in dialogue?', options: ['"I am tired; I need to rest," she said.','"I am tired; I need to rest" she said.','"I am tired; I need to rest", she said.','"I am tired; I need to rest." she said.'], answer: '"I am tired; I need to rest," she said.' },
  { question: 'Which sentence correctly punctuates a question within a statement?', options: ['She asked herself, "What should I do?"','She asked herself "What should I do?"','She asked herself, "What should I do"?','She asked herself "What should I do"?'], answer: 'She asked herself, "What should I do?"' },
  { question: 'Which sentence correctly uses a dash in dialogue?', options: ['"I was going to say—" he began, but she cut him off.','"I was going to say—" he began but she cut him off.','"I was going to say—" he began, but she cut him off','"I was going to say—" he began but she cut him off.'], answer: '"I was going to say—" he began, but she cut him off.' },
  { question: 'Which sentence correctly punctuates a quotation within a quotation?', options: ['She said, "He told me \'I love you.\'"','She said, "He told me "I love you.""','She said "He told me \'I love you.\'"','She said, \'He told me "I love you."\''], answer: 'She said, "He told me \'I love you.\'"' },
  { question: 'Which sentence correctly uses an ellipsis in dialogue?', options: ['"I don\'t know..." she trailed off.','"I don\'t know..." She trailed off.','"I don\'t know"... she trailed off.','"I don\'t know..." she trailed off'], answer: '"I don\'t know..." she trailed off.' },
  { question: 'Which sentence correctly punctuates a long speech with multiple sentences?', options: ['"Come in. Sit down. Make yourself comfortable," she said.','"Come in. Sit down. Make yourself comfortable." she said.','"Come in. Sit down. Make yourself comfortable", she said.','"Come in. Sit down. Make yourself comfortable" she said.'], answer: '"Come in. Sit down. Make yourself comfortable," she said.' },
  { question: 'Which sentence correctly uses a colon to introduce a list in speech?', options: ['"I need three things: bread, milk and eggs," she said.','"I need three things: bread, milk and eggs" she said.','"I need three things: bread, milk and eggs", she said.','"I need three things: bread, milk and eggs." she said.'], answer: '"I need three things: bread, milk and eggs," she said.' },
  { question: 'Which sentence correctly punctuates a rhetorical question in speech?', options: ['"Is this really the best we can do?" he demanded.','"Is this really the best we can do?" He demanded.','"Is this really the best we can do"? he demanded.','"Is this really the best we can do", he demanded.'], answer: '"Is this really the best we can do?" he demanded.' },
  { question: 'Which sentence correctly punctuates an exclamation followed by a question?', options: ['"Help! Is anyone there?" she cried.','"Help! Is anyone there?" She cried.','"Help! Is anyone there"? she cried.','"Help! Is anyone there", she cried.'], answer: '"Help! Is anyone there?" she cried.' },
  { question: 'Which sentence correctly uses parentheses in dialogue?', options: ['"The answer (as I have said before) is no," he replied.','"The answer (as I have said before) is no" he replied.','"The answer (as I have said before) is no", he replied.','"The answer (as I have said before) is no." he replied.'], answer: '"The answer (as I have said before) is no," he replied.' },
  { question: 'Which sentence correctly punctuates speech that begins mid-sentence?', options: ['He whispered, "Follow me closely."','He whispered "Follow me closely."','He whispered; "Follow me closely."','He whispered: "Follow me closely."'], answer: 'He whispered, "Follow me closely."' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the difference between direct and indirect speech?', options: ['Direct speech quotes exact words; indirect speech reports what was said','They are the same thing','Indirect speech quotes exact words; direct speech reports','Direct speech uses past tense; indirect speech uses present tense'], answer: 'Direct speech quotes exact words; indirect speech reports what was said' },
  { question: 'Convert to indirect speech: "I am tired," she said.', options: ['She said that she was tired.','She said that she is tired.','She said that I am tired.','She said that she will be tired.'], answer: 'She said that she was tired.' },
  { question: 'Convert to indirect speech: "I will come tomorrow," he said.', options: ['He said that he would come the next day.','He said that he will come tomorrow.','He said that he came the next day.','He said that he comes tomorrow.'], answer: 'He said that he would come the next day.' },
  { question: 'Convert to indirect speech: "Are you ready?" she asked.', options: ['She asked if I was ready.','She asked if I am ready.','She asked if I will be ready.','She asked if I were ready.'], answer: 'She asked if I was ready.' },
  { question: 'What tense shift occurs when converting direct to indirect speech?', options: ['Present → future','Present → past (backshift)','Past → present','Future → present'], answer: 'Present → past (backshift)' },
  { question: 'What happens to "tomorrow" in indirect speech?', options: ['It stays as "tomorrow"','It becomes "the next day"','It becomes "yesterday"','It becomes "today"'], answer: 'It becomes "the next day"' },
  { question: 'What happens to "here" in indirect speech?', options: ['It stays as "here"','It becomes "there"','It becomes "nearby"','It becomes "somewhere"'], answer: 'It becomes "there"' },
  { question: 'What happens to "this" in indirect speech?', options: ['It stays as "this"','It becomes "that"','It becomes "these"','It becomes "those"'], answer: 'It becomes "that"' },
  { question: 'Convert to indirect speech: "I have finished my work," Tom said.', options: ['Tom said that he had finished his work.','Tom said that he has finished his work.','Tom said that he finished his work.','Tom said that he will finish his work.'], answer: 'Tom said that he had finished his work.' },
  { question: 'Convert to indirect speech: "Don\'t touch that!" she warned.', options: ['She warned me not to touch that.','She warned me that I don\'t touch that.','She warned me that I won\'t touch that.','She warned me that I shouldn\'t touch that.'], answer: 'She warned me not to touch that.' },
  { question: 'What is "free indirect speech"?', options: ['Direct speech without quotation marks','A technique blending narrator\'s voice with character\'s thoughts/speech','Indirect speech without "that"','A type of reported speech'], answer: 'A technique blending narrator\'s voice with character\'s thoughts/speech' },
  { question: 'Which sentence is an example of free indirect speech?', options: ['"She was tired," he said.','She said she was tired.','She was tired. What was the point of going on?','She said, "I am tired."'], answer: 'She was tired. What was the point of going on?' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the "say/tell" distinction in reported speech?', options: ['"Say" does not need an object; "tell" requires a person as object','They are interchangeable','Both require an object','Neither requires an object'], answer: '"Say" does not need an object; "tell" requires a person as object' },
  { question: 'What is "speech act theory" (Austin)?', options: ['The study of how words are pronounced','The theory that utterances perform actions (locutionary, illocutionary, perlocutionary)','The study of grammar','The study of vocabulary'], answer: 'The theory that utterances perform actions (locutionary, illocutionary, perlocutionary)' },
  { question: 'What is a "locutionary act"?', options: ['The implied meaning of an utterance','The act of saying something (the literal meaning)','The effect of an utterance on the listener','A type of metaphor'], answer: 'The act of saying something (the literal meaning)' },
  { question: 'What is an "illocutionary act"?', options: ['The literal meaning of an utterance','The intended action performed by an utterance (e.g. promising, warning)','The effect on the listener','A type of metaphor'], answer: 'The intended action performed by an utterance (e.g. promising, warning)' },
  { question: 'What is a "perlocutionary act"?', options: ['The literal meaning of an utterance','The intended action','The actual effect of an utterance on the listener','A type of metaphor'], answer: 'The actual effect of an utterance on the listener' },
  { question: 'What is "conversational implicature" (Grice)?', options: ['The literal meaning of an utterance','What is implied but not directly stated, based on cooperative principles','A type of metaphor','A type of simile'], answer: 'What is implied but not directly stated, based on cooperative principles' },
  { question: 'What is "politeness theory" (Brown and Levinson)?', options: ['The study of polite language only','A theory of how speakers manage face (positive and negative) in interaction','The study of formal language','The study of informal language'], answer: 'A theory of how speakers manage face (positive and negative) in interaction' },
  { question: 'What is "positive face"?', options: ['The desire to be approved of and liked','The desire to be left alone','A type of metaphor','A type of simile'], answer: 'The desire to be approved of and liked' },
  { question: 'What is "negative face"?', options: ['The desire to be approved of','The desire to be free from imposition and have autonomy','A type of metaphor','A type of simile'], answer: 'The desire to be free from imposition and have autonomy' },
  { question: 'What is "code-switching"?', options: ['Changing from one programming language to another','Alternating between languages or dialects in conversation','A type of metaphor','A type of simile'], answer: 'Alternating between languages or dialects in conversation' },
  { question: 'What is "diglossia"?', options: ['A language disorder','A situation where two varieties of a language are used in different social contexts','A type of metaphor','A type of simile'], answer: 'A situation where two varieties of a language are used in different social contexts' },
  { question: 'What is "the cooperative principle" (Grice)?', options: ['Speakers should always be polite','Speakers should make their contribution appropriate to the conversation\'s purpose','Speakers should always be truthful','Speakers should always be brief'], answer: 'Speakers should make their contribution appropriate to the conversation\'s purpose' },
];

export default function SpeechMarksGame() {
  return (
    <>
      <Helmet>
        <title>Speech Marks — Sodafom</title>
        <meta name="description" content="Master the use of speech marks and direct speech!" />
        <link rel="canonical" href="https://sodafom.uk/games/speech-marks" />
        <meta property="og:title" content="Speech Marks — Sodafom" />
        <meta property="og:description" content="Master the use of speech marks and direct speech!" />
        <meta property="og:url" content="https://sodafom.uk/games/speech-marks" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Speech Marks — English Game for Kids — Sodafom</h1>
      <GameShell title="Speech Marks" emoji="💬" subject="reading" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="speech-marks"
            title="Speech Marks"
            emoji="💬"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
