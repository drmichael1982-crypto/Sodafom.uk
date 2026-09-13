import { useState } from 'react';
import { BarChart2, Eye, Globe, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import {
  formatAdminAccountDate,
  normaliseVisitCounts,
  parseAdminAccounts,
  type AdminAccount,
  type VisitCounts,
} from '@/lib/admin-accounts';

interface AdminAccountsAndVisitsProps {
  visits: VisitCounts;
  /** Account PII is only loadable by a signed-in Better Auth administrator. */
  canViewAccounts: boolean;
}

function formatCount(value: number): string {
  return value.toLocaleString('en-GB');
}

export default function AdminAccountsAndVisits({ visits, canViewAccounts }: AdminAccountsAndVisitsProps) {
  const [accounts, setAccounts] = useState<AdminAccount[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const counts = normaliseVisitCounts(visits);

  const loadAccounts = async () => {
    if (!canViewAccounts || loading) return;

    setLoading(true);
    setMessage('');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(`${API_PREFIX}/admin/list-users`, {
        credentials: 'include',
        signal: controller.signal,
      });

      if (!response.ok) {
        setAccounts(null);
        setMessage('Account details are not available for this session.');
        return;
      }

      setAccounts(parseAdminAccounts(await response.json() as unknown));
    } catch {
      setAccounts(null);
      setMessage('Could not load account details. Please try again.');
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="accounts-visits-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="accounts-visits-heading" className="flex items-center gap-2 text-base font-black text-foreground">
            <Users size={18} className="text-primary" aria-hidden="true" /> Accounts &amp; visits
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Visit figures use the authorised Admin Hub summary. Account details never include passwords, tokens, child records, or subscription data.
          </p>
        </div>
        {canViewAccounts && (
          <button type="button" onClick={() => void loadAccounts()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:bg-muted disabled:opacity-60">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            {loading ? 'Loading accounts…' : accounts ? 'Refresh accounts' : 'Load accounts'}
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Visits today', value: counts.trafficToday, icon: Eye },
          { label: 'Visits this week', value: counts.trafficThisWeek, icon: BarChart2 },
          { label: 'Visits this month', value: counts.trafficThisMonth, icon: Globe },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-background p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"><Icon size={14} aria-hidden="true" /> {label}</p>
            <p className="mt-2 text-3xl font-black text-foreground">{formatCount(value)}</p>
          </div>
        ))}
      </div>

      {!canViewAccounts && (
        <div className="mt-5 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="status">
          <ShieldCheck size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p><strong>Authorised code testing remains available for visit figures.</strong> Sign in with an administrator account before loading any account details.</p>
        </div>
      )}

      {message && <p className="mt-4 rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground" role="status">{message}</p>}

      {canViewAccounts && accounts && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border" aria-busy={loading}>
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">Account created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.map(account => (
                <tr key={account.id} className="bg-card">
                  <td className="px-4 py-3 font-bold text-foreground">{account.name ?? '—'}</td>
                  <td className="px-4 py-3 text-foreground">{account.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatAdminAccountDate(account.createdAt)}</td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No accounts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
