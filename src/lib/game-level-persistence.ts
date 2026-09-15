/** Persistence for useGameLevel's existing endpoint and browser cache.
 * Unconfirmed POSTs are never replayed: the existing API has no idempotency key.
 */
export interface LevelData { level: number; bestStars: number; playsAtLevel: number }
interface CachedLevel extends LevelData { pending: boolean }
export interface LevelOwner { userId: string; childId: number }
export interface LevelSnapshot extends LevelData {
  loading: boolean;
  syncStatus: 'local-only' | 'cached' | 'synced' | 'pending' | 'unavailable';
  storageAvailable: boolean;
  saveError: string | null;
}
interface Options {
  storage: Pick<Storage, 'getItem' | 'setItem'> | null;
  fetcher: typeof fetch;
  apiPrefix: string;
  timeoutMs?: number;
}
const INITIAL: LevelData = { level: 1, bestStars: 0, playsAtLevel: 0 };
export const EMPTY_LEVEL: LevelSnapshot = {
  ...INITIAL, loading: false, syncStatus: 'unavailable', storageAvailable: false,
  saveError: 'Sign in and select a child to load this progress.',
};

export function levelCacheKey(slug: string, owner: LevelOwner | null): string {
  // Preserve the existing guest key, but never import its ambiguous ownership
  // into a signed-in child. Account and child boundaries are both explicit.
  return owner
    ? `sodafom_level_account_${encodeURIComponent(JSON.stringify([owner.userId, owner.childId, slug]))}`
    : `sodafom_level_${slug}`;
}
export function validLevel(value: unknown): LevelData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const { level, bestStars } = row;
  const playsAtLevel = row.playsAtLevel ?? 0;
  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 10
    || typeof bestStars !== 'number' || !Number.isInteger(bestStars) || bestStars < 0 || bestStars > 3
    || typeof playsAtLevel !== 'number' || !Number.isSafeInteger(playsAtLevel) || playsAtLevel < 0) return null;
  return { level, bestStars, playsAtLevel };
}
function mergeLevels(a: LevelData, b: LevelData): LevelData {
  return {
    level: Math.max(a.level, b.level), bestStars: Math.max(a.bestStars, b.bestStars),
    playsAtLevel: a.level === b.level ? Math.max(a.playsAtLevel, b.playsAtLevel)
      : a.level > b.level ? a.playsAtLevel : b.playsAtLevel,
  };
}
class RequestError extends Error {
  constructor(readonly status: number) { super('Progress request failed'); }
}

export class GameLevelPersistence {
  readonly cacheKey: string;
  private data: CachedLevel;
  private storageAvailable = true;
  private hasLocalCopy = false;
  private status: LevelSnapshot['syncStatus'];
  private error: string | null = null;
  private loading: boolean;
  private revision = 0;
  private readSequence = 0;
  private inFlight = 0;
  private uncertain: boolean;
  private blocked = false;
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<() => void>();

  constructor(private slug: string, private owner: LevelOwner | null, private options: Options) {
    this.cacheKey = levelCacheKey(slug, owner);
    this.data = this.readCache() ?? { ...INITIAL, pending: false };
    this.uncertain = this.data.pending;
    this.loading = owner !== null;
    this.status = this.data.pending ? 'pending' : owner ? (this.hasLocalCopy ? 'cached' : 'unavailable') : 'local-only';
    if (!this.storageAvailable) this.status = 'unavailable';
  }
  snapshot(): LevelSnapshot {
    return {
      ...(this.blocked ? INITIAL : this.data), loading: this.loading,
      syncStatus: this.status, storageAvailable: this.storageAvailable, saveError: this.error,
    };
  }
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  private publish(): void { for (const listener of this.listeners) listener(); }
  private readCache(): CachedLevel | null {
    try {
      if (!this.options.storage) throw new Error('Storage unavailable');
      const raw = this.options.storage.getItem(this.cacheKey);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      const level = validLevel(parsed);
      if (!level) return null;
      this.hasLocalCopy = true;
      return { ...level, pending: (parsed as { pending?: unknown }).pending === true };
    } catch {
      this.storageAvailable = false;
      return null;
    }
  }
  private persist(): boolean {
    try {
      if (!this.options.storage) throw new Error('Storage unavailable');
      this.options.storage.setItem(this.cacheKey, JSON.stringify(this.data));
      this.storageAvailable = true;
      this.hasLocalCopy = true;
      return true;
    } catch {
      this.storageAvailable = false;
      this.error = 'This device could not save a local copy of progress.';
      return false;
    }
  }
  private async request(method: 'GET' | 'POST', stars?: number): Promise<LevelData> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 15_000);
    try {
      const response = await this.options.fetcher(
        `${this.options.apiPrefix}/children/${this.owner!.childId}/game-level/${encodeURIComponent(this.slug)}`,
        {
          method, credentials: 'include', cache: 'no-store', signal: controller.signal,
          ...(method === 'POST' ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stars }) } : {}),
        },
      );
      if (!response.ok) throw new RequestError(response.status);
      const data = validLevel(await response.json());
      if (!data) throw new Error('Invalid progress response');
      return data;
    } finally { clearTimeout(timeout); }
  }
  /** GET is safe to repeat. It must not erase an unconfirmed offline result. */
  async load(): Promise<LevelSnapshot> {
    if (!this.owner) {
      const cached = this.readCache();
      if (cached) this.data = { ...mergeLevels(this.data, cached), pending: false };
      this.loading = false;
      this.publish();
      return this.snapshot();
    }
    const sequence = ++this.readSequence;
    const revision = this.revision;
    try {
      const remote = await this.request('GET');
      if (sequence !== this.readSequence || revision !== this.revision) return this.snapshot();
      this.blocked = false;
      // A second tab may have saved while this request was in flight.
      const cached = this.readCache();
      if (cached?.pending) {
        if (this.inFlight === 0) this.uncertain = true;
        this.data = { ...mergeLevels(this.data, cached), pending: true };
      }
      const pending = this.uncertain || this.inFlight > 0;
      this.data = { ...(pending ? mergeLevels(this.data, remote) : remote), pending };
      this.error = pending ? 'Some results are saved on this device but not confirmed online.' : null;
      this.persist();
      this.status = pending ? 'pending' : 'synced';
    } catch (error) {
      if (sequence !== this.readSequence || revision !== this.revision) return this.snapshot();
      if (error instanceof RequestError && [401, 403, 404].includes(error.status)) {
        // Keep any pending recovery copy, but do not display another account's
        // or an inaccessible child's cache, nor redirect writes to guest data.
        this.blocked = true;
        this.status = 'unavailable';
        this.error = 'Sign in and select an accessible child to load progress.';
      } else {
        this.status = this.data.pending ? 'pending' : this.hasLocalCopy ? 'cached' : 'unavailable';
        this.error = 'Online progress is unavailable; any local copy has been kept.';
      }
    } finally {
      if (sequence === this.readSequence) { this.loading = false; this.publish(); }
    }
    return this.snapshot();
  }
  /** Same return value as the old hook. Save status is separately observable. */
  record(stars: number): Promise<number> {
    if (!Number.isInteger(stars) || stars < 0 || stars > 3) {
      this.error = 'Invalid result; progress was not changed.';
      this.publish();
      return Promise.resolve(this.snapshot().level);
    }
    if (this.blocked) return Promise.resolve(this.snapshot().level);
    const cached = this.readCache();
    if (cached) {
      this.data = { ...mergeLevels(this.data, cached), pending: this.data.pending || cached.pending };
      if (cached.pending && this.inFlight === 0) this.uncertain = true;
    }
    this.revision += 1;
    const level = Math.min(10, this.data.level + 1);
    this.data = {
      level, bestStars: Math.max(this.data.bestStars, stars),
      playsAtLevel: this.data.level < 10 ? 0 : this.data.playsAtLevel + 1,
      pending: this.owner !== null,
    };
    this.error = null;
    const locallySaved = this.persist(); // Before the first await / network call.
    this.loading = false;
    this.status = this.owner ? 'pending' : locallySaved ? 'local-only' : 'unavailable';
    this.publish();
    if (!this.owner) return Promise.resolve(level);
    this.inFlight += 1;
    const save = async (): Promise<number> => {
      try {
        const remote = await this.request('POST', stars);
        this.data = { ...mergeLevels(this.data, remote), pending: true };
      } catch (error) {
        this.uncertain = true;
        if (error instanceof RequestError && [401, 403, 404].includes(error.status)) this.blocked = true;
      } finally {
        this.inFlight -= 1;
        this.data.pending = this.uncertain || this.inFlight > 0;
        this.error = this.data.pending ? 'Some results are saved on this device but not confirmed online.' : null;
        const saved = this.persist();
        this.status = this.blocked ? 'unavailable' : this.data.pending ? (saved ? 'pending' : 'unavailable') : 'synced';
        this.publish();
      }
      return this.snapshot().level;
    };
    // Serialise new submissions within this mounted game, never replay old ones.
    const result = this.queue.then(save);
    this.queue = result.catch(() => undefined);
    return result;
  }
}
