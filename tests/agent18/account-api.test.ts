/** Real BetterAuth + Drizzle + disposable MySQL integration. No production calls or email delivery. */
import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import mysql, { type Pool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { randomUUID } from 'node:crypto';

const isolated = vi.hoisted(() => ({ db: undefined as any, resetUrls: [] as string[] }));
vi.mock('@/server/db/client', () => ({ get db() { return isolated.db; } }));
vi.mock('@/server/email', () => ({
  sendEmail: async (mail: { html?: string }) => {
    const match = mail.html?.match(/href="([^"]*\/api\/auth\/reset-password[^\"]*)"/);
    if (match) isolated.resetUrls.push(match[1]);
    return true;
  },
}));

let pool: Pool;
let auth: ReturnType<typeof import('@/lib/auth/auth').getAuth>;
const origin = 'https://sodafom.uk';
const password = 'Agent18-Test-Password-Only!';

class CookieJar {
  values = new Map<string, string>();
  header() { return [...this.values].map(([name, value]) => name + '=' + value).join('; '); }
  save(response: Response) {
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator);
      const value = pair.slice(separator + 1);
      if (/Max-Age=0(?:;|$)/i.test(cookie) || !value) this.values.delete(name);
      else this.values.set(name, value);
    }
  }
  clone() { const copy = new CookieJar(); copy.values = new Map(this.values); return copy; }
}

async function request(path: string, jar: CookieJar, body?: Record<string, unknown>) {
  const response = await auth.handler(new Request(origin + '/api/auth/' + path, {
    method: body ? 'POST' : 'GET',
    headers: { origin, cookie: jar.header(), ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }));
  jar.save(response);
  return response;
}

async function register() {
  const email = 'agent18-' + randomUUID() + '@example.test';
  const jar = new CookieJar();
  const response = await request('sign-up/email', jar, { name: 'Isolated Test Parent', email, password });
  expect(response.ok).toBe(true);
  return { email, jar };
}

async function current(jar: CookieJar) {
  const response = await request('get-session?disableCookieCache=true', jar);
  expect(response.ok).toBe(true);
  return response.json();
}

async function resetToken(email: string) {
  const previous = isolated.resetUrls.length;
  const response = await request('request-password-reset', new CookieJar(), {
    email,
    redirectTo: origin + '/hub/reset-password',
  });
  expect(response.ok).toBe(true);
  expect(isolated.resetUrls.length).toBe(previous + 1);
  const url = new URL(isolated.resetUrls.at(-1)!);
  return url.searchParams.get('token') || url.pathname.split('/').at(-1)!;
}

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
  };
}

beforeAll(async () => {
  if (process.env.AGENT18_TEST_DB !== '1') throw new Error('Disposable database test flag missing.');
  pool = mysql.createPool({
    host: '127.0.0.1', port: 3306, user: 'agent18_test', password: 'agent18-disposable-test-only',
    database: 'agent18_auth_test', timezone: 'Z', connectionLimit: 3,
  });
  for (const table of ['children', 'verification', 'account', 'session', 'user']) {
    await pool.query('DROP TABLE IF EXISTS `' + table + '`');
  }
  await pool.query('CREATE TABLE `user` (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) NOT NULL UNIQUE, email_verified BOOLEAN DEFAULT FALSE, image TEXT, is_admin BOOLEAN DEFAULT FALSE, role VARCHAR(32) DEFAULT "parent", phone_number VARCHAR(32), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP) CHARACTER SET utf8mb4');
  await pool.query('CREATE TABLE `session` (id VARCHAR(255) PRIMARY KEY, expires_at DATETIME NOT NULL, token VARCHAR(255) NOT NULL UNIQUE, ip_address VARCHAR(45), user_agent TEXT, user_id VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE) CHARACTER SET utf8mb4');
  await pool.query('CREATE TABLE `account` (id VARCHAR(255) PRIMARY KEY, account_id VARCHAR(255) NOT NULL, provider_id VARCHAR(255) NOT NULL, user_id VARCHAR(255) NOT NULL, access_token TEXT, refresh_token TEXT, id_token TEXT, access_token_expires_at DATETIME, refresh_token_expires_at DATETIME, scope TEXT, password VARCHAR(255), issuer VARCHAR(255), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE) CHARACTER SET utf8mb4');
  await pool.query('CREATE TABLE `verification` (id VARCHAR(255) PRIMARY KEY, identifier VARCHAR(255) NOT NULL, value VARCHAR(255) NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP) CHARACTER SET utf8mb4');
  await pool.query('CREATE TABLE `children` (id INT AUTO_INCREMENT PRIMARY KEY, parent_id VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, age_group VARCHAR(16) NOT NULL, avatar_emoji VARCHAR(8), total_stars INT NOT NULL DEFAULT 0, active_character_id INT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parent_id) REFERENCES `user`(id) ON DELETE CASCADE) CHARACTER SET utf8mb4');
  const schema = await import('@/server/db/schema');
  isolated.db = drizzle(pool, { schema, mode: 'default' });
  auth = (await import('@/lib/auth/auth')).getAuth();
});

afterAll(async () => { if (pool) await pool.end(); });

test('sign-up persists an account through refresh and a separate sign-in', async () => {
  const { email, jar } = await register();
  const first = await current(jar);
  const refreshed = await current(jar.clone());
  expect(first.user.email).toBe(email);
  expect(refreshed.user.id).toBe(first.user.id);
  const other = new CookieJar();
  expect((await request('sign-in/email', other, { email, password })).ok).toBe(true);
  expect((await current(other)).user.id).toBe(first.user.id);
});

test('duplicate email, wrong password and expired sessions are refused', async () => {
  const { email, jar } = await register();
  const duplicate = await request('sign-up/email', new CookieJar(), { name: 'Duplicate', email, password });
  expect(duplicate.ok).toBe(false);
  expect((await request('sign-in/email', new CookieJar(), { email, password: 'Incorrect-Test-Password!' })).ok).toBe(false);
  await pool.query('UPDATE `session` SET expires_at=DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 MINUTE) WHERE user_id=?', [(await current(jar)).user.id]);
  expect(await current(jar)).toBeNull();
});

test('logout revokes the server session even if the old cookie is replayed', async () => {
  const { jar } = await register();
  const replay = jar.clone();
  expect((await request('sign-out', jar, {})).ok).toBe(true);
  expect(await current(replay)).toBeNull();
  expect(await current(jar)).toBeNull();
});

test('password reset changes credentials, revokes old sessions and cannot be reused', async () => {
  const { email, jar } = await register();
  const token = await resetToken(email);
  const newPassword = 'Agent18-New-Test-Password!';
  expect((await request('reset-password', new CookieJar(), { token, newPassword })).ok).toBe(true);
  expect(await current(jar)).toBeNull();
  expect((await request('sign-in/email', new CookieJar(), { email, password })).ok).toBe(false);
  expect((await request('sign-in/email', new CookieJar(), { email, password: newPassword })).ok).toBe(true);
  expect((await request('reset-password', new CookieJar(), { token, newPassword: password })).ok).toBe(false);
});

test('sign-up input cannot set the parent account to teacher or administrator', async () => {
  const jar = new CookieJar();
  const response = await request('sign-up/email', jar, {
    name: 'Test', email: 'agent18-' + randomUUID() + '@example.test', password, role: 'teacher', isAdmin: true,
  });
  expect(response.ok).toBe(true);
  const session = await current(jar);
  expect(session.user.isAdmin).toBe(false);
  expect(session.user.role).toBe('parent');
});

test('a parent can update only their own child avatar through the real handler', async () => {
  const owner = await register();
  const other = await register();
  const ownerSession = await current(owner.jar);
  const [insert] = await pool.query<any>('INSERT INTO `children` (parent_id, name, age_group, avatar_emoji) VALUES (?, ?, ?, ?)', [ownerSession.user.id, 'Test Child', '8-10', '⭐']);
  const childId = insert.insertId;
  const { default: handler } = await import('@/server/api/children/[childId]/PATCH');
  const ownResponse = responseRecorder();
  await handler({ headers: { cookie: owner.jar.header() }, params: { childId: String(childId) }, body: { avatarEmoji: '🦁' } } as any, ownResponse as any);
  expect(ownResponse.statusCode).toBe(200);
  const [rows] = await pool.query<any[]>('SELECT avatar_emoji FROM `children` WHERE id=?', [childId]);
  expect(rows[0].avatar_emoji).toBe('🦁');
  const otherResponse = responseRecorder();
  await handler({ headers: { cookie: other.jar.header() }, params: { childId: String(childId) }, body: { avatarEmoji: '🐯' } } as any, otherResponse as any);
  expect(otherResponse.statusCode).toBe(404);
});
