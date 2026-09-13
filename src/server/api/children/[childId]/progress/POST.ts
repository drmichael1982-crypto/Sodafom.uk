import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { activitySessions, progressSummaries, children, starMilestones, promoCodes } from '../../../../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { childIdFromParam, progressFromBody, starsForScore } from '../../../../lib/progress-input.js';

// Existing milestone rules and rewards are unchanged.
const STAR_MILESTONES = [1000, 2000, 3000, 5000];

function generateMilestoneCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'STAR-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function checkAndAwardMilestones(tx: typeof db, childId: number, newTotal: number): Promise<string | null> {
  const crossed = STAR_MILESTONES.filter(m => newTotal >= m);
  if (crossed.length === 0) return null;
  const claimed = await tx.select({ milestone: starMilestones.milestone }).from(starMilestones)
    .where(eq(starMilestones.childId, childId));
  const claimedSet = new Set(claimed.map((row: { milestone: number }) => row.milestone));
  let newCode: string | null = null;
  for (const milestone of crossed) {
    if (claimedSet.has(milestone)) continue;
    const code = generateMilestoneCode();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);
    await tx.insert(promoCodes).values({
      code,
      description: `1-month free — ${milestone}-star milestone (child ${childId})`,
      accessType: 'free', maxUses: 1, usedCount: 0, expiresAt, active: true,
    });
    await tx.insert(starMilestones).values({ childId, milestone, promoCode: code });
    newCode = code;
  }
  return newCode;
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const session = await getAuth().api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });
    const childId = childIdFromParam(req.params.childId);
    const input = progressFromBody(req.body);
    if (childId === null || !input) return res.status(400).json({ error: 'Invalid activity result' });
    const { subject, activityId, activityTitle, score, maxScore, durationSeconds } = input;
    const starsEarned = starsForScore(score, maxScore);

    const result = await db.transaction(async (tx: typeof db) => {
      // Ownership and serialization use the same locked row. All result, star,
      // milestone and summary writes below share this database transaction.
      const [child] = await tx.select({ id: children.id }).from(children)
        .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)))
        .for('update');
      if (!child) return null;
      await tx.insert(activitySessions).values({
        childId, subject, activityId, activityTitle, score, maxScore, durationSeconds, starsEarned,
      });

      let milestoneCode: string | null = null;
      if (starsEarned > 0) {
        await tx.update(children).set({ totalStars: sql`${children.totalStars} + ${starsEarned}` })
          .where(eq(children.id, childId));
        const [updated] = await tx.select({ totalStars: children.totalStars }).from(children)
          .where(eq(children.id, childId));
        if (updated) milestoneCode = await checkAndAwardMilestones(tx, childId, updated.totalStars);
      }

      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const [existing] = await tx.select().from(progressSummaries).where(and(
        eq(progressSummaries.childId, childId), eq(progressSummaries.subject, subject),
        eq(progressSummaries.weekStart, weekStart),
      ));
      if (existing) {
        const totalSessions = (existing.totalSessions ?? 0) + 1;
        const avgScore = ((Number(existing.avgScore) * (existing.totalSessions ?? 0) + score) / totalSessions).toFixed(2);
        const totalMinutes = (existing.totalMinutes ?? 0) + Math.round(durationSeconds / 60);
        await tx.update(progressSummaries).set({ totalSessions, avgScore, totalMinutes })
          .where(eq(progressSummaries.id, existing.id));
      } else {
        await tx.insert(progressSummaries).values({
          childId, subject, weekStart, totalSessions: 1, avgScore: score.toFixed(2),
          totalMinutes: Math.round(durationSeconds / 60),
        });
      }
      return { ok: true, starsEarned, milestoneCode };
    });
    if (!result) return res.status(404).json({ error: 'Child not found' });
    // A success response is sent only after the transaction has committed.
    return res.status(201).json(result);
  } catch {
    return res.status(503).json({ error: 'Progress could not be confirmed saved' });
  }
}
