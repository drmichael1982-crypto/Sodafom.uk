import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { activitySessions, progressSummaries, children, starMilestones, promoCodes } from '../../../../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

// ── Milestone thresholds that generate a promo code ──────────────────────────
const STAR_MILESTONES = [1000, 2000, 3000, 5000];

function generateMilestoneCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'STAR-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function checkAndAwardMilestones(childId: number, newTotal: number): Promise<string | null> {
  // Find the highest milestone this child has now crossed
  const crossed = STAR_MILESTONES.filter((m) => newTotal >= m);
  if (crossed.length === 0) return null;

  // Check which milestones already claimed
  const claimed = await db
    .select({ milestone: starMilestones.milestone })
    .from(starMilestones)
    .where(eq(starMilestones.childId, childId));
  const claimedSet = new Set(claimed.map((r: any) => r.milestone));

  let newCode: string | null = null;
  for (const milestone of crossed) {
    if (claimedSet.has(milestone)) continue;
    // Generate a unique promo code
    const code = generateMilestoneCode();
    // Insert into promo_codes (1 month free, single use)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6); // code valid for 6 months
    await db.insert(promoCodes).values({
      code,
      description: `1-month free — ${milestone}-star milestone (child ${childId})`,
      accessType: 'free',
      maxUses: 1,
      usedCount: 0,
      expiresAt,
      active: true,
    });
    // Record the milestone
    await db.insert(starMilestones).values({ childId, milestone, promoCode: code });
    newCode = code; // return the most recent one
  }
  return newCode;
}

// ── Stars logic ───────────────────────────────────────────────────────────────
// 0–49%  → 0 stars
// 50–74% → 1 star
// 75–89% → 2 stars
// 90–100%→ 3 stars
export function progressPercentage(score: number, maxScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) return 0;
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

function calcStars(score: number, maxScore: number): number {
  const pct = progressPercentage(score, maxScore);
  if (pct >= 90) return 3;
  if (pct >= 75) return 2;
  if (pct >= 50) return 1;
  return 0;
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childIdParam = Array.isArray(req.params.childId) ? req.params.childId[0] : req.params.childId;
    if (!/^\d+$/.test(childIdParam ?? '')) return res.status(400).json({ error: 'Invalid child ID' });
    const childId = Number(childIdParam);
    if (!Number.isSafeInteger(childId) || childId <= 0) return res.status(400).json({ error: 'Invalid child ID' });

    const [ownedChild] = await db.select({ id: children.id })
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)))
      .limit(1);
    if (!ownedChild) return res.status(404).json({ error: 'Child not found' });

    const { subject, activityId, activityTitle, score, maxScore, durationSeconds } = req.body;
    if (!subject || !activityId || !activityTitle) return res.status(400).json({ error: 'Missing fields' });

    const safeScore    = score ?? 0;
    const safeMax      = maxScore ?? 100;
    const safeDuration = durationSeconds ?? 0;
    if (![safeScore, safeMax, safeDuration].every(value => typeof value === 'number' && Number.isFinite(value))
      || safeScore < 0 || safeMax <= 0 || safeDuration < 0) {
      return res.status(400).json({ error: 'Invalid score or duration' });
    }
    const scorePercent = progressPercentage(safeScore, safeMax);
    const starsEarned  = calcStars(safeScore, safeMax);

    // Insert activity session (with stars)
    await db.insert(activitySessions).values({
      childId,
      subject,
      activityId,
      activityTitle,
      score: safeScore,
      maxScore: safeMax,
      durationSeconds: safeDuration,
      starsEarned,
    });

    // Add stars to child's running total and check milestones
    let milestoneCode: string | null = null;
    if (starsEarned > 0) {
      await db.update(children)
        .set({ totalStars: sql`${children.totalStars} + ${starsEarned}` })
        .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)));
      // Fetch updated total for milestone check
      const [updated] = await db.select({ totalStars: children.totalStars })
        .from(children)
        .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)));
      if (updated) {
        milestoneCode = await checkAndAwardMilestones(childId, updated.totalStars);
      }
    }

    // Upsert weekly summary
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const [existing] = await db.select().from(progressSummaries)
      .where(and(
        eq(progressSummaries.childId, childId),
        eq(progressSummaries.subject, subject),
        eq(progressSummaries.weekStart, weekStart),
      ));

    if (existing) {
      const newTotal = (existing.totalSessions ?? 0) + 1;
      const newAvg   = (((Number(existing.avgScore) * (existing.totalSessions ?? 0)) + scorePercent) / newTotal).toFixed(2);
      const newMins  = (existing.totalMinutes ?? 0) + Math.round(safeDuration / 60);
      await db.update(progressSummaries)
        .set({ totalSessions: newTotal, avgScore: newAvg, totalMinutes: newMins })
        .where(eq(progressSummaries.id, existing.id));
    } else {
      await db.insert(progressSummaries).values({
        childId,
        subject,
        weekStart,
        totalSessions: 1,
        avgScore: scorePercent.toFixed(2),
        totalMinutes: Math.round(safeDuration / 60),
      });
    }

    res.status(201).json({ ok: true, starsEarned, milestoneCode });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
