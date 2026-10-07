import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Page } from './ArchiePages';

type Draft = { amountPence: number; interval: 'month' | 'year'; currency: 'gbp' };
const draftKey = 'sodafom_preview_price_draft_v1';
function readDraft(): Draft {
  try { const item = JSON.parse(localStorage.getItem(draftKey) || 'null'); if (Number.isInteger(item?.amountPence) && item.amountPence >= 1 && item.amountPence <= 100000 && ['month', 'year'].includes(item.interval)) return { amountPence: item.amountPence, interval: item.interval, currency: 'gbp' }; } catch { /* blank draft */ }
  return { amountPence: 499, interval: 'month', currency: 'gbp' };
}
/** 1182 opens device-only preview preferences. It grants no server authority. */
export default function ArchiePreviewAdmin() {
  const [unlocked, setUnlocked] = useState(false); const [pin, setPin] = useState('');
  const [draft] = useState(readDraft); const [amount, setAmount] = useState((draft.amountPence / 100).toFixed(2));
  const [interval, setInterval] = useState<'month' | 'year'>(draft.interval); const [notice, setNotice] = useState('');
  function unlock(event: FormEvent) { event.preventDefault(); if (pin === '1182') { setUnlocked(true); setPin(''); setNotice(''); } else setNotice('Check the preview code and try again.'); }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{1,4}(?:\.\d{1,2})?$/.test(amount)) { setNotice('Enter a price in pounds with up to two decimal places.'); return; }
    const pence = Math.round(Number(amount) * 100);
    if (pence < 1 || pence > 100000) { setNotice('Choose a draft price between £0.01 and £1,000.00.'); return; }
    try { localStorage.setItem(draftKey, JSON.stringify({ amountPence: pence, interval, currency: 'gbp' } satisfies Draft)); setNotice(`Draft saved on this device: £${(pence / 100).toFixed(2)} per ${interval}. No price or checkout has been changed in Stripe.`); }
    catch { setNotice('The browser could not save this draft. No Stripe setting was changed.'); }
  }
  return <Page title="Preview controls" intro="Review the school test and prepare your pricing." calm back="/parents">
    {!unlocked ? <section className="a-panel"><h2>Open device-only preview controls</h2><p>This code opens local test preferences. It is not a secure online admin login and cannot take payments, change accounts or access API keys.</p><form onSubmit={unlock}><label className="a-field">Preview code<input type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} required/></label><button className="a-button" type="submit">Open preview controls</button></form><p role="status">{notice}</p></section> : <>
      <div className="a-panel"><h2>School preview review</h2><p>The preview is free to test. Review lessons, games and artwork before asking pupils to use it with adult supervision.</p><div className="a-actions"><Link className="a-button" to="/artwork">Review page and game artwork</Link><Link className="a-button" to="/teacher">Open teacher lessons</Link><Link className="a-button" to="/parents">Parent and AI setup</Link><Link className="a-button" to="/time-lab">Try the clock lab</Link></div></div>
      <section className="a-panel"><h2>Stripe and pricing preparation</h2><p><strong>Payments are off in this school preview.</strong> These controls save a pricing draft on this device. They never create a charge or enable a live checkout.</p><form onSubmit={save}><label className="a-field">Draft price in pounds (£)<input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} required/></label><label className="a-field">Billing period<select value={interval} onChange={e => setInterval(e.target.value as 'month' | 'year')}><option value="month">Per month</option><option value="year">Per year</option></select></label><button className="a-button" type="submit">Save pricing draft</button></form><p role="status">{notice}</p><div className="a-actions"><a className="a-button" href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer">Open Stripe dashboard</a><a className="a-button" href="https://docs.stripe.com/sandboxes" target="_blank" rel="noopener noreferrer">Read sandbox setup</a></div><h3>Before live charging can be enabled</h3><ol><li>Sign in as the verified server administrator using strong account authentication.</li><li>Configure a Stripe sandbox, a restricted server key and the chosen product/price.</li><li>Verify signed subscription webhooks, cancellation and access updates.</li><li>Complete sandbox checkout, renewal, failed-payment and refund checks, then connect the intended live account.</li></ol><p className="a-note">The existing Stripe integration is preserved in the source. Its live endpoints are not enabled on this standalone preview. A four-digit preview code cannot activate them. Do not paste Stripe secret keys into this page.</p></section>
      <button className="a-button" type="button" onClick={() => { setUnlocked(false); setPin(''); setNotice(''); }}>Lock preview controls</button>
    </>}
  </Page>;
}
