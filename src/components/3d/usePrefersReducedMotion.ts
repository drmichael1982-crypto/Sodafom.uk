import { useEffect, useState } from "react";

import type { ReducedMotionPreference } from "./types";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function usePrefersReducedMotion(
  preference: ReducedMotionPreference = "system",
): boolean {
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(REDUCED_MOTION_QUERY).matches
      : false,
  );

  useEffect(() => {
    if (
      preference !== "system" ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersReducedMotion(event.matches);
    };

    setSystemPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference]);

  if (preference === "always") return true;
  if (preference === "never") return false;
  return systemPrefersReducedMotion;
}
