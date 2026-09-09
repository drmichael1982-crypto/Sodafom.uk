import React, { useMemo, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useNavigate } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';

type Screen = 'home' | 'stories' | 'lessons' | 'ask' | 'games' | 'homework' | 'theatre' | 'parents' | 'teacher' | 'shop' | 'stickers' | 'settings';

const MENU: Array<[string,string,Screen,string]> = [
  ["Archie’s Stories",'📚','stories','#178adf'],
  ["Archie’s Lessons",'🎓','lessons','#7a35dc'],
  ['Ask Archie','🤖','ask','#16b96b'],
  ['Game Islands','🏝️','games','#ef3c63'],
  ['Homework Helper','📷','homework','#f47c20'],
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
  ['PE Island','🏃','/ai-teacher'],['Technology Island','🤖','/ai-teacher'],['French Island','🇫🇷','/ai-teacher'],['German Island','🇩🇪','/ai-teacher']
];

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
  const [episode,setEpisode] = useState('Archie and the Secret Shell');
  const [parentPin,setParentPin] = useState('');
  const [parentOpen,setParentOpen] = useState(false);
  const [classCode,setClassCode] = useState('');
  const [stickerTab,setStickerTab] = useState('Geography');
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
      {MENU.map(([label,icon,target,color])=><button key={label} onClick={()=>setScreen(target)} style={{background:color}} className="min-h-36 rounded-[2rem] border-4 border-white p-4 text-white shadow-xl transition hover:-translate-y-1 active:scale-95"><div className="text-5xl">{icon}</div><div className="mt-2 font-black">{label}</div></button>)}
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
    <div className="mx-auto max-w-5xl px-4 pb-8"><div className={`${panel} grid gap-6 p-6 md:grid-cols-2`}><div className="rounded-3xl bg-amber-100 p-4"><div className="mb-3 flex justify-center"><ArchieCharacter size={160}/></div><p className="text-center font-black text-blue-950">Tell Archie your answer. He can read the question aloud and help one step at a time.</p></div><div className="rounded-3xl border-8 border-slate-700 bg-slate-950 p-3 text-center text-white"><div className="mb-2 font-black">Homework Screen</div>{homeworkImage?<img src={homeworkImage} alt="Scanned homework" className="mx-auto max-h-80 rounded-xl bg-white object-contain"/>:<div className="flex min-h-60 items-center justify-center rounded-xl bg-white text-slate-500">Your photographed homework appears here</div>}<label className="mt-3 block cursor-pointer rounded-2xl bg-orange-500 p-3 font-black">📷 Scan Homework<input type="file" accept="image/*" capture="environment" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) setHomeworkImage(URL.createObjectURL(f))}}/></label></div></div></div></main>;

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

  const current = useMemo(()=>({home:<Home/>,stories:<Stories/>,lessons:<Lessons/>,ask:<Ask/>,games:<Games/>,homework:<Homework/>,theatre:<Theatre/>,parents:<Parents/>,teacher:<Teacher/>,shop:<Shop/>,stickers:<Stickers/>,settings:<Settings/>}[screen]),[screen,duration,selectedTeacher,askText,askReply,listening,homeworkImage,episode,parentPin,parentOpen,classCode,stickerTab]);

  return <><Helmet><title>Sodafom — Archie Learning</title></Helmet>{current}</>;
}
