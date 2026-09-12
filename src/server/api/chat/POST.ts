import type { Request, Response } from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/lib/chatbot/chat-config';
import { requirePaidAiBilling } from '@/server/paid-ai-guard';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Production secrets come directly from process.env. Never reload local .env files in a request.
export default async function handler(req: Request, res: Response) {
  const messages = req.body?.messages as ChatMessage[] | undefined;
  const systemExtra = req.body?.systemExtra as string | undefined;
  if (!Array.isArray(messages)) return res.status(400).send('Invalid request: missing messages');
  const safeMessages = messages.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0);
  if (safeMessages.length === 0) return res.status(400).send('No valid messages provided');
  if (!requirePaidAiBilling(res, 'text')) return;

  try {
    let apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey === 'SERVER_SIDE_ONLY') apiKey = undefined;
    if (!apiKey) return res.status(503).send('Archie AI is not configured on the server yet.');
    const openai = new OpenAI({ apiKey, timeout: 40_000, maxRetries: 2 });
    const chatMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT + (systemExtra ? `\n\n${systemExtra}` : '') },
      ...safeMessages.map((message) => ({ role: message.role, content: message.content })),
    ];
    let response;
    try {
      response = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: chatMessages, max_tokens: 500 });
    } catch {
      try {
        response = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: chatMessages, max_tokens: 500 });
      } catch {
        response = await openai.chat.completions.create({ model: 'gpt-4o', messages: chatMessages, max_tokens: 500 });
      }
    }
    const text = response.choices[0]?.message?.content?.trim();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(text || "I'm thinking really hard, but I couldn't find the right words! Try asking me again? 😊");
  } catch (error) {
    console.error('[chat] ERROR:', error instanceof Error ? error.message : 'Unknown error');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(502).send('Archie could not reach the learning service. Please try again.');
  }
}
