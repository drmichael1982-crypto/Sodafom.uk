/**
 * Small on-device cache for general educational answers returned by cloud AI.
 * It reduces repeat paid calls on this device; it is not model training and it
 * rejects likely personal or account-related questions.
 */

interface SavedArchieAnswer {
  question: string;
  answer: string;
  scope?: string;
}

const CACHE_KEY = 'sodafom_archie_saved_answers_v1';
const MAX_ITEMS = 100;

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normaliseScope(value: string | undefined): string {
  const scope = value?.trim().toLowerCase().replace(/[^a-z0-9:_-]/g, '-').slice(0, 120);
  return scope || 'general';
}

function isSafeToStore(question: string, answer: string): boolean {
  if (!question.trim() || !answer.trim() || question.length > 400 || answer.length > 2500) return false;
  if (/password|passcode|api\s*key|secret|credit\s*card|bank\s*account|email\s*address/i.test(question)) return false;
  if (/my name is|i am called|call me|my address|my phone/i.test(question)) return false;
  return true;
}

function readCache(): SavedArchieAnswer[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedArchieAnswer => (
      !!item
      && typeof item === 'object'
      && typeof (item as SavedArchieAnswer).question === 'string'
      && typeof (item as SavedArchieAnswer).answer === 'string'
    ));
  } catch {
    return [];
  }
}

export function findSavedArchieAnswer(question: string, scope = 'general'): string | null {
  const normalisedQuestion = normalise(question);
  if (normalisedQuestion.length < 4) return null;
  const normalisedScope = normaliseScope(scope);
  return readCache().find((item) => (
    normalise(item.question) === normalisedQuestion
    && normaliseScope(item.scope) === normalisedScope
  ))?.answer ?? null;
}

export function rememberCloudArchieAnswer(question: string, answer: string, scope = 'general'): void {
  if (typeof window === 'undefined' || !isSafeToStore(question, answer)) return;
  try {
    const normalisedQuestion = normalise(question);
    const normalisedScope = normaliseScope(scope);
    const deduplicated = readCache().filter((item) => (
      normalise(item.question) !== normalisedQuestion || normaliseScope(item.scope) !== normalisedScope
    ));
    deduplicated.unshift({ question: question.trim(), answer: answer.trim(), scope: normalisedScope });
    localStorage.setItem(CACHE_KEY, JSON.stringify(deduplicated.slice(0, MAX_ITEMS)));
  } catch {
    // Cache storage is optional and must not affect the answer shown to a child.
  }
}

export function clearSavedArchieAnswers(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(CACHE_KEY);
}
