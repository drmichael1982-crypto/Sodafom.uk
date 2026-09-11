import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { isValidAdminCode } from '@/server/lib/admin-access';

export default async function handler(req: Request, res: Response) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
  if ((session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) {
    res.json({ success: true });
    return;
  }

  const { code } = req.body as { code?: string };

  if (!code) {
    res.status(400).json({ success: false, error: 'Code is required' });
    return;
  }

  if (isValidAdminCode(code)) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid access code' });
  }
}
