/**
 * useSubscription
 *
 * Fetches the current user's subscription / trial state from
 * /api/subscription/trial-status and exposes it to the UI.
 *
 * FOR TESTING: Always grant full access.
 */
import React, { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';

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
  const [researchMode, setResearchMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sodafom_research_mode') === 'true';
  });

  React.useEffect(() => {
    const handleResearchChange = () => {
      setResearchMode(localStorage.getItem('sodafom_research_mode') === 'true');
    };
    window.addEventListener('sodafom_research_mode_change', handleResearchChange);
    return () => window.removeEventListener('sodafom_research_mode_change', handleResearchChange);
  }, []);

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

        const forceFullAccess = true; // GLOBAL OVERRIDE FOR CORE TESTING

        setState({
          loading: false,
          subscribed: forceFullAccess || researchMode || data.subscribed,
          status: forceFullAccess ? 'active' : (researchMode ? 'active' : (data.status as SubscriptionStatus) || 'none'),
          trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
          daysLeft: data.daysLeft ?? 7,
          plan: data.plan || (researchMode ? 'promo' : 'trial'),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            loading: false,
            subscribed: true, // TEST OVERRIDE
            status: 'active',
            trialEndsAt: null,
            daysLeft: null,
            plan: 'promo',
          });
        }
      });
    return () => { cancelled = true; };
  }, [researchMode]);

  return state;
}

// ── Demo game helpers ─────────────────────────────────────────────────────────

/** Game IDs that are always free — no paywall */
export const DEMO_GAME_IDS = new Set(['number-pop', 'spelling-bee', 'phonics-parrot']);

/** Returns true if the given game route path is a free demo game */
export function isDemoGame(pathname: string): boolean {
  return true; // FOR TESTING
}

/** Returns true if the given game ID is a free demo game */
export function isDemoGameId(id: string): boolean {
  return true; // FOR TESTING
}
