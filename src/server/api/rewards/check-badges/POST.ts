/**
 * POST /api/rewards/check-badges
 * Called after a game completes. Checks for newly earned badges and sends
 * a reward email (badge + certificate) to the parent's reward_email address.
 *
 * Body: { childId: number }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { BADGE_DEFS, type BadgeStats } from '@/lib/badges';
import { sendEmail } from '@/server/email';

interface ProgressRow { subject: string; stars: number }
interface StreakRow { current_streak: number; max_streak: number }
interface ReferralRow { cnt: number }
interface ChildRow { id: number; name: string; total_stars: number; reward_email: string | null; user_id: string }
interface AwardedRow { badge_id: string }

// ── Ensure badge_awards table exists ─────────────────────────────────────────
async function ensureTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS badge_awards (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      child_id    INT NOT NULL,
      badge_id    VARCHAR(100) NOT NULL,
      awarded_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      email_sent  TINYINT(1) DEFAULT 0,
      UNIQUE KEY uq_child_badge (child_id, badge_id)
    )
  `);
  // Add reward_email column to children if not present
  await db.execute(sql`
    ALTER TABLE children ADD COLUMN reward_email VARCHAR(255) NULL
  `).catch(() => { /* column already exists */ });
}

// ── Build beautiful badge award email ────────────────────────────────────────
function buildBadgeEmail(childName: string, badge: { emoji: string; name: string; desc: string; rarity: string }, totalStars: number, siteUrl: string): { html: string; text: string } {
  const rarityColours: Record<string, { bg: string; border: string; label: string }> = {
    common:    { bg: '#f1f5f9', border: '#94a3b8', label: 'Common' },
    rare:      { bg: '#eff6ff', border: '#3b82f6', label: 'Rare' },
    epic:      { bg: '#faf5ff', border: '#a855f7', label: 'Epic' },
    legendary: { bg: '#fefce8', border: '#eab308', label: 'Legendary ✨' },
  };
  const rc = rarityColours[badge.rarity] ?? rarityColours['common'];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Nunito',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2D6A4F,#40916C);padding:32px 32px 24px;text-align:center;">
            <div style="font-size:56px;line-height:1;margin-bottom:8px;">🏆</div>
            <h1 style="color:#FFD700;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Achievement Unlocked!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:16px;font-weight:600;">${childName} just earned a new badge on Sodafom!</p>
          </td>
        </tr>

        <!-- Badge card -->
        <tr>
          <td style="padding:32px;">
            <div style="background:${rc.bg};border:3px solid ${rc.border};border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
              <div style="font-size:64px;line-height:1;margin-bottom:12px;">${badge.emoji}</div>
              <div style="display:inline-block;background:${rc.border};color:#fff;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;padding:3px 10px;border-radius:20px;margin-bottom:10px;">${rc.label}</div>
              <h2 style="margin:8px 0 6px;font-size:24px;font-weight:900;color:#1a1a1a;">${badge.name}</h2>
              <p style="margin:0;color:#555;font-size:15px;line-height:1.5;">${badge.desc}</p>
            </div>

            <!-- Star total -->
            <div style="background:#fefce8;border:2px solid #FFD700;border-radius:12px;padding:16px 20px;text-align:center;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;color:#92400e;font-weight:700;">⭐ Total stars earned</p>
              <p style="margin:4px 0 0;font-size:36px;font-weight:900;color:#b45309;">${totalStars.toLocaleString()}</p>
            </div>

            <!-- Certificate CTA -->
            <div style="text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 12px;font-size:15px;color:#444;font-weight:600;">Print or download ${childName}'s certificate of achievement:</p>
              <a href="${siteUrl}/certificates" style="display:inline-block;background:#2D6A4F;color:#FFD700;font-weight:900;font-size:16px;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:0.3px;">🎓 Get Certificate</a>
            </div>

            <!-- Encouragement -->
            <div style="background:#f0fdf4;border-left:4px solid #2D6A4F;border-radius:0 8px 8px 0;padding:14px 18px;">
              <p style="margin:0;font-size:14px;color:#2D6A4F;font-weight:700;">Keep it up, ${childName}! 🌟</p>
              <p style="margin:6px 0 0;font-size:13px;color:#555;line-height:1.5;">Every game played builds knowledge and confidence. There are more badges waiting to be unlocked — keep learning and keep shining!</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#94a3b8;">This reward was automatically sent by <strong style="color:#2D6A4F;">Sodafom</strong> — fun educational games for children ages 5–13.</p>
            <p style="margin:8px 0 0;font-size:12px;color:#cbd5e1;"><a href="${siteUrl}" style="color:#2D6A4F;text-decoration:none;">sodafom.uk</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `🏆 Achievement Unlocked!\n\n${childName} just earned the "${badge.name}" badge on Sodafom!\n\n${badge.emoji} ${badge.name} (${rc.label})\n${badge.desc}\n\n⭐ Total stars: ${totalStars.toLocaleString()}\n\nPrint ${childName}'s certificate at: ${siteUrl}/certificates\n\nKeep it up, ${childName}! Every game played builds knowledge and confidence.\n\n— The Sodafom Team\n${siteUrl}`;

  return { html, text };
}

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { childId } = req.body ?? {};
    if (!childId) return res.status(400).json({ error: 'childId required' });

    await ensureTables();

    // Verify child belongs to this user and get reward_email
    const childRows = (await db.execute(sql`
      SELECT id, name, total_stars, reward_email, user_id
      FROM children WHERE id = ${childId} AND user_id = ${session.user.id} LIMIT 1
    `))[0] as unknown as ChildRow[];
    const child = childRows[0];
    if (!child) return res.status(404).json({ error: 'Child not found' });

    // Fetch progress for badge evaluation
    const progressRows = (await db.execute(sql`
      SELECT subject, stars FROM child_progress WHERE child_id = ${childId}
    `))[0] as unknown as ProgressRow[];

    const streakRows = (await db.execute(sql`
      SELECT current_streak, max_streak FROM streak_tracker WHERE child_id = ${childId} LIMIT 1
    `))[0] as unknown as StreakRow[];
    const streak = streakRows[0] ?? { current_streak: 0, max_streak: 0 };

    const refRows = (await db.execute(sql`
      SELECT COUNT(*) as cnt FROM referrals WHERE referrer_user_id = ${session.user.id} AND converted = 1
    `))[0] as unknown as ReferralRow[];

    const stats: BadgeStats = {
      gamesPlayed: progressRows.length,
      totalStars: progressRows.reduce((s, r) => s + (r.stars ?? 0), 0),
      currentStreak: Number(streak.current_streak),
      maxStreak: Number(streak.max_streak),
      mathsGames: progressRows.filter(r => r.subject?.toLowerCase() === 'maths').length,
      readingGames: progressRows.filter(r => r.subject?.toLowerCase() === 'reading').length,
      spellingGames: progressRows.filter(r => r.subject?.toLowerCase() === 'spelling').length,
      scienceGames: progressRows.filter(r => r.subject?.toLowerCase() === 'science').length,
      perfectGames: progressRows.filter(r => r.stars >= 3).length,
      referrals: Number(refRows[0]?.cnt ?? 0),
    };

    // Find which badges are now earned
    const earnedIds = BADGE_DEFS.filter(d => d.evaluate(stats)).map(d => d.id);

    // Find which are already recorded
    const awardedRows = (await db.execute(sql`
      SELECT badge_id FROM badge_awards WHERE child_id = ${childId}
    `))[0] as unknown as AwardedRow[];
    const awardedSet = new Set(awardedRows.map(r => r.badge_id));

    // New badges = earned but not yet recorded
    const newBadges = BADGE_DEFS.filter(d => earnedIds.includes(d.id) && !awardedSet.has(d.id));

    const emailsSent: string[] = [];
    const rewardEmail = child.reward_email;

    for (const badge of newBadges) {
      // Record the award
      await db.execute(sql`
        INSERT IGNORE INTO badge_awards (child_id, badge_id, email_sent)
        VALUES (${childId}, ${badge.id}, 0)
      `);

      // Send email if reward_email is set
      if (rewardEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rewardEmail)) {
        try {
          const { html, text } = buildBadgeEmail(
            child.name,
            badge,
            child.total_stars,
            'https://sodafom.uk',
          );
          await sendEmail({
            fromName: 'Sodafom Rewards',
            to: rewardEmail,
            subject: `🏆 ${child.name} earned the "${badge.name}" badge on Sodafom!`,
            html,
            text,
          });
          await db.execute(sql`
            UPDATE badge_awards SET email_sent = 1 WHERE child_id = ${childId} AND badge_id = ${badge.id}
          `);
          emailsSent.push(badge.id);
        } catch (emailErr) {
          console.error('[check-badges] email send failed:', emailErr);
        }
      }
    }

    res.json({
      ok: true,
      newBadges: newBadges.map(b => ({ id: b.id, emoji: b.emoji, name: b.name, rarity: b.rarity })),
      emailsSent,
    });
  } catch (err) {
    console.error('[check-badges] error:', err);
    res.status(500).json({ error: String(err) });
  }
}
