import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which word describes a colour?', options: ['red','run','jump','eat'], answer: 'red' },
  { question: 'Which is an adjective?', options: ['big','run','eat','jump'], answer: 'big' },
  { question: 'Which word describes size?', options: ['tiny','swim','laugh','sing'], answer: 'tiny' },
  { question: 'Which word tells us how something feels?', options: ['soft','walk','talk','play'], answer: 'soft' },
  { question: 'Which is an adjective?', options: ['happy','skip','hop','run'], answer: 'happy' },
  { question: 'Which word describes taste?', options: ['sweet','dance','jump','fly'], answer: 'sweet' },
  { question: 'Which word describes a shape?', options: ['round','swim','eat','sleep'], answer: 'round' },
  { question: 'Which is an adjective?', options: ['cold','run','skip','hop'], answer: 'cold' },
  { question: 'Which word describes sound?', options: ['loud','walk','talk','play'], answer: 'loud' },
  { question: 'Which is an adjective?', options: ['tall','jump','run','swim'], answer: 'tall' },
  { question: 'Which word describes a feeling?', options: ['sad','eat','drink','sleep'], answer: 'sad' },
  { question: 'Which is an adjective?', options: ['fast','walk','talk','play'], answer: 'fast' },
];
const L2: QuizQuestion[] = [
  { question: 'Choose the adjective: "The ___ cat sat on the mat."', options: ['fluffy','sat','mat','the'], answer: 'fluffy' },
  { question: 'Which word is an adjective?', options: ['enormous','quickly','run','and'], answer: 'enormous' },
  { question: 'Choose the adjective: "She wore a ___ dress."', options: ['beautiful','wore','she','dress'], answer: 'beautiful' },
  { question: 'Which is NOT an adjective?', options: ['swiftly','brave','clever','kind'], answer: 'swiftly' },
  { question: 'Choose the adjective: "The ___ dog barked."', options: ['fierce','barked','the','dog'], answer: 'fierce' },
  { question: 'Which word describes a noun?', options: ['ancient','quickly','ran','and'], answer: 'ancient' },
  { question: 'Choose the adjective: "He ate a ___ meal."', options: ['delicious','ate','he','meal'], answer: 'delicious' },
  { question: 'Which is an adjective?', options: ['fragile','carefully','jumped','but'], answer: 'fragile' },
  { question: 'Choose the adjective: "The ___ river flowed."', options: ['winding','flowed','the','river'], answer: 'winding' },
  { question: 'Which word modifies a noun?', options: ['sparkling','swiftly','ran','and'], answer: 'sparkling' },
  { question: 'Choose the adjective: "A ___ wind blew."', options: ['bitter','blew','a','wind'], answer: 'bitter' },
  { question: 'Which is an adjective?', options: ['murky','quickly','swam','but'], answer: 'murky' },
];
const L3: QuizQuestion[] = [
  { question: 'Which sentence uses an adjective correctly?', options: ['The brave knight fought.','The knight braved fought.','The knight fought brave.','Brave the knight fought.'], answer: 'The brave knight fought.' },
  { question: 'Identify the adjective: "The ancient ruins stood silently."', options: ['ancient','ruins','stood','silently'], answer: 'ancient' },
  { question: 'Which is a comparative adjective?', options: ['taller','tall','tallest','tallness'], answer: 'taller' },
  { question: 'Which is a superlative adjective?', options: ['brightest','bright','brighter','brightness'], answer: 'brightest' },
  { question: 'Identify the adjective: "She wore a crimson gown."', options: ['crimson','wore','she','gown'], answer: 'crimson' },
  { question: 'Which sentence has two adjectives?', options: ['The small, grey mouse hid.','The mouse hid quickly.','A mouse hid.','The mouse ran fast.'], answer: 'The small, grey mouse hid.' },
  { question: 'Which is a possessive adjective?', options: ['my','me','I','mine'], answer: 'my' },
  { question: 'Identify the adjective: "A peculiar smell filled the room."', options: ['peculiar','smell','filled','room'], answer: 'peculiar' },
  { question: 'Which is a demonstrative adjective?', options: ['this','it','them','they'], answer: 'this' },
  { question: 'Which sentence uses a superlative correctly?', options: ['She is the most talented singer.','She is more talented singer.','She is talented most singer.','She is the more talented singer.'], answer: 'She is the most talented singer.' },
  { question: 'Identify the adjective: "The luminous moon shone."', options: ['luminous','moon','shone','the'], answer: 'luminous' },
  { question: 'Which is an interrogative adjective?', options: ['which','who','whom','whose'], answer: 'which' },
];
const L4: QuizQuestion[] = [
  { question: 'Which sentence uses a predicate adjective?', options: ['The sky looks stormy.','The stormy sky loomed.','Stormily the sky loomed.','The sky stormily loomed.'], answer: 'The sky looks stormy.' },
  { question: 'Identify the attributive adjective: "The dilapidated house stood alone."', options: ['dilapidated','house','stood','alone'], answer: 'dilapidated' },
  { question: 'Which is a participial adjective?', options: ['broken','break','broke','breaking'], answer: 'broken' },
  { question: 'Which sentence uses a compound adjective correctly?', options: ['A well-known author spoke.','A well known author spoke.','A wellknown author spoke.','A known-well author spoke.'], answer: 'A well-known author spoke.' },
  { question: 'Identify the adjective phrase: "The man in the blue coat arrived."', options: ['in the blue coat','the man','arrived','blue coat'], answer: 'in the blue coat' },
  { question: 'Which is an absolute adjective?', options: ['unique','more unique','most unique','uniquer'], answer: 'unique' },
  { question: 'Which sentence uses a proper adjective?', options: ['She wore a French perfume.','She wore a france perfume.','She wore a french perfume.','She wore a Frances perfume.'], answer: 'She wore a French perfume.' },
  { question: 'Identify the adjective: "His laconic reply surprised everyone."', options: ['laconic','reply','surprised','everyone'], answer: 'laconic' },
  { question: 'Which is a numeral adjective?', options: ['three','many','some','few'], answer: 'three' },
  { question: 'Which sentence has a misplaced adjective?', options: ['He ate a nearly raw steak.','He ate a raw nearly steak.','He nearly ate a raw steak.','He ate a raw steak nearly.'], answer: 'He ate a raw nearly steak.' },
  { question: 'Identify the adjective: "The ephemeral beauty of the sunset."', options: ['ephemeral','beauty','sunset','the'], answer: 'ephemeral' },
  { question: 'Which is a distributive adjective?', options: ['each','some','many','few'], answer: 'each' },
];
const L5: QuizQuestion[] = [
  { question: 'Which sentence uses a nominative absolute correctly?', options: ['The task completed, she rested.','She completed the task rested.','Completed the task she rested.','She rested the task completed.'], answer: 'The task completed, she rested.' },
  { question: 'Identify the appositive adjective: "The knight, brave and bold, charged."', options: ['brave and bold','the knight','charged','knight'], answer: 'brave and bold' },
  { question: 'Which is a postpositive adjective?', options: ['attorney general','general attorney','the general','an attorney'], answer: 'attorney general' },
  { question: 'Which sentence uses a transferred epithet?', options: ['He had a sleepless night.','He slept a night.','The night was sleepless.','He slept sleeplessly.'], answer: 'He had a sleepless night.' },
  { question: 'Identify the adjective: "Her mellifluous voice enchanted all."', options: ['mellifluous','voice','enchanted','all'], answer: 'mellifluous' },
  { question: 'Which is an oxymoronic adjective pair?', options: ['deafening silence','loud noise','quiet whisper','bright light'], answer: 'deafening silence' },
  { question: 'Identify the adjective: "The perspicacious student solved it."', options: ['perspicacious','student','solved','it'], answer: 'perspicacious' },
  { question: 'Which sentence uses a stacked adjective correctly?', options: ['A small, old, wooden box.','A wooden, old, small box.','An old wooden small box.','A small wooden old box.'], answer: 'A small, old, wooden box.' },
  { question: 'Identify the adjective: "The recondite text baffled scholars."', options: ['recondite','text','baffled','scholars'], answer: 'recondite' },
  { question: 'Which is a denominal adjective?', options: ['golden','gold','golds','golding'], answer: 'golden' },
  { question: 'Identify the adjective: "His loquacious nature annoyed them."', options: ['loquacious','nature','annoyed','them'], answer: 'loquacious' },
  { question: 'Which sentence uses a predicative adjective after a copula?', options: ['The soup tastes delicious.','The delicious soup tastes.','Deliciously the soup tastes.','The soup deliciously tastes.'], answer: 'The soup tastes delicious.' },
];

export default function AdjectiveAdventure() {
  return (
    <>
      <Helmet>
        <title>Adjective Adventure — Sodafom</title>
        <meta name="description" content="Explore adjectives and descriptive language in this fun grammar game!" />
        <link rel="canonical" href="https://sodafom.uk/games/adjective-adventure" />
        <meta property="og:title" content="Adjective Adventure — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Adjective Adventure — Grammar Game for Kids — Sodafom</h1>
      <GameShell title="Adjective Adventure" emoji="🌈" subject="reading" ageGroups={['7–9', '10–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="adjective-adventure"
            title="Adjective Adventure"
            emoji="🌈"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
