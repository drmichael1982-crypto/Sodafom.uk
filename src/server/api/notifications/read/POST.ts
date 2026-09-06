/**
 * POST /api/notifications/read
 * Marks all notifications as read (stored client-side via timestamp).
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });
    // The client stores the last-read timestamp in localStorage
    res.json({ ok: true, readAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
}
