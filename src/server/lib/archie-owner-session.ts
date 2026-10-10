import type { Request, Response } from 'express';
import { getPreviewParentSession, type PreviewParentSession } from './archie-parent-auth';

type Environment = Record<string, string | undefined>;
type ResolveParent = (request: Request) => Promise<PreviewParentSession | null>;

/** Fail-closed owner check shared by every legacy admin API. */
export async function requireArchieOwnerSession(
  req: Request,
  res: Response,
  resolveParent: ResolveParent = getPreviewParentSession,
  env: Environment = process.env,
): Promise<PreviewParentSession | null> {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const session = await resolveParent(req);
    if (!session) {
      res.status(401).json({ error: 'Sign in to the owner account.' });
      return null;
    }
    const ownerId = env.ARCHIE_OWNER_USER_ID?.trim();
    if (!ownerId || session.user.isAdmin !== true || session.user.id !== ownerId) {
      res.status(403).json({ error: 'Only the server-authorized owner can use this admin service.' });
      return null;
    }
    return session;
  } catch {
    res.status(503).json({ error: 'Owner account verification is unavailable.' });
    return null;
  }
}
