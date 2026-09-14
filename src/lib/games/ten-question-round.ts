/** Finite rounds: exhaust unseen content before recycling, never repeat within ten. */
export const ROUND_LENGTH = 10;
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function selectRound<T>(bank: readonly T[], key: (q: T) => string, seen: ReadonlySet<string> = new Set(), random = Math.random): T[] {
  const unique = [...new Map(bank.map(q => [key(q), q])).values()];
  if (unique.length < ROUND_LENGTH) throw new Error('A round needs at least ten distinct questions');
  const fresh = shuffle(unique.filter(q => !seen.has(key(q))), random);
  const recycled = shuffle(unique.filter(q => seen.has(key(q))), random);
  return [...fresh, ...recycled].slice(0, ROUND_LENGTH);
}
export function nextRound<T>(bank: readonly T[], key: (q: T) => string, sessionKey: string): T[] {
  const storageKey = `sodafom_round_${sessionKey}`;
  let seen = new Set<string>();
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    if (Array.isArray(stored)) seen = new Set(stored.filter((x): x is string => typeof x === 'string'));
  } catch { /* Storage is optional. */ }
  const round = selectRound(bank, key, seen);
  if (bank.every(q => seen.has(key(q)))) seen.clear();
  round.forEach(q => seen.add(key(q)));
  try { localStorage.setItem(storageKey, JSON.stringify([...seen].slice(-1000))); } catch { /* Storage is optional. */ }
  return round;
}
export function roundResult(correct: number, total = ROUND_LENGTH) {
  const score = Math.round(correct / total * 100);
  return { score, correct, total, stars: score >= 90 ? 3 : score >= 75 ? 2 : score >= 50 ? 1 : 0 };
}
