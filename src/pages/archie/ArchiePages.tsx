import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { Home, Volume2, VolumeX, ArrowLeft, ArrowRight, Search, BookOpen, Pause, Play, Calculator, SpellCheck, FlaskConical, Globe, NotebookPen, Film, Star, Trophy, Users, KeyRound, Castle, Rocket, Rainbow, Waves, Flower2, Milestone, Gamepad2, Camera } from 'lucide-react';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useProgression } from '@/contexts/ProgressionContext';
import { useVoice } from '@/lib/voice-context';
import { API_PREFIX } from '@/lib/config';
import { BOOKS, SPELLING_WORDS } from '@/lib/archie/books';
import { useArchieData, updateSavedData, readGameStars } from '@/lib/archie/storage';
import catalog from '@/lib/archie/game-catalog.json';
import { EPISODES } from '@/pages/CartoonTheatrePage';
import './archie.css';

export const ARCHIE_PATHS = ['/', '/world', '/games', '/lesson', '/library', '/reader', '/homework', '/stickers', '/rewards', '/progress', '/parents', '/settings', '/cartoons'];
export function isArchiePage(path: string) { return ARCHIE_PATHS.includes(path) || path.startsWith('/reader/'); }
function useLearning(title: string, subject = 'Learning', question?: string) {
  const { setGameContext, clearGameContext } = useArchieContext();
  useEffect(() => { setGameContext(title, subject, question); return clearGameContext; }, [title, subject, question, setGameContext, clearGameContext]);
}
function ArtIcon({ symbol }: { symbol: string }) {
  const icons: Record<string, typeof Star> = { '🧮':Calculator, '📖':BookOpen, '🔤':SpellCheck, '🔬':FlaskConical, '🌍':Globe, '🖍️':NotebookPen, '📚':BookOpen, '📝':NotebookPen, '🎬':Film, '🌟':Star, '🏆':Trophy, '👪':Users, '🔑':KeyRound, '🌊':Waves, '🌻':Flower2, '🌉':Milestone, '📘':BookOpen, '🏰':Castle, '🚀':Rocket, '🌈':Rainbow };
  const Icon=icons[symbol]||Gamepad2;
  return <span className="a-emoji" aria-hidden="true"><Icon size={58} strokeWidth={2.5}/></span>;
}
const WORLD_IMAGES: Record<string,string> = {Maths:'maths',Reading:'reading',Spelling:'spelling',Science:'science',Geography:'geography','My lesson':'spelling',Library:'reading',Homework:'crossword'};
function SoundButton() {
  const { settings, setSettings } = useArchieData();
  const { stop } = useVoice();
  return <button className="a-button a-icon" aria-label={settings.sound ? 'Turn sound off' : 'Turn sound on'} aria-pressed={settings.sound} onClick={() => { setSettings({ sound: !settings.sound }); stop(); }}>{settings.sound ? <Volume2/> : <VolumeX/>}</button>;
}
function Page({ title, intro, children, back = '/world' }: { title: string; intro?: string; children: ReactNode; back?: string }) {
  const { settings } = useArchieData();
  return <main className={`archie-app ${settings.largeText ? 'archie-large' : ''}`}><div className="a-page">
    <header className="a-top"><Link className="a-button a-icon" to={back} aria-label={back === '/' ? 'Home' : 'Back to my world'}>{back === '/' ? <Home/> : <ArrowLeft/>}</Link><Link className="a-logo" to="/">SODAFOM<small>Learn • Play • Grow</small></Link><SoundButton/></header>
    <section className="a-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(5,37,102,.96),rgba(9,65,147,.78) 58%,rgba(9,65,147,.2)),url(/assets/cartoon/worlds/${/library|story|key|garden|pup|reading/i.test(title)?'reading':/spell|word/i.test(title)?'spelling':/theatre/i.test(title)?'geography':'maths'}.png)` }}>
      <div className="a-hero-copy"><span className="a-eyebrow">A little adventure with Archie</span><h1>{title}</h1>{intro && <p className="a-intro">{intro}</p>}</div>
      <img className="a-hero-archie" src="/assets/images/archie-character-v2.png" width="1024" height="1536" alt="Archie smiles and holds his golden heart key."/>
    </section>{children}
    <nav className="a-bottom" aria-label="Main navigation"><Link to="/">Home</Link><Link to="/world">My world</Link><Link to="/games">Games</Link><Link to="/lesson">Lesson</Link></nav>
  </div></main>;
}
function ArtButton({ label, x, y, w, h, onClick, to }: { label: string; x: number; y: number; w: number; h: number; onClick?: () => void; to?: string }) {
  const props = { className: 'art-hit', style: { left: `${x/841*100}%`, top: `${y/1870*100}%`, width: `${w/841*100}%`, height: `${h/1870*100}%` }, 'aria-label': label };
  return to ? <Link {...props} to={to}><span className="sr-only">{label}</span></Link> : <button {...props} onClick={onClick}><span className="sr-only">{label}</span></button>;
}
function useCompactLandscape() {
  const [compact, setCompact] = useState(() => window.matchMedia('(min-width:550px) and (max-height:500px)').matches);
  useEffect(() => { const query=window.matchMedia('(min-width:550px) and (max-height:500px)'); const update=()=>setCompact(query.matches); query.addEventListener('change',update); return ()=>query.removeEventListener('change',update); },[]);
  return compact;
}
export function ArchieHome() {
  useLearning('Home');
  const { openArchie } = useArchieContext();
  const { settings, setSettings } = useArchieData();
  const { stop } = useVoice();
  const compact = useCompactLandscape();
  if(compact) return <main className="compact-home"><img src="/assets/archie-approved/home.png" alt="Archie with blond hair and green eyes beside a magical castle."/><section><h1>SODAFOM <small>Learn · Play · Grow</small></h1><nav aria-label="Home activities">{[['Explore my world','/world'],['Games','/games'],['Lessons','/lesson'],['Parents','/parents'],['Rewards','/rewards'],['Sticker book','/stickers'],['Cartoons','/cartoons'],['Progress','/progress'],['Settings','/settings']].map(([label,to])=><Link className="a-button" to={to} key={to}>{label}</Link>)}<button className="a-button" onClick={()=>openArchie()}>Ask Archie</button><SoundButton/></nav></section></main>;
  return <main className="art-stage" aria-label="Sodafom home"><h1 className="sr-only">Sodafom — Learn, Play, Grow</h1><div className="approved-art">
    <img src="/assets/archie-approved/home.png" width="841" height="1870" alt="Archie with blond hair and green eyes, holding a heart-shaped key beside a magical castle."/>
    <ArtButton label="Settings" x={22} y={74} w={112} h={112} to="/settings"/>
    <ArtButton label={settings.sound ? 'Turn sound off' : 'Turn sound on'} x={710} y={76} w={116} h={111} onClick={() => { setSettings({sound:!settings.sound}); stop(); }}/>
    {!settings.sound && <span className="home-muted" aria-hidden="true">🔇</span>}
    <ArtButton label="Explore my world" x={29} y={944} w={788} h={179} to="/world"/>
    <ArtButton label="Games" x={25} y={1133} w={393} h={297} to="/games"/>
    <ArtButton label="Lessons" x={429} y={1133} w={389} h={297} to="/lesson"/>
    <ArtButton label="Ask Archie" x={22} y={1444} w={797} h={188} onClick={() => openArchie()}/>
    {[['Parents','/parents'],['Rewards','/rewards'],['Sticker book','/stickers'],['Cartoons','/cartoons'],['Progress','/progress']].map(([label,to],i) => <ArtButton key={to} label={label} to={to} x={20+i*163} y={1643} w={154} h={181}/>)}
  </div></main>;
}
const WORLDS = [
  ['Maths','🧮','/games?subject=maths'], ['Reading','📖','/games?subject=reading'], ['Spelling','🔤','/games?subject=spelling'],
  ['Science','🔬','/games?subject=science'], ['Geography','🌍','/games/geography-quiz'], ['My lesson','🖍️','/lesson'],
  ['Library','📚','/library'], ['Homework','📝','/homework'], ['Cartoons','🎬','/cartoons'], ['Sticker book','🌟','/stickers'],
  ['Rewards','🏆','/rewards'], ['Parents','👪','/parents'],
];
export function ArchieWorld() {
  useLearning('My world');
  return <Page title="Explore my world" intro="Where shall we go today?" back="/"><div className="a-grid">{WORLDS.map(([label,emoji,to],i) => <Link key={to} className={`a-card colour-${i%4}`} to={to}>{WORLD_IMAGES[label]?<img className="a-world-image" src={`/assets/cartoon/worlds/${WORLD_IMAGES[label]}.png`} alt=""/>:<ArtIcon symbol={emoji}/>}<h2>{label}</h2><span>Explore →</span></Link>)}</div></Page>;
}
export function ArchieGames() {
  useLearning('Choose a game');
  const [params,setParams] = useSearchParams();
  const [query,setQuery] = useState('');
  const subject = params.get('subject') || 'all';
  const filtered = catalog.filter(g => (subject === 'all' || g.subject === subject) && `${g.title} ${g.description}`.toLowerCase().includes(query.toLowerCase()));
  return <Page title="Choose a game" intro="Your favourite games, all in one place.">
    <label className="a-search"><Search/><input type="search" aria-label="Search games" placeholder="Find a game…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <div className="a-tabs" aria-label="Game subjects">{['all','maths','spelling','reading','science'].map(s=><button key={s} className="a-button" aria-pressed={subject===s} onClick={()=>setParams(s==='all'?{}:{subject:s})}>{s==='all'?'All games':s[0].toUpperCase()+s.slice(1)}</button>)}</div>
    <p role="status">{filtered.length} games to explore</p>
    <div className="a-grid">{filtered.map((g,i)=><Link key={g.id} to={g.route} className={`a-card colour-${i%4}`} data-game-link><img className="a-game-art" loading="lazy" src={`/assets/cartoon/worlds/${['maths','spelling','reading','science'].includes(g.subject)?g.subject:'geography'}.png`} alt=""/><h2>{g.title}</h2><p>{g.description}</p><small>Ages {g.ageGroups.join(', ')}</small><span className="a-play">Play game →</span></Link>)}</div>
    {!filtered.length && <div className="a-panel"><p>No games match that search.</p><button className="a-button" onClick={()=>{setQuery('');setParams({});}}>Show all games</button></div>}
  </Page>;
}
export function ArchieLesson() {
  const { settings, complete } = useArchieData();
  const [year] = useState(settings.year);
  const words = SPELLING_WORDS[year];
  const [step,setStep] = useState(0);
  const [attempt,setAttempt] = useState('');
  const [trying,setTrying] = useState(false);
  const [correct,setCorrect] = useState(false);
  const [feedback,setFeedback] = useState('');
  const [paused,setPaused] = useState(false);
  const [remaining,setRemaining] = useState(30*60);
  const [finished,setFinished] = useState(false);
  const [runId] = useState(()=>`lesson-${crypto.randomUUID()}`);
  const { openArchie } = useArchieContext();
  const { speak,stop } = useVoice();
  const input = useRef<HTMLInputElement>(null);
  const compact = useCompactLandscape();
  const word = words[step];
  const hideWord = trying && !correct && !feedback.startsWith('Good try.');
  useLearning('My spelling lesson', 'Spelling', `Spell the word ${word}.`);
  useEffect(()=>{ if(paused || finished || remaining <= 0) return; const endAt=Date.now()+remaining*1000; const timer=window.setInterval(()=>setRemaining(Math.max(0,Math.ceil((endAt-Date.now())/1000))),1000); return ()=>clearInterval(timer); },[paused,finished,remaining===0]);
  useEffect(()=>{ if(trying) input.current?.focus(); },[trying]);
  useEffect(()=>()=>stop(),[]);
  const check = () => {
    if(!attempt.trim()) {setFeedback('Type the word first.');return;}
    const ok=attempt.trim().toLowerCase()===word.toLowerCase(); setCorrect(ok);setFeedback(ok?'Brilliant! You spelled it correctly.':'Good try. Look at the word, then try again.');
    if(ok) speak('read:lesson-feedback','Brilliant! You spelled it correctly.');
  };
  const next = () => {
    if(paused || remaining===0) return;
    if(!correct) {setTrying(true);setFeedback('Have a go at spelling the word before moving on.');return;}
    if(step===words.length-1) {complete({id:runId,kind:'lesson',title:`Year ${year} spelling`,stars:3});setFinished(true);stop();return;}
    setStep(s=>s+1);setAttempt('');setTrying(false);setCorrect(false);setFeedback('');
  };
  if(finished) return <Page title="Brilliant learning!" back="/" intro="You completed all seven words."><div className="a-panel a-celebrate"><ArtIcon symbol="🌟"/><h2>3 stars earned</h2><p>Your lesson is saved on this device.</p><Link className="a-button" to="/rewards">See my rewards</Link><Link className="a-button" to="/games">Choose a game</Link></div></Page>;
  if(compact) return <main className="compact-lesson"><header><Link className="a-button" to="/" aria-label="Home"><Home/></Link><h1>My spelling lesson <small>Year {year} · Step {step+1} of {words.length} · {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')} left</small></h1><SoundButton/></header><section className="compact-board" aria-label="Lesson whiteboard"><h2>{paused?'Lesson paused':hideWord?'Listen, then type':word}</h2>{trying && !paused && <form onSubmit={e=>{e.preventDefault();check();}}><input ref={input} aria-label="Your spelling" autoComplete="off" spellCheck={false} autoCapitalize="off" value={attempt} disabled={remaining===0||correct} onChange={e=>setAttempt(e.target.value)}/><button className="a-button" disabled={remaining===0||correct}>Check</button></form>}<p role="status">{feedback || (paused?'Tap Resume lesson when you are ready.':'Hear the word, then try spelling it.')}</p></section><nav aria-label="Lesson actions"><button className="a-button" onClick={()=>{if(!paused)speak('read:lesson-word',word);}} aria-label="Hear the word">Hear the word</button><button className="a-button" onClick={()=>{if(!paused&&remaining>0){setTrying(true);setCorrect(false);setFeedback('');speak('read:lesson-word',word);}}}>Try spelling</button><button className="a-button" aria-label="Rubber: clear spelling" onClick={()=>{if(!paused&&remaining>0){setAttempt('');setCorrect(false);setTrying(true);setFeedback('Cleared. Have another go.');input.current?.focus();}}}>Rubber</button><button className="a-button" onClick={()=>openArchie()}>Ask Archie</button><button className="a-button" aria-label={paused?'Resume lesson':'Pause lesson'} onClick={()=>{setPaused(p=>!p);stop();}}>{paused?'Resume lesson':'Pause lesson'}</button><button className="a-button" onClick={next}>{step===6?'Finish lesson':'Next word'}</button></nav>{remaining===0 && <button className="a-button" onClick={()=>setRemaining(5*60)}>Practise for 5 more minutes</button>}</main>;
  return <main className="art-stage" aria-label="My spelling lesson"><h1 className="sr-only">My spelling lesson</h1><div className="approved-art lesson-art">
    <img src="/assets/archie-approved/lesson.png" width="841" height="1870" alt="Archie beside a whiteboard in a colourful classroom."/>
    <ArtButton label="Home" x={18} y={58} w={190} h={96} to="/"/>
    <div className="lesson-sound"><SoundButton/></div>
    <span className="lesson-year">Year {year}</span><span className="lesson-time" aria-label="Time remaining">{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')} left</span>
    <section className="live-whiteboard" aria-label="Lesson whiteboard"><h2>{hideWord?'Your turn to spell it':'Let’s spell it together'}</h2><p className="lesson-word">{hideWord?'Listen, then type':word}</p><div className="letter-tiles" aria-label={hideWord?'Word hidden for practice':word}>{(hideWord?'?'.repeat(word.length):word).split('').map((letter,i)=><span key={i}>{letter}</span>)}</div></section>
    <ArtButton label="Rubber: clear spelling" x={625} y={1005} w={151} h={100} onClick={()=>{if(!paused&&remaining>0){setAttempt('');setCorrect(false);setTrying(true);setFeedback('Cleared. Have another go.');input.current?.focus();}}}/>
    <div className="lesson-answer"><label htmlFor="spelling-answer">{correct?'Well done!':trying?'Type the word below':'Ready? Tap Try spelling.'}</label>{trying && <form onSubmit={e=>{e.preventDefault();check();}}><input id="spelling-answer" ref={input} aria-label="Your spelling" autoComplete="off" spellCheck={false} autoCapitalize="off" value={attempt} disabled={paused||remaining===0||correct} onChange={e=>setAttempt(e.target.value)}/><button className="a-button" disabled={paused||remaining===0||correct}>Check</button></form>}<p role="status">{feedback}</p></div>
    <ArtButton label="Hear the word" x={254} y={1179} w={246} h={222} onClick={()=>{if(!paused) {speak('read:lesson-word',word);setFeedback(settings.sound?'Listen, then have a go.':'Sound is off. Turn it on with the sound button.');}}}/>
    <ArtButton label="Try spelling" x={510} y={1179} w={301} h={222} onClick={()=>{if(!paused&&remaining>0) {setTrying(true);setCorrect(false);setFeedback('');speak('read:lesson-word',word);}}}/>
    <div className="lesson-progress" aria-label={`Step ${step+1} of ${words.length}`}><div>{words.map((_,i)=><span key={i} className={i<step?'done':i===step?'current':''}>{i<step?'✓':''}</span>)}</div><strong>Step {step+1} of {words.length}</strong></div>
    <ArtButton label="Ask Archie" x={22} y={1503} w={797} h={181} onClick={()=>openArchie()}/>
    <ArtButton label={paused?'Resume lesson':'Pause lesson'} x={39} y={1699} w={346} h={120} onClick={()=>{setPaused(p=>!p);stop();}}/>
    {paused && <span className="lesson-resume" aria-hidden="true">▶ Resume</span>}
    <ArtButton label={step===6?'Finish lesson':'Next word'} x={402} y={1699} w={397} h={120} onClick={next}/>
    {(paused || remaining===0) && <div className="lesson-paused"><h2>{paused?'Lesson paused':'Time for a break'}</h2><p>{paused?'Your place is saved while you take a break.':'You have practised for 30 minutes.'}</p><button className="a-button" onClick={()=>{if(remaining===0)setRemaining(5*60);setPaused(false);}}>{remaining===0?'Practise for 5 more minutes':'Resume lesson'}</button><Link className="a-button" to="/">Go home</Link></div>}
  </div></main>;
}
export function ArchieLibrary() {
  useLearning('Library','Reading');
  const { activities } = useArchieData();
  return <Page title="Archie’s library" intro="Choose a starter story. Read it yourself or listen together."><div className="a-grid">{BOOKS.map((book,i)=><Link to={`/reader/${book.id}`} key={book.id} className={`a-card a-book colour-${i%4}`}><img className="a-book-art" loading="lazy" src={book.id==='lost-key'?'/assets/images/archie-character-v2.png':`/assets/cartoon/worlds/${book.id==='number-bridge'?'maths':book.id==='seal-pup'?'geography':'reading'}.png`} alt=""/><h2>{book.title}</h2><p>{book.pages.length} pages • {activities.some(a=>a.id===`book-${book.id}`)?'Read again':'Start reading'}</p><BookOpen/></Link>)}</div></Page>;
}
export function ArchieReader() {
  const { bookId }=useParams();
  const book=BOOKS.find(b=>b.id===bookId);
  const [page,setPage]=useState(0);
  const { speak,stop,playing }=useVoice();
  const { complete,activities }=useArchieData();
  const currentPage=Math.min(page,(book?.pages.length||1)-1);
  useLearning(book?.title||'Reader','Reading',book?.pages[currentPage]);
  useEffect(()=>{setPage(0);return ()=>stop();},[bookId]);
  if(!book) return <Page title="Choose a story"><Link className="a-button" to="/library">Open the library</Link></Page>;
  const finished=activities.some(a=>a.id===`book-${book.id}`);
  return <Page title={book.title} back="/"><Link className="a-button" to="/library">← All books</Link><article className="a-panel a-reader"><ArtIcon symbol={book.emoji}/><p>{book.pages[currentPage]}</p><small>Page {currentPage+1} of {book.pages.length}</small></article><div className="a-actions">
    <button className="a-button" disabled={currentPage===0} onClick={()=>{stop();setPage(p=>p-1);}}><ArrowLeft/> Previous</button>
    <button className="a-button" onClick={()=>playing?stop():speak('read:book',book.pages[currentPage])}>{playing?<Pause/>:<Volume2/>}{playing?'Stop reading':'Read aloud'}</button>
    {currentPage<book.pages.length-1?<button className="a-button" onClick={()=>{stop();setPage(p=>p+1);}}>Next page <ArrowRight/></button>:<button className="a-button" disabled={finished} onClick={()=>complete({id:`book-${book.id}`,kind:'book',title:book.title,stars:1})}>{finished?'Book completed ✓':'Finish book • Earn 1 star'}</button>}
  </div>{finished&&<p role="status">Your reading star is saved. <Link to="/rewards">See your rewards</Link></p>}</Page>;
}
export function ArchieHomework() {
  const [question,setQuestion]=useState('');
  const [photo,setPhoto]=useState('');
  const [notice,setNotice]=useState('');
  const { openArchie }=useArchieContext();
  useLearning('Homework','Homework',question);
  useEffect(()=>()=>{if(photo)URL.revokeObjectURL(photo);},[photo]);
  return <Page title="Homework helper" intro="Let’s work through one question together."><div className="a-panel">
    <label className="a-upload"><Camera aria-hidden="true"/> Add a homework photo<input type="file" accept="image/*" capture="environment" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>8_000_000){setNotice('Choose an image smaller than 8 MB.');return;}setPhoto(URL.createObjectURL(file));setNotice('Photo ready on this device. Type the question below so Archie can help.');}}/></label>
    {photo&&<><img className="homework-photo" src={photo} alt="Your homework reference"/><button className="a-button" onClick={()=>{setPhoto('');setNotice('Photo removed.');}}>Remove photo</button></>}
    <label className="a-field">Which question shall we work on?<textarea value={question} maxLength={2000} placeholder="Type or paste your question here…" onChange={e=>setQuestion(e.target.value)}/></label>
    <button className="a-button" disabled={!question.trim()} onClick={()=>openArchie(question)}>Get help with this question</button><p role="status">{notice}</p><p className="a-note">The photo stays on this device. Photo reading is not connected in this test version.</p>
  </div></Page>;
}
const STICKERS = [{id:'key',emoji:'🔑',name:'Golden key',stars:1,art:'/assets/archie-approved/home.png'},{id:'book',emoji:'📘',name:'Book explorer',stars:3,art:'/assets/archie-approved/lesson.png'},{id:'castle',emoji:'🏰',name:'Castle explorer',stars:6,art:'/assets/cartoon/worlds/geography.png'},{id:'rocket',emoji:'🚀',name:'Star traveller',stars:10,art:'/assets/cartoon/worlds/science.png'},{id:'rainbow',emoji:'🌈',name:'Rainbow learner',stars:15,art:'/assets/cartoon/worlds/reading.png'},{id:'trophy',emoji:'🏆',name:'Learning champion',stars:25,art:'/assets/images/archie-character-v2.png'}];
export function ArchieRewards({ stickers = false, progress = false }: { stickers?: boolean; progress?: boolean }) {
  const { activities,stickers:claimed }=useArchieData();
  const { completedGamesCount,level }=useProgression();
  const stars=activities.reduce((sum,a)=>sum+a.stars,0)+readGameStars();
  useLearning(stickers?'Sticker book':progress?'Progress':'Rewards');
  return <Page title={stickers?'My sticker book':progress?'My progress':'My rewards'} intro="Your learning, saved on this device."><div className="a-stats"><div><strong>{stars}</strong><span>Stars earned</span></div><div><strong>{completedGamesCount}</strong><span>Games finished</span></div><div><strong>{level}</strong><span>Game level</span></div></div>
    <div className="a-tabs"><Link className="a-button" to="/rewards">Rewards</Link><Link className="a-button" to="/stickers">Sticker book</Link><Link className="a-button" to="/progress">Progress</Link></div>
    {progress?<div className="a-panel"><h2>Recent books and lessons</h2>{activities.length?activities.slice().reverse().map(a=><div className="a-activity" key={a.id}><strong>{a.title}</strong><span>{a.stars} ★ • {new Date(a.date).toLocaleDateString('en-GB')}</span></div>):<p>Complete a lesson or read a book to start your learning record.</p>}<Link className="a-button" to="/lesson">Start a lesson</Link></div>:<div className="a-grid">{STICKERS.map(s=><div key={s.id} className={`a-card ${claimed.includes(s.id)?'colour-0':'colour-3'}`}><div className={`a-sticker-art ${claimed.includes(s.id)?'is-earned':''}`}><img src={s.art} alt={claimed.includes(s.id)?`${s.name} sticker earned`:`${s.name} sticker preview`}/><span aria-hidden="true">{s.emoji}</span></div><h2>{s.name}</h2><p>{s.stars} stars to unlock</p><button className="a-button" disabled={stars<s.stars||claimed.includes(s.id)} onClick={()=>updateSavedData(d=>({...d,stickers:d.stickers.includes(s.id)?d.stickers:[...d.stickers,s.id]}))}>{claimed.includes(s.id)?'Collected ✓':stars>=s.stars?'Collect sticker':`${s.stars-stars} more stars`}</button></div>)}</div>}
  </Page>;
}
export function ArchieParents({ settingsOnly = false }: { settingsOnly?: boolean }) {
  const {settings,setSettings}=useArchieData();
  const [year,setYear]=useState(settings.year);
  const [notice,setNotice]=useState('');
  const [connection,setConnection]=useState('Not checked yet.');
  const [checking,setChecking]=useState(false);
  useLearning(settingsOnly?'Settings':'Parents');
  async function checkConnection() {
    setChecking(true);setConnection('Checking…');
    try { const r=await fetch(`${API_PREFIX}/archie/status`,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error();const data=await r.json();setConnection(data.message||'Learning service responded.'); }
    catch {setConnection('The online learning service is not connected. Built-in maths and spelling help still work.');}
    finally{setChecking(false);}
  }
  return <Page title={settingsOnly?'Settings':'Parents & learning'} back="/" intro="Choose how your child learns on this device."><form className="a-panel" onSubmit={e=>{e.preventDefault();setSettings({year});setNotice('Your learning settings are saved. The next lesson will use this year group.');}}>
    <label className="a-field">School year<select value={year} onChange={e=>setYear(Number(e.target.value))}>{[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>Year {n}</option>)}</select></label>
    <p><strong>Lesson length:</strong> 30 minutes, with a pause button whenever you need it.</p>
    <label className="a-check"><input type="checkbox" checked={settings.sound} onChange={e=>setSettings({sound:e.target.checked})}/> Read aloud and sound</label>
    <label className="a-check"><input type="checkbox" checked={settings.largeText} onChange={e=>setSettings({largeText:e.target.checked})}/> Larger text on menus and books</label>
    <button className="a-button">Save learning settings</button><p role="status">{notice}</p>
  </form><div className="a-panel"><h2>Archie’s learning helper</h2><p>Built-in help works first. A connected AI teacher can help with wider questions.</p><button className="a-button" disabled={checking} onClick={checkConnection}>{checking?'Checking…':'Check AI setup'}</button><p role="status">{connection}</p></div><div className="a-actions"><Link className="a-button" to="/progress">View progress</Link><Link className="a-button" to="/lesson">Try the lesson</Link></div><p className="a-note">This test version saves progress in this browser. Accounts and cross-device syncing are not connected.</p></Page>;
}
export function ArchieCartoons() {
  const [episode,setEpisode]=useState<number|null>(null);
  const [scene,setScene]=useState(0);
  const [playing,setPlaying]=useState(false);
  const {speak,stop}=useVoice();
  const item=episode===null?null:EPISODES[episode];
  useLearning(item?.title||'Cartoon theatre','Stories',item?.scenes[scene]);
  useEffect(()=>{if(!item||!playing)return;speak('read:cartoon',item.scenes[scene]);const t=window.setTimeout(()=>{if(scene+1<item.scenes.length)setScene(s=>s+1);else setPlaying(false);},7500);return()=>{clearTimeout(t);stop();};},[episode,scene,playing]);
  useEffect(()=>()=>stop(),[]);
  return <Page title="Cartoon theatre" intro="Picture stories with Archie. Press play to listen.">
    {item?<><button className="a-button" onClick={()=>{stop();setPlaying(false);setEpisode(null);}}>← All episodes</button><div className="a-panel a-theatre"><img src={item.image} alt=""/><h2>{item.title}</h2><p aria-live="polite">{item.scenes[scene]}</p><small>Scene {scene+1} of {item.scenes.length}</small></div><div className="a-actions"><button className="a-button" onClick={()=>setPlaying(p=>!p)}>{playing?<Pause/>:<Play/>}{playing?'Pause':'Play'}</button><button className="a-button" onClick={()=>{stop();setScene(s=>(s+1)%item.scenes.length);}}>Next scene</button><button className="a-button" onClick={()=>{stop();setScene(0);setPlaying(true);}}>Restart</button><button className="a-button" onClick={()=>speak('read:scene',item.scenes[scene])}>Read this scene</button></div></>:<div className="a-grid">{EPISODES.map((e,i)=><button key={e.title} className="a-card colour-1" onClick={()=>{setEpisode(i);setScene(0);setPlaying(true);}}><img src={e.image} alt=""/><h2>{e.title}</h2><span className="a-play">Play story →</span></button>)}</div>}
  </Page>;
}
export function ArchieAskRoute() {
  const {openArchie}=useArchieContext();
  useEffect(()=>openArchie(),[openArchie]);
  return <Navigate to="/world" replace/>;
}
