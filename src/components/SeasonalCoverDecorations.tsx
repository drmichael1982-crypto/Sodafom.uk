import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import type { SeasonalTheme } from '@/lib/seasonal-themes';

const DECORATION_POSITIONS: readonly CSSProperties[] = [
  { left: '5%', top: '12%' },
  { right: '7%', top: '14%' },
  { left: '13%', bottom: '9%' },
  { right: '14%', bottom: '11%' },
  { left: '43%', top: '6%' },
  { right: '42%', bottom: '4%' },
];

/** Decorative, pointer-free emoji layer used only on the two home screens. */
export function SeasonalCoverDecorations({ theme }: { theme: SeasonalTheme }) {
  if (theme.id === 'everyday') return null;

  const decorations = [...theme.decorations, ...theme.decorations].slice(0, DECORATION_POSITIONS.length);
  return (
    <div
      aria-hidden="true"
      data-testid="seasonal-cover-decorations"
      data-seasonal-cover={theme.id}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {decorations.map((decoration, index) => (
        <span
          key={`${decoration}-${index}`}
          className="absolute select-none text-4xl drop-shadow-md sm:text-5xl motion-safe:animate-float"
          style={{ ...DECORATION_POSITIONS[index], animationDelay: `${index * 180}ms` }}
        >
          {decoration}
        </span>
      ))}
    </div>
  );
}

/** A small, visible way to change or check the current cover from either Home. */
export function SeasonalCoverLink({ theme }: { theme: SeasonalTheme }) {
  return (
    <Link
      to="/seasonal-themes"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white/80 bg-white/95 px-3 py-2 text-xs font-black text-blue-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
      aria-label={`Change cover. Current cover: ${theme.name}`}
    >
      <span aria-hidden="true" className="text-lg">{theme.emoji}</span>
      <span>Covers</span>
    </Link>
  );
}
