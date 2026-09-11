import { useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Save, Sparkles } from 'lucide-react';
import FeaturePageShell from '@/components/FeaturePageShell';
import ArchieCharacter from '@/components/ArchieCharacter';
import { ttsSpeak } from '@/lib/voice-context';

const OUTFIT_KEY = 'sodafom_archie_outfit_v1';
const COLOURS = [
  { name: 'Sodafom Blue', value: '#2563eb' },
  { name: 'Hero Green', value: '#16a34a' },
  { name: 'Rainbow Purple', value: '#9333ea' },
  { name: 'Brave Red', value: '#dc2626' },
  { name: 'Sunshine Gold', value: '#eab308' },
] as const;
const BADGES = ['🗝️', '⭐', '📚', '🔬', '🌈'] as const;
const ACCESSORIES = ['None', '👑', '🎓', '🕶️', '🎧'] as const;

interface Outfit { colour: string; badge: string; accessory: string }

function loadOutfit(): Outfit {
  try {
    const parsed = JSON.parse(localStorage.getItem(OUTFIT_KEY) || '{}') as Partial<Outfit>;
    return { colour: parsed.colour || COLOURS[0].value, badge: parsed.badge || BADGES[0], accessory: parsed.accessory || ACCESSORIES[0] };
  } catch {
    return { colour: COLOURS[0].value, badge: BADGES[0], accessory: ACCESSORIES[0] };
  }
}

export default function ArchieOutfitPage() {
  const initial = useMemo(loadOutfit, []);
  const [colour, setColour] = useState(initial.colour);
  const [badge, setBadge] = useState(initial.badge);
  const [accessory, setAccessory] = useState(initial.accessory);
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(OUTFIT_KEY, JSON.stringify({ colour, badge, accessory }));
    setSaved(true);
    ttsSpeak('Brilliant design! Your Archie outfit idea is saved on this device.');
  };

  return (
    <>
      <Helmet><title>Design Archie&apos;s Outfit — Sodafom</title></Helmet>
      <FeaturePageShell title="Design Archie's Outfit" subtitle="Mix colours, badges and accessories to create an outfit idea." emoji="🎨" accent="from-violet-500 via-fuchsia-600 to-pink-800">
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="relative flex min-h-[410px] items-center justify-center overflow-hidden rounded-[2.5rem] border-4 border-white/80 p-6 shadow-2xl" style={{ background: `radial-gradient(circle, white 0 33%, ${colour} 34% 60%, #0f172a 61% 100%)` }}>
            <Sparkles className="absolute left-6 top-6 text-yellow-300" size={38} />
            <div className="relative rounded-full bg-white/90 p-5 shadow-2xl">
              <ArchieCharacter size={260} />
              {accessory !== 'None' && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-7xl drop-shadow-xl" aria-label={`Accessory ${accessory}`}>{accessory}</span>}
              <span className="absolute bottom-16 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white text-3xl shadow-xl" style={{ backgroundColor: colour }} aria-label={`Badge ${badge}`}>{badge}</span>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-5 text-sky-950 shadow-xl">
            <h2 className="text-xl font-black">Outfit colour</h2>
            <div className="mt-3 grid gap-2">{COLOURS.map(option => <button key={option.value} type="button" onClick={() => { setColour(option.value); setSaved(false); }} aria-pressed={colour === option.value} className={`flex min-h-12 items-center gap-3 rounded-2xl border-2 px-3 font-black ${colour === option.value ? 'border-sky-900 bg-sky-100' : 'border-slate-200'}`}><span className="h-8 w-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: option.value }} />{option.name}</button>)}</div>
            <h2 className="mt-5 text-xl font-black">Hero badge</h2>
            <div className="mt-2 grid grid-cols-5 gap-2">{BADGES.map(option => <button key={option} type="button" onClick={() => { setBadge(option); setSaved(false); }} aria-pressed={badge === option} className={`aspect-square rounded-2xl border-2 text-3xl ${badge === option ? 'border-purple-700 bg-purple-100' : 'border-slate-200'}`}>{option}</button>)}</div>
            <h2 className="mt-5 text-xl font-black">Accessory</h2>
            <div className="mt-2 grid grid-cols-5 gap-2">{ACCESSORIES.map(option => <button key={option} type="button" onClick={() => { setAccessory(option); setSaved(false); }} aria-pressed={accessory === option} className={`aspect-square rounded-2xl border-2 text-2xl font-black ${accessory === option ? 'border-pink-700 bg-pink-100' : 'border-slate-200'}`}>{option === 'None' ? '×' : option}</button>)}</div>
            <button type="button" onClick={save} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-purple-700 font-black text-white shadow-lg"><Save /> {saved ? 'Outfit saved!' : 'Save my design'}</button>
            <p className="mt-3 text-center text-xs font-bold text-slate-500">This saves an outfit idea on this device. It does not buy or order clothing.</p>
          </section>
        </div>
      </FeaturePageShell>
    </>
  );
}
