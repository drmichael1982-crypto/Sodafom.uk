import type { Request, Response } from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/lib/chatbot/chat-config';
import { requirePaidAiBilling } from '@/server/paid-ai-guard';
import { tryLocalMaths, tryLocalSpelling, tryLocalScience, tryLocalReading, tryLocalAppHelp } from '@/lib/archie-local';
import { localArchieReply, type ArchieMessage, type ArchieReply } from '@/lib/archie-routing-core';

// Use only stateless local helpers on the server. The browser tutor has per-child
// pending-question state and must not become shared server state between pupils.
function answerLocally(question: string): string | null {
  return (tryLocalMaths(question) ?? tryLocalSpelling(question) ?? tryLocalScience(question)
    ?? tryLocalReading(question) ?? tryLocalAppHelp(question))?.text ?? null;
}

export default async function handler(req: Request, res: Response) {
  const wantsJson = req.headers.accept?.includes('application/json') === true;
  res.setHeader('Cache-Control', 'no-store');
  const fail = (status: number, code: string, message: string) => {
    if (wantsJson) return res.status(status).json({ error: message, code, source: 'error', modelUsed: null, cost: null, costSource: 'unavailable' });
    return res.status(status).type('text/plain').send(message);
  };
  const answer = (reply: ArchieReply, usage?: unknown) => {
    if (wantsJson) return res.status(200).json({ ...reply, content: reply.text, response: reply.text, usage });
    return res.status(200).type('text/plain').send(reply.text);
  };

  const input: unknown = req.body?.messages;
  const extra: unknown = req.body?.systemExtra;
  if (!Array.isArray(input) || input.length === 0 || input.length > 50
    || (extra !== undefined && (typeof extra !== 'string' || extra.length > 6000))) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a question with a shorter conversation.');
  }
  if (input.some((m) => !m || (m.role !== 'user' && m.role !== 'assistant')
    || typeof m.content !== 'string' || !m.content.trim() || m.content.length > 4000)) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a clear question.');
  }
  const messages: ArchieMessage[] = input.map((m) => ({ role: m.role, content: m.content.trim() }));
  const last = messages[messages.length - 1];
  if (last.role !== 'user' || messages.reduce((length, message) => length + message.content.length, 0) > 24000) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a question with a shorter conversation.');
  }

  // This check precedes the paid guard, so free answers do not depend on billing.
  try {
    const local = answerLocally(last.content);
    if (local?.trim()) return answer(localArchieReply(local));
  } catch {
    return fail(503, 'LOCAL_UNAVAILABLE', 'My local learning help is having a little trouble. Please try again in a moment.');
  }
  if (req.body?.allowOpenAiFallback === false) {
    return fail(503, 'FALLBACK_DISABLED', 'I do not know that one locally yet. Please try another question or ask a grown-up for help.');
  }

  // Keep the existing fail-closed billing safeguard. A client flag is not payment authorisation.
  if (!requirePaidAiBilling(res, wantsJson ? 'json' : 'text')) return;
  if (req.aborted || res.destroyed) return;

  const controller = new AbortController();
  const disconnect = () => { if (!res.writableEnded) controller.abort(); };
  res.on('close', disconnect);
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey || apiKey === 'SERVER_SIDE_ONLY') {
      return fail(503, 'ONLINE_UNAVAILABLE', 'Online learning help is not available right now. Please try a local question.');
    }
    // Exactly one economical paid-model attempt. No SDK retries or alternate-model chain.
    const openai = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 0 });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT + (extra ? `\n\n${extra}` : '') }, ...messages],
      max_tokens: 500,
    }, { signal: controller.signal });
    if (controller.signal.aborted || res.destroyed) return;
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return fail(502, 'EMPTY_RESPONSE', 'I could not find the right words. Please try another question.');
    // Report the returned model/usage. Do not invent a charge, a currency conversion,
    // or a zero-cost OpenAI answer while the live billing ledger is not integrated.
    return answer({ text, source: 'openai', modelUsed: completion.model, cost: null, costSource: 'unavailable' }, completion.usage ?? null);
  } catch {
    if (!controller.signal.aborted && !res.destroyed) {
      return fail(502, 'ONLINE_UNAVAILABLE', 'I could not reach online learning help. Please try another question or ask a grown-up for help.');
    }
  } finally {
    res.off('close', disconnect);
  }
}
