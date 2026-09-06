import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What type of word is "run"?', options: ['Noun','Verb','Adjective','Adverb'], answer: 'Verb' },
  { question: 'What type of word is "happy"?', options: ['Noun','Verb','Adjective','Adverb'], answer: 'Adjective' },
  { question: 'What type of word is "table"?', options: ['Noun','Verb','Adjective','Adverb'], answer: 'Noun' },
  { question: 'What type of word is "quickly"?', options: ['Noun','Verb','Adjective','Adverb'], answer: 'Adverb' },
  { question: 'Which sentence is in the past tense?', options: ['I run to school.','I ran to school.','I will run to school.','I am running to school.'], answer: 'I ran to school.' },
  { question: 'Which sentence is in the future tense?', options: ['I eat lunch.','I ate lunch.','I will eat lunch.','I am eating lunch.'], answer: 'I will eat lunch.' },
  { question: 'What is a noun?', options: ['A doing word','A naming word','A describing word','A joining word'], answer: 'A naming word' },
  { question: 'What is a verb?', options: ['A naming word','A doing word','A describing word','A joining word'], answer: 'A doing word' },
  { question: 'What is an adjective?', options: ['A naming word','A doing word','A describing word','A joining word'], answer: 'A describing word' },
  { question: 'What is a conjunction?', options: ['A naming word','A doing word','A joining word','A describing word'], answer: 'A joining word' },
  { question: 'Which word is a pronoun?', options: ['table','run','she','quickly'], answer: 'she' },
  { question: 'What is the subject of: "The cat sat on the mat."?', options: ['cat','sat','mat','the'], answer: 'cat' },
];
const L2: QuizQuestion[] = [
  { question: 'What type of word is "beautiful"?', options: ['Noun','Verb','Adjective','Adverb'], answer: 'Adjective' },
  { question: 'What type of word is "happiness"?', options: ['Noun','Verb','Adjective','Adverb'], answer: 'Noun' },
  { question: 'Which sentence uses the passive voice?', options: ['The dog bit the man.','The man was bitten by the dog.','The man bit the dog.','The dog was biting.'], answer: 'The man was bitten by the dog.' },
  { question: 'What is a clause?', options: ['A type of punctuation','A group of words with a subject and verb','A type of noun','A describing word'], answer: 'A group of words with a subject and verb' },
  { question: 'Which sentence contains a subordinate clause?', options: ['The cat sat.','The cat sat on the mat.','Although it was raining, we went out.','We went out.'], answer: 'Although it was raining, we went out.' },
  { question: 'What is a preposition?', options: ['A naming word','A doing word','A word showing position or time','A describing word'], answer: 'A word showing position or time' },
  { question: 'Which word is a preposition?', options: ['run','happy','under','quickly'], answer: 'under' },
  { question: 'What is a determiner?', options: ['A naming word','A word that introduces a noun (e.g. the, a, this)','A doing word','A describing word'], answer: 'A word that introduces a noun (e.g. the, a, this)' },
  { question: 'What is a modal verb?', options: ['A verb showing certainty or possibility (e.g. can, might, should)','A naming word','A describing word','A joining word'], answer: 'A verb showing certainty or possibility (e.g. can, might, should)' },
  { question: 'Which word is a modal verb?', options: ['run','happy','could','quickly'], answer: 'could' },
  { question: 'What is a relative clause?', options: ['A clause starting with a relative pronoun (who, which, that)','A clause starting with a conjunction','A clause starting with a preposition','A clause starting with an adverb'], answer: 'A clause starting with a relative pronoun (who, which, that)' },
  { question: 'What is the object of: "The dog chased the cat."?', options: ['dog','chased','cat','the'], answer: 'cat' },
];
const L3: QuizQuestion[] = [
  { question: 'What is a fronted adverbial?', options: ['An adverb at the end of a sentence','An adverbial phrase at the start of a sentence','A type of adjective','A type of noun phrase'], answer: 'An adverbial phrase at the start of a sentence' },
  { question: 'What is a noun phrase?', options: ['A noun on its own','A noun and its modifiers','A verb phrase','A prepositional phrase'], answer: 'A noun and its modifiers' },
  { question: 'What is the subjunctive mood?', options: ['A form expressing wishes, hypotheticals or conditions','A form expressing commands','A form expressing questions','A form expressing past events'], answer: 'A form expressing wishes, hypotheticals or conditions' },
  { question: 'Which sentence uses the subjunctive correctly?', options: ['If I was you, I would go.','If I were you, I would go.','If I am you, I would go.','If I be you, I would go.'], answer: 'If I were you, I would go.' },
  { question: 'What is a participle clause?', options: ['A clause using a participle (-ing or -ed) to add information','A clause starting with a conjunction','A clause starting with a preposition','A clause starting with a relative pronoun'], answer: 'A clause using a participle (-ing or -ed) to add information' },
  { question: 'What is the passive voice?', options: ['When the subject performs the action','When the subject receives the action','When the verb is in the past tense','When the verb is in the future tense'], answer: 'When the subject receives the action' },
  { question: 'What is a gerund?', options: ['A verb used as a noun (e.g. "Swimming is fun")','A type of adjective','A type of adverb','A type of conjunction'], answer: 'A verb used as a noun (e.g. "Swimming is fun")' },
  { question: 'What is an infinitive?', options: ['The base form of a verb (e.g. "to run")','A verb in the past tense','A verb in the future tense','A type of noun'], answer: 'The base form of a verb (e.g. "to run")' },
  { question: 'What is a split infinitive?', options: ['An infinitive with a word inserted between "to" and the verb','An infinitive in the passive voice','An infinitive in the past tense','An infinitive in the future tense'], answer: 'An infinitive with a word inserted between "to" and the verb' },
  { question: 'What is a dangling modifier?', options: ['A modifier that clearly refers to the subject','A modifier that does not clearly refer to the subject it modifies','A type of adjective','A type of adverb'], answer: 'A modifier that does not clearly refer to the subject it modifies' },
  { question: 'What is a compound sentence?', options: ['A sentence with one main clause','Two main clauses joined by a coordinating conjunction','A main clause and a subordinate clause','A sentence with no verbs'], answer: 'Two main clauses joined by a coordinating conjunction' },
  { question: 'What is a complex sentence?', options: ['A sentence with one main clause','Two main clauses joined by a conjunction','A main clause and at least one subordinate clause','A sentence with no verbs'], answer: 'A main clause and at least one subordinate clause' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'grammar-garage',
  title: 'Grammar Garage',
  emoji: '🔧',
  subject: 'reading',
  ageGroups: ['8–10', '11–13'],
  description: 'Fix the grammar! Identify nouns, verbs, adjectives and adverbs in sentences.',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
