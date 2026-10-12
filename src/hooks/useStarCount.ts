/**
 * useStarCount
 * Returns the total stars for the first (active) child of the logged-in user.
 * Refreshes every 60 s and on window focus.
 */
import React, { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';

interface Child { id: number; totalStars: number; }

export function useStarCount(): { stars: number | null; loading: boolean } {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`${API_PREFIX}/children`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then((children: Child[]) => {
        if (children.length > 0) {
          const total = children.reduce((sum, c) => sum + (c.totalStars ?? 0), 0);
          setStars(total);
        } else {
          setStars(null);
        }
      })
      .catch(() => setStars(null))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, []);

  return { stars, loading };
}
