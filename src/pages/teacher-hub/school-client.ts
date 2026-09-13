import { API_PREFIX } from '@/lib/config';
import { clearTeacherSession, teacherAuthHeaders } from '@/lib/teacher-auth';
import type { ProgressRecord, ProgressSummary, SchoolCoverage } from '@/lib/teacher-progress';
export interface Pupil { id: number; name: string; ageGroup: string; avatarEmoji: string | null; studentCode: string; totalStars: number }
export interface TeacherNote { id: number; noteText: string; subject: string | null; createdAt: string | null }
export interface PupilSummary extends Pupil { summary: ProgressSummary; notes: TeacherNote[]; coverage: SchoolCoverage }
export interface PupilDetail { student: Pupil; summary: ProgressSummary; records: ProgressRecord[]; notes: TeacherNote[]; coverage: SchoolCoverage; recommendations: { gameId: string; title: string; reason: string; path: string }[] }
export class TeacherApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function teacherRequest<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  if (!path.startsWith('/teacher/')) throw new Error('Teacher endpoint required.');
  const headers = teacherAuthHeaders();
  if (!headers.Authorization) throw new TeacherApiError(401, 'Please sign in as a teacher.');
  const res = await fetch(`${API_PREFIX}${path}`, { method: body === undefined ? 'GET' : 'POST', cache: 'no-store',
    headers: { ...headers, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body), signal,
  });
  if (res.status === 401) { clearTeacherSession(); throw new TeacherApiError(401, 'Your teacher session has expired. Please sign in again.'); }
  const data = await res.json().catch(() => null) as T & { error?: string } | null;
  if (!res.ok || data === null) throw new TeacherApiError(res.status, typeof data?.error === 'string' ? data.error.slice(0, 500) : 'The school service did not return a valid response. Please retry.');
  return data;
}
export function downloadTeacherReport(text: string, filename: string): void {
  if (!window.confirm('This report contains pupil information. Save it only on an approved school device and share it only with authorised people. Continue?')) return;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const fieldClass = 'w-full rounded-xl border border-border bg-background p-3 text-foreground';
export const buttonClass = 'rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
