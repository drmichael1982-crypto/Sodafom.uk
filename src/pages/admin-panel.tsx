import { useCallback, useEffect, useState } from 'react';
import { BarChart2, RefreshCw, Users } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import AdminPanelFull from './admin-panel-full';

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
};

type VisitStats = {
  trafficToday: number;
  trafficThisWeek: number;
  trafficThisMonth: number;
};

function formatCount(value: number) {
  return Number(value || 0).toLocaleString('en-GB');
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function AdminAccountsAndVisits() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [visits, setVisits] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch(`${API_PREFIX}/admin/list-users`, { credentials: 'include' }),
        fetch(`${API_PREFIX}/admin/stats`, { credentials: 'include' }),
      ]);

      if (!usersResponse.ok || !statsResponse.ok) {
        setUsers([]);
        setVisits(null);
        setMessage('Unlock the Admin Hub above, then press Refresh to show accounts and visit counts.');
        return;
      }

      const usersData = await usersResponse.json() as { users?: AdminUser[] };
      const statsData = await statsResponse.json() as {
        success?: boolean;
        stats?: Partial<VisitStats>;
      };

      setUsers(Array.isArray(usersData.users) ? usersData.users : []);
      setVisits({
        trafficToday: Number(statsData.stats?.trafficToday ?? 0),
        trafficThisWeek: Number(statsData.stats?.trafficThisWeek ?? 0),
        trafficThisMonth: Number(statsData.stats?.trafficThisMonth ?? 0),
      });
    } catch {
      setUsers([]);
      setVisits(null);
      setMessage('Could not load the Admin account and visit summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="bg-muted/30 px-4 pb-12 sm:px-6 lg:px-8" aria-label="Admin accounts and visits">
      <div className="mx-auto max-w-7xl rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
              <Users size={20} className="text-primary" /> Accounts &amp; visits
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Admin-only account details. Passwords and password hashes are never requested or displayed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {visits && (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ['Visits today', visits.trafficToday],
              ['Visits this week', visits.trafficThisWeek],
              ['Visits this month', visits.trafficThisMonth],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <BarChart2 size={14} /> {label}
                </div>
                <p className="text-3xl font-black text-foreground">{formatCount(Number(value))}</p>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl border border-border bg-background p-3 text-sm font-medium text-muted-foreground">
            {message}
          </div>
        )}

        {visits && (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Email</th>
                  <th className="px-4 py-3 font-bold">Account created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((account) => (
                  <tr key={account.id} className="bg-card">
                    <td className="px-4 py-3 font-bold text-foreground">{account.name || '—'}</td>
                    <td className="px-4 py-3 text-foreground">{account.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(account.created_at)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No accounts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default function AdminPanel() {
  return (
    <>
      <AdminPanelFull />
      <AdminAccountsAndVisits />
    </>
  );
}
