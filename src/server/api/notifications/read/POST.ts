/**
 * POST /api/notifications/read
 * Existing read receipt, plus scoped reminder actions on the registered endpoint.
 * ?reminders=preferences | save | due. No new global server routes are necessary.
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { reminderHandlers } from '../../../notifications/reminder-api';
import { requireReminderWrite, ReminderHttpError } from '../../../notifications/reminder-handlers';

export default async function handler(req: Request, res: Response) {
  if (req.query.reminders !== undefined) {
    res.setHeader('Cache-Control', 'no-store');
    try { requireReminderWrite(req); }
    catch (error) { return res.status(error instanceof ReminderHttpError ? error.status : 403).json({ error: 'Use Sodafom to manage reminders.' }); }
    if (req.query.reminders === 'preferences') return reminderHandlers.read(req, res);
    if (req.query.reminders === 'save') return reminderHandlers.save(req, res);
    if (req.query.reminders === 'due') return reminderHandlers.due(req, res);
    return res.status(400).json({ error: 'Unknown reminder action.' });
  }
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
