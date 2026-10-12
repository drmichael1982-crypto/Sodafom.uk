import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: '"The cat hid under the bed." How does the cat feel?', options: ['Happy','Scared','Hungry','Tired'], answer: 'Scared' },
  { question: '"She smiled when she opened the present." How does she feel?', options: ['Sad','Angry','Happy','Bored'], answer: 'Happy' },
  { question: '"He crossed his arms and looked away." How does he feel?', options: ['Happy','Excited','Angry or upset','Tired'], answer: 'Angry or upset' },
  { question: '"The dog wagged its tail and jumped up." How does the dog feel?', options: ['Scared','Angry','Excited and happy','Tired'], answer: 'Excited and happy' },
  { question: '"She yawned and rubbed her eyes." How does she feel?', options: ['Happy','Excited','Angry','Tired'], answer: 'Tired' },
  { question: '"He looked at the empty plate and sighed." What can we infer?', options: ['He is full','He is still hungry','He is angry','He is cold'], answer: 'He is still hungry' },
  { question: '"The children fell silent when the teacher walked in." What can we infer?', options: ['They respect or fear the teacher','They are bored','They are happy','They are eating'], answer: 'They respect or fear the teacher' },
  { question: '"She ran to the door when she heard the knock." What can we infer?', options: ['She was bored','She was expecting someone','She was scared','She was hungry'], answer: 'She was expecting someone' },
  { question: '"He put on his coat and picked up his umbrella." What can we infer?', options: ['He is going to bed','It is probably raining or cold outside','He is going swimming','He is going to a party'], answer: 'It is probably raining or cold outside' },
  { question: '"The lights were off and the house was quiet." What can we infer?', options: ['Everyone is awake','Everyone is probably asleep','There is a party','The lights are broken'], answer: 'Everyone is probably asleep' },
  { question: '"She bit her lip and looked at the floor." How does she feel?', options: ['Happy','Nervous or worried','Excited','Angry'], answer: 'Nervous or worried' },
  { question: '"He counted his money three times." What can we infer?', options: ['He has lots of money','He is worried he does not have enough','He likes counting','He is bored'], answer: 'He is worried he does not have enough' },
];
const L2: QuizQuestion[] = [
  { question: '"She slammed the door and stomped upstairs." How does she feel?', options: ['Happy','Angry','Scared','Tired'], answer: 'Angry' },
  { question: '"His hands trembled as he opened the envelope." How does he feel?', options: ['Bored','Nervous or excited','Angry','Hungry'], answer: 'Nervous or excited' },
  { question: '"She skipped down the path, humming to herself." How does she feel?', options: ['Sad','Angry','Happy','Tired'], answer: 'Happy' },
  { question: '"The house was silent. Not even the clock ticked." What is the mood?', options: ['Busy and noisy','Eerie and still','Happy and warm','Exciting'], answer: 'Eerie and still' },
  { question: '"She had not slept in two days." What can we infer?', options: ['She is very energetic','She is probably exhausted','She is happy','She is hungry'], answer: 'She is probably exhausted' },
  { question: '"The children fell silent when the headteacher walked in." What can we infer?', options: ['They respect or fear the headteacher','They are bored','They are happy','They are eating'], answer: 'They respect or fear the headteacher' },
  { question: '"He counted his coins for the third time." What can we infer?', options: ['He has lots of money','He is worried he does not have enough','He likes counting','He is bored'], answer: 'He is worried he does not have enough' },
  { question: '"The dog wagged its tail and jumped up." How does the dog feel?', options: ['Scared','Angry','Excited and happy','Tired'], answer: 'Excited and happy' },
  { question: '"She read the letter twice, then folded it carefully and put it away." What can we infer?', options: ['The letter was unimportant','The letter was important to her','She could not read it','She was bored'], answer: 'The letter was important to her' },
  { question: '"He stared at the empty plate and sighed." What can we infer?', options: ['He is full','He is still hungry','He is angry','He is cold'], answer: 'He is still hungry' },
  { question: '"She bit her lip and looked at the floor." How does she feel?', options: ['Happy','Nervous or worried','Excited','Angry'], answer: 'Nervous or worried' },
  { question: '"The ancient castle loomed over the village." What is the mood?', options: ['Cheerful','Eerie and foreboding','Calm','Exciting'], answer: 'Eerie and foreboding' },
];
const L3: QuizQuestion[] = [
  { question: '"The author\'s choice of the word \'loomed\' suggests…"', options: ['Something small and friendly','Something large and threatening','Something bright and cheerful','Something fast and exciting'], answer: 'Something large and threatening' },
  { question: '"She had not spoken to him in three years, yet here he was." What can we infer?', options: ['They are close friends','There has been a significant falling out or separation','They have just met','They are strangers'], answer: 'There has been a significant falling out or separation' },
  { question: '"The use of short sentences in this passage creates a sense of…"', options: ['Calm and relaxation','Urgency and tension','Sadness and loss','Joy and celebration'], answer: 'Urgency and tension' },
  { question: '"The repeated use of the word \'dark\' in this passage suggests…"', options: ['A cheerful atmosphere','A sense of danger or foreboding','A sense of calm','A sense of joy'], answer: 'A sense of danger or foreboding' },
  { question: '"She smiled, but the smile did not reach her eyes." What can we infer?', options: ['She is genuinely happy','She is pretending to be happy','She is tired','She is angry'], answer: 'She is pretending to be happy' },
  { question: '"The author uses the metaphor \'a sea of faces\' to suggest…"', options: ['A small crowd','A very large crowd','A friendly crowd','A hostile crowd'], answer: 'A very large crowd' },
  { question: '"He had not eaten since yesterday morning." What can we infer?', options: ['He is not hungry','He is probably very hungry','He is on a diet','He is ill'], answer: 'He is probably very hungry' },
  { question: '"The author\'s use of the word \'crept\' rather than \'walked\' suggests…"', options: ['Speed and confidence','Stealth and caution','Happiness and excitement','Sadness and loss'], answer: 'Stealth and caution' },
  { question: '"The room was exactly as she had left it, ten years ago." What can we infer?', options: ['The room is often used','Nobody has entered the room in ten years','The room has been redecorated','The room is very modern'], answer: 'Nobody has entered the room in ten years' },
  { question: '"He laughed, but there was no humour in it." What can we infer?', options: ['He is genuinely amused','He is using laughter to mask a different emotion','He is happy','He is excited'], answer: 'He is using laughter to mask a different emotion' },
  { question: '"The author\'s use of the word \'whispered\' rather than \'said\' suggests…"', options: ['The character is speaking loudly','The character is speaking quietly, perhaps secretly or fearfully','The character is angry','The character is happy'], answer: 'The character is speaking quietly, perhaps secretly or fearfully' },
  { question: '"She glanced at the clock for the third time in five minutes." What can we infer?', options: ['She is bored','She is anxious or waiting for something','She likes clocks','She is tired'], answer: 'She is anxious or waiting for something' },
];
const L4: QuizQuestion[] = [
  { question: '"The author uses pathetic fallacy: \'The storm raged as she read the letter.\'" What does this suggest?', options: ['The weather is dangerous','The character\'s emotional turmoil is reflected in the weather','The character is happy','The character is calm'], answer: 'The character\'s emotional turmoil is reflected in the weather' },
  { question: '"The author uses dramatic irony: the reader knows the letter is forged, but the character does not." What effect does this create?', options: ['Suspense and tension','Humour and comedy','Calm and relaxation','Joy and celebration'], answer: 'Suspense and tension' },
  { question: '"The author uses the technique of free indirect discourse." What does this mean?', options: ['The narrator speaks directly to the reader','The narrator\'s voice merges with the character\'s thoughts','The character speaks directly to the reader','The narrator is unreliable'], answer: 'The narrator\'s voice merges with the character\'s thoughts' },
  { question: '"The author uses the technique of in medias res." What does this mean?', options: ['Starting at the beginning','Starting in the middle of the action','Starting at the end','Starting with a flashback'], answer: 'Starting in the middle of the action' },
  { question: '"The author uses the technique of the unreliable narrator." What effect does this create?', options: ['The reader trusts everything the narrator says','The reader questions the narrator\'s account','The reader ignores the narrator','The reader sympathises with the narrator'], answer: 'The reader questions the narrator\'s account' },
  { question: '"The author uses the technique of stream of consciousness." What does this mean?', options: ['A narrative technique presenting events in chronological order','A narrative technique presenting a character\'s thoughts as they occur','A narrative technique using multiple narrators','A narrative technique using flashbacks only'], answer: 'A narrative technique presenting a character\'s thoughts as they occur' },
  { question: '"The author uses the technique of the frame narrative." What does this mean?', options: ['A story with no plot','A story within a story','A story with only one character','A story with no setting'], answer: 'A story within a story' },
  { question: '"The author uses the technique of bathos." What effect does this create?', options: ['A sudden rise from the ordinary to the sublime','A sudden descent from the sublime to the ridiculous, often for comic effect','A sense of tragedy','A sense of joy'], answer: 'A sudden descent from the sublime to the ridiculous, often for comic effect' },
  { question: '"The author uses the technique of the objective correlative." What does this mean?', options: ['A set of objects or events that evoke a particular emotion in the reader','A type of metaphor','A type of simile','A type of personification'], answer: 'A set of objects or events that evoke a particular emotion in the reader' },
  { question: '"The author uses the technique of defamiliarisation." What is the purpose?', options: ['To make the familiar seem strange and encourage fresh perception','To make the strange seem familiar','To describe a setting in detail','To introduce a new character'], answer: 'To make the familiar seem strange and encourage fresh perception' },
  { question: '"The author uses the technique of polyphony." What does this mean?', options: ['A text with a single unified voice','A text with multiple independent voices or perspectives','A text with no dialogue','A text with only one character'], answer: 'A text with multiple independent voices or perspectives' },
  { question: '"The author uses the technique of the epiphany." What does this mean?', options: ['A sudden realisation or moment of insight for a character','A type of flashback','A type of foreshadowing','A type of metaphor'], answer: 'A sudden realisation or moment of insight for a character' },
];
const L5: QuizQuestion[] = [
  { question: '"The text enacts its meaning through form as well as content." What does this mean?', options: ['The form and content are unrelated','The way the text is structured contributes to its meaning','Only the content matters','Only the form matters'], answer: 'The way the text is structured contributes to its meaning' },
  { question: '"The author employs the technique of apophasis." What is this?', options: ['Mentioning something by saying you will not mention it','A type of metaphor','A type of simile','A type of personification'], answer: 'Mentioning something by saying you will not mention it' },
  { question: '"The text is characterised by its heteroglossic quality." What does this mean?', options: ['It has a single unified voice','It contains a diversity of voices, languages and perspectives','It has no dialogue','It has only one character'], answer: 'It contains a diversity of voices, languages and perspectives' },
  { question: '"The author employs the technique of chiasmus." What is this?', options: ['Repetition of the same word','A reversal of grammatical structures in successive phrases','A type of metaphor','A type of simile'], answer: 'A reversal of grammatical structures in successive phrases' },
  { question: '"The author employs the technique of the mise en abyme." What is this?', options: ['A story within a story that mirrors the outer story','A type of flashback','A type of foreshadowing','A type of metaphor'], answer: 'A story within a story that mirrors the outer story' },
  { question: '"The author employs the technique of the palimpsest." What is this?', options: ['A text that carries traces of earlier texts beneath its surface','A text that is entirely original','A text that has no references','A text that is written in multiple languages'], answer: 'A text that carries traces of earlier texts beneath its surface' },
  { question: '"The author employs the technique of the uncanny." What does this mean?', options: ['A type of horror','The feeling of unease when something familiar becomes strange','A type of comedy','A type of tragedy'], answer: 'The feeling of unease when something familiar becomes strange' },
  { question: '"The author employs the technique of the sublime." What does this mean?', options: ['A type of beauty','An overwhelming sense of awe and terror in the face of greatness or power','A type of comedy','A type of tragedy'], answer: 'An overwhelming sense of awe and terror in the face of greatness or power' },
  { question: '"The author employs the technique of the carnivalesque." What does this mean?', options: ['A type of comedy','The subversion of social hierarchies and norms in literature','A type of tragedy','A type of romance'], answer: 'The subversion of social hierarchies and norms in literature' },
  { question: '"The author employs the technique of the hermeneutic code." What does this mean?', options: ['A code that creates mystery and delays revelation','A code that reveals everything immediately','A code that describes the setting','A code that introduces characters'], answer: 'A code that creates mystery and delays revelation' },
  { question: '"The author employs the technique of the proairetic code." What does this mean?', options: ['A code that creates mystery','A code that drives the narrative forward through actions and events','A code that describes the setting','A code that introduces characters'], answer: 'A code that drives the narrative forward through actions and events' },
  { question: '"The author employs the technique of the semic code." What does this mean?', options: ['A code that creates mystery','A code that drives narrative forward','A code that builds character through connotations and associations','A code that describes the setting'], answer: 'A code that builds character through connotations and associations' },
];

export default function ReadingDetectiveGame() {
  return (
    <>
      <Helmet>
        <title>Reading Detective — Sodafom</title>
        <meta name="description" content="Use clues to solve reading comprehension mysteries!" />
        <link rel="canonical" href="https://sodafom.uk/games/reading-detective" />
        <meta property="og:title" content="Reading Detective — Sodafom" />
        <meta property="og:description" content="Use clues to solve reading comprehension mysteries!" />
        <meta property="og:url" content="https://sodafom.uk/games/reading-detective" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Reading Detective — English Game for Kids — Sodafom</h1>
      <GameShell title="Reading Detective" emoji="🔍" subject="reading" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="reading-detective"
            title="Reading Detective"
            emoji="🔍"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
