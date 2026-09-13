import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate, useParams } from 'react-router';
import { buildSchoolReport, percentLabel, recordMark, positiveId, SCHOOL_SUBJECTS, type ProgressRecord } from '@/lib/teacher-progress';
import { teacherRequest, TeacherApiError, downloadTeacherReport, fieldClass, buttonClass, type PupilDetail } from '../school-client';
import SchoolRecordEditor from '../SchoolRecordEditor';

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PupilDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('all');
  const [editor, setEditor] = useState<ProgressRecord | 'new' | null>(null);
  const [comment, setComment] = useState('');
  const [subject, setSubject] = useState('general');
  const [saving, setSaving] = useState(false);
  useEffect(() => { setEditor(null); setComment(''); setNotice(''); setFilter('all'); }, [studentId]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setData(null); setError('');
    if (!positiveId(studentId)) { setError('Invalid pupil ID.'); setLoading(false); return; }
    teacherRequest<PupilDetail>(`/teacher/students/${studentId}`, undefined, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        if (!result.student || !Array.isArray(result.records) || !result.summary || !result.coverage) throw new Error('The school reporting update is not yet available on this server.');
        setData(result);
      }).catch(err => {
        if (controller.signal.aborted) return;
        if (err instanceof TeacherApiError && err.status === 401) navigate('/teacher-hub/login', { replace: true });
        else setError(err instanceof Error ? err.message : 'Could not load pupil.');
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [studentId, reload, navigate]);
  function expired() { setData(null); setEditor(null); navigate('/teacher-hub/login', { replace: true }); }
  async function saveComment(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await teacherRequest(`/teacher/students/${studentId}/notes`, { noteText: comment, subject });
      setComment(''); setNotice('Teacher comment saved.'); setReload(v => v + 1);
    } catch (err) {
      if (err instanceof TeacherApiError && err.status === 401) expired();
      else setError(err instanceof Error ? err.message : 'Could not save comment.');
    } finally { setSaving(false); }
  }
  // Do not show the previous pupil's data during a route change.
  const current = data && data.student.id === Number(studentId) ? data : null;
  const visible = current?.records.filter(r => filter === 'all' || (filter === 'pending' ? r.status === 'needs_review' : r.kind === filter)) ?? [];
  return <>
    <Helmet><title>Pupil Progress | Teacher Hub | Sodafom</title><meta name="robots" content="noindex, nofollow" /></Helmet>
    <main className="min-h-screen bg-muted/30 px-4 py-8 text-foreground"><div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link to="/teacher-hub" className="font-bold text-primary underline">Back to your class</Link>
      {loading && <p role="status">Loading pupil progress…</p>}
      {error && <div role="alert" className="rounded-xl border border-destructive p-4 text-destructive">{error}<button className="ml-3 underline" onClick={() => setReload(v => v + 1)}>Retry loading</button></div>}
      {notice && <p role="status">{notice}</p>}
      {current && <>
        <header className="rounded-2xl bg-primary p-6 text-primary-foreground"><h1 className="text-3xl font-black">{current.student.avatarEmoji} {current.student.name}</h1><p>Age {current.student.ageGroup} · {current.student.totalStars} stars</p><p className="mt-2">Free school learning · Local checks only for photo marking</p></header>
        <section className="rounded-2xl border border-border bg-card p-5"><h2 className="text-xl font-bold">School progress</h2>
          <p className="mt-2">Reviewed score: {percentLabel(current.summary.percent)} · {current.summary.needsReview} items need teacher review.</p>
          <p className="mt-2 text-sm">School-linked game results plus teacher-recorded lessons, homework and reading. Private home records are not joined or inferred. Scores are weighted by possible marks; pending and unscored work are excluded.</p>
          <p className="mt-2 text-sm">Coverage: up to {current.coverage.limitPerSource} recent game results and {current.coverage.limitPerSource} teacher notes/records.</p>
          {(current.coverage.gamesTruncated || current.coverage.notesTruncated) && <p className="font-bold">The history limit was reached. This is not a lifetime report.</p>}
          {!!current.coverage.unreadableRecords && <p role="alert">{current.coverage.unreadableRecords} stored records could not be read and were excluded. Ask your school support contact to investigate.</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{Object.entries(current.summary.byKind).map(([kind, s]) => <div className="rounded-xl bg-muted p-3" key={kind}><h3 className="font-bold capitalize">{kind === 'game' ? 'Games' : kind}</h3><p>{s.count} records</p><p>{percentLabel(s.percent)}</p></div>)}</div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5"><h2 className="text-xl font-bold">Subject scores</h2>
          {!Object.keys(current.summary.bySubject).length && <p className="mt-3">No school results have been recorded yet.</p>}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{Object.entries(current.summary.bySubject).map(([name, s]) => <div key={name} className="rounded-xl bg-muted p-3"><h3 className="font-bold capitalize">{name}</h3><p>{percentLabel(s.percent)} · {s.scoredCount} scored items · {s.needsReview} pending</p></div>)}</div>
        </section>
        <div className="flex flex-wrap gap-3"><button className={buttonClass} onClick={() => { setEditor('new'); setNotice(''); }}>Add school result or photo review</button><button className={buttonClass} onClick={() => downloadTeacherReport(buildSchoolReport(current.student, current.records, current.notes.map(n => n.noteText), current.coverage), `pupil-report-${current.student.id}.txt`)}>Download private pupil report</button></div>
        {editor && <SchoolRecordEditor key={`${studentId}:${editor === 'new' ? 'new' : `${editor.id}:${editor.revision}`}`} pupilId={current.student.id} initial={editor === 'new' ? undefined : editor} onCancel={() => setEditor(null)} onSessionExpired={expired} onSaved={() => { setEditor(null); setNotice('School review saved.'); setReload(v => v + 1); }} />}
        <section className="rounded-2xl border border-border bg-card p-5"><h2 className="text-xl font-bold">Results and review queue</h2>
          <label className="mt-3 block">Show<select className={fieldClass} value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All results</option><option value="pending">Needs teacher review</option><option value="lesson">Lessons</option><option value="game">Games</option><option value="homework">Homework / handwriting</option><option value="reading">Reading</option></select></label>
          {!visible.length && <p className="mt-3">No records in this view.</p>}
          <div className="mt-4 flex flex-col gap-4">{visible.map(r => <article key={r.id} className="rounded-xl border border-border p-4"><h3 className="font-bold">{r.title}</h3><p className="capitalize">{r.kind} · {r.subject}</p><p>{r.recordedAt ? new Date(r.recordedAt).toLocaleString('en-GB') : 'Date not recorded'} · {recordMark(r)}</p>
            {r.comment && <p className="mt-2 whitespace-pre-wrap break-words">Teacher comment: {r.comment}</p>}
            {r.photoReviewed && <p className="text-sm">Teacher confirmed a photo review. No image retained.</p>}
            {r.source === 'teacher' && <button className="mt-2 font-bold text-primary underline" onClick={() => { setEditor(r); setNotice(''); }}>Review or amend this record</button>}
            {r.source === 'game' && r.status === 'needs_review' && <p className="text-sm">The recorded game mark is incomplete or invalid. Check the source result; no replacement mark has been guessed.</p>}
          </article>)}</div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5"><h2 className="text-xl font-bold">Teacher comments</h2>
          <form onSubmit={saveComment} className="mt-4 flex flex-col gap-3"><label>Subject<select className={fieldClass} value={subject} onChange={e => setSubject(e.target.value)}>{SCHOOL_SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></label><label>Comment<textarea className={fieldClass} rows={4} maxLength={3000} value={comment} required onChange={e => setComment(e.target.value)} /></label><button className={buttonClass} disabled={saving || !comment.trim()}>{saving ? 'Saving…' : 'Save teacher comment'}</button></form>
          {!current.notes.length && <p className="mt-4">No teacher comments yet.</p>}
          {current.notes.map(n => <article key={n.id} className="mt-4 border-t border-border pt-3"><p className="font-bold capitalize">{n.subject || 'general'} · {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB') : 'Date not recorded'}</p><p className="whitespace-pre-wrap break-words">{n.noteText}</p></article>)}
        </section>
        {!!current.recommendations?.length && <section className="rounded-2xl border border-border bg-card p-5"><h2 className="text-xl font-bold">Existing game recommendations</h2><p>Suggestions based on teacher notes, not a diagnosis or automatic assessment.</p>{current.recommendations.filter(r => r.path.startsWith('/games/')).map(r => <p key={r.gameId} className="mt-3"><Link className="font-bold text-primary underline" to={r.path}>{r.title}</Link> — {r.reason}</p>)}</section>}
      </>}
    </div></main>
  </>;
}
