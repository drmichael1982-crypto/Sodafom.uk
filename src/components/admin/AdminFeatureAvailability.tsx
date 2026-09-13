import { useEffect, useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router';
import { API_PREFIX } from '@/lib/config';
import { featureForPath } from './feature-controls-model';
import { readPageAvailability } from './feature-controls-client';

/** Page-opening gate only; never used for authentication, AI billing or data access. */
export function AdminFeatureAvailability({ children }: { children: ReactElement }) {
  const location = useLocation();
  // A new history entry is a new page visit, even when the pathname is the same.
  const visit = `${location.key}:${location.pathname}`;
  const feature = featureForPath(location.pathname);
  const [decision, setDecision] = useState<{ visit: string; off: boolean } | null>(null);
  useEffect(() => {
    if (!feature) return;
    const controller = new AbortController();
    void readPageAvailability(API_PREFIX, controller.signal).then(snapshot => {
      if (!controller.signal.aborted) setDecision({ visit, off: snapshot.states[feature.id] === 'off' });
    });
    return () => controller.abort();
  }, [visit, feature]);

  // Account management, owner access, cancellation and opt-out routes are never gated.
  if (!feature) return children;
  // Do not mount an activity before checking, or interrupt it on a timer mid-session.
  if (decision?.visit !== visit) {
    return <section className="min-h-64 flex items-center justify-center p-6" role="status" aria-live="polite">
      <p className="text-lg font-bold">Getting this page ready…</p>
    </section>;
  }
  if (!decision.off) return children;
  return <section className="mx-auto my-8 max-w-lg rounded-2xl border border-border bg-card p-6 text-center">
    <h1 className="text-xl font-black">{feature.label} is taking a little break</h1>
    <p className="my-4">This page is not available just now. Your saved work is still safe. Let’s choose something else.</p>
    <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 font-bold text-primary-foreground">Back to Home</Link>
  </section>;
}
