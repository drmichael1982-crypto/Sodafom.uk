import type { Request, Response } from 'express';
import { db } from '../../../db/client';
import { promoCodes } from '../../../db/schema';
import { getAuth } from '@/lib/auth/auth';
import { randomBytes } from 'crypto';

interface GeneratePromoRequest {
  prefix?: string;
  count: number;
  description: string;
  accessDurationDays: number | null; // null for permanent
  maxUses: number | null; // null for unlimited
  expiresAt?: string; // ISO string
}

function generateCode(prefix?: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return (prefix ? `${prefix.toUpperCase()}-` : '') + `${seg(4)}-${seg(4)}`;
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });

    // Security: Only admins can generate codes
    if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { prefix, count, description, accessDurationDays, maxUses, expiresAt } = req.body as GeneratePromoRequest;

    if (!count || count < 1) {
      return res.status(400).json({ error: 'Count must be at least 1' });
    }

    const codesToInsert = [];
    for (let i = 0; i < count; i++) {
      codesToInsert.push({
        code: generateCode(prefix),
        description,
        accessType: 'free',
        accessDurationDays,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      });
    }

    await db.insert(promoCodes).values(codesToInsert);

    res.json({ success: true, count: codesToInsert.length });
  } catch (err) {
    console.error('[admin-promo-generate] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
