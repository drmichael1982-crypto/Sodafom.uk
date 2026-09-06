import type { Request, Response } from 'express';
import OpenAI from 'openai';

export default async function handler(req: Request, res: Response) {
  const image = typeof req.body?.image === 'string' ? req.body.image : '';
  const requestedAge = Number(req.body?.age);
  const age = Number.isInteger(requestedAge) && requestedAge >= 5 && requestedAge <= 13 ? requestedAge : 9;
  const schoolLevel = age <= 6 ? 'Key Stage 1' : age <= 10 ? 'Key Stage 2' : 'Key Stage 3';
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image) || image.length > 8_500_000) {
    return res.status(400).send('Please photograph one clear book page.');
  }
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return res.status(503).send('The online AI teacher needs its secure API key configured first.');
  try {
    const openai = new OpenAI({ apiKey, timeout: 45_000, maxRetries: 1 });
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      instructions: `You are Archie, a patient UK reading teacher helping a child aged ${age} at ${schoolLevel} level. Follow the National Curriculum in England at an age-appropriate level. Transcribe only the visible educational text, then present it in short read-along chunks, give gentle phonics or comprehension help as appropriate, and explain up to five difficult words. Never identify people in photographs. If the page is unclear, ask for a clearer photograph.`,
      input: [{ role: 'user', content: [{ type: 'input_text', text: 'Help the child read this page.' }, { type: 'input_image', image_url: image, detail: 'auto' }] }] as any,
      max_output_tokens: 900,
    });
    return res.type('text/plain').send(response.output_text?.trim() || 'I could not read that page. Please take a clearer photograph.');
  } catch {
    return res.status(502).send('Archie could not read the page just now. Please try again.');
  }
}
