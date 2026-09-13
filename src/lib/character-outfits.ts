/**
 * Local-only character and outfit preferences.
 *
 * These values are deliberately kept in the browser. They are decorative
 * choices, not profile data, and this module never sends them to an API.
 */
export const BIRTHDAY_STORAGE_KEY = 'sodafom_birthday_v1';
export const CHARACTER_OUTFIT_STORAGE_KEY = 'sodafom_character_outfit_v2';
export const LEGACY_ARCHIE_OUTFIT_STORAGE_KEY = 'sodafom_archie_outfit_v1';

export type CharacterId = 'archie' | 'mia' | 'toby' | 'bella' | 'penny' | 'soda-bot';
export type OutfitId = 'everyday-hero' | 'annual-signup' | 'birthday-party';

export interface SavedLook {
  characterId: CharacterId;
  outfitId: OutfitId;
  colour: string;
  badge: string;
  accessory: string;
}

const CHARACTER_IDS: CharacterId[] = ['archie', 'mia', 'toby', 'bella', 'penny', 'soda-bot'];
const OUTFIT_IDS: OutfitId[] = ['everyday-hero', 'annual-signup', 'birthday-party'];

export const DEFAULT_SAVED_LOOK: SavedLook = {
  characterId: 'archie',
  outfitId: 'everyday-hero',
  colour: '#2563eb',
  badge: '🗝️',
  accessory: 'None',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseLook(rawValue: string | null): Partial<SavedLook> | null {
  if (!rawValue) return null;

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!isRecord(parsed)) return null;

    const hasRecognisedValue = ['characterId', 'outfitId', 'colour', 'badge', 'accessory']
      .some(key => typeof parsed[key] === 'string');
    if (!hasRecognisedValue) return null;

    return parsed as Partial<SavedLook>;
  } catch {
    return null;
  }
}

function normaliseLook(parsed: Partial<SavedLook>): SavedLook {
  return {
    characterId: CHARACTER_IDS.includes(parsed.characterId as CharacterId)
      ? parsed.characterId as CharacterId
      : DEFAULT_SAVED_LOOK.characterId,
    outfitId: OUTFIT_IDS.includes(parsed.outfitId as OutfitId)
      ? parsed.outfitId as OutfitId
      : DEFAULT_SAVED_LOOK.outfitId,
    colour: typeof parsed.colour === 'string' && parsed.colour ? parsed.colour : DEFAULT_SAVED_LOOK.colour,
    badge: typeof parsed.badge === 'string' && parsed.badge ? parsed.badge : DEFAULT_SAVED_LOOK.badge,
    accessory: typeof parsed.accessory === 'string' && parsed.accessory ? parsed.accessory : DEFAULT_SAVED_LOOK.accessory,
  };
}

/**
 * Read the current key first and gracefully fall back to the original Archie
 * customisation key. Saving later writes the normalised value only to v2,
 * leaving an older device's data untouched until that point.
 */
export function getSavedLook(currentValue: string | null, legacyValue: string | null): SavedLook {
  const current = parseLook(currentValue);
  if (current) return normaliseLook(current);

  const legacy = parseLook(legacyValue);
  if (legacy) return normaliseLook(legacy);

  return { ...DEFAULT_SAVED_LOOK };
}

export function isBirthdayToday(dateText: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false;
  const [, month, day] = dateText.split('-').map(Number);
  return now.getMonth() + 1 === month && now.getDate() === day;
}

/** Safely reads the established local Birthday-page storage shape. */
export function getSavedBirthdayDate(rawValue: string | null): string {
  if (!rawValue) return '';

  try {
    const parsed: unknown = JSON.parse(rawValue);
    return isRecord(parsed) && typeof parsed.date === 'string' ? parsed.date : '';
  } catch {
    return '';
  }
}

export function annualGiftLabel(now = new Date()): string {
  return `Annual sign-up gift ${now.getFullYear()}`;
}

export function canUseOutfit(outfitId: OutfitId, birthdayDate: string, now = new Date()): boolean {
  return outfitId !== 'birthday-party' || isBirthdayToday(birthdayDate, now);
}
