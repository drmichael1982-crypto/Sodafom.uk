/**
 * ActiveChildBanner
 * Shows a small pill at the top of game pages indicating which child is playing
 * and at what difficulty level. Clicking "Change" clears the active child.
 */
import { useChildAge, setActiveChild } from '@/hooks/useChildAge';

const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: '⭐ Beginner',
  2: '⭐⭐ Intermediate',
  3: '⭐⭐⭐ Advanced',
};

const TIER_COLORS: Record<1 | 2 | 3, string> = {
  1: 'bg-green-100 text-green-800 border-green-300',
  2: 'bg-blue-100 text-blue-800 border-blue-300',
  3: 'bg-purple-100 text-purple-800 border-purple-300',
};

export default function ActiveChildBanner() {
  const { child, tier } = useChildAge();
  if (!child) return null;

  const tierColour = Object.hasOwn(TIER_COLORS, tier) ? TIER_COLORS[tier as keyof typeof TIER_COLORS] : '';
  const tierLabel  = Object.hasOwn(TIER_LABELS, tier) ? TIER_LABELS[tier as keyof typeof TIER_LABELS] : '';

  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 text-xs font-bold border-b ${tierColour}`}>
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="shrink-0 text-base">{child.avatarEmoji}</span>
        <span className="shrink-0">Playing as</span>
        <span className="min-w-0 max-w-full break-words font-black">{child.name}</span>
        <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/60 border border-current/20">
          {tierLabel}
        </span>
      </span>
      <button
        onClick={() => setActiveChild(null)}
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg px-3 underline opacity-70 transition-opacity hover:bg-white/40 hover:opacity-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        Change
      </button>
    </div>
  );
}
