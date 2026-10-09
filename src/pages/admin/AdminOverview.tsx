import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import './payment-settings.css';
import './admin-overview.css';

type Overview = {
  registeredParents: number;
  validParentSessions: number;
  mode: 'free';
  collectionEnabled: false;
  paymentsConfigured: false;
  generatedAt: string;
};

export default function AdminOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/overview', { credentials: 'same-origin', cache: 'no-store', signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Owner overview is unavailable.');
      setOverview(data);
    } catch (failure) {
      if (failure instanceof Error && failure.name === 'AbortError') return;
      setOverview(null); setError(failure instanceof Error ? failure.message : 'Owner overview is unavailable.');
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { const abort = new AbortController(); void load(abort.signal); return () => abort.abort(); }, [load]);
  return <main className="payment-settings admin-overview">
    <Link to="/parents">← Parent hub</Link>
    <header><p className="payment-settings-eyebrow">Owner administration</p><h1>Your learning app</h1><p>Account activity, payment status and ideas for what comes next.</p></header>
    {loading && <p role="status">Checking owner access and loading current account totals…</p>}
    {error && <><p role="alert" className="payment-error">{error}</p><p><Link to="/parents">Sign in through the parent hub</Link>. This page requires the owner account authorized on the server.</p></>}
    {overview && <>
      <section aria-labelledby="owner-account-heading"><div className="admin-section-heading"><h2 id="owner-account-heading">Parent accounts</h2><button type="button" onClick={() => void load()} disabled={loading}>Refresh</button></div>
        <div className="admin-metrics"><article><strong>{overview.registeredParents.toLocaleString()}</strong><h3>Registered parents</h3><p>Accounts stored by this app’s account service.</p></article><article><strong>{overview.validParentSessions.toLocaleString()}</strong><h3>Valid sign-in sessions</h3><p>Unexpired parent sessions. One parent can have several sessions.</p></article></div>
        <p className="payment-help">Sessions are not a count of people online or children playing. Device-only learning activity is not collected here.</p>
        <p className="payment-help">Updated: {new Date(overview.generatedAt).toLocaleString()}</p>
      </section>
      <section className="payment-free-status" aria-labelledby="owner-payment-heading"><h2 id="owner-payment-heading">Payments and revenue</h2><strong>Learning is free</strong><span>Payment collection: off</span><p>No transaction collection is configured in this app. This dashboard has no collected revenue to report.</p><Link to="/admin/payments">Manage the private future payment draft →</Link></section>
      <section className="admin-ideas" aria-labelledby="owner-ideas-heading"><h2 id="owner-ideas-heading">Ideas for a future release</h2><p>These are planning ideas, not enabled features or measured trends.</p><ul>
        <li><span className="admin-idea-status">Idea</span><div><h3>Opt-in learning reports</h3><p>Help parents review completed activities across their devices with clear consent and privacy controls.</p></div></li>
        <li><span className="admin-idea-status">Idea</span><div><h3>Weekly practice suggestions</h3><p>Suggest a small next step based on a learner’s chosen age and skills they want to practise.</p></div></li>
        <li><span className="admin-idea-status">Idea</span><div><h3>Optional membership</h3><p>Review payment setup, access rules and mobile purchase requirements before adding any paid plan.</p></div></li>
      </ul></section>
    </>}
  </main>;
}
