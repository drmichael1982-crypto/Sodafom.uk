import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { AdminPaymentSettings } from '@/lib/archie/payment-settings';
import './payment-settings.css';

export default function PaymentSettings() {
  const [settings, setSettings] = useState<AdminPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draftEnabled, setDraftEnabled] = useState(false);
  const [linkLabel, setLinkLabel] = useState('');
  const [signupUrl, setSignupUrl] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/admin/payments', { credentials: 'same-origin', signal: abort.signal, cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Owner settings are unavailable.');
        setSettings(data); setDraftEnabled(data.draftEnabled); setLinkLabel(data.linkLabel); setSignupUrl(data.signupUrl);
      }).catch(failure => { if (failure.name !== 'AbortError') setError(failure.message || 'Owner settings are unavailable.'); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/payments', { method: 'PUT', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftEnabled, linkLabel, signupUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The draft could not be saved.');
      setSettings(data); setDraftEnabled(data.draftEnabled); setLinkLabel(data.linkLabel); setSignupUrl(data.signupUrl);
      setNotice('Draft saved. Learning is still free and payments are off.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The draft could not be saved.'); }
    finally { setSaving(false); }
  }
  return <main className="payment-settings">
    <Link to="/admin">← Owner overview</Link>
    <header><p className="payment-settings-eyebrow">Owner administration</p><h1>Future payment settings</h1><p>Prepare a private payment-link draft for a future release.</p></header>
    <section className="payment-free-status" aria-label="Current payment status"><strong>Learning is free</strong><span>Payment collection: off</span><p>Saving this form does not start checkout, subscriptions or charges. The draft is visible only to the authorized owner.</p></section>
    {loading && <p role="status">Checking owner access…</p>}
    {error && <p role="alert" className="payment-error">{error}</p>}
    {!loading && !settings && <p><Link to="/parents">Sign in through the parent hub</Link>. Owner access must be granted on the server.</p>}
    {settings && <form onSubmit={save}>
      <h2>Private draft</h2><p>{settings.message}</p>
      <fieldset disabled={saving || !settings.editable}>
        <label className="payment-toggle"><input type="checkbox" checked={draftEnabled} onChange={event => setDraftEnabled(event.target.checked)} /> Mark draft ready for a future review</label>
        <p className="payment-help">This marker does not enable or publish the payment link.</p>
        <label htmlFor="payment-link-label">Link label</label><input id="payment-link-label" value={linkLabel} onChange={event => setLinkLabel(event.target.value)} maxLength={80} required={draftEnabled} placeholder="For example: Parent membership" />
        <label htmlFor="payment-signup-url">Future public signup link</label><input id="payment-signup-url" type="url" value={signupUrl} onChange={event => setSignupUrl(event.target.value)} maxLength={2048} required={draftEnabled} placeholder="https://…" aria-describedby="payment-url-help" />
        <p id="payment-url-help" className="payment-help">Optional HTTPS destination supplied by your payment provider. Do not enter API keys, passwords or private links. The app does not contact this link.</p>
        <button type="submit">{saving ? 'Saving…' : 'Save private draft'}</button>
      </fieldset>
      {settings.updatedAt && <p className="payment-help">Last saved: {new Date(settings.updatedAt).toLocaleString()}</p>}
      {notice && <p role="status" className="payment-save-status">{notice}</p>}
    </form>}
  </main>;
}
