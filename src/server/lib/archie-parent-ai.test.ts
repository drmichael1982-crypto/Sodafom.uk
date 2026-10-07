// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';
import type { Server } from 'node:http';
vi.mock('./archie-parent-auth', () => ({ getPreviewParentSession: vi.fn(async () => null) }));
import { ParentAIKeyStore, createParentAIRouter } from './archie-parent-ai';
const fixtureKey = 'sk-' + 'fictional-test-credential-123456789';
describe('individual parent AI credentials', () => {
  it('isolates parents and never returns credentials in status', () => {
    const store = new ParentAIKeyStore(() => 100);
    expect(store.set('parent-a', fixtureKey)).toBe(true);
    expect(store.status('parent-a')).toEqual({ connected: true, provider: 'openai', expiresAt: 1800100, verified: false });
    expect(JSON.stringify(store.status('parent-a'))).not.toContain(fixtureKey);
    expect(store.env('parent-b', {})).toBeNull();
    expect(store.env('parent-a', { ARCHIE_CLOUD_PROVIDER: 'gemini' })?.OPENAI_API_KEY).toBe(fixtureKey);
    expect(store.env('parent-a', {})?.ARCHIE_CLOUD_PROVIDER).toBe('openai');
  });
  it('expires keys after thirty minutes and supports immediate disconnect', () => {
    let now = 0; const store = new ParentAIKeyStore(() => now);
    store.set('a', fixtureKey); now = 1800000;
    expect(store.env('a', {})).toBeNull(); expect(store.status('a').connected).toBe(false);
    store.set('a', fixtureKey); store.remove('a'); expect(store.env('a', {})).toBeNull();
  });
  it('rejects malformed, whitespace, oversized and non-OpenAI secrets', () => {
    const store = new ParentAIKeyStore();
    for (const key of ['', 'hello', 'sk-short', 'sk-' + 'x'.repeat(2041), fixtureKey + ' extra']) expect(store.set('a', key)).toBe(false);
    expect(store.status('a').connected).toBe(false);
  });
});

describe('scheduled parent key deletion', () => {
  // Inspect actual memory without status/env, which could hide missing scheduled cleanup by pruning.
  const retained = (store: ParentAIKeyStore) => Reflect.get(store, 'keys') as Map<string, { key: string }>;
  it('deletes the retained credential at thirty minutes even when nobody makes another request', () => {
    vi.useFakeTimers();
    const store = new ParentAIKeyStore();
    try {
      store.set('idle-parent', fixtureKey);
      expect(retained(store).get('idle-parent')?.key).toBe(fixtureKey);
      vi.advanceTimersByTime(1_799_999);
      expect(retained(store).has('idle-parent')).toBe(true);
      vi.advanceTimersByTime(1);
      expect(retained(store).size).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally { store.remove('idle-parent'); vi.useRealTimers(); }
  });
  it('cancels the old deadline and ignores a stale expiry callback after reconnecting', () => {
    vi.useFakeTimers();
    const scheduled = vi.spyOn(globalThis, 'setTimeout');
    const store = new ParentAIKeyStore();
    const replacementKey = 'sk-fictional-replacement-123456789';
    try {
      store.set('reconnected-parent', fixtureKey);
      const oldExpiry = scheduled.mock.calls[0][0] as () => void;
      vi.advanceTimersByTime(900_000);
      store.set('reconnected-parent', replacementKey);
      expect(vi.getTimerCount()).toBe(1);
      oldExpiry();
      expect(retained(store).get('reconnected-parent')?.key).toBe(replacementKey);
      vi.advanceTimersByTime(900_000);
      expect(retained(store).get('reconnected-parent')?.key).toBe(replacementKey);
      vi.advanceTimersByTime(899_999);
      expect(retained(store).has('reconnected-parent')).toBe(true);
      vi.advanceTimersByTime(1);
      expect(retained(store).size).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally { store.remove('reconnected-parent'); scheduled.mockRestore(); vi.useRealTimers(); }
  });
  it('disconnect removes both the retained secret and its scheduled callback', () => {
    vi.useFakeTimers();
    const store = new ParentAIKeyStore();
    try {
      store.set('disconnected-parent', fixtureKey);
      expect(vi.getTimerCount()).toBe(1);
      store.remove('disconnected-parent');
      expect(retained(store).size).toBe(0);expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(1_800_000);
      expect(retained(store).size).toBe(0);
    } finally { store.remove('disconnected-parent'); vi.useRealTimers(); }
  });
});

describe('parent key HTTP boundary', () => {
  let server: Server; let base = '';
  beforeAll(async () => {
    vi.stubEnv('BETTER_AUTH_URL', 'https://preview.example.test');
    const app = express();
    app.use('/ai', createParentAIRouter(async req => ['a', 'b'].includes(req.get('x-fixture-parent') || '') ? { user: { id: req.get('x-fixture-parent')! } } : null, new ParentAIKeyStore()));
    await new Promise<void>((resolve, reject) => { server = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve()); });
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('No test address');
    base = `http://127.0.0.1:${address.port}/ai`;
  });
  afterAll(async () => { vi.unstubAllEnvs(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
  const headers = (parent = 'a', origin = 'https://preview.example.test') => ({ 'Content-Type': 'application/json', Origin: origin, 'x-fixture-parent': parent });
  it('rejects cross-origin, unauthenticated and malformed setup without revealing the supplied secret', async () => {
    for (const [parent, origin, expected] of [['a', 'https://untrusted.example', 403], ['unknown', 'https://preview.example.test', 401]] as const) {
      const reply = await fetch(base + '/connect', { method: 'POST', headers: headers(parent, origin), body: JSON.stringify({ key: fixtureKey }) });
      expect(reply.status).toBe(expected); expect(await reply.text()).not.toContain(fixtureKey);
    }
    const invalid = await fetch(base + '/connect', { method: 'POST', headers: headers(), body: JSON.stringify({ key: 'invalid' }) });
    expect(invalid.status).toBe(400);
  });
  it('parses the key, isolates real resolver identities and deletes it on disconnect', async () => {
    const connect = await fetch(base + '/connect', { method: 'POST', headers: headers(), body: JSON.stringify({ key: fixtureKey }) });
    expect(connect.status).toBe(200); const output = await connect.text(); expect(output).not.toContain(fixtureKey); expect(JSON.parse(output).connected).toBe(true);
    const another = await fetch(base + '/status', { headers: headers('b') }); expect((await another.json()).connected).toBe(false);
    const disconnect = await fetch(base + '/disconnect', { method: 'POST', headers: headers(), body: '{}' });
    expect(disconnect.status).toBe(200); expect((await disconnect.json()).connected).toBe(false);
    const status = await fetch(base + '/status', { headers: headers() }); expect((await status.json()).connected).toBe(false);
  });
});
