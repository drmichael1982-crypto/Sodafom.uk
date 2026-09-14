import { tryLocalArchieResponse } from './archie-local';
import { findSavedArchieAnswer, rememberCloudArchieAnswer } from './archie-device-memory';
import { API_PREFIX } from './config';
import {
  ArchieRoutingError,
  routeArchieQuestion,
  type ArchieRequest,
} from './archie-routing-core';

export {
  describeArchieReply,
  friendlyArchieError,
  localArchieReply,
  type ArchieReply,
  type ArchieMessage,
} from './archie-routing-core';

async function requestCloud(request: ArchieRequest): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort();

  request.signal?.addEventListener('abort', abortFromCaller, { once: true });
  if (request.signal?.aborted) abortFromCaller();
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 35_000);

  try {
    // One endpoint, one request, no client retry or model escalation.
    const response = await fetch(API_PREFIX + '/chat', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        messages: request.messages,
        systemExtra: request.systemExtra,
        allowCloudFallback: request.allowCloudFallback !== false,
      }),
    });

    if (!response.ok) {
      let code: unknown;
      try {
        code = (await response.json())?.code;
      } catch {
        // Never show an upstream response body to a child.
      }
      if (code === 'FALLBACK_DISABLED') throw new ArchieRoutingError('FALLBACK_DISABLED');
      if (code === 'PAID_AI_BILLING_PENDING') throw new ArchieRoutingError('PAID_AI_BILLING_PENDING');
      throw new ArchieRoutingError('UNAVAILABLE');
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
    window.clearTimeout(timeout);
    request.signal?.removeEventListener('abort', abortFromCaller);
  }
}

/** Shared Local-first path for Home, Ask Archie and the AI Teacher. */
export function askArchie(request: ArchieRequest) {
  return routeArchieQuestion(request, {
    lookupLocal: (question) => tryLocalArchieResponse(question)?.text ?? null,
    lookupSaved: findSavedArchieAnswer,
    requestCloud,
    rememberCloudAnswer: rememberCloudArchieAnswer,
  });
}
