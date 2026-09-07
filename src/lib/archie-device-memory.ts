/**
 * Small on-device learning cache for Archie.
 * Stores general educational Q&A returned by Online Archie so repeated questions
 * can still be answered when the device is offline. This is a cache, not model training.
 */
export interface ArchieLearnedAnswer {
  q: string;
  a: string;
  savedAt: string;
}

const KEY = 'sodafom_archie_learned_answers_v1';
const MAX_ITEMS = 200;

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSafeToCache(question: string, answer: string): boolean {
  if (!question.trim() || !answer.trim()) return false;
  if (question.length > 400 || answer.length > 2500) return false;
  // Do not cache likely credentials/private account details.
  if (/password|passcode|api\s*key|secret|credit\s*card|bank\s*account|email\s*address/i.test(question)) return false;
  if (/my name is|i am called|call me/i.test(question)) return false;
  return true;
}

export function loadLearnedAnswers(): ArchieLearnedAnswer[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(item => item?.q && item?.a) : [];
  } catch {
    return [];
  }
}

export function rememberOnlineAnswer(question: string, answer: string): void {
  if (typeof window === 'undefined' || !isSafeToCache(question, answer)) return;
  try {
    const q = normalise(question);
    const existing = loadLearnedAnswers().filter(item => normalise(item.q) !== q);
    existing.unshift({ q: question.trim(), a: answer.trim(), savedAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(existing.slice(0, MAX_ITEMS)));
  } catch { /* storage unavailable */ }
}

export function findLearnedAnswer(question: string): string | null {
  const q = normalise(question);
  if (q.length < 4) return null;
  const exact = loadLearnedAnswers().find(item => normalise(item.q) === q);
  if (exact) return exact.a;

  // Conservative near-match: only reuse when most meaningful words overlap.
  const words = new Set(q.split(' ').filter(w => w.length > 3));
  if (words.size < 3) return null;
  let best: { score: number; answer: string } | null = null;
  for (const item of loadLearnedAnswers()) {
    const candidate = new Set(normalise(item.q).split(' ').filter(w => w.length > 3));
    const shared = [...words].filter(w => candidate.has(w)).length;
    const score = shared / Math.max(words.size, candidate.size, 1);
    if (score >= 0.8 && (!best || score > best.score)) best = { score, answer: item.a };
  }
  return best?.answer ?? null;
}

export function clearLearnedAnswers(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
