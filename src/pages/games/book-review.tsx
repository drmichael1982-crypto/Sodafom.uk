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
export const L3: QuizQuestion[] = [
  {
    "question": "Which sentence gives an opinion about a book?",
    "options": [
      "The book has 12 chapters.",
      "The writer is called Sam.",
      "I found the adventure exciting.",
      "The story begins on a boat."
    ],
    "answer": "I found the adventure exciting.",
    "hint": "An opinion tells us what a reader thinks or feels."
  },
  {
    "question": "Which detail best supports the opinion “The story is exciting”?",
    "options": [
      "The cover is blue.",
      "The hero escapes just before the bridge collapses.",
      "The author has a short name.",
      "There are 80 pages."
    ],
    "answer": "The hero escapes just before the bridge collapses.",
    "hint": "Choose a story event that creates excitement."
  },
  {
    "question": "Which sentence is a brief summary rather than an opinion?",
    "options": [
      "I loved every page.",
      "The story follows two friends searching for a lost dog.",
      "This is my favourite book.",
      "I thought the ending was funny."
    ],
    "answer": "The story follows two friends searching for a lost dog.",
    "hint": "A summary briefly says what a book is about."
  },
  {
    "question": "A review is for someone who has not read the mystery. What should you avoid?",
    "options": [
      "Naming the author.",
      "Describing the setting.",
      "Revealing who stole the treasure.",
      "Saying who might enjoy it."
    ],
    "answer": "Revealing who stole the treasure.",
    "hint": "Keep the solution a surprise for a new reader."
  },
  {
    "question": "Which recommendation gives a useful reason?",
    "options": [
      "Read it because I said so.",
      "Everyone must like it.",
      "Readers who enjoy animal adventures may like the rescue scenes.",
      "It is a book."
    ],
    "answer": "Readers who enjoy animal adventures may like the rescue scenes.",
    "hint": "Name a possible reader and explain what might appeal to them."
  },
  {
    "question": "The story happens in a snowy village during winter. What does this describe?",
    "options": [
      "The author.",
      "The setting.",
      "The review score.",
      "The title page."
    ],
    "answer": "The setting.",
    "hint": "Setting is where and when a story takes place."
  },
  {
    "question": "Lena admits her mistake even though she is worried. Which description has supporting evidence?",
    "options": [
      "Lena is honest because she admits her mistake.",
      "Lena is tall because she is worried.",
      "Lena is lazy because she speaks.",
      "Lena is cruel because she admits her mistake."
    ],
    "answer": "Lena is honest because she admits her mistake.",
    "hint": "Use the character’s actions as evidence for a trait."
  },
  {
    "question": "Which opening helps a reader identify the book being reviewed?",
    "options": [
      "This one is good.",
      "My review is about The Moon Map by A. Reed.",
      "It has pages.",
      "You know that book."
    ],
    "answer": "My review is about The Moon Map by A. Reed.",
    "hint": "Include the title and author when you introduce a book."
  },
  {
    "question": "Which comment is a respectful negative opinion?",
    "options": [
      "Only silly people enjoy it.",
      "The author is awful.",
      "I found the opening slow because the adventure starts late.",
      "Nobody could ever like this."
    ],
    "answer": "I found the opening slow because the adventure starts late.",
    "hint": "Explain your response to the writing without insulting people."
  },
  {
    "question": "Which pair names two things a useful review usually includes?",
    "options": [
      "Every plot twist and the ending.",
      "An opinion and a reason from the book.",
      "The reader’s address and phone number.",
      "Only a rating and no explanation."
    ],
    "answer": "An opinion and a reason from the book.",
    "hint": "Tell readers what you think and why."
  }
];
export const L4: QuizQuestion[] = [
  {
    "question": "“The path vanished into a dark tunnel.” Why might a reviewer choose this detail to discuss suspense?",
    "options": [
      "It lists the chapter numbers.",
      "It makes the route seem uncertain and mysterious.",
      "It proves the book is non-fiction.",
      "It tells us the author’s age."
    ],
    "answer": "It makes the route seem uncertain and mysterious.",
    "hint": "Suspense can come from uncertainty about what will happen."
  },
  {
    "question": "At first Ravi avoids speaking; later he presents his idea to the class. What change can a reviewer explain?",
    "options": [
      "Ravi becomes more confident.",
      "Ravi changes his name.",
      "Ravi forgets the idea.",
      "Ravi becomes the author."
    ],
    "answer": "Ravi becomes more confident.",
    "hint": "Compare the character’s behaviour at the start and later."
  },
  {
    "question": "Which sentence compares two characters using evidence?",
    "options": [
      "Both characters exist.",
      "Mia plans carefully, while Ben acts quickly without checking the map.",
      "Mia is better in every way.",
      "Ben has a short name."
    ],
    "answer": "Mia plans carefully, while Ben acts quickly without checking the map.",
    "hint": "A comparison explains a similarity or difference in their actions."
  },
  {
    "question": "Which review sentence links a claim to evidence?",
    "options": [
      "The book is funny because the muddled magician keeps turning hats into frogs.",
      "The book is funny.",
      "I like it, and that is all.",
      "There are words in the book."
    ],
    "answer": "The book is funny because the muddled magician keeps turning hats into frogs.",
    "hint": "Look for a reason that supports the reviewer’s claim."
  },
  {
    "question": "A story shows friends repairing a disagreement by listening. Which possible theme is supported?",
    "options": [
      "Listening can help friendships.",
      "All stories happen at sea.",
      "Money fixes every problem.",
      "Friends never disagree."
    ],
    "answer": "Listening can help friendships.",
    "hint": "A theme is an idea explored through the events, not just a topic."
  },
  {
    "question": "Which summary keeps the mystery ending secret?",
    "options": [
      "The thief is the gardener.",
      "The missing key is under the final statue.",
      "Two children search the museum for a missing key.",
      "The last page reveals the guard’s secret."
    ],
    "answer": "Two children search the museum for a missing key.",
    "hint": "Describe the main situation without giving away the solution."
  },
  {
    "question": "Which revision makes “It was good” more useful in a review?",
    "options": [
      "It was really, really good.",
      "The tense chase kept me wondering whether the friends would escape.",
      "Good is good.",
      "It was a book and it was good."
    ],
    "answer": "The tense chase kept me wondering whether the friends would escape.",
    "hint": "Name a specific feature and explain your response."
  },
  {
    "question": "A reviewer dislikes the long descriptions but enjoys the dialogue. Which sentence fairly expresses both?",
    "options": [
      "Everything is terrible.",
      "No reader can like this.",
      "The descriptions felt slow to me, but the lively dialogue made the characters memorable.",
      "The dialogue does not exist."
    ],
    "answer": "The descriptions felt slow to me, but the lively dialogue made the characters memorable.",
    "hint": "A balanced review can discuss both strengths and limitations."
  },
  {
    "question": "Which evidence best supports “The setting feels dangerous”?",
    "options": [
      "The library has a new copy.",
      "The characters hear falling rocks and see cracks in the mountain path.",
      "The title has three words.",
      "The book is on a shelf."
    ],
    "answer": "The characters hear falling rocks and see cracks in the mountain path.",
    "hint": "Choose details inside the story that create danger."
  },
  {
    "question": "Which reader recommendation is most carefully worded?",
    "options": [
      "Every child will love it.",
      "It is perfect for everyone.",
      "Readers who enjoy puzzles may enjoy working out the clues.",
      "Only one kind of person can read it."
    ],
    "answer": "Readers who enjoy puzzles may enjoy working out the clues.",
    "hint": "Recommend from interests without pretending all readers react alike."
  }
];
export const L5: QuizQuestion[] = [
  {
    "question": "A reviewer writes “This is the best book ever.” Which change makes the claim better supported?",
    "options": [
      "Add more exclamation marks.",
      "Explain which features worked well and give examples.",
      "Say all other readers agree.",
      "Remove the title."
    ],
    "answer": "Explain which features worked well and give examples.",
    "hint": "Strong opinions need specific reasons, not just stronger words."
  },
  {
    "question": "The narrator says “I was not afraid,” but their hands shake. Which review comment uses both details?",
    "options": [
      "The narrator’s words and actions suggest they may be hiding fear.",
      "The narrator must be asleep.",
      "The narrator is definitely telling every fact correctly.",
      "The story has no narrator."
    ],
    "answer": "The narrator’s words and actions suggest they may be hiding fear.",
    "hint": "An inference combines evidence with a careful possible explanation."
  },
  {
    "question": "Which comparison is most useful when reviewing two adventure books?",
    "options": [
      "Both books have paper.",
      "One uses fast chase scenes; the other builds suspense through clues.",
      "One has more letters in its title.",
      "Both are on my shelf."
    ],
    "answer": "One uses fast chase scenes; the other builds suspense through clues.",
    "hint": "Compare writing features that affect a reader’s experience."
  },
  {
    "question": "A review uses “The sea swallowed the little boat.” What can it explain about this image?",
    "options": [
      "The sea literally eats food.",
      "It makes the sea seem powerful and threatening.",
      "It proves the boat is made of paper.",
      "It gives the exact date."
    ],
    "answer": "It makes the sea seem powerful and threatening.",
    "hint": "Think about the impression the figurative wording creates."
  },
  {
    "question": "A reader claims a character is selfish. Which question helps check that interpretation?",
    "options": [
      "Is the cover shiny?",
      "Which actions in the story support or challenge that claim?",
      "How heavy is the book?",
      "Is the author’s name long?"
    ],
    "answer": "Which actions in the story support or challenge that claim?",
    "hint": "Check an interpretation against evidence, including details that may not fit."
  },
  {
    "question": "Which sentence separates a story detail from a reviewer’s judgement?",
    "options": [
      "The story switches between two narrators; I found this helpful because it showed both views.",
      "Everyone knows this book is perfect.",
      "My judgement is a fact for all readers.",
      "The book cannot be discussed."
    ],
    "answer": "The story switches between two narrators; I found this helpful because it showed both views.",
    "hint": "State the feature, then explain your own response to it."
  },
  {
    "question": "Which short quotation best supports “The character is determined” in a review?",
    "options": [
      "“The room had two windows.”",
      "“I will try again, even if it takes all week.”",
      "“It was Tuesday.”",
      "“The cup was green.”"
    ],
    "answer": "“I will try again, even if it takes all week.”",
    "hint": "Determination means continuing towards a goal despite difficulty."
  },
  {
    "question": "What should a reviewer do after including a short quotation?",
    "options": [
      "Explain how it supports the point being made.",
      "Assume it explains itself.",
      "Copy the whole chapter next.",
      "Change the quotation’s words without saying so."
    ],
    "answer": "Explain how it supports the point being made.",
    "hint": "Evidence is most useful when you explain its connection to your point."
  },
  {
    "question": "Two readers disagree about a book’s ending. Which response supports a useful discussion?",
    "options": [
      "One must be foolish.",
      "Nobody should discuss it.",
      "Compare their reasons and the details each reader noticed.",
      "Make them choose the same rating."
    ],
    "answer": "Compare their reasons and the details each reader noticed.",
    "hint": "Different responses can be discussed respectfully with evidence."
  },
  {
    "question": "Which conclusion gives a reasoned recommendation without a spoiler?",
    "options": [
      "Read it: the missing treasure belongs to the villain.",
      "I recommend it to readers who enjoy tense puzzles, because the clues invite you to solve the mystery.",
      "Everyone must give it five stars.",
      "The ending is on the last page."
    ],
    "answer": "I recommend it to readers who enjoy tense puzzles, because the clues invite you to solve the mystery.",
    "hint": "Link the recommendation to the book’s features and keep the solution secret."
  }
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
