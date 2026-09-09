import React, { useMemo, useState } from 'react';
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
    title: 'Rendlesham Forest Adventure',
    emoji: '🌲',
    pages: [
      'One sunny morning, Archie found a very special key. It was golden and it sparkled in the sunlight. “Wow!” said Archie. “I wonder where this key will take me?”',
      'Archie showed the key to Mum, Beth, Dad, Michael, and the dogs. They decided to go on an adventure to Rendlesham Forest to find out what it could unlock.',
      'When they arrived at Rendlesham Forest, the trees were tall and the air felt magical. Archie, Jessica, Sally and Daisy walked deeper into the forest.',
      'As they walked through the trees, Archie noticed a strange, soft, glowing light in the distance. “Look! What’s that?” he whispered.',
      'They found a mysterious spaceship on the ground. It looked like it had come from another world. Archie gently touched the door and it slowly opened.',
      'Inside the spaceship, they met a friendly alien with big kind eyes and a warm smile. The alien showed Archie amazing pictures of the stars, planets and galaxies.',
      'The alien gave Archie a special message. “Look after your planet. Be kind to people, animals and nature.” Archie promised he would always help look after the Earth.',
      'Before it was time to go, the alien gave Archie a small crystal. It glowed with a soft blue light. “This crystal will remind you to be curious, kind and brave.”',
      'The alien closed the spaceship door and the light slowly lifted into the sky. Archie, Jessica, Sally and Daisy waved until it was out of sight.',
      'As they walked back home, Archie felt happy. He had a new friend, a special crystal and a big message to remember. Be curious. Be kind. Be brave. Explore more!'
    ]
  },
  {
    id: 2,
    title: 'Archie and the Seaside Mystery',
    emoji: '🐚',
    pages: [
      'It was a bright day and Archie and his family decided to visit Orford by the sea. Archie could not wait for another adventure.',
      'When they arrived at Orford, Archie spotted something shiny on the beach. It was an old seashell, but it looked very special.',
      'As Archie held the shell, he heard a soft whisper. The dogs barked and ran towards some rocks. Archie followed them to see what they had found.',
      'Behind the rocks, they discovered a hidden cove. Inside was an old map showing a secret path towards Orford Castle.',
      'They followed the map, walking along the beach and up to the castle. It was not easy, but they never gave up because they worked together.',
      'At the top of the castle, they found a chest. Archie opened it carefully. Inside was a collection of memories: old photos, a letter and a beautiful compass.',
      'The letter said: “The real treasure is the adventure, the friends you share it with, and the amazing places you discover.”',
      'Archie smiled. He knew the treasure was not about money. It was about family, friends and new experiences. They sat together and looked out at the sea.',
      'On the way home, Archie looked at the shell and compass. They would always remind him to be curious, brave and kind.',
      'Archie, his family and the dogs watched the sun set over the sea. Another amazing day had ended, but many more adventures were still to come.'
    ]
  },
  {
    id: 3,
    title: 'Archie Saves the Seal Pup',
    emoji: '🦭',
    pages: [
      'Archie, Mum, Dad, Kayla and the dogs went for a walk beside the sea. The waves sparkled and gulls called above them.',
      'Near the rocks, Archie heard a tiny cry. A young seal pup was resting on the sand and looked tired and alone.',
      'Archie wanted to help straight away, but Dad reminded him not to get too close to a wild animal. They kept the dogs safely back.',
      'Mum helped Archie contact people who knew how to look after seals. Archie explained exactly where the pup was and what they could see.',
      'While they waited, Archie watched quietly from a safe distance. He learned that seal pups sometimes rest on beaches and should not be disturbed.',
      'A wildlife helper arrived and carefully checked the seal. The pup was weak and needed help, so the expert prepared to move it safely.',
      'Archie asked lots of questions about seals, the sea and how litter can hurt wildlife. He decided he wanted to help keep beaches clean.',
      'The family collected safe pieces of rubbish from the beach while the wildlife team cared for the pup. Everyone worked together.',
      'A few days later, Archie heard good news. The seal pup was stronger and would soon be ready to return to the sea.',
      'Archie smiled. Helping animals meant being kind, staying safe and listening to experts. Small actions could make a big difference.'
    ]
  },
  {
    id: 4,
    title: 'Archie and the Lost Key',
    emoji: '🗝️',
    pages: [
      'One afternoon, Archie noticed that the little golden key he kept in his adventure box was missing. “Where can it be?” he wondered.',
      'Archie checked his room carefully. He looked under the bed, behind his books and inside his backpack, but the key was nowhere to be seen.',
      'Jessica sniffed by the hallway while Sally waited at the door. Daisy trotted towards the garden as if she had found a clue.',
      'Outside, Archie discovered tiny muddy pawprints leading towards the old tree. He followed them slowly and looked around carefully.',
      'Near the tree was a small wooden box Archie had never noticed before. It had a key-shaped mark on the lid but no handle.',
      'Archie found his golden key beneath a pile of leaves. When he placed it into the box, the lid clicked open.',
      'Inside was not treasure or money. There was a notebook, coloured pencils and a message: “Fill these pages with your brightest ideas.”',
      'Archie began drawing inventions, stories, animals and places he wanted to visit. Kayla joined him and added her own colourful ideas.',
      'Dad smiled and said that a key can open more than a lock. Sometimes curiosity is the key that opens a brand-new idea.',
      'Archie placed the golden key safely back in his adventure box. He had found it again — and discovered that imagination can unlock whole new worlds.'
    ]
  },
  { id: 5, title: 'Archie Builds a Treehouse', emoji: '🌳', pages: [] },
  { id: 6, title: 'Archie Visits London Landmarks', emoji: '🏰', pages: [] },
  { id: 7, title: 'Archie Explores Space', emoji: '🚀', pages: [] },
  { id: 8, title: 'Archie Helps in the Community', emoji: '🤝', pages: [] },
  { id: 9, title: 'Archie and the Dinosaur Trail', emoji: '🦖', pages: [] },
  { id: 10, title: 'A Brighter Tomorrow', emoji: '🌈', pages: [] },
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

  const story = useMemo(() => STORIES.find(s => s.id === storyId) || STORIES[0], [storyId]);

  const openMenu = (target: string) => {
    if (target === 'stories' || target === 'lessons') setScreen(target as Screen);
    else navigate(target);
  };

  const openStory = (id: number) => {
    const selected = STORIES.find(s => s.id === id);
    if (!selected?.pages.length) return;
    setStoryId(id);
    setPage(0);
    setScreen('reader');
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
          {STORIES.map(s => <button key={s.id} onClick={() => openStory(s.id)} className={`min-h-44 rounded-3xl border-4 border-white p-4 shadow-xl ${s.pages.length ? 'bg-gradient-to-b from-blue-500 to-blue-800 text-white' : 'bg-slate-200 text-slate-500'}`}><div className="text-5xl">{s.emoji}</div><div className="mt-2 font-black">{s.id}. {s.title}</div><div className="mt-2 text-xs font-bold">{s.pages.length ? '10 pages • Tap to read' : 'Coming soon'}</div></button>)}
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
          <div className="flex min-h-[24rem] flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-emerald-100 p-7 text-center"><ArchieCharacter size={190}/><p className="mt-5 max-w-xl text-xl font-bold leading-relaxed text-blue-950">{story.pages[page]}</p></div>
          <div className="flex justify-between gap-3 p-4"><button disabled={page===0} onClick={() => setPage(p => Math.max(0,p-1))} className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-40">← Back</button><button onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(story.pages[page]))} className="flex-1 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-blue-950">🔊 Read to me</button><button disabled={page===9} onClick={() => setPage(p => Math.min(9,p+1))} className="flex-1 rounded-2xl bg-green-600 px-5 py-3 font-black text-white disabled:opacity-40">Next →</button></div>
        </article>
      </div>
    </main>
  );

  return <><Helmet><title>Sodafom — Archie Learning</title></Helmet>{screen==='home'&&<HomeScreen/>}{screen==='stories'&&<StoriesScreen/>}{screen==='lessons'&&<LessonsScreen/>}{screen==='reader'&&<ReaderScreen/>}</>;
}
