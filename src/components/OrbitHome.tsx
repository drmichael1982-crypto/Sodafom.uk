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
  const [moving,setMoving]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [selected,setSelected]=useState(2);
  useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(q.matches);if(q.matches)setMoving(false);};q.addEventListener('change',update);return()=>q.removeEventListener('change',update);},[]);
  return <section className="orbit-home" aria-labelledby="orbit-heading">
    <div className="orbit-home-copy"><span className="orbit-eyebrow"><Sparkles size={16} aria-hidden="true"/> Your next discovery starts here</span><h1 id="orbit-heading">Big questions.<br/><em>Brilliant adventures.</em></h1><p>Explore, have a go and learn with Archie. Every small step counts.</p><div className="orbit-home-actions"><Link className="a-button" to="/courses"><Rocket size={20} aria-hidden="true"/> Start a lesson</Link><Link className="a-button orbit-secondary" to="/games">Choose a game</Link></div><span className="orbit-year">Year {settings.year} · England curriculum practice</span></div>
    <div className={`orbit-model ${moving && !reduced ? 'is-moving' : 'is-still'}`} aria-label="Explore the eight planets">
      <div className="orbit-stars" aria-hidden="true"/><div className="orbit-sun" aria-hidden="true"/>
      {PLANETS.map((p,i)=><div className={`home-orbit home-orbit-${i}`} key={p.name} style={{'--orbit-size':`${28+i*8}%`,'--orbit-time':`${20+i*7}s`,'--planet-colour':p.colour} as CSSProperties}><div className="home-orbit-track" aria-hidden="true"/><span className={`home-planet home-planet-${i}`} aria-hidden="true">{i === 2 && <span className="home-moon-orbit"><span className="home-moon"/></span>}</span></div>)}
      <ArchieAvatar year={settings.year} className="orbit-archie"/>
      <button type="button" className="orbit-motion" disabled={reduced} aria-pressed={moving && !reduced} onClick={()=>setMoving(v=>!v)}>{moving && !reduced ? <Pause size={16}/> : <Play size={16}/>} {reduced?'Still planets':moving?'Pause planets':'Move planets'}</button>
    </div>
    <div className="orbit-discovery"><div className="orbit-planet-choices" aria-label="Choose a planet">{PLANETS.map((p,i)=><button type="button" key={p.name} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{p.name}</button>)}</div><p role="status">{PLANETS[selected].fact}</p><p className="orbit-moon-note">The Moon orbits Earth while Earth orbits the Sun.</p><small>A playful model: sizes, distances and orbit speeds are not to scale.</small></div>
  </section>;
}
