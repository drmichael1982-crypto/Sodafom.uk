import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import { SCHOOL_SUBJECTS, localMarkSuggestion, validSchoolPhoto, type ProgressRecord, type SchoolKind, type ReviewStatus } from '@/lib/teacher-progress';
import { teacherRequest, TeacherApiError, fieldClass, buttonClass } from './school-client';

export default function SchoolRecordEditor({ pupilId, initial, onSaved, onCancel, onSessionExpired }: {
  pupilId: number; initial?: ProgressRecord; onSaved: () => void; onCancel: () => void; onSessionExpired: () => void;
}) {
  const [requestId] = useState(() => initial?.requestId ?? crypto.randomUUID());
  const [kind, setKind] = useState<SchoolKind>(initial && initial.kind !== 'game' ? initial.kind : 'homework');
  const [subject, setSubject] = useState(initial?.subject ?? 'maths');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [status, setStatus] = useState<ReviewStatus>(initial?.status ?? 'needs_review');
  const [numeric, setNumeric] = useState(initial?.score !== null && initial?.score !== undefined);
  const [score, setScore] = useState(initial?.score?.toString() ?? '');
  const [maximum, setMaximum] = useState(initial?.maxScore?.toString() ?? '');
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [confirmed, setConfirmed] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [answer, setAnswer] = useState('');
  const [expected, setExpected] = useState('');
  const [transcribed, setTranscribed] = useState(false);
  const [suggestion, setSuggestion] = useState<ReturnType<typeof localMarkSuggestion> | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const selectionVersion = useRef(0);
  useEffect(() => {
    if (!photo) { setPhotoUrl(''); return; }
    const url = URL.createObjectURL(photo); setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  useEffect(() => () => { selectionVersion.current++; }, []);
  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = '';
    const version = ++selectionVersion.current;
    setPhoto(null); setTranscribed(false); setConfirmed(false); setSuggestion(null); setAnswer(''); setExpected(''); setError('');
    if (!file) return;
    try {
      // Read only the signature for validation; do not upload or persist the photograph.
      const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      if (!validSchoolPhoto(file.type, file.size, bytes)) throw new Error('Choose a JPEG, PNG or WebP work photo up to 5 MB.');
      if (version === selectionVersion.current) setPhoto(file);
    } catch (err) { if (version === selectionVersion.current) setError(err instanceof Error ? err.message : 'Could not open the photo.'); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setError('');
    if (status === 'reviewed' && !confirmed) { setError('Confirm that you have reviewed the original work before saving a reviewed result.'); return; }
    if (status === 'reviewed' && numeric && (!score.trim() || !maximum.trim())) { setError('Enter both the mark and the possible marks.'); return; }
    setSaving(true);
    try {
      await teacherRequest(`/teacher/students/${pupilId}/notes`, {
        action: 'save-record', requestId, ...(initial?.noteId ? { recordId: initial.noteId, expectedRevision: initial.revision } : {}),
        record: { kind, subject, title, status, score: status === 'reviewed' && numeric ? Number(score) : null,
          maxScore: status === 'reviewed' && numeric ? Number(maximum) : null, comment,
          photoReviewed: status === 'reviewed' && confirmed && (!!photo || !!initial?.photoReviewed),
        },
      });
      onSaved();
    } catch (err) {
      if (err instanceof TeacherApiError && err.status === 401) onSessionExpired();
      else setError(err instanceof Error ? err.message : 'Could not save your review.');
    } finally { setSaving(false); }
  }
  return <form className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-card p-5" onSubmit={save} aria-label="School work review">
    <h2 className="text-xl font-bold">{initial ? 'Update school review' : 'Record school learning or review work'}</h2>
    <p className="text-sm">Photos stay on this device and are cleared when this form closes. Only your result and comment are saved. Reattach the original when returning to a saved review. Choose just the work, not pupil faces or full names.</p>
    <fieldset disabled={saving} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2"><label>Work type<select className={fieldClass} value={kind} onChange={e => { setKind(e.target.value as SchoolKind); setConfirmed(false); }}><option value="lesson">Lesson result</option><option value="homework">Homework or handwriting</option><option value="reading">Reading</option></select></label>
        <label>Subject<select className={fieldClass} value={subject} onChange={e => { setSubject(e.target.value); setConfirmed(false); }}>{SCHOOL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select></label></div>
      <label>Lesson, book or task title<input className={fieldClass} value={title} maxLength={160} required onChange={e => { setTitle(e.target.value); setConfirmed(false); }} /></label>
      <div className="flex flex-wrap gap-4"><label className="block">Choose a work photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} className="block w-full" /></label><label className="block">Take a work photo<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={choosePhoto} className="block w-full" /></label></div>
      {photoUrl && <div><img src={photoUrl} alt="Work photograph for teacher review" className="max-h-[32rem] max-w-full rounded-xl object-contain" onError={() => { setPhoto(null); setError('This image could not be displayed. Try another photo.'); }} onLoad={e => { const image = e.currentTarget; if (image.naturalWidth * image.naturalHeight > 24000000) { setPhoto(null); setError('Choose a smaller image, up to 24 megapixels.'); } }} /><button type="button" className="mt-2 underline" onClick={() => { selectionVersion.current++; setPhoto(null); setConfirmed(false); setTranscribed(false); setSuggestion(null); }}>Remove photo</button></div>}
      <details className="rounded-xl border border-border p-4"><summary className="font-bold">Optional local answer check — no external AI</summary>
        <p className="my-3 text-sm">This compares text you have checked. It does not recognise handwriting or guess unreadable words. Check working, meaning and partial credit yourself.</p>
        <label>Pupil’s answer<input className={fieldClass} value={answer} maxLength={500} onChange={e => { setAnswer(e.target.value); setTranscribed(false); setSuggestion(null); }} /></label>
        <label>Expected answer from your marking guide<input className={fieldClass} value={expected} maxLength={500} onChange={e => { setExpected(e.target.value); setSuggestion(null); }} /></label>
        <label className="my-3 flex gap-2"><input type="checkbox" checked={transcribed} onChange={e => { setTranscribed(e.target.checked); setSuggestion(null); }} />I have checked this transcription against the original work.</label>
        <button type="button" className={buttonClass} onClick={() => setSuggestion(localMarkSuggestion(answer, expected, transcribed))}>Check locally</button>
        {suggestion && <div role="status" className="mt-3"><p>{suggestion.message}</p>{suggestion.suggestedScore !== null && <button type="button" className="mt-2 underline" onClick={() => { setScore(String(suggestion.suggestedScore)); setMaximum('1'); setNumeric(true); setStatus('reviewed'); setConfirmed(false); }}>Use suggested {suggestion.suggestedScore}/1 as a draft mark</button>}</div>}
      </details>
      <label>Review status<select className={fieldClass} value={status} onChange={e => { setStatus(e.target.value as ReviewStatus); setConfirmed(false); }}><option value="needs_review">Needs teacher review — do not award a mark</option><option value="reviewed">Reviewed by teacher</option></select></label>
      {status === 'reviewed' && <>
        <label className="flex gap-2"><input type="checkbox" checked={numeric} onChange={e => { setNumeric(e.target.checked); setConfirmed(false); }} />Record a numeric mark. Leave unticked for qualitative feedback only.</label>
        {numeric && <div className="grid grid-cols-2 gap-4"><label>Marks awarded<input className={fieldClass} type="number" min={0} max={maximum || 10000} step={1} required value={score} onChange={e => { setScore(e.target.value); setConfirmed(false); }} /></label><label>Possible marks<input className={fieldClass} type="number" min={1} max={10000} step={1} required value={maximum} onChange={e => { setMaximum(e.target.value); setConfirmed(false); }} /></label></div>}
        <label className="flex gap-2"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} required />I have reviewed the original work and confirm this result. It is not an unverified AI mark.</label>
      </>}
      <label>Teacher comment or reason for uncertainty<textarea className={fieldClass} rows={4} maxLength={3000} value={comment} onChange={e => setComment(e.target.value)} /></label>
    </fieldset>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="flex gap-3"><button className={buttonClass} disabled={saving}>{saving ? 'Saving…' : status === 'needs_review' ? 'Save for teacher review' : 'Save confirmed result'}</button><button type="button" className="rounded-xl border border-border px-4 py-3" disabled={saving} onClick={onCancel}>Close without saving</button></div>
  </form>;
}
