import { useId, useState, type FormEvent } from 'react';
import { API_PREFIX } from '@/lib/config';
import { updateSavedData } from '@/lib/archie/storage';

/** Only render inside a verified signed-in parent account panel. */
export default function DeleteParentAccount({ onDeleted }: { onDeleted: () => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  async function remove(event: FormEvent) {
    event.preventDefault();
    if (busy || !confirmed || !password) return;
    setBusy(true); setNotice('');
    try {
      // Better Auth verifies this password, deletes account/session rows, and
      // clears temporary AI credentials in its server-side afterDelete hook.
      const response = await fetch(`${API_PREFIX}/auth/delete-user`, {
        method: 'POST', credentials: 'include', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setNotice(response.status === 429 ? 'Please wait before trying again.' : 'The account was not deleted. Check your current password and sign-in, then try again.');
        return;
      }
      const result = await response.json();
      if (result?.success !== true || result?.message !== 'User deleted') {
        setNotice('Deletion was not confirmed. Check your account before trying again.'); return;
      }
      updateSavedData(data => ({ ...data, settings: { ...data.settings, onlineHelp: false } }));
      window.dispatchEvent(new Event('sodafom-parent-account-deleted'));
      onDeleted();
    } catch { setNotice('Deletion could not be confirmed. Check your connection and account before trying again.'); }
    finally { setPassword(''); setBusy(false); }
  }
  if (!open) return <button className="a-button" type="button" onClick={() => setOpen(true)}>Delete parent account</button>;
  return <section aria-labelledby={id} className="a-panel">
    <h3 id={id}>Permanently delete parent account</h3>
    <p>This removes your account details and active sessions, and clears your temporary AI key and model choice. This cannot be undone. It does not cancel a separate OpenAI subscription or delete learning saved on this device.</p>
    <form onSubmit={remove}>
      <label className="a-field">Current password to delete account<input type="password" autoComplete="current-password" maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} disabled={busy}/></label>
      <label className="a-check"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={busy}/>I understand that my parent account will be permanently deleted.</label>
      <div className="a-actions"><button className="a-button" type="submit" disabled={busy || !confirmed || !password}>{busy ? 'Deleting account…' : 'Permanently delete my account'}</button><button className="a-button" type="button" disabled={busy} onClick={() => { setOpen(false); setPassword(''); setConfirmed(false); setNotice(''); }}>Keep my account</button></div>
    </form>
    <p role="status">{notice}</p>
  </section>;
}
