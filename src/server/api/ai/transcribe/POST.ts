import type { Request, Response } from 'express';
import OpenAI, { toFile } from 'openai';

const AUDIO_DATA = /^data:(audio\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i;

export default async function handler(req: Request, res: Response) {
  const encoded = typeof req.body?.audio === 'string' ? req.body.audio : '';
  const match = encoded.match(AUDIO_DATA);
  if (!match) return res.status(400).json({ error: 'Please record a short voice message.' });
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > 6_000_000) return res.status(413).json({ error: 'Voice message is too large.' });

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return res.status(503).json({ error: 'Voice transcription is not configured.' });
  try {
    const extension = match[1].includes('ogg') ? 'ogg' : match[1].includes('mp4') ? 'm4a' : 'webm';
    const client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 1 });
    const result = await client.audio.transcriptions.create({
      file: await toFile(bytes, `archie-voice.${extension}`, { type: match[1] }),
      model: 'gpt-4o-mini-transcribe',
      language: 'en',
      prompt: 'A child is speaking to Archie, a UK educational assistant. Return only the words spoken.',
    });
    const text = result.text.trim().slice(0, 1000);
    return text ? res.json({ text }) : res.status(422).json({ error: 'I could not hear any words.' });
  } catch (error) {
    console.error('[transcribe]', error);
    return res.status(502).json({ error: 'Voice transcription is temporarily unavailable.' });
  }
}
