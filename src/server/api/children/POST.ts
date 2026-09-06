import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { children } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { name, ageGroup, avatarEmoji } = req.body;
    if (!name || !ageGroup) return res.status(400).json({ error: 'name and ageGroup required' });

    const result = await db.insert(children).values({
      parentId: session.user.id,
      name,
      ageGroup,
      avatarEmoji: avatarEmoji ?? '⭐',
    });
    const id = Number(result[0].insertId);
    const [child] = await db.select().from(children).where(eq(children.id, id));
    res.status(201).json(child);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
