import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { teacherRequest, TeacherApiError, exportTeacherCsv } from '@/lib/teacher-api';
import { getTeacherToken } from '@/lib/teacher-auth';
import { SUBJECTS, ACTIVITY_KINDS, activityKind, scorePercent, type ActivityRecord, type SavedReview, type summariseProgress } from '@/lib/teacher-school';
import WorkReviewForm, { type ReviewDraft } from '../WorkReviewForm';
interface Detail {
  student: { id: number; name: string; ageGroup: string; totalStars: number };
  activity: ActivityRecord[];
  notes: { id: number; subject: string | null; noteText: string; createdAt: string | null }[];
  reviews: SavedReview[]; progress: ReturnType<typeof summariseProgress>; historyLimited: boolean; historyScope: string; invalidReviewCount: number;
  recommendations: { gameId: string; title: string; path: string; reason: string }[];
}
function percent(value: number | null) { return value === null ? 'Not assessed' : `${value}%`; }
function date(value: string | Date | null) { return value ? new Date(value).toLocaleDateString('en-GB') : 'Date not recorded'; }
export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  // A route change gets a fresh form and immediately discards the previous pupil's photo.
  return <StudentRecord key={studentId} studentId={studentId ?? ''} />;
}
function StudentRecord({ studentId }: { studentId: string }) {
  const navigate = useNavigate();
  const [data, setData] = useState<Detail | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [editing, setEditing] = useState<SavedReview | null | undefined>(undefined), [comment, setComment] = useState(''), [subject, setSubject] = useState('general'), [savingComment, setSavingComment] = useState(false);
  const [notice, setNotice] = useState('');
  const showError = useCallback((reason: unknown) => {
    if (reason instanceof TeacherApiError && reason.status === 401) { setData(null); setEditing(undefined); navigate('/teacher-hub/login', { replace: true }); }
    else setError(reason instanceof Error ? reason.message : 'Could not load pupil information.');
  }, [navigate]);
  const load = useCallback(async (signal?: AbortSignal) => {
    if (!getTeacherToken()) { navigate('/teacher-hub/login', { replace: true }); return; }
    setLoading(true); setError('');
    try { const result = await teacherRequest<Detail>(`/students/${encodeURIComponent(studentId)}`, { signal }); if (!signal?.aborted) setData(result); }
    catch (reason) { if (!signal?.aborted) { setData(null); showError(reason); } }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [studentId, navigate, showError]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  async function saveReview(review: ReviewDraft) {
    try {
      await teacherRequest(`/students/${studentId}/notes`, { method: 'POST', body: JSON.stringify({ action: 'saveReview', review, ...(editing ? { reviewId: editing.id, expectedRevision: editing.revision } : {}) }) });
      setEditing(undefined); setNotice('Work review saved.'); await load();
    } catch (reason) { showError(reason); throw reason; }
  }
  async function saveComment(event: FormEvent) {
    event.preventDefault(); setSavingComment(true); setError('');
    try { await teacherRequest(`/students/${studentId}/notes`, { method: 'POST', body: JSON.stringify({ noteText: comment, subject }) }); setComment(''); setNotice('Teacher comment saved.'); await load(); }
    catch (reason) { showError(reason); } finally { setSavingComment(false); }
  }
  function exportReport() {
    if (!data) return;
    const rows: unknown[][] = [['Pupil', data.student.name], ['Report scope', data.historyScope], ['Generated at', new Date().toISOString()], [], ['Category', 'Records', 'Assessed', 'Mean percentage', 'Pending review']];
    for (const kind of ACTIVITY_KINDS) { const item = data.progress.byKind[kind]; rows.push([kind, item.count, item.assessed, item.averagePercent, item.pending]); }
    rows.push([], ['Subject', 'Records', 'Assessed', 'Mean percentage', 'Pending review']);
    for (const item of data.progress.bySubject) rows.push([item.subject, item.count, item.assessed, item.averagePercent, item.pending]);
    rows.push([], ['Activity', 'Type', 'Subject', 'Mark', 'Out of', 'Percentage', 'Date']);
    for (const item of data.activity) rows.push([item.gameTitle, activityKind(item.gameId, item.subject), item.subject, item.score, item.maxScore, scorePercent(item.score, item.maxScore), item.playedAt]);
    rows.push([], ['Work type', 'Title', 'Subject', 'Review status', 'Mark', 'Out of', 'Teacher feedback']);
    for (const item of data.reviews) rows.push([item.kind, item.title, item.subject, item.status, item.score, item.maxScore, item.comment]);
    rows.push([], ['Comment subject', 'Teacher comment', 'Date']);
    for (const note of data.notes) rows.push([note.subject, note.noteText, note.createdAt]);
    exportTeacherCsv(`pupil-${data.student.id}-report.csv`, rows);
  }
  return <main className="min-h-screen bg-muted/30 p-4 sm:p-8 print:bg-white print:p-0">
    <Helmet><title>Pupil progress | Sodafom Teacher Hub</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <div className="mx-auto max-w-6xl space-y-6">
      <Link className="inline-block underline print:hidden" to="/teacher-hub">Back to class list</Link>
      {error && <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-destructive">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-primary/10 p-3 print:hidden">{notice}</p>}
      {loading && <p role="status">Loading pupil progress…</p>}
      {!loading && !data && <button className="rounded-xl border p-3" onClick={() => void load()}>Try again</button>}
      {data && <>
        <header className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-black">{data.student.name}</h1><p>Ages {data.student.ageGroup} · Private teacher report</p></div><div className="flex flex-wrap gap-3 print:hidden"><button disabled={loading} className="rounded-xl border bg-card p-3" onClick={exportReport}>Export report</button><button disabled={loading} className="rounded-xl border bg-card p-3" onClick={() => window.print()}>Print report</button><button className="rounded-xl bg-primary p-3 text-primary-foreground" onClick={() => { setEditing(null); setNotice(''); }}>Add work / photo review</button></div></header>
        <p className="text-sm">{data.historyScope} Percentages are the mean of valid assessed results; unmarked and uncertain work is not treated as zero. This view uses school-linked records only, not private parent data.</p>
        {data.historyLimited && <p role="status" className="rounded-xl border p-3">Older records exist. This report is limited to the history described above.</p>}
        {data.invalidReviewCount > 0 && <p role="alert">{data.invalidReviewCount} stored review(s) could not be read safely and have been excluded from scores.</p>}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Progress by activity type">{ACTIVITY_KINDS.map(kind => { const item = data.progress.byKind[kind]; return <article key={kind} className="rounded-2xl border bg-card p-5"><h2 className="text-xl font-bold capitalize">{kind === 'game' ? 'Games' : kind === 'lesson' ? 'Lessons' : kind}</h2><p className="my-2 text-2xl font-black">{percent(item.averagePercent)}</p><p>{item.count} records · {item.assessed} assessed</p><p>{item.pending} awaiting teacher review</p></article>; })}</section>
        {editing !== undefined && <WorkReviewForm key={editing ? `${editing.id}-${editing.revision}` : 'new'} existing={editing ?? undefined} onSave={saveReview} onCancel={() => setEditing(undefined)} />}
        <section className="rounded-2xl border bg-card p-5"><h2 className="mb-3 text-xl font-bold">Subject scores</h2>{!data.progress.bySubject.length ? <p>No subject results recorded yet.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-2">Subject</th><th className="p-2">Assessed results</th><th className="p-2">Mean score</th><th className="p-2">Needs review</th></tr></thead><tbody>{data.progress.bySubject.map(item => <tr key={item.subject} className="border-t"><th className="p-2 capitalize">{item.subject}</th><td className="p-2">{item.assessed}</td><td className="p-2">{percent(item.averagePercent)}</td><td className="p-2">{item.pending}</td></tr>)}</tbody></table></div>}</section>
        <section className="rounded-2xl border bg-card p-5"><h2 className="mb-4 text-xl font-bold">Work and handwriting reviews</h2>{!data.reviews.length && <p>No work reviews recorded yet.</p>}<div className="space-y-4">{data.reviews.map(review => <article key={review.id} className="rounded-xl border p-4"><div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold">{review.title}</h3><button className="underline print:hidden" onClick={() => setEditing(review)}>Open review: {review.title}</button></div><p>{review.kind} · {review.subject} · {review.status === 'needs_review' ? 'Needs teacher review — not included in scores' : `Teacher confirmed: ${review.score}/${review.maxScore}`} · {date(review.createdAt)}</p>{review.transcription && <p className="mt-2 whitespace-pre-wrap">Observation: {review.transcription}</p>}{review.comment && <p className="mt-2 whitespace-pre-wrap">Teacher feedback: {review.comment}</p>}{review.status === 'reviewed' && <p className="mt-2 text-sm">Reviewed {date(review.reviewedAt)} · Revision {review.revision}</p>}</article>)}</div></section>
        <section className="rounded-2xl border bg-card p-5"><h2 className="mb-4 text-xl font-bold">Recorded activity results</h2>{!data.activity.length ? <p>No activity results recorded yet.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-2">Activity</th><th className="p-2">Type</th><th className="p-2">Subject</th><th className="p-2">Result</th><th className="p-2">Date</th></tr></thead><tbody>{data.activity.map(item => <tr key={item.id} className="border-t"><td className="p-2">{item.gameTitle}</td><td className="p-2">{activityKind(item.gameId, item.subject)}</td><td className="p-2">{item.subject}</td><td className="p-2">{percent(scorePercent(item.score, item.maxScore))}</td><td className="p-2">{date(item.playedAt)}</td></tr>)}</tbody></table></div>}</section>
        <section className="rounded-2xl border bg-card p-5"><h2 className="mb-4 text-xl font-bold">Teacher comments</h2><div className="space-y-3">{data.notes.map(note => <article key={note.id} className="rounded-xl border p-3"><p className="text-sm">{note.subject} · {date(note.createdAt)}</p><p className="whitespace-pre-wrap">{note.noteText}</p></article>)}{!data.notes.length && <p>No teacher comments yet.</p>}</div><form onSubmit={saveComment} className="mt-4 space-y-3 print:hidden"><label className="block">Subject<select className="ml-3 rounded-xl border bg-background p-2" value={subject} onChange={e => setSubject(e.target.value)}>{SUBJECTS.map(item => <option key={item}>{item}</option>)}</select></label><label className="block">Comment<textarea className="mt-1 block w-full rounded-xl border bg-background p-3" required maxLength={4000} value={comment} onChange={e => setComment(e.target.value)} /></label><button disabled={savingComment} className="rounded-xl bg-primary p-3 text-primary-foreground">{savingComment ? 'Saving…' : 'Save comment'}</button></form></section>
        {!!data.recommendations.length && <section className="rounded-2xl border bg-card p-5"><h2 className="mb-3 text-xl font-bold">Existing learning recommendations</h2><p className="mb-3 text-sm">Suggestions based on teacher notes; not a diagnosis or a new assessment.</p>{data.recommendations.filter(item => item.path.startsWith('/') && !item.path.startsWith('//')).map(item => <p key={item.gameId} className="mb-2"><Link className="underline" to={item.path}>{item.title}</Link> — {item.reason}</p>)}</section>}
      </>}
    </div>
  </main>;
}
