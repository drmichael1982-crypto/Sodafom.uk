/**
 * GET /api/admin/code
 *
 * Returns the current rolling 7-day admin access code to an already
 * authenticated administrator or short-lived founder session.
 */
import type { Request, Response } from 'express';
import { generateWeekCode, getISOWeek } from '@/server/lib/admin-access';
import { hasAdminAccess } from '@/server/admin-auth';

function nextMondayUTC(now: Date): Date {
  const date = new Date(now);
  const day = date.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  date.setUTCDate(date.getUTCDate() + daysUntilMonday);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export default async function handler(req: Request, res: Response) {
  if (!(await hasAdminAccess(req))) {
    res.status(401).json({ success: false, error: 'Authorisation required' });
    return;
  }

  const now = new Date();
  const { week, year } = getISOWeek(now);
  const currentCode = generateWeekCode(week, year);
  if (!currentCode) {
    res.status(503).json({ success: false, error: 'Admin code generation is not configured' });
    return;
  }

  const nextWeek = week === 52 ? 1 : week + 1;
  const nextYear = week === 52 ? year + 1 : year;
  const nextCode = generateWeekCode(nextWeek, nextYear);
  const expiresAt = nextMondayUTC(now);
  const msRemaining = expiresAt.getTime() - now.getTime();

  res.json({
    success: true,
    currentCode,
    nextCode,
    isoWeek: week,
    isoYear: year,
    expiresAt: expiresAt.toISOString(),
    daysRemaining: Math.floor(msRemaining / 86_400_000),
    hoursRemaining: Math.floor((msRemaining % 86_400_000) / 3_600_000),
    generatedAt: now.toISOString(),
  });
}
