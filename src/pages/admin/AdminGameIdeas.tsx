import { useEffect, useState, type FormEvent } from 'react';

type GameIdea = { id: string; title: string; subject: string; description: string; createdAt: string };
type GameIdeas = { ideas: GameIdea[]; editable: boolean };
const subjects = { maths: 'Maths', spelling: 'Spelling', reading: 'Reading', science: 'Science', art: 'Art' };

export default function AdminGameIdeas() {
  const [data, setData] = useState<GameIdeas | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('maths');
  const [description, setDescription] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/admin/game-ideas', { credentials: 'same-origin', cache: 'no-store', signal: abort.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Game idea drafts are unavailable.');
      setData(result);
    }).catch(failure => { if (failure.name !== 'AbortError') setError(failure.message || 'Game idea drafts are unavailable.'); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/game-ideas', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), subject, description: description.trim() }) });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) setData(null);
        throw new Error(result.error || 'Your idea could not be saved.');
      }
      setData(result); setTitle(''); setDescription(''); setNotice('Idea saved as a private draft. No game was created or published.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Your idea could not be saved.'); }
    finally { setSaving(false); }
  }
  return <section className="admin-game-section" aria-labelledby="admin-add-game-heading">
    <h2 id="admin-add-game-heading">Add a game idea</h2><p>Save a title, subject and description for future development. These private drafts do not add playable games or change the catalog.</p>
    {loading && <p role="status">Loading your saved ideas…</p>}
    {error && <p role="alert" className="payment-error">{error}</p>}
    {data && <>
      {!data.editable && <p className="payment-help">Persistent idea storage needs server setup before you can save a draft.</p>}
      <form onSubmit={save} className="admin-idea-form"><fieldset disabled={saving || !data.editable || data.ideas.length >= 100}>
        <label htmlFor="admin-idea-title">Idea title</label><input id="admin-idea-title" value={title} onChange={event => setTitle(event.target.value)} required maxLength={80} placeholder="For example: A fractions garden" />
        <label htmlFor="admin-idea-subject">Idea subject</label><select id="admin-idea-subject" value={subject} onChange={event => setSubject(event.target.value)}>{Object.entries(subjects).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <label htmlFor="admin-idea-description">What would you like to add?</label><textarea id="admin-idea-description" value={description} onChange={event => setDescription(event.target.value)} required maxLength={1500} rows={4} placeholder="What should the child learn, and what should they do in the game?" />
        <p className="payment-help">{description.length}/1500 characters. Keep personal details and passwords out of the draft.</p><button type="submit">{saving ? 'Saving idea…' : 'Save game idea'}</button>
      </fieldset></form>
      {data.ideas.length >= 100 && <p className="payment-help">This collection has reached its limit of 100 drafts.</p>}
      {notice && <p role="status" className="payment-save-status">{notice}</p>}
      <h3>Saved game ideas ({data.ideas.length})</h3>
      {data.ideas.length ? <ul className="admin-saved-ideas">{data.ideas.map(idea => <li key={idea.id}><span className="admin-idea-status">Draft</span><h4>{idea.title}</h4><p className="payment-help">{subjects[idea.subject as keyof typeof subjects] || idea.subject} · {new Date(idea.createdAt).toLocaleDateString()}</p><p className="admin-draft-description">{idea.description}</p></li>)}</ul> : <p>No saved game ideas yet.</p>}
    </>}
  </section>;
}
