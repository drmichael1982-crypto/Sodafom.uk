import type { Request, Response } from 'express';
import { sendEmail } from '@/server/email';
import { getSecret } from '#airo/secrets';

// NOTE: The email gateway only delivers to platform-verified domains in preview.
// In production (sodafom.uk), delivery to external addresses like Gmail works.

// Rate limiting — 3 submissions per 60s per IP
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (bucket.count >= 3) return true;
  bucket.count++;
  return false;
}

function getVisitorIp(req: Request): string {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf.trim()) return cf.trim();
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0]?.trim() ?? '';
  return req.socket?.remoteAddress ?? 'unknown';
}

export default async function handler(req: Request, res: Response): Promise<void> {
  // Honeypot
  if (req.body?._gotcha) {
    res.status(200).json({ success: true });
    return;
  }

  const ip = getVisitorIp(req);
  if (isRateLimited(ip)) {
    res.status(429).json({ success: false, error: 'Too many requests. Please wait a moment.' });
    return;
  }

  const { name, email, subject, message } = req.body ?? {};

  if (!name || !email || !message) {
    res.status(400).json({ success: false, error: 'Name, email and message are required.' });
    return;
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    return;
  }

  const recipient = getSecret('NOTIFICATION_RECIPIENT_EMAIL');
  if (!recipient || typeof recipient !== 'string') {
    console.error('[notify-email] NOTIFICATION_RECIPIENT_EMAIL secret not set');
    res.status(500).json({ success: false, error: 'Email notifications are not configured yet.' });
    return;
  }

  const emailSubject = subject
    ? `Sodafom enquiry: ${subject}`
    : `New message from ${name} via Sodafom`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
      <div style="background: #2D6A4F; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #FFD700; margin: 0; font-size: 22px;">📬 New message from Sodafom</h1>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">From:</td>
            <td style="padding: 8px 0; color: #222;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Reply to:</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2D6A4F;">${email}</a></td>
          </tr>
          ${subject ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Subject:</td><td style="padding: 8px 0; color: #222;">${subject}</td></tr>` : ''}
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
        <h3 style="color: #2D6A4F; margin: 0 0 12px;">Message:</h3>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; color: #333; line-height: 1.6; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0 12px;" />
        <p style="color: #888; font-size: 13px; margin: 0;">
          To reply, simply hit <strong>Reply</strong> in your email client — it will go directly to <strong>${email}</strong>.
        </p>
      </div>
    </div>
  `;

  const text = `New message from Sodafom\n\nFrom: ${name}\nReply to: ${email}${subject ? `\nSubject: ${subject}` : ''}\n\nMessage:\n${message}`;

  try {
    await sendEmail({
      fromName: 'Sodafom Contact Form',
      to: recipient as string,
      subject: emailSubject,
      html,
      text,
    });

    console.log(`[notify-email] Message from ${email} forwarded to owner`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[notify-email] sendEmail failed:', err);
    res.status(500).json({ success: false, error: 'Could not send your message. Please try again.' });
  }
}
