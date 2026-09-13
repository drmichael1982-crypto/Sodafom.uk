export const BIRTHDAY_STORAGE_KEY = 'sodafom_birthday_v1';
export const CHARACTER_OUTFIT_STORAGE_KEY = 'sodafom_character_outfit_v2';

export type OutfitId = 'everyday-hero' | 'annual-signup' | 'birthday-party';

export function isBirthdayToday(dateText: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false;
  const [, month, day] = dateText.split('-').map(Number);
  return now.getMonth() + 1 === month && now.getDate() === day;
}

export function getSavedBirthdayDate(rawValue: string | null): string {
  if (!rawValue) return '';
  try {
    const parsed = JSON.parse(rawValue) as { date?: unknown };
    return typeof parsed.date === 'string' ? parsed.date : '';
  } catch {
    return '';
  }
}

export function annualGiftLabel(now = new Date()): string {
  return `Annual sign-up gift ${now.getFullYear()}`;
}

export function canUseOutfit(outfitId: OutfitId, birthdayDate: string, now = new Date()): boolean {
  if (outfitId !== 'birthday-party') return true;
  return isBirthdayToday(birthdayDate, now);
}
