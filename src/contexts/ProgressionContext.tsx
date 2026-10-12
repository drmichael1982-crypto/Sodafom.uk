import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ProgressionData {
  completedGamesCount: number;
  level: number;
  unlockedWorlds: string[];
}

interface ProgressionContextValue extends ProgressionData {
  recordGameCompletion: (worldId: string, gameSlug: string) => void;
  isWorldUnlocked: (worldId: string) => boolean;
  gamesRemainingForNextLevel: number;
}

const PROGRESSION_KEY = 'sodafom_progression_v1';
export const GAMES_PER_LEVEL = 10;

const INITIAL_DATA: ProgressionData = {
  completedGamesCount: 0,
  level: 1,
  unlockedWorlds: ['maths', 'reading', 'spelling', 'science', 'geography', 'crossword'], // All unlocked for now as per requirements
};

export function levelForCompletionCount(count: number): number {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return Math.floor(safeCount / GAMES_PER_LEVEL) + 1;
}

function loadProgression(): ProgressionData {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESSION_KEY) || 'null') as Partial<ProgressionData> | null;
    if (!parsed) return INITIAL_DATA;
    const completedGamesCount = Number.isFinite(parsed.completedGamesCount)
      ? Math.max(0, Math.floor(parsed.completedGamesCount as number))
      : 0;
    return {
      completedGamesCount,
      // Recalculate instead of trusting stale or damaged saved level data.
      level: levelForCompletionCount(completedGamesCount),
      unlockedWorlds: Array.isArray(parsed.unlockedWorlds)
        ? parsed.unlockedWorlds.filter((item): item is string => typeof item === 'string')
        : INITIAL_DATA.unlockedWorlds,
    };
  } catch {
    return INITIAL_DATA;
  }
}

const ProgressionContext = createContext<ProgressionContextValue | null>(null);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressionData>(() => {
    return loadProgression();
  });

  useEffect(() => {
    localStorage.setItem(PROGRESSION_KEY, JSON.stringify(data));
  }, [data]);

  const recordGameCompletion = (worldId: string, gameSlug: string) => {
    console.log(`Recording completion for ${gameSlug} in ${worldId}`);
    setData(prev => {
      const nextCount = prev.completedGamesCount + 1;
      const nextLevel = levelForCompletionCount(nextCount);

      return {
        ...prev,
        completedGamesCount: nextCount,
        level: nextLevel,
      };
    });
  };

  const isWorldUnlocked = (worldId: string) => {
    return data.unlockedWorlds.includes(worldId);
  };

  const gamesRemainingForNextLevel = GAMES_PER_LEVEL - (data.completedGamesCount % GAMES_PER_LEVEL);

  return (
    <ProgressionContext.Provider value={{
      ...data,
      recordGameCompletion,
      isWorldUnlocked,
      gamesRemainingForNextLevel
    }}>
      {children}
    </ProgressionContext.Provider>
  );
}

export function useProgression() {
  const context = useContext(ProgressionContext);
  if (!context) throw new Error('useProgression must be used within ProgressionProvider');
  return context;
}
