import { useCallback, useEffect, useRef } from 'react';

/** Synchronous tap latch plus cancellable feedback delay. */
export function useAnswerTransition() {
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  const claim = useCallback(() => {
    if (locked.current) return false;
    locked.current = true;
    return true;
  }, []);
  const release = useCallback(() => { locked.current = false; }, []);
  const schedule = useCallback((callback: () => void, delay: number) => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(callback, delay);
  }, []);
  return { claim, release, schedule, locked };
}
