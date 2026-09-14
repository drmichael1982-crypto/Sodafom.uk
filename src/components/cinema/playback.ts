export interface PlaybackState {
  page: number;
  elapsedMs: number;
  playing: boolean;
  ended: boolean;
}

export type PlaybackAction =
  | { type: 'toggle' }
  | { type: 'pause' }
  | { type: 'restart' }
  | { type: 'page'; page: number; count: number }
  | { type: 'tick'; deltaMs: number; durationMs: number; count: number };

export const initialPlayback: PlaybackState = { page: 0, elapsedMs: 0, playing: false, ended: false };

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'toggle': return state.ended
      ? { ...initialPlayback, playing: true }
      : { ...state, playing: !state.playing };
    case 'pause': return { ...state, playing: false };
    case 'restart': return { ...initialPlayback };
    case 'page': return {
      ...state,
      page: Math.max(0, Math.min(action.count - 1, action.page)),
      elapsedMs: 0,
      ended: false,
    };
    case 'tick': {
      if (!state.playing) return state;
      const elapsedMs = state.elapsedMs + Math.max(0, action.deltaMs);
      if (elapsedMs < action.durationMs) return { ...state, elapsedMs };
      if (state.page === action.count - 1) {
        return { ...state, elapsedMs: action.durationMs, playing: false, ended: true };
      }
      return { ...state, page: state.page + 1, elapsedMs: 0 };
    }
  }
}

export const LITTLE_JOKES = [
  'What do you call a sleeping dinosaur? A dino-snore!',
  'Why did the teddy bear skip dessert? It was already stuffed!',
  'What do clouds wear under their raincoats? Thunderwear!',
  'What is a cat’s favourite colour? Purr-ple!',
  'What kind of key opens a banana? A mon-key!',
] as const;

/** Every joke appears once per bag; the next bag cannot repeat its last joke. */
export function makeJokeBag(previous: number | null, random = Math.random): number[] {
  const bag: number[] = LITTLE_JOKES.map((_, index) => index);
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  if (bag[0] === previous) [bag[0], bag[1]] = [bag[1], bag[0]];
  return bag;
}
