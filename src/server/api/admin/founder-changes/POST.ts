import type { Request, Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { founderChangeRequests } from '@/server/db/schema';
import { hasAdminAccess } from '@/server/admin-auth';
import { planFounderInstruction } from '@/lib/founder-change-planner';

export default async function handler(req: Request, res: Response) {
  if (!(await hasAdminAccess(req))) return res.status(401).json({ error: 'Authorisation required' });

  try {
    const { instruction, action, id } = req.body as { instruction?: string; action?: 'approve' | 'reject'; id?: number };
    if (action) {
      if (!Number.isInteger(id) || Number(id) < 1) return res.status(400).json({ error: 'Valid change ID required' });
      const status = action === 'approve' ? 'approved_for_development' : 'rejected';
      const where = action === 'approve'
        ? and(eq(founderChangeRequests.id, Number(id)), eq(founderChangeRequests.status, 'prepared'))
        : eq(founderChangeRequests.id, Number(id));
      await db.update(founderChangeRequests).set({
        status,
        approvedAt: action === 'approve' ? new Date() : null,
      }).where(where);
      const [change] = await db.select().from(founderChangeRequests).where(eq(founderChangeRequests.id, Number(id))).limit(1);
      if (!change) return res.status(404).json({ error: 'Change request not found' });
      if (action === 'approve' && change.status !== status) return res.status(409).json({ error: 'Blocked or completed requests cannot be approved' });
      return res.json({ success: true, change });
    }

    const cleaned = instruction?.trim().replace(/\s+/g, ' ');
    if (!cleaned || cleaned.length < 5 || cleaned.length > 500) {
      return res.status(400).json({ error: 'Instruction must be between 5 and 500 characters' });
    }
    const prepared = planFounderInstruction(cleaned);
    const [inserted] = await db.insert(founderChangeRequests).values({
      instruction: cleaned,
      category: prepared.category,
      riskLevel: prepared.riskLevel,
      plan: prepared.plan,
      testSummary: prepared.testSummary,
      status: prepared.status,
    }).$returningId();
    const [change] = await db.select().from(founderChangeRequests).where(eq(founderChangeRequests.id, inserted.id)).limit(1);
    res.status(201).json({ success: true, change });
  } catch (error) {
    console.error('[founder-changes] update failed', error);
    res.status(500).json({ error: 'Could not process the founder change request' });
  }
}
