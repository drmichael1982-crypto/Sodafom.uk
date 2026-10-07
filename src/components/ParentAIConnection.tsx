import { useId, useState, type FormEvent } from 'react';
import { API_PREFIX } from '@/lib/config';
import { updateSavedData } from '@/lib/archie/storage';

export default function ParentAIConnection() {
  const id = useId(); const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false); const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState('Built-in learning help is free and needs no AI key.');
  async function action(path: 'connect' | 'disconnect' | 'status', event?: FormEvent) {
    event?.preventDefault(); if (busy) return;
    setBusy(true);
    if (path === 'disconnect') updateSavedData(data => { data.settings.onlineHelp = false; return data; });
    try {
      const response = await fetch(`${API_PREFIX}/parents/ai/${path}`, { credentials: 'include', cache: 'no-store', ...(path === 'status' ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(path === 'connect' ? { key: key.trim() } : {}) }) });
      const result = await response.json();
      if (!response.ok) { setNotice(response.status === 401 ? 'Sign in to a connected parent account before adding an API key.' : typeof result.error === 'string' ? result.error : 'AI setup is unavailable. Built-in help still works.'); return; }
      setConnected(result.connected === true);
      setNotice(result.connected ? 'Your OpenAI key is held temporarily on the server. Account funding and live answers have not been verified. Enable online learning help above only if you choose to use it.' : 'No individual API key is connected. Built-in help is available.');
    } catch { setNotice('AI setup is unavailable. Built-in help still works.'); }
    finally { setKey(''); setBusy(false); }
  }
  return <section className="a-panel" aria-labelledby={id}>
    <h2 id={id}>Choose how Archie helps</h2>
    <h3>Free built-in help</h3><p>Authored lessons, worked examples, hints and supported device speech work without buying AI credits. Speech recognition depends on your device and may use its online speech service.</p>
    <button className="a-button" type="button" onClick={() => { updateSavedData(data => { data.settings.onlineHelp = false; return data; }); setNotice('Built-in help selected. Online learning help is off on this device.'); }}>Use free built-in help</button>
    <h3>Optional OpenAI API · usage may be charged</h3>
    <p>A parent with an OpenAI API account can connect their own key after signing in. API usage is billed separately from ChatGPT Free or paid ChatGPT subscriptions. Review your provider’s usage limits and budget first.</p>
    <div className="a-actions"><a className="a-button" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Open my OpenAI API keys</a><a className="a-button" href="https://developers.openai.com/api/docs/pricing" target="_blank" rel="noopener noreferrer">Read API pricing</a></div>
    <form onSubmit={event => action('connect', event)}>
      <label className="a-field">Parent’s OpenAI API key<input type="password" autoComplete="off" spellCheck={false} autoCapitalize="none" value={key} maxLength={2048} onChange={e => setKey(e.target.value)} disabled={busy}/></label>
      <p className="a-note">Use this only on your own HTTPS parent hub. The key goes to Sodafom’s account server, stays in server memory for at most 30 minutes, and clears when the server restarts or you disconnect. It is never stored in this browser, bundled with the app or included in backups. Adding a key does not turn online help on.</p>
      <button className="a-button" type="submit" disabled={busy || !key.trim()}>Connect key temporarily</button>
    </form>
    <div className="a-actions"><button className="a-button" type="button" disabled={busy} onClick={() => action('status')}>Check my AI connection</button><button className="a-button" type="button" disabled={busy} onClick={() => action('disconnect')}>Disconnect key and use built-in help</button></div>
    <p role="status">{busy ? 'Checking securely…' : notice}</p>
    <p className="a-note">{connected ? 'Temporary key connected.' : 'No connection confirmed.'} Wider AI replies can be wrong. When a provider is unavailable, the app retains its built-in lesson guidance; this is the free fallback, rather than a promise of unlimited free cloud AI.</p>
  </section>;
}
