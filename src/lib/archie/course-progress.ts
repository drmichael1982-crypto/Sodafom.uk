export type CourseProgress = { phase: number; question: number; answers: number[]; missions: number[]; reflection: string };
export const blankCourseProgress = (): CourseProgress => ({ phase: 0, question: 0, answers: [], missions: [], reflection: '' });
const PREFIX = 'sodafom_course_resume:';
export function readCourseProgress(id: string, questionCount: number): CourseProgress {
  try {
    const value = JSON.parse(localStorage.getItem(PREFIX + id) || 'null');
    if (!value || !Number.isInteger(value.phase) || value.phase < 0 || value.phase > 5) return blankCourseProgress();
    return {
      phase: value.phase,
      question: Number.isInteger(value.question) ? Math.max(0, Math.min(questionCount - 1, value.question)) : 0,
      answers: Array.isArray(value.answers) ? value.answers.slice(0, questionCount).map((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 10 ? Number(n) : -1) : [],
      missions: Array.isArray(value.missions) ? [...new Set<number>(value.missions.filter((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < 20))] : [],
      reflection: typeof value.reflection === 'string' ? value.reflection.slice(0, 300) : '',
    };
  } catch { return blankCourseProgress(); }
}
export function saveCourseProgress(id: string, progress: CourseProgress): boolean {
  try { localStorage.setItem(PREFIX + id, JSON.stringify(progress)); return true; }
  catch { return false; }
}
export function clearCourseProgress(id: string) {
  try { localStorage.removeItem(PREFIX + id); } catch { /* A blocked store must not break practice. */ }
}
