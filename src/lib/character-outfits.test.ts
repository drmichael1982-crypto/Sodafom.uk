import { describe, expect, it } from 'vitest';
import {
  annualGiftLabel,
  canUseOutfit,
  CHARACTER_OUTFIT_STORAGE_KEY,
  DEFAULT_SAVED_LOOK,
  getSavedBirthdayDate,
  getSavedLook,
  isBirthdayToday,
  LEGACY_ARCHIE_OUTFIT_STORAGE_KEY,
} from './character-outfits';

describe('character outfit rewards', () => {
  const now = new Date('2026-09-13T12:00:00Z');

  it('keeps the annual sign-up outfit available for free', () => {
    expect(canUseOutfit('annual-signup', '', now)).toBe(true);
    expect(annualGiftLabel(now)).toBe('Annual sign-up gift 2026');
  });

  it('unlocks the birthday outfit only on the saved birthday', () => {
    expect(isBirthdayToday('2018-09-13', now)).toBe(true);
    expect(canUseOutfit('birthday-party', '2018-09-13', now)).toBe(true);
    expect(canUseOutfit('birthday-party', '2018-09-14', now)).toBe(false);
  });

  it('reads the established birthday storage shape safely', () => {
    expect(getSavedBirthdayDate('{"childName":"Sam","date":"2018-09-13"}')).toBe('2018-09-13');
    expect(getSavedBirthdayDate('not-json')).toBe('');
  });

  it('preserves a legacy Archie-only customisation until the next save', () => {
    const look = getSavedLook(null, JSON.stringify({
      colour: '#16a34a',
      badge: '📚',
      accessory: '🎧',
    }));

    expect(look).toEqual({
      characterId: 'archie',
      outfitId: 'everyday-hero',
      colour: '#16a34a',
      badge: '📚',
      accessory: '🎧',
    });
  });

  it('uses a valid v2 choice in preference to the legacy key', () => {
    const current = JSON.stringify({ characterId: 'bella', outfitId: 'annual-signup', colour: '#9333ea', badge: '⭐', accessory: '👑' });
    const legacy = JSON.stringify({ colour: '#16a34a', badge: '📚', accessory: '🎧' });

    expect(getSavedLook(current, legacy)).toMatchObject({ characterId: 'bella', outfitId: 'annual-signup' });
    expect(CHARACTER_OUTFIT_STORAGE_KEY).toBe('sodafom_character_outfit_v2');
    expect(LEGACY_ARCHIE_OUTFIT_STORAGE_KEY).toBe('sodafom_archie_outfit_v1');
  });

  it('falls back safely for malformed storage', () => {
    expect(getSavedLook('not-json', '{}')).toEqual(DEFAULT_SAVED_LOOK);
  });
});
