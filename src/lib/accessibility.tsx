/**
 * Accessibility context — dyslexia-friendly font, high contrast, large text.
 * Settings are persisted to localStorage and applied as CSS classes on <html>.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface AccessibilitySettings {
  dyslexia: boolean;
  highContrast: boolean;
  largeText: boolean;
}

const DEFAULTS: AccessibilitySettings = {
  dyslexia: false,
  highContrast: false,
  largeText: false,
};

const STORAGE_KEY = 'sodafom-a11y';

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  toggle: (key: keyof AccessibilitySettings) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  settings: DEFAULTS,
  toggle: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // Apply CSS classes to <html> whenever settings change
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('a11y-dyslexia', settings.dyslexia);
    html.classList.toggle('a11y-high-contrast', settings.highContrast);
    html.classList.toggle('a11y-large-text', settings.largeText);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const toggle = (key: keyof AccessibilitySettings) => {
    setSettings((prev) => {
      const current = key === 'dyslexia' ? prev.dyslexia : key === 'highContrast' ? prev.highContrast : prev.largeText;
      return { ...prev, [key]: !current };
    });
  };

  return (
    <AccessibilityContext.Provider value={{ settings, toggle }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
