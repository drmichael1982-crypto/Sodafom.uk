export type InterestTheme = {
  label: string;
  palette: string;
  motif: string;
  emoji: string;
  background?: string;
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

const PALETTES: Record<string, string> = {
  cosmic: 'linear-gradient(145deg, #292c7a 0%, #4c5fd7 55%, #9a62d7 100%)',
  jungle: 'linear-gradient(145deg, #285b47 0%, #69a858 55%, #d7ad52 100%)',
  meadow: 'linear-gradient(145deg, #42a981 0%, #38b8b5 55%, #6dc9e8 100%)',
  stadium: 'linear-gradient(145deg, #12664b 0%, #19815c 55%, #16477d 100%)',
  hero: 'linear-gradient(145deg, #5e3da0 0%, #cc466e 55%, #ef9a45 100%)',
  starlight: 'linear-gradient(145deg, #443487 0%, #9b56bc 55%, #e27ca0 100%)',
  circuit: 'linear-gradient(145deg, #126b78 0%, #2962a3 55%, #554da8 100%)',
  raceway: 'linear-gradient(145deg, #bd394d 0%, #e87934 55%, #e1b940 100%)',
  soundwave: 'linear-gradient(145deg, #6939a6 0%, #c94691 55%, #f08a62 100%)',
  ocean: 'linear-gradient(145deg, #075d83 0%, #1387aa 55%, #31b4b0 100%)',
  storybook: 'linear-gradient(145deg, #9b4c87 0%, #d778a4 55%, #f0b856 100%)',
  railway: 'linear-gradient(145deg, #304d6d 0%, #3e7796 55%, #d78a43 100%)',
  cosy: 'linear-gradient(145deg, #936143 0%, #c88759 55%, #ddbb70 100%)',
  'rolling-hills': 'linear-gradient(145deg, #5443a2 0%, #ad4e8e 55%, #e5974a 100%)',
  'heroic-fantasy': 'linear-gradient(145deg, #34386f 0%, #6955a0 55%, #bb7747 100%)',
};

function customPalette(value: string): string {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return `linear-gradient(145deg, hsl(${hue} 68% 45%), hsl(${(hue + 48) % 360} 72% 32%))`;
}

const NORMALIZED = new Map(THEMES.map(theme => [theme.label, theme]));
const MAX_INTERESTS = 5;
const UNSUITABLE_THEME_LANGUAGE = /\b(?:fuck|fucking|shit|shitting|cunt|bitch|bastard|porn|pornography)\b/i;

export function isSchoolFriendlyInterest(value: string): boolean {
  return !UNSUITABLE_THEME_LANGUAGE.test(value);
}

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
  if (!interest || !isSchoolFriendlyInterest(interest)) return getChildInterests();
  const next = [interest, ...getChildInterests().filter(item => item !== interest)].slice(0, MAX_INTERESTS);
  try { localStorage.setItem(activeProfileKey(), JSON.stringify(next)); } catch { /* private browsing/quota */ }
  window.dispatchEvent(new Event('sodafom:child-interests-updated'));
  return next;
}

export function removeChildInterest(value: string): string[] {
  if (typeof window === 'undefined') return [];
  const interest = normalizeInterest(value);
  const next = getChildInterests().filter(item => item !== interest);
  try { localStorage.setItem(activeProfileKey(), JSON.stringify(next)); } catch { /* private browsing/quota */ }
  window.dispatchEvent(new Event('sodafom:child-interests-updated'));
  return next;
}

export function clearChildInterests(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(activeProfileKey());
    window.dispatchEvent(new Event('sodafom:child-interests-updated'));
  }
}

export function getInterestTheme(value: string): InterestTheme {
  const normalized = normalizeInterest(value) ?? '';
  const known = NORMALIZED.get(normalized);
  if (known) return { ...known, background: PALETTES[known.palette] };
  return {
    label: normalized,
    palette: 'personal',
    motif: 'original colours and abstract shapes inspired by this interest',
    emoji: '✨',
    background: customPalette(normalized),
  };
}

/** Capture only a short interest label; never retain the child's raw message. */
export function tryRememberChildInterest(input: string): string | null {
  const match = input.match(/\b(?:i like|i love|my favourite (?:toy|show|programme|program|thing) is|my favorite (?:toy|show|program|thing) is)\s+([^.!?\n]{2,48})/i);
  if (!match) return null;
  const value = match[1].replace(/\b(?:and|because|so)\b.*$/i, '').trim();
  if (!isSchoolFriendlyInterest(value)) return 'Let’s choose a friendly, school-ready interest for your learning screen. You can ask about difficult topics in a lesson with age-appropriate help.';
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
