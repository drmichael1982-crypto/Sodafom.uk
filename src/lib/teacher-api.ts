import { API_PREFIX } from '@/lib/config';
import { teacherAuthHeaders, clearTeacherSession } from './teacher-auth';
import { csvRows } from './teacher-school';
export class TeacherApiError extends Error { status: number; constructor(message: string, status: number) { super(message); this.status = status; } }
export async function teacherRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!path.startsWith('/')) throw new Error('Invalid teacher API path.');
  const headers = new Headers(options.headers);
  for (const [key, value] of Object.entries(teacherAuthHeaders())) headers.set(key, value);
  if (options.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_PREFIX}/teacher${path}`, { ...options, headers, cache: 'no-store' });
  if (response.status === 401) clearTeacherSession();
  let data: unknown;
  try { data = await response.json(); } catch { throw new TeacherApiError('The school service returned an unreadable response.', response.status); }
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : 'The school request failed.';
    throw new TeacherApiError(message, response.status);
  }
  return data as T;
}
export function exportTeacherCsv(filename: string, rows: unknown[][]): void {
  if (!window.confirm('This report contains pupil information. Save it only to an authorised school location?')) return;
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csvRows(rows)], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
