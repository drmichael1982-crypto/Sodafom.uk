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
function calcStars(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  const pct = (score / maxScore) * 100;
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

    const childId = parseInt(String(req.params.childId));
    const { subject, activityId, activityTitle, score, maxScore, durationSeconds } = req.body;
    if (!subject || !activityId || !activityTitle) return res.status(400).json({ error: 'Missing fields' });

    const safeScore    = score ?? 0;
    const safeMax      = maxScore ?? 100;
    const safeDuration = durationSeconds ?? 0;
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
        .where(eq(children.id, childId));
      // Fetch updated total for milestone check
      const [updated] = await db.select({ totalStars: children.totalStars }).from(children).where(eq(children.id, childId));
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
      const newAvg   = (((Number(existing.avgScore) * (existing.totalSessions ?? 0)) + safeScore) / newTotal).toFixed(2);
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
        avgScore: String(safeScore.toFixed(2)),
        totalMinutes: Math.round(safeDuration / 60),
      });
    }

    res.status(201).json({ ok: true, starsEarned, milestoneCode });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
