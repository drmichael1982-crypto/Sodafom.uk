import { useCallback, useEffect, useState } from 'react';
import {
  FAMILY_CHORES_CHANGE_EVENT,
  FAMILY_CHORES_STORAGE_KEY,
  loadFamilyChores,
  saveFamilyChores,
  type FamilyChore,
} from '@/lib/family-chores';

/** Keeps the small, device-local chore list in sync between open Sodafom tabs. */
export function useFamilyChores() {
  const [chores, setChores] = useState<FamilyChore[]>(() => (
    typeof window === 'undefined' ? [] : loadFamilyChores(window.localStorage)
  ));

  useEffect(() => {
    const refresh = () => setChores(loadFamilyChores(window.localStorage));
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === FAMILY_CHORES_STORAGE_KEY) refresh();
    };
    window.addEventListener(FAMILY_CHORES_CHANGE_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(FAMILY_CHORES_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const updateChores = useCallback((update: FamilyChore[] | ((current: FamilyChore[]) => FamilyChore[])) => {
    const current = loadFamilyChores(window.localStorage);
    const next = typeof update === 'function' ? update(current) : update;
    saveFamilyChores(next, window.localStorage);
    setChores(next);
    window.dispatchEvent(new Event(FAMILY_CHORES_CHANGE_EVENT));
  }, []);

  return { chores, updateChores };
}
