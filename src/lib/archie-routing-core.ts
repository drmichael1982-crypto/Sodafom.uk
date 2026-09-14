/**
 * Shared Ask Archie routing policy.
 *
 * This module deliberately has no browser, server, storage, credential or UI
 * dependencies. Every caller follows the same order: local answer, a safe
 * saved answer, then one cloud request only when it is genuinely needed.
 */

export interface ArchieMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ArchieReply {
  text: string;
  source: 'local' | 'openai';
  modelUsed: string;
  /**
   * Local replies have no remote API charge. Cloud cost stays null until the
   * billing system supplies a verified figure: the UI must never guess one.
   */
  cost: number | null;
  costStatus: 'local' | 'unavailable';
  /** A previously paid cloud answer reused locally without another call. */
  reused?: boolean;
}

export interface ArchieRequest {
  messages: ArchieMessage[];
  systemExtra?: string;
  /**
   * Separates saved answers that were generated with different learning
   * context. A Year 1 lesson must never reuse a Year 9 answer merely because
   * the child asked the same short question.
   */
  cacheScope?: string;
  allowCloudFallback?: boolean;
  signal?: AbortSignal;
}

export type ArchieErrorCode =
  | 'INVALID_REQUEST'
  | 'LOCAL_UNAVAILABLE'
  | 'FALLBACK_DISABLED'
  | 'PAID_AI_BILLING_PENDING'
  | 'CANCELLED'
  | 'TIMEOUT'
  | 'UNAVAILABLE'
  | 'INVALID_RESPONSE';

const FRIENDLY_ERRORS: Record<ArchieErrorCode, string> = {
  INVALID_REQUEST: 'Please ask Archie a question first.',
  LOCAL_UNAVAILABLE: 'My local learning help is having a little trouble. Please try again in a moment.',
  FALLBACK_DISABLED: 'I do not know that one locally yet. Please try another question or ask a grown-up for help.',
  PAID_AI_BILLING_PENDING: 'Online help is paused for now. You can still ask me questions I know locally, or ask a grown-up for help.',
  CANCELLED: 'That question was stopped. You can ask again when you are ready.',
  TIMEOUT: 'That is taking too long. Please try again in a moment.',
  UNAVAILABLE: 'I could not reach online learning help. Please try another question or ask a grown-up for help.',
  INVALID_RESPONSE: 'I could not read that answer properly. Please try again in a moment.',
};

export class ArchieRoutingError extends Error {
  readonly code: ArchieErrorCode;

  constructor(code: ArchieErrorCode) {
    super(FRIENDLY_ERRORS[code]);
    this.name = 'ArchieRoutingError';
    this.code = code;
  }
}

export function friendlyArchieError(error: unknown): string {
  return error instanceof ArchieRoutingError ? error.message : FRIENDLY_ERRORS.UNAVAILABLE;
}

export function localArchieReply(text: string, reused = false): ArchieReply {
  return {
    text: text.trim(),
    source: 'local',
    modelUsed: reused ? 'Local AI (saved answer)' : 'Local AI',
    cost: 0,
    costStatus: 'local',
    reused,
  };
}

/** A compact UI label which never invents a charge for a cloud answer. */
export function describeArchieReply(reply: ArchieReply): string {
  if (reply.source === 'local') {
    return reply.reused ? 'Local AI · saved answer · £0 API cost' : 'Local AI · £0 API cost';
  }
  return 'OpenAI · ' + reply.modelUsed + ' · Cost pending verified billing';
}

/** Validate provider provenance instead of treating any HTTP 200 as cloud AI. */
export function parseArchieReply(value: unknown): ArchieReply {
  if (!value || typeof value !== 'object') throw new ArchieRoutingError('INVALID_RESPONSE');
  const data = value as Record<string, unknown>;
  const text = data.text ?? data.content ?? data.response;
  if (typeof text !== 'string' || !text.trim()) throw new ArchieRoutingError('INVALID_RESPONSE');

  if (data.source === 'local') return localArchieReply(text, data.reused === true);

  if (
    data.source !== 'openai'
    || typeof data.modelUsed !== 'string'
    || !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$/.test(data.modelUsed)
  ) {
    throw new ArchieRoutingError('INVALID_RESPONSE');
  }

  return {
    text: text.trim(),
    source: 'openai',
    modelUsed: data.modelUsed,
    cost: null,
    costStatus: 'unavailable',
  };
}

export interface ArchieRoutingDependencies {
  lookupLocal: (question: string) => string | null;
  lookupSaved: (question: string, cacheScope: string) => string | null;
  requestCloud: (request: ArchieRequest) => Promise<unknown>;
  rememberCloudAnswer: (question: string, answer: string, cacheScope: string) => void;
}

function normaliseCacheScope(value: string | undefined): string {
  const scope = value?.trim().toLowerCase().replace(/[^a-z0-9:_-]/g, '-').slice(0, 120);
  return scope || 'general';
}

/**
 * Local first, then a safely cached answer, then exactly one cloud request.
 * Local errors intentionally do not fall through to a chargeable request.
 */
export async function routeArchieQuestion(
  request: ArchieRequest,
  dependencies: ArchieRoutingDependencies,
): Promise<ArchieReply> {
  const last = Array.isArray(request.messages) ? request.messages.at(-1) : undefined;
  if (!last || last.role !== 'user' || typeof last.content !== 'string' || !last.content.trim()) {
    throw new ArchieRoutingError('INVALID_REQUEST');
  }
  if (request.signal?.aborted) throw new ArchieRoutingError('CANCELLED');

  const question = last.content.trim();
  let local: string | null;
  try {
    local = dependencies.lookupLocal(question);
  } catch {
    throw new ArchieRoutingError('LOCAL_UNAVAILABLE');
  }
  if (typeof local === 'string' && local.trim()) return localArchieReply(local);

  const cacheScope = normaliseCacheScope(request.cacheScope);
  let saved: string | null = null;
  try {
    saved = dependencies.lookupSaved(question, cacheScope);
  } catch {
    // Storage is optional. A cache failure cannot create a second cloud call.
  }
  if (typeof saved === 'string' && saved.trim()) return localArchieReply(saved, true);

  if (request.allowCloudFallback === false) throw new ArchieRoutingError('FALLBACK_DISABLED');
  if (request.signal?.aborted) throw new ArchieRoutingError('CANCELLED');

  let reply: ArchieReply;
  try {
    reply = parseArchieReply(await dependencies.requestCloud(request));
  } catch (error) {
    if (error instanceof ArchieRoutingError) throw error;
    throw new ArchieRoutingError('UNAVAILABLE');
  }
  if (request.signal?.aborted) throw new ArchieRoutingError('CANCELLED');

  if (reply.source === 'openai') {
    // Best effort only. Never retry the provider because cache storage failed.
    try {
      dependencies.rememberCloudAnswer(question, reply.text, cacheScope);
    } catch {
      // Ignore a non-essential cache write failure.
    }
  }

  return reply;
}
