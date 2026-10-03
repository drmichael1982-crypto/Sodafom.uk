import {
  Activity, BookOpenCheck, ClipboardCheck, FileCheck2, History,
  LayoutDashboard, MonitorSmartphone, ShieldCheck, UsersRound, Workflow,
} from 'lucide-react';

const sections = [
  { title: 'Admin dashboard overview', detail: 'Operational status and adult-only actions.', icon: LayoutDashboard, status: 'Ready' },
  { title: 'Worker & Gemini branches', detail: 'Review branch ownership, checks and hand-offs.', icon: Workflow, status: 'Review' },
  { title: 'QA & security traffic lights', detail: 'Green, amber and red release evidence.', icon: ShieldCheck, status: 'Ready' },
  { title: 'Parent & teacher summaries', detail: 'Aggregated administrative overview only.', icon: UsersRound, status: 'Restricted' },
  { title: 'Content approval workflow', detail: 'Lessons, reading, games and teacher content.', icon: BookOpenCheck, status: 'Review' },
  { title: 'Safety review queue', detail: 'Adult triage with approval evidence.', icon: ClipboardCheck, status: 'Ready' },
  { title: 'Visual consistency review', detail: 'Locked character, island, castle and interior checks.', icon: FileCheck2, status: 'Locked' },
  { title: 'Phone & tablet readiness', detail: 'Touch, layout, performance and accessibility checks.', icon: MonitorSmartphone, status: 'Review' },
  { title: 'Integration readiness', detail: 'Dependencies, gates, checks and review status.', icon: Activity, status: 'Blocked' },
  { title: 'Adult audit log', detail: 'Private administrative events; never child-visible.', icon: History, status: 'Restricted' },
] as const;

const statusStyle: Record<string, string> = {
  Ready: 'bg-emerald-100 text-emerald-800', Review: 'bg-amber-100 text-amber-900',
  Blocked: 'bg-red-100 text-red-800', Restricted: 'bg-slate-200 text-slate-800',
  Locked: 'bg-blue-100 text-blue-800',
};

export default function AdminBusinessSectionsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-red-400/40 bg-red-950/40 p-4 mb-6" role="note">
          <p className="font-black tracking-wide text-red-200">ADULT / PRIVATE 797 ADMIN ONLY</p>
          <p className="text-sm text-red-100/80 mt-1">No child, parent or teacher access. Separate from Ask Archie, lessons, games and the 3D world.</p>
        </div>
        <header className="mb-8">
          <p className="text-cyan-300 font-bold text-sm">KANO 797 · BUSINESS SUPPORT</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">Admin readiness centre</h1>
          <p className="text-slate-400 mt-2 max-w-3xl">Evidence-led oversight for approvals, safety, quality and integration. This area contains no child tools, prompts, memory or private child-facing links.</p>
        </header>
        <section className="grid gap-4 sm:grid-cols-2" aria-label="Private administration sections">
          {sections.map(({ title, detail, icon: Icon, status }) => (
            <article key={title} className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <div className="flex items-start justify-between gap-4">
                <Icon className="text-cyan-300" aria-hidden="true" />
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[status]}`}>{status}</span>
              </div>
              <h2 className="font-bold text-lg mt-4">{title}</h2>
              <p className="text-sm text-slate-400 mt-1">{detail}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
