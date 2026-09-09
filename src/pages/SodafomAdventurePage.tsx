import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useNavigate } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';

type Screen = 'home' | 'stories' | 'lessons' | 'reader';

type Story = {
  id: number;
  title: string;
  emoji: string;
  pages: string[];
};

const STORIES: Story[] = [
  {
    id: 1,
    title: "Rendlesham Forest Adventure",
    emoji: "Forest",
    pages: [
      "One sunny morning in Felixstowe, Archie found a very special golden key. It sparkled in the sunlight. \"Wow!\" said Archie. \"I wonder where this key will take me?\"",
      "Archie showed the key to Mum Beth, Dad Michael, Kayla, and the dogs Jessica, Sally and Daisy. They packed their rucksacks and set off for Rendlesham Forest.",
      "When they arrived, the trees were tall and the air felt magical. Archie and the dogs followed a winding path deeper into the forest.",
      "As they walked through the trees, Archie noticed a strange, soft, glowing light in the distance. \"Look! What's that?\" he whispered.",
      "They found a mysterious craft resting among the trees. Archie stayed close to his family while a gentle blue light shimmered across the ground.",
      "A friendly visitor appeared and waved. Archie waved back. The visitor showed them amazing pictures of stars, planets and galaxies.",
      "The visitor shared an important message: \"Look after your planet. Be kind to people, animals and nature.\" Archie promised he would.",
      "Before leaving, the visitor gave Archie a small crystal that glowed with a soft blue light. \"Let this remind you to be curious, kind and brave.\"",
      "The light rose above the trees and disappeared into the evening sky. Archie, Kayla, Mum, Dad, Jessica, Sally and Daisy waved goodbye.",
      "On the way home Archie held the crystal and smiled. The adventure had taught him something important: be curious, be kind, be brave - and keep exploring."
    ]
  },
  {
    id: 2,
    title: "Archie and the Orford Boat Discovery",
    emoji: "Boat",
    pages: [
      "Archie, Mum, Dad, Kayla and the dogs travelled to Orford for a day beside the river. Boats bobbed gently in the harbour.",
      "Near the quay, Archie spotted an old brass compass beside a wooden post. Its needle pointed towards a small boat.",
      "A friendly boat owner invited the family aboard for a short trip. Everyone put on life jackets before stepping carefully onto the boat.",
      "As they travelled along the water, Archie used the compass and watched the shoreline. He saw birds, reeds and distant buildings.",
      "Suddenly Daisy barked at something floating nearby. It was a small waterproof box tied to a bright orange buoy.",
      "The boat owner carefully brought the box aboard. Inside was a note asking whoever found it to record the wildlife they had seen.",
      "Archie wrote down gulls, ducks, reeds and a seal in the distance. Kayla added a drawing of the harbour.",
      "They returned the box to the buoy so another family could discover it and add their own nature notes.",
      "Back at Orford, Archie looked at the compass and realised that adventures do not always need treasure. Sometimes discovery is the treasure.",
      "The family finished the day watching the boats at sunset. Archie could not wait to return and see what someone else might add to the wildlife box."
    ]
  },
  {
    id: 3,
    title: "Archie Saves the Seal Pup",
    emoji: "Seal",
    pages: [
      "Archie, Mum, Dad, Kayla and the dogs went for a walk beside the sea. The waves sparkled and gulls called above them.",
      "Near the rocks, Archie heard a tiny cry. A young seal pup was resting on the sand and looked tired and alone.",
      "Archie wanted to help straight away, but Dad reminded him not to get too close to a wild animal. They kept the dogs safely back.",
      "Mum helped Archie contact people who knew how to look after seals. Archie explained exactly where the pup was and what they could see.",
      "While they waited, Archie watched quietly from a safe distance. He learned that seal pups sometimes rest on beaches and should not be disturbed.",
      "A wildlife helper arrived and carefully checked the seal. The pup was weak and needed help, so the expert prepared to move it safely.",
      "Archie asked lots of questions about seals, the sea and how litter can hurt wildlife. He decided he wanted to help keep beaches clean.",
      "The family collected safe pieces of rubbish from the beach while the wildlife team cared for the pup. Everyone worked together.",
      "A few days later, Archie heard good news. The seal pup was stronger and would soon be ready to return to the sea.",
      "Archie smiled. Helping animals meant being kind, staying safe and listening to experts. Small actions could make a big difference."
    ]
  },
  {
    id: 4,
    title: "Archie and the Lost Key",
    emoji: "Key",
    pages: [
      "One afternoon, Archie noticed that the little golden key he kept in his adventure box was missing. \"Where can it be?\" he wondered.",
      "Archie checked his room carefully. He looked under the bed, behind his books and inside his backpack, but the key was nowhere to be seen.",
      "Jessica sniffed by the hallway while Sally waited at the door. Daisy trotted towards the garden as if she had found a clue.",
      "Outside, Archie discovered tiny muddy pawprints leading towards the old tree. He followed them slowly and looked around carefully.",
      "Near the tree was a small wooden box Archie had never noticed before. It had a key-shaped mark on the lid but no handle.",
      "Archie found his golden key beneath a pile of leaves. When he placed it into the box, the lid clicked open.",
      "Inside was not treasure or money. There was a notebook, coloured pencils and a message: \"Fill these pages with your brightest ideas.\"",
      "Archie began drawing inventions, stories, animals and places he wanted to visit. Kayla joined him and added her own colourful ideas.",
      "Dad smiled and said that a key can open more than a lock. Sometimes curiosity is the key that opens a brand-new idea.",
      "Archie placed the golden key safely back in his adventure box. He had found it again - and discovered that imagination can unlock whole new worlds."
    ]
  },
  {
    id: 5,
    title: "Archie Builds a Treehouse",
    emoji: "Treehouse",
    pages: [
      "Archie looked at the big tree in the garden and had an idea. \"Could we build a treehouse?\" he asked Dad.",
      "Dad said they could plan one together, but first they needed to think about safety. Archie drew a simple design on paper.",
      "Mum helped measure the space while Kayla chose a place for a small reading corner. Jessica, Sally and Daisy watched every step.",
      "They made a list of materials and checked what they already had. Archie learned that careful planning saves time and waste.",
      "With an adult doing the difficult cutting and fixing, Archie helped pass safe tools and count the pieces of wood.",
      "Slowly the treehouse took shape. It had a strong floor, a little roof and a safe ladder with handholds.",
      "Kayla painted a sign that said \"Archie's Adventure Club\". Archie added a golden key symbol underneath.",
      "They carried books, cushions and a small telescope inside. The dogs stayed safely on the ground while everyone enjoyed the new hideaway.",
      "That evening, Archie and Kayla sat in the treehouse and watched the sky change colour. They were proud because they had worked as a team.",
      "Archie learned that big ideas become possible when you plan carefully, ask for help and keep going one step at a time."
    ]
  },
  {
    id: 6,
    title: "Archie Visits the London Landmarks",
    emoji: "London",
    pages: [
      "Archie and his family travelled to London for a day of exploring. Archie carried a little map and marked each place they hoped to see.",
      "The first stop was the Houses of Parliament and Big Ben. Archie listened to the famous clock and looked across the River Thames.",
      "Next they crossed a bridge and spotted the London Eye. From below it looked enormous, with capsules moving slowly around the wheel.",
      "At Buckingham Palace, Archie learned that the building is an official royal residence. Kayla counted the guards near the gates.",
      "They visited Trafalgar Square and saw the tall column and fountains. Archie used the map to work out which direction they should walk next.",
      "At the Tower of London, the family learned about kings, queens, prisoners and the Crown Jewels. Archie had lots of questions.",
      "They travelled on the Underground and practised reading signs, station names and line colours. Archie liked planning the route.",
      "Later they visited a museum where Archie saw objects from long ago. He realised that history becomes easier to understand when you can see real evidence.",
      "As evening arrived, the family stood beside the Thames and looked at the city lights. They had walked a long way and learned a lot.",
      "Archie folded his map and smiled. London was full of stories, history, science and people - and there was still much more to explore."
    ]
  },
  {
    id: 7,
    title: "Archie Explores Space",
    emoji: "Space",
    pages: [
      "One clear night Archie looked through his telescope and saw the Moon shining brightly. \"I wish I could explore space,\" he said.",
      "In his imagination, Archie climbed aboard a bright blue rocket with a golden key on the side. The countdown began: ten, nine, eight...",
      "The rocket lifted above the clouds and Earth became a beautiful blue and green ball below him.",
      "Archie passed the Moon and learned that it has much less gravity than Earth. He imagined bouncing lightly across its dusty surface.",
      "Next he travelled towards Mars, the red planet. Archie saw giant volcanoes, deep valleys and dusty plains.",
      "Farther away were Jupiter and Saturn. Jupiter was enormous, while Saturn's rings looked like a glittering disc.",
      "Archie thought about astronauts living on the International Space Station. They exercise, work, eat and sleep while orbiting Earth.",
      "He looked back at Earth and noticed how small it seemed in the darkness. Every country and every person shared the same planet.",
      "The rocket turned towards home. Archie wrote down everything he wanted to learn next: stars, galaxies, black holes and distant worlds.",
      "When Archie opened his eyes he was still beside his telescope, but his curiosity had travelled millions of miles. Learning could take him anywhere."
    ]
  },
  {
    id: 8,
    title: "Archie Helps in the Community",
    emoji: "Community",
    pages: [
      "Archie noticed some litter near the park and asked Mum why people sometimes left rubbish behind. \"Maybe we can help,\" he said.",
      "The family decided to organise a small community clean-up. They asked adults to help make sure everyone stayed safe.",
      "Archie made colourful posters and Kayla helped write a message inviting neighbours to join them.",
      "On the day, everyone wore gloves and used safe litter-pickers. Adults handled anything sharp or dangerous.",
      "Jessica, Sally and Daisy came along on their leads while Archie and Kayla collected cans, paper and plastic.",
      "They sorted recyclable items from general rubbish and talked about why reducing waste can protect animals and nature.",
      "A neighbour brought water for the helpers, and another person donated flowers to brighten a small patch near the path.",
      "By the afternoon the area looked cleaner and friendlier. Archie realised that lots of small jobs can add up to a big improvement.",
      "The group thanked everyone who had helped. Archie felt proud, not because he had done everything, but because people had worked together.",
      "From then on, Archie looked for simple ways to help: being kind, recycling, checking on neighbours and caring for shared places."
    ]
  },
  {
    id: 9,
    title: "Archie and the Dinosaur Trail",
    emoji: "Dinosaur",
    pages: [
      "Archie visited a dinosaur exhibition and gasped when he saw a huge skeleton towering above him.",
      "He learned that dinosaurs lived millions of years before humans. Scientists study fossils to discover what ancient life was like.",
      "Archie followed a trail of footprints through the exhibition. Each stop gave him a clue about a different dinosaur.",
      "One clue described a plant-eater with three horns. Archie found the Triceratops display and carefully read the information board.",
      "Another clue mentioned a long-necked dinosaur that could reach high leaves. Archie imagined how enormous it must have been.",
      "Then he reached a Tyrannosaurus rex model with huge teeth. Archie learned that scientists compare bones and footprints to understand how dinosaurs moved.",
      "At a fossil table, Archie saw the shape of an ancient shell in stone. He learned that not every fossil comes from a dinosaur.",
      "Kayla helped him make a timeline showing dinosaurs, early mammals and humans. Archie could finally see just how long ago dinosaurs lived.",
      "Before leaving, Archie chose a notebook and drew his own imaginary dinosaur, giving it features based on what he had learned.",
      "Archie smiled at his drawing. Science was like a giant detective story, using clues from the past to understand life on Earth."
    ]
  },
  {
    id: 10,
    title: "A Brighter Tomorrow",
    emoji: "Rainbow",
    pages: [
      "Archie sat with his family and thought about all the adventures they had shared. Every journey had taught him something new.",
      "He had learned to care for animals, protect nature, ask questions, use maps, explore history and look up at the stars.",
      "Kayla reminded him that learning is not only about getting answers right. It is also about trying, practising and asking for help.",
      "Mum said kindness is a skill too. A kind word or helpful action can change somebody's whole day.",
      "Dad said courage does not mean never being worried. It can mean giving something a try even when it feels difficult.",
      "Jessica, Sally and Daisy curled up beside the family while Archie opened his notebook of ideas.",
      "He drew a school where every child could learn in a way that worked for them, with stories, games, voices, pictures and helpful technology.",
      "Archie added a golden key above the door. To him, the key meant opportunity - a way to unlock confidence and curiosity.",
      "The family looked at the drawing together. Archie knew no one could build a brighter future alone. It would take families, teachers, friends and communities.",
      "Archie wrote one final sentence beneath his picture: \"Together, we can give children a brighter future.\" Then he smiled, ready for the next adventure."
    ]
  }
];

const SUBJECTS = [
  ['Maths', '🧮', '/subjects/maths'], ['English', '📖', '/subjects/reading'], ['Science', '🧪', '/subjects/science'],
  ['Geography', '🌍', '/games/geography-quiz'], ['History', '🏛️', '/games/history-detective'], ['Spelling', '🔤', '/subjects/spelling'],
  ['PE', '🏃', '/games/speed-challenge'], ['Technology', '💻', '/ai-teacher'], ['French', '🇫🇷', '/ai-teacher'], ['German', '🇩🇪', '/ai-teacher']
];

const MENU = [
  ['Archie’s Stories', '📚', '#1689e8', 'stories'],
  ['Archie’s Lessons', '🎓', '#7b2ce2', 'lessons'],
  ['Ask Archie', '🤖', '#16b96b', '/ask-archie'],
  ['Archie’s Games', '🎮', '#ef2d63', '/games/maths-hub'],
  ['Homework Helper', '📷', '#f47c20', '/ai-teacher'],
  ['Watch Archie’s Cartoons', '🎬', '#f2b51d', '/cartoons'],
  ['Parent Area', '👨‍👩‍👧', '#ec3f98', '/parent-dashboard'],
  ['Teacher Tools', '👩‍🏫', '#14a7a0', '/teacher-hub'],
  ['Shop & Vouchers', '🛍️', '#1689e8', '/pricing'],
  ['Settings', '⚙️', '#7b2ce2', '/hub/profile'],
];

export default function SodafomAdventurePage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('home');
  const [storyId, setStoryId] = useState(1);
  const [page, setPage] = useState(0);
  const [activeWord, setActiveWord] = useState(-1);
  const [listening, setListening] = useState(false);
  const [heardText, setHeardText] = useState('');
  const [rewardMessage, setRewardMessage] = useState('');
  const recognitionRef = useRef<any>(null);

  const story = useMemo(() => STORIES.find(s => s.id === storyId) || STORIES[0], [storyId]);
  const words = useMemo(() => story.pages[page]?.split(/\s+/) || [], [story, page]);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop?.();
    setListening(false);
    setActiveWord(-1);
    setHeardText('');
  }, [page, screen]);

  const openMenu = (target: string) => {
    if (target === 'stories' || target === 'lessons') setScreen(target as Screen);
    else navigate(target);
  };

  const openStory = (id: number) => {
    const selected = STORIES.find(s => s.id === id);
    if (!selected?.pages.length) return;
    setStoryId(id);
    setPage(0);
    setRewardMessage('');
    setScreen('reader');
  };

  const readToMe = () => {
    if (!story.pages[page] || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setActiveWord(0);
    const utterance = new SpeechSynthesisUtterance(story.pages[page]);
    utterance.rate = 0.88;
    utterance.pitch = 1.08;
    utterance.onboundary = (event: any) => {
      if (typeof event.charIndex !== 'number') return;
      const before = story.pages[page].slice(0, event.charIndex);
      setActiveWord(before.trim() ? before.trim().split(/\s+/).length : 0);
    };
    utterance.onend = () => setActiveWord(-1);
    utterance.onerror = () => setActiveWord(-1);
    window.speechSynthesis.speak(utterance);
  };

  const readWithMe = () => {
    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      return;
    }
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setHeardText('Voice reading is not supported in this browser yet.');
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) transcript += event.results[i][0].transcript + ' ';
      const cleaned = transcript.trim();
      setHeardText(cleaned);
      const count = cleaned ? cleaned.split(/\s+/).length : 0;
      setActiveWord(Math.min(words.length - 1, Math.max(0, count - 1)));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const finishBook = () => {
    const key = 'sodafom_story_rewards';
    const current = Number(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(current + 1));
    setRewardMessage('⭐ Brilliant reading! You earned a story star!');
  };

  const HomeScreen = () => (
    <main className="min-h-screen bg-gradient-to-b from-sky-300 via-white to-emerald-100 text-slate-900">
      <section className="relative overflow-hidden border-b-8 border-white bg-[url('/assets/cartoon/home-landscape-v2.png')] bg-cover bg-center px-4 pb-6 pt-5 text-center shadow-xl">
        <div className="absolute inset-0 bg-white/10" />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-2 inline-flex items-center gap-3 rounded-full border-4 border-white bg-blue-700 px-5 py-2 text-white shadow-xl">
            <span className="text-2xl">🌈</span><span className="font-black">A brighter future for every child</span><span>💛</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl"><span className="text-yellow-400">🔑</span><span className="text-red-500">S</span><span className="text-yellow-500">o</span><span className="text-blue-600">d</span><span className="text-green-500">a</span><span className="text-red-500">f</span><span className="text-blue-600">o</span><span className="text-purple-600">m</span></h1>
          <p className="mt-1 font-black text-blue-950">A key to your children’s success</p>
          <div className="mt-4 flex items-end justify-center gap-2">
            <ArchieCharacter size={220} />
            <div className="mb-12 max-w-xs rounded-[2rem] border-4 border-blue-700 bg-white p-4 text-xl font-black text-blue-950 shadow-xl">Hello! What would you like to do today?</div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-5">
        {MENU.map(([label, icon, color, target]) => (
          <button key={label} onClick={() => openMenu(target)} className="flex min-h-36 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-3 text-white shadow-xl active:scale-95" style={{background: color}}>
            <span className="text-5xl">{icon}</span><span className="mt-2 text-center text-sm font-black leading-tight sm:text-base">{label}</span>
          </button>
        ))}
      </section>
      <section className="mx-auto mb-6 grid max-w-5xl grid-cols-3 gap-2 px-4 text-center text-sm font-black text-blue-950 sm:grid-cols-5">
        <button onClick={() => navigate('/hub/progress')} className="rounded-2xl border-2 border-blue-200 bg-white p-3 shadow">🏆 My Progress</button>
        <button onClick={() => navigate('/rewards')} className="rounded-2xl border-2 border-blue-200 bg-white p-3 shadow">⭐ Rewards</button>
        <button onClick={() => setScreen('stories')} className="rounded-2xl border-2 border-blue-200 bg-white p-3 shadow">📚 Reading</button>
        <button onClick={() => navigate('/admin-panel')} className="rounded-2xl border-2 border-blue-200 bg-white p-3 shadow">🛡️ Admin</button>
        <button onClick={() => navigate('/login')} className="rounded-2xl border-2 border-blue-200 bg-white p-3 shadow">🔐 Sign in</button>
      </section>
      <footer className="bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 px-4 py-4 text-center font-black text-white">Together, we can give children a brighter future. ❤️</footer>
    </main>
  );

  const StoriesScreen = () => (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => setScreen('home')} className="mb-4 rounded-full bg-blue-700 px-5 py-2 font-black text-white shadow">← Home</button>
        <div className="rounded-[2rem] border-4 border-white bg-emerald-800 p-5 text-center text-white shadow-xl"><h2 className="text-4xl font-black">Archie’s Stories</h2><p className="mt-1 font-bold">Choose a book and start your adventure!</p></div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {STORIES.map(s => <button key={s.id} onClick={() => openStory(s.id)} className="min-h-44 rounded-3xl border-4 border-white bg-gradient-to-b from-blue-500 to-blue-800 p-4 text-white shadow-xl active:scale-95"><div className="text-5xl">{s.emoji}</div><div className="mt-2 font-black">{s.id}. {s.title}</div><div className="mt-2 text-xs font-bold">10 pages • Tap to read</div></button>)}
        </div>
      </div>
    </main>
  );

  const LessonsScreen = () => (
    <main className="min-h-screen bg-gradient-to-b from-sky-300 to-amber-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-4xl text-center"><button onClick={() => setScreen('home')} className="mb-4 rounded-full bg-blue-700 px-5 py-2 font-black text-white shadow">← Home</button><div className="rounded-[2rem] border-4 border-white bg-blue-700 p-5 text-white shadow-xl"><h2 className="text-4xl font-black">Archie’s Lessons</h2><p className="font-bold">Choose a subject and let’s learn!</p></div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">{SUBJECTS.map(([name,icon,route]) => <button key={name} onClick={() => navigate(route)} className="rounded-3xl border-4 border-white bg-white p-5 shadow-xl active:scale-95"><div className="text-5xl">{icon}</div><div className="mt-2 font-black text-blue-900">{name}</div></button>)}</div></div>
    </main>
  );

  const ReaderScreen = () => (
    <main className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-700 to-sky-700 px-4 py-5 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between"><button onClick={() => setScreen('stories')} className="rounded-full bg-white px-4 py-2 font-black text-blue-900 shadow">← Books</button><span className="rounded-full bg-white px-4 py-2 font-black text-blue-900 shadow">Page {page+1} of 10</span></div>
        <article className="overflow-hidden rounded-[2rem] border-8 border-white bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-blue-700 to-emerald-600 p-4 text-center text-white"><h2 className="text-2xl font-black">{story.emoji} {story.title}</h2></div>
          <div className="flex min-h-[24rem] flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-emerald-100 p-7 text-center">
            <ArchieCharacter size={190}/>
            <p className="mt-5 max-w-xl text-xl font-bold leading-relaxed text-blue-950">
              {words.map((word, index) => <span key={`${page}-${index}`} className={index === activeWord ? 'rounded bg-yellow-300 px-1' : ''}>{word} </span>)}
            </p>
            {heardText && <div className="mt-4 max-w-xl rounded-2xl bg-white/90 p-3 text-sm font-bold text-slate-700">I heard: {heardText}</div>}
            {rewardMessage && <div className="mt-4 rounded-2xl bg-yellow-300 px-5 py-3 font-black text-blue-950">{rewardMessage}</div>}
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            <button disabled={page===0} onClick={() => setPage(p => Math.max(0,p-1))} className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-40">← Back</button>
            <button onClick={readToMe} className="rounded-2xl bg-yellow-400 px-5 py-3 font-black text-blue-950">🔊 Read to me</button>
            <button onClick={readWithMe} className={`rounded-2xl px-5 py-3 font-black text-white ${listening ? 'bg-red-600' : 'bg-purple-600'}`}>{listening ? '⏹ Stop listening' : '🎤 Read with me'}</button>
            {page < 9 ? <button onClick={() => setPage(p => Math.min(9,p+1))} className="rounded-2xl bg-green-600 px-5 py-3 font-black text-white">Next →</button> : <button onClick={finishBook} className="rounded-2xl bg-green-600 px-5 py-3 font-black text-white">⭐ Finish book</button>}
          </div>
        </article>
      </div>
    </main>
  );

  return <><Helmet><title>Sodafom — Archie Learning</title></Helmet>{screen==='home'&&<HomeScreen/>}{screen==='stories'&&<StoriesScreen/>}{screen==='lessons'&&<LessonsScreen/>}{screen==='reader'&&<ReaderScreen/>}</>;
}
