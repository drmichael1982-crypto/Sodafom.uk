import { useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Cake, Gift, Save, Sparkles } from 'lucide-react';
import FeaturePageShell from '@/components/FeaturePageShell';
import ArchieCharacter from '@/components/ArchieCharacter';
import { ttsSpeak } from '@/lib/voice-context';
import {
  annualGiftLabel,
  BIRTHDAY_STORAGE_KEY,
  canUseOutfit,
  CHARACTER_OUTFIT_STORAGE_KEY,
  getSavedBirthdayDate,
  type OutfitId,
} from '@/lib/character-outfits';

const CHARACTERS = [
  { id: 'archie', name: 'Archie', image: '' },
  { id: 'mia', name: 'Mia', image: '/assets/cartoon/friends/mia.png' },
  { id: 'toby', name: 'Toby', image: '/assets/cartoon/friends/toby.png' },
  { id: 'bella', name: 'Bella', image: '/assets/cartoon/friends/bella.png' },
  { id: 'penny', name: 'Penny', image: '/assets/cartoon/friends/penny.png' },
  { id: 'soda-bot', name: 'Soda Bot', image: '/assets/cartoon/friends/soda-bot.png' },
] as const;

const COLOURS = [
  { name: 'Sodafom Blue', value: '#2563eb' },
  { name: 'Hero Green', value: '#16a34a' },
  { name: 'Rainbow Purple', value: '#9333ea' },
  { name: 'Brave Red', value: '#dc2626' },
  { name: 'Sunshine Gold', value: '#eab308' },
] as const;
const BADGES = ['🗝️', '⭐', '📚', '🔬', '🌈'] as const;
const ACCESSORIES = ['None', '👑', '🎓', '🕶️', '🎧'] as const;

const OUTFITS: Array<{ id: OutfitId; name: string; description: string; colour: string; badge: string; accessory: string }> = [
  { id: 'everyday-hero', name: 'Everyday Hero', description: 'A colourful everyday learning outfit.', colour: '#2563eb', badge: '🗝️', accessory: 'None' },
  { id: 'annual-signup', name: 'Annual Sign-up Outfit', description: 'A free celebration outfit for every year you are signed up.', colour: '#9333ea', badge: '⭐', accessory: '👑' },
  { id: 'birthday-party', name: 'Birthday Outfit', description: 'A free birthday outfit that unlocks on the child’s birthday.', colour: '#dc2626', badge: '🌈', accessory: '🎓' },
];

interface SavedLook {
  characterId: string;
  outfitId: OutfitId;
  colour: string;
  badge: string;
  accessory: string;
}

function loadLook(): SavedLook {
  const fallback: SavedLook = { characterId: 'archie', outfitId: 'everyday-hero', colour: COLOURS[0].value, badge: BADGES[0], accessory: ACCESSORIES[0] };
  try {
    const parsed = JSON.parse(localStorage.getItem(CHARACTER_OUTFIT_STORAGE_KEY) || '{}') as Partial<SavedLook>;
    return {
      characterId: CHARACTERS.some(character => character.id === parsed.characterId) ? parsed.characterId! : fallback.characterId,
      outfitId: OUTFITS.some(outfit => outfit.id === parsed.outfitId) ? parsed.outfitId! : fallback.outfitId,
      colour: parsed.colour || fallback.colour,
      badge: parsed.badge || fallback.badge,
      accessory: parsed.accessory || fallback.accessory,
    };
  } catch {
    return fallback;
  }
}

export default function ArchieOutfitPage() {
  const initial = useMemo(loadLook, []);
  const birthdayDate = useMemo(() => getSavedBirthdayDate(localStorage.getItem(BIRTHDAY_STORAGE_KEY)), []);
  const [characterId, setCharacterId] = useState(initial.characterId);
  const [outfitId, setOutfitId] = useState<OutfitId>(initial.outfitId);
  const [colour, setColour] = useState(initial.colour);
  const [badge, setBadge] = useState(initial.badge);
  const [accessory, setAccessory] = useState(initial.accessory);
  const [saved, setSaved] = useState(false);
  const selectedCharacter = CHARACTERS.find(character => character.id === characterId) || CHARACTERS[0];
  const birthdayUnlocked = canUseOutfit('birthday-party', birthdayDate);

  const choosePreset = (id: OutfitId) => {
    if (!canUseOutfit(id, birthdayDate)) {
      ttsSpeak('Your birthday outfit unlocks on your birthday.');
      return;
    }
    const outfit = OUTFITS.find(option => option.id === id)!;
    setOutfitId(id);
    setColour(outfit.colour);
    setBadge(outfit.badge);
    setAccessory(outfit.accessory);
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem(CHARACTER_OUTFIT_STORAGE_KEY, JSON.stringify({ characterId, outfitId, colour, badge, accessory }));
    setSaved(true);
    ttsSpeak(`Brilliant choice! ${selectedCharacter.name} and your outfit are saved on this device.`);
  };

  return (
    <>
      <Helmet><title>Characters & Outfits — Sodafom</title></Helmet>
      <FeaturePageShell title="Characters & Outfits" subtitle="Choose a learning character, then pick or customise an outfit." emoji="🎨" accent="from-violet-500 via-fuchsia-600 to-pink-800">
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="relative flex min-h-[410px] items-center justify-center overflow-hidden rounded-[2.5rem] border-4 border-white/80 p-6 shadow-2xl" style={{ background: `radial-gradient(circle, white 0 33%, ${colour} 34% 60%, #0f172a 61% 100%)` }}>
            <Sparkles className="absolute left-6 top-6 text-yellow-300" size={38} />
            <div className="relative rounded-full bg-white/90 p-5 shadow-2xl">
              {selectedCharacter.id === 'archie'
                ? <ArchieCharacter size={260} />
                : <img src={selectedCharacter.image} alt={selectedCharacter.name} className="h-[260px] w-[260px] object-contain" />}
              {accessory !== 'None' && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-7xl drop-shadow-xl" aria-label={`Accessory ${accessory}`}>{accessory}</span>}
              <span className="absolute bottom-16 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white text-3xl shadow-xl" style={{ backgroundColor: colour }} aria-label={`Badge ${badge}`}>{badge}</span>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-5 text-sky-950 shadow-xl">
            <h2 className="text-xl font-black">Choose your character</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CHARACTERS.map(character => (
                <button key={character.id} type="button" onClick={() => { setCharacterId(character.id); setSaved(false); }} aria-pressed={characterId === character.id} className={`rounded-2xl border-2 p-2 font-black ${characterId === character.id ? 'border-sky-900 bg-sky-100' : 'border-slate-200'}`}>
                  {character.id === 'archie' ? <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">🦸</div> : <img src={character.image} alt="" className="mx-auto h-14 w-14 object-contain" />}
                  <span className="mt-1 block text-[11px]">{character.name}</span>
                </button>
              ))}
            </div>

            <h2 className="mt-5 text-xl font-black">Free outfit choices</h2>
            <div className="mt-3 grid gap-2">
              {OUTFITS.map(outfit => {
                const unlocked = canUseOutfit(outfit.id, birthdayDate);
                return (
                  <button key={outfit.id} type="button" disabled={!unlocked} onClick={() => choosePreset(outfit.id)} aria-pressed={outfitId === outfit.id} className={`rounded-2xl border-2 p-3 text-left ${outfitId === outfit.id ? 'border-purple-700 bg-purple-100' : 'border-slate-200'} ${unlocked ? '' : 'cursor-not-allowed opacity-55'}`}>
                    <span className="flex items-center gap-2 font-black">{outfit.id === 'annual-signup' && <Gift size={18} />}{outfit.id === 'birthday-party' && <Cake size={18} />}{outfit.name}</span>
                    <span className="mt-1 block text-xs font-bold text-slate-600">{outfit.id === 'annual-signup' ? annualGiftLabel() : outfit.description}</span>
                    {outfit.id === 'birthday-party' && <span className="mt-1 block text-xs font-black text-pink-700">{birthdayUnlocked ? 'Unlocked today — happy birthday!' : birthdayDate ? 'Unlocks on the saved birthday.' : 'Add a birthday on the Birthday page to unlock it.'}</span>}
                  </button>
                );
              })}
            </div>

            <h2 className="mt-5 text-xl font-black">Customise colour</h2>
            <div className="mt-3 grid gap-2">{COLOURS.map(option => <button key={option.value} type="button" onClick={() => { setColour(option.value); setSaved(false); }} aria-pressed={colour === option.value} className={`flex min-h-12 items-center gap-3 rounded-2xl border-2 px-3 font-black ${colour === option.value ? 'border-sky-900 bg-sky-100' : 'border-slate-200'}`}><span className="h-8 w-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: option.value }} />{option.name}</button>)}</div>
            <h2 className="mt-5 text-xl font-black">Hero badge</h2>
            <div className="mt-2 grid grid-cols-5 gap-2">{BADGES.map(option => <button key={option} type="button" onClick={() => { setBadge(option); setSaved(false); }} aria-pressed={badge === option} className={`aspect-square rounded-2xl border-2 text-3xl ${badge === option ? 'border-purple-700 bg-purple-100' : 'border-slate-200'}`}>{option}</button>)}</div>
            <h2 className="mt-5 text-xl font-black">Accessory</h2>
            <div className="mt-2 grid grid-cols-5 gap-2">{ACCESSORIES.map(option => <button key={option} type="button" onClick={() => { setAccessory(option); setSaved(false); }} aria-pressed={accessory === option} className={`aspect-square rounded-2xl border-2 text-2xl font-black ${accessory === option ? 'border-pink-700 bg-pink-100' : 'border-slate-200'}`}>{option === 'None' ? '×' : option}</button>)}</div>
            <button type="button" onClick={save} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-purple-700 font-black text-white shadow-lg"><Save /> {saved ? 'Character & outfit saved!' : 'Save my choice'}</button>
            <p className="mt-3 text-center text-xs font-bold text-slate-500">Choices are free and save on this device. Nothing is purchased or ordered.</p>
          </section>
        </div>
      </FeaturePageShell>
    </>
  );
}
