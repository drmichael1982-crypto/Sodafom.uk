import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { children } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

const ALLOWED_EMOJIS = new Set([
  '🦁','🐯','🐻','🦊','🐼','🐨','🐸','🐙','🦋','🐬',
  '🦄','🐲','🦅','🦜','🐧','🦔','🐺','🦝','🐮','🐷',
  '🌟','⭐','🚀','🎮','🎨','🎵','🏆','💎','🌈','🔥',
]);

export default async function handler(req: Request, res: Response) {
  try {
    const session = (req as Request & { session?: { user?: { id: string } } }).session;
    if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorised' });

    const childIdStr = Array.isArray(req.params.childId) ? req.params.childId[0] : req.params.childId;
    const childId = parseInt(childIdStr, 10);
    if (isNaN(childId)) return res.status(400).json({ error: 'Invalid child ID' });

    const { avatarEmoji } = req.body as { avatarEmoji?: string };
    if (!avatarEmoji || !ALLOWED_EMOJIS.has(avatarEmoji)) {
      return res.status(400).json({ error: 'Invalid emoji' });
    }

    // Verify child belongs to this user
    const [child] = await db.select().from(children).where(and(eq(children.id, childId), eq(children.parentId, session.user.id))).limit(1);
    if (!child) return res.status(404).json({ error: 'Child not found' });

    await db.update(children).set({ avatarEmoji }).where(eq(children.id, childId));

    res.json({ ok: true, avatarEmoji });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update avatar', message: String(err) });
  }
}

