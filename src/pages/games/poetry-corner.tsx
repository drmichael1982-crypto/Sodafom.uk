import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is a rhyme?', options: ['Words that start with the same sound','Words that end with the same sound','Words that mean the same thing','Words that are opposite'], answer: 'Words that end with the same sound' },
  { question: 'Which two words rhyme?', options: ['cat / dog','cat / hat','cat / run','cat / big'], answer: 'cat / hat' },
  { question: 'Which two words rhyme?', options: ['sun / moon','sun / fun','sun / sky','sun / rain'], answer: 'sun / fun' },
  { question: 'Which two words rhyme?', options: ['tree / flower','tree / bee','tree / leaf','tree / root'], answer: 'tree / bee' },
  { question: 'What is alliteration?', options: ['Rhyming words','Repeating the same starting sound','A type of poem','A comparison'], answer: 'Repeating the same starting sound' },
  { question: '"Peter Piper picked a peck of pickled peppers." This is an example of…', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Alliteration' },
  { question: 'What is a haiku?', options: ['A poem with 4 lines','A poem with 3 lines (5-7-5 syllables)','A poem that rhymes','A poem about nature only'], answer: 'A poem with 3 lines (5-7-5 syllables)' },
  { question: 'A haiku has how many syllables in its middle line?', options: ['5','7','9','11'], answer: '7' },
  { question: 'What is a stanza?', options: ['A single line of a poem','A group of lines in a poem','A type of rhyme','A type of rhythm'], answer: 'A group of lines in a poem' },
  { question: 'What is rhythm in poetry?', options: ['The pattern of rhymes','The pattern of stressed and unstressed syllables','The number of lines','The subject of the poem'], answer: 'The pattern of stressed and unstressed syllables' },
  { question: 'What is onomatopoeia?', options: ['A type of rhyme','A word that sounds like what it describes','A comparison','A type of poem'], answer: 'A word that sounds like what it describes' },
  { question: 'Which word is an example of onomatopoeia?', options: ['happy','beautiful','buzz','quickly'], answer: 'buzz' },
];
const L2: QuizQuestion[] = [
  { question: 'What is a simile?', options: ['Comparing using "like" or "as"','A made-up word','Repeating a sound','Giving objects human qualities'], answer: 'Comparing using "like" or "as"' },
  { question: 'What is a metaphor?', options: ['Comparing using "like" or "as"','Saying something IS something else','Repeating a sound','Rhyming words'], answer: 'Saying something IS something else' },
  { question: 'What is personification?', options: ['Comparing using "like"','Rhyming words','Giving objects human qualities','Repeating sounds'], answer: 'Giving objects human qualities' },
  { question: '"The wind whispered through the trees." This is an example of…', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Personification' },
  { question: '"She was as brave as a lion." This is an example of…', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Simile' },
  { question: '"Life is a journey." This is an example of…', options: ['Simile','Metaphor','Personification','Alliteration'], answer: 'Metaphor' },
  { question: 'What is a couplet?', options: ['A single line of a poem','Two consecutive lines that rhyme','A four-line stanza','A six-line stanza'], answer: 'Two consecutive lines that rhyme' },
  { question: 'What is a quatrain?', options: ['A two-line stanza','A three-line stanza','A four-line stanza','A six-line stanza'], answer: 'A four-line stanza' },
  { question: 'What is free verse?', options: ['Poetry that rhymes','Poetry without a fixed rhyme scheme or metre','Poetry with exactly 10 syllables per line','Poetry about nature'], answer: 'Poetry without a fixed rhyme scheme or metre' },
  { question: 'What is a refrain?', options: ['A single line','A line or stanza repeated throughout a poem','A type of rhyme','A type of rhythm'], answer: 'A line or stanza repeated throughout a poem' },
  { question: 'What is enjambment?', options: ['A pause at the end of a line','When a sentence continues beyond the end of a line','A type of rhyme','A type of stanza'], answer: 'When a sentence continues beyond the end of a line' },
  { question: 'What is a caesura?', options: ['A pause in the middle of a line of poetry','A type of rhyme','A type of stanza','A type of metaphor'], answer: 'A pause in the middle of a line of poetry' },
];
const L3: QuizQuestion[] = [
  { question: 'What is iambic pentameter?', options: ['A line with 5 iambs (10 syllables: da-DUM × 5)','A line with 4 iambs','A line with 6 iambs','A line with 5 trochees'], answer: 'A line with 5 iambs (10 syllables: da-DUM × 5)' },
  { question: 'What is an iamb?', options: ['A stressed syllable followed by an unstressed syllable','An unstressed syllable followed by a stressed syllable','Two stressed syllables','Two unstressed syllables'], answer: 'An unstressed syllable followed by a stressed syllable' },
  { question: 'What is a trochee?', options: ['An unstressed syllable followed by a stressed syllable','A stressed syllable followed by an unstressed syllable','Two stressed syllables','Two unstressed syllables'], answer: 'A stressed syllable followed by an unstressed syllable' },
  { question: 'What is a sonnet?', options: ['A poem with 12 lines','A poem with 14 lines','A poem with 16 lines','A poem with 10 lines'], answer: 'A poem with 14 lines' },
  { question: 'What is the rhyme scheme of a Shakespearean sonnet?', options: ['ABAB CDCD EFEF GG','ABBA ABBA CDC DCD','AABB CCDD EEFF GG','ABCD ABCD EFEF GG'], answer: 'ABAB CDCD EFEF GG' },
  { question: 'What is the rhyme scheme of a Petrarchan sonnet?', options: ['ABAB CDCD EFEF GG','ABBA ABBA CDC DCD','AABB CCDD EEFF GG','ABCD ABCD EFEF GG'], answer: 'ABBA ABBA CDC DCD' },
  { question: 'What is an elegy?', options: ['A poem celebrating a birth','A poem mourning the dead','A poem about nature','A poem about love'], answer: 'A poem mourning the dead' },
  { question: 'What is an ode?', options: ['A poem mourning the dead','A poem of praise or celebration','A poem about nature only','A poem with no rhyme'], answer: 'A poem of praise or celebration' },
  { question: 'What is a ballad?', options: ['A poem of praise','A narrative poem often with a refrain, originally sung','A poem mourning the dead','A poem with no rhyme'], answer: 'A narrative poem often with a refrain, originally sung' },
  { question: 'What is an epic poem?', options: ['A short lyric poem','A long narrative poem about heroic deeds','A poem with no rhyme','A poem about nature'], answer: 'A long narrative poem about heroic deeds' },
  { question: 'What is a villanelle?', options: ['A 14-line poem','A 19-line poem with two refrains and two rhymes (e.g. Do Not Go Gentle)','A 12-line poem','A 10-line poem'], answer: 'A 19-line poem with two refrains and two rhymes (e.g. Do Not Go Gentle)' },
  { question: 'What is assonance?', options: ['Repetition of consonant sounds','Repetition of vowel sounds in nearby words','A type of rhyme','A type of alliteration'], answer: 'Repetition of vowel sounds in nearby words' },
];
const L4: QuizQuestion[] = [
  { question: 'What is consonance?', options: ['Repetition of vowel sounds','Repetition of consonant sounds in nearby words','A type of rhyme','A type of alliteration'], answer: 'Repetition of consonant sounds in nearby words' },
  { question: 'What is a volta in a sonnet?', options: ['The first line','The turning point or shift in argument or mood','The final couplet','The rhyme scheme'], answer: 'The turning point or shift in argument or mood' },
  { question: 'What is an apostrophe in poetry?', options: ['A punctuation mark','Addressing an absent person, abstract idea or object directly','A type of rhyme','A type of metaphor'], answer: 'Addressing an absent person, abstract idea or object directly' },
  { question: 'What is hyperbole?', options: ['Understatement','Extreme exaggeration for effect','A type of metaphor','A type of simile'], answer: 'Extreme exaggeration for effect' },
  { question: 'What is litotes?', options: ['Extreme exaggeration','Understatement using negation (e.g. "not bad" meaning "good")','A type of metaphor','A type of simile'], answer: 'Understatement using negation (e.g. "not bad" meaning "good")' },
  { question: 'What is synecdoche?', options: ['Using a part to represent the whole (e.g. "wheels" for car)','Using the whole to represent a part','A type of metaphor','A type of simile'], answer: 'Using a part to represent the whole (e.g. "wheels" for car)' },
  { question: 'What is metonymy?', options: ['Using a part to represent the whole','Using something closely associated with a thing to represent it (e.g. "the Crown" for monarchy)','A type of simile','A type of personification'], answer: 'Using something closely associated with a thing to represent it (e.g. "the Crown" for monarchy)' },
  { question: 'What is an extended metaphor?', options: ['A short comparison','A metaphor developed at length throughout a poem or passage','A type of simile','A type of personification'], answer: 'A metaphor developed at length throughout a poem or passage' },
  { question: 'What is the concept of the objective correlative (T.S. Eliot)?', options: ['A set of objects or events that evoke a particular emotion in the reader','A type of metaphor','A type of simile','A type of personification'], answer: 'A set of objects or events that evoke a particular emotion in the reader' },
  { question: 'What is the concept of negative capability (Keats)?', options: ['The ability to remain in uncertainty without irritably reaching after fact','The ability to write negative poetry','The ability to use negative imagery','The ability to write without emotion'], answer: 'The ability to remain in uncertainty without irritably reaching after fact' },
  { question: 'What is the concept of the pathetic fallacy?', options: ['Attributing human emotions to nature or the environment','A type of metaphor','A type of simile','A type of personification'], answer: 'Attributing human emotions to nature or the environment' },
  { question: 'What is the concept of sprung rhythm (Gerard Manley Hopkins)?', options: ['A rhythm based on the number of stressed syllables per line, regardless of unstressed syllables','A rhythm based on equal numbers of stressed and unstressed syllables','A rhythm based on syllable count only','A rhythm based on rhyme scheme'], answer: 'A rhythm based on the number of stressed syllables per line, regardless of unstressed syllables' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of the lyric I in poetry?', options: ['The speaker of a poem, not necessarily the poet','The poet themselves','The main character of a poem','The narrator of a poem'], answer: 'The speaker of a poem, not necessarily the poet' },
  { question: 'What is the concept of the dramatic monologue?', options: ['A poem in which a single speaker addresses a silent listener, revealing character','A poem with multiple speakers','A poem with no speaker','A poem with a narrator'], answer: 'A poem in which a single speaker addresses a silent listener, revealing character' },
  { question: 'What is the concept of the confessional poem?', options: ['A poem that directly addresses personal, often painful, experiences','A poem about religion','A poem about nature','A poem about love'], answer: 'A poem that directly addresses personal, often painful, experiences' },
  { question: 'What is the concept of the found poem?', options: ['A poem created from existing text (e.g. newspaper, instructions)','A poem about finding something','A poem with no structure','A poem with no rhyme'], answer: 'A poem created from existing text (e.g. newspaper, instructions)' },
  { question: 'What is the concept of the prose poem?', options: ['A poem written in prose form without line breaks','A poem with strict metre','A poem with strict rhyme','A poem with strict stanza structure'], answer: 'A poem written in prose form without line breaks' },
  { question: 'What is the concept of the concrete poem?', options: ['A poem whose visual shape reflects its subject','A poem about concrete','A poem with no metaphor','A poem with no rhyme'], answer: 'A poem whose visual shape reflects its subject' },
  { question: 'What is the concept of the ghazal?', options: ['A form of Arabic/Persian poetry with couplets linked by a radif (refrain)','A type of sonnet','A type of ballad','A type of ode'], answer: 'A form of Arabic/Persian poetry with couplets linked by a radif (refrain)' },
  { question: 'What is the concept of the pantoum?', options: ['A poem where lines 2 and 4 of each stanza become lines 1 and 3 of the next','A poem with no repetition','A poem with a fixed rhyme scheme','A poem with a fixed metre'], answer: 'A poem where lines 2 and 4 of each stanza become lines 1 and 3 of the next' },
  { question: 'What is the concept of the terza rima?', options: ['A three-line stanza with interlocking rhyme scheme ABA BCB CDC (used by Dante)','A three-line stanza with no rhyme','A three-line stanza with all lines rhyming','A three-line stanza with alternating rhyme'], answer: 'A three-line stanza with interlocking rhyme scheme ABA BCB CDC (used by Dante)' },
  { question: 'What is the concept of the aubade?', options: ['A poem about the dawn or parting of lovers at dawn','A poem about the night','A poem about the sea','A poem about death'], answer: 'A poem about the dawn or parting of lovers at dawn' },
  { question: 'What is the concept of the ekphrasis?', options: ['A poem that describes or responds to a work of visual art','A poem about nature','A poem about love','A poem about death'], answer: 'A poem that describes or responds to a work of visual art' },
  { question: 'What is the concept of the kenning in Old English poetry?', options: ['A compound expression used as a poetic synonym (e.g. "whale-road" for sea)','A type of rhyme','A type of metaphor','A type of simile'], answer: 'A compound expression used as a poetic synonym (e.g. "whale-road" for sea)' },
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
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
