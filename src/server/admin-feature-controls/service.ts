import { buildSnapshot, prepareChange, FeatureControlError, type StoredSettings } from '../../components/admin/feature-controls-model';
export interface FeatureStore {
  read(initialise: boolean): Promise<{ settings: StoredSettings; revision: number }>;
  compareAndSet(expectedRevision: number, settings: StoredSettings): Promise<void>;
}
export type FeatureWriteRequest = {
  authorised: boolean; origin: string | undefined; host: string | undefined;
  contentType: string | undefined; actionHeader: string | undefined;
  development: boolean; trustedOrigins: readonly string[]; body: unknown;
};
export function allowedOrigin(request: FeatureWriteRequest): boolean {
  try {
    const url = new URL(request.origin ?? '');
    if (url.origin !== request.origin || url.username || url.password) return false;
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(request.development && local && url.protocol === 'http:')) return false;
    if (url.host.toLowerCase() === request.host?.toLowerCase()) return true;
    return request.trustedOrigins.some(origin => {
      try { return new URL(origin).origin === url.origin; } catch { return false; }
    });
  } catch { return false; }
}
const denied = () => ({ status: 401, body: { error: 'Owner authorisation is required.' } });
const failed = () => ({ status: 503, body: { error: 'Feature controls are temporarily unavailable. Reload before making another change.' } });
export function createFeatureService(store: FeatureStore) {
  return {
    async read(authorised: boolean, publicOnly: boolean) {
      if (!publicOnly && !authorised) return denied();
      try {
        // Public reads never create tables or write defaults.
        const value = await store.read(authorised && !publicOnly);
        return { status: 200, body: { success: true, snapshot: buildSnapshot(value.settings, value.revision) } };
      } catch { return failed(); }
    },
    async write(request: FeatureWriteRequest) {
      if (!request.authorised) return denied();
      if (request.actionHeader !== 'feature-control' || request.contentType?.split(';', 1)[0].trim().toLowerCase() !== 'application/json' || !allowedOrigin(request)) {
        return { status: 403, body: { error: 'Open Admin on your trusted Sodafom address and try again.' } };
      }
      try {
        const value = await store.read(true);
        const next = prepareChange(value.settings, value.revision, request.body);
        if (next.changed) await store.compareAndSet(value.revision, next.settings);
        return { status: 200, body: { success: true, snapshot: next.snapshot } };
      } catch (error) {
        return error instanceof FeatureControlError
          ? { status: error.status, body: { error: error.message } }
          : failed();
      }
    },
  };
}
