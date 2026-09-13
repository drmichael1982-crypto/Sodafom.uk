import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { API_PREFIX } from '@/lib/config';
import { usePrivateGet } from './usePrivateGet';

interface Subscription { subscribed: boolean; plan?: string; expiresAt?: string | null }
export function parseSubscription(value: unknown): Subscription {
  if (!value || typeof value !== 'object' || !('subscribed' in value) || typeof value.subscribed !== 'boolean') {
    throw new Error('Subscription status could not be verified.');
  }
  const item = value as Record<string, unknown>;
  if (item.error) throw new Error('Subscription status could not be verified.');
  return { subscribed: item.subscribed as boolean, plan: typeof item.plan === 'string' ? item.plan : undefined,
    expiresAt: typeof item.expiresAt === 'string' ? item.expiresAt : null };
}

/** Uses the existing subscription API. No Stripe keys, prices or billing rules are changed here. */
export default function ParentSubscriptionStatus() {
  const { data, loading, error, reload } = usePrivateGet('/subscription', parseSubscription);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const active = useRef(true);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; controller.current?.abort(); };
  }, []);
  const canCancel = data?.subscribed && (data.plan === 'monthly' || data.plan === 'annual');
  async function cancelSubscription() {
    if (!canCancel || inFlight.current) return;
    if (!window.confirm('Cancel your subscription? The current Sodafom cancellation service ends paid access immediately. This does not delete child reports. Continue?')) return;
    inFlight.current = true;
    setBusy(true);
    setMessage('');
    const request = new AbortController();
    controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 20_000);
    try {
      const response = await fetch(`${API_PREFIX}/subscription/cancel`, {
        method: 'POST', credentials: 'include', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}), signal: request.signal,
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== 'object' || !('ok' in result) || result.ok !== true) {
        throw new Error('Unconfirmed cancellation');
      }
      if (active.current) { setMessage('Cancellation confirmed. Paid access has ended.'); reload(); }
    } catch {
      if (active.current) {
        setMessage('Cancellation could not be confirmed. Refresh the subscription status before trying again.');
        reload();
      }
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
      if (active.current) setBusy(false);
    }
  }
  const expiry = data?.expiresAt ? new Date(data.expiresAt) : null;
  return (
    <section aria-labelledby="parent-subscription-heading" className="rounded-2xl border border-border bg-card p-5 print:hidden">
      <h2 id="parent-subscription-heading" className="text-lg font-bold">Subscription</h2>
      {loading && <p role="status">Checking subscription status…</p>}
      {error && <p role="alert" className="mt-2 text-destructive">{error} No payment status is assumed.</p>}
      {data && <p className="mt-2">{data.subscribed ? `Active ${data.plan ?? ''} plan` : 'No active paid subscription is reported by the account service.'}</p>}
      {expiry && Number.isFinite(expiry.getTime()) && <p className="mt-1 text-sm">Recorded access expiry: {expiry.toLocaleDateString('en-GB')}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={reload} disabled={loading || busy} className="min-h-11 rounded-xl border px-4 py-2 disabled:opacity-50">Refresh status</button>
        <Link to="/hub/subscription" className="min-h-11 rounded-xl border px-4 py-2">Manage subscription</Link>
        {canCancel && <button type="button" disabled={busy || loading} onClick={() => void cancelSubscription()} className="min-h-11 rounded-xl border border-destructive px-4 py-2 text-destructive disabled:opacity-50">{busy ? 'Confirming cancellation…' : 'Cancel subscription'}</button>}
      </div>
      {canCancel && <p className="mt-3 text-sm text-muted-foreground">Cancellation uses the existing service and ends paid access immediately. You will be asked to confirm.</p>}
      {message && <p role="status" className="mt-3 font-semibold">{message}</p>}
    </section>
  );
}
