import type { Request, Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { children, choreCompletions, chores } from '@/server/db/schema';

async function parentSession(req: Request) {
  return getAuth().api.getSession({ headers: new Headers(req.headers as any) });
}

export default async function handler(req: Request, res: Response) {
  try {
    const session = await parentSession(req);
    if (!session?.user?.id) return res.status(401).json({ error: 'Parent sign-in required' });
    const parentId = session.user.id;
    const { action } = req.body as { action?: 'create' | 'update' | 'complete' | 'approve' };

    if (action === 'create') {
      const childId = Number(req.body.childId);
      const title = String(req.body.title ?? '').trim().replace(/\s+/g, ' ');
      const valuePence = Number(req.body.valuePence ?? 0);
      if (title.length < 2 || title.length > 120) return res.status(400).json({ error: 'Chore must be 2–120 characters' });
      if (!Number.isInteger(valuePence) || valuePence < 0 || valuePence > 100_000) return res.status(400).json({ error: 'Pocket-money value is invalid' });
      const [child] = await db.select({ id: children.id }).from(children).where(and(eq(children.id, childId), eq(children.parentId, parentId))).limit(1);
      if (!child) return res.status(404).json({ error: 'Child profile not found' });
      const [created] = await db.insert(chores).values({ parentId, childId, title, valuePence, active: true }).$returningId();
      return res.status(201).json({ success: true, id: created.id, commissionPence: 0 });
    }

    if (action === 'update') {
      const choreId = Number(req.body.choreId);
      const [job] = await db.select().from(chores).where(and(eq(chores.id, choreId), eq(chores.parentId, parentId))).limit(1);
      if (!job) return res.status(404).json({ error: 'Chore not found' });
      const title = String(req.body.title ?? job.title).trim().replace(/\s+/g, ' ');
      const valuePence = Number(req.body.valuePence ?? job.valuePence);
      if (title.length < 2 || title.length > 120 || !Number.isInteger(valuePence) || valuePence < 0 || valuePence > 100_000) return res.status(400).json({ error: 'Chore details are invalid' });
      await db.update(chores).set({ title, valuePence, active: req.body.active !== false }).where(and(eq(chores.id, choreId), eq(chores.parentId, parentId)));
      return res.json({ success: true, commissionPence: 0 });
    }

    if (action === 'complete') {
      const choreId = Number(req.body.choreId);
      const [job] = await db.select().from(chores).where(and(eq(chores.id, choreId), eq(chores.parentId, parentId), eq(chores.active, true))).limit(1);
      if (!job) return res.status(404).json({ error: 'Active chore not found' });
      const [waiting] = await db.select().from(choreCompletions).where(and(eq(choreCompletions.choreId, choreId), eq(choreCompletions.status, 'waiting_for_parent'))).limit(1);
      if (waiting) return res.status(409).json({ error: 'This chore is already waiting for parent approval' });
      const [created] = await db.insert(choreCompletions).values({ choreId, parentId, childId: job.childId, status: 'waiting_for_parent' }).$returningId();
      return res.status(201).json({ success: true, id: created.id, commissionPence: 0 });
    }

    if (action === 'approve') {
      const completionId = Number(req.body.completionId);
      const [completion] = await db.select().from(choreCompletions).where(and(eq(choreCompletions.id, completionId), eq(choreCompletions.parentId, parentId))).limit(1);
      if (!completion) return res.status(404).json({ error: 'Completion not found' });
      if (completion.status !== 'waiting_for_parent') return res.status(409).json({ error: 'This completion has already been reviewed' });
      await db.update(choreCompletions).set({ status: 'approved', approvedAt: new Date() }).where(and(eq(choreCompletions.id, completionId), eq(choreCompletions.parentId, parentId)));
      return res.json({ success: true, commissionPence: 0 });
    }

    res.status(400).json({ error: 'Unknown chore action' });
  } catch (error) {
    console.error('[chores] action failed', error);
    res.status(500).json({ error: 'Could not update chores' });
  }
}
