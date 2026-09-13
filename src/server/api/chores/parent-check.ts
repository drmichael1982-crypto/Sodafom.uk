import { ChoreError } from '@/lib/chores';
export interface CheckState { failures: number; windowStartedAt: Date }
export interface ParentCheckStore {
  // Serialize checks per account in the database; return failures without rolling them back.
  withLock<T>(parentId: string, operation: (state: CheckState, save: (state: CheckState) => Promise<void>) => Promise<T>): Promise<T>;
}
export async function confirmParentPassword(store: ParentCheckStore, parentId: string, password: unknown, verify: (password: string) => Promise<boolean>, now: Date): Promise<void> {
  if (typeof password !== 'string' || password.length < 1 || password.length > 1024) throw new ChoreError(403, 'Enter your parent account password to confirm.');
  const result = await store.withLock(parentId, async (previous, save) => {
    const state = now.getTime() - previous.windowStartedAt.getTime() >= 15 * 60 * 1000
      ? { failures: 0, windowStartedAt: now } : previous;
    if (state.failures >= 5) return 'limited';
    // Provider errors propagate and never grant approval. No secrets are logged.
    const ok = await verify(password);
    await save({ ...state, failures: ok ? 0 : state.failures + 1 });
    return ok ? 'verified' : 'incorrect';
  });
  if (result === 'limited') throw new ChoreError(429, 'Too many password attempts. Try again after 15 minutes.');
  if (result !== 'verified') throw new ChoreError(403, 'The parent password could not be confirmed.');
}
