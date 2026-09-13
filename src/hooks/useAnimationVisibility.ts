import { useEffect, useState } from 'react';
import { observeAnimationVisibility } from '../lib/performance/animation-visibility';

/** Pause decorative work only; never use this hook to reset a lesson or game clock. */
export function useAnimationVisibility<T extends Element>() {
  const [element, ref] = useState<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
    if (!element) return;
    return observeAnimationVisibility(element, setActive);
  }, [element]);

  return { ref, active };
}
