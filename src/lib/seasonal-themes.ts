import { useCallback, useEffect, useState } from 'react';

/**
 * A small, local-only setting for the decorative cover used on the two home
 * screens.  It deliberately contains no child profile data and never leaves
 * the browser.
 */
export const SEASONAL_THEME_KEY = 'sodafom_seasonal_theme';
export const SEASONAL_THEME_CHANGE_EVENT = 'sodafom-seasonal-theme-change';

export type SeasonalThemeId =
  | 'everyday'
  | 'christmas'
  | 'easter'
  | 'bedtime'
  | 'birthday'
  | 'mothers-day'
  | 'fathers-day'
  | 'grandparents'
  | 'teacher-thank-you';

export interface SeasonalTheme {
  id: SeasonalThemeId;
  name: string;
  shortName: string;
  emoji: string;
  description: string;
  decorations: readonly string[];
  /** The background for a chosen cover.  Everyday keeps each page's usual background. */
  background: string | null;
  cardBackground: string;
}

export const SEASONAL_THEMES: readonly SeasonalTheme[] = [
  {
    id: 'everyday',
    name: 'Everyday Rainbow',
    shortName: 'Everyday',
    emoji: '🌈',
    description: 'Remove the special cover and return to Sodafom’s ordinary rainbow background.',
    decorations: ['⭐', '☁️', '🗝️'],
    background: null,
    cardBackground: 'linear-gradient(145deg, #1678c5 0%, #4fb4ed 48%, #2c8f51 100%)',
  },
  {
    id: 'christmas',
    name: 'Christmas',
    shortName: 'Christmas',
    emoji: '🎄',
    description: 'Snowy, twinkly colours for a cheerful Christmas cover.',
    decorations: ['❄️', '🎁', '⭐', '🦌'],
    background: 'linear-gradient(145deg, #0d5b3c 0%, #156d48 38%, #b52335 72%, #f5b82e 100%)',
    cardBackground: 'linear-gradient(145deg, #176b46 0%, #c42d40 70%, #f4c24a 100%)',
  },
  {
    id: 'easter',
    name: 'Easter',
    shortName: 'Easter',
    emoji: '🐣',
    description: 'Soft spring colours, flowers and a friendly Easter egg hunt.',
    decorations: ['🌷', '🥚', '🐰', '🌼'],
    background: 'linear-gradient(145deg, #f7b7d8 0%, #fbd7ea 38%, #a7e7c2 72%, #65bd84 100%)',
    cardBackground: 'linear-gradient(145deg, #f28cbd 0%, #fbc7de 55%, #6fc98e 100%)',
  },
  {
    id: 'bedtime',
    name: 'Bedtime Stars',
    shortName: 'Bedtime',
    emoji: '🌙',
    description: 'A calm moon-and-stars cover for a cosy bedtime learning moment.',
    decorations: ['🌙', '⭐', '☁️', '🛌'],
    background: 'linear-gradient(145deg, #0b174a 0%, #263b8c 52%, #7851a9 100%)',
    cardBackground: 'linear-gradient(145deg, #121d5d 0%, #4051aa 55%, #8b64b8 100%)',
  },
  {
    id: 'birthday',
    name: 'Birthday Celebration',
    shortName: 'Birthday',
    emoji: '🎂',
    description: 'Balloons, cake and confetti for a child’s birthday celebration.',
    decorations: ['🎈', '🎂', '🎉', '🎁'],
    background: 'linear-gradient(145deg, #7c3aed 0%, #d946a1 42%, #fb8a30 76%, #fcd34d 100%)',
    cardBackground: 'linear-gradient(145deg, #8b3df0 0%, #e454ae 55%, #f6a536 100%)',
  },
  {
    id: 'mothers-day',
    name: 'Mother’s Day',
    shortName: 'Mother’s Day',
    emoji: '💐',
    description: 'A warm, flower-filled thank-you cover for Mum or a special grown-up.',
    decorations: ['💐', '🌹', '💗', '🫶'],
    background: 'linear-gradient(145deg, #a61b63 0%, #e9559d 45%, #f5a6c8 73%, #ffd8e7 100%)',
    cardBackground: 'linear-gradient(145deg, #b5216e 0%, #ed70ad 52%, #f8b9d3 100%)',
  },
  {
    id: 'fathers-day',
    name: 'Father’s Day',
    shortName: 'Father’s Day',
    emoji: '💙',
    description: 'A bright, kind thank-you cover for Dad or a special grown-up.',
    decorations: ['💙', '⭐', '🏆', '🫶'],
    background: 'linear-gradient(145deg, #0d4e91 0%, #1479bd 42%, #3ab0ce 70%, #7dd3c7 100%)',
    cardBackground: 'linear-gradient(145deg, #1459a0 0%, #248bd1 54%, #5bc4d9 100%)',
  },
  {
    id: 'grandparents',
    name: 'Grandparents’ Day',
    shortName: 'Grandparents',
    emoji: '🧡',
    description: 'A family cover for Nan, Nanny, Grandad and every beloved grandparent.',
    decorations: ['🧡', '🏡', '🌻', '🤗'],
    background: 'linear-gradient(145deg, #8b3f1d 0%, #c46724 42%, #edb13d 72%, #fff0bd 100%)',
    cardBackground: 'linear-gradient(145deg, #9b4a22 0%, #d8782d 54%, #f2bb48 100%)',
  },
  {
    id: 'teacher-thank-you',
    name: 'Teacher Thank-you',
    shortName: 'Thank-you',
    emoji: '🍎',
    description: 'A cheerful cover for saying thank you to a teacher or classroom helper.',
    decorations: ['🍎', '✏️', '📚', '⭐'],
    background: 'linear-gradient(145deg, #55318c 0%, #7548b4 40%, #e36a88 73%, #f7c650 100%)',
    cardBackground: 'linear-gradient(145deg, #643ca1 0%, #8757c5 50%, #eb7b99 100%)',
  },
];

export const DEFAULT_SEASONAL_THEME_ID: SeasonalThemeId = 'everyday';

export function isSeasonalThemeId(value: string | null | undefined): value is SeasonalThemeId {
  return SEASONAL_THEMES.some(theme => theme.id === value);
}

export function getSeasonalTheme(themeId: SeasonalThemeId = getStoredSeasonalThemeId()): SeasonalTheme {
  return SEASONAL_THEMES.find(theme => theme.id === themeId) ?? SEASONAL_THEMES[0];
}

export function getStoredSeasonalThemeId(): SeasonalThemeId {
  if (typeof window === 'undefined') return DEFAULT_SEASONAL_THEME_ID;
  const stored = window.localStorage.getItem(SEASONAL_THEME_KEY);
  return isSeasonalThemeId(stored) ? stored : DEFAULT_SEASONAL_THEME_ID;
}

/**
 * Selects a cover locally.  Choosing Everyday deliberately removes the saved
 * key so it is a genuine reset to the normal Sodafom background.
 */
export function setSeasonalTheme(themeId: SeasonalThemeId): SeasonalThemeId {
  const nextThemeId = isSeasonalThemeId(themeId) ? themeId : DEFAULT_SEASONAL_THEME_ID;
  if (typeof window === 'undefined') return nextThemeId;

  if (nextThemeId === DEFAULT_SEASONAL_THEME_ID) {
    window.localStorage.removeItem(SEASONAL_THEME_KEY);
  } else {
    window.localStorage.setItem(SEASONAL_THEME_KEY, nextThemeId);
  }

  window.dispatchEvent(new CustomEvent<SeasonalThemeId>(SEASONAL_THEME_CHANGE_EVENT, { detail: nextThemeId }));
  return nextThemeId;
}

export interface UseSeasonalThemeResult {
  theme: SeasonalTheme;
  themeId: SeasonalThemeId;
  selectTheme: (themeId: SeasonalThemeId) => void;
  resetTheme: () => void;
}

/** Keeps Home and Archie Adventure in step when a cover changes. */
export function useSeasonalTheme(): UseSeasonalThemeResult {
  const [themeId, setThemeId] = useState<SeasonalThemeId>(getStoredSeasonalThemeId);

  useEffect(() => {
    const syncTheme = (event?: Event) => {
      const changedTheme = event instanceof CustomEvent ? event.detail : undefined;
      setThemeId(isSeasonalThemeId(changedTheme) ? changedTheme : getStoredSeasonalThemeId());
    };

    window.addEventListener(SEASONAL_THEME_CHANGE_EVENT, syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener(SEASONAL_THEME_CHANGE_EVENT, syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const selectTheme = useCallback((nextThemeId: SeasonalThemeId) => {
    setThemeId(setSeasonalTheme(nextThemeId));
  }, []);

  const resetTheme = useCallback(() => selectTheme(DEFAULT_SEASONAL_THEME_ID), [selectTheme]);

  return { theme: getSeasonalTheme(themeId), themeId, selectTheme, resetTheme };
}
