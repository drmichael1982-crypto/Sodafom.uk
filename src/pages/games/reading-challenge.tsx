import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Read: "The cat sat on the mat." Where did the cat sit?', options: ['On the chair','On the mat','On the floor','On the table'], answer: 'On the mat' },
  { question: 'Read: "Tom has a red ball." What colour is the ball?', options: ['Blue','Green','Red','Yellow'], answer: 'Red' },
  { question: 'Read: "It was raining so Mia put on her coat." Why did Mia put on her coat?', options: ['She was cold','It was raining','She was going to school','She was tired'], answer: 'It was raining' },
  { question: 'Read: "Sam ate an apple for lunch." What did Sam eat?', options: ['A banana','A sandwich','An apple','A biscuit'], answer: 'An apple' },
  { question: 'Read: "The sun was shining and the birds were singing." What was the weather like?', options: ['Rainy','Cloudy','Sunny','Windy'], answer: 'Sunny' },
  { question: 'Read: "Lily has three cats." How many cats does Lily have?', options: ['One','Two','Three','Four'], answer: 'Three' },
  { question: 'Read: "Jack ran to catch the bus." Why did Jack run?', options: ['He was late for school','He wanted exercise','He was chasing a dog','He wanted to catch the bus'], answer: 'He wanted to catch the bus' },
  { question: 'Read: "The old man walked slowly with his stick." How did the old man walk?', options: ['Quickly','Slowly','Happily','Quietly'], answer: 'Slowly' },
  { question: 'Read: "Emma loves reading books about animals." What does Emma love?', options: ['Playing sport','Watching TV','Reading books about animals','Drawing pictures'], answer: 'Reading books about animals' },
  { question: 'Read: "Ben had five sweets but gave two to his sister." How many sweets did Ben have left?', options: ['Two','Three','Four','Five'], answer: 'Three' },
  { question: 'Read: "The children played in the park until it got dark." When did they stop playing?', options: ['When it started raining','When it got dark','When they were tired','When their mum called'], answer: 'When it got dark' },
  { question: 'Read: "The dog barked loudly at the postman." What did the dog do?', options: ['Ran away','Barked loudly','Sat quietly','Wagged its tail'], answer: 'Barked loudly' },
];
const L2: QuizQuestion[] = [
  { question: 'Read: "The ancient castle loomed over the village, its crumbling towers casting long shadows across the cobblestones." What is the mood?', options: ['Cheerful and bright','Eerie and foreboding','Calm and peaceful','Exciting and joyful'], answer: 'Eerie and foreboding' },
  { question: 'Read: "Despite her fear, Amara stepped forward." What does "despite" tell us?', options: ['Because of her fear','Even though she was afraid','After her fear passed','Before she was afraid'], answer: 'Even though she was afraid' },
  { question: 'Read: "The scientist peered through the microscope, her eyes widening with each passing second." What can we infer?', options: ['She is bored','She has found something surprising or exciting','She is tired','She is angry'], answer: 'She has found something surprising or exciting' },
  { question: 'Read: "Not a soul stirred in the empty streets." What does this mean?', options: ['People were dancing','Nobody was around','People were sleeping','People were hiding'], answer: 'Nobody was around' },
  { question: 'Read: "The letter had been read so many times the paper was soft as cloth." What can we infer?', options: ['The letter was new','The letter was very important to the reader','The letter was boring','The letter was short'], answer: 'The letter was very important to the reader' },
  { question: 'Read: "She was the last to arrive, as always." What does "as always" tell us?', options: ['She is usually early','She is usually late','This is the first time she was late','She is sometimes late'], answer: 'She is usually late' },
  { question: 'Read: "The twins were as different as chalk and cheese." What does this mean?', options: ['They both liked food','They were very similar','They were very different','They were the same age'], answer: 'They were very different' },
  { question: 'Read: "He swallowed hard before knocking on the door." What can we infer?', options: ['He was hungry','He was nervous','He was excited','He was angry'], answer: 'He was nervous' },
  { question: 'Read: "The room fell silent when she entered." What can we infer?', options: ['The room was always quiet','Her presence had a strong impact on the people there','The people were asleep','The people were bored'], answer: 'Her presence had a strong impact on the people there' },
  { question: 'Read: "Years of practice had made the movement second nature to her." What does "second nature" mean?', options: ['Something she had to think hard about','Something she could do automatically without thinking','Something she had learned recently','Something she found difficult'], answer: 'Something she could do automatically without thinking' },
  { question: 'Read: "He counted his coins for the third time." What can we infer?', options: ['He has lots of money','He is worried he does not have enough','He likes counting','He is bored'], answer: 'He is worried he does not have enough' },
  { question: 'Read: "She read the letter twice, then folded it carefully and put it away." What can we infer?', options: ['The letter was unimportant','The letter was important to her','She could not read it','She was bored'], answer: 'The letter was important to her' },
];
const L3: QuizQuestion[] = [
  { question: 'Read: "The politician\'s speech was met with thunderous applause, though few in the room believed a word of it." What literary device is used?', options: ['Simile','Metaphor','Irony','Personification'], answer: 'Irony' },
  { question: 'Read: "Her words were honey, sweet and sticky, impossible to resist." What literary device is used?', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Metaphor' },
  { question: 'Read: "The evidence, while circumstantial, pointed unmistakably in one direction." What does "circumstantial" mean?', options: ['Direct and conclusive','Based on inference rather than direct proof','Completely irrelevant','Deliberately misleading'], answer: 'Based on inference rather than direct proof' },
  { question: 'Read: "He was, to put it mildly, displeased." What technique is used?', options: ['Hyperbole','Litotes (understatement)','Metaphor','Simile'], answer: 'Litotes (understatement)' },
  { question: 'Read: "The city never sleeps." What literary device is used?', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Personification' },
  { question: 'Read: "She had a heart of gold." What literary device is used?', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Metaphor' },
  { question: 'Read: "The news spread like wildfire." What literary device is used?', options: ['Metaphor','Simile','Personification','Alliteration'], answer: 'Simile' },
  { question: 'Read: "The author\'s use of short, sharp sentences creates a sense of…"', options: ['Calm and relaxation','Urgency and tension','Sadness and loss','Joy and celebration'], answer: 'Urgency and tension' },
  { question: 'Read: "Despite the chaos around her, she remained an island of calm." What literary device is used?', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Metaphor' },
  { question: 'Read: "The question is not whether we can, but whether we should." What rhetorical device is used?', options: ['Anaphora','Antithesis','Alliteration','Hyperbole'], answer: 'Antithesis' },
  { question: 'Read: "We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields." What rhetorical device is used?', options: ['Antithesis','Alliteration','Anaphora','Hyperbole'], answer: 'Anaphora' },
  { question: 'Read: "The old photograph, yellowed and creased, told a story of its own." What can we infer?', options: ['The photograph was taken recently','The photograph was old and had been handled many times','The photograph was damaged deliberately','The photograph was unimportant'], answer: 'The photograph was old and had been handled many times' },
];
const L4: QuizQuestion[] = [
  { question: 'Read: "The text presents a binary opposition between civilisation and savagery." What does "binary opposition" mean?', options: ['Two similar ideas','Two opposing concepts that define each other','Two unrelated ideas','Two identical concepts'], answer: 'Two opposing concepts that define each other' },
  { question: 'Read: "The author\'s use of free indirect discourse blurs the boundary between narrator and character." What is free indirect discourse?', options: ['Direct speech','A technique where the narrator\'s voice merges with a character\'s thoughts','A type of flashback','A type of foreshadowing'], answer: 'A technique where the narrator\'s voice merges with a character\'s thoughts' },
  { question: 'Read: "The text is polyphonic, presenting multiple competing voices." What does "polyphonic" mean?', options: ['Having one voice','Having multiple independent voices or perspectives','Having no voice','Having a single narrator'], answer: 'Having multiple independent voices or perspectives' },
  { question: 'Read: "The author employs bathos to undercut the heroic tone." What is bathos?', options: ['A sudden rise from the ordinary to the sublime','A sudden descent from the sublime to the ridiculous','A type of metaphor','A type of simile'], answer: 'A sudden descent from the sublime to the ridiculous' },
  { question: 'Read: "The text is self-referential, drawing attention to its own status as a constructed artefact." What literary term describes this?', options: ['Intertextuality','Metafiction','Defamiliarisation','Polyphony'], answer: 'Metafiction' },
  { question: 'Read: "The author uses prolepsis to hint at future events." What is prolepsis?', options: ['A flashback','A flash-forward or anticipation of future events','A type of metaphor','A type of simile'], answer: 'A flash-forward or anticipation of future events' },
  { question: 'Read: "The text employs analepsis to reveal backstory." What is analepsis?', options: ['A flash-forward','A flashback to earlier events','A type of metaphor','A type of simile'], answer: 'A flashback to earlier events' },
  { question: 'Read: "The author uses epistrophe for emphasis." What is epistrophe?', options: ['Repetition of a word at the beginning of successive clauses','Repetition of a word at the end of successive clauses','A type of metaphor','A type of simile'], answer: 'Repetition of a word at the end of successive clauses' },
  { question: 'Read: "The text employs chiasmus: \'Ask not what your country can do for you, ask what you can do for your country.\'" What is chiasmus?', options: ['Repetition of the same word','A reversal of grammatical structures in successive phrases','A type of metaphor','A type of simile'], answer: 'A reversal of grammatical structures in successive phrases' },
  { question: 'Read: "The author uses zeugma: \'She lost her keys and her temper.\'" What is zeugma?', options: ['A type of metaphor','A single word governing two or more words in different senses','A type of simile','A type of personification'], answer: 'A single word governing two or more words in different senses' },
  { question: 'Read: "The text employs aposiopesis: \'If you do that again, I will—\'" What is aposiopesis?', options: ['A complete sentence','A sudden breaking off of speech for dramatic effect','A type of metaphor','A type of simile'], answer: 'A sudden breaking off of speech for dramatic effect' },
  { question: 'Read: "The author uses periphrasis: \'the celestial body that illuminates our days\' for \'the sun\'." What is periphrasis?', options: ['A direct description','Using more words than necessary to describe something','A type of metaphor','A type of simile'], answer: 'Using more words than necessary to describe something' },
];
const L5: QuizQuestion[] = [
  { question: 'Read: "The text enacts its meaning through form as well as content." What does this mean?', options: ['The form and content are unrelated','The way the text is structured contributes to its meaning','Only the content matters','Only the form matters'], answer: 'The way the text is structured contributes to its meaning' },
  { question: 'Read: "The author employs the technique of defamiliarisation." What is the purpose?', options: ['To make the familiar seem strange and encourage fresh perception','To make the strange seem familiar','To describe a setting in detail','To introduce a new character'], answer: 'To make the familiar seem strange and encourage fresh perception' },
  { question: 'Read: "The text is characterised by its heteroglossic quality." What does this mean?', options: ['It has a single unified voice','It contains a diversity of voices, languages and perspectives','It has no dialogue','It has only one character'], answer: 'It contains a diversity of voices, languages and perspectives' },
  { question: 'Read: "The author employs the technique of apophasis: \'I will not mention his many failures.\'" What is apophasis?', options: ['Mentioning something by saying you will not mention it','A type of metaphor','A type of simile','A type of personification'], answer: 'Mentioning something by saying you will not mention it' },
  { question: 'Read: "The text employs syllepsis: \'He took his hat and his leave.\'" What is syllepsis?', options: ['A type of metaphor','Using a word in two different senses simultaneously','A type of simile','A type of personification'], answer: 'Using a word in two different senses simultaneously' },
  { question: 'Read: "The author uses catachresis: \'the leg of the table.\'" What is catachresis?', options: ['A literal description','The use of a word in a way that is not its literal meaning, often creating a new metaphor','A type of simile','A type of personification'], answer: 'The use of a word in a way that is not its literal meaning, often creating a new metaphor' },
  { question: 'Read: "The text employs ekphrasis." What is ekphrasis?', options: ['A poem about nature','A vivid description of a work of visual art within a text','A type of metaphor','A type of simile'], answer: 'A vivid description of a work of visual art within a text' },
  { question: 'Read: "The author uses the technique of in medias res." What does this mean?', options: ['Starting at the beginning','Starting in the middle of the action','Starting at the end','Starting with a flashback'], answer: 'Starting in the middle of the action' },
  { question: 'Read: "The text employs the technique of the unreliable narrator to create epistemological uncertainty." What does "epistemological" mean?', options: ['Related to emotion','Related to knowledge and how we know things','Related to morality','Related to aesthetics'], answer: 'Related to knowledge and how we know things' },
  { question: 'Read: "The author employs the technique of the palimpsest." What is a palimpsest?', options: ['A text that carries traces of earlier texts beneath its surface','A text that is entirely original','A text that has no references','A text that is written in multiple languages'], answer: 'A text that carries traces of earlier texts beneath its surface' },
  { question: 'Read: "The text employs the technique of the mise en abyme." What is mise en abyme?', options: ['A story within a story that mirrors the outer story','A type of flashback','A type of foreshadowing','A type of metaphor'], answer: 'A story within a story that mirrors the outer story' },
  { question: 'Read: "The author employs the technique of the unreliable narrator to explore the limits of subjective experience." What philosophical concept does this relate to?', options: ['Objectivism','Solipsism and the limits of subjective knowledge','Determinism','Nihilism'], answer: 'Solipsism and the limits of subjective knowledge' },
];

export default function ReadingChallengeGame() {
  return (
    <>
      <Helmet>
        <title>Reading Challenge — Sodafom</title>
        <meta name="description" content="Challenge your reading comprehension skills!" />
        <link rel="canonical" href="https://sodafom.uk/games/reading-challenge" />
        <meta property="og:title" content="Reading Challenge — Sodafom" />
        <meta property="og:description" content="Challenge your reading comprehension skills!" />
        <meta property="og:url" content="https://sodafom.uk/games/reading-challenge" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Reading Challenge — English Game for Kids — Sodafom</h1>
      <GameShell title="Reading Challenge" emoji="📖" subject="reading" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="reading-challenge"
            title="Reading Challenge"
            emoji="📖"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
