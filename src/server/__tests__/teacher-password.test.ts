import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { hashTeacherPassword, verifyTeacherPassword } from '@/server/teacher-password';

describe('teacher password hashing', () => {
  it('stores new passwords with salted scrypt and verifies them', async () => {
    const first = await hashTeacherPassword('correct horse battery staple');
    const second = await hashTeacherPassword('correct horse battery staple');
    expect(first).toMatch(/^scrypt\$/);
    expect(first).not.toBe(second);
    await expect(verifyTeacherPassword('correct horse battery staple', first)).resolves.toEqual({ valid: true, needsUpgrade: false });
    await expect(verifyTeacherPassword('wrong password', first)).resolves.toEqual({ valid: false, needsUpgrade: false });
  });

  it('accepts a valid legacy hash only for one-time upgrade', async () => {
    const legacy = createHash('sha256').update('old-password' + 'sodafom-teacher-salt').digest('hex');
    await expect(verifyTeacherPassword('old-password', legacy)).resolves.toEqual({ valid: true, needsUpgrade: true });
    await expect(verifyTeacherPassword('wrong-password', legacy)).resolves.toEqual({ valid: false, needsUpgrade: true });
  });
});
