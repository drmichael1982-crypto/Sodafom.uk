import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

export async function hashTeacherPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export async function verifyTeacherPassword(password: string, stored: string): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  if (stored.startsWith('scrypt$')) {
    const [, salt, expectedHex] = stored.split('$');
    if (!salt || !expectedHex) return { valid: false, needsUpgrade: false };
    const actual = await scrypt(password, salt, 64) as Buffer;
    const expected = Buffer.from(expectedHex, 'hex');
    return { valid: actual.length === expected.length && timingSafeEqual(actual, expected), needsUpgrade: false };
  }

  // One-time compatibility for accounts created before the scrypt upgrade.
  const legacy = createHash('sha256').update(password + 'sodafom-teacher-salt').digest('hex');
  const actual = Buffer.from(legacy, 'hex');
  const expected = Buffer.from(stored || '', 'hex');
  return { valid: actual.length === expected.length && timingSafeEqual(actual, expected), needsUpgrade: true };
}
