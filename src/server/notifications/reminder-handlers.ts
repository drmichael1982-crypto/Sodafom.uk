import { parseReminderPreferences, type ReminderPreferences, type ReminderDelivery } from '../../lib/reminder-policy';

/** Dependency injection keeps security/error paths testable without a live account or DB. */
export interface ReminderRequest { headers: Record<string, unknown>; body?: unknown }
export interface ReminderResponse {
  status(code: number): ReminderResponse;
  json(body: unknown): unknown;
  setHeader(name: string, value: string): unknown;
}
export class ReminderHttpError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
export interface ReminderDependencies {
  parentId(req: ReminderRequest): Promise<string>;
  read(id: string): Promise<ReminderPreferences>;
  save(id: string, preferences: ReminderPreferences): Promise<void>;
  reservePasswordAttempt(id: string, now: number): Promise<boolean>;
  verifyPassword(req: ReminderRequest, password: string): Promise<boolean>;
  claim(id: string, now: Date): Promise<ReminderDelivery | null>;
  now(): Date;
}
export function requireReminderWrite(req: ReminderRequest): void {
  // A simple cross-site form cannot set this header; CORS controls non-simple requests.
  if (req.headers['x-sodafom-reminders'] !== '1' ||
      !String(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) {
    throw new ReminderHttpError(403, 'Please use the reminder settings in Sodafom.');
  }
}
export function createReminderHandlers(deps: ReminderDependencies) {
  const wrap = (fn: (req: ReminderRequest, res: ReminderResponse) => Promise<unknown>) =>
    async (req: ReminderRequest, res: ReminderResponse) => {
      res.setHeader('Cache-Control', 'no-store');
      try { return await fn(req, res); }
      catch (error) {
        if (error instanceof ReminderHttpError) return res.status(error.status).json({ error: error.message });
        // Never log request bodies, credentials, child data, or push endpoints.
        return res.status(503).json({ error: 'Reminders are temporarily unavailable. Nothing has been sent; please try again later.' });
      }
    };
  return {
    read: wrap(async (req, res) => {
      const id = await deps.parentId(req);
      return res.json({ preferences: await deps.read(id) });
    }),
    save: wrap(async (req, res) => {
      requireReminderWrite(req);
      const id = await deps.parentId(req);
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body) ||
          Object.keys(body).some(key => !['preferences', 'password'].includes(key))) {
        throw new ReminderHttpError(400, 'Check your reminder settings.');
      }
      const input = body as { preferences?: unknown; password?: unknown };
      if (typeof input.password !== 'string' || input.password.length === 0 || input.password.length > 1024) {
        throw new ReminderHttpError(400, 'Enter the parent account password to save changes.');
      }
      let preferences: ReminderPreferences;
      try { preferences = parseReminderPreferences(input.preferences); }
      catch (error) { throw new ReminderHttpError(400, error instanceof Error ? error.message : 'Check your reminder settings.'); }
      if (!await deps.reservePasswordAttempt(id, deps.now().getTime())) {
        throw new ReminderHttpError(429, 'Please wait ten minutes before trying your parent password again.');
      }
      if (!await deps.verifyPassword(req, input.password)) {
        throw new ReminderHttpError(403, 'The parent password could not be confirmed. No settings were changed.');
      }
      await deps.save(id, preferences);
      return res.json({ preferences });
    }),
    due: wrap(async (req, res) => {
      requireReminderWrite(req);
      const id = await deps.parentId(req);
      return res.json({ notification: await deps.claim(id, deps.now()) });
    }),
  };
}
