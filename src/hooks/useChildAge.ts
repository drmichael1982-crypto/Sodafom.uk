/**
 * useChildAge
 *
 * Reads the currently active child's age group from localStorage.
 * Returns a normalised AgeGroup: '5-7' | '8-10' | '11-13'
 *
 * The hub writes 'sodafom_active_child' as JSON when a child is selected.
 * Games read it to auto-set difficulty without a manual picker.
 *
 * If no child is active (guest / no selection), returns null and games
 * fall back to their default difficulty picker.
 */

import React, { useState, useEffect } from 'react';

export type AgeGroup = '5-7' | '8-10' | '11-13';

const STORAGE_KEY = 'sodafom_active_child';

export interface ActiveChild {
  id: number;
  name: string;
  ageGroup: AgeGroup;
  avatarEmoji: string;
}

/** Normalise any age-group string (hyphens or en-dashes) to the canonical hyphen form */
export function normaliseAge(raw: string | null | undefined): AgeGroup | null {
  if (!raw) return null;
  const s = raw.replace('–', '-').trim();
  if (s === '5-7') return '5-7';
  if (s === '8-10') return '8-10';
  if (s === '11-13') return '11-13';
  return null;
}

/** Map AgeGroup → a simple numeric difficulty tier 1 | 2 | 3 */
export function ageToDifficulty(age: AgeGroup | null): 1 | 2 | 3 {
  if (age === '5-7') return 1;
  if (age === '8-10') return 2;
  return 2; // sensible middle difficulty when no age has been selected
}

export function getActiveChild(): ActiveChild | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveChild>;
    if (!parsed.id || !parsed.ageGroup) return null;
    return {
      id: parsed.id,
      name: parsed.name ?? 'Learner',
      ageGroup: normaliseAge(parsed.ageGroup) ?? '8-10',
      avatarEmoji: parsed.avatarEmoji ?? '⭐',
    };
  } catch {
    return null;
  }
}

export function setActiveChild(child: ActiveChild | null) {
  if (child) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(child));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** React hook — re-renders when the active child changes (cross-tab via storage event) */
export function useChildAge(): { child: ActiveChild | null; ageGroup: AgeGroup | null; tier: 1 | 2 | 3 } {
  const [child, setChild] = useState<ActiveChild | null>(() => {
    if (typeof window === 'undefined') return null;
    return getActiveChild();
  });

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setChild(getActiveChild());
    };
    window.addEventListener('storage', onStorage);
    // Also read on mount in case it was set before this component mounted
    setChild(getActiveChild());
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const ageGroup = child ? normaliseAge(child.ageGroup) : null;
  return { child, ageGroup, tier: ageToDifficulty(ageGroup) };
}
