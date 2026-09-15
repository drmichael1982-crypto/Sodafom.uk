/** Uses the existing child game-level API; guest progress stays on this device. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChildAge } from './useChildAge';
import { API_PREFIX } from '@/lib/config';
import { authClient } from '@/lib/auth/auth-client';
import { EMPTY_LEVEL, GameLevelPersistence, type LevelSnapshot } from '@/lib/game-level-persistence';

export interface GameLevelState {
  level: number;
  bestStars: number;
  loading: boolean;
}

export function useGameLevel(gameSlug: string): LevelSnapshot & {
  recordResult: (stars: number) => Promise<number>;
} {
  const { child } = useChildAge();
  const { data: session, isPending, error } = authClient.useSession();
  const userId = session?.user?.id;
  const childId = child?.id;
  const [, render] = useState(0);
  const persistence = useMemo(() => {
    if (typeof window === 'undefined' || isPending || error || (childId && !userId)) return null;
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* The persistence layer reports this failure. */ }
    return new GameLevelPersistence(gameSlug, userId && childId ? { userId, childId } : null, {
      storage, fetcher: (...args) => fetch(...args), apiPrefix: API_PREFIX,
    });
  }, [gameSlug, userId, childId, isPending, error]);

  useEffect(() => {
    if (!persistence) return;
    const unsubscribe = persistence.subscribe(() => render(value => value + 1));
    const refresh = () => { void persistence.load(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === persistence.cacheKey || event.key === null) refresh();
    };
    refresh();
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('online', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
      // An already-sent save may still commit. Its acknowledgement updates only
      // this instance's original account/child cache, never the next child's UI.
    };
  }, [persistence]);

  const recordResult = useCallback((stars: number) => persistence
    ? persistence.record(stars) : Promise.resolve(1), [persistence]);
  return {
    ...(persistence?.snapshot() ?? { ...EMPTY_LEVEL, loading: isPending }),
    recordResult,
  };
}
