/** Unvalidated model answers must not be reused across children or accounts. */
export interface ArchieLearnedAnswer { q: string; a: string; savedAt: string }
const LEGACY_KEY = 'sodafom_archie_learned_answers_v1';

export function clearLearnedAnswers(): void {
  try { if (typeof window !== 'undefined') window.localStorage.removeItem(LEGACY_KEY); }
  catch { /* Blocked storage must not interrupt learning. */ }
}

// Compatibility exports for existing callers. Purge the old shared cache;
// curated knowledge belongs in reviewed modules, not saved online responses.
export function loadLearnedAnswers(): ArchieLearnedAnswer[] { clearLearnedAnswers(); return []; }
export function rememberOnlineAnswer(_question: string, _answer: string): void { clearLearnedAnswers(); }
export function findLearnedAnswer(_question: string): string | null { clearLearnedAnswers(); return null; }
