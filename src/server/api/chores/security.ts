import type { Request } from 'express';
import { and, eq } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { account, user } from '@/server/db/schema';
import { ChoreError } from '@/lib/chores';
import { confirmParentPassword, type ParentCheckStore } from './parent-check';
import * as schema from './schema';
import { assertChoreRequest } from './transport';
const database = db as MySql2Database<typeof schema>;

export async function getChoreParent(req: Request): Promise<string> {
  assertChoreRequest(req);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
  const session = await getAuth().api.getSession({ headers });
  if (!session?.user?.id) throw new ChoreError(401, 'A parent needs to sign in first.');
  const [owner] = await database.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1);
  if (owner?.role !== 'parent') throw new ChoreError(403, 'Chores are managed by the child’s parent account.');
  return session.user.id;
}
const checks: ParentCheckStore = {
  withLock: (parentId, operation) => database.transaction(async tx => {
    await tx.insert(schema.choreParentChecks).values({ parentId }).onDuplicateKeyUpdate({ set: { parentId } });
    const [state] = await tx.select().from(schema.choreParentChecks).where(eq(schema.choreParentChecks.parentId, parentId)).limit(1).for('update');
    if (!state) throw new Error('Parent check store unavailable');
    return operation(state, async value => { await tx.update(schema.choreParentChecks).set(value).where(eq(schema.choreParentChecks.parentId, parentId)); });
  }),
};
export async function verifyChoreParent(parentId: string, password: unknown, now: Date) {
  await confirmParentPassword(checks, parentId, password, async candidate => {
    const [credential] = await database.select({ password: account.password }).from(account)
      .where(and(eq(account.userId, parentId), eq(account.providerId, 'credential'))).limit(1);
    if (!credential?.password) throw new ChoreError(403, 'Set an account password using the existing account settings before managing chores.');
    const context = await getAuth().$context;
    return context.password.verify({ hash: credential.password, password: candidate });
  }, now);
}
