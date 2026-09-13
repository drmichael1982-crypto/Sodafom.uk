/** Real BetterAuth + Drizzle + disposable MySQL integration. No production calls or email delivery. */
import { beforeAll, afterAll, expect, test, vi } from 'vitest';
import mysql, { type Pool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { randomUUID } from 'node:crypto';
const isolated = vi.hoisted(() => ({ db: undefined as any, resetUrls: [] as string[] }));
vi.mock('@/server/db/client', () => ({ get db() { return isolated.db; } }));
vi.mock('@/server/email', () => ({ sendEmail: async (mail: { html?: string }) => {
  const match = mail.html?.match(/href="([^"]*\/api\/auth\/reset-password[^\"]*)"/);
  if (match) isolated.resetUrls.push(match[1]);
  return true;
} }));
let pool: Pool;
let auth: ReturnType<typeof import('@/lib/auth/auth').getAuth>;
const origin = 'https://sodafom.uk'; // Request objects only: nothing is sent to this host.
const password = 'Agent29-Test-Password-Only!';
class CookieJar {
  values = new Map<string,string>();
  header() { return [...this.values].map(([name,value]) => `${name}=${value}`).join('; '); }
  save(response: Response) {
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';'); const separator = pair.indexOf('=');
      const name=pair.slice(0,separator), value=pair.slice(separator+1);
      if (/Max-Age=0(?:;|$)/i.test(cookie) || !value) this.values.delete(name);
      else this.values.set(name,value);
    }
  }
  clone() { const copy = new CookieJar(); copy.values = new Map(this.values); return copy; }
}
async function request(path: string, jar: CookieJar, body?: Record<string,unknown>) {
  const response = await auth.handler(new Request(`${origin}/api/auth/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { origin, cookie: jar.header(), ...(body ? {'content-type':'application/json'} : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }));
  jar.save(response); return response;
}
async function register() {
  const email=`agent29-${randomUUID()}@example.test`; const jar=new CookieJar();
  const response=await request('sign-up/email',jar,{name:'Isolated Test Parent',email,password});
  expect(response.ok).toBe(true);
  return {email,jar};
}
async function current(jar: CookieJar) {
  const response=await request('get-session?disableCookieCache=true',jar);
  expect(response.ok).toBe(true); return response.json();
}
async function resetToken(email: string) {
  const previous=isolated.resetUrls.length;
  const response=await request('request-password-reset',new CookieJar(),{email,redirectTo:`${origin}/hub/reset-password`});
  expect(response.ok).toBe(true); expect(isolated.resetUrls.length).toBe(previous+1);
  const url=new URL(isolated.resetUrls.at(-1)!);
  return url.searchParams.get('token') || url.pathname.split('/').at(-1)!;
}
beforeAll(async () => {
  if (process.env.AGENT29_TEST_DB !== '1') throw new Error('Disposable database test flag missing.');
  // Fixed loopback-only credentials for the throwaway workflow service. Never accept a production DSN.
  pool=mysql.createPool({host:'127.0.0.1',port:3306,user:'agent29_test',password:'agent29-disposable-test-only',database:'agent29_auth_test',timezone:'Z',connectionLimit:3});
  for (const table of ['verification','account','session','user']) await pool.query(`DROP TABLE IF EXISTS \`${table}\``);
  await pool.query('CREATE TABLE `user` (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) NOT NULL UNIQUE, email_verified BOOLEAN DEFAULT FALSE, image TEXT, is_admin BOOLEAN DEFAULT FALSE, role VARCHAR(32) DEFAULT "parent", phone_number VARCHAR(32), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  await pool.query('CREATE TABLE `session` (id VARCHAR(255) PRIMARY KEY, expires_at DATETIME NOT NULL, token VARCHAR(255) NOT NULL UNIQUE, ip_address VARCHAR(45), user_agent TEXT, user_id VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE)');
  await pool.query('CREATE TABLE `account` (id VARCHAR(255) PRIMARY KEY, account_id VARCHAR(255) NOT NULL, provider_id VARCHAR(255) NOT NULL, user_id VARCHAR(255) NOT NULL, access_token TEXT, refresh_token TEXT, id_token TEXT, access_token_expires_at DATETIME, refresh_token_expires_at DATETIME, scope TEXT, password VARCHAR(255), issuer VARCHAR(255), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE)');
  await pool.query('CREATE TABLE `verification` (id VARCHAR(255) PRIMARY KEY, identifier VARCHAR(255) NOT NULL, value VARCHAR(255) NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  const schema=await import('@/server/db/schema'); isolated.db=drizzle(pool,{schema,mode:'default'});
  auth=(await import('@/lib/auth/auth')).getAuth();
});
afterAll(async()=>{if(pool)await pool.end();});
test('new account persists across repeated session reads and a separate login', async()=>{
  const {email,jar}=await register(); const first=await current(jar); const refreshed=await current(jar.clone());
  expect(first.user.email).toBe(email); expect(refreshed.user.id).toBe(first.user.id);
  const other=new CookieJar(); expect((await request('sign-in/email',other,{email,password})).ok).toBe(true);
  expect((await current(other)).user.id).toBe(first.user.id);
});
test('incorrect existing-user password is rejected without a session', async()=>{
  const {email}=await register(); const jar=new CookieJar();
  expect((await request('sign-in/email',jar,{email,password:'Incorrect-Test-Password!'})).ok).toBe(false);
  expect(await current(jar)).toBeNull();
});
test('logout revokes the session server-side, even when an old cookie is replayed', async()=>{
  const {jar}=await register(); const previous=jar.clone();
  expect((await request('sign-out',jar,{})).ok).toBe(true);
  expect(await current(previous)).toBeNull(); expect(await current(jar)).toBeNull();
});
test('expired database sessions do not survive refresh', async()=>{
  const {jar}=await register(); await pool.query('UPDATE `session` SET expires_at=DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 MINUTE)');
  expect(await current(jar)).toBeNull();
});
test('reset changes the password, revokes old sessions, and rejects token reuse', async()=>{
  const {email,jar}=await register(); const token=await resetToken(email); const newPassword='Agent29-New-Test-Password!';
  expect((await request('reset-password',new CookieJar(),{token,newPassword})).ok).toBe(true);
  expect(await current(jar)).toBeNull();
  expect((await request('sign-in/email',new CookieJar(),{email,password})).ok).toBe(false);
  expect((await request('sign-in/email',new CookieJar(),{email,password:newPassword})).ok).toBe(true);
  expect((await request('reset-password',new CookieJar(),{token,newPassword:password})).ok).toBe(false);
});
test('expired or fabricated reset tokens cannot change a password', async()=>{
  const {email}=await register(); const token=await resetToken(email);
  await pool.query('UPDATE `verification` SET expires_at=DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 MINUTE)');
  for (const invalid of [token,'fabricated-agent29-test-token']) expect((await request('reset-password',new CookieJar(),{token:invalid,newPassword:password})).ok).toBe(false);
});
test('signup input cannot grant teacher or administrator privileges', async()=>{
  const jar=new CookieJar(); const response=await request('sign-up/email',jar,{name:'Test',email:`agent29-${randomUUID()}@example.test`,password,role:'teacher',isAdmin:true});
  if (response.ok) { const session=await current(jar); expect(session.user.isAdmin).toBe(false); expect(session.user.role).toBe('parent'); }
  else expect(await current(jar)).toBeNull();
});
