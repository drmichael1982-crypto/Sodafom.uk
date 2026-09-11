import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useNavigate } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';

type Screen = 'home' | 'stories' | 'lessons' | 'ask' | 'games' | 'homework' | 'museum' | 'theatre' | 'parents' | 'teacher' | 'shop' | 'stickers' | 'settings';

const MENU: Array<[string,string,Screen,string]> = [
  ["Archie’s Stories",'📚','stories','#178adf'],
  ["Archie’s Lessons",'🎓','lessons','#7a35dc'],
  ['Ask Archie','🤖','ask','#16b96b'],
  ['Game Islands','🏝️','games','#ef3c63'],
  ['Homework Helper','📷','homework','#f47c20'],
  ['Museum Explorer','🏛️','museum','#0f766e'],
  ['Archie Theatre','🎬','theatre','#efb324'],
  ["Parents’ Evening",'🔒','parents','#ef4e9b'],
  ['Teacher Classroom','🏫','teacher','#16a6a0'],
  ['Sodafom Shop','🛍️','shop','#1778d8'],
  ["Archie’s Sticker Book",'⭐','stickers','#8a42d5'],
  ['Settings','🌬️','settings','#4b8dcc'],
];

const SUBJECTS = [
  ['Maths','➗','/subjects/maths'], ['English','📖','/subjects/reading'], ['Spelling','🔤','/subjects/spelling'],
  ['Science','🔬','/subjects/science'], ['Geography','🌍','/games/geography-quiz'], ['History','🏛️','/ai-teacher'],
  ['PE','⚽','/ai-teacher'], ['Technology','💻','/ai-teacher'], ['French','🇫🇷','/ai-teacher'], ['German','🇩🇪','/ai-teacher'],
];

const STORIES = [
  'Rendlesham Forest Adventure','Archie and the Orford Boat Discovery','Archie Saves the Seal Pup','Archie and the Lost Key',
  'Archie Builds a Treehouse','Archie Visits London','Archie Explores Space','Archie Helps in the Community',
  'Archie and the Dinosaur Trail','A Brighter Tomorrow','Archie and the Nature Trail','Archie’s Science Adventure',
  'Archie Travels Through History','Friends From Different Places','Archie Learns Healthy Living','Archie’s Future Dreams'
];

const GAME_ISLANDS = [
  ['Maths Island','🧮','/games/maths'],['English Island','📚','/games/reading'],['Spelling Island','🔤','/games/spelling'],
  ['Science Island','🧪','/games/science-lab'],['Geography Island','🌍','/games/geography-quiz'],['History Island','🏰','/ai-teacher'],
  ['PE Island','🏃','/ai-teacher'],['Technology Island','🤖','/ai-teacher'],['French Island','🇫🇷','/ai-teacher'],['German Island','🇩🇪','/ai-teacher'],
  ['Colouring Book Island','🎨','/games/colour-book']
];

type Artefact = { name: string; icon: string; fact: string; challenge: string };
type Museum = { title: string; icon: string; colour: string; welcome: string; artefacts: Artefact[] };

// Each item is a real object or find children can investigate, not just a decorative door.
const MUSEUMS: Record<string, Museum> = {
  dinosaurs: { title: 'Dinosaur Museum', icon: '🦖', colour: '#26834a', welcome: 'Roar! Choose an incredible dinosaur find and Archie will tell you its story.', artefacts: [
    { name: 'T. rex tooth', icon: '🦷', fact: 'A Tyrannosaurus rex tooth could be longer than a banana. Its serrated edges helped it slice meat.', challenge: 'Why would a meat-eater need sharp, jagged teeth?' },
    { name: 'Triceratops skull', icon: '🦏', fact: 'Triceratops had three horns and a huge bony frill at the back of its head.', challenge: 'Can you spot the three horns?' },
    { name: 'Giant sauropod footprint', icon: '👣', fact: 'A giant plant-eater left this footprint in soft mud. Over time, the mud hardened into rock.', challenge: 'How did a footprint turn into a fossil?' },
    { name: 'Ammonite fossil', icon: '🐚', fact: 'Ammonites were sea animals with spiral shells. They lived at the same time as dinosaurs.', challenge: 'What shape can you see in the shell?' },
    { name: 'Dinosaur egg', icon: '🥚', fact: 'Some dinosaur eggs were laid in nests. Scientists use their shells to learn about dinosaur families.', challenge: 'What do baby animals need in a safe nest?' },
    { name: 'Meteorite fragment', icon: '☄️', fact: 'This rock came from space. A giant asteroid impact is linked to the end of the non-bird dinosaurs.', challenge: 'What clues could a space rock leave on Earth?' },
  ] },
  british: { title: 'Ancient Egypt Museum', icon: '𓂀', colour: '#a16207', welcome: 'Welcome to Ancient Egypt. Tap an object to uncover a story from thousands of years ago.', artefacts: [
    { name: 'Rosetta Stone', icon: '🪨', fact: 'The Rosetta Stone has the same message written in three scripts. It helped scholars understand hieroglyphs.', challenge: 'Why would three versions of one message be useful?' },
    { name: 'Canopic jar', icon: '🏺', fact: 'Canopic jars were used during mummification. Their lids often showed protective figures.', challenge: 'What details would you draw on a protective jar lid?' },
    { name: 'Pharaoh’s gold mask', icon: '👑', fact: 'Gold was important in Ancient Egypt because it shone like the sun and did not rust.', challenge: 'Why might a pharaoh choose gold for a mask?' },
    { name: 'Papyrus letter', icon: '📜', fact: 'Papyrus was made from a plant that grew beside the Nile. Egyptians used it for writing and drawing.', challenge: 'What message would you write to a friend in hieroglyphs?' },
    { name: 'Cat amulet', icon: '🐈', fact: 'Small amulets were worn or carried for luck and protection. Cats were admired in Ancient Egypt.', challenge: 'What animal would you choose for a lucky charm?' },
    { name: 'Model boat', icon: '⛵', fact: 'Boats carried people and goods along the River Nile, which was vital for life in Egypt.', challenge: 'Name one thing a river can help a country do.' },
  ] },
  romans: { title: 'Roman Britain Museum', icon: '🏺', colour: '#9f1239', welcome: 'Salve! Explore objects Romans left behind in Britain.', artefacts: [
    { name: 'Roman soldier helmet', icon: '⛑️', fact: 'A Roman helmet protected a soldier’s head while still allowing him to see and hear.', challenge: 'What two things must protective clothing do?' },
    { name: 'Mosaic floor tile', icon: '🟦', fact: 'Romans made colourful pictures on floors from tiny pieces of stone, glass or tile called tesserae.', challenge: 'What pattern would you make with tiny squares?' },
    { name: 'Writing tablet', icon: '🪵', fact: 'Some Roman messages were scratched into wax-covered wooden tablets and could be smoothed out to use again.', challenge: 'How is this like a reusable whiteboard?' },
    { name: 'Roman coin', icon: '🪙', fact: 'Roman coins often showed the emperor’s face and travelled across the empire with traders and soldiers.', challenge: 'What picture is on a modern coin?' },
    { name: 'Bath house strigil', icon: '🪥', fact: 'A strigil was a curved tool Romans used to scrape oil and dirt from their skin after exercise.', challenge: 'How do people keep clean after sport today?' },
    { name: 'Clay lamp', icon: '🪔', fact: 'Before electric lights, Romans used small oil lamps. The wick soaked up oil and made a flame.', challenge: 'Why must flames be used carefully?' },
  ] },
  vikings: { title: 'Viking Museum', icon: '⛵', colour: '#1d4ed8', welcome: 'Ahoy! Choose a Viking object from a home, ship or trading town.', artefacts: [
    { name: 'Longship model', icon: '⛵', fact: 'Viking longships were fast and shallow, so they could cross seas and travel up rivers.', challenge: 'Why would a shallow boat be useful on a river?' },
    { name: 'Silver arm ring', icon: '💍', fact: 'Silver arm rings could be worn as jewellery and cut into pieces to use as payment.', challenge: 'How is this different from using coins or a card?' },
    { name: 'Viking comb', icon: '🪮', fact: 'Vikings used combs made from bone or antler. Finds show that looking tidy mattered to them.', challenge: 'What everyday object might archaeologists find from us?' },
    { name: 'Runestone', icon: '🪨', fact: 'Runes were letters used by Vikings. They could be carved into stone, wood or metal.', challenge: 'Try making a secret message from simple lines.' },
    { name: 'Trading scales', icon: '⚖️', fact: 'Traders used small scales and weights to measure silver fairly.', challenge: 'Why is it important that traders measure fairly?' },
    { name: 'Shield boss', icon: '🛡️', fact: 'The round metal bump in the middle of a shield protected the hand holding it.', challenge: 'Where would you put strength in a shield design?' },
  ] },
  space: { title: 'Space & Inventions Museum', icon: '🚀', colour: '#6d28d9', welcome: 'Blast off! These objects show how people explored space and changed everyday life.', artefacts: [
    { name: 'Moon rock', icon: '🌑', fact: 'Moon rocks were brought back by Apollo astronauts. They help scientists compare the Moon with Earth.', challenge: 'What would you want to test in a Moon rock?' },
    { name: 'Apollo spacesuit glove', icon: '🧤', fact: 'A spacesuit protects astronauts from no air, extreme temperatures and tiny space dust.', challenge: 'What does an astronaut need that we do not need on Earth?' },
    { name: 'Satellite model', icon: '🛰️', fact: 'Satellites orbit Earth and help with maps, weather forecasts and communication.', challenge: 'Which satellite job would help your family most?' },
    { name: 'Early telephone', icon: '☎️', fact: 'Early telephones sent sound along wires. Today phones can send voices, pictures and maps.', challenge: 'What could an old telephone not do?' },
    { name: 'Steam engine valve', icon: '⚙️', fact: 'Steam engines helped power trains, factories and ships during the Industrial Revolution.', challenge: 'What do machines need in order to move?' },
    { name: 'First computer memory', icon: '💾', fact: 'Early computers filled rooms, but modern devices can hold far more information in a tiny space.', challenge: 'What would you save in a digital time capsule?' },
  ] },
  nature: { title: 'Natural World Museum', icon: '🌍', colour: '#047857', welcome: 'Let’s investigate amazing objects from the natural world.', artefacts: [
    { name: 'Blue whale jawbone', icon: '🐋', fact: 'Blue whales are the largest animals known to have lived. Their jawbones are enormous.', challenge: 'Why might a huge animal need a huge jaw?' },
    { name: 'Meteorite', icon: '☄️', fact: 'Meteorites are pieces of rock from space that land on Earth.', challenge: 'How can scientists tell a meteorite from an ordinary rock?' },
    { name: 'Coral skeleton', icon: '🪸', fact: 'Coral animals build hard homes that grow into reefs, which provide shelter for many sea creatures.', challenge: 'Why are reefs important underwater neighbourhoods?' },
    { name: 'Mammoth tusk', icon: '🐘', fact: 'Woolly mammoths had long curved tusks. They used them to move snow and find food.', challenge: 'How do animals use different body parts as tools?' },
    { name: 'Butterfly collection', icon: '🦋', fact: 'Butterfly wing patterns can help with camouflage, warning colours or finding a mate.', challenge: 'Design wings that would help a butterfly hide.' },
    { name: 'Giant crystal', icon: '💎', fact: 'Crystals form when atoms arrange themselves in repeating patterns as minerals grow.', challenge: 'Can you find a repeating shape in the crystal?' },
  ] },
};
type MuseumKey = keyof typeof MUSEUMS;

const shell = 'min-h-screen bg-gradient-to-b from-sky-200 via-white to-emerald-100 text-slate-900';
const panel = 'rounded-[2rem] border-4 border-white bg-white/95 shadow-xl';
const button = 'rounded-2xl px-4 py-3 font-black shadow-lg active:scale-95 transition-transform';

export default function SodafomAdventurePage() {
  const navigate = useNavigate();
  const [screen,setScreen] = useState<Screen>('home');
  const [duration,setDuration] = useState(30);
  const [selectedTeacher,setSelectedTeacher] = useState<string | null>(null);
  const [askText,setAskText] = useState('');
  const [askReply,setAskReply] = useState('Local AI ready — ask Archie anything!');
  const [listening,setListening] = useState(false);
  const [homeworkImage,setHomeworkImage] = useState<string | null>(null);
  const [homeworkText,setHomeworkText] = useState('');
  const [homeworkHelp,setHomeworkHelp] = useState('Scan or photograph the homework, then tell Archie which question you would like help with.');
  const [homeworkListening,setHomeworkListening] = useState(false);
  const [homeworkSyncing,setHomeworkSyncing] = useState(true);
  const [homeworkCloudStatus,setHomeworkCloudStatus] = useState('Checking your saved homework…');
  const [episode,setEpisode] = useState('Archie and the Secret Shell');
  const [parentPin,setParentPin] = useState('');
  const [parentOpen,setParentOpen] = useState(false);
  const [classCode,setClassCode] = useState('');
  const [stickerTab,setStickerTab] = useState('Geography');
  const [museumChoice,setMuseumChoice] = useState<MuseumKey | null>(null);
  const [museumQuestion,setMuseumQuestion] = useState('');
  const [museumMessage,setMuseumMessage] = useState('What museum would you like to see today? You can choose a gallery below, type one, or tell Archie.');
  const [museumArtefact,setMuseumArtefact] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const speak = (text:string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB'; u.rate = 0.9; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setAskReply('Voice listening is not supported in this browser. You can still type.'); return; }
    window.speechSynthesis?.cancel();
    const r = new SR();
    r.lang='en-GB'; r.interimResults=false; r.continuous=false;
    r.onresult=(e:any)=>{ const t=e.results?.[0]?.[0]?.transcript || ''; setAskText(t); setAskReply(`Local AI heard: “${t}”`); setListening(false); };
    r.onerror=()=>setListening(false); r.onend=()=>setListening(false);
    recognitionRef.current=r; r.start(); setListening(true);
  };

  useEffect(() => {
    fetch('/api/homework-scan', { credentials: 'include' })
      .then(async response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        if (data.image) {
          setHomeworkImage(data.image);
          setHomeworkCloudStatus('Latest homework is ready on this device.');
        } else setHomeworkCloudStatus('No homework saved yet. Scan a page to show it on your computer.');
      })
      .catch(() => setHomeworkCloudStatus('Sign in to keep a homework page ready on your other devices.'))
      .finally(() => setHomeworkSyncing(false));
  }, []);

  const saveHomeworkScan = (file: File) => {
    if (file.size > 4_000_000) { setHomeworkHelp('Please take a clearer, smaller photo under 4 MB.'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const image = String(reader.result || '');
      setHomeworkImage(image);
      setHomeworkSyncing(true);
      setHomeworkCloudStatus('Saving your homework so it can open on your computer…');
      try {
        const response = await fetch('/api/homework-scan', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image }) });
        if (!response.ok) throw new Error();
        setHomeworkCloudStatus('Saved securely. Open Homework Helper on your computer to see it.');
        setHomeworkHelp('Great scan! Tell me which question you want to work on first.');
        speak('Great scan. Tell me which question you want to work on first.');
      } catch {
        setHomeworkCloudStatus('The photo is visible here, but could not be saved to your account.');
      } finally { setHomeworkSyncing(false); }
    };
    reader.readAsDataURL(file);
  };

  const top = (title:string, subtitle:string) => (
    <div className="mx-auto max-w-6xl px-4 pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={()=>setScreen('home')} className={`${button} bg-blue-700 text-white`}>← Home</button>
        <div className="text-right"><h1 className="text-3xl font-black text-blue-950 sm:text-5xl">{title}</h1><p className="font-bold text-blue-800">{subtitle}</p></div>
      </div>
    </div>
  );

  const Home = () => <main className={shell}>
    <section className="relative overflow-hidden border-b-8 border-white bg-[url('/assets/cartoon/home-landscape-v2.png')] bg-cover bg-center px-4 py-5 text-center shadow-xl">
      <div className="absolute inset-0 bg-white/15" />
      <div className="relative mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border-4 border-white bg-blue-700 px-5 py-2 font-black text-white shadow-xl">🌈 A brighter future for every child 💛</div>
        <h1 className="mt-2 text-5xl font-black sm:text-7xl"><span className="text-yellow-400">🔑</span><span className="text-red-500">S</span><span className="text-yellow-500">o</span><span className="text-blue-600">d</span><span className="text-green-500">a</span><span className="text-red-500">f</span><span className="text-blue-600">o</span><span className="text-purple-600">m</span></h1>
        <p className="font-black text-blue-950">A key to your children’s success</p>
        <div className="mt-3 flex items-end justify-center gap-3"><ArchieCharacter size={190}/><div className="mb-10 max-w-xs rounded-[2rem] border-4 border-blue-700 bg-white p-4 text-lg font-black text-blue-950 shadow-xl">Hello! What would you like to do today?</div></div>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-3 lg:grid-cols-4">
      {MENU.map(([label,icon,target,color])=><button key={label} onClick={()=>setScreen(target)} style={{background:color}} className={`min-h-36 border-4 border-white p-4 text-white shadow-xl transition hover:-translate-y-1 active:scale-95 ${target==='museum'?'aspect-square rounded-full':'rounded-[2rem]'}`}><div className="text-5xl">{icon}</div><div className="mt-2 font-black">{label}</div></button>)}
    </section>
    <section className="mx-auto mb-6 grid max-w-5xl grid-cols-3 gap-3 px-4 text-center font-black text-blue-950"><button onClick={()=>navigate('/hub/progress')} className={`${panel} p-3`}>🏆 Progress</button><button onClick={()=>navigate('/rewards')} className={`${panel} p-3`}>⭐ Rewards</button><button onClick={()=>setScreen('stickers')} className={`${panel} p-3`}>📘 Sticker Book</button></section>
    <footer className="bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 px-4 py-4 text-center font-black text-white">Together, we can give children a brighter future. ❤️</footer>
  </main>;

  const Stories = () => <main className={shell}>{top("Archie’s Stories",'Choose a book or add your own reading book')}
    <div className="mx-auto max-w-6xl px-4 pb-8"><div className={`${panel} bg-gradient-to-b from-amber-100 to-amber-50 p-5`}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">{STORIES.map((s,i)=><button key={s} onClick={()=>{speak(`${s}. Tap again in the reader to begin.`)}} className="rounded-2xl border-4 border-amber-700 bg-gradient-to-b from-blue-500 to-blue-800 p-3 text-white shadow-xl active:scale-95"><div className="text-4xl">📕</div><div className="mt-2 text-sm font-black">{i+1}. {s}</div></button>)}</div>
      <label className="mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-3xl border-4 border-dashed border-purple-500 bg-purple-100 p-5 font-black text-purple-900">📷 Add Your Reading Book<input type="file" accept="image/*" capture="environment" className="hidden"/></label>
    </div></div></main>;

  const Lessons = () => <main className={shell}>{top("Archie’s Lessons",'Choose a subject door and lesson length')}
    <div className="mx-auto max-w-6xl px-4 pb-8"><div className={`${panel} p-5`}><div className="mb-5 flex flex-wrap justify-center gap-2">{[15,20,30,60].map(d=><button key={d} onClick={()=>setDuration(d)} className={`${button} ${duration===d?'bg-blue-700 text-white':'bg-blue-100 text-blue-900'}`}>{d} minutes</button>)}</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">{SUBJECTS.map(([name,icon,route])=><button key={name} onClick={()=>{setSelectedTeacher(name); speak(`${name} teacher says: Come in kids! Your ${duration} minute lesson is ready.`); setTimeout(()=>navigate(route),650)}} className="relative min-h-44 overflow-hidden rounded-t-[2rem] border-8 border-amber-900 bg-gradient-to-b from-amber-400 to-amber-700 p-4 text-white shadow-xl active:scale-95"><div className="text-5xl">🚪</div><div className="mt-2 text-xl font-black">{icon} {name}</div>{selectedTeacher===name&&<div className="absolute inset-x-2 bottom-2 rounded-xl bg-white p-2 text-xs font-black text-blue-900">Teacher: “Come in kids!”</div>}</button>)}</div>
    </div></div></main>;

  const Ask = () => <main className={shell}>{top('Ask Archie','Talk, type, show a photo, ask for ideas or just chat')}
    <div className="mx-auto max-w-4xl px-4 pb-8"><div className={`${panel} overflow-hidden p-6 text-center`}><div className="mx-auto flex justify-center"><ArchieCharacter size={180}/></div><div className="mx-auto mt-2 max-w-xl rounded-3xl bg-blue-50 p-4 font-black text-blue-950">{askReply}<div className="mt-2 text-xs text-emerald-700">Source: Local AI</div></div>
      <div className="mt-4 flex gap-2"><input value={askText} onChange={e=>setAskText(e.target.value)} placeholder="Ask Archie anything…" className="min-w-0 flex-1 rounded-2xl border-2 border-blue-300 px-4 py-3 text-base"/><button onClick={()=>{const q=askText.trim(); setAskReply(q?`Local AI is ready to answer: “${q}”`:'Type or say a question first.'); if(q) speak('I heard your question. Let me help you.')}} className={`${button} bg-blue-700 text-white`}>Ask</button></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{[['🎤','Talk to Archie'],['⌨️','Type a Question'],['📷','Show Archie'],['📚','Explain This'],['💡','Give Me Ideas'],['💬','Let’s Just Chat']].map(([i,l])=><button key={l} onClick={()=>l==='Talk to Archie'?startListening():setAskReply(`${l} mode selected.`)} className={`${button} bg-gradient-to-r from-purple-600 to-blue-600 text-white`}>{i} {l}</button>)}</div>
      <div className="mt-4 text-sm font-bold text-slate-600">{listening?'🎤 Listening to the child…':'Microphone ready. Archie’s own speech is cancelled before listening.'}</div>
    </div></div></main>;

  const Games = () => <main className={shell}>{top('Sodafom Game Islands','Choose an island to open that subject’s games')}
    <div className="mx-auto max-w-6xl px-4 pb-8"><div className="grid grid-cols-2 gap-4 sm:grid-cols-5">{GAME_ISLANDS.map(([name,icon,route])=><button key={name} onClick={()=>{speak(`${name}. Let’s play!`); navigate(route)}} className="min-h-44 rounded-[45%] border-8 border-white bg-gradient-to-b from-emerald-400 to-emerald-700 p-4 text-white shadow-xl transition hover:-translate-y-1 active:scale-95"><div className="animate-bounce text-5xl">{icon}</div><div className="mt-2 font-black">{name}</div></button>)}</div></div></main>;

  const Homework = () => <main className={shell}>{top('Homework Helper','Scan homework, put it on the desk and work through it with Archie')}
    <div className="mx-auto max-w-5xl px-4 pb-8"><div className={`${panel} grid gap-5 p-4 sm:p-6 md:grid-cols-[.85fr_1.15fr]`}><section className="rounded-3xl bg-amber-100 p-4"><div className="mb-2 flex justify-center"><ArchieCharacter size={150}/></div><div className="rounded-2xl bg-white p-4 text-center font-black text-blue-950 shadow">{homeworkHelp}</div><p className="mt-3 text-center text-sm font-bold text-amber-950">Archie helps one step at a time — he does not just give the answer.</p></section><section className="rounded-3xl border-8 border-slate-700 bg-slate-950 p-3 text-center text-white"><div className="mb-2 flex items-center justify-between gap-2 px-1 font-black"><span>Homework Desk</span><span className="text-right text-xs text-cyan-200">{homeworkSyncing?'⏳ ':''}{homeworkCloudStatus}</span></div>{homeworkImage?<img src={homeworkImage} alt="Scanned homework" className="mx-auto max-h-72 w-full rounded-xl bg-white object-contain"/>:<div className="flex min-h-52 items-center justify-center rounded-xl bg-white p-5 text-slate-500">📷 Your photographed homework appears here</div>}<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"><label className="cursor-pointer rounded-2xl bg-orange-500 p-3 text-sm font-black shadow active:scale-95">📷 Scan Homework<input type="file" accept="image/*" capture="environment" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) saveHomeworkScan(f)}}/></label><button onClick={()=>{const text=homeworkText.trim()||'the homework question'; const message=`Let’s read ${text} slowly. What words, numbers or pictures can you spot?`;setHomeworkHelp(message);speak(message)}} className="rounded-2xl bg-blue-600 p-3 text-sm font-black shadow active:scale-95">🔊 Read aloud</button><button onClick={()=>{const message='Let’s break it into small steps. First, underline what the question is asking. Then tell me one idea you already know.';setHomeworkHelp(message);speak(message)}} className="rounded-2xl bg-purple-600 p-3 text-sm font-black shadow active:scale-95">💡 Explain it</button><button onClick={()=>{const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;if(!SR){setHomeworkHelp('Your browser cannot use the microphone here. You can type your answer below.');return;}const r=new SR();r.lang='en-GB';r.interimResults=false;r.continuous=false;r.onresult=(e:any)=>{const heard=e.results?.[0]?.[0]?.transcript||'';setHomeworkText(heard);setHomeworkHelp(`I heard: “${heard}”. Press Explain it or Read aloud, or tell Archie more.`);setHomeworkListening(false)};r.onerror=()=>{setHomeworkHelp('I could not hear that. Please try the microphone again or type your answer.');setHomeworkListening(false)};r.onend=()=>setHomeworkListening(false);r.start();setHomeworkListening(true)}} className="rounded-2xl bg-emerald-600 p-3 text-sm font-black shadow active:scale-95">🎤 {homeworkListening?'Listening…':'Say answer'}</button><button onClick={()=>{const message='Hint: do not rush. Circle the important words, choose the first small step, and check your work at the end.';setHomeworkHelp(message);speak(message)}} className="rounded-2xl bg-amber-500 p-3 text-sm font-black shadow active:scale-95">🧩 Give a hint</button><button onClick={async ()=>{setHomeworkImage(null);setHomeworkText('');setHomeworkHelp('Homework desk cleared. Scan a new page when you are ready.');setHomeworkCloudStatus('Removing saved homework…');window.speechSynthesis?.cancel();try { await fetch('/api/homework-scan',{method:'DELETE',credentials:'include'}); setHomeworkCloudStatus('Homework removed from your account.'); } catch { setHomeworkCloudStatus('Homework cleared from this screen.'); }}} className="rounded-2xl bg-rose-600 p-3 text-sm font-black shadow active:scale-95">🗑️ Clear desk</button></div><label className="mt-3 block text-left text-xs font-black text-slate-200">Type the question or your answer<textarea value={homeworkText} onChange={e=>setHomeworkText(e.target.value)} placeholder="For example: What is 24 ÷ 6?" className="mt-1 min-h-20 w-full rounded-xl border-2 border-cyan-300 bg-white p-3 text-base font-semibold text-slate-900"/></label></section></div></div></main>;

  const openMuseum = (key:MuseumKey) => {
    const chosen = MUSEUMS[key];
    setMuseumChoice(key); setMuseumArtefact(null); setMuseumQuestion(''); setMuseumMessage(chosen.welcome); speak(chosen.welcome);
  };
  const chooseMuseumFromWords = () => {
    const words = museumQuestion.toLowerCase();
    const key: MuseumKey = /dino|t.rex|fossil|ammonite/.test(words) ? 'dinosaurs' : /egypt|british|mumm|pharaoh|rosetta/.test(words) ? 'british' : /roman/.test(words) ? 'romans' : /viking|york|longship|rune/.test(words) ? 'vikings' : /space|moon|rocket|invent/.test(words) ? 'space' : /nature|whale|coral|mammoth/.test(words) ? 'nature' : 'dinosaurs';
    openMuseum(key);
  };
  const Museum = () => {
    const chosen = museumChoice ? MUSEUMS[museumChoice] : null;
    return <main className="min-h-screen bg-gradient-to-b from-sky-200 via-cyan-50 to-amber-100 text-slate-900">{top('Museum Explorer','Walk through a virtual museum with Archie')}
      {!chosen ? <div className="mx-auto max-w-5xl px-4 pb-8"><div className="overflow-hidden rounded-[2.5rem] border-4 border-white bg-[#fffdf4] p-3 shadow-2xl sm:p-5">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-900 via-teal-700 to-cyan-500 px-5 py-5 text-white shadow-xl"><div className="absolute -right-8 -top-8 text-[9rem] opacity-15">🏛️</div><div className="relative grid items-center gap-3 sm:grid-cols-[1fr_130px]"><div><div className="inline-block border-y-2 border-yellow-300 py-1 text-xs font-black tracking-[0.24em] text-yellow-200">THE MUSEUM GAZETTE • ISSUE 01</div><h2 className="mt-2 text-3xl font-black leading-none sm:text-5xl">Archie’s Museum Building</h2><p className="mt-2 max-w-xl font-bold text-cyan-50">Today’s big adventure: choose a gallery door, discover a real object and become an official Museum Explorer.</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-white/20 px-3 py-1">6 galleries</span><span className="rounded-full bg-white/20 px-3 py-1">36 discoveries</span><span className="rounded-full bg-yellow-300 px-3 py-1 text-teal-950">Free to explore</span></div></div><div className="mx-auto hidden sm:block"><ArchieCharacter size={125}/></div></div></section>
        <section className="mt-4 grid gap-4 md:grid-cols-[1.2fr_.8fr]"><div className="rounded-[2rem] border-4 border-amber-700 bg-gradient-to-br from-amber-100 to-orange-100 p-4 shadow-lg"><div className="flex items-center justify-between gap-2"><div><div className="text-xs font-black tracking-wider text-amber-800">FEATURED EXHIBITION</div><h3 className="text-2xl font-black text-amber-950">🦖 Dinosaurs: giant clues from the past</h3></div><button onClick={()=>openMuseum('dinosaurs')} className={`${button} shrink-0 bg-amber-700 text-sm text-white`}>Explore</button></div><p className="mt-2 font-bold text-amber-950">How can a tooth, footprint and egg tell us what dinosaurs ate, where they walked and how they cared for their young?</p></div><div className="rounded-[2rem] border-4 border-teal-700 bg-white p-4 shadow-lg"><div className="text-xs font-black tracking-wider text-teal-700">ASK ARCHIE</div><p className="mt-1 font-black text-blue-950">{museumMessage}</p><div className="mt-3 flex gap-2"><input value={museumQuestion} onChange={e=>setMuseumQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&chooseMuseumFromWords()} placeholder="Try: Viking museum" className="min-w-0 flex-1 rounded-xl border-2 border-teal-400 px-3 py-2 text-sm font-bold"/><button aria-label="Open requested museum" onClick={chooseMuseumFromWords} className={`${button} bg-teal-700 px-3 text-white`}>Go</button></div></div></section>
        <section className="mt-5 rounded-[2.5rem] border-8 border-amber-700 bg-gradient-to-b from-amber-50 via-white to-sky-100 p-4 shadow-2xl sm:p-5"><div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-amber-300 pb-3"><div><div className="text-xs font-black tracking-[0.18em] text-amber-800">EXPLORE THE BUILDING</div><h3 className="text-2xl font-black text-amber-950">Choose a colourful gallery door</h3></div><div className="rounded-full bg-amber-200 px-3 py-1 text-xs font-black text-amber-950">Tap a door to enter</div></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{(Object.entries(MUSEUMS) as [MuseumKey, typeof MUSEUMS[MuseumKey]][]).map(([key,museum],index)=><button key={key} onClick={()=>openMuseum(key)} style={{background:`linear-gradient(145deg, ${museum.colour}, #0f172a)`}} className="group min-h-48 rounded-t-[2.5rem] rounded-b-2xl border-8 border-white p-3 text-white shadow-xl transition hover:-translate-y-1 active:scale-95"><div className="flex items-center justify-between text-xs font-black text-white/75"><span>GALLERY {String(index+1).padStart(2,'0')}</span><span>→</span></div><div className="mt-2 text-5xl">{museum.icon}</div><div className="mt-2 text-lg font-black leading-tight">{museum.title}</div><div className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-black group-hover:bg-white/30">Open gallery</div></button>)}</div></section>
        <section className="mt-5 rounded-[2rem] border-4 border-blue-700 bg-blue-950 p-5 text-white shadow-xl"><div className="text-xs font-black tracking-wider text-cyan-200">EXPLORER’S TIP</div><div className="mt-1 text-xl font-black">Look closely. Ask why. Tell Archie what you notice.</div><div className="mt-2 text-sm font-bold text-cyan-100">Every object has a story waiting to be uncovered.</div></section>
      </div></div> : <div className="mx-auto max-w-6xl px-4 pb-8"><div className="overflow-hidden rounded-[2rem] border-8 border-white bg-slate-900 shadow-2xl">
        <div className="relative min-h-[520px] overflow-hidden bg-[radial-gradient(circle_at_50%_10%,#fef3c7_0%,#a16207_2%,transparent_22%),linear-gradient(180deg,#0f766e_0%,#164e63_42%,#78350f_43%,#b45309_100%)] p-5 text-white">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent"/><div className="relative flex flex-wrap items-center justify-between gap-3"><button onClick={()=>{setMuseumChoice(null);setMuseumArtefact(null)}} className={`${button} bg-white text-teal-900`}>← Choose a museum</button><div className="rounded-full border-2 border-white bg-black/30 px-4 py-2 font-black">{chosen.icon} {chosen.title}</div></div>
          <div className="relative mx-auto mt-7 max-w-3xl rounded-[2rem] border-4 border-white bg-white p-4 text-center font-black text-blue-950 shadow-xl"><div className="flex items-center justify-center gap-3"><ArchieCharacter size={72}/><p>{museumMessage}</p></div>{museumArtefact !== null && <div className="mt-3 rounded-2xl bg-yellow-100 p-3 text-sm text-amber-950">🔍 Archie asks: {chosen.artefacts[museumArtefact].challenge}</div>}</div>
          <div className="relative mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3">{chosen.artefacts.map((artefact,index)=><button key={artefact.name} onClick={()=>{setMuseumArtefact(index);setMuseumMessage(artefact.fact);speak(`${artefact.name}. ${artefact.fact} ${artefact.challenge}`)}} className={`min-h-48 rounded-[2rem] border-8 p-4 shadow-2xl transition hover:-translate-y-2 active:scale-95 ${museumArtefact===index?'border-yellow-300 bg-amber-500':'border-amber-200 bg-gradient-to-b from-amber-100 to-amber-700'}`}><div className="text-6xl drop-shadow">{artefact.icon}</div><div className="mt-3 rounded-xl bg-white/90 p-2 text-sm font-black text-slate-900">{artefact.name}</div><div className="mt-2 text-xs font-bold">Tap to investigate</div></button>)}</div>
          <div className="relative mx-auto mt-8 max-w-2xl rounded-2xl bg-black/30 p-3 text-center text-sm font-bold">Choose every artefact to fill Archie’s Museum Explorer collection. Each one includes a spoken fact and a thinking question.</div>
        </div></div></div>}
    </main>;
  };

  const Theatre = () => <main className="min-h-screen bg-gradient-to-b from-red-900 via-purple-950 to-slate-950 text-white">{top('Archie Theatre','Choose a cartoon episode')}
    <div className="mx-auto max-w-5xl px-4 pb-8"><div className="rounded-[2rem] border-8 border-yellow-400 bg-black p-6 shadow-2xl"><div className="flex min-h-72 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-purple-700 text-center"><div><div className="text-7xl">🎬</div><h2 className="mt-3 text-3xl font-black">{episode}</h2><button onClick={()=>speak(`Now playing ${episode}`)} className={`${button} mt-4 bg-yellow-400 text-slate-950`}>▶ Play</button></div></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{['Archie and the Secret Shell','The Great Kindness Quest','Archie Explores Space','The Lost Puppy Adventure'].map(e=><button key={e} onClick={()=>setEpisode(e)} className="rounded-2xl bg-red-700 p-4 font-black shadow">📺 {e}</button>)}</div></div></div></main>;

  const Parents = () => <main className={shell}>{top("Parents’ Evening",'Secure parent area with subject-by-subject progress')}
    <div className="mx-auto max-w-5xl px-4 pb-8">{!parentOpen?<div className={`${panel} mx-auto max-w-md p-6 text-center`}><div className="text-7xl">🔒🚪</div><h2 className="mt-2 text-2xl font-black text-blue-950">Parents’ Evening Door</h2><input value={parentPin} onChange={e=>setParentPin(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" placeholder="4-digit Parent PIN" className="mt-4 w-full rounded-2xl border-2 border-blue-300 p-3 text-center text-lg"/><button onClick={()=>parentPin.length===4?setParentOpen(true):undefined} className={`${button} mt-3 w-full bg-blue-700 text-white`}>Unlock</button><p className="mt-2 text-xs text-slate-500">Use the parent account to set or reset the PIN.</p></div>:<div className={`${panel} p-6`}><div className="mb-5 flex items-center justify-center gap-4"><span className="text-5xl">👩‍🦳👨‍🦱</span><div className="rounded-2xl bg-blue-100 p-3 font-black text-blue-950">“Hello — how is my child getting on?”</div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{SUBJECTS.map(([name,icon])=><button key={name} onClick={()=>speak(`${name} teacher says: Hello. Let’s look at your child’s real ${name} progress.`)} className="rounded-3xl border-4 border-white bg-gradient-to-b from-indigo-500 to-indigo-800 p-4 text-white shadow-xl"><div className="text-4xl">{icon}</div><div className="font-black">{name} Teacher</div></button>)}</div><button onClick={()=>navigate('/parent-dashboard')} className={`${button} mt-5 w-full bg-emerald-600 text-white`}>Open Full Parent Progress Dashboard</button></div>}</div></main>;

  const Teacher = () => <main className={shell}>{top('Teacher Classroom','Teacher Mode + Student Mode classroom session')}
    <div className="mx-auto max-w-6xl px-4 pb-8"><div className={`${panel} p-6`}><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><div className="text-sm font-bold text-slate-500">Teacher desk</div><div className="text-2xl font-black text-blue-950">Mrs Taylor</div></div><div className="flex gap-2"><input value={classCode} onChange={e=>setClassCode(e.target.value.toUpperCase())} placeholder="Class code" className="rounded-2xl border-2 border-blue-300 p-3"/><button onClick={()=>setClassCode(classCode || 'BLUE-27')} className={`${button} bg-blue-700 text-white`}>Start Class</button></div></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{['Ben','Michael','Fiona','Zara','Leo','Maya','Noah','Amelia'].map((n,i)=><div key={n} className="rounded-3xl border-4 border-amber-600 bg-amber-100 p-4 text-center shadow-lg"><div className="text-4xl">🪑</div><div className="mt-2 text-xl font-black text-blue-950">{n}</div><div className={`mx-auto mt-2 h-4 w-4 rounded-full ${i%3===0?'bg-amber-400':'bg-emerald-500'}`}/></div>)}</div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{['▶ Start Lesson','⏸ Pause','➡ Next Question','✋ Hands Up','📈 Progress'].map(a=><button key={a} className={`${button} bg-indigo-600 text-white`}>{a}</button>)}</div><button onClick={()=>navigate('/teacher-hub')} className={`${button} mt-4 w-full bg-emerald-600 text-white`}>Open Teacher Dashboard</button></div></div></main>;

  const Shop = () => <main className={shell}>{top('Sodafom Shop','Parent-controlled AI vouchers and learning extras')}
    <div className="mx-auto max-w-5xl px-4 pb-8"><div className={`${panel} p-6`}><div className="mb-5 text-center"><div className="text-7xl">🏪</div><h2 className="text-2xl font-black text-blue-950">Welcome to the Sodafom Shop</h2><p className="font-bold text-slate-600">🔒 Parent PIN required for purchases</p></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{['£2 AI Credit','£5 AI Credit','£10 AI Credit','Yearly Pack'].map(v=><button key={v} onClick={()=>navigate('/pricing')} className="rounded-3xl border-4 border-yellow-500 bg-gradient-to-b from-yellow-200 to-orange-300 p-5 text-blue-950 shadow-xl"><div className="text-5xl">🎟️</div><div className="mt-2 font-black">{v}</div></button>)}</div><p className="mt-5 text-center text-sm font-bold text-emerald-700">Local AI remains the first option; paid credit is only for external AI use.</p></div></div></main>;

  const Stickers = () => <main className={shell}>{top("Archie’s Sticker Book",'Tap a subject, turn pages and press stickers for sounds')}
    <div className="mx-auto max-w-6xl px-4 pb-8"><div className={`${panel} p-6`}><div className="flex flex-wrap justify-center gap-2">{['Maths','English','Science','Geography','History','Adventures','Animals','Special'].map(t=><button key={t} onClick={()=>setStickerTab(t)} className={`${button} ${stickerTab===t?'bg-purple-700 text-white':'bg-purple-100 text-purple-900'}`}>{t}</button>)}</div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4"><div className="col-span-2 rounded-[2rem] bg-gradient-to-br from-amber-100 to-yellow-50 p-6 text-center sm:col-span-4"><div className="text-2xl font-black text-blue-950">{stickerTab} Stickers</div><div className="mt-5 flex flex-wrap justify-center gap-6">{['🐘','🏆','🌍','⭐','🚀','🦁','🏰','🔬'].map((s,i)=><button key={i} onClick={()=>{const noises=['Trumpet!','Ta-da!','Whoosh!','Sparkle!','Blast off!','Roar!','Castle bell!','Science pop!']; speak(noises[i])}} className="text-6xl transition hover:scale-110 active:scale-90">{s}</button>)}</div></div></div><div className="mt-5 flex justify-between"><button className={`${button} bg-blue-700 text-white`}>← Previous Page</button><button className={`${button} bg-blue-700 text-white`}>Next Page →</button></div></div></div></main>;

  const Settings = () => <main className="min-h-screen bg-gradient-to-b from-amber-100 via-white to-emerald-100 text-slate-900">{top('Sodafom Settings','The windmill workshop')}
    <div className="mx-auto max-w-5xl px-4 pb-8"><div className={`${panel} overflow-hidden bg-gradient-to-b from-amber-100 to-amber-50 p-6`}><div className="text-center"><div className="animate-spin text-8xl [animation-duration:12s]">🌬️</div><h2 className="mt-2 text-3xl font-black text-amber-900">Windmill Settings</h2></div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{[['🔊','Audio & Voice'],['👤','Child Profile'],['🖥️','Display'],['🌐','Language'],['🛡️','Privacy & Safety'],['📚','Learning Preferences'],['👨‍👩‍👧','Account'],['🔒','Admin Access']].map(([icon,label],i)=><button key={label} onClick={()=>label==='Admin Access'?navigate('/admin-panel'):label==='Account'?navigate('/hub/subscription'):undefined} className={`relative aspect-square rounded-full border-8 border-amber-700 bg-amber-300 p-4 font-black text-amber-950 shadow-xl transition hover:rotate-6 active:scale-95 ${i%2?'animate-[spin_18s_linear_infinite_reverse]':''}`}><div className="text-4xl">{icon}</div><div className="mt-2 text-sm">{label}</div></button>)}</div><div className="mt-5 rounded-3xl bg-white p-4 text-center font-bold text-blue-950">Subscription management and cancellation are inside Account. Admin is separately protected.</div></div></div></main>;

  const current = useMemo(()=>({home:<Home/>,stories:<Stories/>,lessons:<Lessons/>,ask:<Ask/>,games:<Games/>,homework:<Homework/>,museum:<Museum/>,theatre:<Theatre/>,parents:<Parents/>,teacher:<Teacher/>,shop:<Shop/>,stickers:<Stickers/>,settings:<Settings/>}[screen]),[screen,duration,selectedTeacher,askText,askReply,listening,homeworkImage,homeworkText,homeworkHelp,homeworkListening,homeworkSyncing,homeworkCloudStatus,episode,parentPin,parentOpen,classCode,stickerTab,museumChoice,museumQuestion,museumMessage,museumArtefact]);

  return <><Helmet><title>Sodafom — Archie Learning</title></Helmet>{current}</>;
}
