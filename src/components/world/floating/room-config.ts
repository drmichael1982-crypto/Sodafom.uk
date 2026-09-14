export type RoomSkin = 'planets' | 'colouring' | 'geography';
export type RoomAction = { kind: 'route'; href: string } | { kind: 'explain'; text: string };
export type RoomHotspot = { id: string; label: string; position: readonly [number, number, number]; action: RoomAction };
export type SkinDefinition = { title: string; subtitle: string; background: string; accent: string; hotspots: readonly RoomHotspot[] };

export const ROOM_SKINS: Record<RoomSkin, SkinDefinition> = {
  planets: {
    title: 'The Floating Planet Room', subtitle: 'A little room with a whole solar system inside.', background: '#111932', accent: '#d6b778',
    hotspots: [
      { id: 'solar-quiz', label: 'Sun · Solar-system quiz', position: [0, .4, 0], action: { kind: 'route', href: '/games/solar-system' } },
      { id: 'earth-spin', label: 'Earth · Spin and sunlight', position: [1.6, .4, 0], action: { kind: 'explain', text: 'Earth spins west to east, counterclockwise from above its North Pole. Its axis stays tilted in the same direction while Earth orbits. Sunlight lights the side facing the Sun; the other side is night.' } },
      { id: 'space-quiz', label: 'Telescope · Earth and space', position: [-3.7, -.7, 2.1], action: { kind: 'route', href: '/games/earth-space' } },
    ],
  },
  colouring: {
    title: 'The Floating Colouring Room', subtitle: 'Open a floating book and make the next page yours.', background: '#292242', accent: '#eba9d5',
    hotspots: [
      { id: 'open-book', label: 'Floating book · Start colouring', position: [-.9, .55, .35], action: { kind: 'route', href: '/games/colour-book' } },
      { id: 'colour-pencils', label: 'Pencils · Learn colours', position: [2.5, .0, 1.3], action: { kind: 'route', href: '/games/colour-learn' } },
      { id: 'drawing-idea', label: 'Little star · Drawing idea', position: [-3, 1.45, -1.4], action: { kind: 'explain', text: 'Drawing idea: invent a friendly animal that lives on a floating island. What colours will its home be? Open the floating book to start colouring.' } },
    ],
  },
  geography: {
    title: 'The Floating Geography Room', subtitle: 'Follow the little aircraft, then choose a geography adventure.', background: '#163444', accent: '#e4c59a',
    hotspots: [
      { id: 'aircraft-quiz', label: 'Aircraft · World geography', position: [0, 1.1, 1], action: { kind: 'route', href: '/games/geography-quiz' } },
      { id: 'uk-luggage', label: 'Travel case · Explore the UK', position: [-2.8, -.55, 1.9], action: { kind: 'route', href: '/games/geography-uk' } },
      { id: 'globe-fact', label: 'Globe · Land and sea', position: [2.4, .65, -.8], action: { kind: 'explain', text: 'A globe is a model of Earth. Oceans separate and connect places around the world. This little aircraft follows an imaginary route; the decorative islands are not a real map.' } },
    ],
  },
};

export function isRoomSkin(value: unknown): value is RoomSkin {
  return typeof value === 'string' && Object.hasOwn(ROOM_SKINS, value);
}

/** Only the currently displayed skin can dispatch its own known actions. */
export function resolveRoomAction(skin: unknown, hotspotId: unknown): RoomAction | null {
  if (!isRoomSkin(skin) || typeof hotspotId !== 'string') return null;
  return ROOM_SKINS[skin].hotspots.find(hotspot => hotspot.id === hotspotId)?.action ?? null;
}

export const ROOM_SURPRISES = [
  'The Sun checked its pockets. Still no sunglasses big enough!',
  'A tiny imaginary dog has voted this room excellent for floating naps.',
  'The pencils are holding a meeting. The purple one wants more dragons.',
  'The little aircraft has packed a picnic. Its sandwiches have window seats.',
] as const;

/** A shuffled cycle without immediate repeats, including at cycle boundaries. */
export function createSurpriseBag(random: () => number = Math.random) {
  let remaining: number[] = [];
  let previous = -1;
  return () => {
    if (!remaining.length) {
      remaining = ROOM_SURPRISES.map((_, index) => index);
      for (let i = remaining.length - 1; i > 0; i--) {
        const sample = random();
        const j = Math.floor((Number.isFinite(sample) ? Math.min(.999999, Math.max(0, sample)) : 0) * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      if (remaining[remaining.length - 1] === previous) [remaining[0], remaining[remaining.length - 1]] = [remaining[remaining.length - 1], remaining[0]];
    }
    previous = remaining.pop()!;
    return ROOM_SURPRISES[previous];
  };
}
