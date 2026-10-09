// @vitest-environment node
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import { createParentAuthService } from './archie-parent-auth';

describe('real persistent parent authentication', () => {
  it('hashes passwords, isolates two parent sessions, persists accounts and revokes sign-out', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'archie-auth-test-'));
    const env = { ARCHIE_PARENT_ACCOUNTS_ENABLED: 'true', NODE_ENV: 'development',
      BETTER_AUTH_SECRET: 'synthetic-only-ABCDEFGHIJKLMNOPQRSTUVWXYZ-1234567890',
      BETTER_AUTH_URL: 'http://127.0.0.1:4173', ARCHIE_PARENT_SQLITE_PATH: join(folder, 'accounts.sqlite') };
    let service = createParentAuthService(env);
    const request = (path: string, body?: unknown, cookie = '') => {
      const headers = { origin: env.BETTER_AUTH_URL, 'content-type': 'application/json', cookie };
      return { path, originalUrl: path, method: body ? 'POST' : 'GET', body, headers,
        socket: { remoteAddress: '127.0.0.1' }, get: (name: string) => headers[name as keyof typeof headers] } as unknown as Request;
    };
    const call = async (path: string, body?: unknown, cookie = '') => {
      const captured = { status: 200, body: '', headers: {} as Record<string, string | string[]> };
      const res = { status(value: number) { captured.status = value; return this; },
        setHeader(name: string, value: string | string[]) { captured.headers[name.toLowerCase()] = value; return this; },
        send(value: string) { captured.body = value; return this; },
        json(value: unknown) { captured.body = JSON.stringify(value); return this; }, end() { return this; } } as unknown as Response;
      await service.handle(request(path, body, cookie), res);
      const cookies = captured.headers['set-cookie'];
      return { ...captured, cookie: (Array.isArray(cookies) ? cookies : cookies ? [cookies] : []).map(value => value.split(';')[0]).join('; '),
        data: captured.body ? JSON.parse(captured.body) : null };
    };
    try {
      expect(await service.status()).toMatchObject({ ready: true });
      const accounts = [];
      for (const email of ['first@example.test', 'second@example.test']) {
        const signup = await call('/api/auth/sign-up/email', { name: 'Test parent', email, password: 'Synthetic-only-passphrase-42' });
        expect(signup.status).toBe(200);
        expect(signup.cookie).toContain('sodafom-parent.session_token=');
        const session = await service.getSession(request('/api/auth/get-session', undefined, signup.cookie));
        expect(session?.user.email).toBe(email);
        expect(session?.user.isAdmin).toBe(false);
        accounts.push({ email, cookie: signup.cookie, id: session!.user.id });
      }
      expect(accounts[0].id).not.toBe(accounts[1].id);
      expect(await service.stats()).toEqual({ registeredParents: 2, validParentSessions: 2 });
      expect(await service.getSession(request('/api/auth/get-session'))).toBeNull();
      const { DatabaseSync } = await import('node:sqlite');
      const database = new DatabaseSync(env.ARCHIE_PARENT_SQLITE_PATH);
      const stored = database.prepare('SELECT password FROM account').all() as { password: string }[];
      expect(stored).toHaveLength(2);
      for (const row of stored) { expect(row.password).not.toBe('Synthetic-only-passphrase-42'); expect(row.password.length).toBeGreaterThan(40); }
      const expiry = database.prepare('SELECT "expiresAt" FROM "session" WHERE "userId" = ?').get(accounts[0].id) as { expiresAt: number };
      database.prepare('UPDATE "session" SET "expiresAt" = ? WHERE "userId" = ?').run(Date.now() - 1000, accounts[0].id);
      expect(await service.stats()).toEqual({ registeredParents: 2, validParentSessions: 1 });
      database.prepare('UPDATE "session" SET "expiresAt" = ? WHERE "userId" = ?').run(expiry.expiresAt, accounts[0].id);
      database.close();
      await service.close();
      service = createParentAuthService(env);
      expect(await service.status()).toMatchObject({ ready: true });
      expect((await service.getSession(request('/api/auth/get-session', undefined, accounts[0].cookie)))?.user.id).toBe(accounts[0].id);
      const bad = await call('/api/auth/sign-in/email', { email: accounts[0].email, password: 'Wrong-password-42' });
      expect(bad.status).toBe(401);
      const signin = await call('/api/auth/sign-in/email', { email: accounts[0].email, password: 'Synthetic-only-passphrase-42' });
      expect(signin.status).toBe(200);
      expect((await service.getSession(request('/api/auth/get-session', undefined, signin.cookie)))?.user.id).toBe(accounts[0].id);
      const out = await call('/api/auth/sign-out', {}, signin.cookie);
      expect(out.status).toBe(200);
      expect(await service.getSession(request('/api/auth/get-session', undefined, signin.cookie))).toBeNull();
      expect((await service.getSession(request('/api/auth/get-session', undefined, accounts[1].cookie)))?.user.id).toBe(accounts[1].id);
      const noPassword = await call('/api/auth/delete-user', {}, accounts[1].cookie);
      expect(noPassword.status).toBe(400);
      const wrongDelete = await call('/api/auth/delete-user', { password: 'Wrong-password-42' }, accounts[1].cookie);
      expect(wrongDelete.status).toBe(400);
      const deleted = await call('/api/auth/delete-user', { password: 'Synthetic-only-passphrase-42' }, accounts[1].cookie);
      expect(deleted.status).toBe(200);
      expect(await service.getSession(request('/api/auth/get-session', undefined, accounts[1].cookie))).toBeNull();
      expect((await service.stats())?.registeredParents).toBe(1);
    } finally { await service.close(); await rm(folder, { recursive: true, force: true }); }
  }, 20000);
});
