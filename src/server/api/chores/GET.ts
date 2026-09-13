import type { Request, Response } from 'express';
import { familyDate, queryId } from '@/lib/chores';
import { getChoreParent } from './security';
import { listChores } from './store';
import { choreFailure } from './transport';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const parentId = await getChoreParent(req);
    const childId = queryId(req.query.childId);
    const cursor = req.query.before === undefined ? undefined : queryId(req.query.before);
    const now = new Date();
    const data = await listChores(parentId, childId, familyDate(now), now, cursor);
    return res.json({ ...data, success: true, commissionPence: 0 });
  } catch (error) {
    const failure = choreFailure(error);
    return res.status(failure.status).json({ error: failure.error });
  }
}
