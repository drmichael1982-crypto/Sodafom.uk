import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createParentAuthService, parentAuthOptions, readParentAuthConfiguration, verifyParentAccountTables, type ParentAuthRuntime, type PreviewParentSession } from './archie-parent-auth';

const configured = {
  ARCHIE_PARENT_ACCOUNTS_ENABLED: 'true', NODE_ENV: 'development',
  BETTER_AUTH_SECRET: 'synthetic-only-ABCDEFGHIJKLMNOPQRSTUVWXYZ-1234567890',
  BETTER_AUTH_URL: 'http://127.0.0.1:4173',
  DB_HOST: '127.0.0.1', DB_USER: 'fixture_user', DB_PASSWORD: 'synthetic-only', DB_NAME: 'fixture_database',
};
function request(path = '/api/auth/sign-in/email', body: unknown = { email: 'parent@example.test', password: 'synthetic-password' }, origin = configured.BETTER_AUTH_URL): Request {
  const headers: Record<string, string> = {
    origin, 'content-type': 'application/json', cookie: 'sodafom-parent.session_token=synthetic-cookie',
    'x-forwarded-for': 'attacker-supplied', 'x-sodafom-parent-client-ip': 'also-attacker-supplied',
  };
  return { path, originalUrl: path, method: path === '/api/auth/get-session' ? 'GET' : 'POST', body,
    headers, socket: { remoteAddress: '127.0.0.2' }, get: (name: string) => headers[name.toLowerCase()] } as unknown as Request;
}
function response() {
  return { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(), end: vi.fn().mockReturnThis() } as unknown as Response;
}
function backend() {
  return {
    handle: vi.fn(async (_request: globalThis.Request) => new globalThis.Response(JSON.stringify({ user: { id: 'parent-a' } }), {
      status: 200, headers: { 'content-type': 'application/json', 'set-cookie': 'sodafom-parent.session_token=opaque; HttpOnly; SameSite=Lax; Path=/' },
    })),
    getSession: vi.fn(async (_headers: Headers): Promise<PreviewParentSession | null> => ({ user: { id: 'parent-a', email: 'parent@example.test', isAdmin: false } })),
    close: vi.fn(async () => undefined),
  } satisfies ParentAuthRuntime;
}

describe('isolated preview parent account backend', () => {
  it('does not initialise a database or fabricate a session while disconnected', async () => {
    const load = vi.fn(); const service = createParentAuthService({}, load);
    expect(await service.status()).toMatchObject({ state: 'disconnected', configured: false, ready: false });
    expect(await service.getSession(request())).toBeNull();
    const res = response(); await service.handle(request('/api/auth/get-session'), res);
    expect(res.status).toHaveBeenCalledWith(200); expect(res.json).toHaveBeenCalledWith(null);
    const signin = response(); await service.handle(request(), signin);
    expect(signin.status).toHaveBeenCalledWith(503);
    expect(load).not.toHaveBeenCalled();
  });
  it('rejects weak privileged codes, absent DB credentials and non-HTTPS public origins', () => {
    expect(readParentAuthConfiguration({ ...configured, BETTER_AUTH_SECRET: '1182' }).missing).toContain('strong_server_secret');
    expect(readParentAuthConfiguration({ ...configured, BETTER_AUTH_SECRET: 'a'.repeat(64) }).missing).toContain('strong_server_secret');
    expect(readParentAuthConfiguration({ ...configured, DB_PASSWORD: '' }).missing).toContain('persistent_database_configuration');
    expect(readParentAuthConfiguration({ ...configured, BETTER_AUTH_URL: 'http://accounts.example.test' }).missing).toContain('explicit_same_origin_url');
    expect(readParentAuthConfiguration({ ...configured, NODE_ENV: 'production' }).missing).toContain('explicit_same_origin_url');
    expect(readParentAuthConfiguration({ ...configured, BETTER_AUTH_URL: 'https://accounts.example.test/api/auth' }).missing).toContain('explicit_same_origin_url');
  });
  it('requires verified TLS for remote databases and enables it in explicit setup', () => {
    expect(readParentAuthConfiguration({ ...configured, DB_HOST: 'db.example.test' }).missing).toContain('verified_database_tls');
    expect(readParentAuthConfiguration({ ...configured, DB_HOST: 'db.example.test', ARCHIE_PARENT_DB_TLS: 'true' }).configuration?.database.tls).toBe(true);
  });
  it('uses Better Auth security and persistent rate limits without notification hooks or browser keys', () => {
    const configuration = readParentAuthConfiguration(configured).configuration!;
    const options = parentAuthOptions(configuration, undefined);
    expect(options.trustedOrigins).toEqual([configured.BETTER_AUTH_URL]);
    expect(options.advanced).toMatchObject({ disableCSRFCheck: false, disableOriginCheck: false,
      cookiePrefix: 'sodafom-parent', defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' } });
    expect(options.rateLimit).toMatchObject({ enabled: true, storage: 'database',
      customRules: { '/sign-in/email': { window: 60, max: 5 }, '/sign-up/email': { window: 60, max: 3 } } });
    expect(options.user?.additionalFields?.isAdmin?.input).toBe(false);
    expect(options.user?.additionalFields?.role?.input).toBe(false);
    expect(options.emailAndPassword).toMatchObject({ enabled: true, minPasswordLength: 12, maxPasswordLength: 128 });
    expect(options.databaseHooks).toBeUndefined();
    expect(options.emailAndPassword?.sendResetPassword).toBeUndefined();
    const secure = parentAuthOptions({ ...configuration, secure: true, origin: 'https://accounts.example.test' }, undefined);
    expect(secure.advanced?.defaultCookieAttributes?.secure).toBe(true);
  });
  it('reports readiness only after successful infrastructure initialisation and shares one lazy runtime', async () => {
    const auth = backend(); const load = vi.fn(async () => auth); const service = createParentAuthService(configured, load);
    expect(load).not.toHaveBeenCalled();
    expect(await service.status()).toMatchObject({ state: 'ready', configured: true, ready: true,
      emailVerification: false, cloudProgress: false, payments: false });
    await service.status(); expect(load).toHaveBeenCalledTimes(1);
  });
  it('fails closed and hides database/secret diagnostics when setup fails', async () => {
    const load = vi.fn(async () => { throw new Error('fixture private DB details'); });
    const service = createParentAuthService(configured, load); const status = await service.status();
    expect(status.state).toBe('unavailable'); expect(status.configured).toBe(true); expect(status.ready).toBe(false);
    expect(JSON.stringify(status)).not.toContain('fixture private DB details');
    const res = response(); await service.handle(request(), res);
    expect(res.status).toHaveBeenCalledWith(503); expect(load).toHaveBeenCalledTimes(1);
  });
  it('keeps accounts unavailable when an older database lacks the required issuer column', async () => {
    const auth = backend();
    const probe = vi.fn(async (sql: string) => {
      if (sql.includes('FROM `account`') && /\bissuer\b/.test(sql)) throw new Error('fixture missing issuer');
    });
    const service = createParentAuthService(configured, async () => {
      await verifyParentAccountTables(probe);
      return auth;
    });
    expect(await service.status()).toMatchObject({ state: 'unavailable', ready: false });
    expect(probe).toHaveBeenCalledWith(expect.stringMatching(/provider_id,issuer,user_id.*FROM `account` LIMIT 0/));
    const res = response(); await service.handle(request(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(auth.handle).not.toHaveBeenCalled();
  });
  it('probes every auth and rate-limit table with read-only queries before readiness', async () => {
    const probe = vi.fn(async (_sql: string) => undefined);
    await verifyParentAccountTables(probe);
    expect(probe).toHaveBeenCalledTimes(5);
    expect(probe.mock.calls.every(([sql]) => /^SELECT .* LIMIT 0$/.test(sql))).toBe(true);
    expect(probe).toHaveBeenCalledWith(expect.stringContaining('FROM `archie_parent_rate_limit` LIMIT 0'));
  });
  it('rejects absent or mismatched Origin before passing credentials to Better Auth', async () => {
    const auth = backend(); const service = createParentAuthService(configured, async () => auth);
    for (const origin of ['', 'http://localhost:4173', 'https://attacker.example.test']) {
      const res = response(); await service.handle(request(undefined, undefined, origin), res);
      expect(res.status).toHaveBeenCalledWith(403);
    }
    expect(auth.handle).not.toHaveBeenCalled();
  });
  it('rejects cross-site fetch metadata even with a matching Origin', async () => {
    const auth = backend(); const service = createParentAuthService(configured, async () => auth);
    const req = request(); req.headers['sec-fetch-site'] = 'cross-site'; const res = response();
    await service.handle(req, res); expect(res.status).toHaveBeenCalledWith(403); expect(auth.handle).not.toHaveBeenCalled();
  });
  it('rejects client-supplied admin roles, keys and child records', async () => {
    const auth = backend(); const service = createParentAuthService(configured, async () => auth);
    for (const field of ['isAdmin', 'role', 'openaiKey', 'children']) {
      const res = response(); await service.handle(request('/api/auth/sign-up/email', { name: 'Parent', email: 'parent@example.test', password: 'synthetic-password', [field]: true }), res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(auth.handle).not.toHaveBeenCalled();
  });
  it('passes same-origin credentials only to Better Auth and preserves its cookie response', async () => {
    const auth = backend(); const service = createParentAuthService(configured, async () => auth); const res = response();
    await service.handle(request(), res);
    const webRequest = auth.handle.mock.calls[0][0];
    expect(webRequest.url).toBe(configured.BETTER_AUTH_URL + '/api/auth/sign-in/email');
    expect(webRequest.headers.get('x-forwarded-for')).toBeNull();
    expect(webRequest.headers.get('x-sodafom-parent-client-ip')).toBe('127.0.0.2');
    expect(await webRequest.json()).toEqual({ email: 'parent@example.test', password: 'synthetic-password' });
    expect(res.setHeader).toHaveBeenCalledWith('set-cookie', [expect.stringContaining('HttpOnly')]);
  });
  it('preserves rate-limit rejection instead of claiming successful login', async () => {
    const auth = backend(); auth.handle.mockImplementation(async () => new globalThis.Response('{"error":"Too many attempts"}', { status: 429, headers: { 'x-retry-after': '60' } }));
    const service = createParentAuthService(configured, async () => auth); const res = response();
    await service.handle(request(), res); expect(res.status).toHaveBeenCalledWith(429);
    expect(res.setHeader).toHaveBeenCalledWith('x-retry-after', '60');
  });
  it('returns the cookie-backed current account, without accepting a user ID from request input', async () => {
    const auth = backend(); const service = createParentAuthService(configured, async () => auth); const req = request();
    req.headers['x-user-id'] = 'parent-b';
    expect(await service.getSession(req)).toEqual({ user: { id: 'parent-a', email: 'parent@example.test', isAdmin: false } });
    expect(auth.getSession.mock.calls[0][0].get('cookie')).toContain('synthetic-cookie');
    auth.getSession.mockResolvedValueOnce(null);
    expect(await service.getSession(req)).toBeNull();
  });
  it('removes an unavailable runtime and never leaks its server errors', async () => {
    const auth = backend(); auth.handle.mockImplementation(async () => new globalThis.Response('private database details', { status: 500 }));
    const service = createParentAuthService(configured, async () => auth); const res = response();
    await service.handle(request(), res); expect(res.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(vi.mocked(res.json).mock.calls)).not.toContain('private database details');
    expect(auth.close).toHaveBeenCalledTimes(1); expect(await service.getSession(request())).toBeNull();
  });
  it('does not expose reset, admin or arbitrary account-management operations', async () => {
    const auth = backend(); const service = createParentAuthService(configured, async () => auth);
    for (const path of ['/api/auth/reset-password', '/api/auth/admin/list-users', '/api/auth/update-user']) {
      const res = response(); await service.handle(request(path), res); expect(res.status).toHaveBeenCalledWith(404);
    }
    const wrongMethod = request('/api/auth/sign-out', {}); wrongMethod.method = 'GET'; const res = response();
    await service.handle(wrongMethod, res); expect(res.status).toHaveBeenCalledWith(405);
    expect(auth.handle).not.toHaveBeenCalled();
  });
});
