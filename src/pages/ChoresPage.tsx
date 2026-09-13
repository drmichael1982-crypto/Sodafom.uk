import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock3, ShieldCheck, Volume2 } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { choreIdeas, familyDate, hasSnapshot, parseReward, rewardLabel, type ChoreView, type ChoresData, type Completion, type Recurrence, type RewardType } from '@/lib/chores';
import '@/styles/chores.css';

type Child = { id: number; name: string; ageGroup: string };
type PendingAction = { body: Record<string, unknown>; description: string; success: string; clearForm?: boolean; legacy?: boolean; returnJob?: boolean };
const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'SodafomChores' };
const statusLabels: Record<string, string> = { available: 'Ready when you are', upcoming: 'Starts soon', paused: 'Paused by your parent', waiting_for_parent: 'Waiting for parent — not earned yet', approved: 'Parent approved', needs_work: 'Try again with your parent’s help' };
const repeats: Record<Recurrence, string> = { once: 'One time', daily: 'Every day', weekly: 'Every week' };

async function readResponse<T>(response: Response): Promise<T> {
  let result: T & { error?: string };
  try { result = await response.json(); } catch { throw new Error('Chores could not reach the server. Please try again.'); }
  if (!response.ok) throw new Error(result.error || 'Could not update chores.');
  return result;
}
function checkedChores(value: ChoresData): ChoresData {
  if (value?.version !== 2 || !value.totals || !Array.isArray(value.chores) || !Array.isArray(value.completions) || !Array.isArray(value.pending)) {
    throw new Error('This server still has the older chores feature. The reviewed chores upgrade must be installed before testing this page.');
  }
  return value;
}
function historyReward(row: Completion) {
  return hasSnapshot(row) ? rewardLabel(row.rewardTypeSnapshot!, row.valuePenceSnapshot ?? 0, row.rewardPointsSnapshot ?? 0) : 'Older reward amount not recorded';
}
function dateLabel(value: Date | string | null) {
  if (!value) return 'Date not recorded';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not recorded';
}
function readAloud(text: string) {
  // Optional device speech only; never sends chore or child data to an AI service.
  try {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB'; utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch { /* All text remains available when speech is unsupported. */ }
}

/** Password is transient, sent once over the existing authenticated connection, never saved. */
function ParentConfirmation({ pending, busy, onCancel, onConfirm }: {
  pending: PendingAction; busy: boolean; onCancel: () => void;
  onConfirm: (password: string, note: string, confirmLegacyValue: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !password || (pending.returnJob && !note.trim()) || (pending.legacy && !confirmed)) return;
    const oneUsePassword = password;
    setPassword('');
    onConfirm(oneUsePassword, note, confirmed);
  }
  return <dialog ref={dialog} className="chores-dialog" aria-labelledby="chore-confirm-title" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <form onSubmit={submit}>
      <h2 id="chore-confirm-title">Parent confirmation</h2>
      <p>{pending.description}</p>
      <p className="chores-muted">Confirm with your parent account password. Opening this page alone cannot approve rewards.</p>
      {pending.returnJob && <label>What needs another try?<textarea required maxLength={240} value={note} onChange={event => setNote(event.target.value)} disabled={busy} /></label>}
      {pending.legacy && <label className="chores-check"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={busy} /> I confirm the displayed reward for this older job. Its previous amount was not recorded.</label>}
      <label htmlFor="chore-parent-password">Parent account password</label>
      <input id="chore-parent-password" autoFocus type="password" autoComplete="current-password" required maxLength={1024} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} />
      <div className="chores-actions"><button type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="chores-primary" type="submit" disabled={busy || !password || !!(pending.returnJob && !note.trim()) || !!(pending.legacy && !confirmed)}>{busy ? 'Saving…' : 'Confirm this change'}</button></div>
    </form>
  </dialog>;
}

function ChoresScreen({ parentMode }: { parentMode: boolean }) {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<number | null>(null);
  const [data, setData] = useState<ChoresData | null>(null);
  const [history, setHistory] = useState<Completion[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [title, setTitle] = useState('');
  const [rewardType, setRewardType] = useState<RewardType>('points');
  const [value, setValue] = useState('5');
  const [recurrence, setRecurrence] = useState<Recurrence>('once');
  const [startsOn, setStartsOn] = useState(familyDate());
  const [safe, setSafe] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [animation, setAnimation] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const mutationLock = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  const activeChild = useRef<number | null>(null);
  const chooser = useRef<HTMLSelectElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current += 1; };
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    void fetch(`${API_PREFIX}/children`, { credentials: 'include', signal: abort.signal, cache: 'no-store' })
      .then(response => readResponse<Child[]>(response)).then(rows => {
        if (abort.signal.aborted) return;
        if (!Array.isArray(rows)) throw new Error('Could not load child profiles.');
        setChildren(rows);
        let stored: number | null = null;
        try { stored = Number(JSON.parse(localStorage.getItem('sodafom_active_child') || 'null')?.id) || null; } catch { /* Optional profile preference. */ }
        setChildId(rows.some(child => child.id === stored) ? stored : rows[0]?.id ?? null);
        if (!rows.length) setLoading(false);
      }).catch(reason => { if (!abort.signal.aborted) { setError(reason instanceof Error ? reason.message : 'Ask a parent to sign in.'); setLoading(false); } });
    return () => abort.abort();
  }, []);

  const load = useCallback(async (id: number, token: number, signal?: AbortSignal) => {
    const fresh = await fetch(`${API_PREFIX}/chores?childId=${id}`, { credentials: 'include', headers, cache: 'no-store', signal }).then(response => readResponse<ChoresData>(response)).then(checkedChores);
    if (mounted.current && token === generation.current && !signal?.aborted) {
      setData(fresh); setHistory(fresh.completions); setHistoryCursor(fresh.historyCursor);
      setStartsOn(previous => previous < fresh.today ? fresh.today : previous);
    }
  }, []);
  useEffect(() => {
    const token = ++generation.current;
    activeChild.current = childId;
    setData(null); setHistory([]); setHistoryCursor(null); setPending(null); setEditId(null); setTitle(''); setSafe(false); setError(''); setMessage('');
    if (!childId) return;
    const abort = new AbortController();
    setLoading(true);
    void load(childId, token, abort.signal).catch(reason => {
      if (!abort.signal.aborted && token === generation.current) setError(reason instanceof Error ? reason.message : 'Could not load chores.');
    }).finally(() => { if (!abort.signal.aborted && token === generation.current) setLoading(false); });
    return () => abort.abort();
  }, [childId, load]);
  const selectedChild = children.find(child => child.id === childId);

  async function refresh() {
    if (!childId || mutationLock.current) return;
    mutationLock.current = true; setLoading(true); setError('');
    try { await load(childId, generation.current); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not refresh chores.'); }
    finally { mutationLock.current = false; if (mounted.current) setLoading(false); }
  }
  async function perform(request: PendingAction, password?: string, note = '', confirmLegacyValue = false) {
    if (!childId || mutationLock.current) return;
    mutationLock.current = true; setBusy(true); setError(''); setMessage('');
    const id = childId, token = generation.current;
    let saved = false;
    try {
      const body = { ...request.body, ...(password !== undefined ? { parentPassword: password } : {}), ...(request.returnJob ? { parentNote: note } : {}), ...(request.legacy ? { confirmLegacyValue } : {}) };
      try {
        await fetch(`${API_PREFIX}/chores`, { method: 'POST', credentials: 'include', headers, body: JSON.stringify(body) }).then(response => readResponse(response));
        saved = true;
      } finally { delete (body as Record<string, unknown>).parentPassword; }
      if (!mounted.current || token !== generation.current || activeChild.current !== id) return;
      setPending(null);
      if (request.clearForm) { setTitle(''); setSafe(false); setEditId(null); }
      // Never add an optimistic reward total. Only the server's approved ledger is displayed.
      await load(id, token);
      if (mounted.current && token === generation.current) { setMessage(request.success); setAnimation(n => n + 1); }
    } catch (reason) {
      if (mounted.current && token === generation.current) {
        setPending(null);
        if (saved) { setData(null); setHistory([]); setError('Your change was saved, but the page could not refresh. Refresh before making another change.'); }
        else setError(reason instanceof Error ? reason.message : 'Could not save. Refresh to check the saved status.');
      }
    } finally { mutationLock.current = false; if (mounted.current) setBusy(false); }
  }
  function propose(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!childId || busy) return;
    try {
      const rewardValue = parseReward(value, rewardType);
      const common = { title, rewardType, rewardValue, safetyConfirmed: safe };
      setPending({ body: editId ? { action: 'update', choreId: editId, ...common } : { action: 'create', childId, ...common, recurrence, startsOn },
        description: `${editId ? 'Save changes to' : 'Add'} “${title.trim()}” for ${selectedChild?.name}, worth ${rewardLabel(rewardType, rewardType === 'money' ? rewardValue : 0, rewardType === 'points' ? rewardValue : 0)}.`,
        success: editId ? 'Chore updated. Rewards already submitted or approved stay unchanged.' : 'Chore added. Your child can now see the task.', clearForm: true });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Check the reward.'); }
  }
  function edit(job: ChoreView) {
    setEditId(job.id); setTitle(job.title); setRewardType(job.rewardType);
    setValue(job.rewardType === 'money' ? (job.valuePence / 100).toFixed(2) : String(job.rewardPoints)); setSafe(false);
    formHeading.current?.focus(); formHeading.current?.scrollIntoView({ block: 'center' });
  }
  async function olderHistory() {
    if (!childId || !historyCursor || mutationLock.current) return;
    const token = generation.current;
    mutationLock.current = true; setBusy(true); setError('');
    try {
      const older = await fetch(`${API_PREFIX}/chores?childId=${childId}&before=${historyCursor}`, { credentials: 'include', headers, cache: 'no-store' }).then(response => readResponse<ChoresData>(response)).then(checkedChores);
      if (mounted.current && token === generation.current) {
        setHistory(rows => [...rows, ...older.completions.filter(row => !rows.some(previous => previous.id === row.id))]); setHistoryCursor(older.historyCursor);
      }
    } catch (reason) { if (mounted.current && token === generation.current) setError(reason instanceof Error ? reason.message : 'Could not load history.'); }
    finally { mutationLock.current = false; if (mounted.current) setBusy(false); }
  }
  const locked = busy || loading || !!pending;
  const tasks = data?.chores.filter(job => parentMode || job.active) ?? [];
  const approved = tasks.filter(job => job.state === 'approved').length;
  const due = tasks.filter(job => job.active && job.state !== 'upcoming').length;

  return <main className="chores-page">
    <Helmet><title>{parentMode ? 'Parent chore controls' : 'My chores and rewards'} — Sodafom</title></Helmet>
    <div className="chores-wrap">
      <nav className="chores-nav" aria-label="Chores navigation">
        <button disabled={busy} onClick={() => navigate(parentMode ? '/parent-dashboard' : '/')}><ArrowLeft aria-hidden="true" size={18} /> Back</button>
        <button disabled={busy} onClick={() => navigate(parentMode ? '/chores' : '/parent-dashboard/chores')}>{parentMode ? 'Child view' : 'Parent controls'}</button>
      </nav>
      <header className="chores-hero">
        {!imageFailed ? <img key={animation} className={animation ? 'chores-archie chores-cheer' : 'chores-archie'} src="/assets/images/archie-character-v2.png" alt="Archie cheering you on" onError={() => setImageFailed(true)} /> : <p className="chores-character-fallback">Archie is cheering you on!</p>}
        <div><p className="chores-eyebrow">Helping at home</p><h1>Chores &amp; pocket money</h1><p>{parentMode ? 'Small jobs, kind encouragement, and rewards you approve.' : 'Choose a job. Do your best. Ask your parent to check it.'}</p></div>
      </header>
      <p className="chores-notice"><ShieldCheck aria-hidden="true" size={22} /><span><strong>Family tracking only.</strong> Sodafom takes no fee or commission and does not hold, send or collect money. Parents give any pocket money directly. Chore points are separate from game stars.</span></p>
      {children.length > 0 && <div className="chores-toolbar"><label htmlFor="chores-child">Child profile</label><select ref={chooser} id="chores-child" value={childId ?? ''} disabled={locked} onChange={event => { generation.current += 1; setData(null); setHistory([]); setChildId(Number(event.target.value)); }}>{children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}</select><button type="button" disabled={locked} onClick={() => void refresh()}>Refresh</button></div>}
      {loading && <p role="status" className="chores-card">Loading family chores…</p>}
      {error && <p role="alert" className="chores-error">{error}</p>}
      {message && <p role="status" className="chores-success">{message}</p>}
      {!loading && !selectedChild && <section className="chores-card"><h2>Ask a parent to get started</h2><p>A parent must sign in and add a child profile before using chores.</p><button onClick={() => navigate('/hub/login')} className="chores-primary">Parent sign in</button></section>}
      {data && selectedChild && <>
        <section className="chores-card" aria-labelledby="chore-progress-title">
          <h2 id="chore-progress-title">{selectedChild.name}’s approved rewards</h2>
          <div className="chores-totals"><div><strong>{data.totals.points}</strong><span>Chore points earned</span></div><div><strong>£{(data.totals.moneyPence / 100).toFixed(2)}</strong><span>Pocket money recorded, not a payment</span></div></div>
          <p>Only parent-approved jobs count. Waiting or returned jobs add nothing.</p>
          {data.totals.unknownApprovedCount > 0 && <p className="chores-muted">{data.totals.unknownApprovedCount} older approved {data.totals.unknownApprovedCount === 1 ? 'job has' : 'jobs have'} no saved reward amount. Those amounts are not guessed or added to these totals.</p>}
          {due > 0 && <><label htmlFor="chore-progress">{approved} of {due} current jobs approved</label><progress id="chore-progress" max={due} value={approved} /></>}
          <button className="chores-speech" onClick={() => readAloud(`Your parent has approved ${data.totals.points} chore points and ${(data.totals.moneyPence / 100).toFixed(2)} pounds of pocket money. Waiting jobs are not earned yet.`)}><Volume2 aria-hidden="true" size={18} /> Read my rewards aloud</button>
        </section>
        {parentMode && <form className="chores-card" onSubmit={propose}>
          <h2 ref={formHeading} tabIndex={-1}>{editId ? 'Edit chore' : `Add a chore for ${selectedChild.name}`}</h2>
          <p>Choose work that suits your child’s ability. Help and supervise as needed. Avoid hot surfaces, sharp tools, chemicals, traffic and heavy lifting.</p>
          <div className="chores-ideas" aria-label="Chore ideas for this age group">{choreIdeas(selectedChild.ageGroup).map(idea => <button key={idea.title} type="button" disabled={locked} onClick={() => { setTitle(idea.title); setSafe(false); }}>{idea.title}</button>)}</div>
          <fieldset disabled={locked}>
            <label htmlFor="chore-title">Chore description</label><input id="chore-title" required minLength={2} maxLength={120} value={title} onChange={event => { setTitle(event.target.value); setSafe(false); }} placeholder="For example, put toys back in their box" />
            <div className="chores-form-grid"><div><label htmlFor="chore-reward-type">Reward type</label><select id="chore-reward-type" value={rewardType} onChange={event => { const type = event.target.value as RewardType; setRewardType(type); setValue(type === 'money' ? '1.00' : '5'); }}><option value="points">Chore points</option><option value="money">Pocket money (£)</option></select></div>
            <div><label htmlFor="chore-reward">{rewardType === 'money' ? 'Amount in pounds (£0–£1,000)' : 'Whole chore points (0–10,000)'}</label><input id="chore-reward" inputMode={rewardType === 'money' ? 'decimal' : 'numeric'} required value={value} maxLength={8} onChange={event => setValue(event.target.value)} /></div></div>
            {!editId && <div className="chores-form-grid"><div><label htmlFor="chore-repeat">Repeat</label><select id="chore-repeat" value={recurrence} onChange={event => setRecurrence(event.target.value as Recurrence)}><option value="once">One time</option><option value="daily">Every day</option><option value="weekly">Every week</option></select></div><div><label htmlFor="chore-start">Starts on</label><input id="chore-start" type="date" required min={data.today} value={startsOn} onChange={event => setStartsOn(event.target.value)} /></div></div>}
            <p className="chores-muted">{editId ? 'This changes future submissions only. To change the repeat schedule, pause this chore and create a new one.' : 'Daily jobs renew at UK midnight. Weekly jobs renew every seven days from the start date. No missed-day rewards are banked. Work awaiting approval stays waiting.'}</p>
            <label className="chores-check"><input type="checkbox" required checked={safe} onChange={event => setSafe(event.target.checked)} /> I am the parent and confirm this job is safe and appropriate for my child.</label>
            <div className="chores-actions"><button type="submit" className="chores-primary" disabled={!safe || title.trim().length < 2}>{editId ? 'Save chore changes' : 'Add chore'}</button>{editId && <button type="button" onClick={() => { setEditId(null); setTitle(''); setSafe(false); }}>Cancel editing</button>}</div>
          </fieldset>
        </form>}
        {parentMode && <section className="chores-card" aria-labelledby="chore-approval-title"><h2 id="chore-approval-title">Waiting for your check ({data.pending.length})</h2><p>Check the work before approving. Pausing a chore never hides a pending request.</p>
          {data.pending.length === 0 && <p>No jobs are waiting for approval.</p>}
          {data.pending.map(row => {
            const job = data.chores.find(item => item.id === row.choreId);
            if (!job) return null;
            const legacy = !hasSnapshot(row);
            const displayedReward = legacy ? rewardLabel(job.rewardType, job.valuePence, job.rewardPoints) : historyReward(row);
            return <article className="chores-review" key={row.id}><h3>{row.titleSnapshot || job.title}</h3><p>{displayedReward} · Submitted {dateLabel(row.completedAt)}{!job.active ? ' · Chore paused' : ''}</p>{legacy && <p className="chores-muted">Older request: confirm this displayed reward explicitly before it is recorded.</p>}
              <div className="chores-actions"><button disabled={locked} className="chores-primary" onClick={() => setPending({ body: { action: 'approve', completionId: row.id }, legacy, description: `Approve “${row.titleSnapshot || job.title}” and record ${displayedReward}? This does not transfer money.`, success: 'Approved. The reward is now counted once in your family tracker.' })}>Approve reward</button><button disabled={locked} onClick={() => setPending({ body: { action: 'return', completionId: row.id }, returnJob: true, description: `Ask for another try at “${row.titleSnapshot || job.title}”. No reward will be added.`, success: 'Sent back with your encouragement. No reward has been added.' })}>Needs another try</button></div>
            </article>;
          })}
        </section>}
        <section aria-labelledby="chore-tasks-title"><div className="chores-section-heading"><h2 id="chore-tasks-title">{parentMode ? 'Family chores' : `${selectedChild.name}’s tasks`}</h2><button disabled={busy} aria-label="Read task instructions aloud" onClick={() => readAloud('Choose I finished this job after doing a chore. Your parent checks it. Only then does your reward count.')}><Volume2 aria-hidden="true" size={20} /></button></div>
          {!tasks.length && <p className="chores-card">{parentMode ? 'Create your first chore above.' : 'No tasks just now. Ask your parent to choose a small job together.'}</p>}
          <div className="chores-task-grid">{tasks.map(job => {
            const submitted = !parentMode ? job.submittedReward : null;
            return <article className="chores-card chores-task" key={job.id}>
              <span className={`chores-status chores-status-${job.state}`}>{job.state === 'approved' ? <CheckCircle2 aria-hidden="true" size={18} /> : <Clock3 aria-hidden="true" size={18} />}{statusLabels[job.state]}</span>
              <h3>{submitted?.title || job.title}</h3><p className="chores-task-reward">{submitted ? submitted.label || 'Older reward amount not recorded' : rewardLabel(job.rewardType, job.valuePence, job.rewardPoints)} <span>{job.state === 'approved' ? 'Recorded once with parent approval' : 'Only counts after parent approval'}</span></p><p className="chores-muted">{repeats[job.recurrence]}{job.startsOn ? ` · From ${dateLabel(`${job.startsOn}T12:00:00Z`)}` : ''}</p>
              {job.state === 'needs_work' && job.submittedReward?.parentNote && <p className="chores-parent-note">Parent’s note: {job.submittedReward.parentNote}</p>}
              {!parentMode && <button className="chores-primary" disabled={locked || !job.canComplete} onClick={() => void perform({ body: { action: 'complete', choreId: job.id, occurrenceKey: job.occurrenceKey }, description: '', success: 'Well done for helping! Your job is waiting for your parent’s check. No reward is counted yet.' })}>{job.canComplete ? job.state === 'needs_work' ? 'I tried again — please check' : 'I finished this job' : statusLabels[job.state]}</button>}
              {parentMode && <div className="chores-actions"><button disabled={locked} onClick={() => edit(job)}>Edit</button><button disabled={locked} onClick={() => setPending({ body: { action: 'set-active', choreId: job.id, active: !job.active }, description: `${job.active ? 'Pause' : 'Resume'} “${job.title}”? Past rewards and waiting jobs are kept.`, success: job.active ? 'Chore paused. History and pending work are safe.' : 'Chore resumed.' })}>{job.active ? 'Pause' : 'Resume'}</button></div>}
            </article>;
          })}</div>
        </section>
        <section className="chores-card" aria-labelledby="chore-history-title"><h2 id="chore-history-title">Reward history</h2><p>Approved rewards are counted once. This is a family record, not a bank balance or payment receipt.</p>
          {!history.length && <p>Your completed jobs will appear here.</p>}
          <ol className="chores-history">{history.map(row => <li key={row.id}><div><strong>{row.titleSnapshot || data.chores.find(job => job.id === row.choreId)?.title || 'Older chore'}</strong><span>{dateLabel(row.approvedAt || row.reviewedAt || row.completedAt)} · {statusLabels[row.status] || 'Older record'}</span>{row.parentNote && <span>Parent’s note: {row.parentNote}</span>}</div><strong>{historyReward(row)}{row.status !== 'approved' ? ' — not earned' : ''}</strong></li>)}</ol>
          {historyCursor && <button disabled={locked} onClick={() => void olderHistory()}>Show older jobs</button>}
        </section>
      </>}
    </div>
    {pending && <ParentConfirmation pending={pending} busy={busy} onCancel={() => { setPending(null); chooser.current?.focus(); }} onConfirm={(password, note, legacy) => void perform(pending, password, note, legacy)} />}
  </main>;
}
export default function ChoresPage() { return <ChoresScreen parentMode={false} />; }
export function ParentChoresPage() { return <ChoresScreen parentMode />; }
