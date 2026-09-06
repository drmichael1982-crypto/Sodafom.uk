import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';

// Colour-by-number: each region has a number, user picks the matching colour
const PALETTE = [
  { num: 1, name: 'Red',    hex: '#EF4444' },
  { num: 2, name: 'Blue',   hex: '#3B82F6' },
  { num: 3, name: 'Yellow', hex: '#EAB308' },
  { num: 4, name: 'Green',  hex: '#22C55E' },
  { num: 5, name: 'Orange', hex: '#F97316' },
  { num: 6, name: 'Purple', hex: '#A855F7' },
  { num: 7, name: 'Pink',   hex: '#EC4899' },
  { num: 8, name: 'Brown',  hex: '#92400E' },
];

type Picture = {
  name: string;
  emoji: string;
  regions: { id: string; label: string; correctNum: number; svgPath: string }[];
};

const PICTURES: Picture[] = [
  {
    name: 'Sunshine',
    emoji: '☀️',
    regions: [
      { id: 'sun', label: 'Sun', correctNum: 3, svgPath: 'M 100 100 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0' },
      { id: 'sky', label: 'Sky', correctNum: 2, svgPath: 'M 0 0 L 200 0 L 200 80 L 0 80 Z' },
      { id: 'grass', label: 'Grass', correctNum: 4, svgPath: 'M 0 160 L 200 160 L 200 200 L 0 200 Z' },
    ],
  },
  {
    name: 'Flower',
    emoji: '🌸',
    regions: [
      { id: 'petals', label: 'Petals', correctNum: 7, svgPath: 'M 100 60 Q 130 30 160 60 Q 130 90 100 60 M 100 60 Q 70 30 40 60 Q 70 90 100 60 M 100 60 Q 130 90 100 120 Q 70 90 100 60' },
      { id: 'centre', label: 'Centre', correctNum: 3, svgPath: 'M 100 100 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0' },
      { id: 'stem', label: 'Stem', correctNum: 4, svgPath: 'M 90 120 L 110 120 L 110 180 L 90 180 Z' },
      { id: 'leaf', label: 'Leaf', correctNum: 4, svgPath: 'M 110 150 Q 150 130 160 160 Q 130 170 110 150 Z' },
    ],
  },
  {
    name: 'Rainbow',
    emoji: '🌈',
    regions: [
      { id: 'arc1', label: 'Outer arc', correctNum: 1, svgPath: 'M 10 150 Q 100 10 190 150 Q 175 150 175 150 Q 100 30 25 150 Z' },
      { id: 'arc2', label: 'Middle arc', correctNum: 5, svgPath: 'M 25 150 Q 100 30 175 150 Q 160 150 160 150 Q 100 50 40 150 Z' },
      { id: 'arc3', label: 'Inner arc', correctNum: 3, svgPath: 'M 40 150 Q 100 50 160 150 Q 145 150 145 150 Q 100 65 55 150 Z' },
      { id: 'arc4', label: 'Innermost', correctNum: 2, svgPath: 'M 55 150 Q 100 65 145 150 Q 130 150 130 150 Q 100 80 70 150 Z' },
      { id: 'cloud', label: 'Cloud', correctNum: 8, svgPath: 'M 10 160 L 190 160 L 190 200 L 10 200 Z' },
    ],
  },
];

function ColourLearnGame({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [picIdx] = useState(() => Math.floor(Math.random() * PICTURES.length));
  const pic = PICTURES[picIdx];
  const [filled, setFilled] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<number>(1);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const totalRegions = pic.regions.length;
  const filledCount = Object.keys(filled).length;

  const handleRegionClick = useCallback((regionId: string, correctNum: number) => {
    if (filled[regionId]) return;
    const colour = PALETTE.find(p => p.num === selected);
    if (!colour) return;
    setFilled(f => ({ ...f, [regionId]: colour.hex }));
    const wasCorrect = selected === correctNum;
    if (wasCorrect) setCorrect(c => c + 1);
    if (filledCount + 1 >= totalRegions) {
      setDone(true);
      setTimeout(() => {
        const finalCorrect = wasCorrect ? correct + 1 : correct;
        onComplete({ correct: finalCorrect, total: totalRegions, score: Math.round((finalCorrect / totalRegions) * 100), stars: finalCorrect >= totalRegions ? 3 : finalCorrect >= Math.ceil(totalRegions * 0.6) ? 2 : 1 });
      }, 1500);
    }
  }, [filled, selected, filledCount, totalRegions, correct, onComplete]);

  return (
    <div className="flex flex-col items-center gap-5 p-4 max-w-lg mx-auto">
      <div className="text-center">
        <p className="font-black text-xl text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          {pic.emoji} Colour the {pic.name}!
        </p>
        <p className="text-muted-foreground text-sm mt-1">Pick a colour, then tap a region to fill it in</p>
      </div>

      {/* Colour picker */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PALETTE.map(p => (
          <motion.button
            key={p.num}
            onClick={() => setSelected(p.num)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all ${selected === p.num ? 'border-foreground shadow-lg scale-110' : 'border-transparent'}`}
          >
            <div className="w-9 h-9 rounded-full shadow-md" style={{ background: p.hex }} />
            <span className="text-xs font-bold text-foreground">{p.num}</span>
          </motion.button>
        ))}
      </div>

      {/* SVG canvas */}
      <div className="w-full max-w-xs bg-white rounded-3xl border-2 border-border shadow-xl overflow-hidden">
        <svg viewBox="0 0 200 200" className="w-full h-auto">
          {pic.regions.map(r => (
            <g key={r.id} onClick={() => handleRegionClick(r.id, r.correctNum)} className="cursor-pointer">
              <path
                d={r.svgPath}
                fill={filled[r.id] ?? '#F3F4F6'}
                stroke="#D1D5DB"
                strokeWidth="1.5"
                className="transition-colors duration-300"
              />
              {!filled[r.id] && (
                <text
                  x="100" y="100"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#6B7280"
                  className="pointer-events-none select-none"
                >
                  {r.correctNum}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Region list */}
      <div className="flex flex-wrap gap-2 justify-center">
        {pic.regions.map(r => (
          <div key={r.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${filled[r.id] ? 'border-green-400 bg-green-50 text-green-700' : 'border-border bg-muted text-muted-foreground'}`}>
            {filled[r.id] && <span>✓</span>}
            <span>{r.label}</span>
            {!filled[r.id] && <span className="text-primary">({r.correctNum})</span>}
          </div>
        ))}
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-accent text-accent-foreground font-black text-lg px-6 py-3 rounded-2xl shadow-xl"
        >
          🎨 Beautiful! {correct}/{totalRegions} correct!
        </motion.div>
      )}
    </div>
  );
}

export default function ColourLearnPage() {
  return (
    <>
      <Helmet>
        <title>Colour & Learn — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Colour-by-number learning game for ages 5–7. Combine creativity with learning on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/colour-learn" />
        <meta property="og:title" content="Colour & Learn — Sodafom" />
        <meta property="og:description" content="Colour-by-number learning game for ages 5–7. Combine creativity with learning on Sodafom." />
        <meta property="og:url" content="https://sodafom.uk/games/colour-learn" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Colour & Learn — Sodafom" />
        <meta name="twitter:description" content="Colour-by-number learning game for ages 5–7. Combine creativity with learning on Sodafom." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/colour-learn#webpage","name":"Colour & Learn — Sodafom","url":"https://sodafom.uk/games/colour-learn","description":"Colour-by-number learning game for ages 5–7. Combine creativity with learning on Sodafom.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Colour & Learn — Sodafom
      </h1>
      <GameShell
        title="Colour & Learn"
        emoji="🎨"
        subject="art"
        ageGroups={['5–7']}
      >
        {(onComplete) => <ColourLearnGame onComplete={onComplete} />}
      </GameShell>
    </>
  );
}
