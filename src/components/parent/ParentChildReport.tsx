import { useCallback } from 'react';
import { Link } from 'react-router';
import { type ParentDashboardData, type ReportDays, type SubjectProgress } from '@/lib/parent-reports';
import { usePrivateGet } from './usePrivateGet';

const score = (value: number | null) => value === null ? 'Not assessed' : `${value}%`;
const STATUS: Record<SubjectProgress['status'], string> = {
  early: 'More marked practice needed', strength: 'Strength', practice: 'Extra support suggested', building: 'Building confidence',
};
function date(value: string) {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleDateString('en-GB') : 'Date unavailable';
}
export function parseDashboard(value: unknown, childId: number): ParentDashboardData {
  if (!value || typeof value !== 'object') throw new Error('The report response could not be read.');
  const data = value as ParentDashboardData;
  if (data.child?.id !== childId || data.report?.childId !== childId
    || !Array.isArray(data.report.categories) || !Array.isArray(data.report.subjects)
    || !Array.isArray(data.report.recent) || !Array.isArray(data.report.recommendations)
    || !Array.isArray(data.report.strengths) || !Array.isArray(data.report.needsHelp)) {
    throw new Error('The report could not be verified for this child.');
  }
  return { child: { id: data.child.id, name: data.child.name, age_group: data.child.age_group,
    total_stars: data.child.total_stars }, report: data.report };
}
export default function ParentChildReport({ childId, days }: { childId: number; days: ReportDays }) {
  const parse = useCallback((value: unknown) => parseDashboard(value, childId), [childId]);
  const { data, loading, error, reload } = usePrivateGet(`/parent/dashboard?childId=${childId}&days=${days}`, parse);
  if (loading) return <p role="status" className="rounded-2xl border p-6">Loading this child’s report…</p>;
  if (error || !data) return <section className="rounded-2xl border p-6"><p role="alert">{error || 'Report unavailable.'}</p><button type="button" onClick={reload} className="mt-3 min-h-11 rounded-xl border px-4 py-2">Retry report</button></section>;
  const { child, report } = data;
  function exportReport() {
    if (!window.confirm('Save a private copy of this child’s report? It includes their name, age group and learning results. Only share it with people you choose.')) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sodafom-child-report-${childId}-${report.to.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <article aria-labelledby="child-report-heading" className="space-y-6 rounded-3xl border-2 border-border bg-card p-5 sm:p-7">
      <header>
        <h2 id="child-report-heading" className="text-2xl font-black">{child.name}’s learning report</h2>
        <p className="mt-2">Age group {child.age_group} · {date(report.from)} to {date(report.to)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{report.totalSessions} linked activities in this report. All-time stars: {child.total_stars}.</p>
        <div className="mt-4 flex flex-wrap gap-3 print:hidden">
          <button type="button" onClick={reload} className="min-h-11 rounded-xl border px-4 py-2">Refresh report</button>
          <button type="button" onClick={exportReport} className="min-h-11 rounded-xl border px-4 py-2">Save private report</button>
          <button type="button" onClick={() => window.print()} className="min-h-11 rounded-xl border px-4 py-2">Print selected report</button>
          <Link to={`/hub/child/${childId}`} className="min-h-11 rounded-xl border px-4 py-2">Child progress page</Link>
        </div>
      </header>
      <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed">
        <p>Only activity saved to this child’s account is included. Unsaved lessons, guest games, device-only reading and homework scans will not appear here. No linked record means unknown activity, not failure.</p>
        {report.truncated && <p role="status" className="mt-2 font-bold">This is a partial report of the latest 500 saved activities. Choose a shorter period to see a less limited report.</p>}
      </div>
      <section aria-label="Progress by activity" className="grid gap-4 sm:grid-cols-2">
        {report.categories.filter(category => category.kind !== 'other' || category.sessions > 0).map(category => (
          <div key={category.kind} className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="text-lg font-bold">{category.label}</h3>
            {category.sessions ? <>
              <p className="mt-2 text-2xl font-black">{category.sessions} <span className="text-sm font-normal">saved activities</span></p>
              <p className="mt-2">Average marked score: <strong>{score(category.averageScore)}</strong></p>
              <p className="mt-1 text-sm">{category.assessed} marked · {category.minutes} recorded minutes · {category.stars} stars</p>
            </> : <p className="mt-2">No linked {category.label.toLowerCase()} activity in this period.</p>}
          </div>
        ))}
      </section>
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Strengths and support">
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950">
          <h3 className="font-bold">Strengths</h3>
          {report.strengths.length ? <ul className="mt-2 space-y-2">{report.strengths.map(item => <li key={item.subject}>{item.label}: {score(item.averageScore)} across {item.assessed} marked activities.</li>)}</ul>
            : <p className="mt-2">More marked practice is needed before identifying a consistent strength.</p>}
        </div>
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          <h3 className="font-bold">Areas needing help</h3>
          {report.needsHelp.length ? <ul className="mt-2 space-y-2">{report.needsHelp.map(item => <li key={item.subject}>{item.label}: {score(item.averageScore)} across {item.assessed} marked activities. Try one small step together.</li>)}</ul>
            : <p className="mt-2">No consistent support area has been identified from the available marked records.</p>}
        </div>
      </section>
      <section>
        <h3 className="text-lg font-bold">Subject progress</h3>
        <p className="mt-2 text-sm text-muted-foreground">Labels need at least 3 marked activities: 80% or above suggests a strength; below 60% suggests extra practice. Trends compare the earlier and later halves of at least 4 marked activities. This is a learning snapshot, not a formal assessment.</p>
        {report.subjects.length ? <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm">
          <caption className="sr-only">Marked activity scores by subject for {child.name}</caption>
          <thead><tr><th scope="col" className="p-2">Subject</th><th scope="col" className="p-2">Average</th><th scope="col" className="p-2">Progress</th></tr></thead>
          <tbody>{report.subjects.map(item => <tr key={item.subject} className="border-t">
            <th scope="row" className="p-2">{item.label}</th><td className="p-2">{score(item.averageScore)}<br />{item.assessed} marked</td>
            <td className="p-2">{STATUS[item.status]}{item.trend !== null && <span className="block">{item.trend > 0 ? '+' : ''}{item.trend} percentage points</span>}</td>
          </tr>)}</tbody>
        </table></div> : <p className="mt-3">No subject results have been linked yet.</p>}
      </section>
      <section>
        <h3 className="text-lg font-bold">Suggested next lessons</h3>
        <p className="mt-2 text-sm text-muted-foreground">You choose what happens next. Suggestions do not schedule lessons, change the child’s profile or use paid AI. Select the child and age group before starting.</p>
        <div className="mt-3 space-y-3">{report.recommendations.map(item => <div key={item.title} className="rounded-2xl border p-4">
          <h4 className="font-bold">{item.title}</h4><p className="mt-1">{item.reason}</p><p className="mt-2 text-sm">{item.guidance}</p>
          <Link to={item.href} className="mt-3 inline-block min-h-11 rounded-xl bg-primary px-4 py-2 text-primary-foreground print:hidden">{item.href === '/reading' ? 'Choose reading practice' : 'Choose a lesson'}</Link>
        </div>)}</div>
      </section>
      <section>
        <h3 className="text-lg font-bold">Recent saved activity</h3>
        {report.recent.length ? <ol className="mt-3 divide-y">{report.recent.map(item => <li key={item.id} className="py-3">
          <p className="font-semibold">{item.title}</p><p className="text-sm">{item.subject} · {item.kind === 'other' ? 'Uncategorised' : item.kind} · {date(item.completedAt)} · {score(item.score)}</p>
        </li>)}</ol> : <p className="mt-2">Saved activity will appear here after it is linked to this child.</p>}
      </section>
    </article>
  );
}
