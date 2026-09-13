import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import { API_PREFIX } from '@/lib/config';
import { mountStickerBook, type EditorHandle } from '@/features/sticker-books/editor';
import { storageKey, type Store } from '@/features/sticker-books/model';
import '@/features/sticker-books/stickers.css';

interface Child { id: number; name: string; ageGroup: string }
function isChild(value: unknown): value is Child {
  if (typeof value !== 'object' || value === null) return false;
  const child = value as Partial<Child>;
  return Number.isSafeInteger(child.id) && Number(child.id) > 0 && typeof child.name === 'string' && typeof child.ageGroup === 'string';
}
function StickerBooksContent() {
  const { user, isAuthenticated } = useSession();
  const accountId = user?.id ?? '';
  const [data, setData] = useState<{ account: string; children: Child[]; error: string; ready: boolean }>({ account: '', children: [], error: '', ready: false });
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorHandle | null>(null);
  // Only a server-authorized child list may select a namespace. No URL/localStorage IDs.
  const child = data.account === accountId && data.ready ? data.children.find(item => item.id === selectedChild) : undefined;
  useEffect(() => {
    if (!accountId || !isAuthenticated) return;
    const abort = new AbortController();
    setSelectedChild(null);
    setData({ account: accountId, children: [], error: '', ready: false });
    void fetch(`${API_PREFIX}/children`, { credentials: 'include', cache: 'no-store', signal: abort.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Could not load your children. Please try again.');
        const body: unknown = await response.json();
        if (!body || typeof body !== 'object' || !('children' in body) || !Array.isArray(body.children) || !body.children.every(isChild)) {
          throw new Error('The child list could not be read. Please try again.');
        }
        if (!abort.signal.aborted) setData({ account: accountId, children: body.children, error: '', ready: true });
      }).catch((error: unknown) => {
        if (!abort.signal.aborted) setData({ account: accountId, children: [], error: error instanceof Error ? error.message : 'Could not load your children.', ready: true });
      });
    return () => abort.abort();
  }, [accountId, isAuthenticated, retry]);
  useEffect(() => {
    if (!host.current || !child || !accountId || !isAuthenticated) return;
    let store: Store | null = null;
    try { store = window.localStorage; } catch { /* Play remains available with an honest unsaved warning. */ }
    const instance = mountStickerBook(host.current, { owner: storageKey(accountId, child.id), ageGroup: child.ageGroup, store });
    editor.current = instance;
    return () => { instance.destroy(); if (editor.current === instance) editor.current = null; };
  }, [accountId, child?.id, child?.ageGroup, isAuthenticated]);
  return <main className="sb-page">
    <Helmet><title>Archie's Sticker Books — Sodafom</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <header>
      <Link to="/rewards" onClick={event => { if (editor.current && !editor.current.canLeave()) event.preventDefault(); }}>Back to Rewards</Link>
      <h1>Archie's Sticker Books</h1>
      <p>Choose a theme, add your favourite characters and make your own sticker stories.</p>
    </header>
    {data.account !== accountId || !data.ready ? <p role="status">Loading your child profiles…</p>
      : data.error ? <div role="alert"><p>{data.error}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button></div>
      : !data.children.length ? <p>Add a child in your <Link to="/parent-dashboard">parent area</Link> to start a sticker book.</p>
      : <>
        <label className="sb-profile">Choose whose sticker book to open
          <select aria-label="Choose child sticker book" value={selectedChild ?? ''} onChange={event => {
            if (!editor.current || editor.current.canLeave()) setSelectedChild(event.target.value ? Number(event.target.value) : null);
          }}>
            <option value="">Choose a child</option>
            {data.children.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        {child && isAuthenticated && <div key={`${accountId}:${child.id}`} ref={host} />}
      </>}
  </main>;
}
export default function StickerBooksPage() {
  return <ProtectedRoute><StickerBooksContent /></ProtectedRoute>;
}
