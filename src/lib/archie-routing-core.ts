/** Shared Ask Archie policy. No network, storage, credentials or UI dependencies. */
export interface ArchieMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ArchieReply {
  text: string;
  source: 'local' | 'openai';
  modelUsed: string;
  // A missing bill is not a zero-cost paid answer. Monetary billing stays server-side.
  cost: number | null;
  costSource: 'local' | 'unavailable';
}

export interface ArchieRequest {
  messages: ArchieMessage[];
  systemExtra?: string;
  allowOpenAiFallback?: boolean;
  signal?: AbortSignal;
  /** Existing contextual game guidance; not sent to a paid model. */
  localHint?: string;
}

export type ArchieErrorCode = 'INVALID_REQUEST' | 'LOCAL_UNAVAILABLE' | 'FALLBACK_DISABLED'
  | 'PAID_AI_BILLING_PENDING' | 'CANCELLED' | 'TIMEOUT' | 'UNAVAILABLE' | 'INVALID_RESPONSE';

const FRIENDLY_ERRORS: Record<ArchieErrorCode, string> = {
  INVALID_REQUEST: 'Please ask Archie a question first.',
  LOCAL_UNAVAILABLE: 'My local learning help is having a little trouble. Please try again in a moment.',
  FALLBACK_DISABLED: 'I do not know that one locally yet. Please try another question or ask a grown-up for help.',
  PAID_AI_BILLING_PENDING: 'Online help is paused for now. You can still ask me questions I know locally, or ask a grown-up for help.',
  CANCELLED: 'That question was stopped. You can ask again when you are ready.',
  TIMEOUT: 'That is taking too long. Please try again in a moment.',
  UNAVAILABLE: 'I could not reach online help. Please try another question or ask a grown-up for help.',
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

export const friendlyArchieError = (error: unknown): string =>
  error instanceof ArchieRoutingError ? error.message : FRIENDLY_ERRORS.UNAVAILABLE;

export function localArchieReply(text: string): ArchieReply {
  return { text: text.trim(), source: 'local', modelUsed: 'Local AI', cost: 0, costSource: 'local' };
}

/** Validate provenance instead of assuming any HTTP 200 answer came from OpenAI. */
export function parseArchieReply(value: unknown): ArchieReply {
  if (!value || typeof value !== 'object') throw new ArchieRoutingError('INVALID_RESPONSE');
  const data = value as Record<string, unknown>;
  const text = data.text ?? data.content ?? data.response;
  if (typeof text !== 'string' || !text.trim()) throw new ArchieRoutingError('INVALID_RESPONSE');
  if (data.source === 'local') return localArchieReply(text);
  if (data.source !== 'openai' || typeof data.modelUsed !== 'string'
    || !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$/.test(data.modelUsed)) {
    throw new ArchieRoutingError('INVALID_RESPONSE');
  }
  return { text: text.trim(), source: 'openai', modelUsed: data.modelUsed, cost: null, costSource: 'unavailable' };
}

export interface ArchieRoutingDependencies {
  lookupLocal: (question: string) => string | null;
  lookupLearned: (question: string) => string | null;
  requestOnline: (request: ArchieRequest) => Promise<unknown>;
  rememberOnline: (question: string, answer: string) => void;
}

/** One local lookup, then the existing local cache, then at most one online request. */
export async function routeArchieQuestion(request: ArchieRequest, deps: ArchieRoutingDependencies): Promise<ArchieReply> {
  const messages = request.messages;
  const last = Array.isArray(messages) ? messages[messages.length - 1] : undefined;
  if (!last || last.role !== 'user' || typeof last.content !== 'string' || !last.content.trim()) {
    throw new ArchieRoutingError('INVALID_REQUEST');
  }
  if (request.signal?.aborted) throw new ArchieRoutingError('CANCELLED');
  // Contextual hints are already local answers. Do not send them to the stateful
  // tutor as if the child were submitting an answer to a pending quiz.
  if (request.localHint?.trim()) return localArchieReply(request.localHint);
  const question = last.content.trim();
  let local: string | null;
  try {
    local = deps.lookupLocal(question);
  } catch {
    // Do not silently turn a local/storage fault into a chargeable request.
    throw new ArchieRoutingError('LOCAL_UNAVAILABLE');
  }
  if (typeof local === 'string' && local.trim()) return localArchieReply(local);
  let learned: string | null = null;
  try { learned = deps.lookupLearned(question); } catch { /* Cache is optional. */ }
  if (typeof learned === 'string' && learned.trim()) return localArchieReply(learned);
  if (request.allowOpenAiFallback === false) throw new ArchieRoutingError('FALLBACK_DISABLED');
  if (request.signal?.aborted) throw new ArchieRoutingError('CANCELLED');

  let reply: ArchieReply;
  try {
    reply = parseArchieReply(await deps.requestOnline(request));
  } catch (error) {
    if (error instanceof ArchieRoutingError) throw error;
    throw new ArchieRoutingError('UNAVAILABLE');
  }
  if (request.signal?.aborted) throw new ArchieRoutingError('CANCELLED');
  if (reply.source === 'openai') {
    // A storage failure must not discard the answer or trigger another model call.
    try { deps.rememberOnline(question, reply.text); } catch { /* Best effort. */ }
  }
  return reply;
}
