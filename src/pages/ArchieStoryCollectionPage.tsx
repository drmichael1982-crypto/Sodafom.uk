import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Eye, Mic, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { stopTts, ttsSpeak } from '@/lib/voice-context';
import { motion } from 'motion/react';
import ArchieCharacter from '@/components/ArchieCharacter';

type Story = { title: string; strapline: string; colour: string; image?: string; pages: string[] };

const STORIES: Story[] = [
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

const shelfRows = [STORIES.slice(0, 5), STORIES.slice(5, 10)];

export default function ArchieStoryCollectionPage() {
  const navigate = useNavigate();
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [turning, setTurning] = useState(false);
  const [archiesView, setArchiesView] = useState(false);
  const [listening, setListening] = useState(false);
  const [wordStates, setWordStates] = useState<Array<'pending' | 'correct' | 'wrong'>>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [welcome, setWelcome] = useState(false);
  const recognitionRef = useRef<any>(null);
  const story = storyIndex === null ? null : STORIES[storyIndex];

  const timersRef = useRef<Set<number>>(new Set());
  const stopReading = () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.stop?.();
    }
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current.clear();
  };
  const later = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
  };
  useEffect(() => () => { stopReading(); stopTts(); }, []);

  const words = story ? story.pages[page].split(/\s+/) : [];
  const clean = (word: string) => word.toLowerCase().replace(/[^a-z0-9']/g, '');
  const soundOut = (word: string) => {
    const sounds = clean(word).match(/tion|igh|air|ear|ure|oo|ee|ai|ay|oa|ow|oi|oy|ch|sh|th|ph|ck|ng|qu|[a-z]/g) ?? [];
    return sounds.join(' … ');
  };

  const resetReadAlong = () => {
    stopReading();
    stopTts();
    setListening(false);
    setWordStates(words.map(() => 'pending'));
    setWordIndex(0);
  };

  const open = (index: number) => {
    setStoryIndex(index);
    setPage(0);
    setArchiesView(false);
    setWelcome(true);
    setWordStates(STORIES[index].pages[0].split(/\s+/).map(() => 'pending'));
    setWordIndex(0);
  };

  const close = () => {
    resetReadAlong();
    stopTts();
    setWelcome(false);
    setTurning(false);
    setStoryIndex(null);
  };

  const changePage = (next: number) => {
    if (!story || turning) return;
    const safe = Math.max(0, Math.min(story.pages.length - 1, next));
    if (safe === page) return;
    resetReadAlong();
    setTurning(true);
    later(() => {
      setPage(safe);
      setWordStates(story.pages[safe].split(/\s+/).map(() => 'pending'));
      setWordIndex(0);
      setTurning(false);
    }, 750);
  };

  const startReading = () => {
    if (!story) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      ttsSpeak('Your browser does not support reading aloud yet.');
      return;
    }

    stopTts();
    const recognition = new SpeechRecognition();
    let position = wordIndex;
    const nextStates = [...(wordStates.length ? wordStates : words.map(() => 'pending' as const))];
    recognition.lang = 'en-GB';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const heard = String(event.results[event.results.length - 1][0].transcript).split(/\s+/).map(clean).filter(Boolean);
      if (recognitionRef.current !== recognition) return;
      for (const spoken of heard) {
        if (position >= words.length) break;
        const expected = clean(words[position]);
        const previous = position > 0 ? clean(words[position - 1]) : '';
        if (spoken === previous && spoken !== expected) continue;
        if (spoken === expected) {
          nextStates[position] = 'correct';
          position += 1;
        } else if (heard.includes(expected)) {
          continue;
        } else {
          nextStates[position] = 'wrong';
          ttsSpeak(`Let us sound it out: ${soundOut(words[position])}. Your turn.`);
          break;
        }
      }
      setWordStates([...nextStates]);
      setWordIndex(position);
      if (position >= words.length) {
        recognition.onresult = null;
        recognition.stop();
        setListening(false);
      }
      if (position >= words.length && page < story.pages.length - 1) {
        later(() => changePage(page + 1), 1100);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    try { recognition.start(); } catch {
      stopReading();
      setListening(false);
      ttsSpeak("The microphone could not start. You can still use Read to me.");
    }
  };

  if (story && welcome) {
    return (
      <main className={`min-h-screen bg-gradient-to-b ${story.colour} px-4 py-5 text-slate-950`}>
        <div className="mx-auto max-w-5xl">
          <button onClick={close} className="mb-4 flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-black shadow-xl">
            <ArrowLeft /> Back to library
          </button>

          <motion.section
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-[2.5rem] border-8 border-amber-200 bg-[#f9e7bd] shadow-2xl"
          >
            <div className="grid min-h-[590px] items-stretch md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative flex items-center justify-center overflow-hidden bg-amber-950/10 p-8">
                <motion.div
                  initial={{ rotateY: -28, rotateZ: -2 }}
                  animate={{ rotateY: 0, rotateZ: 0 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 16 }}
                  className={`relative h-[420px] w-[280px] overflow-hidden rounded-r-2xl border-y-4 border-r-4 border-amber-100 bg-gradient-to-br ${story.colour} shadow-2xl [box-shadow:-16px_0_0_#5b341d,0_28px_50px_rgba(60,28,10,.35)]`}
                >
                  {story.image ? (
                    <img src={story.image} alt={`${story.title} cover illustration`} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <img src="/assets/images/archie-character-v2.png" alt="Archie on the book cover" className="absolute bottom-20 left-1/2 h-56 w-56 -translate-x-1/2 object-contain drop-shadow-2xl" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/10 to-black/20" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="font-serif text-3xl font-black leading-tight">{story.title}</p>
                    <p className="mt-2 font-bold text-white/90">{story.strapline}</p>
                  </div>
                </motion.div>
              </div>

              <div className="relative flex min-h-[470px] flex-col justify-end overflow-hidden bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 p-7 sm:p-10">
                <div className="absolute inset-x-0 bottom-0 h-24 border-t-4 border-amber-300 bg-amber-200/80" />
                <motion.div
                  aria-label={`Archie steps out of ${story.title}`}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2"
                  initial={{ x: -150, y: 18, scale: 0.38, opacity: 0 }}
                  animate={{ x: [-150, -105, -55, -10, 24], y: [18, -12, 8, -10, 0], scale: [0.38, 0.55, 0.72, 0.9, 1], opacity: [0, 1, 1, 1, 1] }}
                  transition={{ duration: 1.65, ease: 'easeOut' }}
                >
                  <ArchieCharacter size={190} />
                </motion.div>

                <div className="relative z-10 rounded-3xl bg-white/95 p-6 shadow-xl backdrop-blur-sm">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-700">Selected book</p>
                  <h1 className="mt-2 font-serif text-3xl font-black text-purple-950 sm:text-4xl">{story.title}</h1>
                  <p className="mt-2 font-bold text-slate-700">Archie has stepped out of the cover. Open the book when you are ready.</p>
                  <button onClick={() => setWelcome(false)} className="mt-5 min-h-12 rounded-full bg-purple-700 px-7 font-black text-white shadow-lg transition hover:bg-purple-800 active:scale-95">
                    Open the book
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    );
  }

  if (story) {
    return (
      <main className={`min-h-screen bg-gradient-to-b ${story.colour} px-4 py-5 text-slate-950`}>
        <div className="mx-auto max-w-4xl">
          <button onClick={close} className="mb-4 flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-black shadow-xl">
            <ArrowLeft /> Back to library
          </button>

          <motion.article
            initial={{ rotateY: -80, scale: 0.72, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 115, damping: 18 }}
            className="overflow-hidden rounded-[2rem] border-8 border-amber-200 bg-[#fff9e8] shadow-2xl"
          >
            <div className="grid min-h-[620px] md:grid-cols-2">
              <div className="relative min-h-72 overflow-hidden bg-indigo-950">
                <motion.img
                  key={`${story.title}-${page}-${archiesView}`}
                  src={story.image ?? '/assets/approved/stories.png'}
                  alt={`${story.title} illustrated scene`}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  initial={{ scale: archiesView ? 1.42 : 1.16, x: page % 2 ? '5%' : '-5%', opacity: 0.55 }}
                  animate={{ scale: archiesView ? 1.26 : 1.04, x: archiesView ? (page % 2 ? '-13%' : '13%') : (page % 2 ? '-3%' : '3%'), opacity: 1 }}
                  transition={{ duration: 7, ease: 'linear' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
                {!archiesView && (
                  <motion.div
                    className="absolute bottom-2 left-2"
                    animate={turning ? { x: ['0%', '290%'], y: [0, -8, 0], rotate: [0, -6, 5, 0] } : { x: ['0%', '20%', '0%'], y: [0, -7, 0, -7, 0], rotate: [0, -2, 2, -2, 0] }}
                    transition={turning ? { duration: 0.7, ease: 'easeInOut' } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArchieCharacter size={96} />
                  </motion.div>
                )}
                <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 font-black text-slate-900 shadow-lg">
                  {archiesView ? 'Looking through Archie’s eyes' : 'Illustrated story scene'}
                </div>
              </div>

              <div className="flex flex-col justify-between p-7 sm:p-10">
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-purple-700">Archie’s Stories · Page {page + 1} of {story.pages.length}</p>
                  <h1 className="mt-2 font-serif text-3xl font-black text-purple-950 sm:text-5xl">{story.title}</h1>
                  <p className="mt-8 font-serif text-2xl leading-relaxed text-slate-800 sm:text-3xl">
                    {words.map((word, index) => (
                      <span key={`${page}-${index}`} className={wordStates[index] === 'correct' ? 'text-green-600' : wordStates[index] === 'wrong' ? 'text-red-600 underline decoration-red-500 decoration-2' : 'text-slate-900'}>
                        {word}{' '}
                      </span>
                    ))}
                  </p>
                  <p className="mt-3 text-sm font-bold text-purple-700">
                    {listening ? 'Archie is listening…' : wordIndex === words.length && words.length > 0 ? 'Brilliant reading!' : 'Black = to read · Green = correct · Red = Archie will help'}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <button onClick={() => ttsSpeak(story.pages[page])} className="flex min-h-12 items-center gap-2 rounded-full bg-purple-700 px-5 font-black text-white">
                    <Volume2 /> Read to me
                  </button>
                  <button onClick={startReading} disabled={listening || wordIndex === words.length} className="flex min-h-12 items-center gap-2 rounded-full bg-emerald-600 px-5 font-black text-white disabled:opacity-50">
                    <Mic /> {listening ? 'Listening…' : wordIndex === words.length ? 'Page completed' : 'I want to read'}
                  </button>
                  <button onClick={() => setArchiesView(value => !value)} className="flex min-h-12 items-center gap-2 rounded-full bg-sky-600 px-5 font-black text-white">
                    <Eye /> {archiesView ? 'Leave Archie’s view' : 'Look through Archie’s eyes'}
                  </button>
                  <div className="flex gap-2">
                    <button disabled={page === 0 || turning} onClick={() => changePage(page - 1)} aria-label="Previous page" className="rounded-full bg-amber-300 p-3 font-black disabled:opacity-40">
                      <ChevronLeft />
                    </button>
                    <button disabled={page === story.pages.length - 1 || turning} onClick={() => changePage(page + 1)} aria-label="Next page" className="rounded-full bg-amber-300 p-3 font-black disabled:opacity-40">
                      <ChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-50 to-amber-100 px-4 py-5 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button onClick={() => navigate('/reading')} className="flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-black shadow-xl">
            <ArrowLeft /> Reading
          </button>
          <div className="rounded-3xl border-4 border-amber-700 bg-white px-5 py-3 text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 text-purple-950">
              <BookOpen aria-hidden />
              <h1 className="text-2xl font-black sm:text-4xl">ARCHIE’S BOOK COLLECTION</h1>
            </div>
            <p className="mt-1 font-bold text-slate-600">Choose a cover from the library shelves.</p>
          </div>
          <span className="hidden w-28 sm:block" />
        </div>

        <section className="overflow-hidden rounded-[2.5rem] border-8 border-amber-900 bg-gradient-to-b from-[#f7dca6] via-[#edc47d] to-[#d19a50] shadow-2xl">
          <div className="border-b-4 border-amber-800 bg-[#6f3f24] px-6 py-4 text-center text-lg font-black text-amber-50 shadow-inner">
            The Story Library
          </div>

          <div className="space-y-10 px-4 py-8 sm:px-8">
            {shelfRows.map((row, rowIndex) => (
              <div key={`shelf-${rowIndex}`} className="relative pb-8">
                <div className="flex gap-5 overflow-x-auto px-2 pb-4 pt-3 sm:justify-center">
                  {row.map((item) => {
                    const index = STORIES.indexOf(item);
                    return (
                      <button
                        key={item.title}
                        onClick={() => open(index)}
                        className="group relative h-64 w-44 shrink-0 overflow-hidden rounded-r-2xl border-y-4 border-r-4 border-amber-100 bg-slate-900 text-left text-white shadow-[inset_9px_0_0_rgba(42,20,12,.6),0_14px_20px_rgba(61,31,13,.35)] transition duration-200 hover:-translate-y-3 hover:rotate-1 focus:outline-none focus:ring-4 focus:ring-purple-400 active:scale-95"
                        aria-label={`Open ${item.title}`}
                      >
                        {item.image ? (
                          <img src={item.image} alt={`${item.title} cover illustration`} className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.colour}`}>
                            <img src="/assets/images/archie-character-v2.png" alt="Archie" className="absolute bottom-16 left-1/2 h-36 w-36 -translate-x-1/2 object-contain drop-shadow-2xl" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/10" />
                        <div className="absolute inset-y-0 left-0 w-3 border-r border-amber-100/30 bg-black/35" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <h2 className="font-serif text-xl font-black leading-tight drop-shadow-lg">{item.title}</h2>
                          <p className="mt-1 text-xs font-bold text-white/90">{item.strapline}</p>
                          <span className="mt-3 inline-block rounded-full bg-white/95 px-3 py-1 text-xs font-black text-purple-900">Open book</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div aria-hidden className="absolute inset-x-0 bottom-1 h-7 rounded-md border-y-4 border-[#6b351c] bg-gradient-to-b from-[#b96f35] to-[#7a3f21] shadow-[0_12px_18px_rgba(62,31,13,.35)]" />
                <div aria-hidden className="absolute inset-x-4 bottom-0 h-2 rounded-b-full bg-[#4d2819]" />
              </div>
            ))}
          </div>
        </section>

        <p className="mt-5 text-center font-bold text-slate-700">Select a book to see Archie step out of its cover, then open it and read all ten pages.</p>
      </div>
    </main>
  );
}
