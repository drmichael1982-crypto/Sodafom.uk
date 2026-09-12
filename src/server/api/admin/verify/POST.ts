import type { Request, Response } from 'express';
import { adminSecurityConfigured, hasAdminAccess, isConfiguredAdminCode, issueFounderSession } from '@/server/admin-auth';

type Bucket = { count: number; resetAt: number };
const attempts = new Map<string, Bucket>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
let globalAttempts: Bucket = { count: 0, resetAt: 0 };

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (await hasAdminAccess(req)) return res.json({ success: true });
  if (!adminSecurityConfigured()) return res.status(503).json({ success: false, error: 'Founder authentication is not configured' });
  const code: unknown = req.body?.code;
  if (typeof code !== 'string' || !code || code.length > 128) {
    return res.status(400).json({ success: false, error: 'Enter your founder code.' });
  }
  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  for (const [ip, bucket] of attempts) if (bucket.resetAt <= now) attempts.delete(ip);
  if (globalAttempts.resetAt <= now) globalAttempts = { count: 0, resetAt: now + WINDOW_MS };
  const bucket = attempts.get(key) || { count: 0, resetAt: now + WINDOW_MS };
  // The global cap also limits guesses made with spoofed forwarding headers.
  if (bucket.count >= MAX_ATTEMPTS || globalAttempts.count >= 25) {
    const resetAt = Math.max(bucket.resetAt, globalAttempts.resetAt);
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((resetAt - now) / 1000))));
    return res.status(429).json({ success: false, error: 'Too many attempts. Please wait and try again.' });
  }
  if (isConfiguredAdminCode(code) && issueFounderSession(res)) {
    attempts.delete(key);
    return res.json({ success: true });
  }
  attempts.set(key, { ...bucket, count: bucket.count + 1 });
  globalAttempts.count += 1;
  return res.status(401).json({ success: false, error: 'Invalid access code' });
}
