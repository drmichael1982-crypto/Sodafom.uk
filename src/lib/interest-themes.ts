export type InterestTheme = {
  label: string;
  palette: string;
  motif: string;
  emoji: string;
};

const THEMES: InterestTheme[] = [
  { label: 'space', palette: 'cosmic', motif: 'stars and planets', emoji: '🚀' },
  { label: 'dinosaurs', palette: 'jungle', motif: 'prehistoric leaves and footprints', emoji: '🦕' },
  { label: 'animals', palette: 'meadow', motif: 'friendly wildlife and leaves', emoji: '🦊' },
  { label: 'football', palette: 'stadium', motif: 'pitch lines and goal shapes', emoji: '⚽' },
  { label: 'superheroes', palette: 'hero', motif: 'bold capes and original shield shapes', emoji: '🦸' },
  { label: 'magic', palette: 'starlight', motif: 'sparkles and storybook stars', emoji: '✨' },
  { label: 'robots', palette: 'circuit', motif: 'friendly robot shapes and circuit lines', emoji: '🤖' },
  { label: 'cars', palette: 'raceway', motif: 'road stripes and racing colours', emoji: '🏎️' },
  { label: 'music', palette: 'soundwave', motif: 'notes and sound waves', emoji: '🎵' },
  { label: 'ocean', palette: 'ocean', motif: 'waves and sea creatures', emoji: '🐬' },
  { label: 'princesses', palette: 'storybook', motif: 'castles, crowns and soft sparkles', emoji: '👑' },
  { label: 'trains', palette: 'railway', motif: 'tracks and friendly trains', emoji: '🚂' },
  { label: 'teddies', palette: 'cosy', motif: 'soft shapes and friendly bears', emoji: '🧸' },
  { label: 'teletubbies', palette: 'rolling-hills', motif: 'playful bright colours and abstract geometric shapes', emoji: '☀️' },
  { label: 'he-man', palette: 'heroic-fantasy', motif: 'bold heroic colours and abstract star patterns', emoji: '🛡️' },
];

const NORMALIZED = new Map(THEMES.map(theme => [theme.label, theme]));
const MAX_INTERESTS = 5;

function activeProfileKey(): string {
  try {
    const active = localStorage.getItem('sodafom_active_child');
    const parsed = active ? JSON.parse(active) : null;
    const id = typeof parsed?.id === 'string' ? parsed.id : null;
    return id ? `sodafom_child_interests:${id}` : 'sodafom_child_interests:default';
  } catch {
    return 'sodafom_child_interests:default';
  }
}

function normalizeInterest(value: string): string | null {
  const clean = value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 32);
  if (!clean || clean.length < 2) return null;
  return clean.toLocaleLowerCase('en-GB');
}

export function getChildInterests(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(activeProfileKey()) ?? '[]');
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string').map(normalizeInterest).filter((item): item is string => !!item).slice(0, MAX_INTERESTS)
      : [];
  } catch {
    return [];
  }
}

export function saveChildInterest(value: string): string[] {
  if (typeof window === 'undefined') return [];
  const interest = normalizeInterest(value);
  if (!interest) return getChildInterests();
  const next = [interest, ...getChildInterests().filter(item => item !== interest)].slice(0, MAX_INTERESTS);
  try { localStorage.setItem(activeProfileKey(), JSON.stringify(next)); } catch { /* private browsing/quota */ }
  return next;
}

export function removeChildInterest(value: string): string[] {
  if (typeof window === 'undefined') return [];
  const interest = normalizeInterest(value);
  const next = getChildInterests().filter(item => item !== interest);
  try { localStorage.setItem(activeProfileKey(), JSON.stringify(next)); } catch { /* private browsing/quota */ }
  return next;
}

export function clearChildInterests(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(activeProfileKey());
}

export function getInterestTheme(value: string): InterestTheme {
  const normalized = normalizeInterest(value) ?? '';
  const known = NORMALIZED.get(normalized);
  if (known) return known;
  return {
    label: normalized,
    palette: 'personal',
    motif: 'original colours and abstract shapes inspired by this interest',
    emoji: '✨',
  };
}

/** Capture only a short interest label; never retain the child's raw message. */
export function tryRememberChildInterest(input: string): string | null {
  const match = input.match(/\b(?:i like|i love|my favourite (?:toy|show|programme|program|thing) is|my favorite (?:toy|show|program|thing) is)\s+([^.!?\n]{2,48})/i);
  if (!match) return null;
  const value = match[1].replace(/\b(?:and|because|so)\b.*$/i, '').trim();
  const interests = saveChildInterest(value);
  const saved = interests[0];
  return saved ? `Nice choice! I’ll remember that you like ${saved}. I can use original ${getInterestTheme(saved).motif} in your learning screen. Your interest stays on this device.` : null;
}

export function personalizedHomeGreeting(): string | null {
  const interest = getChildInterests()[0];
  if (!interest) return null;
  const theme = getInterestTheme(interest);
  return `Your ${theme.palette} learning world ${theme.emoji}`;
}
