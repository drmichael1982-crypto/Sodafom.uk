import type { Request, Response } from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/lib/chatbot/chat-config';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Production secrets come directly from process.env. Never reload local .env files in a request.

export default async function handler(req: Request, res: Response) {
  console.log('[chat] Request received. Origin:', req.headers.origin);
  const messages = req.body?.messages as ChatMessage[] | undefined;
  const systemExtra = req.body?.systemExtra as string | undefined;

  if (!Array.isArray(messages)) {
    console.error('[chat] Invalid request: missing messages');
    return res.status(400).send('Invalid request: missing messages');
  }

  const safeMessages = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content && m.content.trim().length > 0);

  if (safeMessages.length === 0) {
    console.warn('[chat] No valid messages provided');
    return res.status(400).send('No valid messages provided');
  }

  try {
    let apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey === 'SERVER_SIDE_ONLY') {
      apiKey = undefined;
    }
    if (!apiKey) {
      console.error('[chat] OPENAI_API_KEY is missing on the server');
      return res.status(503).send('Archie AI is not configured on the server yet.');
    }

    const openai = new OpenAI({ apiKey, timeout: 40_000, maxRetries: 2 });
    console.log('[chat] Calling OpenAI Chat Completions API...');

    const chatMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT + (systemExtra ? `\n\n${systemExtra}` : '') },
      ...safeMessages.map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      })),
    ];

    let response;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 500,
      });
    } catch (e1) {
      console.warn('[chat] gpt-4o-mini failed, trying gpt-3.5-turbo fallback...', e1 instanceof Error ? e1.message : e1);
      try {
        response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: chatMessages,
          max_tokens: 500,
        });
      } catch (e2) {
        console.warn('[chat] gpt-3.5-turbo failed, trying gpt-4o fallback...', e2 instanceof Error ? e2.message : e2);
        response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: chatMessages,
          max_tokens: 500,
        });
      }
    }

    const text = response.choices[0]?.message?.content?.trim();
    console.log(`[chat] AI Response generated. Length: ${text?.length || 0}`);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (!text) {
      console.warn('[chat] OpenAI returned empty string');
      return res.status(200).send("I'm thinking really hard, but I couldn't find the right words! Try asking me again? 😊");
    }
    return res.status(200).send(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[chat] ERROR:', message);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    // Do not send provider details or secret-related information to the child/device.
    res.status(502).send('Archie could not reach the learning service. Please try again.');
  }
}
