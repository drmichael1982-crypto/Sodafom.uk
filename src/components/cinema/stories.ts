/** Existing story wording copied faithfully from ArchieStoryCollectionPage.
 * Keep these pages in sync if that collection is edited. No generated story art.
 */
export type CinemaStory = { id: string; title: string; strapline: string; colour: string; image?: string; pages: string[] };

const ORIGINAL_STORIES: Omit<CinemaStory, "id">[] = [
  { title: 'Archie and the Magic Key', strapline: 'Believe in yourself', colour: 'from-indigo-600 to-violet-800', image: '/assets/stories/archie-magic-key.jpg', pages: [
    'Archie found a little golden key sparkling beneath his pillow.', 'The key had a tiny heart and felt warm in his hand.', 'At breakfast, it pointed towards the old oak tree in the garden.', 'Jessica, Sally and Daisy sniffed a hidden door in the tree trunk.', 'The key opened the door with a friendly click.', 'Inside was a library where every book glowed like a star.', 'A sign said, “Brave readers can open any adventure.”', 'Archie chose a book and read the first word slowly and clearly.', 'The library cheered because Archie had believed in himself.', 'He went home with the key, ready for tomorrow’s adventure.'
  ] },
  { title: 'A Day at the Seaside', strapline: 'Exploring together', colour: 'from-sky-500 to-blue-800', image: '/assets/stories/archie-seaside.jpg', pages: [
    'The sun shone over Felixstowe seafront as Archie packed a picnic.', 'Mum brought sandwiches while Dad carried a bright blue bucket.', 'The dogs raced across the sand, leaving bouncy paw prints.', 'Archie found a smooth shell shaped like a little trumpet.', 'He heard a soft cry near the rocks and followed the sound.', 'A tiny crab was stuck in a plastic ring beside the tide.', 'With a grown-up’s help, Archie gently freed the crab.', 'The crab clicked its claws as if it was saying thank you.', 'Everyone put their litter in the bin and watched the waves sparkle.', 'On the way home, Archie said the best adventures are shared.'
  ] },
  { title: 'The Forest Adventure', strapline: 'Nature is amazing', colour: 'from-emerald-600 to-green-950', image: '/assets/stories/archie-forest.jpg', pages: [
    'Archie and his family walked into Rendlesham Forest on a windy morning.', 'Tall trees whispered as the dogs trotted along the path.', 'A feather on the ground led them to a tiny bird nest.', 'They stepped back quietly so the parent bird would feel safe.', 'Soon, they found clues: an acorn, a cone and a muddy hoof print.', 'Archie used a picture guide to learn that a deer had passed by.', 'Daisy stopped at a puddle, and everyone laughed at her muddy paws.', 'They listened for a whole minute and heard birds, leaves and a woodpecker.', 'Archie promised to leave the forest just as lovely as they found it.', 'The family walked home with calm hearts and muddy boots.'
  ] },
  { title: 'Archie Helps a Friend', strapline: 'Friends make life brighter', colour: 'from-orange-500 to-rose-700', image: '/assets/stories/archie-helps-friend.jpg', pages: [
    'At football club, Archie noticed that Amir was sitting quietly by himself.', 'Amir said he was worried because he had missed an easy goal.', 'Archie told him everyone makes mistakes while they are learning.', 'They practised passing slowly, one kind kick at a time.', 'Sally chased the ball and made everybody laugh.', 'Amir tried again and this time his pass reached Archie perfectly.', 'The coach praised their teamwork, not just the score.', 'Archie said, “You did not give up. That is what brave means.”', 'Amir smiled and invited another child to join their practice.', 'By home time, the team had learned that kindness makes friends stronger.'
  ] },
  { title: 'The Lost Puppy', strapline: 'Kindness always wins', colour: 'from-amber-500 to-orange-800', pages: [
    'On a walk near the harbour, Archie heard a small bark behind a bench.', 'A fluffy puppy with a red collar was shivering under a coat.', 'Archie stayed calm and asked Dad to help instead of chasing it.', 'They read the name “Milo” on the puppy’s tag.', 'Dad phoned the number while Mum wrapped Milo in a warm towel.', 'Jessica and Sally sat nearby, showing Milo he was safe.', 'Soon a worried family hurried along the path calling his name.', 'Milo wagged so hard that his whole body wriggled.', 'His family thanked Archie for being careful and kind.', 'Archie waved goodbye, knowing small helpful actions can mean a lot.'
  ] },
  { title: 'A Visit to Orford Castle', strapline: 'History comes to life', colour: 'from-stone-500 to-slate-800', pages: [
    'Archie saw Orford Castle rising above the green grass like a giant sandcastle.', 'Inside, a guide explained that people had lived there hundreds of years ago.', 'Archie climbed the winding stairs slowly, counting every step.', 'From the top, he could see the river, boats and tiny roofs below.', 'He imagined a medieval cook stirring a huge pot for hungry visitors.', 'Kayla spotted narrow windows made for watching the castle grounds.', 'The family read old maps and looked for the shape of the keep.', 'Archie drew the castle in his notebook with three tall towers.', 'He learned that asking questions helps history feel alive.', 'At sunset, the castle looked golden and Archie promised to visit again.'
  ] },
  { title: 'Space Explorers', strapline: 'Reach for the stars', colour: 'from-blue-700 to-indigo-950', pages: [
    'One clear night, Archie pointed his telescope at the moon.', 'The Magic Key glowed and turned the telescope into a starship window.', 'Archie and Soda Bot floated gently above the blue Earth.', 'They saw that the planet has oceans, clouds and one bright moon.', 'A friendly astronaut explained why astronauts wear special space suits.', 'They watched the International Space Station travel quietly overhead.', 'Archie learned that the sun is a star and our solar system is enormous.', 'Before leaving, he checked that every bit of rubbish was safely stored.', 'The starship brought him home just as Mum called him for bed.', 'Archie looked up and knew that curious questions can travel very far.'
  ] },
  { title: 'Animals Around the World', strapline: 'Our wonderful world', colour: 'from-teal-500 to-emerald-800', pages: [
    'Archie opened a pop-up map and animals began to wave from every continent.', 'An elephant showed him how big ears help it stay cool in Africa.', 'A penguin waddled from Antarctica and explained its warm waterproof feathers.', 'A red panda climbed high in an Asian forest with its fluffy tail.', 'A kangaroo bounced across Australia with a joey peeking from its pouch.', 'In South America, a sloth moved slowly through the treetops.', 'Archie noticed that every animal needed a safe home, food and clean water.', 'He and his friends made a poster saying, “Be kind to animal homes.”', 'The animals thanked Archie with a cheerful parade around the map.', 'He closed the book knowing that our world is full of amazing neighbours.'
  ] },
  { title: 'Healthy and Happy', strapline: 'Move, play and be you', colour: 'from-lime-500 to-green-800', pages: [
    'Archie woke up feeling a little sleepy and slow.', 'Mum reminded him to drink water and eat a colourful breakfast.', 'He chose fruit, toast and yoghurt, then felt ready to move.', 'Outside, Archie tried ten gentle star jumps with Daisy watching closely.', 'When he felt puffed, he stopped for a calm rest and a deep breath.', 'At school, he learned that feelings are important too.', 'He told a trusted grown-up that he was nervous about a big spelling test.', 'Together they made a small plan: practise, rest and try his best.', 'After school, Archie played, laughed and went to bed at a good time.', 'He learned that being healthy means caring for body, mind and feelings.'
  ] },
  { title: 'Caring for Our Planet', strapline: 'Small steps make a big difference', colour: 'from-cyan-500 to-green-800', pages: [
    'Archie saw a paper wrapper blowing along the park path.', 'He picked it up safely and put it in the right bin.', 'The Magic Key showed him a picture of the Earth smiling brightly.', 'At home, Archie helped sort paper, tins and bottles for recycling.', 'Dad fixed a dripping tap while Archie placed a bucket underneath.', 'Mum showed him how to turn off lights in empty rooms.', 'The family planted wildflower seeds for bees and butterflies.', 'Soon, a bee landed nearby and buzzed around the new flowers.', 'Archie told his friends that nobody has to be perfect to help the planet.', 'The Earth in the key shone again: small kind choices add up.'
  ] },
];

export const CINEMA_STORIES: CinemaStory[] = ORIGINAL_STORIES.map((story, index) => ({ ...story, id: `archie-story-${index + 1}` }));
export const ILLUSTRATED_SHORTS = CINEMA_STORIES.filter(story => Boolean(story.image));
export const LIBRARY_ART = '/assets/approved/stories.png';

/** A calm, readable pace; every sentence gets at least eight seconds. */
export function pageDurationMs(text: string): number {
  return Math.max(8_000, Math.ceil(text.trim().split(/\s+/).length / 2.2) * 1_000);
}
export function storyDurationLabel(story: CinemaStory): string {
  const seconds = story.pages.reduce((sum, page) => sum + pageDurationMs(page), 0) / 1_000;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
