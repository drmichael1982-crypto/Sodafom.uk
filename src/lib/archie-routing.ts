import { API_PREFIX } from './config';
import { tryLocalArchieResponse } from './archie-local';
import { findLearnedAnswer, rememberOnlineAnswer } from './archie-device-memory';
import { ArchieRoutingError, routeArchieQuestion, type ArchieRequest } from './archie-routing-core';

export { friendlyArchieError } from './archie-routing-core';
export type { ArchieReply } from './archie-routing-core';

async function requestOnline(request: ArchieRequest): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const stop = () => controller.abort();
  request.signal?.addEventListener('abort', stop, { once: true });
  if (request.signal?.aborted) stop();
  const timeout = setTimeout(() => { timedOut = true; stop(); }, 35_000);
  try {
    // The server independently checks local answers and the existing billing guard.
    // There is deliberately no client retry, model chain, or alternative endpoint.
    const response = await fetch(`${API_PREFIX}/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: request.messages,
        systemExtra: request.systemExtra,
        allowOpenAiFallback: request.allowOpenAiFallback !== false,
      }),
    });
    if (!response.ok) {
      let code: unknown;
      try { code = (await response.json())?.code; } catch { /* Never show an upstream body. */ }
      throw new ArchieRoutingError(code === 'PAID_AI_BILLING_PENDING' ? 'PAID_AI_BILLING_PENDING' : 'UNAVAILABLE');
    }
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new ArchieRoutingError('INVALID_RESPONSE');
    }
    return await response.json();
  } catch (error) {
    if (timedOut) throw new ArchieRoutingError('TIMEOUT');
    if (controller.signal.aborted) throw new ArchieRoutingError('CANCELLED');
    if (error instanceof ArchieRoutingError) throw error;
    throw new ArchieRoutingError('UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
    request.signal?.removeEventListener('abort', stop);
  }
}

/** Used by Home/ArchieHelper, the AI Teacher and contextual Ask Archie hints. */
export function askArchie(request: ArchieRequest) {
  return routeArchieQuestion(request, {
    lookupLocal: (question) => tryLocalArchieResponse(question)?.text ?? null,
    lookupLearned: findLearnedAnswer,
    requestOnline,
    rememberOnline: rememberOnlineAnswer,
  });
}
