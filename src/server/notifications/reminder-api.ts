import { getAuth } from '@/lib/auth/auth';
import { db } from '../db/client';
import { sql } from 'drizzle-orm';
import { createReminderHandlers, ReminderHttpError, type ReminderRequest } from './reminder-handlers';
import { readReminderPreferences, saveReminderPreferences, reserveReminderPasswordAttempt, claimReminder } from './reminder-store';

function authHeaders(req: ReminderRequest): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  return headers;
}
export async function reminderParentId(req: ReminderRequest): Promise<string> {
  const session = await getAuth().api.getSession({ headers: authHeaders(req) });
  if (!session?.user?.id) throw new ReminderHttpError(401, 'Sign in to the parent account to manage reminders.');
  const role = (session.user as { role?: string }).role;
  if (role === 'child' || role === 'student' || role === 'pupil') throw new ReminderHttpError(403, 'A parent account is required.');
  const result = await db.execute(sql`SELECT id FROM children WHERE parent_id = ${session.user.id} LIMIT 1`);
  if (!Array.isArray(result) || !Array.isArray(result[0])) throw new Error('Parent lookup unavailable');
  if (!result[0].length) throw new ReminderHttpError(403, 'Create a child profile in your parent account before setting reminders.');
  return session.user.id;
}
export const reminderHandlers = createReminderHandlers({
  parentId: reminderParentId,
  read: readReminderPreferences,
  save: saveReminderPreferences,
  reservePasswordAttempt: reserveReminderPasswordAttempt,
  verifyPassword: async (req, password) => {
    try {
      const result = await getAuth().api.verifyPassword({ body: { password }, headers: authHeaders(req) });
      return result?.status === true;
    } catch { return false; }
  },
  claim: claimReminder,
  now: () => new Date(),
});
