import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { Pause, Play, Rocket, Sparkles } from 'lucide-react';
import ArchieAvatar from '@/components/ArchieAvatar';
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
export default function OrbitHome() {
  const { settings } = useArchieData();
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [moving,setMoving]=useState(false);
  const [placed,setPlaced]=useState<number[]>(()=>Array(8).fill(-1));
  const [piece,setPiece]=useState<number|null>(null);
  const [puzzleNotice,setPuzzleNotice]=useState('Choose a planet piece, then tap its place in the picture.');
  const solved=placed.every((planet,index)=>planet===index);
  function place(index:number){
    if(piece===null){setPuzzleNotice('Choose a planet from the pieces below first.');return;}
    if(piece!==index){setPuzzleNotice(`${PLANETS[piece].name} belongs in position ${piece+1} from the Sun. Try another place.`);return;}
    const next=placed.map((value,i)=>i===index?piece:value);setPlaced(next);setPiece(null);setSelected(index);
    if(next.every((planet,i)=>planet===i)){setMoving(!reduced);setPuzzleNotice(reduced?'Brilliant! You completed the solar system. Your motion preference keeps the picture still.':'Brilliant! All eight planets fit. Watch your solar system come to life!');}
    else setPuzzleNotice(`${PLANETS[index].name} fits! ${next.filter(value=>value>=0).length} of 8 pieces placed.`);
  }
  function resetPuzzle(){setPlaced(Array(8).fill(-1));setPiece(null);setMoving(false);setPuzzleNotice('Choose a planet piece, then tap its place in the picture.');}
  const [selected,setSelected]=useState(2);
  useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(q.matches);if(q.matches)setMoving(false);};q.addEventListener('change',update);return()=>q.removeEventListener('change',update);},[]);
  return <section className="orbit-home" aria-labelledby="orbit-heading">
    <div className="orbit-home-copy"><span className="orbit-eyebrow"><Sparkles size={16} aria-hidden="true"/> Your next discovery starts here</span><h1 id="orbit-heading">Big questions.<br/><em>Brilliant adventures.</em></h1><p>Explore, have a go and learn with Archie. Every small step counts.</p><div className="orbit-home-actions"><Link className="a-button" to="/courses"><Rocket size={20} aria-hidden="true"/> Start a lesson</Link><Link className="a-button orbit-secondary" to="/games">Choose a game</Link></div><span className="orbit-year">Year {settings.year} · England curriculum practice</span></div>
    <div className={`orbit-model ${moving && !reduced ? 'is-moving' : 'is-still'}`} aria-label="Explore the eight planets">
      <div className="orbit-stars" aria-hidden="true"/><div className="orbit-sun" aria-hidden="true"/>
      {PLANETS.map((p,i)=><div className={`home-orbit home-orbit-${i}`} key={p.name} style={{'--orbit-size':`${28+i*8}%`,'--orbit-time':`${20+i*7}s`,'--planet-colour':p.colour} as CSSProperties}><div className="home-orbit-track" aria-hidden="true"/><span className={`home-planet home-planet-${i}`} aria-hidden="true">{i === 2 && <span className="home-moon-orbit"><span className="home-moon"/></span>}</span></div>)}
      <ArchieAvatar year={settings.year} className="orbit-archie"/>
      <button type="button" className="orbit-motion" disabled={reduced||!solved} aria-pressed={moving && !reduced} onClick={()=>setMoving(v=>!v)}>{moving && !reduced ? <Pause size={16}/> : <Play size={16}/>} {reduced?'Still planets':!solved?'Finish the jigsaw to move planets':moving?'Pause planets':'Move planets'}</button>
    </div>
    <section className="planet-jigsaw" aria-labelledby="planet-jigsaw-title">
      <div className="planet-jigsaw-heading"><div><h2 id="planet-jigsaw-title">Build your planet jigsaw</h2><p>Start nearest the Sun. Choose a piece, then tap its matching space. Fit all eight to start the planets moving.</p></div><span className="planet-puzzle-progress">{placed.filter(value=>value>=0).length} / 8</span></div>
      <div className="planet-jigsaw-board" aria-label="Solar system puzzle spaces"><span className="puzzle-sun" aria-hidden="true">☀</span>{PLANETS.map((planet,index)=><button className={`planet-puzzle-slot ${placed[index]===index?'piece-placed':''}`} key={planet.name} type="button" aria-label={`Place in position ${index+1}: ${planet.name}`} disabled={placed[index]===index} onClick={()=>place(index)}>
        <span className="puzzle-position">{index+1}</span>{placed[index]===index?<span className={`planet-swatch home-planet-${index}`} aria-hidden="true"/>:<span className="planet-empty-shape" aria-hidden="true">?</span>}<span>{planet.name}</span>{placed[index]===index&&<span className="planet-fit" aria-hidden="true">✓</span>}
      </button>)}</div>
      <div className="planet-jigsaw-pieces" aria-label="Choose a planet puzzle piece">{[3,6,0,4,2,7,1,5].map(index=><button key={index} className="planet-loose-piece" type="button" aria-label={`Pick up ${PLANETS[index].name}`} aria-pressed={piece===index} disabled={placed.includes(index)} onClick={()=>{setPiece(index);setSelected(index);setPuzzleNotice(`${PLANETS[index].name} selected. Choose its place from the Sun.`);}}><span className={`planet-swatch home-planet-${index}`} aria-hidden="true"/><span>{PLANETS[index].name}</span></button>)}</div>
      <p className="planet-puzzle-notice" aria-live="polite">{puzzleNotice}</p><button type="button" className="planet-puzzle-reset" onClick={resetPuzzle}>Start the jigsaw again</button>
    </section>
    <div className="orbit-discovery"><div className="orbit-planet-choices" aria-label="Choose a planet">{PLANETS.map((p,i)=><button type="button" key={p.name} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span className={`planet-swatch home-planet-${i}`} aria-hidden="true"/>{p.name}</button>)}</div><p role="status">{PLANETS[selected].fact}</p><p className="orbit-moon-note">The Moon orbits Earth while Earth orbits the Sun.</p><small>A playful model: sizes, distances and orbit speeds are not to scale.</small></div>
  </section>;
}
