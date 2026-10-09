import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Pause, Play, Rocket, Sparkles } from 'lucide-react';
import ArchieAvatar from '@/components/ArchieAvatar';
import PlanetGlobe from './PlanetGlobe';
import { useArchieData } from '@/lib/archie/storage';
import './orbit-home.css';

const PLANETS = [
  {name:'Mercury',colour:'#ada7a0',fact:'Mercury is the closest planet to the Sun.'},
  {name:'Venus',colour:'#e7c582',fact:'Venus has a very hot surface and a thick atmosphere.'},
  {name:'Earth',colour:'#50b9de',fact:'Earth is our home, with oceans and living things.'},
  {name:'Mars',colour:'#e88362',fact:'Mars is a rocky planet often called the Red Planet.'},
  {name:'Jupiter',colour:'#dcbb97',fact:'Jupiter is the largest planet in our Solar System.'},
  {name:'Saturn',colour:'#edce89',fact:'Saturn has bright rings made of ice and rock.'},
  {name:'Uranus',colour:'#92dce4',fact:'Uranus rotates on its side compared with most planets.'},
  {name:'Neptune',colour:'#537be7',fact:'Neptune is the farthest planet from the Sun.'},
];
export default function OrbitHome({ autoStart = false }: { autoStart?: boolean }) {
  const { settings } = useArchieData();
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [moving,setMoving]=useState(()=>autoStart&&!reduced);
  const [expanded,setExpanded]=useState(false);
  const [buildingFullPage,setBuildingFullPage]=useState(false);
  const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!expanded&&!buildingFullPage)return;const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';closeRef.current?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setExpanded(false);setBuildingFullPage(false);}if(event.key==='Tab'){const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.orbit-completion button:not(:disabled), .orbit-puzzle-full button:not(:disabled)'));const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.isConnected&&previous.focus();};},[expanded,buildingFullPage]);
  const [placed,setPlaced]=useState<number[]>(()=>Array(8).fill(-1));
  const [piece,setPiece]=useState<number|null>(null);
  const [puzzleNotice,setPuzzleNotice]=useState('Choose a planet piece, then tap its place in the picture.');
  const solved=placed.every((planet,index)=>planet===index);
  function place(index:number){
    if(piece===null){setPuzzleNotice('Choose a planet from the pieces below first.');return;}
    if(piece!==index){setPuzzleNotice(`${PLANETS[piece].name} belongs in position ${piece+1} from the Sun. Try another place.`);return;}
    const next=placed.map((value,i)=>i===index?piece:value);setPlaced(next);setPiece(null);setSelected(index);
    if(next.every((planet,i)=>planet===i)){setMoving(!reduced);setBuildingFullPage(false);setExpanded(true);setPuzzleNotice(reduced?'Brilliant! You completed the solar system. Your motion preference keeps the picture still.':'Brilliant! All eight planets fit. Watch your solar system come to life!');}
    else setPuzzleNotice(`${PLANETS[index].name} fits! ${next.filter(value=>value>=0).length} of 8 pieces placed. ${PLANETS[index].fact}`);
  }
  function resetPuzzle(){setExpanded(false);setPlaced(Array(8).fill(-1));setPiece(null);setMoving(autoStart&&!reduced);setPuzzleNotice('Choose a planet piece, then tap its place in the picture.');}
  const [selected,setSelected]=useState(2);
  useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(q.matches);if(q.matches)setMoving(false);};q.addEventListener('change',update);return()=>q.removeEventListener('change',update);},[]);
  const planetModel = <div className={`orbit-model ${moving && !reduced ? 'is-moving' : 'is-still'}`} aria-label="Explore the eight planets">
      <div className="orbit-stars" aria-hidden="true"/><div className="orbit-sun" aria-hidden="true"/>
      {PLANETS.map((p,i)=><div className={`home-orbit home-orbit-${i}`} key={p.name} style={{'--orbit-size':`${28+i*8}%`,'--orbit-time':`${20+i*7}s`,'--planet-colour':p.colour} as CSSProperties}><div className="home-orbit-track" aria-hidden="true"/><span className={`home-planet home-planet-${i}`} aria-hidden="true"><PlanetGlobe index={i} moving={moving&&!reduced}/>{i === 2 && <span className="home-moon-orbit"><span className="home-moon"/></span>}{expanded&&<span className="home-planet-name">{p.name}</span>}</span></div>)}
      {!expanded&&<ArchieAvatar year={settings.year} className="orbit-archie"/>}
      <button type="button" className="orbit-motion" disabled={reduced||buildingFullPage||(!autoStart&&!solved)} aria-pressed={moving && !reduced} onClick={()=>setMoving(v=>!v)}>{moving && !reduced ? <Pause size={16}/> : <Play size={16}/>} {reduced?'Still planets':(buildingFullPage||!autoStart&&!solved)?'Finish the jigsaw to move planets':moving?'Pause planets':'Move planets'}</button>
    </div>;
  const planetDiscovery = <div className="orbit-discovery"><div className="orbit-planet-choices" aria-label="Choose a planet">{PLANETS.map((p,i)=><button type="button" key={p.name} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span className={`planet-swatch home-planet-${i}`} aria-hidden="true"><PlanetGlobe index={i}/></span>{p.name}</button>)}</div><p role="status">{PLANETS[selected].fact}</p><p className="orbit-moon-note">The Moon orbits Earth while Earth orbits the Sun.</p><small>A playful model: sizes, distances and orbit speeds are not to scale.</small></div>;
  if(expanded)return createPortal(<section className="orbit-completion" role="dialog" aria-modal="true" aria-labelledby="solar-reward-title">
    <header><div><span className="solar-complete-badge">8 / 8 pieces fit!</span><h1 id="solar-reward-title">Your solar system is alive!</h1></div><button ref={closeRef} type="button" onClick={()=>setExpanded(false)}>Back to puzzle</button></header>
    {planetModel}{planetDiscovery}
    <button className="planet-puzzle-reset" type="button" onClick={resetPuzzle}>Start the jigsaw again</button>
  </section>,document.body);
  const puzzlePanel = <section className="planet-jigsaw" aria-labelledby="planet-jigsaw-title">{solved&&<button type="button" className="planet-puzzle-reset" onClick={()=>setExpanded(true)}>See my full-page solar system</button>}
      {!buildingFullPage&&<button type="button" className="planet-puzzle-reset" onClick={()=>{setMoving(false);setBuildingFullPage(true);}}>Build my full-screen space jigsaw</button>}
      <div className="planet-jigsaw-heading"><div><h2 id="planet-jigsaw-title">Build your planet jigsaw</h2><p>Start nearest the Sun. Choose a piece, then tap its matching space. {autoStart ? 'Fit all eight to unlock your full-page solar system.' : 'Fit all eight to start the planets moving.'}</p></div><span className="planet-puzzle-progress" aria-label="Planet puzzle progress">{placed.filter(value=>value>=0).length} / 8</span></div>
      <div className="planet-jigsaw-board" aria-label="Solar system puzzle spaces">{buildingFullPage&&planetModel}<span className="puzzle-sun" aria-hidden="true">☀</span>{PLANETS.map((planet,index)=><button className={`planet-puzzle-slot planet-picture-piece ${placed[index]===index?'piece-placed':''}`} key={planet.name} type="button" aria-label={`Place in position ${index+1}: ${planet.name}`} disabled={placed[index]===index} onClick={()=>place(index)}>
        <span className="puzzle-position">{index+1}</span>{placed[index]===index?<span className={`planet-swatch home-planet-${index}`} aria-hidden="true"><PlanetGlobe index={index}/></span>:<span className="planet-empty-shape" aria-hidden="true">?</span>}<span>{planet.name}</span>{placed[index]===index&&<span className="planet-fit" aria-hidden="true">✓</span>}
      </button>)}</div>
      <div className="planet-jigsaw-pieces" aria-label="Choose a planet puzzle piece">{[3,6,0,4,2,7,1,5].map(index=><button key={index} className="planet-loose-piece planet-picture-piece" type="button" aria-label={`Pick up ${PLANETS[index].name}`} aria-pressed={piece===index} disabled={placed.includes(index)} onClick={()=>{setPiece(index);setSelected(index);setPuzzleNotice(`${PLANETS[index].name} selected. Choose its place from the Sun.`);}}><span className={`planet-swatch home-planet-${index}`} aria-hidden="true"><PlanetGlobe index={index}/></span><span>{PLANETS[index].name}</span></button>)}</div>
      <p className="planet-puzzle-notice" aria-live="polite">{puzzleNotice}</p><div className="planet-action-row">{piece!==null&&<button type="button" className="planet-puzzle-reset" onClick={()=>{setPiece(null);setPuzzleNotice('Choose a planet piece, then tap its place in the picture.');}}>Choose a different piece</button>}<button type="button" className="planet-puzzle-reset" onClick={resetPuzzle}>Start the jigsaw again</button></div>
    </section>;
  if(buildingFullPage)return createPortal(<section className="orbit-puzzle-full" role="dialog" aria-modal="true" aria-label="Full-screen solar system jigsaw"><header><h1>Build your solar system</h1><button ref={closeRef} type="button" onClick={()=>setBuildingFullPage(false)}>Back to app</button></header>{puzzlePanel}</section>,document.body);
  return <section className="orbit-home planet-picture-game" aria-labelledby="orbit-heading">
    <div className="orbit-home-copy"><span className="orbit-eyebrow"><Sparkles size={16} aria-hidden="true"/> Your next discovery starts here</span><h1 id="orbit-heading">Big questions.<br/><em>Brilliant adventures.</em></h1><p>Explore, have a go and learn with Archie. Every small step counts.</p><div className="orbit-home-actions"><Link className="a-button" to="/courses"><Rocket size={20} aria-hidden="true"/> Start a lesson</Link><Link className="a-button orbit-secondary" to="/games">Choose a game</Link></div><span className="orbit-year">Year {settings.year} · England curriculum practice</span></div>
    {planetModel}
    {puzzlePanel}
    {planetDiscovery}
  </section>;
}
