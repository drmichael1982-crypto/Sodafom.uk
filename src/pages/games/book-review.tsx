import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is a genre?', options: ['A type of character','A type of setting','A category of book (e.g. mystery, adventure, fantasy)','A type of plot'], answer: 'A category of book (e.g. mystery, adventure, fantasy)' },
  { question: 'What is a protagonist?', options: ['The villain','The main character','A supporting character','The narrator'], answer: 'The main character' },
  { question: 'What is a plot?', options: ['The setting of a story','The sequence of events in a story','The theme of a story','The characters in a story'], answer: 'The sequence of events in a story' },
  { question: 'What is a setting?', options: ['The plot','The characters','The time and place where a story takes place','The theme'], answer: 'The time and place where a story takes place' },
  { question: 'What is a character?', options: ['A person or animal in a story','The setting','The plot','The theme'], answer: 'A person or animal in a story' },
  { question: 'What is a fiction book?', options: ['A book about real events','A made-up story','A book of facts','A dictionary'], answer: 'A made-up story' },
  { question: 'What is a non-fiction book?', options: ['A made-up story','A book about real facts and events','A fairy tale','A poem'], answer: 'A book about real facts and events' },
  { question: 'What is an author?', options: ['The person who draws the pictures','The person who writes the book','The person who publishes the book','The person who sells the book'], answer: 'The person who writes the book' },
  { question: 'What is an illustrator?', options: ['The person who writes the book','The person who draws the pictures','The person who publishes the book','The person who sells the book'], answer: 'The person who draws the pictures' },
  { question: 'What is a blurb?', options: ['A chapter heading','A short description on the back of a book','The first chapter','The last chapter'], answer: 'A short description on the back of a book' },
  { question: 'What is a chapter?', options: ['A type of book','A section of a book','A type of character','A type of setting'], answer: 'A section of a book' },
  { question: 'What is a series?', options: ['A single book','A group of books with the same characters or setting','A type of genre','A type of plot'], answer: 'A group of books with the same characters or setting' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the purpose of a book review?', options: ['To retell the whole story','To share your opinion and help others decide if they want to read it','To summarise every chapter','To list all the characters'], answer: 'To share your opinion and help others decide if they want to read it' },
  { question: 'What should a book review include?', options: ['Only the ending','Title, author, brief summary, your opinion and a recommendation','Every detail of the plot','Only the characters'], answer: 'Title, author, brief summary, your opinion and a recommendation' },
  { question: 'What is a spoiler?', options: ['A type of book','Revealing important plot details that ruin the surprise','A type of character','A type of genre'], answer: 'Revealing important plot details that ruin the surprise' },
  { question: 'What is an antagonist?', options: ['The main character','The narrator','The character who opposes the protagonist','A supporting character'], answer: 'The character who opposes the protagonist' },
  { question: 'What is a theme?', options: ['The setting','The plot','The central idea or message of a story','The characters'], answer: 'The central idea or message of a story' },
  { question: 'What does "recommend" mean in a book review?', options: ['To criticise','To suggest others should read it','To summarise','To describe the characters'], answer: 'To suggest others should read it' },
  { question: 'What is a narrative perspective?', options: ['The setting of a story','The point of view from which a story is told','The theme of a story','The plot of a story'], answer: 'The point of view from which a story is told' },
  { question: 'What is first-person narration?', options: ['The story is told by a character using "I"','The story is told by an outside narrator','The story is told by multiple characters','The story is told in the future tense'], answer: 'The story is told by a character using "I"' },
  { question: 'What is third-person narration?', options: ['The story is told by a character using "I"','The story is told by an outside narrator using "he/she/they"','The story is told in the future tense','The story is told by multiple characters'], answer: 'The story is told by an outside narrator using "he/she/they"' },
  { question: 'What is character development?', options: ['How a character looks','How a character changes throughout a story','How a character speaks','How a character moves'], answer: 'How a character changes throughout a story' },
  { question: 'What is a cliffhanger?', options: ['A type of setting','An ending that leaves the reader in suspense','A type of character','A type of theme'], answer: 'An ending that leaves the reader in suspense' },
  { question: 'What is a sequel?', options: ['A book that comes before another','A book that continues the story of a previous book','A book in a different genre','A book by a different author'], answer: 'A book that continues the story of a previous book' },
];
const L3: QuizQuestion[] = [
  { question: 'What is an unreliable narrator?', options: ['A narrator who always tells the truth','A narrator whose account may be biased or inaccurate','A narrator who is a child','A narrator who is not the main character'], answer: 'A narrator whose account may be biased or inaccurate' },
  { question: 'What is foreshadowing?', options: ['Looking back at past events','Hinting at future events in a story','Describing the setting in detail','Introducing a new character'], answer: 'Hinting at future events in a story' },
  { question: 'What is flashback?', options: ['A scene that jumps forward in time','A scene that returns to an earlier time','A scene that describes the setting','A scene that introduces a new character'], answer: 'A scene that returns to an earlier time' },
  { question: 'What is dramatic irony?', options: ['When a character says the opposite of what they mean','When the audience knows something a character does not','When two characters disagree','When the ending is unexpected'], answer: 'When the audience knows something a character does not' },
  { question: 'What is a motif?', options: ['The main theme of a story','A recurring element that has symbolic significance','A type of character','A type of setting'], answer: 'A recurring element that has symbolic significance' },
  { question: 'What is the difference between plot and story?', options: ['They are the same thing','Plot is the sequence of events; story includes all events in chronological order','Story is the sequence of events; plot includes all events in chronological order','Plot is the theme; story is the setting'], answer: 'Plot is the sequence of events; story includes all events in chronological order' },
  { question: 'What is a round character?', options: ['A character who does not change','A complex, fully developed character who may change','A character who is always happy','A character who is always sad'], answer: 'A complex, fully developed character who may change' },
  { question: 'What is a flat character?', options: ['A complex, fully developed character','A simple character with one or two traits who does not change','A character who is always happy','A character who is always sad'], answer: 'A simple character with one or two traits who does not change' },
  { question: 'What is a dynamic character?', options: ['A character who does not change','A character who undergoes significant change','A character who is always active','A character who is always passive'], answer: 'A character who undergoes significant change' },
  { question: 'What is a static character?', options: ['A character who undergoes significant change','A character who does not change throughout the story','A character who is always active','A character who is always passive'], answer: 'A character who does not change throughout the story' },
  { question: 'What is the narrative arc?', options: ['The setting of a story','The overall structure of a story from beginning to end','The theme of a story','The characters in a story'], answer: 'The overall structure of a story from beginning to end' },
  { question: 'What is the climax of a story?', options: ['The beginning','The point of highest tension or turning point','The resolution','The falling action'], answer: 'The point of highest tension or turning point' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the concept of intertextuality?', options: ['A text that references or is influenced by other texts','A text that has no references','A text that is entirely original','A text that only references historical events'], answer: 'A text that references or is influenced by other texts' },
  { question: 'What is a frame narrative?', options: ['A story within a story','A story with no plot','A story with only one character','A story with no setting'], answer: 'A story within a story' },
  { question: 'What is the concept of the implied author?', options: ['The real author of a text','The version of the author implied by the text\'s values and style','The narrator of a text','The main character of a text'], answer: 'The version of the author implied by the text\'s values and style' },
  { question: 'What is the concept of the implied reader?', options: ['The actual reader of a text','The ideal reader the text seems to be written for','The narrator of a text','The main character of a text'], answer: 'The ideal reader the text seems to be written for' },
  { question: 'What is the concept of polyphony in literature?', options: ['A text with multiple independent voices or perspectives','A text with only one voice','A text with no dialogue','A text with only one character'], answer: 'A text with multiple independent voices or perspectives' },
  { question: 'What is the concept of defamiliarisation?', options: ['Making the familiar seem strange to encourage fresh perception','Making the strange seem familiar','Describing a setting in detail','Introducing a new character'], answer: 'Making the familiar seem strange to encourage fresh perception' },
  { question: 'What is the concept of the unreliable narrator in postmodern fiction?', options: ['A narrator who deliberately misleads the reader','A narrator who is always truthful','A narrator who is a child','A narrator who is not the main character'], answer: 'A narrator who deliberately misleads the reader' },
  { question: 'What is the concept of the anti-hero?', options: ['A traditional hero','A protagonist who lacks conventional heroic qualities','A villain','A supporting character'], answer: 'A protagonist who lacks conventional heroic qualities' },
  { question: 'What is the concept of the Bildungsroman?', options: ['A novel about a character\'s moral and psychological growth from youth to adulthood','A novel about war','A novel about romance','A novel about mystery'], answer: 'A novel about a character\'s moral and psychological growth from youth to adulthood' },
  { question: 'What is the concept of magical realism?', options: ['A genre where magical elements exist in a realistic world','A genre of pure fantasy','A genre of science fiction','A genre of horror'], answer: 'A genre where magical elements exist in a realistic world' },
  { question: 'What is the concept of the stream of consciousness technique?', options: ['A narrative technique that presents a character\'s thoughts as they occur','A narrative technique that presents events in chronological order','A narrative technique that uses multiple narrators','A narrative technique that uses flashbacks only'], answer: 'A narrative technique that presents a character\'s thoughts as they occur' },
  { question: 'What is the concept of the epistolary novel?', options: ['A novel told through letters, diary entries or documents','A novel with no dialogue','A novel with only one character','A novel with no plot'], answer: 'A novel told through letters, diary entries or documents' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of deconstruction in literary theory?', options: ['A method of reading that reveals contradictions and instabilities in a text','A method of summarising a text','A method of identifying the main theme','A method of analysing character'], answer: 'A method of reading that reveals contradictions and instabilities in a text' },
  { question: 'What is the concept of the death of the author (Barthes)?', options: ['The author\'s intentions are irrelevant; meaning is created by the reader','The author always controls meaning','The author\'s biography determines meaning','The author\'s intentions are the only source of meaning'], answer: 'The author\'s intentions are irrelevant; meaning is created by the reader' },
  { question: 'What is the concept of the hermeneutic circle?', options: ['Understanding a text requires understanding its parts, which requires understanding the whole','A circular plot structure','A type of narrative technique','A type of character development'], answer: 'Understanding a text requires understanding its parts, which requires understanding the whole' },
  { question: 'What is the concept of the carnivalesque (Bakhtin)?', options: ['The subversion of social hierarchies and norms in literature','A type of comedy','A type of tragedy','A type of romance'], answer: 'The subversion of social hierarchies and norms in literature' },
  { question: 'What is the concept of the uncanny (Freud/Unheimlich)?', options: ['The feeling of unease when something familiar becomes strange','A type of horror','A type of comedy','A type of tragedy'], answer: 'The feeling of unease when something familiar becomes strange' },
  { question: 'What is the concept of mimesis in literature?', options: ['The imitation or representation of reality in a text','The creation of an entirely fictional world','The use of metaphor','The use of symbolism'], answer: 'The imitation or representation of reality in a text' },
  { question: 'What is the concept of the sublime in literature?', options: ['An overwhelming sense of awe and terror in the face of greatness or power','A type of beauty','A type of comedy','A type of tragedy'], answer: 'An overwhelming sense of awe and terror in the face of greatness or power' },
  { question: 'What is the concept of the heteroglossia (Bakhtin)?', options: ['The diversity of voices, languages and perspectives within a text','A single unified voice in a text','A type of narrative technique','A type of character development'], answer: 'The diversity of voices, languages and perspectives within a text' },
  { question: 'What is the concept of the postcolonial gaze?', options: ['The way colonial power structures are reflected and challenged in literature','A type of narrative technique','A type of character development','A type of setting'], answer: 'The way colonial power structures are reflected and challenged in literature' },
  { question: 'What is the concept of the écriture féminine (Cixous)?', options: ['A type of writing that challenges patriarchal language and structures','A type of writing by women only','A type of writing about women','A type of writing in French'], answer: 'A type of writing that challenges patriarchal language and structures' },
  { question: 'What is the concept of the rhizome (Deleuze and Guattari) in literary theory?', options: ['A non-hierarchical, multi-directional model of knowledge and narrative','A hierarchical model of narrative','A linear model of narrative','A circular model of narrative'], answer: 'A non-hierarchical, multi-directional model of knowledge and narrative' },
  { question: 'What is the concept of the palimpsest in literature?', options: ['A text that carries traces of earlier texts beneath its surface','A text that is entirely original','A text that has no references','A text that is written in multiple languages'], answer: 'A text that carries traces of earlier texts beneath its surface' },
];

export default function BookReviewGame() {
  return (
    <>
      <Helmet>
        <title>Book Review — Sodafom</title>
        <meta name="description" content="Learn how to write and analyse book reviews!" />
        <link rel="canonical" href="https://sodafom.uk/games/book-review" />
        <meta property="og:title" content="Book Review — Sodafom" />
        <meta property="og:description" content="Learn how to write and analyse book reviews!" />
        <meta property="og:url" content="https://sodafom.uk/games/book-review" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Book Review — English Game for Kids — Sodafom</h1>
      <GameShell title="Book Review" emoji="📚" subject="reading" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="book-review"
            title="Book Review"
            emoji="📚"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
