import type { Request, Response } from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getAuth } from '@/lib/auth/auth';

const FOUNDER_COOKIE = 'sodafom_founder_session';
const FOUNDER_SESSION_MS = 2 * 60 * 60 * 1000;

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function requiredSecret(name: 'ADMIN_MASTER_CODE' | 'BETTER_AUTH_SECRET'): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function isFounderUser(email?: string | null): boolean {
  const founderEmail = process.env.FOUNDER_EMAIL?.trim().toLowerCase();
  return Boolean(founderEmail && email && founderEmail === email.trim().toLowerCase());
}

export function isConfiguredAdminCode(code: string): boolean {
  const configured = requiredSecret('ADMIN_MASTER_CODE');
  return Boolean(configured && code && safeEqual(code, configured));
}

function signFounderPayload(payload: string): string | null {
  const secret = requiredSecret('BETTER_AUTH_SECRET');
  if (!secret) return null;
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function readCookies(req: Request): Record<string, string> {
  const raw = req.headers.cookie ?? '';
  return raw.split(';').reduce<Record<string, string>>((cookies, item) => {
    const separator = item.indexOf('=');
    if (separator < 1) return cookies;
    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

export function hasFounderSession(req: Request): boolean {
  const token = readCookies(req)[FOUNDER_COOKIE];
  if (!token) return false;
  const [issuedAtRaw, nonce, signature] = token.split('.');
  const issuedAt = Number(issuedAtRaw);
  if (!issuedAt || !nonce || !signature) return false;
  if (Date.now() - issuedAt > FOUNDER_SESSION_MS || issuedAt > Date.now() + 60_000) return false;
  const expected = signFounderPayload(`${issuedAtRaw}.${nonce}`);
  return Boolean(expected && safeEqual(signature, expected));
}

export function issueFounderSession(res: Response): boolean {
  const issuedAt = String(Date.now());
  const nonce = randomBytes(18).toString('hex');
  const signature = signFounderPayload(`${issuedAt}.${nonce}`);
  if (!signature) return false;
  res.cookie(FOUNDER_COOKIE, `${issuedAt}.${nonce}.${signature}`, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: FOUNDER_SESSION_MS,
  });
  return true;
}

export async function hasAdminAccess(req: Request): Promise<boolean> {
  if (hasFounderSession(req)) return true;
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
    const account = session?.user as { isAdmin?: boolean; email?: string | null } | undefined;
    return Boolean(account?.isAdmin || isFounderUser(account?.email));
  } catch {
    return false;
  }
}

export function adminSecurityConfigured(): boolean {
  return Boolean(requiredSecret('ADMIN_MASTER_CODE') && requiredSecret('BETTER_AUTH_SECRET'));
}
