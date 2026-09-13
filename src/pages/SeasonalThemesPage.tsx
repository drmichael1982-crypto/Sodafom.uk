import { useRef, useState, type KeyboardEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import {
  DEFAULT_SEASONAL_THEME_ID,
  SEASONAL_THEMES,
  type SeasonalThemeId,
  useSeasonalTheme,
} from '@/lib/seasonal-themes';

/**
 * A child-friendly cover picker.  All choices are CSS and emoji only, and the
 * selected cover is saved in this browser for both Sodafom home screens.
 */
export default function SeasonalThemesPage() {
  const { themeId, selectTheme, resetTheme } = useSeasonalTheme();
  const [announcement, setAnnouncement] = useState('Choose a cover for your Sodafom home screen.');
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const chooseTheme = (nextThemeId: SeasonalThemeId) => {
    selectTheme(nextThemeId);
    const nextTheme = SEASONAL_THEMES.find(theme => theme.id === nextThemeId);
    setAnnouncement(
      nextThemeId === DEFAULT_SEASONAL_THEME_ID
        ? 'Everyday Rainbow is back. The special cover has been removed.'
        : `${nextTheme?.name ?? 'That'} cover is on. It now appears on both Sodafom Home and Archie’s Adventure home.`
    );
  };

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = SEASONAL_THEMES.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;

    if (nextIndex !== null) {
      event.preventDefault();
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-amber-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <Helmet><title>Choose a Sodafom Cover</title></Helmet>
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-blue-700 bg-white px-4 py-2 font-black text-blue-950 shadow-md transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to Archie’s Adventure
        </Link>

        <section className="mt-5 overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-blue-800 via-purple-700 to-pink-600 p-5 text-center text-white shadow-2xl sm:p-8">
          <Sparkles className="mx-auto text-yellow-300" size={42} aria-hidden="true" />
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">Choose your Sodafom cover</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-bold text-white/95 sm:text-lg">
            Pick a celebration cover, then change it back any time. It is only saved on this device.
          </p>
          <p className="mt-3 text-sm font-bold text-yellow-100" id="cover-keyboard-help">
            Use Tab and Enter to choose. Arrow keys move between cover cards.
          </p>
        </section>

        <div aria-live="polite" className="sr-only">{announcement}</div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-blue-200 bg-white/90 p-4 shadow-sm">
          <p className="font-black text-blue-950">
            Current cover: <span className="text-blue-700">{SEASONAL_THEMES.find(theme => theme.id === themeId)?.name}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              resetTheme();
              setAnnouncement('Everyday Rainbow is back. The special cover has been removed.');
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-blue-700 bg-yellow-300 px-4 py-2 font-black text-blue-950 shadow transition hover:bg-yellow-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <RotateCcw size={18} aria-hidden="true" /> Everyday / remove cover
          </button>
        </div>

        <section
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Choose a seasonal or celebration cover"
          aria-describedby="cover-keyboard-help"
        >
          {SEASONAL_THEMES.map((theme, index) => {
            const isSelected = themeId === theme.id;
            return (
              <button
                key={theme.id}
                ref={element => { buttonRefs.current[index] = element; }}
                type="button"
                onClick={() => chooseTheme(theme.id)}
                onKeyDown={event => moveFocus(event, index)}
                aria-pressed={isSelected}
                aria-label={`${theme.name}. ${theme.description}${isSelected ? ' Selected.' : ''}`}
                className={`relative min-h-64 overflow-hidden rounded-[2rem] border-4 p-5 text-left text-white shadow-xl transition duration-200 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                  isSelected ? 'border-yellow-300 ring-4 ring-yellow-200/90' : 'border-white/90'
                }`}
                style={{ background: theme.cardBackground }}
              >
                <span aria-hidden="true" className="absolute -right-5 -top-6 text-9xl opacity-20">{theme.emoji}</span>
                {isSelected && (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-blue-950 shadow">
                    <CheckCircle2 size={16} aria-hidden="true" /> On
                  </span>
                )}
                <span aria-hidden="true" className="relative block text-6xl drop-shadow-md">{theme.emoji}</span>
                <h2 className="relative mt-4 text-2xl font-black leading-tight">{theme.name}</h2>
                <p className="relative mt-2 max-w-sm font-bold text-white/95">{theme.description}</p>
                <span aria-hidden="true" className="relative mt-5 flex gap-2 text-3xl">
                  {theme.decorations.map(decoration => <span key={decoration}>{decoration}</span>)}
                </span>
              </button>
            );
          })}
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            to="/"
            className="flex min-h-14 items-center justify-center rounded-2xl border-4 border-blue-800 bg-blue-700 px-4 py-3 text-center font-black text-white shadow-lg transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            See it on Archie’s Adventure home
          </Link>
          <Link
            to="/classic-home"
            className="flex min-h-14 items-center justify-center rounded-2xl border-4 border-purple-800 bg-purple-700 px-4 py-3 text-center font-black text-white shadow-lg transition hover:bg-purple-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
          >
            See it on Sodafom Home
          </Link>
        </section>
      </div>
    </main>
  );
}
