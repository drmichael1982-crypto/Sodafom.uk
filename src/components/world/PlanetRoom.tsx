import { useId, useState } from 'react';
import { PLANETS, orbitPosition, progradeDegrees } from './planet-motion';
import { usePlanetMotion } from './usePlanetMotion';
import './planet-motion.css';

/** North-pole icon. Marks show spin, not a geographical map or an axial tilt. */
function EarthDisc({ degrees, radius }: { degrees: number; radius: number }) {
  return <g>
    <circle r={radius} fill="#249fe5" stroke="#b9f3ff" strokeWidth={radius * .06} />
    <g transform={`rotate(${degrees})`}>
      <path d={`M ${radius * .1} ${-radius * .7} Q ${radius * .8} ${-radius * .5} ${radius * .5} ${radius * .1} L ${radius * .15} ${radius * .25} L ${-radius * .1} ${-radius * .3} Z`} fill="#77d9a3" />
      <path d={`M ${-radius * .75} ${radius * .1} Q ${-radius * .25} ${-radius * .1} ${-radius * .2} ${radius * .7} Q ${-radius * .7} ${radius * .5} ${-radius * .75} ${radius * .1}`} fill="#77d9a3" />
      <line x1="0" y1="0" x2={radius * .8} y2="0" stroke="#fff" strokeWidth={radius * .05} />
      <circle cx={radius * .8} r={radius * .08} fill="#fff" />
    </g>
    <circle r={radius * .12} fill="#effcff" />
  </g>;
}

export default function PlanetRoom() {
  const uid = useId().replace(/:/g, '');
  const motion = usePlanetMotion();
  const [selected, setSelected] = useState<string>('Earth');
  const planet = PLANETS.find(item => item.name === selected)!;
  const earthSpin = progradeDegrees(motion.seconds, 8);

  return <main className="planet-room">
    <header className="planet-room__header">
      <a className="planet-room__back" href="/cartoon-mode">← Back to adventure</a>
      <p className="planet-room__eyebrow">Sodafom · Space explorers · Animated diagram</p>
      <h1>The Planet Room</h1>
      <p>A spinning star. Eight travelling planets. One amazing solar system.</p>
    </header>

    <div className="planet-room__controls" aria-label="Animation controls">
      <button type="button" onClick={() => motion.setPlaying(!motion.playing)}>{motion.playing ? 'Pause motion' : 'Play motion'}</button>
      <label htmlFor={`${uid}-speed`}>Speed</label>
      <select id={`${uid}-speed`} value={motion.speed} onChange={event => motion.setSpeed(Number(event.target.value))}>
        <option value="0.5">Gentle · ½×</option><option value="1">Normal · 1×</option><option value="2">Faster · 2×</option>
      </select>
      <button type="button" className="planet-room__secondary" onClick={() => { motion.setPlaying(false); motion.setSeconds(0); }}>Reset</button>
    </div>
    {motion.reducedMotion && <p className="planet-room__motion-note">Motion starts paused for your reduced-motion setting. Press Play if you want to explore the animation.</p>}

    <section className="planet-room__stage" aria-label="Solar system room">
      <div className="planet-room__view-label">Looking down from the north side of the solar system</div>
      <svg className="planet-room__scene" viewBox="0 0 900 860" role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
        <title id={`${uid}-title`}>Eight planets orbit a spinning Sun in the middle of the room</title>
        <desc id={`${uid}-desc`}>Planets travel counterclockwise. Earth's own spin is counterclockwise when viewed from its north pole. Planet sizes, distances, shapes and speeds are simplified for teaching.</desc>
        <defs>
          <radialGradient id={`${uid}-sun`}><stop stopColor="#fff5b3" /><stop offset=".65" stopColor="#ffd369" /><stop offset="1" stopColor="#ff9b43" /></radialGradient>
          <radialGradient id={`${uid}-glow`}><stop stopColor="#ffa94a" stopOpacity=".24" /><stop offset="1" stopColor="#ffa94a" stopOpacity="0" /></radialGradient>
        </defs>
        <g aria-hidden="true">
          {Array.from({ length: 38 }, (_, index) => <circle key={index} cx={30 + (index * 137) % 845} cy={22 + (index * 193) % 802} r={index % 3 ? 1.3 : 2.2} fill="#dce7ff" opacity=".45" />)}
          <path d="M 20 80 L 75 130 L 75 745 L 20 815 M 880 80 L 825 130 L 825 745 L 880 815 M 75 745 H 825" fill="none" stroke="#91a6ef" strokeOpacity=".16" strokeWidth="2" />
          <g transform="translate(450 430)">
            <circle r="98" fill={`url(#${uid}-glow)`} />
            {PLANETS.map(item => <circle key={item.name} r={item.radius} fill="none" stroke={selected === item.name ? '#a8d9ff' : '#7188c6'} strokeOpacity={selected === item.name ? .8 : .28} strokeWidth={selected === item.name ? 2 : 1} />)}
            <g transform={`rotate(${progradeDegrees(motion.seconds, 26)})`}>
              {Array.from({ length: 12 }, (_, index) => <path key={index} d="M 0 -47 L 0 -53" transform={`rotate(${index * 30})`} stroke="#ffc96c" strokeWidth="3" strokeLinecap="round" />)}
              <circle r="40" fill={`url(#${uid}-sun)`} />
              <circle cx="17" cy="-12" r="5" fill="#db762f" opacity=".65" />
              <ellipse cx="-18" cy="9" rx="4" ry="7" fill="#db762f" opacity=".55" />
            </g>
            <text y="65" textAnchor="middle" className="planet-room__sun-label">Sun</text>
            {PLANETS.map(item => {
              const point = orbitPosition(motion.seconds, item.radius, item.period, item.phase);
              return <g key={item.name} transform={`translate(${point.x} ${point.y})`}>
                {selected === item.name && <circle r={item.size + 6} fill="none" stroke="#e2f3ff" strokeWidth="1.5" />}
                {item.name === 'Saturn' && <ellipse rx="29" ry="8" fill="none" stroke="#e7ce9e" strokeWidth="5" transform="rotate(-20)" />}
                {item.name === 'Earth' ? <EarthDisc degrees={earthSpin} radius={item.size} /> : <circle r={item.size} fill={item.color} />}
                {item.name === 'Jupiter' && <><path d="M -17 -9 Q 0 -4 17 -9 M -19 5 Q 0 11 19 5" fill="none" stroke="#a87760" strokeWidth="4" /><ellipse cx="7" cy="10" rx="5" ry="3" fill="#af6550" /></>}
                <text y={item.size + 23} textAnchor="middle" className="planet-room__planet-label">{item.name}</text>
              </g>;
            })}
          </g>
          <text x="450" y="828" textAnchor="middle" className="planet-room__diagram-note">Follow an orbit. Watch Earth spin as it travels.</text>
        </g>
      </svg>
    </section>

    <section className="planet-room__explore" aria-labelledby={`${uid}-explore`}>
      <h2 id={`${uid}-explore`}>Choose a planet</h2>
      <div className="planet-room__choices">{PLANETS.map(item => <button type="button" key={item.name} aria-pressed={selected === item.name} onClick={() => setSelected(item.name)}><span style={{ backgroundColor: item.color }} aria-hidden="true" />{item.name}</button>)}</div>
      <p className="planet-room__fact" aria-live="polite"><strong>{planet.name}:</strong> {planet.fact}</p>
    </section>

    <section className="planet-room__earth" aria-labelledby={`${uid}-earth`}>
      <svg viewBox="0 0 180 180" role="img" aria-label="Earth spinning counterclockwise, seen from above its north pole; coloured marks are illustrative">
        <g transform="translate(90 90)"><EarthDisc degrees={earthSpin} radius={52} /><path d="M 70 0 A 70 70 0 0 0 0 -70" fill="none" stroke="#d4ecff" strokeWidth="3" /><path d="M 9 -77 L 0 -70 L 9 -63" fill="none" stroke="#d4ecff" strokeWidth="3" /><text textAnchor="middle" y="5" fill="#10294d" fontSize="13" fontWeight="800">N</text></g>
      </svg>
      <div><h2 id={`${uid}-earth`}>Earth has two moves</h2><p><strong>Spin:</strong> Earth turns west to east. From above the North Pole, that looks counterclockwise.</p><p><strong>Orbit:</strong> Earth travels around the Sun. From the north side of the solar system, that also looks counterclockwise.</p></div>
    </section>

    <footer className="planet-room__note"><p>This is a teaching illustration. Sizes, distances and speeds are not to scale. The orbits are shown as circles; real orbits are ellipses. Earth’s coloured marks show rotation, not a map. Axial tilts and the Sun’s different rotation rates at different latitudes are not shown.</p><p>Explore with <a href="https://science.nasa.gov/solar-system/planets/">NASA’s planet guide</a>.</p></footer>
  </main>;
}
