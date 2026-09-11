import { useCallback, useEffect, useState } from 'react';
import { CHORES_STORAGE_KEY, loadFamilyChores, saveFamilyChores, type FamilyChore } from '@/lib/family-chores';

const CHORES_EVENT = 'sodafom-family-chores-change';

export function useFamilyChores() {
  const [chores, setChores] = useState<FamilyChore[]>(() => (
    typeof window === 'undefined' ? [] : loadFamilyChores(window.localStorage)
  ));

  useEffect(() => {
    const refresh = () => setChores(loadFamilyChores(window.localStorage));
    const storageRefresh = (event: StorageEvent) => {
      if (!event.key || event.key === CHORES_STORAGE_KEY) refresh();
    };
    window.addEventListener(CHORES_EVENT, refresh);
    window.addEventListener('storage', storageRefresh);
    return () => {
      window.removeEventListener(CHORES_EVENT, refresh);
      window.removeEventListener('storage', storageRefresh);
    };
  }, []);

  const updateChores = useCallback((update: FamilyChore[] | ((current: FamilyChore[]) => FamilyChore[])) => {
    const current = loadFamilyChores(window.localStorage);
    const next = typeof update === 'function' ? update(current) : update;
    saveFamilyChores(next, window.localStorage);
    setChores(next);
    window.dispatchEvent(new Event(CHORES_EVENT));
  }, []);

  return { chores, updateChores };
}
