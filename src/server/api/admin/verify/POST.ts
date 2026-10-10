import type { Request, Response } from 'express';
import { requireArchieOwnerSession } from '@/server/lib/archie-owner-session';

export default async function handler(req: Request, res: Response) {
  if (!await requireArchieOwnerSession(req, res)) return;
  res.json({ success: true });
}
