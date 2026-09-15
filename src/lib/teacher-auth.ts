/** Teacher Hub's existing bearer-session storage. Stored profiles are display hints only. */
import { browserStorage } from './auth/account-reliability';
const TOKEN_KEY = 'sodafom_teacher_token';
const TEACHER_KEY = 'sodafom_teacher_profile';

export interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  className: string;
}

export function getTeacherToken(): string | null {
  try { return browserStorage('localStorage')?.getItem(TOKEN_KEY) || null; }
  catch { return null; }
}
export function getTeacherProfile(): TeacherProfile | null {
  try {
    const raw = browserStorage('localStorage')?.getItem(TEACHER_KEY);
    if (!raw) return null;
    const profile: unknown = JSON.parse(raw);
    if (!profile || typeof profile !== 'object') return null;
    const p = profile as Record<string, unknown>;
    if (!Number.isSafeInteger(p.id) || Number(p.id) <= 0 || typeof p.name !== 'string' || typeof p.email !== 'string' || typeof p.className !== 'string') return null;
    return p as unknown as TeacherProfile;
  } catch { return null; }
}
export function saveTeacherSession(token: string, teacher: TeacherProfile): void {
  const storage = browserStorage('localStorage');
  if (!storage || !token) throw new Error('The teacher session could not be saved. Allow browser storage and try again.');
  try {
    storage.setItem(TEACHER_KEY, JSON.stringify(teacher));
    storage.setItem(TOKEN_KEY, token);
  } catch {
    clearTeacherSession();
    throw new Error('The teacher session could not be saved. Allow browser storage and try again.');
  }
}
export function clearTeacherSession(): void {
  const storage = browserStorage('localStorage');
  for (const key of [TOKEN_KEY, TEACHER_KEY]) {
    try { storage?.removeItem(key); } catch { /* Best effort, including disabled private storage. */ }
  }
}
export function teacherAuthHeaders(): Record<string, string> {
  const token = getTeacherToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
