import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import ArchieCharacter from '@/components/ArchieCharacter';

type Scene = 'town' | 'school' | 'sports' | 'wildman' | 'fair' | 'library' | 'museum' | 'theatre' | 'shop';

type Place = {
  id: Scene;
  name: string;
  emoji: string;
  blurb: string;
  accent: string;
  x: number;
};

const PLACES: Place[] = [
  { id: 'school', name: 'Sodafom School', emoji: '🏫', blurb: 'Lessons, teachers and your own school world', accent: 'from-emerald-400 to-emerald-700', x: 12 },
  { id: 'sports', name: 'Sports Centre', emoji: '⚽', blurb: 'Football, swimming and indoor PE', accent: 'from-red-400 to-red-700', x: 28 },
  { id: 'library', name: 'Library', emoji: '📚', blurb: 'Books, reading and living stories', accent: 'from-purple-400 to-indigo-700', x: 45 },
  { id: 'museum', name: 'Museum', emoji: '🏛️', blurb: 'History, science and local discoveries', accent: 'from-amber-400 to-orange-700', x: 61 },
  { id: 'theatre', name: 'Theatre', emoji: '🎭', blurb: 'Cartoons, stories and moving characters', accent: 'from-fuchsia-400 to-pink-700', x: 75 },
  { id: 'shop', name: 'Old Shops', emoji: '🏪', blurb: 'Victorian shops, maths and role play', accent: 'from-sky-400 to-blue-700', x: 88 },
];

const WILD_MAN_FACTS = [
  'Local fishermen were said to have caught a mysterious wild man in their nets near Orford around 1167.',
  'The story says he was taken to Orford Castle and kept there for a time.',
  'He would not speak and was described as wild and hairy.',
  'The medieval account says he ate raw fish.',
  'He later escaped and returned to the sea.',
  'Ralph of Coggeshall recorded the story around 1207.',
  'Today the legend is still connected with Orford Castle and St Bartholomew’s Church.',
];

const sceneCopy: Record<Scene, { title: string; subtitle: string; emoji: string }> = {
  town: { title: 'Sodafom Orford Town', subtitle: 'Walk, learn, play and explore', emoji: '🏘️' },
  school: { title: 'Sodafom School', subtitle: 'Our own animated school world', emoji: '🏫' },
  sports: { title: 'Sodafom Sports Centre', subtitle: 'PE comes alive here', emoji: '🏅' },
  wildman: { title: 'The Wild Man of Orford', subtitle: 'A legend from the sea', emoji: '🌊' },
  fair: { title: 'Village Fairground', subtitle: 'The square comes alive', emoji: '🎠' },
  library: { title: 'Orford Library', subtitle: 'Stories step out of the books', emoji: '📚' },
  museum: { title: 'Orford Museum', subtitle: 'Explore history through moving scenes', emoji: '🏛️' },
  theatre: { title: 'Archie Theatre', subtitle: 'Characters, cartoons and stories', emoji: '🎭' },
  shop: { title: 'Old Orford Shops', subtitle: 'Role play, maths and local-style shop fronts', emoji: '🏪' },
};

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

function FeatureCard({ emoji, title, text, onClick }: { emoji: string; title: string; text: string; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="min-h-36 rounded-[1.75rem] border-4 border-white/80 bg-white/95 p-4 text-left shadow-xl"
    >
      <div className="text-4xl" aria-hidden="true">{emoji}</div>
      <div className="mt-2 text-lg font-black text-slate-900">{title}</div>
      <div className="mt-1 text-sm font-semibold leading-snug text-slate-600">{text}</div>
    </motion.button>
  );
}

export default function OrfordTownPreviewPage() {
  const reducedMotion = useReducedMotion();
  const [scene, setScene] = useState<Scene>('town');
  const [walking, setWalking] = useState(false);
  const [archieX, setArchieX] = useState(5);
  const [speech, setSpeech] = useState('Welcome to Sodafom Orford Town! Tap somewhere and I’ll walk there with you.');
  const [shuttleOpen, setShuttleOpen] = useState(false);

  const current = sceneCopy[scene];
  const destinations = useMemo(() => [
    ...PLACES,
    { id: 'wildman' as Scene, name: 'Wild Man Legend', emoji: '🌊', blurb: 'Local history room', accent: 'from-cyan-500 to-slate-700', x: 94 },
  ], []);

  useEffect(() => {
    speak(speech);
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, [speech]);

  const walkTo = (next: Scene, targetX = 50, line?: string) => {
    if (next === scene && scene !== 'town') return;
    if (reducedMotion) {
      setScene(next);
      setSpeech(line || `Welcome to ${sceneCopy[next].title}.`);
      return;
    }
    setWalking(true);
    setArchieX(Math.max(4, Math.min(88, targetX)));
    window.setTimeout(() => {
      setScene(next);
      setWalking(false);
      setSpeech(line || `Welcome to ${sceneCopy[next].title}.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 760);
  };

  const goTown = () => {
    setScene('town');
    setArchieX(5);
    setSpeech('Back in the village square. Where shall we explore next?');
  };

  const openExisting = (path: string) => {
    if (typeof window === 'undefined') return;
    const isCapacitor = !!(window as any).Capacitor;
    if (isCapacitor) {
      window.location.href = `${window.location.pathname}?classic=1#${path}`;
    } else {
      window.location.href = `${path}?classic=1`;
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-sky-200 text-slate-900">
      <AnimatePresence mode="wait">
        <motion.section
          key={scene}
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.985 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.35 }}
          className="relative min-h-screen overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/assets/cartoon/home-landscape-v2.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-600/15 via-amber-50/35 to-emerald-950/35" />

          <header className="relative z-30 flex items-start justify-between gap-3 p-4 sm:p-6">
            <div className="max-w-[75%] rounded-3xl border-4 border-white/80 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="text-4xl" aria-hidden="true">{current.emoji}</span>
                <div>
                  <h1 className="text-xl font-black leading-tight text-blue-950 sm:text-3xl">{current.title}</h1>
                  <p className="text-xs font-bold text-blue-700 sm:text-sm">{current.subtitle}</p>
                </div>
              </div>
            </div>
            {scene !== 'town' ? (
              <button onClick={goTown} className="rounded-2xl border-4 border-white bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-xl active:scale-95">← TOWN</button>
            ) : (
              <button onClick={() => setShuttleOpen(true)} className="rounded-2xl border-4 border-white bg-yellow-400 px-4 py-3 text-sm font-black text-blue-950 shadow-xl active:scale-95">🚌 SHUTTLE</button>
            )}
          </header>

          {scene === 'town' && (
            <div className="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-6xl flex-col justify-end px-3 pb-24 pt-4 sm:px-6">
              <div className="mb-3 self-center rounded-2xl border-4 border-white/80 bg-amber-900/85 px-5 py-2 text-center text-white shadow-xl">
                <div className="text-lg font-black sm:text-2xl">ORFORD-INSPIRED VILLAGE SQUARE</div>
                <div className="text-xs font-bold text-amber-100">Old shops • King’s Head • castle • fairground • learning worlds</div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {PLACES.map((place) => (
                  <motion.button
                    key={place.id}
                    whileHover={{ y: -6, rotate: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => walkTo(place.id, place.x, `Let’s walk to ${place.name}. ${place.blurb}.`)}
                    className={`min-h-28 rounded-3xl border-4 border-white/90 bg-gradient-to-b ${place.accent} p-3 text-white shadow-2xl`}
                  >
                    <div className="text-4xl">{place.emoji}</div>
                    <div className="mt-1 text-sm font-black leading-tight">{place.name}</div>
                    <div className="mt-1 text-[10px] font-semibold leading-tight text-white/85">{place.blurb}</div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => walkTo('fair', 50, 'The fairground is in the village square. Watch the carousel go round!')} className="rounded-3xl border-4 border-white bg-pink-600 p-4 font-black text-white shadow-2xl">🎠 FAIRGROUND</motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => walkTo('wildman', 92, 'Here is the Wild Man of Orford history room.')} className="rounded-3xl border-4 border-white bg-cyan-800 p-4 font-black text-white shadow-2xl">🌊 WILD MAN</motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setSpeech('The King’s Head is part of the old Orford-style square. We can make its frontage move with lights, people and signs.')} className="rounded-3xl border-4 border-white bg-stone-800 p-4 font-black text-white shadow-2xl">👑 KING’S HEAD</motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setSpeech('Look uphill! Orford Castle becomes a history adventure entrance from this town.')} className="rounded-3xl border-4 border-white bg-amber-700 p-4 font-black text-white shadow-2xl">🏰 CASTLE PATH</motion.button>
              </div>

              <motion.div
                className="pointer-events-none absolute bottom-3 z-20"
                animate={{ left: `${archieX}%`, y: walking && !reducedMotion ? [0, -5, 0, -5, 0] : 0 }}
                transition={{ left: { duration: reducedMotion ? 0.01 : 0.7, ease: 'easeInOut' }, y: { duration: 0.35, repeat: walking ? 2 : 0 } }}
              >
                <div className="relative">
                  <ArchieCharacter size={118} />
                  <div className="absolute -top-12 left-12 min-w-44 max-w-60 rounded-2xl border-2 border-white bg-white/95 px-3 py-2 text-xs font-bold text-blue-950 shadow-xl">{speech}</div>
                </div>
              </motion.div>
            </div>
          )}

          {scene === 'school' && (
            <SceneShell>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <FeatureCard emoji="🧑‍🏫" title="Animated Teachers" text="Different teachers arrive for different subjects and talk through lessons." onClick={() => setSpeech('Your teacher can walk in, talk, demonstrate, ask questions and remember where the class reached.')} />
                <FeatureCard emoji="📝" title="Class Workbook" text="Children can tap, type, speak and complete work inside the school." onClick={() => setSpeech('This is your own Sodafom School, with a workbook area for each child.')} />
                <FeatureCard emoji="🔬" title="Subject Rooms" text="Maths, English, Science, History, Geography and more." onClick={() => setSpeech('Each subject can have its own room while the same progress system follows the child.')} />
                <FeatureCard emoji="🎓" title="Open Lessons" text="Use the existing lesson system behind the animated school entrance." onClick={() => openExisting('/lessons')} />
              </div>
              <WalkingDemo label="Walking into school" emoji="🏫" />
            </SceneShell>
          )}

          {scene === 'sports' && (
            <SceneShell>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <FeatureCard emoji="⚽" title="Football Pitches" text="Animated passing, shooting, dribbling, teamwork and learning games." onClick={() => openExisting('/games/football-times-tables')} />
                <FeatureCard emoji="🏊" title="Swimming Pool" text="Animated pool learning, strokes, confidence and water-safety teaching." onClick={() => openExisting('/games/pool-science')} />
                <FeatureCard emoji="🏀" title="Indoor Sports Hall" text="Running, jumping, balance, ball skills, netball, basketball and gym activities." onClick={() => openExisting('/games/basketball-grammar')} />
              </div>
              <WalkingDemo label="Walk from reception to PE area" emoji="🏃" />
            </SceneShell>
          )}

          {scene === 'wildman' && (
            <SceneShell>
              <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                <div className="rounded-[2rem] border-4 border-white/90 bg-cyan-950/90 p-5 text-white shadow-2xl">
                  <div className="flex items-center gap-3"><span className="text-6xl">🧔‍♂️🌊</span><div><h2 className="text-2xl font-black">Discover the Legend</h2><p className="text-sm font-bold text-cyan-100">From the sea, to the castle, and back again.</p></div></div>
                  <motion.div animate={reducedMotion ? undefined : { y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity }} className="mt-5 rounded-3xl bg-cyan-800/70 p-5 text-center text-6xl">🕸️ 🐟 🌊 🏰</motion.div>
                  <button onClick={() => speak(WILD_MAN_FACTS.join(' '))} className="mt-4 w-full rounded-2xl border-4 border-white bg-emerald-500 p-4 font-black text-white shadow-lg active:scale-95">🔊 HEAR THE STORY</button>
                </div>
                <div className="rounded-[2rem] border-4 border-white/90 bg-amber-50/95 p-5 shadow-2xl">
                  <h2 className="text-2xl font-black text-blue-950">The Wild Man of Orford</h2>
                  <ol className="mt-3 space-y-2">
                    {WILD_MAN_FACTS.map((fact, i) => <li key={fact} className="flex gap-3 rounded-2xl bg-white p-3 text-sm font-semibold shadow"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 font-black text-white">{i + 1}</span><span>{fact}</span></li>)}
                  </ol>
                  <p className="mt-3 text-xs font-bold text-slate-500">History sources used for this prototype: Orford Museum and English Heritage. The medieval account is a story recorded in a chronicle, so the app should present it as history and legend rather than claiming what the mysterious man really was.</p>
                </div>
              </div>
            </SceneShell>
          )}

          {scene === 'fair' && (
            <SceneShell>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="relative min-h-72 overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-b from-sky-300 to-amber-100 shadow-2xl">
                  <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }} className="absolute left-1/2 top-1/2 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[14px] border-red-500 bg-yellow-300 text-7xl shadow-2xl">🎠</motion.div>
                  <motion.div animate={reducedMotion ? undefined : { x: [-20, 20, -20] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-5 left-6 text-5xl">🎈🎈🎈</motion.div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FeatureCard emoji="🎠" title="Carousel" text="Turns slowly with children and characters riding around the square." onClick={() => setSpeech('The carousel can keep moving while the characters walk naturally around it.')} />
                  <FeatureCard emoji="🎯" title="Fair Games" text="Learning games hide inside traditional fairground stalls." onClick={() => setSpeech('Every fair stall can open a maths, spelling, science or memory challenge.')} />
                  <FeatureCard emoji="🎈" title="Balloons" text="Balloons move in circular paths without crashing into each other." onClick={() => setSpeech('Balloons float gently and can pop quietly when tapped.')} />
                  <FeatureCard emoji="✨" title="Surprises" text="Small random moments keep the square feeling alive." onClick={() => setSpeech('We can add safe little surprises so the town never feels completely static.')} />
                </div>
              </div>
            </SceneShell>
          )}

          {scene === 'library' && <LinkedScene title="Living Library" emoji="📚" text="Characters can walk to shelves, books open, illustrations move, and reading progress stays connected." onOpen={() => openExisting('/reading')} />}
          {scene === 'museum' && <LinkedScene title="Museum Explorer" emoji="🏛️" text="Walk through galleries for dinosaurs, Egypt, Vikings, Sutton Hoo, local Orford history and more." onOpen={() => openExisting('/museum')} />}
          {scene === 'theatre' && <LinkedScene title="Archie Theatre" emoji="🎭" text="Walk through the theatre doors, sit down, then start the existing cartoon and narration system." onOpen={() => openExisting('/archie-theatre')} />}
          {scene === 'shop' && <LinkedScene title="Old Orford Shops" emoji="🏪" text="Traditional shop fronts become interactive maths, money, role-play and story spaces." onOpen={() => openExisting('/sodafom-shop')} />}

          {shuttleOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onClick={() => setShuttleOpen(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="w-full max-w-xl rounded-[2rem] border-4 border-white bg-blue-950 p-5 text-white shadow-2xl">
                <div className="flex items-center justify-between"><div><div className="text-3xl font-black">🚌 Town Shuttle</div><div className="text-sm font-bold text-blue-200">Fast travel with a short animated ride</div></div><button onClick={() => setShuttleOpen(false)} className="rounded-full bg-white/15 px-4 py-2 font-black">✕</button></div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {destinations.map(place => <button key={place.id} onClick={() => { setShuttleOpen(false); walkTo(place.id, place.x, `All aboard! The shuttle is taking us to ${place.name}.`); }} className="rounded-2xl border-2 border-white/30 bg-white/10 p-3 font-black active:scale-95"><div className="text-3xl">{place.emoji}</div>{place.name}</button>)}
                </div>
              </motion.div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </main>
  );
}

function SceneShell({ children }: { children: React.ReactNode }) {
  return <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6">{children}</div>;
}

function WalkingDemo({ label, emoji }: { label: string; emoji: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="mt-5 overflow-hidden rounded-[2rem] border-4 border-white/80 bg-slate-950/65 p-4 shadow-2xl">
      <div className="mb-2 text-sm font-black text-white">{label}</div>
      <div className="relative h-28 rounded-2xl bg-gradient-to-r from-emerald-200 via-stone-200 to-emerald-300">
        <motion.div animate={reducedMotion ? undefined : { x: ['0%', '78%', '0%'] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-2 left-3 text-6xl">🧒</motion.div>
        <div className="absolute bottom-4 right-5 text-6xl">{emoji}</div>
      </div>
    </div>
  );
}

function LinkedScene({ title, emoji, text, onOpen }: { title: string; emoji: string; text: string; onOpen: () => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <SceneShell>
      <div className="mx-auto max-w-3xl rounded-[2.5rem] border-4 border-white/90 bg-white/95 p-6 text-center shadow-2xl">
        <motion.div animate={reducedMotion ? undefined : { y: [0, -10, 0], rotate: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity }} className="text-8xl">{emoji}</motion.div>
        <h2 className="mt-3 text-3xl font-black text-blue-950">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-base font-semibold text-slate-600">{text}</p>
        <button onClick={onOpen} className="mt-5 rounded-2xl border-4 border-white bg-blue-700 px-8 py-4 text-lg font-black text-white shadow-xl active:scale-95">WALK INSIDE →</button>
      </div>
    </SceneShell>
  );
}
