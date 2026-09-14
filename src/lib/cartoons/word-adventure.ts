/**
 * Agent 31 — Archie's Word Adventure.
 *
 * The script is data-led so Agent 22's shared cartoon engine can consume this
 * episode later without copying its timings, captions, questions or answers.
 */
export type CartoonSpeaker = 'Archie' | 'Bella' | 'Soda Bot';
export type CartoonBackdrop = 'reading' | 'spelling';
export type CartoonCue = 'magic' | 'page' | 'question' | 'celebrate';

export interface CartoonQuestion {
  prompt: string;
  choices: Array<{ label: string; correct: boolean }>;
  answerExplanation: string;
}

export interface CartoonScene {
  id: string;
  stage: string;
  speaker: CartoonSpeaker;
  dialogue: string;
  subtitle: string;
  backdrop: CartoonBackdrop;
  cue: CartoonCue;
  durationMs: number;
  question?: CartoonQuestion;
}

export interface CartoonEpisode {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  subtitles: true;
  durationMs: number;
  scenes: CartoonScene[];
}

const EIGHT_SECONDS = 8_000;
const q = (prompt: string, choices: Array<{ label: string; correct: boolean }>, answerExplanation: string): CartoonQuestion => ({ prompt, choices, answerExplanation });
const s = (
  id: string, stage: string, speaker: CartoonSpeaker, dialogue: string, subtitle: string,
  backdrop: CartoonBackdrop = 'spelling', cue: CartoonCue = 'page', question?: CartoonQuestion,
): CartoonScene => ({ id, stage, speaker, dialogue, subtitle, backdrop, cue, durationMs: EIGHT_SECONDS, question });

export const WORD_ADVENTURE: CartoonEpisode = {
  id: 'archies-word-adventure',
  title: "Archie's Word Adventure",
  description: 'A kind, interactive journey through sounds, spelling, grammar, vocabulary, reading and story writing.',
  ageRange: 'Ages 5–12',
  subtitles: true,
  durationMs: 42 * EIGHT_SECONDS,
  scenes: [
    s('welcome', 'Word World Gate', 'Archie', 'Hello, word explorer! I’m Archie. My golden heart key has opened the gate to Word World. Every sound, sentence and story can help us unlock it.', 'Hello, word explorer! Welcome to Word World.', 'spelling', 'magic'),
    s('letters-awake', 'Word World Gate', 'Soda Bot', 'Beep bop! The letter lights are waking up. They do not need perfect answers. They need curious learners who are happy to have a go.', 'Letters wake up when learners are curious.', 'spelling', 'page'),
    s('bella-arrives', 'Sound Garden', 'Bella', 'I’m Bella, your word guide. We will listen, read, spell and build a tiny story together. Ready? Let’s start with sounds.', 'Bella: Let’s start with sounds.', 'reading', 'magic'),
    s('phonics-cat', 'Sound Garden', 'Bella', 'Words are made of sounds. In cat, the letter c represents the sound /k/, then a represents /a/, and t represents /t/. Blend them: c-a-t, cat.', 'c-a-t → cat. Listen, say the sounds, then blend them.', 'spelling', 'page'),
    s('phonics-question', 'Sound Garden', 'Archie', 'Your turn. Which word starts with the same /k/ sound as cat? Pause and choose when you are ready.', 'Question: Which word starts with the same /k/ sound as cat?', 'spelling', 'question', q('Which word starts with the same /k/ sound as cat?', [{ label: 'kite', correct: true }, { label: 'sun', correct: false }, { label: 'fish', correct: false }], 'Kite begins with the /k/ sound. Great listening!')),
    s('digraph-sh', 'Sound Garden', 'Bella', 'Sometimes two letters work together to make one sound. In ship, s and h work together as the digraph sh. Say it softly: shhh.', 'sh is a digraph: two letters working together for one sound.', 'spelling', 'magic'),
    s('digraph-question', 'Sound Garden', 'Soda Bot', 'Which word begins with the sh sound? Try it aloud. A small mistake is a clue that helps your brain learn.', 'Question: Which word begins with sh?', 'spelling', 'question', q('Which word begins with sh?', [{ label: 'ship', correct: true }, { label: 'chip', correct: false }, { label: 'tap', correct: false }], 'Ship begins with the /sh/ sound. Nice sound spotting!')),
    s('spell-bridge', 'Spelling Bridge', 'Archie', 'The Spelling Bridge is missing its planks. We can build a word by hearing each sound in order. Let’s try rain: r, ai, n.', 'Spell rain by listening for r-ai-n.', 'spelling', 'page'),
    s('spell-ai', 'Spelling Bridge', 'Bella', 'In rain, the letters a and i work together to represent the long /ai/ sound. We can tap each sound, then blend them back into the word.', 'In rain, ai represents the long /ai/ sound.', 'spelling', 'magic'),
    s('spell-check', 'Spelling Bridge', 'Soda Bot', 'For a tricky spelling, try this calm routine: look at the word, say it, cover it, write it, then check it. Practice helps patterns stick.', 'Spelling routine: look, say, cover, write, check.', 'spelling', 'page'),
    s('spell-question', 'Spelling Bridge', 'Archie', 'Which letters make the /ai/ sound in rain? Take a breath and choose the letter team you can hear.', 'Question: Which letters make the /ai/ sound in rain?', 'spelling', 'question', q('Which letters make the /ai/ sound in rain?', [{ label: 'ai', correct: true }, { label: 'oa', correct: false }, { label: 'ee', correct: false }], 'ai makes the long /ai/ sound in rain. The bridge is glowing!')),
    s('rhyme-path', 'Rhyme Path', 'Soda Bot', 'Beep! A rhyme is a word that ends with the same sound. Light and kite rhyme because they both end with the /ite/ sound.', 'Rhyming words end with the same sound: light, kite.', 'reading', 'page'),
    s('rhyme-question', 'Rhyme Path', 'Bella', 'Which word rhymes with light? You can say each word slowly and listen to the ending.', 'Question: Which word rhymes with light?', 'reading', 'question', q('Which word rhymes with light?', [{ label: 'kite', correct: true }, { label: 'chair', correct: false }, { label: 'book', correct: false }], 'Light and kite end with the same /ite/ sound. Lovely rhyming!')),
    s('mistakes-are-clues', 'Rhyme Path', 'Archie', 'Did you pick chair? That is okay! Chair does not rhyme with light, but your brain was listening and trying. Mistakes are friendly clues, not stop signs.', 'Mistakes are friendly clues that help us learn.', 'reading', 'celebrate'),
    s('sentence-station', 'Sentence Station', 'Bella', 'Now we are at Sentence Station. A sentence shares a complete idea. It usually starts with a capital letter and ends with punctuation.', 'A sentence shares a complete idea.', 'reading', 'magic'),
    s('capital-letter', 'Sentence Station', 'Archie', 'Capital letters help a reader spot the beginning. The sentence The fox ran home starts with a tall capital T.', 'Start a sentence with a capital letter.', 'reading', 'page'),
    s('sentence-question', 'Sentence Station', 'Soda Bot', 'Which one is written as a complete sentence? Look for the capital letter and the full stop.', 'Question: Which one is a complete sentence?', 'reading', 'question', q('Which one is a complete sentence?', [{ label: 'The fox ran home.', correct: true }, { label: 'the fox ran home', correct: false }, { label: 'fox home ran', correct: false }], 'The fox ran home. starts with a capital letter and ends with a full stop.')),
    s('punctuation-parade', 'Punctuation Parade', 'Bella', 'Punctuation is like signposting for readers. A full stop ends a statement. A question mark tells us someone is asking something.', 'Full stop: statement. Question mark: question.', 'reading', 'page'),
    s('punctuation-question', 'Punctuation Parade', 'Archie', 'What punctuation should go at the end of: Where is my book? Listen for the asking voice in the sentence.', 'Question: What punctuation ends “Where is my book”?', 'reading', 'question', q('What punctuation ends “Where is my book”?', [{ label: 'A question mark (?)', correct: true }, { label: 'A full stop (.)', correct: false }, { label: 'A comma (,)', correct: false }], 'A question mark is right because the sentence asks a question.')),
    s('nouns', 'Word Detective Lane', 'Bella', 'Let’s become word detectives. A noun names a person, place, animal or thing. Teacher, park, dog and pencil are all nouns.', 'Nouns name people, places, animals or things.', 'spelling', 'magic'),
    s('verbs', 'Word Detective Lane', 'Archie', 'A verb tells us about an action or a state of being. Jump, read, laugh and think are action verbs we can spot in stories.', 'Verbs can show actions: jump, read, laugh, think.', 'spelling', 'page'),
    s('adjectives', 'Word Detective Lane', 'Bella', 'An adjective gives us more information about a noun. In the fluffy dog, fluffy helps us picture what the dog is like.', 'Adjectives describe nouns: the fluffy dog.', 'spelling', 'page'),
    s('adjective-question', 'Word Detective Lane', 'Soda Bot', 'In the phrase the fluffy dog, which word is the adjective? Find the word that describes the dog.', 'Question: Which word describes the dog?', 'spelling', 'question', q('In “the fluffy dog”, which word is the adjective?', [{ label: 'fluffy', correct: true }, { label: 'dog', correct: false }, { label: 'the', correct: false }], 'Fluffy is the adjective because it describes the dog.')),
    s('vocabulary-vault', 'Vocabulary Vault', 'Archie', 'Words can be keys to bigger ideas. The word curious means wanting to know more. Curious explorers ask questions and look carefully.', 'curious means wanting to know more.', 'reading', 'magic'),
    s('vocabulary-enormous', 'Vocabulary Vault', 'Bella', 'Another useful word is enormous. It means very big. A giant balloon or a huge whale could be enormous.', 'enormous means very big.', 'reading', 'page'),
    s('vocabulary-question', 'Vocabulary Vault', 'Soda Bot', 'Which phrase means enormous? Picture each choice in your mind, then choose the one that means very big.', 'Question: Which phrase means enormous?', 'reading', 'question', q('Which phrase means enormous?', [{ label: 'very big', correct: true }, { label: 'very quiet', correct: false }, { label: 'very tiny', correct: false }], 'Enormous means very big. Your vocabulary vault has opened!')),
    s('vocabulary-clues', 'Vocabulary Vault', 'Bella', 'When a new word appears, you can look for clues around it. The picture, the rest of the sentence, or a grown-up can help you discover its meaning.', 'Use pictures and nearby words as clues to a new meaning.', 'reading', 'page'),
    s('story-begins', 'Story Tree', 'Bella', 'Time for a mini story. Mia found a small seed in the garden. She put it in a pot on a sunny windowsill and gave it some water.', 'Story: Mia puts a seed in a pot on a sunny windowsill and waters it.', 'reading', 'magic'),
    s('story-middle', 'Story Tree', 'Archie', 'Each day, Mia checked the pot. Soon, a green shoot poked through the soil. Mia smiled because she had cared for the seed patiently.', 'Story: A green shoot grows because Mia cares for the seed.', 'reading', 'page'),
    s('comprehension-question', 'Story Tree', 'Soda Bot', 'Reading comprehension means using clues from what we read. Which two things did Mia do for the seed?', 'Question: What did Mia do for the seed?', 'reading', 'question', q('Which two things did Mia do for the seed?', [{ label: 'She watered it and put it in sunlight.', correct: true }, { label: 'She hid it in a drawer.', correct: false }, { label: 'She painted it blue.', correct: false }], 'Mia watered the seed and put it on a sunny windowsill. You used story clues brilliantly!')),
    s('story-clue', 'Story Tree', 'Bella', 'You found the clues! Good readers do not have to guess wildly. They can look back at the words and notice the helpful details.', 'Good readers use clues from the words.', 'reading', 'celebrate'),
    s('story-challenge', 'Story Workshop', 'Archie', 'Here is our short story challenge. Every story can have a beginning, a middle and an ending. Let’s give a hungry fox a kind ending.', 'Story challenge: beginning, middle and ending.', 'spelling', 'magic'),
    s('story-build', 'Story Workshop', 'Bella', 'Beginning: The fox found an apple. Middle: The fox met a friend who was hungry. Now we need an ending that makes sense and uses a complete sentence.', 'Beginning: fox finds an apple. Middle: fox meets a hungry friend.', 'spelling', 'page'),
    s('story-question', 'Story Workshop', 'Archie', 'Which is the best ending for our story? Choose the complete sentence that shows what the fox did.', 'Question: Which is the best story ending?', 'spelling', 'question', q('Which is the best ending for the fox story?', [{ label: 'The fox ran home and shared the apple.', correct: true }, { label: 'The fox run fast.', correct: false }, { label: 'apple fox blue.', correct: false }], 'The fox ran home and shared the apple. is a complete sentence and gives the story a kind ending.')),
    s('story-celebration', 'Story Workshop', 'Soda Bot', 'Story saved! You used sounds, spelling, sentence rules, word meanings and reading clues. That is how writers build bright ideas.', 'Story saved! Writers build bright ideas with words.', 'spelling', 'celebrate'),
    s('sound-recap', 'Word World Gate', 'Bella', 'Quick recap: listen for sounds, blend them into words, and notice letter teams like sh and ai. Say the sounds slowly if a word feels tricky.', 'Recap: listen, blend and spot letter teams.', 'spelling', 'page'),
    s('grammar-recap', 'Word World Gate', 'Archie', 'Remember: a sentence starts with a capital letter and ends with punctuation. Nouns name, verbs do, and adjectives describe.', 'Recap: Capitals and punctuation help sentences. Nouns name, verbs do, adjectives describe.', 'reading', 'page'),
    s('reading-recap', 'Word World Gate', 'Bella', 'When you read, be curious. Ask: what happened, what clues did the writer give me, and what might happen next?', 'Recap: Use clues when you read.', 'reading', 'page'),
    s('reading-expression', 'Word World Gate', 'Soda Bot', 'Reading aloud can sound like talking. Pause at a full stop, lift your voice a little for a question, and take your time. Every reader can grow stronger.', 'Read with expression: pause at a full stop and lift your voice for a question.', 'reading', 'page'),
    s('kind-words', 'Word World Gate', 'Archie', 'Words can be kind too. You can say, I can try again, I need a clue, or I am proud that I kept going. That is real word magic.', 'Kind learning words: “I can try again.” “I need a clue.”', 'spelling', 'celebrate'),
    s('goodbye', 'Word World Gate', 'Soda Bot', 'Beep bop, adventure complete! The Word World gate will be ready whenever you want another sound, sentence or story challenge.', 'Adventure complete! Come back for another word challenge.', 'spelling', 'magic'),
    s('end-card', 'Word World Gate', 'Archie', 'You did brilliantly, word explorer. Keep reading, keep wondering, and keep being kind to yourself while you learn. See you soon!', 'You did brilliantly, word explorer!', 'reading', 'celebrate'),
  ],
};

export const WORD_ADVENTURE_QUESTIONS = WORD_ADVENTURE.scenes.filter(
  (scene): scene is CartoonScene & { question: CartoonQuestion } => Boolean(scene.question),
);
export const WORD_ADVENTURE_RUNTIME_SECONDS = WORD_ADVENTURE.durationMs / 1_000;
