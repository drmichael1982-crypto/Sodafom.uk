/**
 * /notifications — a parent-only, local reminder-planning screen.
 *
 * This screen deliberately does not request browser permission, store choices,
 * contact an API, register a service worker, or send a notification.
 */
import { useState, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Bell, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import {
  REMINDER_COPY,
  REMINDER_LABELS,
  REMINDER_TYPES,
  defaultReminderPreferences,
  parseReminderPreferences,
  type ReminderPreferences,
  type ReminderType,
} from '@/lib/reminder-policy';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const INPUT_CLASS = 'mt-1 block min-h-11 w-full rounded-xl border border-border bg-background p-3 text-foreground';
const PARENT_ROLE = 'parent';

type SessionUserWithRole = { role?: string | null };

function ParentReminderPlanner() {
  const { user } = useSession();
  const role = (user as SessionUserWithRole | null)?.role?.toLowerCase();
  const isParent = role === PARENT_ROLE;
  const [draft, setDraft] = useState<ReminderPreferences>(defaultReminderPreferences);
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  const updateRule = (type: ReminderType, update: Partial<ReminderPreferences['rules'][ReminderType]>) => {
    setDraft((current) => ({
      ...current,
      rules: {
        ...current.rules,
        [type]: { ...current.rules[type], ...update },
      },
    }));
    setFeedback(null);
  };

  const toggleDay = (type: ReminderType, day: number, checked: boolean) => {
    setDraft((current) => {
      const currentDays = current.rules[type].days;
      const days = checked
        ? [...currentDays, day].sort((left, right) => left - right)
        : currentDays.filter((value) => value !== day);
      return {
        ...current,
        rules: {
          ...current.rules,
          [type]: { ...current.rules[type], days },
        },
      };
    });
    setFeedback(null);
  };

  const resetToOff = () => {
    setDraft(defaultReminderPreferences());
    setFeedback({ kind: 'success', text: 'All reminder types are off in this local plan. Nothing was saved or sent.' });
  };

  const reviewPlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const preferences = parseReminderPreferences(draft);
      const enabled = REMINDER_TYPES.filter((type) => preferences.rules[type].enabled).length;
      setFeedback({
        kind: 'success',
        text: enabled === 0
          ? 'All reminder types are off. This local plan is safe and no device is enrolled.'
          : `${enabled} reminder ${enabled === 1 ? 'type is' : 'types are'} formatted safely for review. This preview is not saved and cannot send a notification.`,
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Check the reminder plan and try again.',
      });
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <Helmet>
        <title>Parent Reminder Plan — Sodafom</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/hub/notifications" className="inline-flex min-h-11 items-center py-3 font-bold text-primary hover:underline">
          ← Back to notifications
        </Link>

        <header className="flex items-start gap-3">
          <div className="mt-1 rounded-2xl bg-primary/10 p-3 text-primary" aria-hidden="true">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black">Parent reminder plan</h1>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Parents can review gentle learning-reminder choices. Every type starts off, and missing a day never causes a warning or penalty.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-4 leading-relaxed" aria-labelledby="delivery-status-heading">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 id="delivery-status-heading" className="font-black">Delivery is off</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This is a local planning preview only. It does not save choices to an account, request browser permission, enrol a device, or send notifications while the app is open or closed.
              </p>
            </div>
          </div>
        </section>

        {!isParent ? (
          <section className="rounded-2xl border border-border bg-card p-5" role="status">
            <h2 className="text-xl font-black">Parent account required</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              To protect children on a shared device, this reminder planner is available only to a signed-in account marked as a parent. No settings can be changed here.
            </p>
          </section>
        ) : (
          <form onSubmit={reviewPlan} className="space-y-6" noValidate>
            <fieldset className="space-y-6">
              <legend className="text-xl font-black">Plan optional reminders</legend>
              <p className="-mt-3 text-sm leading-relaxed text-muted-foreground">
                Future delivery must remain within these boundaries: daytime only, no more than two in 24 hours, at least an hour apart, no catch-up messages, and family quiet time first.
              </p>

              {REMINDER_TYPES.map((type) => {
                const rule = draft.rules[type];
                return (
                  <section key={type} className="rounded-2xl border border-border bg-card p-5">
                    <label className="flex min-h-11 items-center gap-3 text-lg font-black">
                      <input
                        type="checkbox"
                        className="h-5 w-5"
                        checked={rule.enabled}
                        onChange={(event) => updateRule(type, { enabled: event.target.checked })}
                      />
                      {REMINDER_LABELS[type]}
                    </label>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{REMINDER_COPY[type]}</p>
                    {type === 'achievements' && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Only a genuinely recorded achievement could qualify; no achievement is created by this plan.</p>
                    )}

                    <label className="mt-4 block font-bold">
                      {REMINDER_LABELS[type]} time
                      <input
                        type="time"
                        min="07:00"
                        max="19:59"
                        className={INPUT_CLASS}
                        value={rule.time}
                        onChange={(event) => updateRule(type, { time: event.target.value })}
                      />
                    </label>

                    <fieldset className="mt-4">
                      <legend className="font-bold">Days</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {DAY_ORDER.map((day) => (
                          <label key={day} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3">
                            <input
                              type="checkbox"
                              checked={rule.days.includes(day)}
                              aria-label={`${REMINDER_LABELS[type]} on ${DAYS[day]}`}
                              onChange={(event) => toggleDay(type, day, event.target.checked)}
                            />
                            <span aria-hidden="true">{DAYS[day].slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </section>
                );
              })}

              <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <h2 className="text-xl font-black">Family quiet time</h2>
                <label className="block font-bold">
                  Time zone
                  <input
                    required
                    list="reminder-timezones"
                    className={INPUT_CLASS}
                    value={draft.timeZone}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, timeZone: event.target.value }));
                      setFeedback(null);
                    }}
                  />
                  <datalist id="reminder-timezones">
                    <option value="Europe/London" />
                    <option value="Europe/Dublin" />
                    <option value="Europe/Paris" />
                    <option value="America/New_York" />
                    <option value="Australia/Sydney" />
                  </datalist>
                </label>
                <p className="text-sm leading-relaxed text-muted-foreground">Times follow this zone, including summer-time changes. Delivery must always remain quiet from 20:00 to 07:00, plus the family’s own quiet time.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block font-bold">
                    Quiet time starts
                    <input
                      required
                      type="time"
                      className={INPUT_CLASS}
                      value={draft.quietStart}
                      onChange={(event) => {
                        setDraft((current) => ({ ...current, quietStart: event.target.value }));
                        setFeedback(null);
                      }}
                    />
                  </label>
                  <label className="block font-bold">
                    Quiet time ends
                    <input
                      required
                      type="time"
                      className={INPUT_CLASS}
                      value={draft.quietEnd}
                      onChange={(event) => {
                        setDraft((current) => ({ ...current, quietEnd: event.target.value }));
                        setFeedback(null);
                      }}
                    />
                  </label>
                </div>
                <label className="block font-bold">
                  Maximum reminders in 24 hours
                  <select
                    className={INPUT_CLASS}
                    value={draft.maxPerDay}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, maxPerDay: Number(event.target.value) as 1 | 2 }));
                      setFeedback(null);
                    }}
                  >
                    <option value={1}>One</option>
                    <option value={2}>Two</option>
                  </select>
                </label>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="min-h-12 rounded-xl bg-primary px-5 py-3 font-black text-primary-foreground hover:opacity-90">
                  Review this local plan
                </button>
                <button type="button" onClick={resetToOff} className="min-h-12 rounded-xl border border-border px-5 py-3 font-black hover:bg-muted">
                  Reset every reminder to off
                </button>
              </div>
            </fieldset>
          </form>
        )}

        {feedback && (
          <p
            role={feedback.kind === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`rounded-xl border p-4 leading-relaxed ${feedback.kind === 'error' ? 'border-destructive text-destructive' : 'border-primary/30 bg-primary/5'}`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </main>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <ParentReminderPlanner />
    </ProtectedRoute>
  );
}
