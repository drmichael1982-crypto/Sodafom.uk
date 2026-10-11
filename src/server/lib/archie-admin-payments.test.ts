// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import type { Server } from 'node:http';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { AdminPaymentSettingsStore, adminPaymentSettingsPath, createAdminPaymentRouter, validatePaymentDraft } from './archie-admin-payments';

describe('private future payment draft validation', () => {
  const draft = { draftEnabled: true, linkLabel: 'Parent membership', signupUrl: 'https://payments.sodafom.uk/signup' };
  it('accepts optional public HTTPS drafts and never accepts activation or secret fields', () => {
    expect(validatePaymentDraft(draft)).toEqual(draft);
    expect(validatePaymentDraft({ draftEnabled: false, linkLabel: '', signupUrl: '' })).not.toBeNull();
    for (const extra of [{ collectionEnabled: true }, { mode: 'paid' }, { secretKey: 'sk_fictional' }, { isAdmin: true }]) {
      expect(validatePaymentDraft({ ...draft, ...extra })).toBeNull();
    }
    expect(validatePaymentDraft({ ...draft, signupUrl: '' })).toBeNull();
    expect(validatePaymentDraft({ ...draft, linkLabel: '' })).toBeNull();
  });
  it('rejects unsafe, private, malformed and oversized destinations', () => {
    for (const signupUrl of ['javascript:alert(1)', 'http://payments.sodafom.uk', 'https://user:password@payments.sodafom.uk', 'https://localhost/', 'https://127.0.0.1/', 'https://[::1]/', 'https://service.internal/', 'https://service.local/', 'https://payments.sodafom.uk:1234/', 'https://payments.sodafom.uk/#secret', 'https://payments.sodafom.uk/a\nb', 'https://payments.sodafom.uk/' + 'a'.repeat(2048)]) {
      expect(validatePaymentDraft({ ...draft, signupUrl }), signupUrl).toBeNull();
    }
  });
  it('requires explicit persistent storage under the production volume', () => {
    expect(adminPaymentSettingsPath({})).toBeNull();
    expect(adminPaymentSettingsPath({ ARCHIE_ADMIN_SETTINGS_PATH: 'relative.json' })).toBeNull();
    expect(adminPaymentSettingsPath({ ARCHIE_PARENT_SQLITE_PATH: '/data/parents.sqlite' })).toBe('/data/payment-settings.json');
    expect(adminPaymentSettingsPath({ NODE_ENV: 'production', ARCHIE_ADMIN_SETTINGS_PATH: '/outside/settings.json', RAILWAY_VOLUME_MOUNT_PATH: '/data' })).toBeNull();
    expect(adminPaymentSettingsPath({ NODE_ENV: 'production', ARCHIE_ADMIN_SETTINGS_PATH: '/data/../outside/settings.json', RAILWAY_VOLUME_MOUNT_PATH: '/data' })).toBeNull();
    expect(adminPaymentSettingsPath({ NODE_ENV: 'production', ARCHIE_ADMIN_SETTINGS_PATH: '/data/settings.json', RAILWAY_VOLUME_MOUNT_PATH: '/data' })).toBe('/data/settings.json');
  });
});

describe('owner payment settings HTTP boundary', () => {
  let server: Server; let base: string; let directory: string; let file: string;
  const origin = 'https://learning.sodafom.uk';
  const draft = { draftEnabled: true, linkLabel: 'Future membership', signupUrl: 'https://payments.sodafom.uk/signup' };
  const headers = (identity = 'owner', requestOrigin = origin) => ({ 'x-fixture-identity': identity, Origin: requestOrigin, 'Content-Type': 'application/json' });
  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), 'archie-admin-payment-test-')); file = join(directory, 'settings.json');
    const app = express();
    app.use('/unconfigured', createAdminPaymentRouter(async () => ({ user: { id: 'owner', isAdmin: true } }), { BETTER_AUTH_URL: origin }, new AdminPaymentSettingsStore(file)));
    app.use('/payments', createAdminPaymentRouter(async req => {
      const identity = req.get('x-fixture-identity');
      if (!identity || identity === 'anonymous') return null;
      return { user: { id: identity, isAdmin: identity === 'owner' || identity === 'different-admin' } };
    }, { BETTER_AUTH_URL: origin, ARCHIE_OWNER_USER_ID: ' owner ' }, new AdminPaymentSettingsStore(file)));
    await new Promise<void>((resolve, reject) => { server = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve()); });
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('No address');
    base = `http://127.0.0.1:${address.port}/payments`;
  });
  afterAll(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); await rm(directory, { recursive: true, force: true }); });
  it('starts free, disabled and without a prepared draft', async () => {
    const response = await fetch(base, { headers: headers() });
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({ mode: 'free', collectionEnabled: false, draftEnabled: false, signupUrl: '', updatedAt: null });
  });
  it('grants nobody access when the server owner ID is missing, even with an admin flag', async () => {
    const response = await fetch(base.replace('/payments', '/unconfigured'), { headers: headers() });
    expect(response.status).toBe(403);
  });
  it('denies anonymous, ordinary parents and non-owner admins, including a spoofed admin header', async () => {
    for (const [identity, code] of [['anonymous', 401], ['parent', 403], ['different-admin', 403]] as const) {
      for (const method of ['GET', 'PUT']) {
        const response = await fetch(base, { method, headers: { ...headers(identity), 'x-admin-code': '4718', 'x-is-admin': 'true' }, ...(method === 'PUT' ? { body: JSON.stringify(draft) } : {}) });
        expect(response.status).toBe(code); expect(await response.text()).not.toContain(draft.signupUrl);
      }
    }
  });
  it('rejects cross-site mutations and attempts to activate payments', async () => {
    const cross = await fetch(base, { method: 'PUT', headers: headers('owner', 'https://elsewhere.invalid'), body: JSON.stringify(draft) });
    expect(cross.status).toBe(403);
    const missing = await fetch(base, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-fixture-identity': 'owner' }, body: JSON.stringify(draft) });
    expect(missing.status).toBe(403);
    const activation = await fetch(base, { method: 'PUT', headers: headers(), body: JSON.stringify({ ...draft, collectionEnabled: true }) });
    expect(activation.status).toBe(400);
  });
  it('saves persistently for the owner while keeping collection off and free mode immutable', async () => {
    const response = await fetch(base, { method: 'PUT', headers: headers(), body: JSON.stringify(draft) });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ...draft, mode: 'free', collectionEnabled: false, editable: true });
    const reopened = await new AdminPaymentSettingsStore(file).read();
    expect(reopened).toMatchObject({ ...draft, mode: 'free', collectionEnabled: false });
    expect(reopened.updatedAt).toEqual(expect.any(String));
    expect((await stat(file)).mode & 0o777).toBe(0o600);
  });
  it('reports absent storage honestly and refuses saves', async () => {
    const disabled = new AdminPaymentSettingsStore(null);
    expect(await disabled.read()).toMatchObject({ editable: false, mode: 'free', collectionEnabled: false });
    await expect(disabled.save(draft)).rejects.toThrow('not configured');
  });
});
