import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import GameShell, { type GameResult } from '@/components/games/GameShell';

// ── Colouring Book — original SVG scenes, no third-party artwork ──────────────
// All shapes drawn in-house. Copyright-free original work.

const PALETTE = [
  { id: 'red',    label: 'Red',    hex: '#EF4444' },
  { id: 'orange', label: 'Orange', hex: '#F97316' },
  { id: 'yellow', label: 'Yellow', hex: '#FACC15' },
  { id: 'green',  label: 'Green',  hex: '#22C55E' },
  { id: 'blue',   label: 'Blue',   hex: '#3B82F6' },
  { id: 'purple', label: 'Purple', hex: '#A855F7' },
  { id: 'pink',   label: 'Pink',   hex: '#EC4899' },
  { id: 'brown',  label: 'Brown',  hex: '#92400E' },
  { id: 'white',  label: 'White',  hex: '#FFFFFF' },
  { id: 'black',  label: 'Black',  hex: '#1F2937' },
];

interface Scene {
  id: string;
  title: string;
  emoji: string;
  regions: Array<{ id: string; label: string; defaultFill: string }>;
  renderSvg: (fills: Record<string, string>, onRegionClick: (id: string) => void) => React.ReactNode;
}

const SCENES: Scene[] = [
  {
    id: 'house',
    title: 'My House',
    emoji: '🏠',
    regions: [
      { id: 'roof',    label: 'Roof',    defaultFill: '#E5E7EB' },
      { id: 'wall',    label: 'Walls',   defaultFill: '#E5E7EB' },
      { id: 'door',    label: 'Door',    defaultFill: '#E5E7EB' },
      { id: 'window1', label: 'Window',  defaultFill: '#E5E7EB' },
      { id: 'window2', label: 'Window',  defaultFill: '#E5E7EB' },
      { id: 'grass',   label: 'Grass',   defaultFill: '#E5E7EB' },
      { id: 'sky',     label: 'Sky',     defaultFill: '#E5E7EB' },
      { id: 'sun',     label: 'Sun',     defaultFill: '#E5E7EB' },
      { id: 'path',    label: 'Path',    defaultFill: '#E5E7EB' },
    ],
    renderSvg: (fills, onClick) => (
      <svg viewBox="0 0 300 260" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
        {/* Sky */}
        <rect id="sky" x="0" y="0" width="300" height="180" fill={fills.sky} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('sky')} />
        {/* Sun */}
        <circle id="sun" cx="255" cy="38" r="28" fill={fills.sun} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('sun')} />
        {/* Grass */}
        <rect id="grass" x="0" y="180" width="300" height="80" fill={fills.grass} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('grass')} />
        {/* Path */}
        <polygon id="path" points="120,260 180,260 165,200 135,200" fill={fills.path} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('path')} />
        {/* Wall */}
        <rect id="wall" x="60" y="130" width="180" height="100" fill={fills.wall} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('wall')} />
        {/* Roof */}
        <polygon id="roof" points="40,135 150,50 260,135" fill={fills.roof} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('roof')} />
        {/* Door */}
        <rect id="door" x="125" y="175" width="50" height="55" rx="4" fill={fills.door} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('door')} />
        <circle cx="168" cy="204" r="4" fill="#374151" />
        {/* Window left */}
        <rect id="window1" x="75" y="150" width="45" height="40" rx="3" fill={fills.window1} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('window1')} />
        <line x1="97" y1="150" x2="97" y2="190" stroke="#374151" strokeWidth="1.5" />
        <line x1="75" y1="170" x2="120" y2="170" stroke="#374151" strokeWidth="1.5" />
        {/* Window right */}
        <rect id="window2" x="180" y="150" width="45" height="40" rx="3" fill={fills.window2} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('window2')} />
        <line x1="202" y1="150" x2="202" y2="190" stroke="#374151" strokeWidth="1.5" />
        <line x1="180" y1="170" x2="225" y2="170" stroke="#374151" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'butterfly',
    title: 'Butterfly',
    emoji: '🦋',
    regions: [
      { id: 'wing_tl', label: 'Top left wing',    defaultFill: '#E5E7EB' },
      { id: 'wing_tr', label: 'Top right wing',   defaultFill: '#E5E7EB' },
      { id: 'wing_bl', label: 'Bottom left wing', defaultFill: '#E5E7EB' },
      { id: 'wing_br', label: 'Bottom right wing',defaultFill: '#E5E7EB' },
      { id: 'body',    label: 'Body',              defaultFill: '#E5E7EB' },
      { id: 'spot_l',  label: 'Left spot',         defaultFill: '#E5E7EB' },
      { id: 'spot_r',  label: 'Right spot',        defaultFill: '#E5E7EB' },
      { id: 'bg',      label: 'Background',        defaultFill: '#E5E7EB' },
    ],
    renderSvg: (fills, onClick) => (
      <svg viewBox="0 0 300 260" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
        {/* Background */}
        <rect id="bg" x="0" y="0" width="300" height="260" fill={fills.bg} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('bg')} />
        {/* Top left wing */}
        <ellipse id="wing_tl" cx="105" cy="105" rx="80" ry="65" fill={fills.wing_tl} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('wing_tl')} />
        {/* Top right wing */}
        <ellipse id="wing_tr" cx="195" cy="105" rx="80" ry="65" fill={fills.wing_tr} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('wing_tr')} />
        {/* Bottom left wing */}
        <ellipse id="wing_bl" cx="110" cy="185" rx="60" ry="45" fill={fills.wing_bl} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('wing_bl')} />
        {/* Bottom right wing */}
        <ellipse id="wing_br" cx="190" cy="185" rx="60" ry="45" fill={fills.wing_br} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('wing_br')} />
        {/* Spots */}
        <circle id="spot_l" cx="105" cy="100" r="18" fill={fills.spot_l} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('spot_l')} />
        <circle id="spot_r" cx="195" cy="100" r="18" fill={fills.spot_r} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('spot_r')} />
        {/* Body */}
        <ellipse id="body" cx="150" cy="145" rx="12" ry="55" fill={fills.body} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('body')} />
        {/* Antennae */}
        <line x1="144" y1="92" x2="120" y2="55" stroke="#374151" strokeWidth="2" />
        <circle cx="118" cy="52" r="5" fill="#374151" />
        <line x1="156" y1="92" x2="180" y2="55" stroke="#374151" strokeWidth="2" />
        <circle cx="182" cy="52" r="5" fill="#374151" />
      </svg>
    ),
  },
  {
    id: 'rocket',
    title: 'Space Rocket',
    emoji: '🚀',
    regions: [
      { id: 'sky',     label: 'Sky',      defaultFill: '#E5E7EB' },
      { id: 'body',    label: 'Rocket body', defaultFill: '#E5E7EB' },
      { id: 'nose',    label: 'Nose cone', defaultFill: '#E5E7EB' },
      { id: 'fin_l',   label: 'Left fin',  defaultFill: '#E5E7EB' },
      { id: 'fin_r',   label: 'Right fin', defaultFill: '#E5E7EB' },
      { id: 'window',  label: 'Window',    defaultFill: '#E5E7EB' },
      { id: 'flame',   label: 'Flame',     defaultFill: '#E5E7EB' },
      { id: 'star1',   label: 'Star',      defaultFill: '#E5E7EB' },
      { id: 'star2',   label: 'Star',      defaultFill: '#E5E7EB' },
      { id: 'star3',   label: 'Star',      defaultFill: '#E5E7EB' },
    ],
    renderSvg: (fills, onClick) => {
      const star = (id: string, cx: number, cy: number, r: number) => {
        const pts = Array.from({ length: 5 }, (_, i) => {
          const a = (i * 72 - 90) * Math.PI / 180;
          const b = (i * 72 - 90 + 36) * Math.PI / 180;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} ${cx + r * 0.4 * Math.cos(b)},${cy + r * 0.4 * Math.sin(b)}`;
        }).join(' ');
        return <polygon key={id} id={id} points={pts} fill={Object.hasOwn(fills, id) ? fills[id as keyof typeof fills] : '#E5E7EB'} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick(id)} />;
      };
      return (
        <svg viewBox="0 0 300 300" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
          <rect id="sky" x="0" y="0" width="300" height="300" fill={fills.sky} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('sky')} />
          {star('star1', 40, 40, 16)}
          {star('star2', 260, 60, 12)}
          {star('star3', 230, 200, 14)}
          {/* Flame */}
          <ellipse id="flame" cx="150" cy="255" rx="22" ry="35" fill={fills.flame} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('flame')} />
          {/* Left fin */}
          <polygon id="fin_l" points="100,220 128,180 128,240" fill={fills.fin_l} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('fin_l')} />
          {/* Right fin */}
          <polygon id="fin_r" points="200,220 172,180 172,240" fill={fills.fin_r} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('fin_r')} />
          {/* Body */}
          <rect id="body" x="128" y="120" width="44" height="120" rx="8" fill={fills.body} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('body')} />
          {/* Nose cone */}
          <polygon id="nose" points="150,40 128,120 172,120" fill={fills.nose} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('nose')} />
          {/* Window */}
          <circle id="window" cx="150" cy="160" r="18" fill={fills.window} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('window')} />
        </svg>
      );
    },
  },
  {
    id: 'fish',
    title: 'Friendly Fish',
    emoji: '🐟',
    regions: [
      { id: 'sea',    label: 'Sea',       defaultFill: '#E5E7EB' },
      { id: 'body',   label: 'Body',      defaultFill: '#E5E7EB' },
      { id: 'tail',   label: 'Tail',      defaultFill: '#E5E7EB' },
      { id: 'fin_t',  label: 'Top fin',   defaultFill: '#E5E7EB' },
      { id: 'fin_b',  label: 'Bottom fin',defaultFill: '#E5E7EB' },
      { id: 'stripe', label: 'Stripe',    defaultFill: '#E5E7EB' },
      { id: 'bubble1',label: 'Bubble',    defaultFill: '#E5E7EB' },
      { id: 'bubble2',label: 'Bubble',    defaultFill: '#E5E7EB' },
      { id: 'seaweed',label: 'Seaweed',   defaultFill: '#E5E7EB' },
    ],
    renderSvg: (fills, onClick) => (
      <svg viewBox="0 0 300 260" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
        <rect id="sea" x="0" y="0" width="300" height="260" fill={fills.sea} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('sea')} />
        {/* Seaweed */}
        <path id="seaweed" d="M40,260 Q30,220 45,190 Q55,160 40,130 Q30,100 45,80" fill="none" stroke={fills.seaweed} strokeWidth="10" strokeLinecap="round" className="cursor-pointer" onClick={() => onClick('seaweed')} />
        {/* Tail */}
        <polygon id="tail" points="220,130 270,100 270,160" fill={fills.tail} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('tail')} />
        {/* Body */}
        <ellipse id="body" cx="145" cy="130" rx="80" ry="50" fill={fills.body} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('body')} />
        {/* Stripe */}
        <ellipse id="stripe" cx="145" cy="130" rx="25" ry="50" fill={fills.stripe} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('stripe')} />
        {/* Top fin */}
        <polygon id="fin_t" points="120,82 145,50 170,82" fill={fills.fin_t} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('fin_t')} />
        {/* Bottom fin */}
        <polygon id="fin_b" points="130,178 145,205 160,178" fill={fills.fin_b} stroke="#374151" strokeWidth="2" className="cursor-pointer" onClick={() => onClick('fin_b')} />
        {/* Eye */}
        <circle cx="88" cy="118" r="12" fill="white" stroke="#374151" strokeWidth="2" />
        <circle cx="88" cy="118" r="6" fill="#374151" />
        <circle cx="91" cy="115" r="2" fill="white" />
        {/* Mouth */}
        <path d="M72,132 Q80,140 88,132" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        {/* Bubbles */}
        <circle id="bubble1" cx="55" cy="100" r="12" fill={fills.bubble1} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('bubble1')} />
        <circle id="bubble2" cx="72" cy="72" r="8" fill={fills.bubble2} stroke="#374151" strokeWidth="1.5" className="cursor-pointer" onClick={() => onClick('bubble2')} />
      </svg>
    ),
  },
];

function ColourBookInner({ onComplete }: { onComplete: (result: GameResult) => void }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = SCENES.at(sceneIndex) ?? SCENES[0]!;

  const defaultFills = Object.fromEntries(scene.regions.map(r => [r.id, r.defaultFill]));
  const [fills, setFills] = useState<Record<string, string>>(defaultFills);
  const [selectedColour, setSelectedColour] = useState(PALETTE.at(4)?.hex ?? '#3B82F6'); // blue default
  const [coloured, setColoured] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleRegionClick = (regionId: string) => {
    if (finished) return;
    const prev = Object.hasOwn(fills, regionId) ? fills[regionId as keyof typeof fills] : undefined;
    if (prev === selectedColour) return;
    const newFills = { ...fills, [regionId]: selectedColour };
    setFills(newFills);
    const newColoured = Object.values(newFills).filter(v => v !== '#E5E7EB').length;
    setColoured(newColoured);
    if (newColoured >= scene.regions.length) {
      setFinished(true);
      onComplete({ score: 100, correct: scene.regions.length, total: scene.regions.length, stars: 3 });
    }
  };

  const handleSceneChange = (idx: number) => {
    setSceneIndex(idx);
    const s = SCENES.at(idx) ?? SCENES[0]!;
    setFills(Object.fromEntries(s.regions.map(r => [r.id, r.defaultFill])));
    setColoured(0);
    setFinished(false);
  };

  const progress = Math.round((coloured / scene.regions.length) * 100);

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-lg mx-auto">
      {/* Scene picker */}
      <div className="flex gap-2 flex-wrap justify-center">
        {SCENES.map((s, i) => (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSceneChange(i)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${i === sceneIndex ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}`}
          >
            {s.emoji} {s.title}
          </motion.button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{coloured} of {scene.regions.length} sections coloured</p>

      {/* SVG canvas */}
      <div className="w-full rounded-2xl overflow-hidden border-4 border-border shadow-lg bg-white">
        {scene.renderSvg(fills, handleRegionClick)}
      </div>

      {/* Colour palette */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PALETTE.map(c => (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.85 }}
            onClick={() => setSelectedColour(c.hex)}
            title={c.label}
            aria-label={`Pick colour: ${c.label}`}
            className={`w-10 h-10 rounded-full border-4 transition-all shadow-sm ${selectedColour === c.hex ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Tap a colour, then tap a section to colour it in!
      </p>
    </div>
  );
}

export default function ColourBookGame() {
  return (
    <>
      <Helmet>
        <title>Colour-In Book — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="A relaxing colour-by-number activity for young learners aged 5–7. Colour beautiful pictures on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/colour-book" />
        <meta property="og:title" content="Colour-In Book — Sodafom" />
        <meta property="og:description" content="A relaxing colour-by-number activity for young learners aged 5–7. Colour beautiful pictures on Sodafom." />
        <meta property="og:url" content="https://sodafom.uk/games/colour-book" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Colour-In Book — Sodafom" />
        <meta name="twitter:description" content="A relaxing colour-by-number activity for young learners aged 5–7. Colour beautiful pictures on Sodafom." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/colour-book#webpage","name":"Colour-In Book — Sodafom","url":"https://sodafom.uk/games/colour-book","description":"A relaxing colour-by-number activity for young learners aged 5–7. Colour beautiful pictures on Sodafom.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Colour-In Book — Sodafom
      </h1>
      <GameShell
        title="Colour-In Book"
        emoji="🎨"
        subject="art"
        ageGroups={['4–6', '5–7']}
      >
        {(onComplete) => (
          <>
            <ColourBookInner onComplete={onComplete} />
          </>
        )}
      </GameShell>
    </>
  );
}
