import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { SUBJECTS, localArithmeticCheck, type SavedReview, type WorkReview } from '@/lib/teacher-school';
export interface ReviewDraft {
  kind: WorkReview['kind']; title: string; subject: string; source: WorkReview['source'];
  transcription: string; comment: string; status: WorkReview['status'];
  score: number | null; maxScore: number | null; teacherConfirmed: boolean;
}
export default function WorkReviewForm({ existing, onSave, onCancel }: {
  existing?: SavedReview; onSave: (review: ReviewDraft) => Promise<void>; onCancel: () => void;
}) {
  const [kind, setKind] = useState<WorkReview['kind']>(existing?.kind ?? 'homework');
  const [title, setTitle] = useState(existing?.title ?? ''), [subject, setSubject] = useState(existing?.subject ?? 'maths');
  const [source, setSource] = useState<WorkReview['source']>(existing?.source ?? 'manual');
  const [transcription, setTranscription] = useState(existing?.transcription ?? ''), [comment, setComment] = useState(existing?.comment ?? '');
  const [status, setStatus] = useState<WorkReview['status']>(existing?.status ?? 'needs_review');
  const [score, setScore] = useState(existing?.score == null ? '' : String(existing.score)), [maximum, setMaximum] = useState(existing?.maxScore == null ? '' : String(existing.maxScore));
  const [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState(''), [error, setError] = useState(''), [suggestion, setSuggestion] = useState('');
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);
  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''; setError(''); setConfirmed(false);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 6 * 1024 * 1024) {
      setPhoto(''); setError('Choose a JPEG, PNG or WebP photo up to 6 MB.'); return;
    }
    setPhoto(URL.createObjectURL(file)); setSource('photo');
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      await onSave({ kind, title, subject, source, transcription, comment, status,
        score: status === 'reviewed' ? Number(score) : null, maxScore: status === 'reviewed' ? Number(maximum) : null, teacherConfirmed: confirmed });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save this review.'); }
    finally { setBusy(false); }
  }
  const field = 'mt-1 block w-full rounded-xl border border-border bg-background p-3';
  return <section className="rounded-2xl border bg-card p-5 print:hidden" aria-labelledby="review-form-title">
    <h2 id="review-form-title" className="text-xl font-bold">{existing ? 'Review pupil work' : 'Add lesson, homework or reading work'}</h2>
    <p className="my-3 text-sm">Photos stay on this device and are discarded when you leave this form. No image or filename is uploaded. Save a short transcription and your comments only.</p>
    <p className="mb-4 text-sm">Handwriting is not automatically read here. Unclear work stays “Needs teacher review”. Local arithmetic suggestions are not final marks and never use paid AI.</p>
    {error && <p role="alert" className="mb-4 rounded-xl bg-destructive/10 p-3 text-destructive">{error}</p>}
    <form onSubmit={submit}><fieldset disabled={busy} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><label>Work type<select className={field} value={kind} onChange={e => { setKind(e.target.value as WorkReview['kind']); setConfirmed(false); }}><option value="lesson">Lesson</option><option value="homework">Homework</option><option value="reading">Reading</option></select></label><label>Subject<select className={field} value={subject} onChange={e => { setSubject(e.target.value); setConfirmed(false); }}>{SUBJECTS.map(value => <option key={value}>{value}</option>)}</select></label></div>
      <label className="block">Work title<input className={field} required maxLength={255} value={title} onChange={e => { setTitle(e.target.value); setConfirmed(false); }} /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label>Choose a work photo<input className={field} type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} /></label><label>Take a work photo<input className={field} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={choosePhoto} /></label></div>
      {photo && <div><img className="max-h-96 max-w-full rounded-xl border object-contain" src={photo} alt="Pupil work being reviewed on this device" onError={() => { setError('This photo could not be opened. Please choose another.'); setPhoto(''); }} /><button type="button" className="mt-2 underline" onClick={() => { setPhoto(''); setConfirmed(false); }}>Remove photo</button></div>}
      <label className="block">Evidence type<select className={field} value={source} onChange={e => { setSource(e.target.value as WorkReview['source']); setConfirmed(false); }}><option value="manual">Teacher observation / paper work</option><option value="photo">Homework photo</option><option value="handwriting">Handwriting photo / paper</option></select></label>
      <label className="block">Transcription or observation (optional; no identifying details)<textarea className={field} rows={3} maxLength={4000} value={transcription} onChange={e => { setTranscription(e.target.value); setConfirmed(false); setSuggestion(''); }} /></label>
      <button type="button" className="rounded-xl border p-3" onClick={() => { const result = localArithmeticCheck(transcription); setSuggestion(result.message); setConfirmed(false); if (result.suggestedScore !== null) { setScore(String(result.suggestedScore)); setMaximum('1'); } }}>Check typed arithmetic locally</button>
      {suggestion && <p role="status" className="rounded-xl bg-primary/10 p-3">{suggestion}</p>}
      <label className="block">Teacher feedback<textarea className={field} maxLength={2000} rows={3} value={comment} onChange={e => { setComment(e.target.value); setConfirmed(false); }} /></label>
      <label className="block">Status<select className={field} value={status} onChange={e => { setStatus(e.target.value as WorkReview['status']); setConfirmed(false); }}><option value="needs_review">Needs teacher review — do not count a mark</option><option value="reviewed">Teacher reviewed — include confirmed mark</option></select></label>
      {status === 'reviewed' && <><div className="grid gap-4 sm:grid-cols-2"><label>Mark<input className={field} type="number" min="0" max={maximum || 100000} step="1" required value={score} onChange={e => { setScore(e.target.value); setConfirmed(false); }} /></label><label>Out of<input className={field} type="number" min="1" max="100000" step="1" required value={maximum} onChange={e => { setMaximum(e.target.value); setConfirmed(false); }} /></label></div><label className="flex items-start gap-3"><input className="mt-1" type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>I checked the original work or observation and confirm this mark myself.</span></label></>}
      <div className="flex flex-wrap gap-3"><button className="rounded-xl bg-primary p-3 font-bold text-primary-foreground">{busy ? 'Saving…' : 'Save review'}</button><button type="button" className="rounded-xl border p-3" onClick={onCancel}>Close without saving</button></div>
    </fieldset></form>
  </section>;
}
