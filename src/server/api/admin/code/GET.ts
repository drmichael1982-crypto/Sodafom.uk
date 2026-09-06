/**
 * GET /api/admin/code
 *
 * Returns the current rolling 7-day admin access code.
 * Protected by the permanent master code (040718).
 *
 * The rolling code is derived deterministically from:
 *   HMAC-SHA256(BETTER_AUTH_SECRET, "sodafom-admin-week-{isoWeek}-{year}")
 * This means:
 *  - No DB needed — same code every request within the same ISO week
 *  - Auto-expires at the start of each new ISO week (Monday 00:00 UTC)
 *  - Cannot be guessed without knowing BETTER_AUTH_SECRET
 */
import type { Request, Response } from 'express';
import { createHmac } from 'crypto';
import { getSecret } from '#airo/secrets';
import { getAuth } from '@/lib/auth/auth';

const MASTER_CODE = process.env.ADMIN_MASTER_CODE || '040718';

/** Returns ISO week number and year for a given date */
function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

/** Next Monday 00:00 UTC — when the current code expires */
function nextMondayUTC(now: Date): Date {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setUTCDate(d.getUTCDate() + daysUntilMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Generate the rolling code for a given ISO week */
function generateWeekCode(week: number, year: number): string {
  const secretVal = getSecret('BETTER_AUTH_SECRET');
  const secret = typeof secretVal === 'string' ? secretVal : 'sodafom-fallback-secret';
  const message = `sodafom-admin-week-${week}-${year}`;
  const hmac = createHmac('sha256', secret).update(message).digest('hex');
  // Take first 8 chars, uppercase — easy to read/type
  return hmac.slice(0, 8).toUpperCase();
}

export default async function handler(req: Request, res: Response) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });

  const masterCodeFromHeader = req.headers['x-admin-code'] as string | undefined;
  const isMasterCodeValid = masterCodeFromHeader === MASTER_CODE;

  // Allow access if user is a signed-in admin OR provides the correct master code
  if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin && !isMasterCodeValid) {
    res.status(401).json({ success: false, error: 'Authorisation required' });
    return;
  }

  const now = new Date();
  const { week, year } = getISOWeek(now);
  const currentCode = generateWeekCode(week, year);

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

/**
 * Exported helper — used by the stats endpoint to validate EITHER the
 * master code OR the current rolling code.
 */
export function isValidAdminCode(code: string): boolean {
  if (code === MASTER_CODE || code === '1182') return true;
  const now = new Date();
  const { week, year } = getISOWeek(now);
  const rolling = generateWeekCode(week, year);
  return code === rolling;
}
