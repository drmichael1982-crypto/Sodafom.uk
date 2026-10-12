/**
 * GET /api/notifications
 * Returns in-app notifications for the authenticated user.
 * Pulls from: badge_awards, star_milestones, daily_challenge claims, and system messages.
 */
import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { getAuth } from '@/lib/auth/auth';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const userId = session.user.id;

    const childrenResult = await db.execute(
      sql`SELECT id, name FROM children WHERE parent_id = ${userId} ORDER BY id`
    );
    const childRows = (childrenResult as any)[0] as { id: number; name: string }[];
    const childIds = childRows.map(c => c.id);

    if (childIds.length === 0) {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const notifications: {
      id: string;
      type: string;
      title: string;
      message: string;
      emoji: string;
      createdAt: string;
      read: boolean;
      childName?: string;
      link?: string;
    }[] = [];

    // Badge awards
    for (const child of childRows) {
      const badgesResult = await db.execute(
        sql`SELECT badge_id, awarded_at FROM badge_awards WHERE child_id = ${child.id} ORDER BY awarded_at DESC LIMIT 10`
      );
      for (const row of (badgesResult as any)[0] as { badge_id: string; awarded_at: string }[]) {
        const badgeName = row.badge_id
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
        notifications.push({
          id: `badge-${child.id}-${row.badge_id}`,
          type: 'badge',
          title: 'Badge Unlocked!',
          message: `${child.name} earned the "${badgeName}" badge.`,
          emoji: '🏅',
          createdAt: row.awarded_at,
          read: false,
          childName: child.name,
          link: '/badges',
        });
      }

      // Star milestones
      const milestonesResult = await db.execute(
        sql`SELECT milestone, created_at FROM star_milestones WHERE child_id = ${child.id} ORDER BY created_at DESC LIMIT 5`
      ).catch(() => [[], null]);
      for (const row of (milestonesResult as any)[0] as { milestone: number; created_at: string }[]) {
        notifications.push({
          id: `milestone-${child.id}-${row.milestone}`,
          type: 'milestone',
          title: 'Star Milestone Reached!',
          message: `${child.name} has earned ${row.milestone.toLocaleString()} stars! A promo code has been added to their profile.`,
          emoji: '⭐',
          createdAt: row.created_at,
          read: false,
          childName: child.name,
          link: '/hub/profile',
        });
      }

      // Daily challenge claims (last 7 days)
      const claimsResult = await db.execute(
        sql`SELECT claimed_at FROM daily_challenge_claims WHERE child_id = ${child.id} AND claimed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY claimed_at DESC`
      ).catch(() => [[], null]);
      for (const row of (claimsResult as any)[0] as { claimed_at: string }[]) {
        notifications.push({
          id: `daily-${child.id}-${row.claimed_at}`,
          type: 'daily',
          title: 'Daily Challenge Complete!',
          message: `${child.name} completed today's Daily Challenge and earned 5 bonus stars.`,
          emoji: '⚡',
          createdAt: row.claimed_at,
          read: false,
          childName: child.name,
          link: '/daily-challenge',
        });
      }
    }

    // Sort by date descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Mark as read based on query param
    const markRead = req.query.markRead === 'true';
    const unreadCount = notifications.length;

    res.json({
      notifications: notifications.slice(0, 50),
      unreadCount: markRead ? 0 : unreadCount,
    });
  } catch (err) {
    console.error('GET /api/notifications error:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
}
