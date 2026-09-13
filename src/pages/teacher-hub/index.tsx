import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { signOutTeacher, type TeacherProfile } from '@/lib/teacher-auth';
import { percentLabel, normaliseAgeGroup } from '@/lib/teacher-progress';
import { teacherRequest, TeacherApiError, downloadTeacherReport, fieldClass, buttonClass, type PupilSummary } from './school-client';

export default function TeacherHubDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [pupils, setPupils] = useState<PupilSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [age, setAge] = useState('all');
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('8-10');
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setPupils([]); setTeacher(null);
    Promise.all([
      teacherRequest<TeacherProfile>('/teacher/me', undefined, controller.signal),
      teacherRequest<PupilSummary[]>('/teacher/students', undefined, controller.signal),
    ]).then(([profile, rows]) => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(rows) || rows.some(p => !p.summary || !p.coverage)) throw new Error('The school reporting update is not yet available on this server.');
      setTeacher(profile); setPupils(rows);
    }).catch(err => {
      if (controller.signal.aborted) return;
      if (err instanceof TeacherApiError && err.status === 401) navigate('/teacher-hub/login', { replace: true });
      else setError(err instanceof Error ? err.message : 'Could not load your class.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload, navigate]);
  async function addPupil(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const created = await teacherRequest<PupilSummary>('/teacher/students', { name: newName, ageGroup: newAge });
      setPupils(rows => [...rows, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName(''); setAdding(false);
    } catch (err) {
      if (err instanceof TeacherApiError && err.status === 401) { setPupils([]); navigate('/teacher-hub/login', { replace: true }); }
      else setError(err instanceof Error ? err.message : 'Could not add pupil.');
    } finally { setSaving(false); }
  }
  async function logout() {
    setPupils([]); setTeacher(null); setLoading(true);
    try { await signOutTeacher(); }
    catch { window.alert('You are signed out on this device. The server could not confirm revocation; the old session expires within 12 hours.'); }
    finally { navigate('/teacher-hub/login', { replace: true }); }
  }
  const shown = pupils.filter(p => p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (age === 'all' || normaliseAgeGroup(p.ageGroup) === age));
  const pending = pupils.reduce((sum, p) => sum + p.summary.needsReview, 0);
  function classReport() {
    downloadTeacherReport(['SODAFOM — PRIVATE CLASS REPORT', teacher?.className ?? 'My Class', new Date().toISOString(),
      'School-linked records only; up to 500 recent games and 500 teacher notes/records per pupil. Scores are weighted by available marks.',
      ...shown.flatMap(p => [`\n${p.name} — age ${p.ageGroup}; ${percentLabel(p.summary.percent)}; ${p.summary.needsReview} awaiting review`,
        ...Object.entries(p.summary.byKind).map(([kind, s]) => `${kind}: ${s.count} records; ${percentLabel(s.percent)}`),
        p.coverage.gamesTruncated || p.coverage.notesTruncated ? 'History is limited; this is not a lifetime total.' : '',
        p.coverage.unreadableRecords ? `${p.coverage.unreadableRecords} unreadable records require investigation.` : '',
      ]), 'No photographs or sign-in codes are included. Keep this report within approved school processes.'].join('\n'), 'class-progress-report.txt');
  }
  return <>
    <Helmet><title>Teacher Hub | Sodafom</title><meta name="robots" content="noindex, nofollow" /></Helmet>
    <main className="min-h-screen bg-muted/30 px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary p-6 text-primary-foreground">
          <div><h1 className="text-3xl font-black">Teacher Hub</h1><p>{teacher ? `${teacher.name} · ${teacher.className || 'My Class'}` : 'Your school classroom'}</p></div>
          <div className="flex flex-wrap gap-3"><button className="rounded-xl border px-4 py-2" disabled={loading || saving} onClick={() => setReload(v => v + 1)}>Refresh</button><button className="rounded-xl border px-4 py-2" onClick={logout}>Sign out</button></div>
        </header>
        <section className="rounded-2xl border border-border bg-card p-5" aria-label="School access and privacy">
          <p className="font-bold">Free in-school learning · Local checks first · No paid AI calls for teacher marking</p>
          <p className="mt-2 text-sm">Only your class’s school-linked records are shown. Private home accounts are not linked by name. Sign out on shared devices.</p>
        </section>
        {loading && <p role="status">Loading your class…</p>}
        {error && <p role="alert" className="rounded-xl border border-destructive p-4 text-destructive">{error}</p>}
        {!loading && teacher && <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{pupils.length} pupils · {pending} items need review</h2>
            <div className="flex flex-wrap gap-3"><button className={buttonClass} onClick={() => setAdding(v => !v)}>{adding ? 'Close add pupil' : 'Add pupil'}</button><button className={buttonClass} disabled={!shown.length} onClick={classReport}>Download shown class report</button></div>
          </div>
          {adding && <form className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3" onSubmit={addPupil}>
            <label>Pupil name or school alias<input className={fieldClass} value={newName} maxLength={120} required onChange={e => setNewName(e.target.value)} autoComplete="off" /></label>
            <label>Age group<select className={fieldClass} value={newAge} onChange={e => setNewAge(e.target.value)}>{['5-7', '8-10', '11-13'].map(value => <option key={value}>{value}</option>)}</select></label>
            <button className={buttonClass} disabled={saving}>{saving ? 'Saving…' : 'Save pupil'}</button>
          </form>}
          <div className="grid gap-4 sm:grid-cols-2"><label>Find a pupil<input type="search" className={fieldClass} value={search} onChange={e => setSearch(e.target.value)} autoComplete="off" /></label>
            <label>Filter age group<select className={fieldClass} value={age} onChange={e => setAge(e.target.value)}><option value="all">All ages</option>{['5-7', '8-10', '11-13'].map(value => <option key={value}>{value}</option>)}</select></label></div>
          <p className="text-sm">Scores use reviewed marks only. No recorded work means “Not yet scored”, not zero. Open a pupil to review photos, add comments or record school learning.</p>
          {!shown.length && <p className="rounded-2xl border border-border bg-card p-6">{pupils.length ? 'No pupils match this filter.' : 'Your class is empty. Add a pupil to begin.'}</p>}
          <div className="grid gap-5 md:grid-cols-2">
            {shown.map(p => <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <Link className="text-xl font-bold text-primary underline" to={`/teacher-hub/student/${p.id}`}>{p.avatarEmoji} {p.name}</Link>
              <p className="mt-2">Age {p.ageGroup} · {p.totalStars} stars · Reviewed score: {percentLabel(p.summary.percent)}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">{Object.entries(p.summary.byKind).map(([kind, s]) => <div className="rounded-xl bg-muted p-3" key={kind}><h3 className="font-bold capitalize">{kind === 'game' ? 'Games' : kind}</h3><p>{s.count} records · {percentLabel(s.percent)}</p></div>)}</div>
              <p className="mt-3 font-bold">{p.summary.needsReview} items need teacher review</p>
              {(p.coverage.gamesTruncated || p.coverage.notesTruncated) && <p className="text-sm">Recent-history limit reached; open the pupil report for coverage details.</p>}
              {!!p.coverage.unreadableRecords && <p role="alert">{p.coverage.unreadableRecords} saved records could not be read.</p>}
              {p.notes[0] && <p className="mt-3 whitespace-pre-wrap break-words border-l-4 border-primary pl-3">{p.notes[0].noteText}</p>}
              <details className="mt-3 text-sm"><summary>Pupil sign-in code — keep private</summary><code>{p.studentCode}</code></details>
            </article>)}
          </div>
        </>}
      </div>
    </main>
  </>;
}
