/** Existing repository artwork only. Never accept an image URL from saved data. */
export const STICKERS = [
  { id: 'archie', name: 'Archie', category: 'Friends', src: '/assets/images/archie-character-v2.png' },
  { id: 'bella', name: 'Bella', category: 'Friends', src: '/assets/cartoon/friends/bella.png' },
  { id: 'mia', name: 'Mia', category: 'Friends', src: '/assets/cartoon/friends/mia.png' },
  { id: 'toby', name: 'Toby', category: 'Friends', src: '/assets/cartoon/friends/toby.png' },
  { id: 'rocky', name: 'Rocky', category: 'Friends', src: '/assets/cartoon/friends/rocky.png' },
  { id: 'penny', name: 'Penny', category: 'Friends', src: '/assets/cartoon/friends/penny.png' },
  { id: 'daisy', name: 'Daisy', category: 'Friends', src: '/assets/cartoon/friends/daisy.png' },
  { id: 'sunny', name: 'Sunny', category: 'Friends', src: '/assets/cartoon/friends/sunny.png' },
  { id: 'captain-spark', name: 'Captain Spark', category: 'Friends', src: '/assets/cartoon/friends/captain-spark.png' },
  { id: 'professor', name: 'Professor Thinkwell', category: 'Friends', src: '/assets/cartoon/friends/professor-thinkwell.png' },
  { id: 'ziggy', name: 'Ziggy the dinosaur', category: 'Animals', src: '/assets/cartoon/friends/ziggy.png' },
  { id: 'soda-bot', name: 'Soda Bot', category: 'Objects & cards', src: '/assets/cartoon/friends/soda-bot.png' },
  // These are whole illustrated story cards, not new character/object cut-outs.
  { id: 'key-card', name: 'Magic key story card', category: 'Objects & cards', src: '/assets/stories/archie-magic-key.jpg' },
  { id: 'library-card', name: 'Library story card', category: 'Objects & cards', src: '/assets/stories/archie-library-welcome.jpg' },
  { id: 'seaside-card', name: 'Seaside postcard', category: 'Objects & cards', src: '/assets/stories/archie-seaside.jpg' },
] as const;

export const THEMES = [
  { id: 'blank', name: 'My own adventure', src: '', prompt: 'Choose Archie and a friend. What are they doing together?', challenge: 'Build a scene that tells a story. Explain what happens next.' },
  { id: 'woodland', name: 'Woodland adventure', src: '/assets/stories/archie-forest.jpg', prompt: 'Take Ziggy and friends on a woodland walk. Count your stickers.', challenge: 'Make a woodland adventure with a beginning, a problem and a kind solution.' },
  { id: 'seaside', name: 'A day at the seaside', src: '/assets/stories/archie-seaside.jpg', prompt: 'Make a seaside scene. Who is next to Archie?', challenge: 'Create a seaside postcard. Describe where everyone is and what they discover.' },
  { id: 'library', name: 'Story time', src: '/assets/stories/archie-library-welcome.jpg', prompt: 'Choose friends for story time. Who will tell the first story?', challenge: 'Use the story cards to plan an adventure. Tell it in the order you choose.' },
  { id: 'science', name: 'Inventors and explorers', src: '/assets/cartoon/worlds/science.png', prompt: 'Help Soda Bot and friends explore. What might they find?', challenge: 'Build an invention team. Explain how each friend will help solve a problem.' },
] as const;

export type StickerId = typeof STICKERS[number]['id'];
export type ThemeId = typeof THEMES[number]['id'];
export const stickerAsset = (id: string) => STICKERS.find(item => item.id === id);
export const pageTheme = (id: string) => THEMES.find(item => item.id === id);
