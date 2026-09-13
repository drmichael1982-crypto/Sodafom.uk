import { describe, expect, it } from 'vitest';
import { annualGiftLabel, canUseOutfit, getSavedBirthdayDate, isBirthdayToday } from './character-outfits';

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

  it('reads the existing birthday page storage shape safely', () => {
    expect(getSavedBirthdayDate('{"childName":"Sam","date":"2018-09-13"}')).toBe('2018-09-13');
    expect(getSavedBirthdayDate('not-json')).toBe('');
  });
});
