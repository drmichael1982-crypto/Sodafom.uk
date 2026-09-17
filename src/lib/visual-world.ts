export type WorldDestinationId =
  | 'village-shops'
  | 'fairground'
  | 'school-science'
  | 'library'
  | 'castle-museum'
  | 'theatre'
  | 'sports-swimming'
  | 'night-sky'
  | 'harbour'
  | 'nature-trail'
  | 'birthday-room'
  | 'founder-room'
  | 'ask-archie'
  | 'family-home'
  | 'settings';

export interface WorldDestination {
  id: WorldDestinationId;
  label: string;
  route: string;
  description: string;
  motionGroup: 'calm' | 'standard' | 'lively';
}

/**
 * Single source of truth for the approved village-map destinations.
 * Visual scenes call existing routes instead of replacing learning/business logic.
 */
export const WORLD_DESTINATIONS: readonly WorldDestination[] = [
  { id: 'village-shops', label: 'Village Shops', route: '/sodafom-shop', description: 'Learning shops and the Victorian sweet-shop world.', motionGroup: 'standard' },
  { id: 'fairground', label: 'Learning Fairground', route: '/game-islands', description: 'Games, carousel and child-friendly fairground learning.', motionGroup: 'lively' },
  { id: 'school-science', label: 'School & Science', route: '/lessons', description: 'Classroom lessons, experiments and guided learning.', motionGroup: 'standard' },
  { id: 'library', label: 'Library', route: '/stories', description: 'Books, reading and living-book character moments.', motionGroup: 'calm' },
  { id: 'castle-museum', label: 'Castle & Museum', route: '/museum', description: 'History, dinosaurs, Egypt, Vikings and museum adventures.', motionGroup: 'standard' },
  { id: 'theatre', label: 'Archie Theatre', route: '/archie-theatre', description: 'Sodafom cartoons, stories and learning shows.', motionGroup: 'standard' },
  { id: 'sports-swimming', label: 'Sports & Swimming', route: '/tutor?subject=PE&direct=1', description: 'PE, sport and healthy-body learning.', motionGroup: 'lively' },
  { id: 'night-sky', label: 'Night Sky & Space', route: '/games/solar-system', description: 'Solar-system exploration and space learning.', motionGroup: 'calm' },
  { id: 'harbour', label: 'Harbour', route: '/museum', description: 'Orford-inspired harbour exploration and local learning.', motionGroup: 'calm' },
  { id: 'nature-trail', label: 'Nature Trail', route: '/games/nature-explorer', description: 'Outdoor nature, habitats and discovery.', motionGroup: 'calm' },
  { id: 'birthday-room', label: 'Birthday Room', route: '/birthday-party', description: 'Birthday celebration room and party activities.', motionGroup: 'lively' },
  { id: 'founder-room', label: 'Founder Room', route: '/about', description: 'Founder story and respectful project history.', motionGroup: 'calm' },
  { id: 'ask-archie', label: 'Ask Archie', route: '/ask-archie', description: 'Conversation corner and learning help.', motionGroup: 'calm' },
  { id: 'family-home', label: 'Family Home', route: '/', description: 'Home base for the Sodafom world.', motionGroup: 'standard' },
  { id: 'settings', label: 'Settings', route: '/sodafom-settings', description: 'Accessibility, audio, account and display settings.', motionGroup: 'calm' },
] as const;

export type MovementId =
  | 'idle' | 'walk-left' | 'walk-right' | 'walk-forward' | 'walk-away'
  | 'run' | 'turn' | 'wave' | 'point' | 'sit-stand' | 'jump-celebrate'
  | 'talk' | 'look-around' | 'pick-up' | 'carry' | 'put-down' | 'trip-recover'
  | 'enter-door' | 'exit-door' | 'follow' | 'chase'
  | 'dog-walk-run' | 'dog-tail-wag' | 'dog-sit-lie-bark'
  | 'book-open-close' | 'page-turn' | 'book-spin' | 'book-fly-off-shelf'
  | 'book-character-out' | 'book-character-return' | 'globe-spin' | 'object-roll'
  | 'bounce' | 'wobble' | 'float' | 'swing' | 'door-open-close'
  | 'lights-flicker' | 'wind-reaction' | 'party-hat-reaction';

export const MOVEMENT_IDS: readonly MovementId[] = [
  'idle', 'walk-left', 'walk-right', 'walk-forward', 'walk-away', 'run', 'turn',
  'wave', 'point', 'sit-stand', 'jump-celebrate', 'talk', 'look-around', 'pick-up',
  'carry', 'put-down', 'trip-recover', 'enter-door', 'exit-door', 'follow', 'chase',
  'dog-walk-run', 'dog-tail-wag', 'dog-sit-lie-bark', 'book-open-close', 'page-turn',
  'book-spin', 'book-fly-off-shelf', 'book-character-out', 'book-character-return',
  'globe-spin', 'object-roll', 'bounce', 'wobble', 'float', 'swing', 'door-open-close',
  'lights-flicker', 'wind-reaction', 'party-hat-reaction',
] as const;

export function getWorldDestination(id: WorldDestinationId) {
  return WORLD_DESTINATIONS.find((destination) => destination.id === id);
}

export function motionAllowed(reducedMotion: boolean, destination: WorldDestination) {
  if (!reducedMotion) return true;
  return destination.motionGroup === 'calm';
}
