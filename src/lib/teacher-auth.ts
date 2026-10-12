/**
 * Teacher Hub auth helpers — token stored in localStorage.
 */

const TOKEN_KEY = 'sodafom_teacher_token';
const TEACHER_KEY = 'sodafom_teacher_profile';

export interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  className: string;
}

export function getTeacherToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getTeacherProfile(): TeacherProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(TEACHER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as TeacherProfile; } catch { return null; }
}

export function saveTeacherSession(token: string, teacher: TeacherProfile): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TEACHER_KEY, JSON.stringify(teacher));
}

export function clearTeacherSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TEACHER_KEY);
}

export function teacherAuthHeaders(): Record<string, string> {
  const token = getTeacherToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
