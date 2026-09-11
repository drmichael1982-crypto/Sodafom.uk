/**
 * GET /api/admin/stats
 *
 * Returns full owner stats: signups, subscribers, revenue, plan breakdown,
 * site traffic, and reviews.
 * Protected by a server-side code check — no auth session required.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { user, subscriptions, promoActivations, siteReviews } from '@/server/db/schema';
import { sql, count, desc } from 'drizzle-orm';
import { hasAdminAccess } from '@/server/admin-auth';

// Price → plan label + monthly GBP value (for revenue estimate)
const PRICE_MAP: Record<string, { label: string; monthlyGBP: number }> = {
  'price_1U5bazK4qwt1chs3b6cnitbe': { label: 'Monthly £1',   monthlyGBP: 1.00 },
  'price_1U5bb5K4qwt1chs3WvIrzKfS': { label: 'Annual £10',   monthlyGBP: 10 / 12 },
  'price_1U67njK4qwt1chs37hn3EUeh': { label: 'School £100',  monthlyGBP: 100 / 12 },
};

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!(await hasAdminAccess(req))) {
    res.status(401).json({ success: false, error: 'Invalid code' });
    return;
  }

  try {
    // ── Signups ──────────────────────────────────────────────────────────────
    const [{ total: totalSignups }] = await db.select({ total: count() }).from(user);

    const [{ total: signupsToday }] = await db
      .select({ total: count() })
      .from(user)
      .where(sql`DATE(${user.createdAt}) = CURDATE()`);

    const [{ total: signupsThisWeek }] = await db
      .select({ total: count() })
      .from(user)
      .where(sql`${user.createdAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);

    // ── Subscribers ──────────────────────────────────────────────────────────
    const [{ total: totalSubscribers }] = await db
      .select({ total: count() })
      .from(subscriptions)
      .where(sql`${subscriptions.status} IN ('active', 'trialing')`);

    const [{ total: newSubscribersThisWeek }] = await db
      .select({ total: count() })
      .from(subscriptions)
      .where(sql`${subscriptions.createdAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);

    const [{ total: freeUsers }] = await db.select({ total: count() }).from(promoActivations);

    // ── Plan breakdown ───────────────────────────────────────────────────────
    const planRows = await db
      .select({ plan: subscriptions.plan, stripePriceId: subscriptions.stripePriceId, total: count() })
      .from(subscriptions)
      .where(sql`${subscriptions.status} IN ('active', 'trialing')`)
      .groupBy(subscriptions.plan, subscriptions.stripePriceId);

    const planBreakdown: { label: string; count: number; monthlyRevenue: number }[] = planRows.map((r: any) => {
      const priceInfo = PRICE_MAP[r.stripePriceId ?? ''];
      return {
        label: priceInfo?.label ?? r.plan,
        count: Number(r.total),
        monthlyRevenue: (priceInfo?.monthlyGBP ?? 0) * Number(r.total),
      };
    });

    // ── Revenue estimate ─────────────────────────────────────────────────────
    const estimatedMonthlyRevenue = planBreakdown.reduce((sum, p) => sum + p.monthlyRevenue, 0);
    const estimatedAnnualRevenue = estimatedMonthlyRevenue * 12;

    // ── Traffic ──────────────────────────────────────────────────────────────
    let trafficToday = 0;
    let trafficThisWeek = 0;
    let trafficThisMonth = 0;
    let topPages: { path: string; hits: number }[] = [];

    try {
      const todayRows = await db.execute(
        sql`SELECT COALESCE(SUM(hits),0) as total FROM page_views WHERE view_date = CURDATE()`
      ) as unknown as [Array<{ total: number }>];
      trafficToday = Number((todayRows[0] as Array<{ total: number }>)?.[0]?.total ?? 0);

      const weekRows = await db.execute(
        sql`SELECT COALESCE(SUM(hits),0) as total FROM page_views WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
      ) as unknown as [Array<{ total: number }>];
      trafficThisWeek = Number((weekRows[0] as Array<{ total: number }>)?.[0]?.total ?? 0);

      const monthRows = await db.execute(
        sql`SELECT COALESCE(SUM(hits),0) as total FROM page_views WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
      ) as unknown as [Array<{ total: number }>];
      trafficThisMonth = Number((monthRows[0] as Array<{ total: number }>)?.[0]?.total ?? 0);

      const topRows = await db.execute(
        sql`SELECT path, SUM(hits) as hits FROM page_views WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY path ORDER BY hits DESC LIMIT 10`
      ) as unknown as [Array<{ path: string; hits: number }>];
      topPages = ((topRows[0] as Array<{ path: string; hits: number }>) ?? []).map((r) => ({
        path: r.path,
        hits: Number(r.hits),
      }));
    } catch {
      // page_views table may not exist yet — traffic will show 0
    }

    // ── Reviews ──────────────────────────────────────────────────────────────
    const reviews = await db
      .select({
        id: siteReviews.id,
        authorName: siteReviews.authorName,
        authorRole: siteReviews.authorRole,
        stars: siteReviews.stars,
        body: siteReviews.body,
        approved: siteReviews.approved,
        createdAt: siteReviews.createdAt,
      })
      .from(siteReviews)
      .orderBy(desc(siteReviews.createdAt))
      .limit(50);

    const [{ total: totalReviews }] = await db.select({ total: count() }).from(siteReviews);
    const [{ total: approvedReviews }] = await db
      .select({ total: count() })
      .from(siteReviews)
      .where(sql`${siteReviews.approved} = 1`);

    res.json({
      success: true,
      stats: {
        // Signups
        totalSignups: Number(totalSignups),
        signupsToday: Number(signupsToday),
        signupsThisWeek: Number(signupsThisWeek),
        // Subscribers
        totalSubscribers: Number(totalSubscribers),
        newSubscribersThisWeek: Number(newSubscribersThisWeek),
        freeUsers: Number(freeUsers),
        // Revenue
        estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue * 100) / 100,
        estimatedAnnualRevenue: Math.round(estimatedAnnualRevenue * 100) / 100,
        planBreakdown,
        // Traffic
        trafficToday,
        trafficThisWeek,
        trafficThisMonth,
        topPages,
        // Reviews
        totalReviews: Number(totalReviews),
        approvedReviews: Number(approvedReviews),
        generatedAt: new Date().toISOString(),
      },
      reviews,
    });
  } catch (err) {
    console.error('[admin-stats] DB error:', err);
    res.status(500).json({ success: false, error: 'Could not load stats' });
  }
}
