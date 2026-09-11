import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Volume2, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { stopTts, ttsSpeak } from '@/lib/voice-context';

type Story = { title: string; strapline: string; colour: string; pages: string[] };

const STORIES: Story[] = [
  { title: 'Archie and the Magic Key', strapline: 'Believe in yourself', colour: 'from-indigo-600 to-violet-800', pages: [
    'Archie found a little golden key sparkling beneath his pillow.', 'The key had a tiny heart and felt warm in his hand.', 'At breakfast, it pointed towards the old oak tree in the garden.', 'Jessica, Sally and Daisy sniffed a hidden door in the tree trunk.', 'The key opened the door with a friendly click.', 'Inside was a library where every book glowed like a star.', 'A sign said, “Brave readers can open any adventure.”', 'Archie chose a book and read the first word slowly and clearly.', 'The library cheered because Archie had believed in himself.', 'He went home with the key, ready for tomorrow’s adventure.'
  ] },
  { title: 'A Day at the Seaside', strapline: 'Exploring together', colour: 'from-sky-500 to-blue-800', pages: [
    'The sun shone over Felixstowe seafront as Archie packed a picnic.', 'Mum brought sandwiches while Dad carried a bright blue bucket.', 'The dogs raced across the sand, leaving bouncy paw prints.', 'Archie found a smooth shell shaped like a little trumpet.', 'He heard a soft cry near the rocks and followed the sound.', 'A tiny crab was stuck in a plastic ring beside the tide.', 'With a grown-up’s help, Archie gently freed the crab.', 'The crab clicked its claws as if it was saying thank you.', 'Everyone put their litter in the bin and watched the waves sparkle.', 'On the way home, Archie said the best adventures are shared.'
  ] },
  { title: 'The Forest Adventure', strapline: 'Nature is amazing', colour: 'from-emerald-600 to-green-950', pages: [
    'Archie and his family walked into Rendlesham Forest on a windy morning.', 'Tall trees whispered as the dogs trotted along the path.', 'A feather on the ground led them to a tiny bird nest.', 'They stepped back quietly so the parent bird would feel safe.', 'Soon, they found clues: an acorn, a cone and a muddy hoof print.', 'Archie used a picture guide to learn that a deer had passed by.', 'Daisy stopped at a puddle, and everyone laughed at her muddy paws.', 'They listened for a whole minute and heard birds, leaves and a woodpecker.', 'Archie promised to leave the forest just as lovely as they found it.', 'The family walked home with calm hearts and muddy boots.'
  ] },
  { title: 'Archie Helps a Friend', strapline: 'Friends make life brighter', colour: 'from-orange-500 to-rose-700', pages: [
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

export default function ArchieStoryCollectionPage() {
  const navigate = useNavigate();
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const story = storyIndex === null ? null : STORIES[storyIndex];

  useEffect(() => () => stopTts(), []);
  const open = (index: number) => { setStoryIndex(index); setPage(0); ttsSpeak(`${STORIES[index].title}. Page one. ${STORIES[index].pages[0]}`); };
  const close = () => { stopTts(); setStoryIndex(null); };
  const changePage = (next: number) => { if (!story) return; const safe = Math.max(0, Math.min(story.pages.length - 1, next)); setPage(safe); ttsSpeak(`Page ${safe + 1}. ${story.pages[safe]}`); };

  if (story) return <main className={`min-h-screen bg-gradient-to-b ${story.colour} px-4 py-5 text-slate-950`}>
    <div className="mx-auto max-w-4xl">
      <button onClick={close} className="mb-4 flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-black shadow-xl"><ArrowLeft /> Back to shelf</button>
      <article className="overflow-hidden rounded-[2rem] border-8 border-amber-200 bg-[#fff9e8] shadow-2xl">
        <div className="grid min-h-[620px] md:grid-cols-2">
          <div className="relative min-h-72 overflow-hidden"><img src="/assets/approved/stories.png" alt="Archie’s illustrated storybook shelf" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" /><div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 font-black">Illustrated story page</div></div>
          <div className="flex flex-col justify-between p-7 sm:p-10"><div><p className="text-sm font-black uppercase tracking-widest text-purple-700">Archie’s Stories · Page {page + 1} of 10</p><h1 className="mt-2 font-serif text-3xl font-black text-purple-950 sm:text-5xl">{story.title}</h1><p className="mt-8 font-serif text-2xl leading-relaxed text-slate-800 sm:text-3xl">{story.pages[page]}</p></div><div className="mt-8 flex flex-wrap items-center justify-between gap-3"><button onClick={() => ttsSpeak(story.pages[page])} className="flex min-h-12 items-center gap-2 rounded-full bg-purple-700 px-5 font-black text-white"><Volume2 /> Read to me</button><div className="flex gap-2"><button disabled={page === 0} onClick={() => changePage(page - 1)} className="rounded-full bg-amber-300 p-3 font-black disabled:opacity-40"><ChevronLeft /></button><button disabled={page === 9} onClick={() => changePage(page + 1)} className="rounded-full bg-amber-300 p-3 font-black disabled:opacity-40"><ChevronRight /></button></div></div></div>
        </div>
      </article>
    </div>
  </main>;

  return <main className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-100 to-sky-200 px-4 py-5 text-slate-950"><div className="mx-auto max-w-6xl"><div className="mb-5 flex items-center justify-between gap-3"><button onClick={() => navigate('/reading')} className="flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-black shadow-xl"><ArrowLeft /> Reading</button><h1 className="text-center text-2xl font-black text-purple-950 sm:text-4xl">📚 ARCHIE’S BOOK COLLECTION</h1><span className="w-24" /></div><section className="overflow-hidden rounded-[2rem] border-8 border-amber-800 bg-amber-900 shadow-2xl"><img src="/assets/approved/stories.png" alt="Archie’s Stories book shelf" className="w-full border-b-8 border-amber-800" /><div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">{STORIES.map((item, index) => <button key={item.title} onClick={() => open(index)} className={`min-h-48 rounded-2xl bg-gradient-to-br ${item.colour} p-4 text-left text-white shadow-lg transition hover:-translate-y-1 active:scale-95`}><BookOpen size={32} /><h2 className="mt-6 text-xl font-black">{item.title}</h2><p className="mt-2 text-sm font-bold text-white/85">{item.strapline}</p><span className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-black">Open book</span></button>)}</div></section><p className="mt-4 text-center font-bold text-slate-700">Tap a book, then use “Read to me” or the arrows to turn all ten pages.</p></div></main>;
}
