import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import { API_PREFIX } from '@/lib/config';
import { mountStickerBook, type EditorHandle } from '@/features/sticker-books/editor';
import { storageKey, type Store } from '@/features/sticker-books/model';
import '@/features/sticker-books/stickers.css';

export interface StickerBookChild {
  id: number;
  name: string;
  ageGroup: string;
}

function isChild(value: unknown): value is StickerBookChild {
  if (typeof value !== 'object' || value === null) return false;
  const child = value as Partial<StickerBookChild>;
  return Number.isSafeInteger(child.id)
    && Number(child.id) > 0
    && typeof child.name === 'string'
    && typeof child.ageGroup === 'string';
}

export function readStickerBookChildren(value: unknown): StickerBookChild[] | null {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'object' && value !== null && 'children' in value && Array.isArray(value.children)
      ? value.children
      : null;
  return list?.every(isChild) ? list : null;
}

function StickerBooksContent() {
  const { user, isAuthenticated } = useSession();
  const accountId = typeof user?.id === 'string' ? user.id : '';
  const [data, setData] = useState<{ account: string; children: StickerBookChild[]; error: string; ready: boolean }>({
    account: '',
    children: [],
    error: '',
    ready: false,
  });
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorHandle | null>(null);
  const child = data.account === accountId && data.ready
    ? data.children.find(item => item.id === selectedChild)
    : undefined;
  const childId = child?.id;
  const childAgeGroup = child?.ageGroup;

  useEffect(() => {
    if (!accountId || !isAuthenticated) return;
    const abort = new AbortController();
    setSelectedChild(null);
    setData({ account: accountId, children: [], error: '', ready: false });

    void fetch(`${API_PREFIX}/children`, {
      credentials: 'include',
      cache: 'no-store',
      signal: abort.signal,
    })
      .then(async response => {
        if (!response.ok) throw new Error('Could not load your children. Please try again.');
        const children = readStickerBookChildren(await response.json());
        if (!children) throw new Error('The child list could not be read. Please try again.');
        if (!abort.signal.aborted) {
          setData({ account: accountId, children, error: '', ready: true });
        }
      })
      .catch((error: unknown) => {
        if (!abort.signal.aborted) {
          setData({
            account: accountId,
            children: [],
            error: error instanceof Error ? error.message : 'Could not load your children.',
            ready: true,
          });
        }
      });

    return () => abort.abort();
  }, [accountId, isAuthenticated, retry]);

  useEffect(() => {
    if (!host.current || childId === undefined || !accountId || !isAuthenticated) return;
    let store: Store | null = null;
    try {
      store = window.localStorage;
    } catch {
      // The editor stays available and truthfully reports that it cannot save.
    }

    const instance = mountStickerBook(host.current, {
      owner: storageKey(accountId, childId),
      ageGroup: childAgeGroup,
      store,
    });
    editor.current = instance;

    return () => {
      instance.destroy();
      if (editor.current === instance) editor.current = null;
    };
  }, [accountId, childAgeGroup, childId, isAuthenticated]);

  const chooseChild = (next: number | null, select: HTMLSelectElement) => {
    if (!editor.current || editor.current.canLeave()) {
      setSelectedChild(next);
    } else {
      select.value = selectedChild === null ? '' : String(selectedChild);
    }
  };

  return (
    <main className="sb-page">
      <Helmet>
        <title>Archie's Sticker Books — Sodafom</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <header>
        <Link
          to="/rewards"
          onClick={event => {
            if (editor.current && !editor.current.canLeave()) event.preventDefault();
          }}
        >
          Back to Rewards
        </Link>
        <h1>Archie&apos;s Sticker Books</h1>
        <p>Choose a theme, add favourite characters, and make your own sticker stories.</p>
      </header>

      {data.account !== accountId || !data.ready ? (
        <p role="status">Loading your child profiles…</p>
      ) : data.error ? (
        <div role="alert">
          <p>{data.error}</p>
          <button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button>
        </div>
      ) : !data.children.length ? (
        <p>Add a child in your <Link to="/parent-dashboard">parent area</Link> to start a sticker book.</p>
      ) : (
        <>
          <label className="sb-profile">
            Choose whose sticker book to open
            <select
              aria-label="Choose child sticker book"
              value={selectedChild ?? ''}
              onChange={event => chooseChild(event.target.value ? Number(event.target.value) : null, event.currentTarget)}
            >
              <option value="">Choose a child</option>
              {data.children.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          {child && isAuthenticated && <div key={`${accountId}:${child.id}`} ref={host} />}
        </>
      )}
    </main>
  );
}

export default function StickerBooksPage() {
  return (
    <ProtectedRoute>
      <StickerBooksContent />
    </ProtectedRoute>
  );
}
