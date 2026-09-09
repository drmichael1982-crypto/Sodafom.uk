import type { Request, Response } from 'express';
import OpenAI from 'openai';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SYSTEM_PROMPT } from '@/lib/chatbot/chat-config';
import { getAiControlState } from '../../lib/ai-control';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LocalAiResult {
  text?: string;
  confidence?: number;
}

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
        let val = trimmedLine.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        if (key) process.env[key] = val.trim();
      }
    } catch { /* ignore malformed local env files */ }
  }
}

function isSchoolMode(req: Request): boolean {
  return req.body?.mode === 'school' || req.header('x-sodafom-mode') === 'school';
}

async function askLocalAi(messages: ChatMessage[], systemExtra?: string): Promise<LocalAiResult | null> {
  const endpoint = process.env.LOCAL_AI_URL?.trim();
  if (!endpoint) return null;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, system: SYSTEM_PROMPT + (systemExtra ? `\n\n${systemExtra}` : '') }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return null;
    const result = await response.json() as LocalAiResult;
    return result?.text?.trim() ? result : null;
  } catch {
    return null;
  }
}

export default async function handler(req: Request, res: Response) {
  const messages = req.body?.messages as ChatMessage[] | undefined;
  const systemExtra = req.body?.systemExtra as string | undefined;
  if (!Array.isArray(messages)) return res.status(400).send('Invalid request: missing messages');

  const safeMessages = messages.filter(
    (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0,
  );
  if (safeMessages.length === 0) return res.status(400).send('No valid messages provided');

  loadFreshEnv();
  const controls = getAiControlState();
  const schoolMode = isSchoolMode(req);

  if (!controls.masterEnabled) {
    res.setHeader('X-Sodafom-AI', 'master-off');
    return res.status(503).send('Archie AI is temporarily offline.');
  }
  if (schoolMode && !controls.schoolAiEnabled) {
    res.setHeader('X-Sodafom-AI', 'school-off');
    return res.status(503).send('Archie AI is temporarily unavailable in School Mode.');
  }
  if (!schoolMode && !controls.homeAiEnabled) {
    res.setHeader('X-Sodafom-AI', 'home-off');
    return res.status(503).send('Archie AI is temporarily unavailable at home.');
  }

  if (controls.localAiEnabled) {
    const local = await askLocalAi(safeMessages, systemExtra);
    const minConfidence = Number(process.env.LOCAL_AI_MIN_CONFIDENCE ?? '0.7');
    if (local?.text && (local.confidence == null || local.confidence >= minConfidence)) {
      res.setHeader('X-Sodafom-AI', 'local');
      return res.status(200).send(local.text);
    }
  }

  // School Mode never escalates to OpenAI, regardless of switch state.
  if (schoolMode) {
    res.setHeader('X-Sodafom-AI', 'local-unavailable');
    return res.status(200).send("I'm not confident enough to answer that yet. Please ask your teacher to help teach Archie this one.");
  }

  if (!controls.openAiEnabled) {
    res.setHeader('X-Sodafom-AI', 'openai-off');
    return res.status(200).send("I can't use the online AI right now. Please try another question or come back later.");
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return res.status(503).send('Archie AI is not configured on the server yet.');
    const openai = new OpenAI({ apiKey, timeout: 40_000, maxRetries: 2 });
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_FALLBACK_MODEL?.trim() || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + (systemExtra ? `\n\n${systemExtra}` : '') },
        ...safeMessages.map((message) => ({ role: message.role, content: message.content })),
      ],
      max_tokens: 500,
    });
    const text = response.choices[0]?.message?.content?.trim();
    res.setHeader('X-Sodafom-AI', 'openai-fallback');
    return res.status(200).send(text || "I'm thinking really hard, but I couldn't find the right words! Try asking me again? 😊");
  } catch {
    return res.status(502).send('Archie could not reach the learning service. Please try again.');
  }
}
