import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the "opening" of a story?', options: ['The exciting middle part','The ending','Where characters and setting are introduced','The problem or conflict'], answer: 'Where characters and setting are introduced' },
  { question: 'What is the "ending" of a story?', options: ['The introduction','The problem','The build-up','How things are left after the resolution'], answer: 'How things are left after the resolution' },
  { question: 'What is a character?', options: ['The setting of a story','A person or animal in a story','The plot of a story','The theme of a story'], answer: 'A person or animal in a story' },
  { question: 'What is a setting?', options: ['The plot','The characters','The time and place where a story takes place','The theme'], answer: 'The time and place where a story takes place' },
  { question: 'What is a narrative?', options: ['A type of poem','A story told in sequence','A type of report','A type of letter'], answer: 'A story told in sequence' },
  { question: 'What is the "problem" in a story?', options: ['The introduction','The resolution','The challenge or obstacle the character must overcome','The ending'], answer: 'The challenge or obstacle the character must overcome' },
  { question: 'What is the "resolution" of a story?', options: ['The introduction','The problem','How the problem is solved','The build-up'], answer: 'How the problem is solved' },
  { question: 'What is a plot?', options: ['The setting of a story','The sequence of events in a story','The theme of a story','The characters in a story'], answer: 'The sequence of events in a story' },
  { question: 'What is a theme?', options: ['The setting','The plot','The central idea or message of a story','The characters'], answer: 'The central idea or message of a story' },
  { question: 'What is a story map?', options: ['A map of where the story is set','A visual plan showing the key events of a story','A list of characters','A list of settings'], answer: 'A visual plan showing the key events of a story' },
  { question: 'What is the "climax" of a story?', options: ['The introduction','The most exciting or tense moment','The ending','The build-up'], answer: 'The most exciting or tense moment' },
  { question: 'What is the "build-up" of a story?', options: ['The introduction','Events leading to the main problem','The resolution','The ending'], answer: 'Events leading to the main problem' },
];
const L2: QuizQuestion[] = [
  { question: 'What is a flashback in a story?', options: ['A sudden bright light','A scene set in the future','A scene that goes back to an earlier time','A type of ending'], answer: 'A scene that goes back to an earlier time' },
  { question: 'What is foreshadowing?', options: ['A type of shadow','Hints about what will happen later in the story','A type of flashback','A type of setting'], answer: 'Hints about what will happen later in the story' },
  { question: 'What is a protagonist?', options: ['The villain','The main character','A supporting character','The narrator'], answer: 'The main character' },
  { question: 'What is an antagonist?', options: ['The main character','The narrator','The character who opposes the protagonist','A supporting character'], answer: 'The character who opposes the protagonist' },
  { question: 'What is first-person narration?', options: ['The story is told by a character using "I"','The story is told by an outside narrator','The story is told by multiple characters','The story is told in the future tense'], answer: 'The story is told by a character using "I"' },
  { question: 'What is third-person narration?', options: ['The story is told by a character using "I"','The story is told by an outside narrator using "he/she/they"','The story is told in the future tense','The story is told by multiple characters'], answer: 'The story is told by an outside narrator using "he/she/they"' },
  { question: 'What is a cliffhanger?', options: ['A type of setting','An ending that leaves the reader in suspense','A type of character','A type of theme'], answer: 'An ending that leaves the reader in suspense' },
  { question: 'What is character development?', options: ['How a character looks','How a character changes throughout a story','How a character speaks','How a character moves'], answer: 'How a character changes throughout a story' },
  { question: 'What is a subplot?', options: ['The main plot','A secondary storyline that runs alongside the main plot','A type of character','A type of setting'], answer: 'A secondary storyline that runs alongside the main plot' },
  { question: 'What is dramatic irony?', options: ['When a character says the opposite of what they mean','When the audience knows something a character does not','When two characters disagree','When the plot is surprising'], answer: 'When the audience knows something a character does not' },
  { question: 'What is a motif?', options: ['A type of character','A recurring element that has symbolic significance','A type of setting','A type of plot'], answer: 'A recurring element that has symbolic significance' },
  { question: 'What is an unreliable narrator?', options: ['A narrator who tells the whole truth','A narrator whose account cannot be fully trusted','A narrator who is very detailed','A narrator who is very brief'], answer: 'A narrator whose account cannot be fully trusted' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the "exposition" in a story?', options: ['The climax','The falling action','The background information at the start','The resolution'], answer: 'The background information at the start' },
  { question: 'What is the "rising action" in a story?', options: ['Events after the climax','Events leading up to the climax','The resolution','The exposition'], answer: 'Events leading up to the climax' },
  { question: 'What is the "falling action" in a story?', options: ['Events leading up to the climax','Events after the climax leading to the resolution','The exposition','The resolution'], answer: 'Events after the climax leading to the resolution' },
  { question: 'What is the "denouement"?', options: ['The climax','The rising action','The final resolution and tying up of loose ends','The exposition'], answer: 'The final resolution and tying up of loose ends' },
  { question: 'What is a "red herring" in a story?', options: ['A type of fish','A clue that misleads the reader','A type of foreshadowing','A type of flashback'], answer: 'A clue that misleads the reader' },
  { question: 'What is a "MacGuffin"?', options: ['A type of character','An object or goal that motivates characters but is unimportant in itself','A type of setting','A type of theme'], answer: 'An object or goal that motivates characters but is unimportant in itself' },
  { question: 'What is a "deus ex machina"?', options: ['A type of character','An unexpected power or event that resolves a seemingly impossible situation','A type of setting','A type of theme'], answer: 'An unexpected power or event that resolves a seemingly impossible situation' },
  { question: 'What is a "foil character"?', options: ['A villain','A character who contrasts with another to highlight their qualities','A supporting character','The narrator'], answer: 'A character who contrasts with another to highlight their qualities' },
  { question: 'What is "in medias res"?', options: ['Starting at the beginning','Starting in the middle of the action','Starting at the end','Starting with a flashback'], answer: 'Starting in the middle of the action' },
  { question: 'What is a "frame narrative"?', options: ['A story with no plot','A story within a story','A story with only one character','A story with no setting'], answer: 'A story within a story' },
  { question: 'What is "narrative tension"?', options: ['The setting of a story','The feeling of suspense or uncertainty that keeps the reader engaged','The theme of a story','The characters in a story'], answer: 'The feeling of suspense or uncertainty that keeps the reader engaged' },
  { question: 'What is "narrative voice"?', options: ['The setting of a story','The distinctive style and perspective from which a story is told','The theme of a story','The plot of a story'], answer: 'The distinctive style and perspective from which a story is told' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the "hero\'s journey" (Campbell)?', options: ['A type of adventure story','A universal narrative pattern: call to adventure, trials, transformation, return','A type of fairy tale','A type of myth'], answer: 'A universal narrative pattern: call to adventure, trials, transformation, return' },
  { question: 'What is "Freytag\'s pyramid"?', options: ['A type of story structure','A five-part dramatic structure: exposition, rising action, climax, falling action, denouement','A type of character development','A type of setting'], answer: 'A five-part dramatic structure: exposition, rising action, climax, falling action, denouement' },
  { question: 'What is "Propp\'s morphology of the folktale"?', options: ['A theory of character types and narrative functions in folktales','A theory of plot structure','A theory of setting','A theory of theme'], answer: 'A theory of character types and narrative functions in folktales' },
  { question: 'What is the "trickster" archetype?', options: ['A hero','A character who uses cunning and deception, often to challenge the status quo','A villain','A mentor'], answer: 'A character who uses cunning and deception, often to challenge the status quo' },
  { question: 'What is the "mentor" archetype?', options: ['A villain','A wise guide who helps the hero','A trickster','A shapeshifter'], answer: 'A wise guide who helps the hero' },
  { question: 'What is the "shadow" archetype (Jung)?', options: ['A type of setting','The dark side of the self, often represented by the villain','A type of theme','A type of plot'], answer: 'The dark side of the self, often represented by the villain' },
  { question: 'What is "narrative closure"?', options: ['The beginning of a story','The satisfying resolution of all narrative threads','The climax of a story','The exposition of a story'], answer: 'The satisfying resolution of all narrative threads' },
  { question: 'What is "open ending"?', options: ['A story with a clear resolution','A story that ends without resolving all questions, leaving interpretation to the reader','A story with a happy ending','A story with a sad ending'], answer: 'A story that ends without resolving all questions, leaving interpretation to the reader' },
  { question: 'What is "narrative perspective" in terms of focalization?', options: ['Who tells the story','Through whose eyes or consciousness the story is perceived','The setting of the story','The theme of the story'], answer: 'Through whose eyes or consciousness the story is perceived' },
  { question: 'What is "zero focalization"?', options: ['A narrator who knows less than the characters','An omniscient narrator who knows more than any character','A narrator who knows only what one character knows','A narrator who knows nothing'], answer: 'An omniscient narrator who knows more than any character' },
  { question: 'What is "internal focalization"?', options: ['An omniscient narrator','A narrator limited to the knowledge of one character','A narrator who knows nothing','A narrator who knows everything'], answer: 'A narrator limited to the knowledge of one character' },
  { question: 'What is "external focalization"?', options: ['An omniscient narrator','A narrator who knows less than the characters (only external behaviour)','A narrator limited to one character','A narrator who knows everything'], answer: 'A narrator who knows less than the characters (only external behaviour)' },
];
const L5: QuizQuestion[] = [
  { question: 'What is "narratology"?', options: ['The study of grammar','The study of narrative structure and how stories work','The study of vocabulary','The study of punctuation'], answer: 'The study of narrative structure and how stories work' },
  { question: 'What is "Genette\'s narrative theory"?', options: ['A theory of character development','A theory of narrative time, mood and voice (story, narrative, narrating)','A theory of setting','A theory of theme'], answer: 'A theory of narrative time, mood and voice (story, narrative, narrating)' },
  { question: 'What is "anachrony" in narrative?', options: ['A type of character','A discrepancy between the order of events in the story and their narration','A type of setting','A type of theme'], answer: 'A discrepancy between the order of events in the story and their narration' },
  { question: 'What is "narrative duration" (Genette)?', options: ['The length of a story','The relationship between story time and narrative time (scene, summary, ellipsis, pause)','The number of characters','The number of settings'], answer: 'The relationship between story time and narrative time (scene, summary, ellipsis, pause)' },
  { question: 'What is "narrative frequency" (Genette)?', options: ['How often a story is told','The relationship between how many times an event occurs and how many times it is narrated','The length of a story','The number of characters'], answer: 'The relationship between how many times an event occurs and how many times it is narrated' },
  { question: 'What is "singulative narration"?', options: ['Narrating once what happened once','Narrating multiple times what happened once','Narrating once what happened multiple times','Narrating multiple times what happened multiple times'], answer: 'Narrating once what happened once' },
  { question: 'What is "iterative narration"?', options: ['Narrating once what happened once','Narrating once what happened multiple times','Narrating multiple times what happened once','Narrating multiple times what happened multiple times'], answer: 'Narrating once what happened multiple times' },
  { question: 'What is "repetitive narration"?', options: ['Narrating once what happened once','Narrating once what happened multiple times','Narrating multiple times what happened once','Narrating multiple times what happened multiple times'], answer: 'Narrating multiple times what happened once' },
  { question: 'What is "the concept of the implied author" (Booth)?', options: ['The real author of a text','The version of the author implied by the text\'s values and style','The narrator of a text','The main character of a text'], answer: 'The version of the author implied by the text\'s values and style' },
  { question: 'What is "the concept of the narrative contract"?', options: ['A legal agreement between author and publisher','The implicit agreement between author and reader about the rules of the narrative','A type of plot structure','A type of character development'], answer: 'The implicit agreement between author and reader about the rules of the narrative' },
  { question: 'What is "the concept of the unreliable narrator" in postmodern fiction?', options: ['A narrator who is always truthful','A narrator who deliberately or unknowingly misleads the reader','A narrator who is a child','A narrator who is not the main character'], answer: 'A narrator who deliberately or unknowingly misleads the reader' },
  { question: 'What is "the concept of the metanarrative" (Lyotard)?', options: ['A story within a story','A grand overarching story that claims to explain all of human experience','A type of flashback','A type of foreshadowing'], answer: 'A grand overarching story that claims to explain all of human experience' },
];

export default function StoryMapGame() {
  return (
    <>
      <Helmet>
        <title>Story Map — Sodafom</title>
        <meta name="description" content="Map the key elements of stories and narratives!" />
        <link rel="canonical" href="https://sodafom.uk/games/story-map" />
        <meta property="og:title" content="Story Map — Sodafom" />
        <meta property="og:description" content="Map the key elements of stories and narratives!" />
        <meta property="og:url" content="https://sodafom.uk/games/story-map" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Story Map — English Game for Kids — Sodafom</h1>
      <GameShell title="Story Map" emoji="🗺️" subject="reading" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="story-map"
            title="Story Map"
            emoji="🗺️"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-accent"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
