import { tryLocalArchieResponse } from './archie-local';

export interface ArchieMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ArchieReply {
  text: string;
  source: 'local';
  modelUsed: 'Local Archie';
  cost: 0;
}

export interface ArchieRequest {
  messages: ArchieMessage[];
  /** Contextual guidance created in the browser; it is never sent to a service. */
  localHint?: string;
  signal?: AbortSignal;
}

export type ArchieRoutingErrorCode =
  | 'INVALID_REQUEST'
  | 'CANCELLED'
  | 'LOCAL_UNAVAILABLE'
  | 'LOCAL_ONLY_NO_ANSWER';

const FRIENDLY_ERRORS: Record<ArchieRoutingErrorCode, string> = {
  INVALID_REQUEST: 'Please ask Archie a question first.',
  CANCELLED: 'That question was stopped. You can ask again when you are ready.',
  LOCAL_UNAVAILABLE: 'My local learning help is having a little trouble. Please try again in a moment.',
  LOCAL_ONLY_NO_ANSWER: 'I do not know that one locally yet. Try a maths, spelling, science, reading, or Sodafom question — or ask a grown-up for help.',
};

export class ArchieRoutingError extends Error {
  readonly code: ArchieRoutingErrorCode;

  constructor(code: ArchieRoutingErrorCode) {
    super(FRIENDLY_ERRORS[code]);
    this.name = 'ArchieRoutingError';
    this.code = code;
  }
}

export function friendlyArchieError(error: unknown): string {
  return error instanceof ArchieRoutingError
    ? error.message
    : FRIENDLY_ERRORS.LOCAL_UNAVAILABLE;
}

export function localArchieReply(text: string): ArchieReply {
  return {
    text: text.trim(),
    source: 'local',
    modelUsed: 'Local Archie',
    cost: 0,
  };
}

type LocalLookup = (question: string) => { text: string } | null;

/**
 * Resolve a child question using only on-device rules. There is intentionally
 * no online fallback, credential path, cache of child questions, or retry.
 */
export async function routeLocalArchieQuestion(
  request: ArchieRequest,
  lookupLocal: LocalLookup = tryLocalArchieResponse,
): Promise<ArchieReply> {
  const messages = Array.isArray(request.messages) ? request.messages : [];
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'user' || typeof last.content !== 'string' || !last.content.trim()) {
    throw new ArchieRoutingError('INVALID_REQUEST');
  }
  if (request.signal?.aborted) throw new ArchieRoutingError('CANCELLED');

  if (typeof request.localHint === 'string' && request.localHint.trim()) {
    return localArchieReply(request.localHint);
  }

  let local: { text: string } | null;
  try {
    local = lookupLocal(last.content.trim());
  } catch {
    throw new ArchieRoutingError('LOCAL_UNAVAILABLE');
  }

  if (request.signal?.aborted) throw new ArchieRoutingError('CANCELLED');
  if (local?.text?.trim()) return localArchieReply(local.text);

  throw new ArchieRoutingError('LOCAL_ONLY_NO_ANSWER');
}

/** Shared browser entry point for Archie Helper, Teacher, and game hints. */
export function askArchie(request: ArchieRequest): Promise<ArchieReply> {
  return routeLocalArchieQuestion(request);
}
