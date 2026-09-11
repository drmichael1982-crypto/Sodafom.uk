import type { Request, Response } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { children, choreCompletions, chores } from '@/server/db/schema';

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: new Headers(req.headers as any) });
    if (!session?.user?.id) return res.status(401).json({ error: 'Parent sign-in required' });
    const childId = Number(req.query.childId);
    if (!Number.isInteger(childId) || childId < 1) return res.status(400).json({ error: 'Valid child required' });
    const [child] = await db.select().from(children).where(and(eq(children.id, childId), eq(children.parentId, session.user.id))).limit(1);
    if (!child) return res.status(404).json({ error: 'Child profile not found' });

    const [jobs, completions] = await Promise.all([
      db.select().from(chores).where(and(eq(chores.parentId, session.user.id), eq(chores.childId, childId))).orderBy(desc(chores.createdAt)),
      db.select().from(choreCompletions).where(and(eq(choreCompletions.parentId, session.user.id), eq(choreCompletions.childId, childId))).orderBy(desc(choreCompletions.completedAt)).limit(100),
    ]);
    res.json({ success: true, child, chores: jobs, completions, commissionPence: 0 });
  } catch (error) {
    console.error('[chores] list failed', error);
    res.status(500).json({ error: 'Could not load chores' });
  }
}
