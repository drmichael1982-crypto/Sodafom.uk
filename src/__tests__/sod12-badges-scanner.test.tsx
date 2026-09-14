/**
 * SOD-12 independent acceptance probes for badge and scanner failure paths.
 * These tests deliberately use malformed local storage, HTTP error responses,
 * and synthetic FileReader/fetch failures. No database, provider, or account
 * is used. Run with: pnpm exec vitest run src/__tests__/sod12-badges-scanner.test.tsx
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/auth-client', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@dr.pogodin/react-helmet', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, variants: _variants, initial: _initial, animate: _animate, transition: _transition, custom: _custom, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, animate: _animate, transition: _transition, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

vi.mock('lucide-react', () => ({
  Lock: () => <span aria-hidden="true" />,
  ChevronDown: () => <span aria-hidden="true" />,
  Camera: () => <span aria-hidden="true" />,
  ImageOff: () => <span aria-hidden="true" />,
  Mic: () => <span aria-hidden="true" />,
  Send: () => <span aria-hidden="true" />,
  ShieldCheck: () => <span aria-hidden="true" />,
  Sparkles: () => <span aria-hidden="true" />,
  Volume2: () => <span aria-hidden="true" />,
  ArrowLeft: () => <span aria-hidden="true" />,
  Home: () => <span aria-hidden="true" />,
}));

vi.mock('@/components/FeaturePageShell', () => ({
  default: ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) => <main><h1>{title}</h1><p>{subtitle}</p>{children}</main>,
}));

vi.mock('@/components/ArchieCharacter', () => ({
  ArchieCharacter: () => <span aria-hidden="true" />,
  default: () => <span aria-hidden="true" />,
}));

vi.mock('@/hooks/useChildAge', () => ({
  getActiveChild: () => ({ id: 7, name: 'Learner', ageGroup: '8-10', avatarEmoji: '⭐' }),
}));

vi.mock('@/lib/voice-context', () => ({ ttsSpeak: vi.fn() }));

vi.mock('@/lib/badges', () => ({
  RARITY_COLOURS: {
    common: { bg: '', border: '', text: '', label: 'Common' },
    rare: { bg: '', border: '', text: '', label: 'Rare' },
    epic: { bg: '', border: '', text: '', label: 'Epic' },
    legendary: { bg: '', border: '', text: '', label: 'Legendary' },
  },
}));

import BadgesPage from '@/pages/badges';
import HomeworkHelperPage from '@/pages/HomeworkHelperPage';
import * as learningPhoto from '@/lib/learning-photo';

function renderInRouter(element: React.ReactNode) {
  return render(<HelmetProvider><MemoryRouter>{element}</MemoryRouter></HelmetProvider>);
}

function response(body: unknown, ok = true, status = ok ? 200 : 500) {
  return { ok, status, json: async () => body, text: async () => typeof body === 'string' ? body : JSON.stringify(body) };
}

describe('SOD-12 badges failure handling', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 7 }));
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('shows a recoverable error and does not fetch when stored child JSON is malformed', async () => {
    localStorage.setItem('sodafom_active_child', '{not-json');

    renderInRouter(<BadgesPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/active child|unable|failed|load/i);
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText(/^\d+ of \d+ earned$/i)).not.toBeInTheDocument();
    expect(screen.queryByText('✓ Earned')).not.toBeInTheDocument();
    expect(screen.queryByText('Games played')).not.toBeInTheDocument();
  });

  it('shows a recoverable error and does not fetch when browser storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage unavailable'); });

    renderInRouter(<BadgesPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/active child|unable|failed|load/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ['an HTTP error response', response({ error: 'Child not found' }, false, 404)],
    ['a response with no badges array', response({ error: 'malformed payload' })],
    ['a malformed JSON body', { ok: true, status: 200, json: async () => { throw new SyntaxError('invalid JSON'); } }],
  ])('renders an error instead of crashing for %s', async (_label, fetchResponse) => {
    vi.mocked(fetch).mockResolvedValue(fetchResponse as Response);

    renderInRouter(<BadgesPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed|unable|load|not found|unavailable/i);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/No badges match this filter/i)).not.toBeInTheDocument();
  });
});

describe('SOD-12 scanner failure handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rejects an oversized image before reading or sending it', async () => {
    renderInRouter(<HomeworkHelperPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const large = new File(['x'], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(large, 'size', { value: 6 * 1024 * 1024 + 1 });

    fireEvent.change(input, { target: { files: [large] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/smaller than 6 MB/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows a clear error when the device cannot read the selected image', async () => {
    class FailingFileReader {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() { queueMicrotask(() => this.onerror?.()); }
    }
    vi.stubGlobal('FileReader', FailingFileReader);
    renderInRouter(<HomeworkHelperPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'homework.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be opened|try again/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ['an HTTP failure', 'Provider failure', false, 502, /could not read|try again|unavailable/i],
    ['the paused online helper', 'Service disabled', false, 503, /paused/i],
    ['an oversized request', 'Too large', false, 413, /too large|crop/i],
    ['an empty successful reply', '   ', true, 200, /could not read|try again/i],
  ] as const)('surfaces %s instead of presenting an answer', async (_label, body, ok, status, expected) => {
    // This probe isolates HTTP failure handling. Real FileReader failure and
    // oversize rejection are covered above; image/canvas preparation has its
    // own pipeline tests, rather than pretending jsdom decodes an image.
    vi.spyOn(learningPhoto, 'prepareLearningPhoto').mockResolvedValue('data:image/jpeg;base64,YQ==');
    vi.mocked(fetch).mockResolvedValue(response(body, ok, status) as Response);
    renderInRouter(<HomeworkHelperPage />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], 'homework.jpg', { type: 'image/jpeg' })] } });

    const explain = await screen.findByRole('button', { name: /explain this homework/i });
    fireEvent.click(explain);

    expect(await screen.findByRole('alert')).toHaveTextContent(expected);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('heading', { name: "Archie's explanation" })).not.toBeInTheDocument();
  });
});
