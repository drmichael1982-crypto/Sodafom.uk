/** Same-origin parent accounts. Never imports the legacy mock DB or email hooks. */
import { Router, json, type Request, type Response, type NextFunction } from 'express';
import type { BetterAuthOptions } from 'better-auth';
import { sendWebResponse } from '../../lib/auth/express-adapter';

type Environment = Record<string, string | undefined>;
export type PreviewParentSession = { user: { id: string; email?: string; isAdmin?: boolean } };
export type ParentAccountStatus = {
  state: 'disconnected' | 'ready' | 'unavailable';
  configured: boolean; ready: boolean; message: string; missing: string[];
  emailVerification: false; cloudProgress: false; payments: false;
};
export type ParentAuthConfiguration = {
  secret: string; origin: string; secure: boolean; sqlitePath?: string;
  database: { host: string; port: number; user: string; password: string; name: string; tls: boolean };
};
export interface ParentAuthRuntime {
  handle(request: globalThis.Request): Promise<globalThis.Response>;
  getSession(headers: Headers): Promise<PreviewParentSession | null>;
  close(): Promise<void>;
  stats?(): Promise<{ registeredParents: number; validParentSessions: number }>;
}
const unavailableMessage = 'Parent accounts are temporarily unavailable. Learning on this device is still available.';
const paths = new Map([
  ['/api/auth/get-session', 'GET'], ['/api/auth/sign-up/email', 'POST'],
  ['/api/auth/sign-in/email', 'POST'], ['/api/auth/sign-out', 'POST'],
  ['/api/auth/delete-user', 'POST'],
]);

/** Uses explicit environment configuration only: no default root DB or secret file. */
export function readParentAuthConfiguration(env: Environment): { configuration: ParentAuthConfiguration | null; missing: string[] } {
  const missing: string[] = [];
  if (env.ARCHIE_PARENT_ACCOUNTS_ENABLED !== 'true') return { configuration: null, missing: ['parent_accounts_enabled'] };
  const secret = env.BETTER_AUTH_SECRET || '';
  if (secret.length < 32 || new Set(secret).size < 12 || /change.?me|example|placeholder|your.?secret/i.test(secret)) missing.push('strong_server_secret');
  let origin = ''; let secure = false;
  try {
    const url = new URL(env.BETTER_AUTH_URL || '');
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
      !(url.protocol === 'https:' || (url.protocol === 'http:' && loopback && env.NODE_ENV !== 'production'))) throw new Error();
    origin = url.origin; secure = url.protocol === 'https:';
  } catch { missing.push('explicit_same_origin_url'); }
  if (env.ARCHIE_PARENT_SQLITE_PATH) {
    const path = env.ARCHIE_PARENT_SQLITE_PATH;
    const mount = env.RAILWAY_VOLUME_MOUNT_PATH;
    if (!path.startsWith('/') || path.includes('/../') || path.endsWith('/') ||
      (env.NODE_ENV === 'production' && (!mount || !path.startsWith(mount.replace(/\/$/, '') + '/')))) missing.push('persistent_database_configuration');
    return { configuration: missing.length ? null : { secret, origin, secure, sqlitePath: path,
      database: { host: '', port: 0, user: '', password: '', name: '', tls: false } }, missing };
  }
  const host = env.DB_HOST || env.MYSQL_HOST || '';
  const user = env.DB_USER || env.MYSQL_USER || '';
  const password = env.DB_PASSWORD || env.MYSQL_PASSWORD || '';
  const name = env.DB_NAME || env.MYSQL_DATABASE || '';
  const port = Number(env.DB_PORT || env.MYSQL_PORT || '3306');
  if (!host || !user || !password || !name || !Number.isInteger(port) || port < 1 || port > 65535) missing.push('persistent_database_configuration');
  const tls = env.ARCHIE_PARENT_DB_TLS === 'true';
  if (host && !['localhost', '127.0.0.1', '::1'].includes(host) && !tls) missing.push('verified_database_tls');
  return { configuration: missing.length ? null : { secret, origin, secure, database: { host, port, user, password, name, tls } }, missing };
}

/** Better Auth owns password hashing, validation, sessions and CSRF protection. */
export function parentAuthOptions(configuration: ParentAuthConfiguration, database: BetterAuthOptions['database']): BetterAuthOptions {
  return {
    database, secret: configuration.secret, baseURL: configuration.origin, basePath: '/api/auth',
    trustedOrigins: [configuration.origin],
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    user: { deleteUser: { enabled: true, afterDelete: async user => {
      const { forgetParentAI } = await import('./archie-parent-ai');
      forgetParentAI(user.id);
    } }, additionalFields: {
      isAdmin: { type: 'boolean', defaultValue: false, input: false, returned: true },
      role: { type: 'string', defaultValue: 'parent', input: false, returned: true },
    } },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
    rateLimit: {
      enabled: true, storage: 'database', window: 60, max: 60,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 60, max: 3 },
        '/sign-out': { window: 60, max: 10 },
      },
    },
    advanced: {
      disableCSRFCheck: false, disableOriginCheck: false,
      cookiePrefix: 'sodafom-parent', useSecureCookies: configuration.secure,
      defaultCookieAttributes: { httpOnly: true, secure: configuration.secure, sameSite: 'lax', path: '/' },
      // The wrapper overwrites this with the direct socket address, never an untrusted proxy header.
      ipAddress: { ipAddressHeaders: ['x-sodafom-parent-client-ip'] },
    },
    logger: { disabled: true },
  };
}

/** No account is ready until every required installed-schema column is readable. */
export async function verifyParentAccountTables(query: (sql: string) => Promise<unknown>): Promise<void> {
  for (const sql of [
    'SELECT id,name,email,email_verified,image,is_admin,role,created_at,updated_at FROM `user` LIMIT 0',
    'SELECT id,expires_at,token,ip_address,user_agent,user_id,created_at,updated_at FROM `session` LIMIT 0',
    'SELECT id,account_id,provider_id,issuer,user_id,password,access_token,refresh_token,id_token,access_token_expires_at,refresh_token_expires_at,scope,created_at,updated_at FROM `account` LIMIT 0',
    'SELECT id,identifier,value,expires_at,created_at,updated_at FROM `verification` LIMIT 0',
    'SELECT id,`key`,count,last_request FROM `archie_parent_rate_limit` LIMIT 0',
  ]) await query(sql);
}

async function loadParentAuth(configuration: ParentAuthConfiguration): Promise<ParentAuthRuntime> {
  if (configuration.sqlitePath) {
    const [{ betterAuth }, { getMigrations }, { DatabaseSync }, fs, path] = await Promise.all([
      import('better-auth'), import('better-auth/db/migration'), import('node:sqlite'), import('node:fs'), import('node:path'),
    ]);
    fs.mkdirSync(path.dirname(configuration.sqlitePath), { recursive: true, mode: 0o700 });
    const database = new DatabaseSync(configuration.sqlitePath);
    fs.chmodSync(configuration.sqlitePath, 0o600);
    try {
      database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
      const options = parentAuthOptions(configuration, database);
      const migrations = await getMigrations(options);
      const existing = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").get();
      // Initialize this dedicated account database once. Never alter existing account tables automatically.
      if (!existing) await migrations.runMigrations();
      else if (migrations.toBeCreated.length || migrations.toBeAdded.length) throw new Error('Parent account migration required');
      const auth = betterAuth(options);
      await auth.$context;
      return {
        handle: request => auth.handler(request),
        getSession: async headers => {
          const result = await auth.api.getSession({ headers });
          if (!result?.user?.id) return null;
          const user = result.user as typeof result.user & { isAdmin?: boolean };
          return { user: { id: user.id, email: user.email, isAdmin: user.isAdmin === true } };
        },
        close: async () => { database.close(); },
        stats: async () => ({
          registeredParents: Number((database.prepare("SELECT COUNT(*) AS count FROM \"user\" WHERE role = 'parent'").get() as { count: number }).count),
          validParentSessions: Number((database.prepare("SELECT COUNT(*) AS count FROM \"session\" s JOIN \"user\" u ON s.\"userId\" = u.id WHERE u.role = 'parent' AND s.\"expiresAt\" > ?").get(Date.now()) as { count: number }).count),
        }),
      };
    } catch (error) { database.close(); throw error; }
  }

  const [{ betterAuth }, { drizzleAdapter }, mysql, { drizzle }, schema, core] = await Promise.all([
    import('better-auth'), import('better-auth/adapters/drizzle'), import('mysql2/promise'),
    import('drizzle-orm/mysql2'), import('../db/schema'), import('drizzle-orm/mysql-core'),
  ]);
  const rateLimit = core.mysqlTable('archie_parent_rate_limit', {
    id: core.varchar('id', { length: 255 }).primaryKey(),
    key: core.varchar('key', { length: 255 }).notNull().unique(),
    count: core.int('count').notNull(), lastRequest: core.bigint('last_request', { mode: 'number' }).notNull(),
  });
  const config = configuration.database;
  const pool = mysql.createPool({
    host: config.host, port: config.port, user: config.user, password: config.password,
    database: config.name, connectionLimit: 4, waitForConnections: true, queueLimit: 8,
    connectTimeout: 3000, ssl: config.tls ? { rejectUnauthorized: true } : undefined,
  });
  try {
    // Read-only readiness checks. Schema creation/migration is an owner's separate action.
    await verifyParentAccountTables((sql) => pool.query({ sql, timeout: 3000 }));
    const authSchema = { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification, rateLimit };
    const db = drizzle(pool, { schema: authSchema, mode: 'default' });
    const auth = betterAuth(parentAuthOptions(configuration, drizzleAdapter(db, { provider: 'mysql', schema: authSchema, transaction: true })));
    await auth.$context;
    return {
      handle: (request) => auth.handler(request),
      getSession: async (headers) => {
        const result = await auth.api.getSession({ headers });
        if (!result?.user?.id) return null;
        const user = result.user as typeof result.user & { isAdmin?: boolean };
        return { user: { id: user.id, email: user.email, isAdmin: user.isAdmin === true } };
      },
      close: () => pool.end(),
      stats: async () => {
        const [users] = await pool.query("SELECT COUNT(*) AS count FROM `user` WHERE role = 'parent'");
        const [sessions] = await pool.query("SELECT COUNT(*) AS count FROM `session` s JOIN `user` u ON s.user_id = u.id WHERE u.role = 'parent' AND s.expires_at > NOW()");
        return { registeredParents: Number((users as { count: number }[])[0].count), validParentSessions: Number((sessions as { count: number }[])[0].count) };
      },
    };
  } catch (error) { await pool.end().catch(() => undefined); throw error; }
}

function accountHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (!value || ['content-length', 'host', 'connection', 'x-sodafom-parent-client-ip'].includes(name) || name.startsWith('x-forwarded-')) continue;
    headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  headers.set('x-sodafom-parent-client-ip', req.socket.remoteAddress || 'unknown');
  return headers;
}

export function createParentAuthService(
  env: Environment = process.env,
  load: (configuration: ParentAuthConfiguration) => Promise<ParentAuthRuntime> = loadParentAuth,
) {
  const { configuration, missing } = readParentAuthConfiguration(env);
  let runtime: Promise<ParentAuthRuntime> | null = null;
  let retryAfter = 0;
  const getRuntime = async () => {
    if (!configuration || Date.now() < retryAfter) return null;
    runtime ??= load(configuration);
    try { return await runtime; }
    catch { runtime = null; retryAfter = Date.now() + 30_000; return null; }
  };
  const invalidate = async () => {
    const old = runtime; runtime = null; retryAfter = Date.now() + 30_000;
    await old?.then((value) => value.close()).catch(() => undefined);
  };
  const status = async (): Promise<ParentAccountStatus> => {
    const ready = !!(await getRuntime());
    return {
      state: ready ? 'ready' : configuration ? 'unavailable' : 'disconnected',
      configured: !!configuration, ready, missing,
      message: ready ? 'Parent accounts are connected. Lessons on this device remain separate from account data.'
        : configuration ? unavailableMessage : 'Parent accounts need secure server setup. Learning on this device is still available.',
      emailVerification: false, cloudProgress: false, payments: false,
    };
  };
  const getSession = async (req: Request): Promise<PreviewParentSession | null> => {
    const auth = await getRuntime();
    if (!auth) return null;
    try {
      const session = await auth.getSession(accountHeaders(req));
      if (!session?.user?.id) return null;
      // Owner privileges come only from explicit server configuration.
      const ownerId = env.ARCHIE_OWNER_USER_ID?.trim();
      return { user: { ...session.user, isAdmin: Boolean(ownerId && session.user.id === ownerId) } };
    }
    catch { await invalidate(); return null; }
  };
  const handle = async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const method = paths.get(req.path);
    if (!method) return res.status(404).json({ error: 'This account operation is not available.' });
    if (req.method !== method) return res.status(405).json({ error: 'Method not allowed.' });
    const auth = await getRuntime();
    if (!auth) {
      // Better Auth's session hook must still settle while the backend is disconnected.
      if (req.path === '/api/auth/get-session') return res.status(200).json(null);
      return res.status(503).json({ error: unavailableMessage, code: 'PARENT_ACCOUNTS_UNAVAILABLE' });
    }
    if (req.method === 'POST') {
      if (req.get('origin') !== configuration!.origin || req.get('sec-fetch-site') === 'cross-site') {
        return res.status(403).json({ error: 'Open account settings on this app to continue.', code: 'INVALID_ORIGIN' });
      }
      const allowed = req.path === '/api/auth/sign-up/email' ? ['name', 'email', 'password']
        : req.path === '/api/auth/sign-in/email' ? ['email', 'password', 'rememberMe']
        : req.path === '/api/auth/delete-user' ? ['password'] : [];
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).some((key) => !allowed.includes(key))) {
        return res.status(400).json({ error: 'Account form contains unsupported fields.' });
      }
      if (req.path === '/api/auth/sign-up/email' && (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.length > 100)) {
        return res.status(400).json({ error: 'Use a short grown-up account name.' });
      }
      if (req.path === '/api/auth/delete-user') {
        if (typeof req.body.password !== 'string' || !req.body.password || req.body.password.length > 128) {
          return res.status(400).json({ error: 'Enter the current account password to delete this account.' });
        }
        if (!await getSession(req)) return res.status(401).json({ error: 'Sign in before deleting your parent account.' });
      }
    }
    try {
      let response = await auth.handle(new globalThis.Request(configuration!.origin + req.originalUrl, {
        method: req.method, headers: accountHeaders(req),
        ...(req.method === 'POST' ? { body: JSON.stringify(req.body) } : {}),
      }));
      if (response.status >= 500) { await invalidate(); return res.status(503).json({ error: unavailableMessage, code: 'PARENT_ACCOUNTS_UNAVAILABLE' }); }
      if (req.path === '/api/auth/get-session' && response.ok) {
        const data = await response.json();
        if (data?.user?.id) data.user.isAdmin = Boolean(env.ARCHIE_OWNER_USER_ID?.trim() && data.user.id === env.ARCHIE_OWNER_USER_ID.trim());
        const headers = new Headers(response.headers); headers.delete('content-length');
        response = new globalThis.Response(JSON.stringify(data), { status: response.status, headers });
      }
      await sendWebResponse(response, res);
    } catch { await invalidate(); return res.status(503).json({ error: unavailableMessage, code: 'PARENT_ACCOUNTS_UNAVAILABLE' }); }
  };
  const stats = async () => {
    const auth = await getRuntime();
    if (!auth?.stats) return null;
    try { return await auth.stats(); } catch { return null; }
  };
  return { status, getSession, handle, stats, close: invalidate };
}

const previewParentAuth = createParentAuthService();
export const getPreviewParentSession = (req: Request) => previewParentAuth.getSession(req);
export const getPreviewParentStats = () => previewParentAuth.stats();

/** Protected operations use a verified server session, never the practice gate. */
export async function requirePreviewParentSession(
  req: Request,
  res: Response,
  resolveSession: (request: Request) => Promise<PreviewParentSession | null> = getPreviewParentSession,
): Promise<PreviewParentSession | null> {
  res.setHeader('Cache-Control', 'no-store');
  const session = await resolveSession(req);
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in to a real parent account first.', code: 'PARENT_SIGN_IN_REQUIRED' });
    return null;
  }
  return session;
}

export function createParentAccountRouter(service = previewParentAuth) {
  const router = Router();
  router.get('/api/parents/account-status', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.json(await service.status());
  });
  // Parsed only on the isolated account routes; Better Auth receives a new Web Request.
  router.use(/^\/api\/auth(?:\/.*)?$/, json({ limit: '8kb', type: 'application/json' }));
  router.all(/^\/api\/auth(?:\/.*)?$/, service.handle);
  router.use((error: { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: 'Account form could not be read.' });
  });
  return router;
}
