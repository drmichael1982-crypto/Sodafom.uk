/** Family tracking only. Chore points are not game stars, vouchers or money. */
export type RewardType = 'money' | 'points';
export type Recurrence = 'once' | 'daily' | 'weekly';
export type ReviewStatus = 'waiting_for_parent' | 'approved' | 'needs_work';
export type Chore = {
  id: number; childId: number; title: string; valuePence: number; rewardPoints: number;
  rewardType: RewardType; recurrence: Recurrence; startsOn: string | null;
  active: boolean; createdAt: Date | string | null;
};
export type Completion = {
  id: number; choreId: number; childId: number; status: ReviewStatus;
  occurrenceKey: string | null; titleSnapshot: string | null;
  rewardTypeSnapshot: RewardType | null; valuePenceSnapshot: number | null;
  rewardPointsSnapshot: number | null; completedAt: Date | string | null;
  approvedAt: Date | string | null; reviewedAt: Date | string | null; parentNote: string | null;
};
export type ChoreView = Chore & {
  occurrenceKey: string | null; state: 'upcoming' | 'available' | 'paused' | ReviewStatus;
  canComplete: boolean;
  submittedReward: { title: string; label: string | null; parentNote: string | null } | null;
};
export type ChoresData = {
  version: 2;
  child: { id: number; name: string; ageGroup: string }; today: string;
  chores: ChoreView[]; completions: Completion[]; pending: Completion[];
  historyCursor: number | null;
  totals: { moneyPence: number; points: number; approvedCount: number; unknownApprovedCount: number };
};
export class ChoreError extends Error {
  constructor(public readonly status: number, message: string) { super(message); this.name = 'ChoreError'; }
}
export function idNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) throw new ChoreError(400, 'A valid profile or chore is required.');
  return value;
}
export function queryId(value: unknown): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) throw new ChoreError(400, 'A valid profile or history page is required.');
  return idNumber(Number(value));
}
export function cleanText(value: unknown, min: number, max: number): string {
  if (typeof value !== 'string' || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new ChoreError(400, 'Please use plain text.');
  const text = value.trim().replace(/\s+/g, ' ');
  if (text.length < min || text.length > max) throw new ChoreError(400, `Please enter ${min}–${max} characters.`);
  return text;
}
export function validDate(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ChoreError(400, 'Choose a valid start date.');
  const d = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value) throw new ChoreError(400, 'Choose a valid start date.');
  return value;
}
export function familyDate(value: Date | string = new Date()): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new ChoreError(400, 'Invalid date.');
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type: string) => parts.find(p => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${validDate(date)}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}
export function occurrenceKey(chore: Pick<Chore, 'startsOn' | 'createdAt' | 'recurrence'>, today: string): string | null {
  validDate(today);
  const start = chore.startsOn ? validDate(chore.startsOn) : chore.createdAt ? familyDate(chore.createdAt) : today;
  if (today < start) return null;
  if (chore.recurrence === 'once') return 'once';
  if (chore.recurrence === 'daily') return `day:${today}`;
  if (chore.recurrence !== 'weekly') throw new ChoreError(400, 'Unknown chore schedule.');
  const days = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000);
  return `week:${addDays(start, Math.floor(days / 7) * 7)}`;
}
export function rewardFields(type: unknown, value: unknown): { rewardType: RewardType; valuePence: number; rewardPoints: number } {
  if (type !== 'money' && type !== 'points') throw new ChoreError(400, 'Choose pocket money or chore points.');
  const max = type === 'money' ? 100000 : 10000;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > max) throw new ChoreError(400, 'Enter a valid non-negative reward within the displayed limit.');
  return { rewardType: type, valuePence: type === 'money' ? value : 0, rewardPoints: type === 'points' ? value : 0 };
}
/** Parse pounds without floating-point rounding or accepting exponents/NaN. */
export function parseReward(value: string, type: RewardType): number {
  if (type === 'points') {
    if (!/^\d{1,5}$/.test(value)) throw new ChoreError(400, 'Use whole chore points.');
    return rewardFields(type, Number(value)).rewardPoints;
  }
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(value)) throw new ChoreError(400, 'Use pounds and at most two decimal places.');
  const [pounds, pence = ''] = value.split('.');
  return rewardFields(type, Number(pounds) * 100 + Number(pence.padEnd(2, '0'))).valuePence;
}
export function rewardLabel(type: RewardType, pence: number, points: number): string {
  return type === 'money' ? `£${(pence / 100).toFixed(2)}` : `${points} chore ${points === 1 ? 'point' : 'points'}`;
}
export function hasSnapshot(row: Completion): boolean {
  return row.rewardTypeSnapshot === 'money' ? Number.isSafeInteger(row.valuePenceSnapshot) && row.valuePenceSnapshot! >= 0
    : row.rewardTypeSnapshot === 'points' && Number.isSafeInteger(row.rewardPointsSnapshot) && row.rewardPointsSnapshot! >= 0;
}
export function snapshot(job: Chore) {
  return { titleSnapshot: job.title, rewardTypeSnapshot: job.rewardType, valuePenceSnapshot: job.valuePence, rewardPointsSnapshot: job.rewardPoints };
}
function inOccurrence(row: Completion, job: Chore, key: string): boolean {
  if (row.occurrenceKey) return row.occurrenceKey === key;
  // Legacy records have no period or reward snapshot. Never invent their value.
  if (key === 'once') return true;
  return !!row.completedAt && occurrenceKey(job, familyDate(row.completedAt)) === key;
}
export function choreView(job: Chore, rows: Completion[], today: string): ChoreView {
  const key = occurrenceKey(job, today);
  const mine = rows.filter(r => r.choreId === job.id);
  const waiting = mine.some(r => r.status === 'waiting_for_parent');
  const current = key ? mine.filter(r => inOccurrence(r, job, key)) : [];
  const state = waiting ? 'waiting_for_parent' : !job.active ? 'paused' : !key ? 'upcoming'
    : current.some(r => r.status === 'approved') ? 'approved'
    : current.some(r => r.status === 'needs_work') ? 'needs_work' : 'available';
  const selected = mine.find(r => r.status === 'waiting_for_parent')
    ?? current.find(r => r.status === 'approved') ?? current.find(r => r.status === 'needs_work');
  const submittedReward = selected ? {
    title: selected.titleSnapshot ?? job.title,
    label: hasSnapshot(selected) ? rewardLabel(selected.rewardTypeSnapshot!, selected.valuePenceSnapshot ?? 0, selected.rewardPointsSnapshot ?? 0) : null,
    parentNote: selected.parentNote,
  } : null;
  return { ...job, occurrenceKey: key, state, submittedReward, canComplete: job.active && (state === 'available' || state === 'needs_work') };
}
export function completionPlan(job: Chore, rows: Completion[], today: string, requestedKey: string) {
  const view = choreView(job, rows, today);
  if (!view.canComplete || view.occurrenceKey !== requestedKey) throw new ChoreError(409, 'This chore has changed, is not due, or is already submitted. Refresh your chores.');
  const retry = rows.find(r => r.choreId === job.id && r.status === 'needs_work' && inOccurrence(r, job, requestedKey));
  return { retryId: retry?.id, occurrenceKey: requestedKey, ...(retry && hasSnapshot(retry) ? {
    titleSnapshot: retry.titleSnapshot, rewardTypeSnapshot: retry.rewardTypeSnapshot,
    valuePenceSnapshot: retry.valuePenceSnapshot, rewardPointsSnapshot: retry.rewardPointsSnapshot,
  } : snapshot(job)), status: 'waiting_for_parent' as const, approvedAt: null, reviewedAt: null, parentNote: null };
}
export function reviewPlan(row: Completion, job: Chore, approve: boolean, note: string, confirmLegacyValue: boolean, now: Date) {
  if (row.status !== 'waiting_for_parent') throw new ChoreError(409, 'This job has already been reviewed.');
  if (approve && !hasSnapshot(row) && !confirmLegacyValue) throw new ChoreError(400, 'Confirm the reward shown for this older job before approving.');
  return { ...(approve && !hasSnapshot(row) ? snapshot(job) : {}), status: approve ? 'approved' as const : 'needs_work' as const,
    approvedAt: approve ? now : null, reviewedAt: now, parentNote: approve ? null : cleanText(note, 1, 240) };
}
export type ChoreAction =
  | { action: 'create'; childId: number; title: string; rewardType: RewardType; valuePence: number; rewardPoints: number; recurrence: Recurrence; startsOn: string }
  | { action: 'update'; choreId: number; title: string; rewardType: RewardType; valuePence: number; rewardPoints: number }
  | { action: 'set-active'; choreId: number; active: boolean }
  | { action: 'complete'; choreId: number; occurrenceKey: string }
  | { action: 'approve'; completionId: number; confirmLegacyValue: boolean }
  | { action: 'return'; completionId: number; parentNote: string };
export function parseAction(input: unknown, today: string): ChoreAction {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ChoreError(400, 'Invalid chore request.');
  const body = input as Record<string, unknown>;
  const allowed: Record<string, string[]> = {
    create: ['childId', 'title', 'rewardType', 'rewardValue', 'recurrence', 'startsOn', 'safetyConfirmed'],
    update: ['choreId', 'title', 'rewardType', 'rewardValue', 'safetyConfirmed'],
    'set-active': ['choreId', 'active'], complete: ['choreId', 'occurrenceKey'],
    approve: ['completionId', 'confirmLegacyValue'], return: ['completionId', 'parentNote'],
  };
  if (typeof body.action !== 'string' || !Object.hasOwn(allowed, body.action)) throw new ChoreError(400, 'Unknown chore action.');
  const keys = ['action', ...allowed[body.action], ...(body.action === 'complete' ? [] : ['parentPassword'])];
  if (Object.keys(body).some(key => !keys.includes(key))) throw new ChoreError(400, 'Unexpected chore fields.');
  if (body.action === 'create' || body.action === 'update') {
    if (body.safetyConfirmed !== true) throw new ChoreError(400, 'A parent must confirm this job is suitable and safe for their child.');
    const common = { title: cleanText(body.title, 2, 120), ...rewardFields(body.rewardType, body.rewardValue) };
    if (body.action === 'update') return { action: 'update', choreId: idNumber(body.choreId), ...common };
    if (!['once', 'daily', 'weekly'].includes(String(body.recurrence))) throw new ChoreError(400, 'Choose a valid repeat schedule.');
    const startsOn = validDate(body.startsOn);
    if (startsOn < today || startsOn > addDays(today, 365)) throw new ChoreError(400, 'Choose a start date from today to one year ahead.');
    return { action: 'create', childId: idNumber(body.childId), ...common, startsOn, recurrence: body.recurrence as Recurrence };
  }
  if (body.action === 'set-active') {
    if (typeof body.active !== 'boolean') throw new ChoreError(400, 'Choose pause or resume.');
    return { action: 'set-active', choreId: idNumber(body.choreId), active: body.active };
  }
  if (body.action === 'complete') return { action: 'complete', choreId: idNumber(body.choreId), occurrenceKey: cleanText(body.occurrenceKey, 1, 32) };
  if (body.action === 'approve') {
    if (body.confirmLegacyValue !== undefined && typeof body.confirmLegacyValue !== 'boolean') throw new ChoreError(400, 'Invalid reward confirmation.');
    return { action: 'approve', completionId: idNumber(body.completionId), confirmLegacyValue: body.confirmLegacyValue === true };
  }
  return { action: 'return', completionId: idNumber(body.completionId), parentNote: cleanText(body.parentNote, 1, 240) };
}
export const CHORE_IDEAS = [
  { title: 'Put toys back in their box', minimumAge: 5 },
  { title: 'Pair clean socks', minimumAge: 5 },
  { title: 'Put napkins on the table', minimumAge: 5 },
  { title: 'Fold small clean towels', minimumAge: 8 },
  { title: 'Help an adult water a plant', minimumAge: 8 },
  { title: 'Sort clean laundry with an adult', minimumAge: 11 },
];
export function choreIdeas(ageGroup: string) {
  const minimum = ({ '5-7': 5, '8-10': 8, '11-13': 11 } as Record<string, number>)[ageGroup] ?? 5;
  return CHORE_IDEAS.filter(idea => idea.minimumAge <= minimum);
}
