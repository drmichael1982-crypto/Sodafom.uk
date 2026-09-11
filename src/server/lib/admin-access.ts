import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSecret } from '#airo/secrets';

function configuredSecret(name: 'ADMIN_MASTER_CODE' | 'BETTER_AUTH_SECRET'): string | null {
  const value = name === 'ADMIN_MASTER_CODE'
    ? process.env.ADMIN_MASTER_CODE
    : getSecret('BETTER_AUTH_SECRET');

  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function secureEqual(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length
    && timingSafeEqual(candidateBuffer, expectedBuffer);
}

/** Returns ISO week number and year for a given date. */
export function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

/** Generates the weekly admin code. Returns null when auth is not configured. */
export function generateWeekCode(week: number, year: number): string | null {
  const authSecret = configuredSecret('BETTER_AUTH_SECRET');
  if (!authSecret) return null;

  const message = `sodafom-admin-week-${week}-${year}`;
  return createHmac('sha256', authSecret)
    .update(message)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();
}

/** Validates only the Railway-configured founder/admin master code. */
export function isValidMasterCode(code: string | undefined): boolean {
  const masterCode = configuredSecret('ADMIN_MASTER_CODE');
  return Boolean(code && masterCode && secureEqual(code, masterCode));
}

/** Validates the configured master code or the current rolling weekly code. */
export function isValidAdminCode(code: string | undefined, now = new Date()): boolean {
  if (!code) return false;
  if (isValidMasterCode(code)) return true;

  const { week, year } = getISOWeek(now);
  const rollingCode = generateWeekCode(week, year);
  return Boolean(rollingCode && secureEqual(code, rollingCode));
}
