/**
 * useGameLevel
 *
 * Tracks a child's adaptive difficulty level for a specific game.
 *
 * - Logged-in + active child: reads/writes via /api/children/:id/game-level/:slug
 * - Device practice with an active child: reads/writes child-scoped local progress
 * - Guest / no active child: reads/writes the legacy localStorage key `sodafom_level_<slug>`
 *
 * Level rules (applied server-side on POST, mirrored here for instant UI feedback):
 *   Device practice advances after a round earns at least two stars (max 10).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getActiveChild } from './useChildAge';
import { API_PREFIX, ARCHIE_PREVIEW } from '@/lib/config';

export interface GameLevelState {
  level: number;       // 1–5
  bestStars: number;   // highest stars ever earned at this game
  loading: boolean;
}

const LS_PREFIX = 'sodafom_level_';

type LocalLevel = { level: number; bestStars: number; playsAtLevel: number };

function activeChildId(): string | null {
  const id = getActiveChild()?.id;
  if (typeof id !== 'number' && typeof id !== 'string') return null;
  const normalised = String(id).trim();
  return normalised || null;
}

function lsKey(slug: string, childId: string | null) {
  const guestKey = `${LS_PREFIX}${slug}`;
  return childId ? `${guestKey}:child:${encodeURIComponent(childId)}` : guestKey;
}

function readLocalLevel(slug: string, childId: string | null): LocalLevel {
  const defaults = { level: 1, bestStars: 0, playsAtLevel: 0 };
  try {
    const raw = localStorage.getItem(lsKey(slug, childId));
    if (!raw) return defaults;
    const stored = JSON.parse(raw);
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return defaults;
    return {
      level: Number.isInteger(stored.level) && stored.level >= 1 && stored.level <= 10 ? stored.level : defaults.level,
      bestStars: Number.isInteger(stored.bestStars) && stored.bestStars >= 0 && stored.bestStars <= 3 ? stored.bestStars : defaults.bestStars,
      playsAtLevel: Number.isSafeInteger(stored.playsAtLevel) && stored.playsAtLevel >= 0 ? stored.playsAtLevel : defaults.playsAtLevel,
    };
  } catch { return defaults; }
}

function writeLocalLevel(slug: string, childId: string | null, data: LocalLevel) {
  try { localStorage.setItem(lsKey(slug, childId), JSON.stringify(data)); } catch { /* ignore */ }
}

export function useGameLevel(gameSlug: string): {
  level: number;
  bestStars: number;
  loading: boolean;
  /** Call after a game completes with the stars earned. Returns the new level. */
  recordResult: (stars: number) => Promise<number>;
} {
  const [childId, setChildId] = useState<string | null>(() => activeChildId());
  const [state, setState] = useState<GameLevelState>({ level: 1, bestStars: 0, loading: true });

  React.useEffect(() => {
    const refreshChild = () => setChildId(activeChildId());
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'sodafom_active_child') refreshChild();
    };
    window.addEventListener('sodafom:active-child-changed', refreshChild);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('sodafom:active-child-changed', refreshChild);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Reload whenever the selected learner changes so siblings never see each
  // other's device-only adaptive level.
  React.useEffect(() => {
    let cancelled = false;
    setState(current => ({ ...current, loading: true }));
    if (!ARCHIE_PREVIEW && childId) {
      fetch(`${API_PREFIX}/children/${childId}/game-level/${encodeURIComponent(gameSlug)}`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then((d: { level: number; bestStars: number } | null) => {
          if (cancelled) return;
          const local = readLocalLevel(gameSlug, childId);
          setState({ level: d?.level ?? local.level, bestStars: d?.bestStars ?? local.bestStars, loading: false });
        })
        .catch(() => {
          if (cancelled) return;
          // Fall back to localStorage
          const local = readLocalLevel(gameSlug, childId);
          setState({ level: local.level, bestStars: local.bestStars, loading: false });
        });
    } else {
      const local = readLocalLevel(gameSlug, childId);
      setState({ level: local.level, bestStars: local.bestStars, loading: false });
    }
    return () => { cancelled = true; };
  }, [childId, gameSlug]);

  const recordResult = useCallback(async (stars: number): Promise<number> => {
    const currentChildId = activeChildId();

    if (!ARCHIE_PREVIEW && currentChildId) {
      try {
        const res = await fetch(`${API_PREFIX}/children/${currentChildId}/game-level/${encodeURIComponent(gameSlug)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ stars }),
        });
        if (res.ok) {
          const d = await res.json() as { level: number; bestStars: number };
          if (activeChildId() === currentChildId) {
            setState({ level: d.level, bestStars: d.bestStars, loading: false });
          }
          return d.level;
        }
      } catch { /* fall through to local */ }
    }

    // Device practice / offline fallback: repeat weaker rounds before advancing.
    const local = readLocalLevel(gameSlug, currentChildId);
    let { level, bestStars, playsAtLevel } = local;
    playsAtLevel += 1;
    if (stars > bestStars) bestStars = stars;
    let newLevel = level;
    if (stars >= 2 && level < 10) { newLevel = level + 1; playsAtLevel = 0; }
    writeLocalLevel(gameSlug, currentChildId, { level: newLevel, bestStars, playsAtLevel });
    if (activeChildId() === currentChildId) {
      setState({ level: newLevel, bestStars, loading: false });
    }
    return newLevel;
  }, [gameSlug]);

  return { ...state, recordResult };
}
