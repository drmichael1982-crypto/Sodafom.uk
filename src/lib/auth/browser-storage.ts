/** Remembered email and cosmetic flags are optional, including during SSR. */
export function readBrowserStorage(kind: 'localStorage' | 'sessionStorage', key: string): string | null {
  try { return typeof window === 'undefined' ? null : window[kind].getItem(key); }
  catch { return null; }
}

export function writeBrowserStorage(kind: 'localStorage' | 'sessionStorage', key: string, value: string | null): void {
  try {
    if (typeof window === 'undefined') return;
    if (value === null) window[kind].removeItem(key);
    else window[kind].setItem(key, value);
  } catch { /* Optional storage must never block authentication or navigation. */ }
}
