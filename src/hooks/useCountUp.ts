/**
 * useCountUp — animates a number from 0 to `target` over `duration` ms.
 */
import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration = 900, startDelay = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(0);
    let startTime: number | null = null;
    let raf: number;

    const delayTimer = setTimeout(() => {
      function step(ts: number) {
        if (startTime === null) startTime = ts;
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, startDelay]);

  return value;
}
