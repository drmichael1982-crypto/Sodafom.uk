import type { Request, Response } from 'express';
import { adminSecurityConfigured, hasAdminAccess, isConfiguredAdminCode, issueFounderSession } from '@/server/admin-auth';

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export default async function handler(req: Request, res: Response) {
  if (await hasAdminAccess(req)) {
    res.json({ success: true });
    return;
  }

  if (!adminSecurityConfigured()) {
    res.status(503).json({ success: false, error: 'Founder authentication is not configured' });
    return;
  }

  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = attempts.get(key);
  const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + WINDOW_MS } : current;
  if (bucket.count >= MAX_ATTEMPTS) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    res.status(429).json({ success: false, error: 'Too many attempts. Please wait and try again.' });
    return;
  }

  const { code } = req.body as { code?: string };

  if (!code) {
    res.status(400).json({ success: false, error: 'Code is required' });
    return;
  }

  if (isConfiguredAdminCode(code) && issueFounderSession(res)) {
    attempts.delete(key);
    res.json({ success: true });
  } else {
    attempts.set(key, { ...bucket, count: bucket.count + 1 });
    res.status(401).json({ success: false, error: 'Invalid access code' });
  }
}
