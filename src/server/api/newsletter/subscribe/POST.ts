import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { newsletterSubscribers } from '@/server/db/schema';

export default async function handler(req: Request, res: Response) {
  try {
    const { email } = req.body as { email?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    await db
      .insert(newsletterSubscribers)
      .values({ email: email.toLowerCase().trim() })
      .onDuplicateKeyUpdate({ set: { email: email.toLowerCase().trim() } });

    res.json({ ok: true, message: 'You\'re on the list! We\'ll be in touch.' });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
