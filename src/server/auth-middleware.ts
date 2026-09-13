/** BetterAuth catch-all adapter; never log authentication bodies or tokens. */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { toWebRequest, sendWebResponse } from '@/lib/auth/express-adapter';
import { tryClearStaleSession } from '@/lib/auth/session-cookies';

export async function authHandler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store');
  // Preserve the existing HttpOnly stale-session recovery mechanism.
  if (tryClearStaleSession(req, res, { preview: process.env.AIRO_PREVIEW === 'true' })) return;
  try {
    const webResponse = await getAuth().handler(toWebRequest(req));
    if (!webResponse.ok) {
      // The body can contain email addresses, submitted values or reset tokens.
      console.error('[auth] request rejected', { status: webResponse.status });
    }
    await sendWebResponse(webResponse, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    let reason = 'request_failed';
    let status = 500;
    if (message.includes('BETTER_AUTH_SECRET')) {
      reason = 'missing_secret'; status = 503;
    } else if (message.includes('Database not configured') || message.includes('SQLITE') || message.includes('ECONNREFUSED')) {
      reason = 'database_unavailable'; status = 503;
    } else if (message.includes("doesn't exist") || message.includes('no such table') || message.includes('relation') || message.includes('ER_NO_SUCH_TABLE')) {
      reason = 'missing_tables'; status = 503;
    }
    console.error('[auth] request failed', { reason });
    if (res.headersSent) { res.end(); return; }
    res.status(status).json({ error: status === 503 ? 'Sign-in is temporarily unavailable. Please try again later.' : 'Authentication request failed' });
  }
}
