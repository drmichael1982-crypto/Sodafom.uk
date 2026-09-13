import { buildSnapshot, defaultSettings, readSnapshot, type FeatureChange, type FeatureSnapshot } from './feature-controls-model';
export class FeatureRequestError extends Error {
  constructor(public readonly status: number) { super('Feature controls request failed'); }
}
export async function requestFeatureSnapshot(
  apiPrefix: string,
  options: { publicOnly?: boolean; change?: FeatureChange; signal?: AbortSignal; timeoutMs?: number; fetcher?: typeof fetch } = {},
): Promise<FeatureSnapshot> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(abort, options.timeoutMs ?? 8000);
  const view = options.publicOnly ? 'feature-availability' : 'feature-controls';
  const url = `${apiPrefix.replace(/\/$/, '')}/admin/founder-changes${options.change ? '' : `?view=${view}`}`;
  try {
    const response = await (options.fetcher ?? fetch)(url, {
      method: options.change ? 'POST' : 'GET',
      credentials: options.publicOnly ? 'omit' : 'include',
      cache: 'no-store', signal: controller.signal,
      ...(options.change ? { headers: { 'Content-Type': 'application/json', 'X-Sodafom-Admin-Action': 'feature-control' }, body: JSON.stringify(options.change) } : {}),
    });
    if (!response.ok) throw new FeatureRequestError(response.status);
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || !('success' in data) || data.success !== true || !('snapshot' in data)) throw new FeatureRequestError(502);
    return readSnapshot(data.snapshot);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}
// Availability is deliberately NOT a security/parental restriction. Offline
// activities keep the last known availability, or the original defaults.
// No private admin response or credentials are cached in browser storage.
let lastPublicSnapshot: FeatureSnapshot | undefined;
export async function readPageAvailability(apiPrefix: string, signal: AbortSignal): Promise<FeatureSnapshot> {
  try {
    const snapshot = await requestFeatureSnapshot(apiPrefix, { publicOnly: true, signal, timeoutMs: 3000 });
    if (!signal.aborted) lastPublicSnapshot = snapshot;
    return snapshot;
  } catch {
    return lastPublicSnapshot ?? buildSnapshot(defaultSettings(), 0);
  }
}
