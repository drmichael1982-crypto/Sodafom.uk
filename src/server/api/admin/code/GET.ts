/**
 * GET /api/admin/code
 *
 * Returns the current rolling 7-day admin access code.
 * Protected by the Railway-configured founder/admin master code.
 *
 * The rolling code is derived deterministically from:
 *   HMAC-SHA256(BETTER_AUTH_SECRET, "sodafom-admin-week-{isoWeek}-{year}")
 * This means:
 *  - No DB needed — same code every request within the same ISO week
 *  - Auto-expires at the start of each new ISO week (Monday 00:00 UTC)
 *  - Cannot be guessed without knowing BETTER_AUTH_SECRET
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import {
  generateWeekCode,
  getISOWeek,
  isValidMasterCode,
} from '@/server/lib/admin-access';

/** Next Monday 00:00 UTC — when the current code expires */
function nextMondayUTC(now: Date): Date {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setUTCDate(d.getUTCDate() + daysUntilMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function handler(req: Request, res: Response) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });

  const masterCodeFromHeader = req.headers['x-admin-code'] as string | undefined;
  const isMasterCodeValid = isValidMasterCode(masterCodeFromHeader);

  // Allow access if user is a signed-in admin OR provides the correct master code
  if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin && !isMasterCodeValid) {
    res.status(401).json({ success: false, error: 'Authorisation required' });
    return;
  }

  const now = new Date();
  const { week, year } = getISOWeek(now);
  const currentCode = generateWeekCode(week, year);

  if (!currentCode) {
    res.status(503).json({ success: false, error: 'Admin access is not configured' });
    return;
  }

  // Also compute next week's code so the admin can see it in advance
  const nextWeek = week === 52 ? 1 : week + 1;
  const nextYear = week === 52 ? year + 1 : year;
  const nextCode = generateWeekCode(nextWeek, nextYear);

  const expiresAt = nextMondayUTC(now);
  const msRemaining = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.floor(msRemaining / 86400000);
  const hoursRemaining = Math.floor((msRemaining % 86400000) / 3600000);

  res.json({
    success: true,
    currentCode,
    nextCode,
    isoWeek: week,
    isoYear: year,
    expiresAt: expiresAt.toISOString(),
    daysRemaining,
    hoursRemaining,
    generatedAt: now.toISOString(),
  });
}
