import { useEffect, useId, useState, type FormEvent } from 'react';
import { API_PREFIX } from '@/lib/config';
import { updateSavedData } from '@/lib/archie/storage';
import DeleteParentAccount from './DeleteParentAccount';

type AccountStatus = { ready: boolean; message: string };
/** Real server sessions only; the local practice gate never grants an account. */
export default function ParentAccountPanel() {
  const id = useId();
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`${API_PREFIX}/parents/account-status`, { credentials: 'include', cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (!controller.signal.aborted) setStatus({ ready: result.ready === true, message: typeof result.message === 'string' ? result.message : 'Account setup needs checking.' });
        if (result.ready === true) {
          const session = await fetch(`${API_PREFIX}/auth/get-session`, { credentials: 'include', cache: 'no-store', signal: controller.signal });
          const data = session.ok ? await session.json() : null;
          if (!controller.signal.aborted) { setSignedIn(Boolean(data?.user?.id)); setIsOwner(data?.user?.isAdmin === true); setAccountId(typeof data?.user?.id === 'string' ? data.user.id : ''); }
        }
      } catch { if (!controller.signal.aborted) setStatus({ ready: false, message: 'Parent accounts are not connected on this preview. Learning settings still work on this device.' }); }
    })();
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!status?.ready || busy) return;
    if (mode === 'signup' && password.length < 12) { setNotice('Choose a password with at least 12 characters.'); return; }
    setBusy(true); setNotice('');
    try {
      const response = await fetch(`${API_PREFIX}/auth/${mode === 'signup' ? 'sign-up' : 'sign-in'}/email`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, ...(mode === 'signup' ? { name: 'Parent' } : {}) }),
      });
      if (!response.ok) { setNotice(response.status === 429 ? 'Please wait a little before trying again.' : 'We could not sign you in. Check your details or the account setup.'); return; }
      // A 2xx form response alone is not proof of an authenticated account.
      const check = await fetch(`${API_PREFIX}/auth/get-session`, { credentials: 'include', cache: 'no-store' });
      const session = check.ok ? await check.json() : null;
      const authenticated = Boolean(session?.user?.id);
      setSignedIn(authenticated); setIsOwner(authenticated && session.user.isAdmin === true); setAccountId(authenticated && typeof session.user.id === 'string' ? session.user.id : ''); setNotice(authenticated ? 'Your parent account is signed in.' : 'Your account request was received. Sign in after completing any account verification.');
    } catch { setNotice('Account service is unavailable. Your learning stays on this device.'); }
    finally { setPassword(''); setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    updateSavedData(data => { data.settings.onlineHelp = false; return data; });
    try {
      // Clear the temporary provider key before ending the parent session.
      const disconnect = await fetch(`${API_PREFIX}/parents/ai/disconnect`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const response = await fetch(`${API_PREFIX}/auth/sign-out`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (response.ok) { setSignedIn(false); setIsOwner(false); setNotice(disconnect.ok ? 'You have signed out.' : 'You have signed out and online help is off on this device. Server key removal was not confirmed; temporary keys expire within 30 minutes.'); } else setNotice('Sign-out did not complete. Online help is off on this device; please try again.');
    } catch { setNotice('Sign-out is unavailable. Please try again.'); }
    finally { setBusy(false); setPassword(''); }
  }
  return <section id="parent-account" className="a-panel parent-account-panel" aria-labelledby={id}>
    <h2 id={id}>Your parent account</h2>
    <p>Use your own email address and password. Children do not need an email address.</p>
    <p role="status">{status?.message ?? 'Checking parent account setup…'}</p>
    {signedIn ? <><p>You are signed in to a real parent account.</p><button className="a-button" type="button" disabled={busy} onClick={signOut}>Sign out of parent account</button></> : <>
      <div className="a-actions"><button className="a-button" type="button" aria-pressed={mode === 'signin'} onClick={() => { setMode('signin'); setPassword(''); }}>Sign in</button><button className="a-button" type="button" aria-pressed={mode === 'signup'} onClick={() => { setMode('signup'); setPassword(''); }}>Create parent account</button></div>
      <form onSubmit={submit}>
        <label className="a-field">Parent email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} disabled={!status?.ready || busy}/></label>
        <label className="a-field">Parent password<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 12 : 1} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} disabled={!status?.ready || busy}/></label>
        {mode === 'signup' && <p className="a-note">Use 12 or more characters. This is a grown-up account. Read the privacy information before creating it.</p>}
        <button className="a-button" type="submit" disabled={!status?.ready || busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create my parent account' : 'Sign in to my parent account'}</button>
      </form>
    </>}
    <p role="status">{notice}</p>
    {signedIn && accountId && <details><summary>Account setup ID</summary><p>This identifies your signed-in account for server owner setup. It is not your password.</p><label className="a-field">Account setup ID<input readOnly value={accountId} onFocus={event => event.target.select()}/></label></details>}
    {signedIn && <DeleteParentAccount onDeleted={() => { setSignedIn(false); setIsOwner(false); setNotice('Your parent account has been deleted. Learning saved on this device remains.'); }}/>}
    {signedIn && isOwner && <a className="a-button" href="/admin">Owner dashboard</a>}
    {signedIn && isOwner && <a className="a-button" href="/admin/payments">Owner payment settings</a>}
    <p className="a-note">Passwords are sent only to the app’s account server and are not saved in browser storage. This account does not yet synchronise children’s learning across devices.</p>
  </section>;
}
