/**
 * POST /api/reports/weekly-email
 * Sends a weekly progress summary email to the authenticated parent.
 * Includes each child's stars earned this week, games played, and top subject.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';
import { sendEmail } from '@/server/email';

export default async function handler(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorised' });

  try {
    // Fetch all children for this user
    const children = await db.execute(
      sql`SELECT id, name, total_stars, avatar_emoji FROM children WHERE user_id = ${userId}`
    );
    const childRows = (children as unknown as { rows: { id: number; name: string; total_stars: number; avatar_emoji: string }[] }).rows ?? [];

    if (childRows.length === 0) {
      return res.status(200).json({ sent: false, reason: 'No children found' });
    }

    // For each child, get this week's stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    const childStats = await Promise.all(
      childRows.map(async (child) => {
        const stats = await db.execute(sql`
          SELECT
            COUNT(*) as games_played,
            COALESCE(SUM(stars_earned), 0) as stars_this_week,
            subject as top_subject
          FROM game_plays
          WHERE child_id = ${child.id}
            AND played_at >= ${weekStart.toISOString()}
          GROUP BY subject
          ORDER BY COUNT(*) DESC
          LIMIT 1
        `);
        const row = ((stats as unknown as { rows: { games_played: number; stars_this_week: number; top_subject: string }[] }).rows ?? [])[0];
        return {
          name: child.name,
          avatarEmoji: child.avatar_emoji,
          totalStars: child.total_stars,
          gamesThisWeek: Number(row?.games_played ?? 0),
          starsThisWeek: Number(row?.stars_this_week ?? 0),
          topSubject: row?.top_subject ?? null,
        };
      })
    );

    // Fetch parent email
    const userRow = await db.execute(sql`SELECT email, name FROM "user" WHERE id = ${userId}`);
    const parent = ((userRow as unknown as { rows: { email: string; name: string }[] }).rows ?? [])[0];
    if (!parent?.email) return res.status(400).json({ error: 'No email found' });

    const totalStarsThisWeek = childStats.reduce((sum, c) => sum + c.starsThisWeek, 0);
    const totalGamesThisWeek = childStats.reduce((sum, c) => sum + c.gamesThisWeek, 0);

    const childRows2 = childStats.map(c => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
          <strong>${c.avatarEmoji} ${c.name}</strong>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;">
          ${c.gamesThisWeek}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;">
          ⭐ ${c.starsThisWeek}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;text-transform:capitalize;">
          ${c.topSubject ?? '—'}
        </td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Nunito',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#2D6A4F;border-radius:20px 20px 0 0;padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">📊</div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Weekly Learning Report</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">
        Week of ${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>

    <!-- Summary bar -->
    <div style="background:#fff;padding:24px;display:flex;gap:16px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <div style="flex:1;text-align:center;padding:16px;background:#f0fdf4;border-radius:12px;">
        <div style="font-size:28px;font-weight:900;color:#2D6A4F;">${totalGamesThisWeek}</div>
        <div style="font-size:12px;color:#6b7280;">Games played</div>
      </div>
      <div style="flex:1;text-align:center;padding:16px;background:#fffbeb;border-radius:12px;">
        <div style="font-size:28px;font-weight:900;color:#d97706;">⭐ ${totalStarsThisWeek}</div>
        <div style="font-size:12px;color:#6b7280;">Stars earned</div>
      </div>
      <div style="flex:1;text-align:center;padding:16px;background:#fef2f2;border-radius:12px;">
        <div style="font-size:28px;font-weight:900;color:#CC0000;">${childStats.length}</div>
        <div style="font-size:12px;color:#6b7280;">Learner${childStats.length !== 1 ? 's' : ''}</div>
      </div>
    </div>

    <!-- Per-child table -->
    <div style="background:#fff;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;padding:0 24px 24px;">
      <h2 style="font-size:16px;font-weight:900;color:#111;margin:0 0 16px;">This week's breakdown</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 16px;text-align:left;font-weight:700;color:#6b7280;font-size:12px;text-transform:uppercase;">Child</th>
            <th style="padding:10px 16px;text-align:center;font-weight:700;color:#6b7280;font-size:12px;text-transform:uppercase;">Games</th>
            <th style="padding:10px 16px;text-align:center;font-weight:700;color:#6b7280;font-size:12px;text-transform:uppercase;">Stars</th>
            <th style="padding:10px 16px;text-align:center;font-weight:700;color:#6b7280;font-size:12px;text-transform:uppercase;">Top subject</th>
          </tr>
        </thead>
        <tbody>${childRows2}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="background:#2D6A4F;border-radius:0 0 20px 20px;padding:24px;text-align:center;">
      <p style="color:rgba(255,255,255,0.9);margin:0 0 16px;font-size:14px;">
        Keep the momentum going — log in to see full progress charts.
      </p>
      <a href="https://sodafom.uk/parent-dashboard" style="display:inline-block;background:#FFD700;color:#111;font-weight:900;padding:12px 28px;border-radius:50px;text-decoration:none;font-size:14px;">
        View full dashboard →
      </a>
    </div>

    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">
      Sodafom · sodafom.uk · <a href="https://sodafom.uk/hub/subscription" style="color:#9ca3af;">Manage notifications</a>
    </p>
  </div>
</body>
</html>`;

    await sendEmail({
      to: parent.email,
      subject: `📊 ${parent.name?.split(' ')[0] ?? 'Your'}'s weekly learning report — ${totalGamesThisWeek} games, ${totalStarsThisWeek} stars`,
      html,
    });

    return res.json({ sent: true, childCount: childStats.length, totalGamesThisWeek, totalStarsThisWeek });
  } catch (err) {
    console.error('[weekly-email]', err);
    return res.status(500).json({ error: 'Failed to send report', message: String(err) });
  }
}
