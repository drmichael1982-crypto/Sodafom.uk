import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { Home, Volume2, VolumeX, ArrowLeft, ArrowRight, Search, BookOpen, Pause, Play, Calculator, SpellCheck, FlaskConical, Globe, NotebookPen, Film, Star, Trophy, Users, KeyRound, Castle, Rocket, Rainbow, Waves, Flower2, Milestone, Gamepad2, Camera } from 'lucide-react';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useProgression } from '@/contexts/ProgressionContext';
import { useVoice } from '@/lib/voice-context';
import { API_PREFIX } from '@/lib/config';
import { BOOKS, SPELLING_WORDS } from '@/lib/archie/books';
import { clearSavedLearning, loadSavedLearning } from '@/lib/archie/device-learning';
import { useArchieData, updateSavedData, readGameStars } from '@/lib/archie/storage';
import catalog from '@/lib/archie/game-catalog.json';
import { EPISODES } from '@/pages/CartoonTheatrePage';
import './archie.css';
import { getChildInterests, getInterestTheme, isSchoolFriendlyInterest, removeChildInterest, saveChildInterest } from '@/lib/interest-themes';
import GrownUpGate from '@/components/GrownUpGate';
import ArchieAvatar from '@/components/ArchieAvatar';
import { getArchieStage } from '@/lib/archie/age-style';
import SceneArtwork, { sceneForSubject, type LearningScene } from '@/components/SceneArtwork';
import PagePictureJigsaw from '@/components/PagePictureJigsaw';
import OrbitHome from '@/components/OrbitHome';
import PlanetGlobe from '@/components/PlanetGlobe';
import ArchiePicturePiece from '@/components/ArchiePicturePiece';
import LearningJigsaw from '@/components/LearningJigsaw';
import AppScreenPager from '@/components/AppScreenPager';
import InstallAppButton from '@/components/InstallAppButton';
import HistoryJigsaw from '@/components/HistoryJigsaw';
import ParentAIResources from '@/components/ParentAIResources';
import ParentAccountPanel from '@/components/ParentAccountPanel';
import ParentAIConnection from '@/components/ParentAIConnection';
import ParentLearningReport from '@/components/ParentLearningReport';
import AgeExperience, { readLearningAge, saveLearningAge } from '@/components/AgeExperience';
import './sodafom-polish.css';
import './archie-picture-home.css';
import { isGameForYear } from '@/lib/archie/game-age';
import { puzzleThemeStyle } from '@/lib/archie/puzzle-theme';
import LearningYearOptions, { LEARNING_YEAR_SCOPE_NOTE } from '@/components/LearningYearOptions';

export const ARCHIE_PATHS = ['/', '/world', '/quests', '/courses', '/games', '/lesson', '/library', '/reader', '/homework', '/stickers', '/rewards', '/progress', '/parents', '/settings', '/cartoons', '/privacy', '/artwork', '/teacher', '/class', '/time-lab', '/preview-admin', '/history', '/device-check', '/ask-archie', '/chat'];
export function isArchiePage(path: string) { return ARCHIE_PATHS.includes(path) || path.startsWith('/reader/') || path.startsWith('/courses/'); }
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
export function Page({ title, intro, children, back = '/world', backLabel, calm = false, scene, toolbar }: { title: string; intro?: string; children: ReactNode; back?: string; backLabel?: string; calm?: boolean; scene?: LearningScene; toolbar?: ReactNode }) {
  const { settings } = useArchieData();
  const { openArchie } = useArchieContext();
  return <main style={puzzleThemeStyle(title, scene)} className={`archie-app soda-page puzzle-themed age-${getArchieStage(settings.year)} ${settings.largeText ? 'archie-large' : ''} ${calm ? 'a-calm' : ''}`}><div className="a-page">
    <header className="a-top"><Link className="a-button a-icon" to={back} aria-label={backLabel ?? (back === '/' ? 'Home' : 'Back to my world')}>{back === '/' ? <Home/> : <ArrowLeft/>}</Link><Link className="a-logo" to="/">SODAFOM<small>Learn • Play • Grow</small></Link><SoundButton/></header>
    <section className={`a-hero soda-hero ${calm ? 'soda-hero-calm' : ''}`}>
      <div className="a-hero-copy"><span className="a-eyebrow">{calm ? 'Learning with care' : 'Discover something brilliant'}</span><h1>{title}</h1>{intro && <p className="a-intro">{intro}</p>}</div>
      {!calm && <SceneArtwork scene={scene ?? sceneForSubject(title)} title={title} compact/>}
    </section>
    <div className="a-page-help"><button className="a-button" onClick={() => openArchie()}>Ask Archie</button><span>Help with this game or lesson</span></div>
    {toolbar}
    <AppScreenPager>{children}</AppScreenPager>
    <nav className="a-bottom" aria-label="Main navigation"><Link to="/">Home</Link><Link to="/world">My world</Link><Link to="/games">Games</Link><Link to="/courses">Lessons</Link><Link to="/lesson">Spelling</Link><Link to="/privacy">Privacy</Link></nav>
  </div></main>;
}
function ArtButton({ label, x, y, w, h, onClick, to }: { label: string; x: number; y: number; w: number; h: number; onClick?: () => void; to?: string }) {
  const props = { className: 'art-hit', style: { left: `${x/841*100}%`, top: `${y/1870*100}%`, width: `${w/841*100}%`, height: `${h/1870*100}%` }, 'aria-label': label };
  return to ? <Link {...props} to={to}><span className="sr-only">{label}</span></Link> : <button {...props} onClick={onClick}><span className="sr-only">{label}</span></button>;
}
function useCompactLandscape(readableWidth = 400, expandedHome = false) {
  const compactQuery = `(max-width:${readableWidth}px), (min-width:550px) and (max-height:500px)${expandedHome ? ', (min-width:600px)' : ''}`;
  const [compact, setCompact] = useState(() => window.matchMedia(compactQuery).matches);
  useEffect(() => { const query=window.matchMedia(compactQuery); const update=()=>setCompact(query.matches); update(); query.addEventListener('change',update); return ()=>query.removeEventListener('change',update); },[compactQuery]);
  return compact;
}
export function ArchieHome() {
  useLearning('Home');
  const [homeScreen,setHomeScreen]=useState('activities');
  const { openArchie } = useArchieContext();
  const { settings } = useArchieData();
  const [interests, setInterests] = useState<string[]>(() => getChildInterests());
  const [interestInput, setInterestInput] = useState('');
  const [personalizing, setPersonalizing] = useState(false);
  const interestDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (personalizing) { if (!interestDialog.current?.open) interestDialog.current?.showModal(); }
    else interestDialog.current?.close();
  }, [personalizing]);
  const [interestNotice, setInterestNotice] = useState('');
  const activeInterest = interests[0] ?? '';
  const theme = activeInterest ? getInterestTheme(activeInterest) : null;

  useEffect(() => {
    const refresh = () => setInterests(getChildInterests());
    window.addEventListener('sodafom:child-interests-updated', refresh);
    return () => window.removeEventListener('sodafom:child-interests-updated', refresh);
  }, []);

  function addInterest(value = interestInput) {
    const clean = value.trim();
    if (!clean) return;
    if (!isSchoolFriendlyInterest(clean)) {
      setInterestNotice('Choose a friendly, school-ready interest for your screen.');
      setInterestInput('');
      return;
    }
    const next = saveChildInterest(clean);
    setInterests(next);
    setInterestInput('');
    setInterestNotice('Saved on this device. Archie uses an original colour palette and abstract shapes.');
  }

  function removeInterest(value: string) {
    const next = removeChildInterest(value);
    setInterests(next);
    setInterestNotice('Interest removed. Your home screen colours have been updated.');
  }

  const homePersonalizer = (
    <>
      <div className="home-personalize-bar">
        <span>{theme ? <>{theme.emoji} Your {theme.palette} learning world</> : 'Make your learning world yours'}</span>
        <button className="home-personalize-trigger" type="button" aria-label="Change my interests" onClick={() => setPersonalizing(true)}>🎨 Personalise</button>
      </div>
      <dialog ref={interestDialog} className="home-interest-dialog" aria-labelledby="home-interest-title" onCancel={() => setPersonalizing(false)} onClose={() => setPersonalizing(false)}>
            <h2 id="home-interest-title">Make your home screen yours</h2>
            <p>Add a favourite interest. Archie keeps it on this device and uses original colours and abstract patterns, not characters or logos.</p>
            <form onSubmit={(event) => { event.preventDefault(); addInterest(); }}>
              <label htmlFor="home-interest-input">What are you into?</label>
              <div className="home-interest-form">
                <input autoFocus id="home-interest-input" value={interestInput} onChange={(event) => setInterestInput(event.target.value)} maxLength={32} placeholder="Space, football, animals…" />
                <button className="a-button" type="submit" disabled={!interestInput.trim()}>Save</button>
              </div>
            </form>
            {interests.length > 0 && <div className="home-interest-list" aria-label="Saved interests">{interests.map(value => (
              <button key={value} type="button" className="home-interest-chip" aria-label={`Remove interest ${value}`} onClick={() => removeInterest(value)}>{getInterestTheme(value).emoji} {value} <span aria-hidden="true">×</span></button>
            ))}</div>}
            <p className="home-interest-note" role="status">{interestNotice || 'You can change these any time. Up to five interests are saved for this child.'}</p>
            <button type="button" className="home-interest-close" onClick={() => setPersonalizing(false)}>Done</button>
          </dialog>
    </>
  );

  return <main className={`soda-home soda-home-whole-puzzle space-jigsaw-home puzzle-themed age-${getArchieStage(settings.year)} ${settings.largeText ? 'archie-large' : ''}`} style={{...puzzleThemeStyle('Home'), ...(theme ? { backgroundImage: theme.background } : {})}}>
    <div className={`soda-home-inner app-home-screen screen-${homeScreen}`}>
      <header className="soda-home-top"><Link className="a-logo" to="/">SODAFOM<small>Learn · Play · Grow</small></Link><div className="soda-home-tools"><InstallAppButton/><button className="a-button a-icon" type="button" aria-label="Personalise my home screen" onClick={()=>setPersonalizing(true)}><NotebookPen size={19}/></button><Link className="a-button" to="/parents" aria-label="Parents and learning settings"><Users size={19}/><span>Grown-ups</span></Link><SoundButton/></div></header>
      {homePersonalizer}
      <nav className="home-screen-tabs" aria-label="Home screens">{[['activities','Explore'],['planets','Planets'],['learning','Puzzles'],['missions','Learn']].map(([id,label])=><button key={id} type="button" aria-pressed={homeScreen===id} onClick={()=>setHomeScreen(id)}>{label}</button>)}</nav>
      <div className="archie-home-welcome"><div><span>Learn · play · discover</span><strong>{settings.childNickname ? `Hello, ${settings.childNickname}! Pick an adventure.` : 'Pick a picture, start an adventure!'}</strong></div><button className="home-ask-button" type="button" onClick={()=>openArchie()}>Ask Archie</button><button type="button" onClick={()=>setHomeScreen('planets')} aria-label="Play the planet jigsaw"><PlanetGlobe index={2} moving={!window.matchMedia('(prefers-reduced-motion: reduce)').matches}/><span>Planet puzzle →</span></button></div>
      <div className="soda-year-link"><Link to="/parents">Year {settings.year} · Grown-ups: choose age and learning year →</Link></div><AgeExperience nickname={settings.childNickname} year={settings.year} askArchie={()=>openArchie()}/><OrbitHome autoStart/><LearningJigsaw year={settings.year}/>
      <section aria-labelledby="home-puzzle-title"><h2 id="home-puzzle-title" className="home-puzzle-title">Choose your adventure</h2><p className="soda-small-note">Tap a jigsaw piece. Choose your next adventure.</p><PagePictureJigsaw pageKey="home"/></section>
      <section className="soda-talk-card"><ArchieAvatar year={settings.year} className="soda-talk-avatar"/><div><h2>Let's work it out together</h2><p>Ask Archie for a hint, listen to a question or talk through one step.</p></div><button className="a-button" onClick={()=>openArchie()}>Ask Archie</button></section>
      <nav className="a-bottom soda-home-more" aria-label="More activities">{[['Sticker book','/stickers'],['Cartoons','/cartoons'],['Progress','/progress'],['Library','/library'],['Parents','/parents'],['Teachers','/teacher'],['Settings','/settings'],['Clock lab','/time-lab'],['Artwork gallery','/artwork'],['Privacy','/privacy']].map(([label,to])=><Link key={to} to={to}>{label}</Link>)}</nav>
      <p className="soda-small-note">Try a little, take a break, and come back when you're ready.</p>
    </div>
  </main>;
}

const WORLDS = [
  ['Learning adventures','🔑','/courses'],
  ['Learning quests','★','/quests'],
  ['Maths','🧮','/games?subject=maths'], ['Reading','📖','/games?subject=reading'], ['Spelling','🔤','/games?subject=spelling'],
  ['Science','🔬','/games?subject=science'], ['Geography','🌍','/games/geography-quiz'], ['My lesson','🖍️','/lesson'],
  ['Library','📚','/library'], ['Homework','📝','/homework'], ['Cartoons','🎬','/cartoons'], ['Sticker book','🌟','/stickers'],
  ['Rewards','🏆','/rewards'], ['Parents','👪','/parents'],
  ['Class lessons','📘','/class'], ['Teacher lessons','📝','/teacher'],
  ['Progress','📈','/progress'], ['Settings','⚙️','/settings'], ['Clock lab','🕰️','/time-lab'],
  ['Artwork gallery','🎨','/artwork'], ['Privacy','🛡️','/privacy'],
];
const PUZZLE_DESCRIPTIONS: Record<string,string> = {
  'Learning adventures':'Follow a 30-minute lesson', 'Learning quests':'Try a quick challenge',
  Maths:'Play with numbers', Reading:'Practise reading', Spelling:'Build and spell words', Science:'Discover how things work',
  Geography:'Explore our world', 'My lesson':'Practise on the whiteboard', Library:'Read or listen to a story', Homework:'Get help with your work',
  Cartoons:'Watch a story', 'Sticker book':'Collect your stickers', Rewards:'See your earned stars', Parents:'Learning and AI settings',
  'Class lessons':'Learn together in class', 'Teacher lessons':'Lesson plans for grown-ups', Games:'Choose a game', History:'Explore the past',
  Progress:'See your learning journey', Settings:'Choose accessible learning controls', 'Clock lab':'Practise telling the time',
  'Artwork gallery':'See your saved creations', Privacy:'Learn how your information is protected',
  'Adventure Trail':'Roll, solve and explore', 'Explore my world':'See every activity',
};
function PuzzleMenu({home=false}: {home?:boolean}) {
  const pictureRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const picture = pictureRef.current;
    if (!home || !picture) return;
    const media = window.matchMedia('(max-width: 760px)');
    let disposed = false;
    const image = new Image();
    const align = () => {
      if (disposed || !image.naturalWidth) return;
      const bounds = picture.getBoundingClientRect();
      const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
      const left = (bounds.width - width) / 2, top = (bounds.height - height) / 2;
      picture.style.setProperty("--home-picture", `url("${image.src}")`);
      picture.querySelectorAll<HTMLElement>('.world-puzzle-piece').forEach(piece => {
        const rect = piece.getBoundingClientRect();
        piece.style.setProperty('--piece-picture', `url("${image.src}")`);
        piece.style.setProperty('--piece-size', `${width}px ${height}px`);
        piece.style.setProperty('--piece-position', `${left - rect.left + bounds.left}px ${top - rect.top + bounds.top}px`);
      });
    };
    const load = () => { image.src = `/assets/scenes/archie-jigsaw-${media.matches ? 'mobile' : 'island'}-v2.webp`; };
    image.onload = align;
    const observer = new ResizeObserver(align);
    observer.observe(picture);
    media.addEventListener('change', load);
    load();
    return () => { disposed = true; observer.disconnect(); media.removeEventListener('change', load); image.onload = null; };
  }, [home]);

  const candidates = home ? [...WORLDS, ['Games','🎮','/games'], ['History','🏰','/history'], ['Adventure Trail','🎲','/games/archie-adventure-trail'], ['Explore my world','🌍','/world'], ['Ask Archie','💬','/ask-archie'], ['Clock lab','🕒','/time-lab'], ['Progress','📈','/progress'], ['Artwork','🎨','/artwork'], ['Settings','⚙️','/settings'], ['Privacy','🔒','/privacy']] : WORLDS;
  const routes = new Set<string>();
  const items = candidates.filter(([, , route]) => {
    if (routes.has(route)) return false;
    routes.add(route);
    return true;
  });
  return <nav ref={pictureRef} className={`world-puzzle ${home ? 'home-picture-puzzle' : ''}`} aria-label={home ? 'Home activities' : 'Adventure picture activities'}>{items.map(([label,emoji,to]) => <Link key={to} className={`world-puzzle-piece ${home ? 'has-archie-picture' : ''}`} to={to}>
    {home && <ArchiePicturePiece label={label}/>}
    <svg className="world-puzzle-seam" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M100 0 V37 C88 32 88 53 100 48 V100 H63 C68 88 47 88 52 100 H0"/></svg>
    <span className="world-puzzle-label"><h2>{!home&&<span aria-hidden="true">{emoji} </span>}{home ? ({'Learning adventures':'Lessons','Learning quests':'Quests','My lesson':'Whiteboard','Teacher lessons':'Teachers','Class lessons':'Class','Sticker book':'Stickers','Adventure Trail':'Trail','Explore my world':'My world'} as Record<string,string>)[label] || label : label}</h2><span className="puzzle-description">{PUZZLE_DESCRIPTIONS[label]}</span><span className="puzzle-open">Open →</span></span>
  </Link>)}</nav>;
}
export function ArchieWorld() {
  useLearning('My world');
  return <Page title="Explore my world" intro="Choose a piece of Archie's adventure picture." back="/" scene="adventure"><PuzzleMenu/><p className="a-note">Every piece opens a game, lesson or activity. The picture stays together as you explore.</p></Page>;
}
const yearForAgeBand = (band: string | null) => band === '5-7' ? 2 : band === '8-10' ? 5 : band === '11-13' ? 8 : null;
export function ArchieGames() {
  useLearning('Choose a game');
  const { settings } = useArchieData();
  const [params,setParams] = useSearchParams();
  const [query,setQuery] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const subject = params.get('subject') || 'all';
  const linkedYear = yearForAgeBand(params.get('age'));
  const activeYear = linkedYear ?? settings.year;
  useEffect(()=>{if(linkedYear && linkedYear!==settings.year)updateSavedData(d=>({...d,settings:{...d.settings,year:linkedYear}}));},[linkedYear,settings.year]);
  const chooseYear = (year:number) => { const next=new URLSearchParams(params);next.delete('age');setParams(next);updateSavedData(d=>({...d,settings:{...d.settings,year}})); };
  const filtered = catalog.filter(g => isGameForYear(activeYear,g.ageGroups) && (subject === 'all' || g.subject === subject) && `${g.title} ${g.description}`.toLowerCase().includes(query.toLowerCase()));
  const toolbar = <div className="game-library-toolbar"><div className="game-library-filters">
    <div className="soda-year-choice"><label className="a-field">My learning year<select value={activeYear} onChange={e=>chooseYear(Number(e.target.value))}><LearningYearOptions/></select></label><p>{LEARNING_YEAR_SCOPE_NOTE}</p></div>
    <label className="a-search"><Search aria-hidden="true"/><input ref={searchInput} type="search" aria-label="Search games" placeholder="Find a game…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    </div><div className="a-tabs" aria-label="Game subjects">{['all','maths','spelling','reading','science'].map(s=><button key={s} className="a-button" aria-pressed={subject===s} onClick={()=>setParams(s==='all'?{}:{subject:s})}>{s==='all'?'All games':s[0].toUpperCase()+s.slice(1)}</button>)}</div>
    <p role="status">{filtered.length} games for Year {activeYear}</p></div>;
  return <Page title="Choose a game" intro="Pick a picture and let's play." toolbar={toolbar}>
    <div className="a-grid">{filtered.map((g,i)=><Link key={g.id} to={g.route} className={`a-card colour-${i%4}`} data-game-link><SceneArtwork scene={sceneForSubject(g.subject,g.title)} title={g.title} compact/><h2>{g.title}</h2><p>{g.description}</p><small>Ages {g.ageGroups.join(', ')}</small><span className="a-play">Play game →</span></Link>)}</div>
    {!filtered.length && <section className="a-panel" aria-labelledby="game-search-help"><h2 id="game-search-help">Let's find another game</h2><p>No games match those filters for Year {activeYear}. Try a shorter search or choose another subject.</p><button className="a-button" onClick={()=>{setQuery('');setParams({});searchInput.current?.focus();}}>Show Year {activeYear} games</button></section>}
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
  const { openArchie, isOpen, voiceOnOpen } = useArchieContext();
  const { speak,stop,playing } = useVoice();
  const input = useRef<HTMLInputElement>(null);
  const compact = useCompactLandscape(600, true);
  const word = words[step];
  const hideWord = trying && !correct && !feedback.startsWith('Good try.');
  useLearning('My spelling lesson', 'Spelling', `Spell the word ${word}.`);
  useEffect(()=>{const pause=()=>{setPaused(true);stop();};window.addEventListener('sodafom:picture-puzzle-open',pause);return()=>window.removeEventListener('sodafom:picture-puzzle-open',pause);},[stop]);
  useEffect(()=>{ if(paused || finished || remaining <= 0) return; const endAt=Date.now()+remaining*1000; const timer=window.setInterval(()=>setRemaining(Math.max(0,Math.ceil((endAt-Date.now())/1000))),1000); return ()=>clearInterval(timer); },[paused,finished,remaining===0]);
  useEffect(()=>{ if(trying) input.current?.focus(); },[trying]);
  useEffect(()=>()=>stop(),[]);
  useEffect(()=>{ const handle=()=>{if(paused||finished||remaining===0)return;setAttempt(word);setTrying(true);setCorrect(true);setFeedback(`Brilliant! You spelled ${word} correctly.`);}; window.addEventListener('archie-spelling-correct',handle); return ()=>window.removeEventListener('archie-spelling-correct',handle); },[word,paused,finished,remaining]);
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
  const advanceRef=useRef<()=>void>(()=>{}); advanceRef.current=next;
  useEffect(()=>{if(!isOpen||!voiceOnOpen||!correct||paused||remaining===0||finished)return;const timer=window.setTimeout(()=>advanceRef.current(),playing?8000:900);return()=>window.clearTimeout(timer);},[isOpen,voiceOnOpen,correct,playing,paused,remaining===0,finished,step]);
  if(finished) return <Page title="Brilliant learning!" back="/" intro="You completed all seven words."><div className="a-panel a-celebrate"><ArtIcon symbol="🌟"/><h2>3 stars earned</h2><p>Your lesson is saved on this device.</p><Link className="a-button" to="/rewards">See my rewards</Link><Link className="a-button" to="/games">Choose a game</Link></div></Page>;
  if(compact) return <main className="compact-lesson puzzle-themed" style={puzzleThemeStyle("My spelling lesson")}><header><Link className="a-button" to="/" aria-label="Home"><Home/></Link><h1>My spelling lesson <small>Year {year} · Step {step+1} of {words.length} · {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')} left</small></h1><SoundButton/></header><section className="compact-board" aria-label="Lesson whiteboard"><h2>{paused?'Lesson paused':hideWord?'Listen, then type':word}</h2>{trying && !paused && <form onSubmit={e=>{e.preventDefault();check();}}><input ref={input} aria-label="Your spelling" autoComplete="off" spellCheck={false} autoCapitalize="off" value={attempt} disabled={remaining===0||correct} onChange={e=>setAttempt(e.target.value)}/><button className="a-button" disabled={remaining===0||correct}>Check</button></form>}<p role="status">{correct && <span className="lesson-correct-tick" aria-label="Correct answer">✓</span>}{feedback || (paused?'Tap Resume lesson when you are ready.':trying?'Type the word you heard, then press Check.':'Look at the word. Tap Hear the word, then Try spelling. The word will hide.')}</p></section><nav aria-label="Lesson actions"><button className="a-button" onClick={()=>{if(!paused)speak('read:lesson-word',word);}} aria-label="Hear the word">Hear the word</button><button className="a-button" onClick={()=>{if(!paused&&remaining>0){setTrying(true);setCorrect(false);setFeedback('');speak('read:lesson-word',word);}}}>Try spelling</button><button className="a-button" aria-label="Rubber: clear spelling" onClick={()=>{if(!paused&&remaining>0){setAttempt('');setCorrect(false);setTrying(true);setFeedback('Cleared. Have another go.');input.current?.focus();}}}>Rubber</button><button className="a-button" onClick={()=>openArchie(undefined,true)}>Start spoken lesson</button><button className="a-button" aria-label={paused?'Resume lesson':'Pause lesson'} onClick={()=>{setPaused(p=>!p);stop();}}>{paused?'Resume lesson':'Pause lesson'}</button><button className="a-button" onClick={next}>{step===6?'Finish lesson':'Next word'}</button></nav>{remaining===0 && <button className="a-button" onClick={()=>setRemaining(5*60)}>Practise for 5 more minutes</button>}</main>;
  return <main className="art-stage" aria-label="My spelling lesson"><h1 className="sr-only">My spelling lesson</h1><div className="approved-art lesson-art">
    <img src="/assets/archie-approved/lesson.png" width="841" height="1870" alt="Archie beside a whiteboard in a colourful classroom."/>
    <ArtButton label="Home" x={18} y={58} w={190} h={96} to="/"/>
    <div className="lesson-sound"><SoundButton/></div>
    <span className="lesson-year">Year {year}</span><span className="lesson-time" aria-label="Time remaining">{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')} left</span>
    <section className="live-whiteboard" aria-label="Lesson whiteboard"><h2>{hideWord?'Your turn to spell it':'Let’s spell it together'}</h2><p className="lesson-word">{hideWord?'Listen, then type':word}</p><div className="letter-tiles" aria-label={hideWord?'Word hidden for practice':word}>{(hideWord?'?'.repeat(word.length):word).split('').map((letter,i)=><span key={i}>{letter}</span>)}</div></section>
    <ArtButton label="Rubber: clear spelling" x={625} y={1005} w={151} h={100} onClick={()=>{if(!paused&&remaining>0){setAttempt('');setCorrect(false);setTrying(true);setFeedback('Cleared. Have another go.');input.current?.focus();}}}/>
    <div className="lesson-answer"><label htmlFor="spelling-answer">{correct && <span className="lesson-correct-tick" aria-label="Correct answer">✓</span>}{correct?'Well done!':trying?'Type the word below':'Ready? Tap Try spelling.'}</label>{trying && <form onSubmit={e=>{e.preventDefault();check();}}><input id="spelling-answer" ref={input} aria-label="Your spelling" autoComplete="off" spellCheck={false} autoCapitalize="off" value={attempt} disabled={paused||remaining===0||correct} onChange={e=>setAttempt(e.target.value)}/><button className="a-button" disabled={paused||remaining===0||correct}>Check</button></form>}<p role="status">{feedback}</p></div>
    <ArtButton label="Hear the word" x={254} y={1179} w={246} h={222} onClick={()=>{if(!paused) {speak('read:lesson-word',word);setFeedback(settings.sound?'Listen, then have a go.':'Sound is off. Turn it on with the sound button.');}}}/>
    <ArtButton label="Try spelling" x={510} y={1179} w={301} h={222} onClick={()=>{if(!paused&&remaining>0) {setTrying(true);setCorrect(false);setFeedback('');speak('read:lesson-word',word);}}}/>
    <div className="lesson-progress" aria-label={`Step ${step+1} of ${words.length}`}><div>{words.map((_,i)=><span key={i} className={i<step?'done':i===step?'current':''}>{i<step?'✓':''}</span>)}</div><strong>Step {step+1} of {words.length}</strong></div>
    <ArtButton label="Start spoken lesson" x={22} y={1503} w={797} h={181} onClick={()=>openArchie(undefined,true)}/>
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
  const storyId=`reader-story-${book.id}-${currentPage}`;
  return <Page title={book.title} back="/" scene="reading"><Link className="a-button" to="/library">← All books</Link><LearningJigsaw key={`${book.id}-${currentPage}`} text={book.pages[currentPage]}/><article id={storyId} className="a-panel a-reader"><ArtIcon symbol={book.emoji}/><p>{book.pages[currentPage]}</p><small>Page {currentPage+1} of {book.pages.length}</small></article><div className="a-actions">
    <button className="a-button" disabled={currentPage===0} onClick={()=>{stop();setPage(p=>p-1);}}><ArrowLeft/> Previous</button>
    <button className="a-button" aria-controls={storyId} onClick={()=>playing?stop():speak('read:book',book.pages[currentPage])}>{playing?<Pause/>:<Volume2/>}{playing?'Stop reading':'Read aloud'}</button>
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
  const [params]=useSearchParams();
  const { activities,stickers:claimed }=useArchieData();
  const { completedGamesCount,level }=useProgression();
  const stars=activities.reduce((sum,a)=>sum+a.stars,0)+readGameStars();
  const source=params.get('from');
  const adultSource=source==='parents'||source==='teacher'?source:null;
  const sourceQuery=adultSource?`?from=${adultSource}`:'';
  const back=adultSource==='parents'?'/parents':adultSource==='teacher'?'/teacher':'/world';
  const backLabel=adultSource==='parents'?'Back to parents and learning':adultSource==='teacher'?'Back to teacher lessons':undefined;
  useLearning(stickers?'Sticker book':progress?'Progress':'Rewards');
  return <Page title={stickers?'My sticker book':progress?'My progress':'My rewards'} intro="Your learning, saved on this device." back={back} backLabel={backLabel}><div className="a-stats"><div><strong>{stars}</strong><span>Stars earned</span></div><div><strong>{completedGamesCount}</strong><span>Games finished</span></div><div><strong>{level}</strong><span>Game level</span></div></div>
    <div className="a-tabs"><Link className="a-button" to={`/rewards${sourceQuery}`}>Rewards</Link><Link className="a-button" to={`/stickers${sourceQuery}`}>Sticker book</Link><Link className="a-button" to={`/progress${sourceQuery}`}>Progress</Link></div>
    {progress?<div className="a-panel"><h2>Recent learning</h2>{activities.length?activities.slice().reverse().map(a=><div className="a-activity" key={a.id}><strong>{a.title}</strong><span>{a.stars} ★ • {new Date(a.date).toLocaleDateString('en-GB')}</span></div>):<p>Complete a lesson or puzzle, or read a book, to start your learning record.</p>}<Link className="a-button" to="/lesson">Start a lesson</Link></div>:<div className="a-grid">{STICKERS.map(s=><div key={s.id} className={`a-card ${claimed.includes(s.id)?'colour-0':'colour-3'}`}><div className={`a-sticker-art ${claimed.includes(s.id)?'is-earned':''}`}><img src={s.art} alt={claimed.includes(s.id)?`${s.name} sticker earned`:`${s.name} sticker preview`}/><span aria-hidden="true">{s.emoji}</span></div><h2>{s.name}</h2><p>{s.stars} stars to unlock</p><button className="a-button" disabled={stars<s.stars||claimed.includes(s.id)} onClick={()=>updateSavedData(d=>({...d,stickers:d.stickers.includes(s.id)?d.stickers:[...d.stickers,s.id]}))}>{claimed.includes(s.id)?'Collected ✓':stars>=s.stars?'Collect sticker':`${s.stars-stars} more stars`}</button></div>)}</div>}
  </Page>;
}
export function ArchieParents({ settingsOnly = false }: { settingsOnly?: boolean }) {
  const { stop } = useVoice();
  const {settings,setSettings}=useArchieData();
  const [year,setYear]=useState(settings.year);
  const [childNickname,setChildNickname]=useState(settings.childNickname ?? '');
  const [learningAge,setLearningAge]=useState<string>(()=>String(readLearningAge() ?? ''));
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
  return <GrownUpGate key={settingsOnly?'settings':'parents'} purpose="Choose learning settings, online help and saved memory" cancel={<Link className="a-button" to="/world">Back to learning</Link>}><Page title={settingsOnly?'Settings':'Parents & learning'} back="/" calm intro="Sign in, choose your child’s learning settings and connect optional AI help.">{!settingsOnly && <><nav className="a-actions parent-shortcuts" aria-label="Parent hub sections"><a className="a-button" href="#parent-account">1. Parent sign-in</a><a className="a-button" href="#parent-ai">2. Connect AI</a><a className="a-button" href="#learning-settings">3. Learning settings</a></nav><ParentAccountPanel/><ParentAIConnection/></>}<form id="learning-settings" className="a-panel" onSubmit={e=>{e.preventDefault();const ageSaved=saveLearningAge(learningAge===''?null:Number(learningAge));setSettings({year,childNickname:childNickname.trim().slice(0,30)});setNotice(ageSaved?'Your age presentation and learning year are saved. The next lesson will use this year group.':'The learning year is saved, but this browser could not save the age preference.');}}>
    <label className="a-field">Child’s nickname (optional)<input type="text" maxLength={30} value={childNickname} onChange={e=>setChildNickname(e.target.value)} autoComplete="off" placeholder="A first name or nickname"/></label>
    <p className="a-note">Archie remembers this nickname for greetings on this device. Use a nickname rather than a full name. It is not added to online AI requests.</p>
    <label className="a-field">Child’s age (5–13, optional)<input type="number" min="5" max="13" step="1" value={learningAge} onChange={e=>setLearningAge(e.target.value)} placeholder="Enter age"/></label>
    <p className="a-note">Age changes the home adventures and question style. Choose the actual school year below for lessons: age alone cannot identify a year group because birthdays and England’s September school-year cut-off differ. No date of birth is needed.</p>
    <label className="a-field">School year<select value={year} onChange={e=>setYear(Number(e.target.value))}><LearningYearOptions/></select></label><p className="a-note">{LEARNING_YEAR_SCOPE_NOTE}</p>
    <p><strong>Lesson length:</strong> 30 minutes, with a pause button whenever you need it.</p><Link className="a-button" to="/privacy">Privacy information</Link>
    <label className="a-check"><input type="checkbox" checked={settings.sound} onChange={e=>{setSettings({sound:e.target.checked});if(!e.target.checked)stop();}}/> Read aloud and sound</label>
    <label className="a-check"><input type="checkbox" checked={settings.largeText} onChange={e=>setSettings({largeText:e.target.checked})}/> Larger text on menus and books</label>
    <button className="a-button">Save learning settings</button><p role="status">{notice}</p>
  </form>{!settingsOnly && <ParentLearningReport/>}<div className="a-panel"><h2>Archie’s learning helper</h2><p>Built-in help works first. Online help is off until a grown-up enables it on this device.</p><label className="a-check"><input type="checkbox" checked={settings.onlineHelp} onChange={e=>setSettings({onlineHelp:e.target.checked})}/> Allow online learning help</label><p className="a-note">When enabled, wider questions, recent chat and activity context may be sent to the app server and its configured AI provider. Do not include names, contact details or private information. AI answers can be wrong; check important learning with a grown-up. Turning this off keeps built-in maths, spelling and quests available.</p><p className="a-note">Microphone input is optional. Your browser or device speech service may process audio online; check its privacy settings before use.</p><button className="a-button" disabled={checking} onClick={checkConnection}>{checking?'Checking…':'Check AI setup'}</button><p role="status">{connection}</p></div>{!settingsOnly && <><ParentAIResources/></>}<div className="a-panel"><h2>Ask Archie memory on this device</h2><p>{loadSavedLearning().length} saved question-and-answer pairs. These stay in this browser on this device.</p><button className="a-button" onClick={()=>{if(window.confirm('Clear saved Ask Archie questions and answers from this device?')){clearSavedLearning();setNotice('Saved Ask Archie memory has been cleared from this device.');}}}>Clear saved Ask Archie memory</button><p role="status">{notice}</p></div><div className="a-actions"><Link className="a-button" to="/progress?from=parents">View progress</Link><Link className="a-button" to="/lesson">Try the lesson</Link><Link className="a-button" to="/teacher">Teacher lessons by subject and year (including Maths)</Link><Link className="a-button" to="/class">Class lessons</Link></div><p className="a-note">Learning progress stays in this browser. Parent accounts need the configured account server; cross-device learning syncing and payments are not connected.</p></Page></GrownUpGate>;
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
  return <Page title="Ask Archie" intro="Ask a question, try a hint and learn one step at a time." back="/" scene="adventure"><section className="a-panel"><h2>Your learning helper</h2><p>Use the Ask Archie button to open your question box. Built-in hints work without an AI key.</p></section></Page>;
}

export function ArchieArtworkGallery() {
  useLearning('Artwork gallery');
  const [query,setQuery] = useState('');
  const visible = catalog.filter(game=>`${game.title} ${game.subject}`.toLowerCase().includes(query.toLowerCase()));
  return <Page title="Archie's adventure gallery" intro="Explore the artwork and open a game. Every illustration sits beside real, readable learning controls." back="/" scene="adventure">
    <h2>Explore each part of your world</h2>
    <div className="a-grid">{[
      {title:'Home & planet discoveries',route:'/',scene:'science'},
      {title:'Adventure world',route:'/world',scene:'adventure'},
      {title:'Interactive clock lab',route:'/time-lab',scene:'maths'},
      {title:'Learning quests',route:'/quests',scene:'adventure'},
      {title:'Year-long lessons',route:'/courses',scene:'maths'},
      {title:'Spelling lesson',route:'/lesson',scene:'reading'},
      {title:'Books & stories',route:'/library',scene:'reading'},
      {title:'History lessons',route:'/courses?subject=history',scene:'history'},
      {title:'Science lessons',route:'/courses?subject=science',scene:'science'},
      {title:'Homework help',route:'/homework',scene:'reading'},
      {title:'Rewards',route:'/rewards',scene:'rewards'},
      {title:'Sticker book',route:'/stickers',scene:'rewards'},
      {title:'Progress',route:'/progress',scene:'rewards'},
      {title:'Cartoons',route:'/cartoons',scene:'adventure'},
    ].map(page=><Link className="a-card" key={page.title} to={page.route}><SceneArtwork scene={page.scene as LearningScene} title={page.title} compact/><h3>{page.title}</h3><span className="a-play">Explore →</span></Link>)}</div>
    <h2>Every game adventure</h2>
    <label className="a-search"><Search aria-hidden="true"/><input type="search" aria-label="Find game artwork" placeholder="Find a game or subject…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <p role="status">{visible.length} game designs</p>
    <div className="a-grid">{visible.map(game=><Link className="a-card" key={game.id} to={game.route}><SceneArtwork scene={sceneForSubject(game.subject,game.title)} title={game.title} compact/><h2>{game.title}</h2><p>{game.subject} · Ages {game.ageGroups.join(', ')}</p><span className="a-play">Open this game →</span></Link>)}</div>
  </Page>;
}

export function ArchieHistory(){return <Page title="History picture puzzles" back="/" scene="history"><HistoryJigsaw/></Page>;}
