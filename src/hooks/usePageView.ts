/**
 * usePageView — fires a lightweight hit to /api/track/pageview on every
 * route change. Import once in App.tsx or RootLayout.tsx.
 */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { API_PREFIX } from '@/lib/config';

export function usePageView() {
  const location = useLocation();

  React.useEffect(() => {
    // Fire-and-forget — never block the UI
    fetch(`${API_PREFIX}/track/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname }),
    }).catch(() => {/* best-effort */});
  }, [location.pathname]);
}
