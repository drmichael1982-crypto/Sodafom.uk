/** Parent-only dashboard. Child reports are never sourced from shared device memory. */
import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import { parseChildren, REPORT_DAYS, type ReportDays } from '@/lib/parent-reports';
import ParentChildReport from '@/components/parent/ParentChildReport';
import ParentSubscriptionStatus from '@/components/parent/ParentSubscriptionStatus';
import { usePrivateGet } from '@/components/parent/usePrivateGet';

function ParentDashboardInner({ parentName }: { parentName: string }) {
  const { data: children, loading, error, reload } = usePrivateGet('/children', parseChildren);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [days, setDays] = useState<ReportDays>(30);
  const selected = children?.find(child => child.id === selectedId) ?? children?.[0];
  return (
    <>
      <Helmet><title>Parent Dashboard — Sodafom</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 text-foreground">
        <header className="print:hidden">
          <h1 className="text-3xl font-black">Parent Dashboard</h1>
          <p className="mt-2">Welcome, {parentName}. Choose a child to view their progress.</p>
          <nav aria-label="Parent account links" className="mt-4 flex flex-wrap gap-3">
            <Link to="/hub" className="min-h-11 rounded-xl border px-4 py-2">Profiles and add child</Link>
            <Link to="/parent-dashboard/chores" className="min-h-11 rounded-xl border px-4 py-2">Manage chores</Link>
            <Link to="/certificates" className="min-h-11 rounded-xl border px-4 py-2">Certificates</Link>
          </nav>
        </header>
        <section aria-label="Report privacy" className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed print:hidden">
          <p>Reports are requested through your signed-in account and checked against child ownership. This dashboard does not use shared device tutor memory, publish reports or automatically email them. Save or print a report only when you choose, and sign out when using a shared device.</p>
        </section>
        <ParentSubscriptionStatus />
        <section aria-label="Choose child and reporting period" className="space-y-4 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Your children</h2>
            <button type="button" onClick={reload} disabled={loading} className="min-h-11 rounded-xl border px-4 py-2 disabled:opacity-50">Refresh profiles</button>
          </div>
          {loading && <p role="status">Loading child profiles…</p>}
          {error && <p role="alert" className="text-destructive">{error}</p>}
          {children?.length === 0 && <p>No child profiles are linked yet. <Link className="font-bold underline" to="/hub">Add a child in the Hub.</Link></p>}
          {children && children.length > 0 && <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children.map(child => (
              <button key={child.id} type="button" aria-pressed={selected?.id === child.id} onClick={() => setSelectedId(child.id)}
                className={`min-h-24 rounded-2xl border-2 p-4 text-left ${selected?.id === child.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className="block text-lg font-bold">{child.name}</span><span className="mt-1 block text-sm">Age group {child.age_group} · {child.total_stars} all-time stars</span>
              </button>
            ))}</div>
            <label className="flex flex-wrap items-center gap-3 font-semibold" htmlFor="parent-report-period">Report period
              <select id="parent-report-period" value={days} onChange={event => setDays(Number(event.target.value) as ReportDays)} className="min-h-11 rounded-xl border bg-card px-4 py-2">
                {REPORT_DAYS.map(value => <option key={value} value={value}>Last {value} days</option>)}
              </select>
            </label>
          </>}
        </section>
        {!loading && !error && selected && <ParentChildReport key={`${selected.id}:${days}`} childId={selected.id} days={days} />}
      </main>
    </>
  );
}
function ParentDashboardSession() {
  const { user, isPending } = useSession();
  if (isPending || !user) return <p role="status" className="p-6">Checking parent sign-in…</p>;
  // A change of parent destroys every previous child's report and outstanding request.
  return <ParentDashboardInner key={user.id} parentName={user.name?.split(' ')[0] || 'Parent'} />;
}
export default function ParentDashboardPage() {
  return <ProtectedRoute redirectTo="/hub/login"><ParentDashboardSession /></ProtectedRoute>;
}
