import type { Request, Response } from 'express';
import {
  tryLocalAppHelp,
  tryLocalMaths,
  tryLocalReading,
  tryLocalScience,
  tryLocalSpelling,
} from '@/lib/archie-local';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const LOCAL_ONLY_MESSAGE = 'Online learning help is not enabled. Try a maths, spelling, science, reading, or Sodafom question — or ask a grown-up for help.';

// Do not call tryLocalTutor here: it holds browser-child lesson state and must
// never become shared server state between pupils.
function answerLocally(question: string): string | null {
  return (
    tryLocalMaths(question)
    ?? tryLocalSpelling(question)
    ?? tryLocalScience(question)
    ?? tryLocalReading(question)
    ?? tryLocalAppHelp(question)
  )?.text ?? null;
}

export default async function handler(req: Request, res: Response) {
  const wantsJson = req.headers.accept?.includes('application/json') === true;
  res.setHeader('Cache-Control', 'no-store');

  const fail = (status: number, code: string, message: string) => {
    if (wantsJson) {
      return res.status(status).json({
        error: message,
        code,
        source: 'error',
        modelUsed: null,
        cost: null,
      });
    }
    return res.status(status).type('text/plain').send(message);
  };

  const answer = (text: string) => {
    const reply = {
      text: text.trim(),
      content: text.trim(),
      response: text.trim(),
      source: 'local' as const,
      modelUsed: 'Local Archie' as const,
      cost: 0 as const,
    };
    if (wantsJson) return res.status(200).json(reply);
    return res.status(200).type('text/plain').send(reply.text);
  };

  const input: unknown = req.body?.messages;
  const systemExtra: unknown = req.body?.systemExtra;
  if (!Array.isArray(input) || input.length === 0 || input.length > 50
    || (systemExtra !== undefined && (typeof systemExtra !== 'string' || systemExtra.length > 6000))) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a clear, shorter question.');
  }
  if (input.some((message) => !message
    || (message.role !== 'user' && message.role !== 'assistant')
    || typeof message.content !== 'string'
    || !message.content.trim()
    || message.content.length > 4000)) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a clear question.');
  }

  const messages: ChatMessage[] = input.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));
  const last = messages[messages.length - 1];
  if (last.role !== 'user' || messages.reduce((total, message) => total + message.content.length, 0) > 24_000) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a clear, shorter question.');
  }

  try {
    const local = answerLocally(last.content);
    if (local?.trim()) return answer(local);
  } catch {
    return fail(503, 'LOCAL_UNAVAILABLE', 'My local learning help is having a little trouble. Please try again in a moment.');
  }

  // Fail closed: this endpoint has no credential, voucher, model, retry, or
  // external-service fallback. A client flag cannot enable paid AI.
  return fail(503, 'PAID_AI_DISABLED', LOCAL_ONLY_MESSAGE);
}
