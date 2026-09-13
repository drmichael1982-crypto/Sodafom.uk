/** /notifications — parents choose gentle, optional learning reminders. */
import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import { API_PREFIX } from '@/lib/config';
import {
  REMINDER_TYPES, REMINDER_LABELS, REMINDER_COPY,
  defaultReminderPreferences, parseReminderPreferences, type ReminderPreferences,
} from '@/lib/reminder-policy';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const INPUT = 'mt-1 block min-h-11 w-full rounded-xl border border-border bg-background p-3 text-foreground';
const API = `${API_PREFIX}/notifications/read?reminders=preferences`;

function ParentReminderSettings() {
  const [draft, setDraft] = useState<ReminderPreferences>(defaultReminderPreferences);
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    let active = true;
    setReady(false);
    setError('');
    void (async () => {
      try {
        const response = await fetch(API, { method: 'POST', credentials: 'include', cache: 'no-store', signal: controller.signal, headers: { 'Content-Type': 'application/json', 'X-Sodafom-Reminders': '1' }, body: '{}' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load reminder settings.');
        const preferences = parseReminderPreferences(result.preferences);
        if (active) { setDraft(preferences); setReady(true); }
      } catch (failure) {
        if (active) setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'Could not load settings. Please try again.');
      } finally { window.clearTimeout(timeout); }
    })();
    return () => { active = false; window.clearTimeout(timeout); controller.abort(); };
  }, [retry]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setError(''); setMessage('');
    let preferences: ReminderPreferences;
    try { preferences = parseReminderPreferences(draft); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Check your settings.'); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    setBusy(true);
    // Password is sent only to the authenticated server and is never saved locally.
    const verification = password;
    setPassword('');
    try {
      const response = await fetch(`${API_PREFIX}/notifications/read?reminders=save`, {
        method: 'POST', credentials: 'include', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'X-Sodafom-Reminders': '1' },
        body: JSON.stringify({ preferences, password: verification }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save reminder settings.');
      setDraft(parseReminderPreferences(result.preferences));
      setMessage('Your reminder choices are saved. Taking a break is always fine.');
      window.dispatchEvent(new Event('sodafom:reminder-settings-changed'));
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'The save could not be confirmed. Reload to check your choices before trying again.');
    } finally { window.clearTimeout(timeout); setBusy(false); }
  }

  return <main className="min-h-screen bg-background px-4 py-8 text-foreground">
    <Helmet><title>Parent Reminder Settings — Sodafom</title><meta name="robots" content="noindex" /></Helmet>
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/hub/notifications" className="inline-block min-h-11 py-3 font-bold text-primary">← Back to notifications</Link>
      <header>
        <h1 className="text-3xl font-black">Notifications and reminders</h1>
        <p className="mt-3 leading-relaxed">Parents choose what appears and when. Every reminder starts switched off. There are no adverts, streak warnings or penalties for missing a day.</p>
      </header>
      <div className="rounded-2xl border border-border bg-muted p-4 leading-relaxed">
        <p>Reminders appear on Home, the Hub or Parent Area while the app is open. Closed-app delivery is not scheduled by this feature.</p>
        <p className="mt-2">At most two reminders in any 24 hours, at least an hour apart. Choices at the same time are combined. Missed times are skipped, not saved up.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-destructive p-4 text-destructive">{error}</p>}
      <p role="status" aria-live="polite">{message || (!ready && !error ? 'Loading your reminder choices…' : '')}</p>
      {!ready && error && <button type="button" className="min-h-11 rounded-xl border p-3 font-bold" onClick={() => setRetry(value => value + 1)}>Try loading again</button>}
      <form onSubmit={save} className="space-y-6">
        <fieldset disabled={!ready || busy} className="space-y-6 disabled:opacity-60">
          <legend className="text-xl font-bold">Choose reminder types, days and times</legend>
          {REMINDER_TYPES.map(type => {
            const rule = draft.rules[type];
            return <section key={type} className="rounded-2xl border border-border bg-card p-5">
              <label className="flex min-h-11 items-center gap-3 text-lg font-bold">
                <input type="checkbox" className="h-5 w-5" checked={rule.enabled}
                  onChange={event => { setMessage(''); setDraft(current => ({ ...current, rules: { ...current.rules, [type]: { ...current.rules[type], enabled: event.target.checked } } })); }} />
                {REMINDER_LABELS[type]}
              </label>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{REMINDER_COPY[type]}</p>
              {type === 'achievements' && <p className="mt-2 text-sm">Only shown for a newly recorded badge, never an invented achievement.</p>}
              <label className="mt-4 block font-semibold">{REMINDER_LABELS[type]} time
                <input type="time" required min="07:00" max="19:59" className={INPUT} value={rule.time}
                  onChange={event => setDraft(current => ({ ...current, rules: { ...current.rules, [type]: { ...current.rules[type], time: event.target.value } } }))} />
              </label>
              <fieldset className="mt-4"><legend className="font-semibold">{REMINDER_LABELS[type]} days</legend>
                <div className="mt-2 flex flex-wrap gap-2">{DAY_ORDER.map(day => <label key={day} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3">
                  <input type="checkbox" checked={rule.days.includes(day)} aria-label={`${REMINDER_LABELS[type]} on ${DAYS[day]}`}
                    onChange={event => setDraft(current => ({ ...current, rules: { ...current.rules, [type]: { ...current.rules[type], days: event.target.checked ? [...current.rules[type].days, day] : current.rules[type].days.filter(value => value !== day) } } }))} />
                  <span aria-hidden="true">{DAYS[day].slice(0, 3)}</span>
                </label>)}</div>
              </fieldset>
            </section>;
          })}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-bold">Family quiet times</h2>
            <label className="block font-semibold">Time zone
              <input required list="reminder-timezones" className={INPUT} value={draft.timeZone}
                onChange={event => setDraft(current => ({ ...current, timeZone: event.target.value }))} />
              <datalist id="reminder-timezones"><option value="Europe/London" /><option value="Europe/Dublin" /><option value="Europe/Paris" /><option value="America/New_York" /><option value="Australia/Sydney" /></datalist>
            </label>
            <p className="text-sm">Times follow this time zone, including its summer-time changes. Reminders are always quiet from 20:00 to 07:00.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block font-semibold">Quiet hours start<input required type="time" className={INPUT} value={draft.quietStart} onChange={event => setDraft(current => ({ ...current, quietStart: event.target.value }))} /></label>
              <label className="block font-semibold">Quiet hours end<input required type="time" className={INPUT} value={draft.quietEnd} onChange={event => setDraft(current => ({ ...current, quietEnd: event.target.value }))} /></label>
            </div>
            <label className="block font-semibold">Maximum reminders in 24 hours
              <select className={INPUT} value={draft.maxPerDay} onChange={event => setDraft(current => ({ ...current, maxPerDay: Number(event.target.value) as 1 | 2 }))}>
                <option value={1}>One</option><option value={2}>Two</option>
              </select>
            </label>
          </section>
          <button type="button" className="min-h-11 rounded-xl border border-border px-4 py-3 font-bold" onClick={() => {
            setDraft(current => ({ ...current, rules: Object.fromEntries(REMINDER_TYPES.map(type => [type, { ...current.rules[type], enabled: false }])) as ReminderPreferences['rules'] }));
            setMessage('All reminder types are off in this form. Confirm with your parent password and save to apply.');
          }}>Switch every reminder off</button>
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-bold">Parent confirmation</h2>
            <p>Enter the password for your signed-in parent account to apply any changes. This prevents children changing saved reminders on a shared device.</p>
            <label className="block font-semibold">Parent account password
              <input required type="password" name="parent-reminder-password" autoComplete="current-password" maxLength={1024} className={INPUT} value={password} onChange={event => setPassword(event.target.value)} />
            </label>
            <p className="text-sm text-muted-foreground">A parent account with a password and a child profile is required.</p>
            <button type="submit" className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{busy ? 'Saving…' : 'Save reminder choices'}</button>
          </section>
        </fieldset>
      </form>
    </div>
  </main>;
}
function AccountReminderSettings() {
  const { user } = useSession();
  // Discard passwords and preferences immediately when the signed-in account changes.
  return user ? <ParentReminderSettings key={user.id} /> : null;
}
export default function NotificationsPage() {
  return <ProtectedRoute><AccountReminderSettings /></ProtectedRoute>;
}
