import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useSession } from '@/lib/auth/auth-client';
import { API_PREFIX } from '@/lib/config';
import { REMINDER_TYPES, REMINDER_COPY, type ReminderType } from '@/lib/reminder-policy';

/** Visible-page only. No activity interruption, permission prompts, audio or catch-up queue. */
export default function ReminderNotice() {
  const { user, isAuthenticated } = useSession();
  const { pathname } = useLocation();
  const id = isAuthenticated ? user?.id : undefined;
  const allowed = ['/', '/hub', '/parent-area'].includes(pathname);
  const [notice, setNotice] = useState<{ owner: string; message: string; expires: number } | null>(null);
  useEffect(() => {
    setNotice(null);
    if (!id || !allowed) return;
    let active = true, busy = false;
    let request: AbortController | undefined;
    async function check() {
      if (!active || busy || document.visibilityState !== 'visible') return;
      setNotice(current => current && current.expires > Date.now() ? current : null);
      busy = true;
      request = new AbortController();
      const timeout = window.setTimeout(() => request?.abort(), 10000);
      try {
        const response = await fetch(`${API_PREFIX}/notifications/read?reminders=due`, {
          method: 'POST', credentials: 'include', cache: 'no-store', signal: request.signal,
          headers: { 'Content-Type': 'application/json', 'X-Sodafom-Reminders': '1' }, body: '{}',
        });
        if (!response.ok) return;
        const result = await response.json();
        const event = result.notification;
        if (active && document.visibilityState === 'visible' && event && Number.isFinite(event.at) &&
            Date.now() - event.at >= 0 && Date.now() - event.at < 600000 &&
            Array.isArray(event.types) && event.types.length > 0 && event.types.length <= REMINDER_TYPES.length &&
            event.types.every((type: string) => REMINDER_TYPES.includes(type as ReminderType))) {
          setNotice({ owner: id!, message: event.types.map((type: ReminderType) => REMINDER_COPY[type]).join(' '), expires: event.at + 600000 });
        }
      } catch { /* Fail quietly: no retries, permission prompts or duplicate alerts. */ }
      finally { window.clearTimeout(timeout); busy = false; }
    }
    const changed = () => { setNotice(null); request?.abort(); };
    const hidden = () => { if (document.visibilityState !== 'visible') { request?.abort(); setNotice(null); } };
    void check();
    const interval = window.setInterval(() => void check(), 60000);
    window.addEventListener('sodafom:reminder-settings-changed', changed);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      active = false; request?.abort(); window.clearInterval(interval);
      window.removeEventListener('sodafom:reminder-settings-changed', changed);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [id, allowed, pathname]);
  if (!allowed || !id || !notice || notice.owner !== id) return null;
  return <aside aria-label="A gentle learning reminder" className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-4 text-foreground">
    <p role="status" aria-live="polite" className="leading-relaxed">{notice.message}</p>
    <button type="button" className="mt-3 min-h-11 rounded-xl border border-border px-4 py-2 font-bold" onClick={() => setNotice(null)}>Not now — that's okay</button>
  </aside>;
}
