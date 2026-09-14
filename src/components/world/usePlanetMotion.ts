import { useEffect, useState } from 'react';

/** One clock for all objects, stopped while hidden and cleaned up on unmount. */
export function usePlanetMotion() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(preference.matches);
    setPlaying(!preference.matches);
    const onPreference = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    onVisibility();
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || !visible) return;
    let frame = 0;
    let previous: number | undefined;
    const tick = (now: number) => {
      if (previous !== undefined) {
        // Cap stalled frames; returning to a tab must not fast-forward the scene.
        const delta = Math.min(Math.max(now - previous, 0), 100) / 1000;
        setSeconds(value => value + delta * speed);
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, visible, speed]);

  return { playing, setPlaying, speed, setSpeed, seconds, setSeconds, reducedMotion };
}
