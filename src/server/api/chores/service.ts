import { ChoreError, completionPlan, reviewPlan, type Chore, type ChoreAction, type Completion } from '@/lib/chores';

export type OwnedChore = Chore & { parentId: string };
export type OwnedCompletion = Completion & { parentId: string };
export type ChoreInsert = Omit<OwnedChore, 'id' | 'createdAt'>;
export type CompletionInsert = Omit<OwnedCompletion, 'id'>;
export interface ChoresTransaction {
  ownsChild(parentId: string, childId: number): Promise<boolean>;
  createChore(value: ChoreInsert): Promise<number>;
  /** Acquire the same row lock for ALL mutations of a chore or its completions. */
  lockChore(parentId: string, choreId: number): Promise<OwnedChore | undefined>;
  findCompletion(parentId: string, id: number): Promise<OwnedCompletion | undefined>;
  listCompletions(parentId: string, choreId: number): Promise<OwnedCompletion[]>;
  updateChore(parentId: string, id: number, values: Partial<ChoreInsert>): Promise<void>;
  createCompletion(value: CompletionInsert): Promise<number>;
  updateCompletion(parentId: string, id: number, values: Partial<CompletionInsert>): Promise<void>;
}
export interface ChoresStore {
  transaction<T>(operation: (tx: ChoresTransaction) => Promise<T>): Promise<T>;
}
/** parentVerified is set ONLY by server-side password verification, never from request JSON. */
export async function applyChoreAction(store: ChoresStore, parentId: string, parentVerified: boolean, action: ChoreAction, today: string, now: Date) {
  if (!parentId) throw new ChoreError(401, 'Parent sign-in required.');
  if (action.action !== 'complete' && !parentVerified) throw new ChoreError(403, 'A parent must confirm this change with their account password.');
  return store.transaction(async tx => {
    if (action.action === 'create') {
      if (!await tx.ownsChild(parentId, action.childId)) throw new ChoreError(404, 'Child profile not found.');
      const { action: _action, ...fields } = action;
      return { id: await tx.createChore({ ...fields, parentId, active: true }) };
    }
    const completionId = 'completionId' in action ? action.completionId : null;
    const first = completionId ? await tx.findCompletion(parentId, completionId) : undefined;
    if (completionId && !first) throw new ChoreError(404, 'Completion not found.');
    const choreId = 'choreId' in action ? action.choreId : first!.choreId;
    const job = await tx.lockChore(parentId, choreId);
    if (!job || !await tx.ownsChild(parentId, job.childId)) throw new ChoreError(404, 'Chore not found.');
    if (action.action === 'update') {
      await tx.updateChore(parentId, job.id, { title: action.title, rewardType: action.rewardType, valuePence: action.valuePence, rewardPoints: action.rewardPoints });
      return { id: job.id };
    }
    if (action.action === 'set-active') {
      await tx.updateChore(parentId, job.id, { active: action.active });
      return { id: job.id };
    }
    if (action.action === 'complete') {
      const rows = await tx.listCompletions(parentId, job.id);
      const { retryId, ...plan } = completionPlan(job, rows, today, action.occurrenceKey);
      if (retryId) {
        await tx.updateCompletion(parentId, retryId, { ...plan, completedAt: now });
        return { id: retryId };
      }
      return { id: await tx.createCompletion({ ...plan, parentId, childId: job.childId, choreId: job.id, completedAt: now }) };
    }
    // Re-read after the chore lock: a competing review might have finished meanwhile.
    const row = await tx.findCompletion(parentId, action.completionId);
    if (!row || row.choreId !== job.id || row.childId !== job.childId) throw new ChoreError(404, 'Completion not found.');
    const plan = reviewPlan(row, job, action.action === 'approve', action.action === 'return' ? action.parentNote : '', action.action === 'approve' && action.confirmLegacyValue, now);
    await tx.updateCompletion(parentId, row.id, plan);
    return { id: row.id };
  });
}
