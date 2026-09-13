import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { db } from '@/server/db/client';
import { students } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { positiveId, SchoolInputError } from '@/lib/teacher-school';

export function privateResponse(res: Response): void {
  res.set('Cache-Control', 'private, no-store');
  res.set('Pragma', 'no-cache');
  res.set('X-Robots-Tag', 'noindex, nofollow');
}
export function bearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  return typeof auth === 'string' && /^Bearer [a-f0-9]{96}$/.test(auth) ? auth.slice(7) : null;
}
export function tokenHash(token: string): string { return 'sha256:' + createHash('sha256').update(token).digest('hex'); }
export async function ownedStudent(rawId: unknown, teacherId: number) {
  const id = positiveId(rawId);
  const [student] = await db.select().from(students).where(and(eq(students.id, id), eq(students.teacherId, teacherId))).limit(1);
  return student ?? null;
}
export function schoolError(res: Response, error: unknown, fallback: string) {
  // Never write request bodies, credentials, pupil work, or raw DB errors into logs.
  return res.status(error instanceof SchoolInputError ? 400 : 500).json({ error: error instanceof SchoolInputError ? error.message : fallback });
}
// Per-process protection. Production still needs a shared edge limiter for multiple replicas.
const attempts = new Map<string, { count: number; until: number }>();
export function allowAttempt(req: Request, res: Response, route: string, limit: number): boolean {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const key = route + ':' + (req.ip || req.socket?.remoteAddress || 'unknown');
  let state = attempts.get(key);
  if (!state && attempts.size >= 10000) { res.set('Retry-After', '60'); res.status(429).json({ error: 'Please try again later.' }); return false; }
  if (!state) { state = { count: 0, until: now + 15 * 60 * 1000 }; attempts.set(key, state); }
  if (++state.count > limit) {
    res.set('Retry-After', String(Math.max(1, Math.ceil((state.until - now) / 1000))));
    res.status(429).json({ error: 'Too many attempts. Please try again later.' }); return false;
  }
  return true;
}
