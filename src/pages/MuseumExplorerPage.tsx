import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';

type Room = { name: string; exhibit: string; fact: string; emoji: string };
type Museum = { title: string; icon: string; intro: string; accent: string; rooms: Room[] };

const MUSEUMS: Record<string, Museum> = {
  dinosaurs: {
    title: 'Dinosaur Hall', icon: '🦖', accent: 'from-emerald-950 via-emerald-800 to-amber-800',
    intro: 'Welcome to Dinosaur Hall. Choose a gallery door and walk inside.',
    rooms: [
      { name: 'Fossil Hall', emoji: '🦴', exhibit: 'The giant fossil wall', fact: 'Fossils are remains or traces of living things from a very long time ago.' },
      { name: 'Dino Giants', emoji: '🦕', exhibit: 'The plant-eater gallery', fact: 'Some enormous dinosaurs ate plants. Their long necks helped them reach leaves high in trees.' },
      { name: 'Dino Lab', emoji: '🔎', exhibit: 'The palaeontologist desk', fact: 'Palaeontologists study bones, rocks and footprints to learn about dinosaurs.' },
    ],
  },
  egypt: {
    title: 'Ancient Egypt', icon: '𓂀', accent: 'from-amber-950 via-yellow-700 to-orange-900',
    intro: 'Step into Ancient Egypt. Every doorway leads to a different part of the story.',
    rooms: [
      { name: 'Mummy Gallery', emoji: '⚱️', exhibit: 'The sarcophagus display', fact: 'Ancient Egyptians wrapped mummies because they believed life continued after death.' },
      { name: 'Pharaoh’s Hall', emoji: '👑', exhibit: 'The golden throne', fact: 'A pharaoh was the ruler of Ancient Egypt.' },
      { name: 'Writing Room', emoji: '📜', exhibit: 'The hieroglyph wall', fact: 'Hieroglyphs were picture symbols used for writing.' },
    ],
  },
  romans: {
    title: 'Roman Britain', icon: '🏛️', accent: 'from-red-950 via-rose-800 to-amber-800',
    intro: 'Welcome to Roman Britain. Walk through the arches to see how Romans lived.',
    rooms: [
      { name: 'Roman Home', emoji: '🏛️', exhibit: 'The mosaic floor', fact: 'Romans built strong homes, roads and public baths.' },
      { name: 'Soldier Station', emoji: '🛡️', exhibit: 'The armour display', fact: 'Roman soldiers wore armour and marched long distances.' },
      { name: 'Archaeology Table', emoji: '⛏️', exhibit: 'The dig tray', fact: 'Archaeologists find clues in the ground to tell us about Roman life.' },
    ],
  },
  vikings: {
    title: 'Viking Museum', icon: '⛵', accent: 'from-slate-950 via-blue-900 to-indigo-800',
    intro: 'Ahoy. Walk through the Viking doors to explore longships, homes and York.',
    rooms: [
      { name: 'Longship Dock', emoji: '⛵', exhibit: 'The carved longship', fact: 'Viking longships were fast and could travel on shallow rivers.' },
      { name: 'Viking Home', emoji: '🔥', exhibit: 'The longhouse fire', fact: 'Viking families often lived in longhouses with a fire in the middle.' },
      { name: 'York Dig', emoji: '🪙', exhibit: 'The archaeology finds', fact: 'Objects found in York teach us about Viking Britain.' },
    ],
  },
  space: {
    title: 'Space & Inventions', icon: '🚀', accent: 'from-indigo-950 via-violet-900 to-sky-800',
    intro: 'Blast off. Choose a space gallery door and explore what is inside.',
    rooms: [
      { name: 'Moon Rock Lab', emoji: '🌑', exhibit: 'The moon-rock case', fact: 'Moon rocks help scientists compare the Moon with Earth.' },
      { name: 'Rocket Hall', emoji: '🚀', exhibit: 'The launch engine', fact: 'Rockets need powerful engines to escape Earth’s gravity.' },
      { name: 'Satellite Room', emoji: '🛰️', exhibit: 'The orbit model', fact: 'Satellites help with maps, weather forecasts and communication.' },
    ],
  },
  nature: {
    title: 'Natural World', icon: '🌍', accent: 'from-teal-950 via-emerald-800 to-cyan-800',
    intro: 'Welcome to the Natural World. Follow the gallery doors to discover life on Earth.',
    rooms: [
      { name: 'Fossil Gallery', emoji: '🦴', exhibit: 'The ancient-life display', fact: 'Fossils give us clues about living things from long ago.' },
      { name: 'Ocean Hall', emoji: '🐋', exhibit: 'The blue whale model', fact: 'Blue whales are the largest animals known to have lived.' },
      { name: 'Nature Lab', emoji: '🦋', exhibit: 'The butterfly case', fact: 'Butterfly wing patterns can help with camouflage and warning colours.' },
    ],
  },
};

function speak(words: string) {
  try {
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(words));
  } catch { /* Navigation and rooms must work without speech. */ }
}

export default function MuseumExplorerPage() {
  const navigate = useNavigate();
  const [museumId, setMuseumId] = useState<string | null>(null);
  const [roomIndex, setRoomIndex] = useState<number | null>(null);
  const museum = museumId ? MUSEUMS[museumId] : null;
  const room = museum && roomIndex !== null ? museum.rooms[roomIndex] : null;

  const openMuseum = (id: string) => {
    setMuseumId(id); setRoomIndex(null); speak(MUSEUMS[id].intro);
  };
  const enterRoom = (index: number) => {
    if (!museum) return;
    setRoomIndex(index);
    const nextRoom = museum.rooms[index];
    speak(`You are walking into ${nextRoom.name}. ${nextRoom.fact}`);
  };
  const back = () => {
    if (room) { setRoomIndex(null); return; }
    if (museum) { setMuseumId(null); return; }
    navigate('/');
  };

  return <main className="min-h-[100svh] bg-[radial-gradient(circle_at_top,#fef3c7_0%,#c2410c_38%,#172554_100%)] px-3 py-4 text-white">
    <Helmet><title>{room ? `${room.name} — Museum Explorer` : museum ? `${museum.title} — Museum Explorer` : 'Museum Explorer — Sodafom'}</title></Helmet>
    <div className="mx-auto max-w-6xl">
      <button type="button" onClick={back} className="rounded-full border-2 border-white/80 bg-blue-700 px-5 py-3 text-lg font-black shadow-lg transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-yellow-300">
        {room ? '← Back to gallery' : museum ? '← Back to museum hall' : '⌂ Home'}
      </button>

      {!museum && <section className="mt-4 overflow-hidden rounded-[2.5rem] border-4 border-amber-200 bg-gradient-to-b from-stone-100 via-amber-50 to-amber-100 text-slate-900 shadow-2xl">
        <header className="border-b-8 border-amber-700 bg-gradient-to-r from-amber-800 via-yellow-600 to-amber-800 px-5 py-6 text-center text-white">
          <div className="flex items-center justify-center gap-4"><ArchieCharacter size={78} /><div><h1 className="text-4xl font-black">Museum Explorer</h1><p className="font-bold">Walk in, explore and learn with Archie</p></div></div>
        </header>
        <div className="grid min-h-[560px] items-end gap-4 bg-[linear-gradient(180deg,rgba(255,255,255,.75),rgba(255,247,237,.35)),repeating-linear-gradient(90deg,rgba(120,53,15,.11)_0_2px,transparent_2px_86px)] p-5 sm:grid-cols-3">
          {Object.entries(MUSEUMS).map(([id, item]) => <button key={id} type="button" onClick={() => openMuseum(id)} className={`group relative min-h-56 overflow-hidden rounded-t-[5rem] border-8 border-amber-950 bg-gradient-to-b ${item.accent} p-5 text-center shadow-xl transition hover:-translate-y-2 hover:brightness-110 focus-visible:ring-4 focus-visible:ring-yellow-300`}>
            <span className="absolute inset-x-4 top-3 h-4 rounded-full bg-white/25" /><span className="block pt-6 text-6xl transition group-hover:scale-110">{item.icon}</span><span className="mt-4 block rounded-xl bg-amber-50 px-3 py-2 text-lg font-black text-slate-950">{item.title}</span><span className="mt-2 block text-sm font-bold text-amber-100">Walk through this door</span>
          </button>)}
        </div>
      </section>}

      {museum && !room && <section className={`mt-4 overflow-hidden rounded-[2.5rem] border-4 border-amber-200 bg-gradient-to-b ${museum.accent} p-5 shadow-2xl`}>
        <div className="mx-auto max-w-3xl rounded-[2rem] border-4 border-amber-100 bg-white/95 p-4 text-center text-slate-950"><div className="flex items-center justify-center gap-3"><ArchieCharacter size={70} /><div><h1 className="text-3xl font-black">{museum.icon} {museum.title}</h1><p className="font-bold">{museum.intro}</p></div></div></div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">{museum.rooms.map((item, index) => <button key={item.name} type="button" onClick={() => enterRoom(index)} className="group min-h-80 rounded-t-[7rem] border-8 border-amber-200 bg-[linear-gradient(90deg,#4a2108_0_12%,#7c3d12_12%_88%,#4a2108_88%)] p-5 shadow-2xl transition hover:-translate-y-2 focus-visible:ring-4 focus-visible:ring-yellow-300"><span className="block text-7xl transition group-hover:scale-110">{item.emoji}</span><span className="mt-8 block rounded-lg bg-amber-50 p-3 text-xl font-black text-slate-950">{item.name}</span><span className="mt-3 block text-sm font-bold text-amber-100">Open this gallery door</span></button>)}</div>
      </section>}

      {room && museum && <section className={`mt-4 overflow-hidden rounded-[2.5rem] border-4 border-amber-200 bg-gradient-to-b ${museum.accent} p-6 shadow-2xl`}>
        <div className="mx-auto max-w-4xl rounded-[2rem] border-4 border-amber-100 bg-white/95 p-5 text-center text-slate-950">
          <div className="text-8xl">{room.emoji}</div><h1 className="mt-3 text-4xl font-black">{room.name}</h1><h2 className="mt-2 text-xl font-bold text-amber-800">{room.exhibit}</h2><p className="mx-auto mt-5 max-w-2xl text-xl font-semibold leading-relaxed">{room.fact}</p>
          <button type="button" onClick={() => speak(room.fact)} className="mt-6 rounded-full bg-blue-700 px-6 py-3 font-black text-white shadow-lg transition hover:scale-105">🔊 Read this to me</button>
        </div>
      </section>}
    </div>
  </main>;
}
