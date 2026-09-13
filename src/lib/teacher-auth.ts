/** Teacher-only sessions. Never keep a teacher signed in permanently on a shared device. */
const TOKEN_KEY = 'sodafom_teacher_token';
const TEACHER_KEY = 'sodafom_teacher_profile';
export interface TeacherProfile { id: number; name: string; email: string; className: string }
function removeLegacySession(): void {
  try { window.localStorage.removeItem(TOKEN_KEY); window.localStorage.removeItem(TEACHER_KEY); } catch { /* Storage may be disabled. */ }
}
export function getTeacherToken(): string | null {
  if (typeof window === 'undefined') return null;
  removeLegacySession();
  try {
    const token = window.sessionStorage.getItem(TOKEN_KEY);
    return token && /^[a-f0-9]{96}$/.test(token) ? token : null;
  } catch { return null; }
}
export function getTeacherProfile(): TeacherProfile | null {
  if (!getTeacherToken()) return null;
  try {
    const profile = JSON.parse(window.sessionStorage.getItem(TEACHER_KEY) ?? 'null') as TeacherProfile | null;
    return profile && Number.isSafeInteger(profile.id) && profile.id > 0 && typeof profile.name === 'string' && typeof profile.email === 'string' && typeof profile.className === 'string' ? profile : null;
  } catch { return null; }
}
export function saveTeacherSession(token: string, teacher: TeacherProfile): void {
  if (typeof token !== 'string' || !/^[a-f0-9]{96}$/.test(token) || !teacher || !Number.isSafeInteger(teacher.id) || teacher.id < 1 || typeof teacher.name !== 'string' || typeof teacher.email !== 'string') throw new Error('The sign-in response was incomplete.');
  removeLegacySession();
  try {
    window.sessionStorage.setItem(TEACHER_KEY, JSON.stringify({ id: teacher.id, name: teacher.name, email: teacher.email, className: typeof teacher.className === 'string' ? teacher.className : 'My Class' }));
    window.sessionStorage.setItem(TOKEN_KEY, token);
  } catch { clearTeacherSession(); throw new Error('Allow session storage in this browser to sign in.'); }
}
export function clearTeacherSession(): void {
  if (typeof window === 'undefined') return;
  removeLegacySession();
  try { window.sessionStorage.removeItem(TOKEN_KEY); window.sessionStorage.removeItem(TEACHER_KEY); } catch { /* Already unavailable. */ }
}
export function teacherAuthHeaders(): Record<string, string> {
  const token = getTeacherToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
