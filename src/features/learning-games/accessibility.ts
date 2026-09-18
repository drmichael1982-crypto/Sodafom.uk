import { useEffect, useState } from "react";

export interface LearningGameAccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
}

const DEFAULT_PREFERENCES: LearningGameAccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  largerText: false,
};

export function useLearningGameAccessibility(
  overrides: Partial<LearningGameAccessibilityPreferences> = {},
): LearningGameAccessibilityPreferences {
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return {
    ...DEFAULT_PREFERENCES,
    ...overrides,
    reducedMotion: overrides.reducedMotion ?? systemReducedMotion,
  };
}
