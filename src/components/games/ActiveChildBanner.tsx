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
    <div className={`flex items-center justify-between gap-3 px-4 py-2 text-xs font-bold border-b ${tierColour}`}>
      <span className="flex items-center gap-2">
        <span className="text-base">{child.avatarEmoji}</span>
        Playing as <span className="font-black">{child.name}</span>
        <span className="px-2 py-0.5 rounded-full bg-white/60 border border-current/20">
          {tierLabel}
        </span>
      </span>
      <button
        onClick={() => setActiveChild(null)}
        className="underline opacity-70 hover:opacity-100 transition-opacity"
      >
        Change
      </button>
    </div>
  );
}
