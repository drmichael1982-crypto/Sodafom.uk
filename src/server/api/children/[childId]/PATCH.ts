import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { children } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

const ALLOWED_EMOJIS = new Set([
  '🦁','🐯','🐻','🦊','🐼','🐨','🐸','🐙','🦋','🐬',
  '🦄','🐲','🦅','🦜','🐧','🦔','🐺','🦝','🐮','🐷',
  '🌟','⭐','🚀','🎮','🎨','🎵','🏆','💎','🌈','🔥',
]);

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });
    if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorised' });

    const childIdStr = Array.isArray(req.params.childId) ? req.params.childId[0] : req.params.childId;
    const childId = Number.parseInt(childIdStr, 10);
    if (!Number.isSafeInteger(childId) || childId < 1) {
      return res.status(400).json({ error: 'Invalid child ID' });
    }

    const { avatarEmoji } = req.body as { avatarEmoji?: string };
    if (!avatarEmoji || !ALLOWED_EMOJIS.has(avatarEmoji)) {
      return res.status(400).json({ error: 'Invalid avatar' });
    }

    const [child] = await db.select().from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)))
      .limit(1);
    if (!child) return res.status(404).json({ error: 'Child not found' });

    await db.update(children).set({ avatarEmoji }).where(eq(children.id, childId));
    return res.json({ ok: true, avatarEmoji });
  } catch {
    return res.status(500).json({ error: 'Could not update the child profile' });
  }
}
