/**
 * useSubscription
 *
 * Fetches the current user's subscription / trial state from
 * /api/subscription/trial-status and exposes it to the UI.
 *
 * Access is ultimately determined by the server response. The explicit
 * OPEN_TESTING_MODE gate remains separate so it cannot be enabled by editing
 * browser storage.
 */
import React, { useState } from 'react';
import { API_PREFIX } from '@/lib/config';
import { OPEN_TESTING_MODE } from '@/lib/testing-mode';

export type SubscriptionStatus =
  | 'none'
  | 'trial_active'
  | 'trial_expired'
  | 'active'
  | 'cancelled';

export interface SubscriptionState {
  loading: boolean;
  subscribed: boolean;          // true when trial_active OR active
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
  daysLeft: number | null;      // days remaining in trial (0 = expired today)
  plan: string | null;          // 'monthly' | 'annual' | 'school' | 'promo' | null
}

const DEFAULT: SubscriptionState = {
  loading: true,
  subscribed: false,
  status: 'none',
  trialEndsAt: null,
  daysLeft: null,
  plan: null,
};

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>(DEFAULT);
  React.useEffect(() => {
    let cancelled = false;

    // FOR TESTING: Always grant full access
    fetch(`${API_PREFIX}/subscription/trial-status`, { credentials: 'include' })
      .then(r => r.json())
      .then((data: {
        subscribed: boolean;
        status: string;
        trialEndsAt: string | null;
        daysLeft: number | null;
        plan: string | null;
      }) => {
        if (cancelled) return;

        const forceFullAccess = OPEN_TESTING_MODE;

        setState({
          loading: false,
          subscribed: forceFullAccess || data.subscribed,
          status: forceFullAccess ? 'active' : (data.status as SubscriptionStatus) || 'none',
          trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
          daysLeft: data.daysLeft ?? 7,
          plan: data.plan || (forceFullAccess ? 'testing' : null),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            loading: false,
            subscribed: OPEN_TESTING_MODE,
            status: OPEN_TESTING_MODE ? 'active' : 'none',
            trialEndsAt: null,
            daysLeft: null,
            plan: OPEN_TESTING_MODE ? 'testing' : null,
          });
        }
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}

// ── Demo game helpers ─────────────────────────────────────────────────────────

/** Game IDs that are always free — no paywall */
export const DEMO_GAME_IDS = new Set(['number-pop', 'spelling-bee', 'phonics-parrot']);

/** Returns true if the given game route path is a free demo game */
export function isDemoGame(pathname: string): boolean {
  return OPEN_TESTING_MODE || DEMO_GAME_IDS.has(pathname.replace(/^\/games\//, ''));
}

/** Returns true if the given game ID is a free demo game */
export function isDemoGameId(id: string): boolean {
  return OPEN_TESTING_MODE || DEMO_GAME_IDS.has(id.replace(/^game-/, ''));
}
