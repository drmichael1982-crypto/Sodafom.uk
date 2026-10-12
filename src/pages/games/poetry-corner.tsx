import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';
import { POETRY_DISCOVERY_BANKS } from '@/lib/archie/reading-practice-banks';

const L1: QuizQuestion[] = [
  { question: 'What is a rhyme?', options: ['Words that start with the same sound','Words that end with the same sound','Words that mean the same thing','Words that are opposite'], answer: 'Words that end with the same sound' },
  { question: 'Which two words rhyme?', options: ['cat / dog','cat / hat','cat / run','cat / big'], answer: 'cat / hat' },
  { question: 'Which two words rhyme?', options: ['sun / moon','sun / fun','sun / sky','sun / rain'], answer: 'sun / fun' },
  { question: 'Which two words rhyme?', options: ['tree / flower','tree / bee','tree / leaf','tree / root'], answer: 'tree / bee' },
  { question: 'What is alliteration?', options: ['Rhyming words','Repeating the same starting sound','A type of poem','A comparison'], answer: 'Repeating the same starting sound' },
  { question: '"Peter Piper picked a peck of pickled peppers." This is an example of…', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Alliteration' },
  { question: 'In our haiku-style syllable activity, we use lines of 5, 7 and 5 syllables. How many lines is that?', options: ['Three lines','Four lines','Five lines'], answer: 'Three lines', hint: 'Each group of syllables is one line. This is one classroom pattern; not every haiku follows it.' },
  { question: 'In a 5–7–5 syllable poem, how many syllables are in the middle line?', options: ['5','7','9','11'], answer: '7' },
  { question: 'What is a stanza?', options: ['A single line of a poem','A group of lines in a poem','A type of rhyme','A type of rhythm'], answer: 'A group of lines in a poem' },
  { question: 'What is rhythm in poetry?', options: ['The pattern of rhymes','The pattern of stressed and unstressed syllables','The number of lines','The subject of the poem'], answer: 'The pattern of stressed and unstressed syllables' },
  { question: 'What is onomatopoeia?', options: ['A type of rhyme','A word that sounds like what it describes','A comparison','A type of poem'], answer: 'A word that sounds like what it describes' },
  { question: 'Which word is an example of onomatopoeia?', options: ['happy','beautiful','buzz','quickly'], answer: 'buzz' },
];
const L2: QuizQuestion[] = [
  { question: 'What is a simile?', options: ['Comparing using "like" or "as"','A made-up word','Repeating a sound','Giving objects human qualities'], answer: 'Comparing using "like" or "as"' },
  { question: 'What is a metaphor?', options: ['Comparing using "like" or "as"','Saying something IS something else','Repeating a sound','Rhyming words'], answer: 'Saying something IS something else' },
  { question: 'What is personification?', options: ['Comparing using "like"','Rhyming words','Giving objects human qualities','Repeating sounds'], answer: 'Giving objects human qualities' },
  { question: '"The wind whispered through the trees." Which device gives the wind a human action?', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Personification' },
  { question: '"She was as brave as a lion." This is an example of…', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Simile' },
  { question: '"Life is a journey." This is an example of…', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Metaphor' },
  { question: 'What is a rhyming couplet?', options: ['A single line of a poem','Two consecutive lines that rhyme','A four-line stanza','A six-line stanza'], answer: 'Two consecutive lines that rhyme' },
  { question: 'What is a quatrain?', options: ['A two-line stanza','A three-line stanza','A four-line stanza','A six-line stanza'], answer: 'A four-line stanza' },
  { question: 'What is free verse?', options: ['Poetry that rhymes','Poetry without a fixed rhyme scheme or metre','Poetry with exactly 10 syllables per line','Poetry about nature'], answer: 'Poetry without a fixed rhyme scheme or metre' },
  { question: 'What is a refrain?', options: ['A single line','A line or stanza repeated throughout a poem','A type of rhyme','A type of rhythm'], answer: 'A line or stanza repeated throughout a poem' },
  { question: 'What is enjambment?', options: ['A pause at the end of a line','When a sentence continues beyond the end of a line','A type of rhyme','A type of stanza'], answer: 'When a sentence continues beyond the end of a line' },
  { question: 'What is a caesura?', options: ['A pause in the middle of a line of poetry','A type of rhyme','A type of stanza','A type of metaphor'], answer: 'A pause in the middle of a line of poetry' },
];
export default function PoetryCornerGame() {
  return (
    <>
      <Helmet>
        <title>Poetry Corner — Sodafom</title>
        <meta name="description" content="Explore poetry, rhyme, and poetic devices!" />
        <link rel="canonical" href="https://sodafom.uk/games/poetry-corner" />
        <meta property="og:title" content="Poetry Corner — Sodafom" />
        <meta property="og:description" content="Explore poetry, rhyme, and poetic devices!" />
        <meta property="og:url" content="https://sodafom.uk/games/poetry-corner" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Poetry Corner — English Game for Kids — Sodafom</h1>
      <GameShell title="Poetry Corner" emoji="🎭" subject="reading" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="poetry-corner"
            title="Poetry Corner"
            emoji="🎭"
            questionsByLevel={[L1, L2, ...POETRY_DISCOVERY_BANKS]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
