import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import FeaturePageShell from '@/components/FeaturePageShell';
import { ttsSpeak } from '@/lib/voice-context';

export const SEASONAL_THEME_KEY = 'sodafom_seasonal_theme';
export type SeasonalTheme = 'everyday' | 'christmas' | 'easter';

const THEMES: Array<{ id: SeasonalTheme; name: string; emoji: string; description: string; colour: string; decorations: string[] }> = [
  { id: 'everyday', name: 'Everyday Rainbow', emoji: '🌈', description: 'The classic Sodafom rainbow world.', colour: 'from-sky-400 to-blue-700', decorations: ['⭐', '☁️', '🗝️'] },
  { id: 'christmas', name: 'Christmas', emoji: '🎄', description: 'Snowflakes, stars and festive colours.', colour: 'from-red-500 to-green-800', decorations: ['❄️', '🎁', '⭐'] },
  { id: 'easter', name: 'Easter', emoji: '🐣', description: 'Spring colours, eggs and cheerful flowers.', colour: 'from-pink-400 to-emerald-600', decorations: ['🌷', '🥚', '🐰'] },
];

export function getSeasonalTheme(): SeasonalTheme {
  if (typeof window === 'undefined') return 'everyday';
  const value = localStorage.getItem(SEASONAL_THEME_KEY);
  return value === 'christmas' || value === 'easter' ? value : 'everyday';
}

export default function SeasonalThemesPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SeasonalTheme>(getSeasonalTheme);

  const choose = (theme: (typeof THEMES)[number]) => {
    localStorage.setItem(SEASONAL_THEME_KEY, theme.id);
    setSelected(theme.id);
    ttsSpeak(`${theme.name} theme selected. Let's go back to Archie's home.`);
  };

  return (
    <>
      <Helmet><title>Seasonal Themes — Sodafom</title></Helmet>
      <FeaturePageShell title="Seasonal Themes" subtitle="Choose the decorations shown on Archie's home screen." emoji="🎄" accent="from-red-500 via-purple-700 to-green-900">
        <section className="grid gap-4 md:grid-cols-3">
          {THEMES.map(theme => (
            <button key={theme.id} type="button" onClick={() => choose(theme)} aria-pressed={selected === theme.id} className={`relative min-h-72 overflow-hidden rounded-[2rem] border-4 p-5 text-white shadow-2xl bg-gradient-to-br ${theme.colour} ${selected === theme.id ? 'border-yellow-300 ring-4 ring-yellow-200/70' : 'border-white/70'}`}>
              {selected === theme.id && <CheckCircle2 className="absolute right-4 top-4 text-yellow-300" size={30} />}
              <span className="text-7xl" aria-hidden="true">{theme.emoji}</span>
              <h2 className="mt-4 text-2xl font-black">{theme.name}</h2>
              <p className="mt-2 font-bold text-white/85">{theme.description}</p>
              <div className="mt-5 flex justify-center gap-3 text-3xl" aria-hidden="true">{theme.decorations.map(item => <span key={item}>{item}</span>)}</div>
            </button>
          ))}
        </section>
        <button type="button" onClick={() => navigate('/')} className="mt-6 min-h-14 w-full rounded-2xl border-4 border-white/80 bg-yellow-300 font-black text-blue-950 shadow-xl">See the theme on Archie&apos;s home</button>
      </FeaturePageShell>
    </>
  );
}
