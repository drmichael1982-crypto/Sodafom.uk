/** Teacher sessions are tab-scoped; pupil records are never placed in browser storage. */
import { API_PREFIX } from '@/lib/config';
const TOKEN_KEY = 'sodafom_teacher_token';
const TEACHER_KEY = 'sodafom_teacher_profile';
export interface TeacherProfile { id: number; name: string; email: string; className: string | null }
function removeLegacySession(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(TOKEN_KEY); window.localStorage.removeItem(TEACHER_KEY); } catch { /* Storage may be disabled. */ }
}
export function getTeacherToken(): string | null {
  removeLegacySession();
  if (typeof window === 'undefined') return null;
  try { return window.sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function getTeacherProfile(): TeacherProfile | null {
  if (!getTeacherToken() || typeof window === 'undefined') return null;
  try {
    const p = JSON.parse(window.sessionStorage.getItem(TEACHER_KEY) ?? 'null') as TeacherProfile | null;
    return p && Number.isSafeInteger(p.id) && p.id > 0 && typeof p.name === 'string' && typeof p.email === 'string' ? p : null;
  } catch { return null; }
}
export function saveTeacherSession(token: string, teacher: TeacherProfile): void {
  if (typeof window === 'undefined' || typeof token !== 'string' || !/^[a-f0-9]{96}$/i.test(token)
    || !teacher || !Number.isSafeInteger(teacher.id) || teacher.id < 1 || typeof teacher.name !== 'string' || typeof teacher.email !== 'string') {
    throw new Error('The teacher sign-in response was invalid. Please try again.');
  }
  clearTeacherSession();
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.sessionStorage.setItem(TEACHER_KEY, JSON.stringify(teacher));
  } catch { clearTeacherSession(); throw new Error('Enable session storage in this browser to sign in.'); }
}
export function clearTeacherSession(): void {
  removeLegacySession();
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.removeItem(TOKEN_KEY); window.sessionStorage.removeItem(TEACHER_KEY); } catch { /* Nothing retained in memory. */ }
}
export function teacherAuthHeaders(): Record<string, string> {
  const token = getTeacherToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export async function signOutTeacher(): Promise<void> {
  const headers = teacherAuthHeaders();
  // Clear the shared-device session immediately, even if the server cannot be reached.
  clearTeacherSession();
  if (!headers.Authorization) return;
  const response = await fetch(`${API_PREFIX}/teacher/login`, { method: 'POST', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ action: 'logout' }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Local sign-out completed, but the server session could not be revoked.');
}
