import { and, desc, eq, gte, lt, or, sql } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { db } from '@/server/db/client';
import { children } from '@/server/db/schema';
import { ChoreError, choreView, type ChoresData } from '@/lib/chores';
import * as schema from './schema';
import type { ChoresStore, ChoresTransaction } from './service';
const { chores, choreCompletions: completions } = schema;
const database = db as MySql2Database<typeof schema>;

export const choresStore: ChoresStore = {
  transaction: operation => database.transaction(async tx => {
    const adapter: ChoresTransaction = {
      ownsChild: async (parentId, childId) => (await tx.select({ id: children.id }).from(children).where(and(eq(children.parentId, parentId), eq(children.id, childId))).limit(1).for('update')).length === 1,
      createChore: async value => (await tx.insert(chores).values(value).$returningId())[0].id,
      lockChore: async (parentId, id) => (await tx.select().from(chores).where(and(eq(chores.parentId, parentId), eq(chores.id, id))).limit(1).for('update'))[0],
      // READ COMMITTED makes the post-lock completion re-read see any competing review.
      findCompletion: async (parentId, id) => (await tx.select().from(completions).where(and(eq(completions.parentId, parentId), eq(completions.id, id))).limit(1))[0],
      listCompletions: async (parentId, choreId) => tx.select().from(completions).where(and(eq(completions.parentId, parentId), eq(completions.choreId, choreId))).for('update'),
      updateChore: async (parentId, id, values) => { await tx.update(chores).set(values).where(and(eq(chores.parentId, parentId), eq(chores.id, id))); },
      createCompletion: async value => (await tx.insert(completions).values(value).$returningId())[0].id,
      updateCompletion: async (parentId, id, values) => { await tx.update(completions).set(values).where(and(eq(completions.parentId, parentId), eq(completions.id, id))); },
    };
    return operation(adapter);
  }, { isolationLevel: 'read committed' }),
};

export async function listChores(parentId: string, childId: number, today: string, now: Date, cursor?: number): Promise<ChoresData> {
  // A consistent read keeps task state, totals and history from contradicting each other.
  return database.transaction(async tx => {
    const [child] = await tx.select({ id: children.id, name: children.name, ageGroup: children.ageGroup }).from(children).where(and(eq(children.parentId, parentId), eq(children.id, childId))).limit(1);
    if (!child) throw new ChoreError(404, 'Child profile not found.');
    const family = and(eq(completions.parentId, parentId), eq(completions.childId, childId));
    const jobs = await tx.select().from(chores).where(and(eq(chores.parentId, parentId), eq(chores.childId, childId))).orderBy(desc(chores.id));
    const current = await tx.select().from(completions).where(and(family, or(eq(completions.status, 'waiting_for_parent'), eq(completions.occurrenceKey, 'once'), gte(completions.completedAt, new Date(now.getTime() - 8 * 86400000)))));
    const history = await tx.select().from(completions).where(and(family, cursor ? lt(completions.id, cursor) : undefined)).orderBy(desc(completions.id)).limit(51);
    const known = sql`((${completions.rewardTypeSnapshot} = 'money' AND ${completions.valuePenceSnapshot} >= 0) OR (${completions.rewardTypeSnapshot} = 'points' AND ${completions.rewardPointsSnapshot} >= 0))`;
    const [totals] = await tx.select({
      moneyPence: sql<string>`COALESCE(SUM(CASE WHEN ${completions.status} = 'approved' AND ${completions.rewardTypeSnapshot} = 'money' AND ${completions.valuePenceSnapshot} >= 0 THEN ${completions.valuePenceSnapshot} ELSE 0 END), 0)`,
      points: sql<string>`COALESCE(SUM(CASE WHEN ${completions.status} = 'approved' AND ${completions.rewardTypeSnapshot} = 'points' AND ${completions.rewardPointsSnapshot} >= 0 THEN ${completions.rewardPointsSnapshot} ELSE 0 END), 0)`,
      approvedCount: sql<string>`COALESCE(SUM(CASE WHEN ${completions.status} = 'approved' THEN 1 ELSE 0 END), 0)`,
      unknownApprovedCount: sql<string>`COALESCE(SUM(CASE WHEN ${completions.status} = 'approved' AND NOT COALESCE(${known}, FALSE) THEN 1 ELSE 0 END), 0)`,
    }).from(completions).where(family);
    // Deliberately do not return parent IDs, account fields or authentication data.
    const publicRow = ({ parentId: _parent, ...row }: typeof completions.$inferSelect) => row;
    return {
      version: 2, child, today,
      chores: jobs.map(({ parentId: _parent, ...job }) => choreView(job, current, today)),
      pending: current.filter(row => row.status === 'waiting_for_parent').map(publicRow),
      completions: history.slice(0, 50).map(publicRow),
      historyCursor: history.length > 50 ? history[49].id : null,
      totals: { moneyPence: Number(totals.moneyPence), points: Number(totals.points), approvedCount: Number(totals.approvedCount), unknownApprovedCount: Number(totals.unknownApprovedCount) },
    };
  }, { isolationLevel: 'repeatable read', accessMode: 'read only' });
}
