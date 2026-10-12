/**
 * POST /api/auth/forgot-password
 * Sends a password reset email using BetterAuth's built-in flow.
 * Body: { email: string }
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const { email } = req.body ?? {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email required' });
    }

    const auth = getAuth();

    // BetterAuth's requestPasswordReset sends a reset link to the email
    await auth.api.requestPasswordReset({
      body: {
        email: email.trim().toLowerCase(),
        redirectTo: `${req.protocol}://${req.hostname}/hub/reset-password`,
      },
    });

    // Always return success to prevent email enumeration
    res.json({ ok: true });
  } catch (err) {
    console.error('[forgot-password]', err);
    // Still return ok to prevent email enumeration
    res.json({ ok: true });
  }
}
