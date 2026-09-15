/** Validation shared only by the existing child progress persistence routes. */
const MYSQL_INT_MAX = 2_147_483_647;

export function childIdFromParam(value: unknown): number | null {
  const raw = Array.isArray(value) && value.length === 1 ? value[0] : value;
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id <= MYSQL_INT_MAX ? id : null;
}

export function gameSlugFromParam(value: unknown): string | null {
  const raw = Array.isArray(value) && value.length === 1 ? value[0] : value;
  return typeof raw === 'string' && raw.length > 0 && raw.length <= 64
    && raw.trim() === raw && !/[\u0000-\u001f\u007f]/.test(raw) ? raw : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unsignedInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
    && value >= 0 && value <= MYSQL_INT_MAX;
}

export function starsFromBody(body: unknown): number | null {
  return isRecord(body) && unsignedInt(body.stars) && body.stars <= 3 ? body.stars : null;
}

export interface ProgressInput {
  subject: string;
  activityId: string;
  activityTitle: string;
  score: number;
  maxScore: number;
  durationSeconds: number;
}

export function progressFromBody(body: unknown): ProgressInput | null {
  if (!isRecord(body)) return null;
  const { subject, activityId, activityTitle } = body;
  const score = body.score ?? 0;
  const maxScore = body.maxScore ?? 100;
  const durationSeconds = body.durationSeconds ?? 0;
  if (typeof subject !== 'string' || !subject.trim() || subject.length > 32
    || typeof activityId !== 'string' || !activityId.trim() || activityId.length > 64
    || typeof activityTitle !== 'string' || !activityTitle.trim() || activityTitle.length > 255
    || !unsignedInt(score) || !unsignedInt(maxScore) || score > maxScore
    || !unsignedInt(durationSeconds)) return null;
  return { subject, activityId, activityTitle, score, maxScore, durationSeconds };
}

export function starsForScore(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  const pct = (score / maxScore) * 100;
  return pct >= 90 ? 3 : pct >= 75 ? 2 : pct >= 50 ? 1 : 0;
}
