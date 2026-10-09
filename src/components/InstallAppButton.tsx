import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './install-app-button.css';

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
/** Installation is initiated only after the grown-up taps this button. */
export default function InstallAppButton() {
  const [installed, setInstalled] = useState(() => window.matchMedia?.('(display-mode: standalone)').matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  useEffect(() => {
    const beforeInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const complete = () => { setInstalled(true); setHelp(false); setPrompt(null); };
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', complete);
    return () => { window.removeEventListener('beforeinstallprompt', beforeInstall); window.removeEventListener('appinstalled', complete); };
  }, []);
  useEffect(() => {
    if (!help) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closer.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHelp(false);
      if (event.key === 'Tab') { event.preventDefault(); closer.current?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', key); opener.current?.focus(); };
  }, [help]);
  async function install() {
    if (!prompt) { setHelp(true); return; }
    setBusy(true);
    try { await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === 'accepted') setInstalled(true); }
    catch { setHelp(true); }
    finally { setPrompt(null); setBusy(false); }
  }
  if (installed) return null;
  return <><button ref={opener} type="button" className="install-app-button" aria-label="Add Sodafom to your home screen" disabled={busy} onClick={install}><img src="/assets/images/sodafom-launcher-icon-v2.png" alt=""/><span>↓</span></button>{help && createPortal(<div className="install-app-overlay"><section role="dialog" aria-modal="true" aria-labelledby="install-app-title" className="install-app-help"><h2 id="install-app-title">Keep Archie on your home screen</h2><p>Ask a grown-up to help add Sodafom.</p>{ios ? <ol><li>Open this page in Safari.</li><li>Tap Share, then Add to Home Screen.</li><li>Tap Add. Use your new Sodafom icon to open the app.</li></ol> : <ol><li>Open this page in Chrome on your phone or tablet.</li><li>Open the browser menu (three dots).</li><li>Choose Install app or Add to Home screen, then follow the instructions.</li></ol>}<p>The icon opens your learning app. An internet connection is needed.</p><button ref={closer} type="button" onClick={() => setHelp(false)}>Back to learning</button></section></div>, document.body)}</>;
}
