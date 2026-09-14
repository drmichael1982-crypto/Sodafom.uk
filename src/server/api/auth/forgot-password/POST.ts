/**
 * POST /api/auth/forgot-password
 * Sends a password reset email using BetterAuth's built-in flow.
 * Body: { email: string }
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';

function resetAppOrigin(req: Request): string {
  const origin = req.get('origin');
  if (origin) {
    try {
      const parsed = new URL(origin);
      const host = parsed.hostname.toLowerCase();
      if (parsed.protocol === 'https:' && (host === 'sodafom.uk' || host.endsWith('.sodafom.uk'))) {
        return parsed.origin;
      }
      if (process.env.NODE_ENV !== 'production' && (host === 'localhost' || host === '127.0.0.1')) {
        return parsed.origin;
      }
    } catch {
      // Fall back to the canonical Sodafom origin.
    }
  }
  return process.env.NODE_ENV === 'production' ? 'https://sodafom.uk' : 'http://localhost:5173';
}

export default async function handler(req: Request, res: Response) {
  const { email } = req.body ?? {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || normalizedEmail.length > 254) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }

  try {
    await getAuth().api.requestPasswordReset({
      body: {
        email: normalizedEmail,
        redirectTo: resetAppOrigin(req) + '/hub/reset-password',
      },
    });
  } catch {
    // The response remains deliberately generic to prevent account enumeration.
    console.error('[forgot-password] request could not be completed');
  }

  return res.json({ ok: true });
}
