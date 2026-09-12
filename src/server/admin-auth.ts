import type { Request, Response } from 'express';
import { createHmac, scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';
import { getAuth } from '@/lib/auth/auth';

const FOUNDER_COOKIE = 'sodafom_founder_session';
const FOUNDER_SESSION_MS = 2 * 60 * 60 * 1000;

function secret(name: string): string | null {
  return process.env[name]?.trim() || null;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isConfiguredAdminCode(code: unknown): boolean {
  if (typeof code !== 'string' || !code || code.length > 128) return false;
  const hash = secret('ADMIN_MASTER_CODE_HASH');
  if (hash) {
    const parts = hash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt' || !/^[a-f0-9]{32}$/i.test(parts[1]) || !/^[a-f0-9]{64}$/i.test(parts[2])) return false;
    try {
      const actual = scryptSync(code, Buffer.from(parts[1], 'hex'), 32).toString('hex');
      return safeEqual(actual, parts[2].toLowerCase());
    } catch {
      return false;
    }
  }
  // Compatibility for existing installations; the value never reaches the browser.
  const configured = secret('ADMIN_MASTER_CODE');
  return Boolean(configured && safeEqual(code, configured));
}

function signFounderPayload(payload: string): string | null {
  const signingSecret = secret('BETTER_AUTH_SECRET');
  const codeVersion = secret('ADMIN_MASTER_CODE_HASH') || secret('ADMIN_MASTER_CODE');
  if (!signingSecret || !codeVersion) return null;
  // Binding sessions to the current code also revokes old sessions on code rotation.
  return createHmac('sha256', signingSecret)
    .update(JSON.stringify(['sodafom-founder-v2', codeVersion, payload])).digest('hex');
}

function founderCookie(req: Request): string | null {
  const raw = req.headers.cookie;
  if (typeof raw !== 'string' || raw.length > 16_384) return null;
  for (const item of raw.split(';')) {
    const separator = item.indexOf('=');
    if (separator < 1 || item.slice(0, separator).trim() !== FOUNDER_COOKIE) continue;
    try { return decodeURIComponent(item.slice(separator + 1).trim()); }
    catch { return null; }
  }
  return null;
}

export function hasFounderSession(req: Request): boolean {
  const token = founderCookie(req);
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [issuedAtRaw, nonce, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isSafeInteger(issuedAt) || issuedAt <= 0 || !/^[a-f0-9]{36}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(signature)) return false;
  if (Date.now() - issuedAt >= FOUNDER_SESSION_MS || issuedAt > Date.now() + 60_000) return false;
  const expected = signFounderPayload(`${issuedAtRaw}.${nonce}`);
  return Boolean(expected && safeEqual(signature, expected));
}

export function issueFounderSession(res: Response): boolean {
  const issuedAt = String(Date.now());
  const nonce = randomBytes(18).toString('hex');
  const signature = signFounderPayload(`${issuedAt}.${nonce}`);
  if (!signature) return false;
  res.cookie(FOUNDER_COOKIE, `${issuedAt}.${nonce}.${signature}`, {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: FOUNDER_SESSION_MS,
  });
  return true;
}

export async function hasAdminAccess(req: Request): Promise<boolean> {
  // Public open/testing mode must never bypass authentication in production.
  if (process.env.NODE_ENV === 'development' && secret('ADMIN_OPEN_MODE') === 'true') return true;
  if (hasFounderSession(req)) return true;
  try {
    const session = await getAuth().api.getSession({ headers: new Headers(req.headers as any) });
    const account = session?.user as { isAdmin?: boolean; email?: string | null; emailVerified?: boolean } | undefined;
    const founderEmail = secret('FOUNDER_EMAIL')?.toLowerCase();
    const verifiedFounder = account?.emailVerified === true && Boolean(founderEmail && account.email?.trim().toLowerCase() === founderEmail);
    return account?.isAdmin === true || verifiedFounder;
  } catch {
    return false;
  }
}

export function adminSecurityConfigured(): boolean {
  return Boolean((secret('ADMIN_MASTER_CODE_HASH') || secret('ADMIN_MASTER_CODE')) && secret('BETTER_AUTH_SECRET'));
}
