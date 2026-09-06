/**
 * useGameLevel
 *
 * Tracks a child's adaptive difficulty level for a specific game.
 *
 * - Logged-in + active child: reads/writes via /api/children/:id/game-level/:slug
 * - Guest / no active child: reads/writes via localStorage key `sodafom_level_<slug>`
 *
 * Level rules (applied server-side on POST, mirrored here for instant UI feedback):
 *   Every completed ten-question round advances one level (max 10).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getActiveChild } from './useChildAge';
import { API_PREFIX } from '@/lib/config';

export interface GameLevelState {
  level: number;       // 1–5
  bestStars: number;   // highest stars ever earned at this game
  loading: boolean;
}

const LS_PREFIX = 'sodafom_level_';

function lsKey(slug: string) { return `${LS_PREFIX}${slug}`; }

function readLocalLevel(slug: string): { level: number; bestStars: number; playsAtLevel: number } {
  try {
    const raw = localStorage.getItem(lsKey(slug));
    if (!raw) return { level: 1, bestStars: 0, playsAtLevel: 0 };
    return JSON.parse(raw) as { level: number; bestStars: number; playsAtLevel: number };
  } catch { return { level: 1, bestStars: 0, playsAtLevel: 0 }; }
}

function writeLocalLevel(slug: string, data: { level: number; bestStars: number; playsAtLevel: number }) {
  try { localStorage.setItem(lsKey(slug), JSON.stringify(data)); } catch { /* ignore */ }
}

export function useGameLevel(gameSlug: string): {
  level: number;
  bestStars: number;
  loading: boolean;
  /** Call after a game completes with the stars earned. Returns the new level. */
  recordResult: (stars: number) => Promise<number>;
} {
  const [state, setState] = useState<GameLevelState>({ level: 1, bestStars: 0, loading: true });

  // Load on mount
  React.useEffect(() => {
    const child = getActiveChild();
    if (child?.id) {
      fetch(`${API_PREFIX}/children/${child.id}/game-level/${encodeURIComponent(gameSlug)}`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then((d: { level: number; bestStars: number } | null) => {
          setState({ level: d?.level ?? 1, bestStars: d?.bestStars ?? 0, loading: false });
        })
        .catch(() => {
          // Fall back to localStorage
          const local = readLocalLevel(gameSlug);
          setState({ level: local.level, bestStars: local.bestStars, loading: false });
        });
    } else {
      const local = readLocalLevel(gameSlug);
      setState({ level: local.level, bestStars: local.bestStars, loading: false });
    }
  }, [gameSlug]);

  const recordResult = useCallback(async (stars: number): Promise<number> => {
    const child = getActiveChild();

    if (child?.id) {
      try {
        const res = await fetch(`${API_PREFIX}/children/${child.id}/game-level/${encodeURIComponent(gameSlug)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ stars }),
        });
        if (res.ok) {
          const d = await res.json() as { level: number; bestStars: number };
          setState({ level: d.level, bestStars: d.bestStars, loading: false });
          return d.level;
        }
      } catch { /* fall through to local */ }
    }

    // Guest / offline fallback — mirror server logic locally
    const local = readLocalLevel(gameSlug);
    let { level, bestStars, playsAtLevel } = local;
    playsAtLevel += 1;
    if (stars > bestStars) bestStars = stars;
    let newLevel = level;
    if (level < 10) { newLevel = level + 1; playsAtLevel = 0; }
    writeLocalLevel(gameSlug, { level: newLevel, bestStars, playsAtLevel });
    setState({ level: newLevel, bestStars, loading: false });
    return newLevel;
  }, [gameSlug]);

  return { ...state, recordResult };
}
