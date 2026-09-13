import { useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Cake, Gift, Save, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';
import {
  annualGiftLabel,
  BIRTHDAY_STORAGE_KEY,
  canUseOutfit,
  CHARACTER_OUTFIT_STORAGE_KEY,
  getSavedBirthdayDate,
  getSavedLook,
  LEGACY_ARCHIE_OUTFIT_STORAGE_KEY,
  type CharacterId,
  type OutfitId,
} from '@/lib/character-outfits';

const CHARACTERS: Array<{ id: CharacterId; name: string; image?: string }> = [
  { id: 'archie', name: 'Archie' },
  { id: 'mia', name: 'Mia', image: '/assets/cartoon/friends/mia.png' },
  { id: 'toby', name: 'Toby', image: '/assets/cartoon/friends/toby.png' },
  { id: 'bella', name: 'Bella', image: '/assets/cartoon/friends/bella.png' },
  { id: 'penny', name: 'Penny', image: '/assets/cartoon/friends/penny.png' },
  { id: 'soda-bot', name: 'Soda Bot', image: '/assets/cartoon/friends/soda-bot.png' },
];

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

function readLocalValue(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalValue(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function CharacterPreview({ characterId, name, image }: { characterId: CharacterId; name: string; image?: string }) {
  if (characterId === 'archie') return <ArchieCharacter size={250} />;

  return <img src={image} alt={name} className="h-[250px] w-[250px] object-contain" />;
}

export default function ArchieOutfitPage() {
  const initial = useMemo(
    () => getSavedLook(
      readLocalValue(CHARACTER_OUTFIT_STORAGE_KEY),
      readLocalValue(LEGACY_ARCHIE_OUTFIT_STORAGE_KEY),
    ),
    [],
  );
  const birthdayDate = useMemo(() => getSavedBirthdayDate(readLocalValue(BIRTHDAY_STORAGE_KEY)), []);
  const [characterId, setCharacterId] = useState<CharacterId>(initial.characterId);
  const [outfitId, setOutfitId] = useState<OutfitId>(initial.outfitId);
  const [colour, setColour] = useState(initial.colour);
  const [badge, setBadge] = useState(initial.badge);
  const [accessory, setAccessory] = useState(initial.accessory);
  const [status, setStatus] = useState('Choose a character and a free outfit.');

  const selectedCharacter = CHARACTERS.find(character => character.id === characterId) ?? CHARACTERS[0];
  const birthdayUnlocked = canUseOutfit('birthday-party', birthdayDate);

  const markUnsaved = () => setStatus('Your choice has changed. Save it on this device when you are ready.');

  const choosePreset = (id: OutfitId) => {
    if (!canUseOutfit(id, birthdayDate)) {
      setStatus('Your birthday outfit unlocks on your birthday.');
      return;
    }

    const outfit = OUTFITS.find(option => option.id === id);
    if (!outfit) return;

    setOutfitId(outfit.id);
    setColour(outfit.colour);
    setBadge(outfit.badge);
    setAccessory(outfit.accessory);
    markUnsaved();
  };

  const save = () => {
    const saved = writeLocalValue(CHARACTER_OUTFIT_STORAGE_KEY, JSON.stringify({
      characterId,
      outfitId,
      colour,
      badge,
      accessory,
    }));

    setStatus(saved
      ? `${selectedCharacter.name} and your outfit are saved on this device.`
      : 'This browser could not save your choice. You can still keep playing.');
  };

  return (
    <>
      <Helmet><title>Characters & Outfits — Sodafom</title></Helmet>
      <main className="min-h-screen bg-gradient-to-br from-violet-100 via-fuchsia-50 to-sky-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-full bg-white px-4 font-black text-violet-800 shadow-sm ring-2 ring-violet-200 transition hover:bg-violet-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-600">
            ← Back to home
          </Link>

          <header className="mt-5 rounded-[2rem] bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-600 px-6 py-8 text-white shadow-xl sm:px-10">
            <p className="text-4xl" aria-hidden="true">🎨</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Characters &amp; Outfits</h1>
            <p className="mt-2 max-w-2xl text-base font-semibold text-white/90">Choose a learning character, then pick or customise a free outfit. Your choices stay on this device.</p>
          </header>

          <p className="sr-only" aria-live="polite">{status}</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <section aria-label="Your character preview" className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white/80 p-6 shadow-xl" style={{ background: `radial-gradient(circle, white 0 30%, ${colour} 31% 59%, #18233f 60% 100%)` }}>
              <Sparkles className="absolute left-6 top-6 text-yellow-200" size={38} aria-hidden="true" />
              <div className="relative rounded-full bg-white/90 p-5 shadow-2xl">
                <CharacterPreview {...selectedCharacter} characterId={characterId} />
                {accessory !== 'None' && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-7xl drop-shadow-xl" aria-label={`Accessory ${accessory}`}>{accessory}</span>}
                <span className="absolute bottom-16 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white text-3xl shadow-xl" style={{ backgroundColor: colour }} aria-label={`Badge ${badge}`}>{badge}</span>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-5 shadow-xl sm:p-7">
              <fieldset>
                <legend className="text-xl font-black">Choose your character</legend>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {CHARACTERS.map(character => (
                    <button key={character.id} type="button" onClick={() => { setCharacterId(character.id); markUnsaved(); }} aria-pressed={characterId === character.id} className={`min-h-24 rounded-2xl border-2 p-2 font-black transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-600 ${characterId === character.id ? 'border-violet-700 bg-violet-100' : 'border-slate-200 hover:border-violet-300'}`}>
                      {character.id === 'archie'
                        ? <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl" aria-hidden="true">⭐</span>
                        : <img src={character.image} alt="" className="mx-auto h-12 w-12 object-contain" />}
                      <span className="mt-1 block text-[11px]">{character.name}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="text-xl font-black">Free outfit choices</legend>
                <div className="mt-3 grid gap-2">
                  {OUTFITS.map(outfit => {
                    const unlocked = canUseOutfit(outfit.id, birthdayDate);
                    return (
                      <button key={outfit.id} type="button" disabled={!unlocked} onClick={() => choosePreset(outfit.id)} aria-pressed={outfitId === outfit.id} className={`rounded-2xl border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-600 ${outfitId === outfit.id ? 'border-violet-700 bg-violet-100' : 'border-slate-200 hover:border-violet-300'} ${unlocked ? '' : 'cursor-not-allowed opacity-55'}`}>
                        <span className="flex items-center gap-2 font-black">{outfit.id === 'annual-signup' && <Gift size={18} aria-hidden="true" />}{outfit.id === 'birthday-party' && <Cake size={18} aria-hidden="true" />}{outfit.name}</span>
                        <span className="mt-1 block text-xs font-bold text-slate-600">{outfit.id === 'annual-signup' ? annualGiftLabel() : outfit.description}</span>
                        {outfit.id === 'birthday-party' && <span className="mt-1 block text-xs font-black text-pink-700">{birthdayUnlocked ? 'Unlocked today — happy birthday!' : birthdayDate ? 'Unlocks on the saved birthday.' : 'A birthday saved on this device unlocks it.'}</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="text-xl font-black">Customise colour</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">{COLOURS.map(option => <button key={option.value} type="button" onClick={() => { setColour(option.value); markUnsaved(); }} aria-pressed={colour === option.value} className={`flex min-h-12 items-center gap-3 rounded-2xl border-2 px-3 text-left font-black transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-600 ${colour === option.value ? 'border-sky-700 bg-sky-100' : 'border-slate-200 hover:border-sky-300'}`}><span className="h-8 w-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: option.value }} aria-hidden="true" />{option.name}</button>)}</div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="text-xl font-black">Hero badge</legend>
                <div className="mt-2 grid grid-cols-5 gap-2">{BADGES.map(option => <button key={option} type="button" onClick={() => { setBadge(option); markUnsaved(); }} aria-pressed={badge === option} aria-label={`Choose badge ${option}`} className={`aspect-square rounded-2xl border-2 text-3xl transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-600 ${badge === option ? 'border-violet-700 bg-violet-100' : 'border-slate-200 hover:border-violet-300'}`}>{option}</button>)}</div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="text-xl font-black">Accessory</legend>
                <div className="mt-2 grid grid-cols-5 gap-2">{ACCESSORIES.map(option => <button key={option} type="button" onClick={() => { setAccessory(option); markUnsaved(); }} aria-pressed={accessory === option} aria-label={option === 'None' ? 'No accessory' : `Choose accessory ${option}`} className={`aspect-square rounded-2xl border-2 text-2xl font-black transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-600 ${accessory === option ? 'border-pink-700 bg-pink-100' : 'border-slate-200 hover:border-pink-300'}`}>{option === 'None' ? '×' : option}</button>)}</div>
              </fieldset>

              <button type="button" onClick={save} className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 px-5 font-black text-white shadow-lg transition hover:bg-violet-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-600"><Save aria-hidden="true" /> Save my choice</button>
              <p className="mt-3 text-center text-xs font-bold text-slate-500">Choices are free and saved only in this browser. Nothing is purchased or ordered.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
