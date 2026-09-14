import type { Request, Response } from 'express';
import OpenAI from 'openai';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SYSTEM_PROMPT } from '@/lib/chatbot/chat-config';
import {
  localArchieReply,
  type ArchieMessage,
  type ArchieReply,
} from '@/lib/archie-routing-core';
import { tryStatelessLocalArchieResponse } from '@/lib/archie-local';
import { requirePaidAiBilling } from '@/server/paid-ai-guard';

function loadFreshEnv() {
  const cwd = process.cwd();
  const envPaths = [resolve(cwd, '.env'), resolve(cwd, '../.env'), resolve(cwd, '../../.env')];
  for (const envPath of envPaths) {
    if (!existsSync(envPath)) continue;
    try {
      const content = readFileSync(envPath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        const eqIdx = trimmedLine.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmedLine.slice(0, eqIdx).trim();
        let value = trimmedLine.slice(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!key) continue;
        process.env[key] = value.trim();
        if (key === 'OPENAI_API_KE') process.env.OPENAI_API_KEY = value.trim();
      }
    } catch {
      // The configured runtime environment remains available if a local file cannot be read.
    }
  }
}

/**
 * Use only stateless local helpers on the server. Browser tutor state must
 * never become shared state between children through this API process.
 */
function answerLocally(question: string): string | null {
  return tryStatelessLocalArchieResponse(question)?.text ?? null;
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
        costStatus: 'unavailable',
      });
    }
    return res.status(status).type('text/plain').send(message);
  };

  const answer = (reply: ArchieReply, usage?: unknown) => {
    if (wantsJson) {
      return res.status(200).json({
        ...reply,
        content: reply.text,
        response: reply.text,
        usage: usage ?? null,
      });
    }
    return res.status(200).type('text/plain').send(reply.text);
  };

  const input: unknown = req.body?.messages;
  const systemExtra: unknown = req.body?.systemExtra;
  if (
    !Array.isArray(input)
    || input.length === 0
    || input.length > 50
    || (systemExtra !== undefined && (typeof systemExtra !== 'string' || systemExtra.length > 6000))
  ) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a question with a shorter conversation.');
  }

  if (
    input.some((message) => (
      !message
      || (message.role !== 'user' && message.role !== 'assistant')
      || typeof message.content !== 'string'
      || !message.content.trim()
      || message.content.length > 4000
    ))
  ) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a clear question.');
  }

  const messages: ArchieMessage[] = input.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));
  const last = messages.at(-1)!;
  const totalLength = messages.reduce((length, message) => length + message.content.length, 0);
  if (last.role !== 'user' || totalLength > 24_000) {
    return fail(400, 'INVALID_REQUEST', 'Please send Archie a question with a shorter conversation.');
  }

  // Local answers are free and must not depend on cloud availability or billing.
  try {
    const local = answerLocally(last.content);
    if (local?.trim()) return answer(localArchieReply(local));
  } catch {
    return fail(503, 'LOCAL_UNAVAILABLE', 'My local learning help is having a little trouble. Please try again in a moment.');
  }

  if (req.body?.allowCloudFallback === false) {
    return fail(503, 'FALLBACK_DISABLED', 'I do not know that one locally yet. Please try another question or ask a grown-up for help.');
  }

  // Do not let a browser flag authorise an unmetered paid request. The billing
  // guard currently fails closed until verified voucher/subscription debits are
  // connected, while keeping the single-call fallback path ready for that work.
  if (!requirePaidAiBilling(res, wantsJson ? 'json' : 'text')) return;

  if (req.aborted || res.destroyed) return;
  const controller = new AbortController();
  const abortOnDisconnect = () => {
    if (!res.writableEnded) controller.abort();
  };
  res.on('close', abortOnDisconnect);

  try {
    loadFreshEnv();
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey || apiKey === 'SERVER_SIDE_ONLY') {
      return fail(503, 'ONLINE_UNAVAILABLE', 'Online learning help is not available right now. Please try a local question.');
    }

    // Exactly one economical cloud attempt. SDK retries and model fallbacks could duplicate a paid call.
    const openai = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 0 });
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + (systemExtra ? '\n\n' + systemExtra : '') },
          ...messages,
        ],
        max_tokens: 500,
      },
      { signal: controller.signal },
    );

    if (controller.signal.aborted || res.destroyed) return;
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return fail(502, 'EMPTY_RESPONSE', 'I could not find the right words. Please try another question.');
    }

    // We show the returned model and usage provenance, but deliberately do not
    // invent a currency cost before the billing ledger provides one.
    return answer({
      text,
      source: 'openai',
      modelUsed: completion.model,
      cost: null,
      costStatus: 'unavailable',
    }, completion.usage ?? null);
  } catch {
    if (!controller.signal.aborted && !res.destroyed) {
      return fail(502, 'ONLINE_UNAVAILABLE', 'I could not reach online learning help. Please try another question or ask a grown-up for help.');
    }
  } finally {
    res.off('close', abortOnDisconnect);
  }
}
