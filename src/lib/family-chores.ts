/**
 * Device-local family chore tracker.
 *
 * It deliberately does not call an API, connect to game stars, or move money.
 * A pocket-money amount is only a note for a grown-up to handle directly.
 */
export const FAMILY_CHORES_STORAGE_KEY = 'sodafom_family_chores_v2';
export const FAMILY_CHORES_CHANGE_EVENT = 'sodafom-family-chores-change';

export type RewardKind = 'points' | 'pocket-money';
export type ChoreStatus = 'ready' | 'waiting-for-parent' | 'approved' | 'needs-another-try' | 'archived';

export interface ChoreReward {
  kind: RewardKind;
  /** Whole family chore points; these never affect Sodafom game stars. */
  points: number;
  /** A family note in pence; no money is held, sent, or paid by Sodafom. */
  pence: number;
}

export interface FamilyChore {
  id: string;
  title: string;
  reward: ChoreReward;
  status: ChoreStatus;
  createdAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  parentNote?: string;
}

export interface NewFamilyChoreInput {
  title: string;
  rewardKind: RewardKind;
  rewardValue: string;
  safetyConfirmed: boolean;
}

export const SAFE_CHORE_IDEAS = [
  'Put toys back in their box',
  'Pair clean socks',
  'Put napkins on the table',
  'Put books back on the shelf',
  'Tidy art supplies',
  'Help an adult water a houseplant',
] as const;

const UNSAFE_CHORE_TERMS = /\b(knife|knives|oven|stove|hob|fire|flame|bleach|chemical|medicine|medication|road|traffic|electrical|plug|socket|heavy|ladder)\b/i;

function cleanText(value: string, maximum: number): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, maximum);
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function newId(now: Date): string {
  const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `family-chore-${now.getTime()}-${random}`;
}

export function parseRewardValue(rewardKind: RewardKind, value: string): ChoreReward {
  const cleaned = value.trim();
  if (rewardKind === 'points') {
    if (!/^\d{1,3}$/.test(cleaned)) throw new Error('Choose between 0 and 100 chore points.');
    const points = Number(cleaned);
    if (points > 100) throw new Error('Choose between 0 and 100 chore points.');
    return { kind: 'points', points, pence: 0 };
  }

  if (!/^\d{1,2}(?:\.\d{1,2})?$/.test(cleaned)) {
    throw new Error('Use a pocket-money note from £0.00 to £50.00.');
  }
  const [pounds, pennies = ''] = cleaned.split('.');
  const pence = Number(pounds) * 100 + Number(pennies.padEnd(2, '0'));
  if (!Number.isSafeInteger(pence) || pence < 0 || pence > 5_000) {
    throw new Error('Use a pocket-money note from £0.00 to £50.00.');
  }
  return { kind: 'pocket-money', points: 0, pence };
}

export function createFamilyChore(input: NewFamilyChoreInput, now = new Date()): FamilyChore {
  const title = cleanText(input.title, 80);
  if (title.length < 2) throw new Error('Add a short name for the chore.');
  if (UNSAFE_CHORE_TERMS.test(title)) {
    throw new Error('Choose a small, child-safe home task. Avoid heat, sharp items, chemicals, roads, heavy lifting and medicine.');
  }
  if (!input.safetyConfirmed) {
    throw new Error('A grown-up must confirm that this chore is safe and suitable.');
  }

  return {
    id: newId(now),
    title,
    reward: parseRewardValue(input.rewardKind, input.rewardValue),
    status: 'ready',
    createdAt: now.toISOString(),
  };
}

/** Child action: it never records a reward. A grown-up must review it first. */
export function submitFamilyChore(chores: FamilyChore[], choreId: string, now = new Date()): FamilyChore[] {
  return chores.map(chore => (
    chore.id === choreId && (chore.status === 'ready' || chore.status === 'needs-another-try')
      ? { ...chore, status: 'waiting-for-parent', submittedAt: now.toISOString(), parentNote: undefined }
      : chore
  ));
}

/** Grown-up action: a non-pending job cannot be approved twice. */
export function approveFamilyChore(chores: FamilyChore[], choreId: string, now = new Date()): FamilyChore[] {
  return chores.map(chore => (
    chore.id === choreId && chore.status === 'waiting-for-parent'
      ? { ...chore, status: 'approved', reviewedAt: now.toISOString() }
      : chore
  ));
}

/** Grown-up action: a short encouraging note is optional and device-local. */
export function returnFamilyChore(chores: FamilyChore[], choreId: string, note = ''): FamilyChore[] {
  const parentNote = cleanText(note, 160);
  return chores.map(chore => (
    chore.id === choreId && chore.status === 'waiting-for-parent'
      ? { ...chore, status: 'needs-another-try', reviewedAt: new Date().toISOString(), parentNote: parentNote || undefined }
      : chore
  ));
}

/** A parent can hide a finished or ready job without silently hiding a review request. */
export function archiveFamilyChore(chores: FamilyChore[], choreId: string): FamilyChore[] {
  return chores.map(chore => (
    chore.id === choreId && chore.status !== 'waiting-for-parent'
      ? { ...chore, status: 'archived' }
      : chore
  ));
}

export function formatFamilyReward(reward: ChoreReward): string {
  if (reward.kind === 'points') return `${reward.points} chore ${reward.points === 1 ? 'point' : 'points'}`;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(reward.pence / 100);
}

export function approvedRewardSummary(chores: FamilyChore[]): { points: number; pocketMoneyPence: number; approvedCount: number } {
  return chores.reduce((summary, chore) => {
    if (chore.status !== 'approved') return summary;
    return {
      points: summary.points + chore.reward.points,
      pocketMoneyPence: summary.pocketMoneyPence + chore.reward.pence,
      approvedCount: summary.approvedCount + 1,
    };
  }, { points: 0, pocketMoneyPence: 0, approvedCount: 0 });
}

function isChoreReward(value: unknown): value is ChoreReward {
  if (!value || typeof value !== 'object') return false;
  const reward = value as Partial<ChoreReward>;
  return (reward.kind === 'points' || reward.kind === 'pocket-money')
    && Number.isSafeInteger(reward.points) && (reward.points ?? -1) >= 0 && (reward.points ?? 0) <= 100
    && Number.isSafeInteger(reward.pence) && (reward.pence ?? -1) >= 0 && (reward.pence ?? 0) <= 5_000;
}

function isFamilyChore(value: unknown): value is FamilyChore {
  if (!value || typeof value !== 'object') return false;
  const chore = value as Partial<FamilyChore>;
  return typeof chore.id === 'string'
    && chore.id.length > 0
    && typeof chore.title === 'string'
    && chore.title.length >= 2
    && chore.title.length <= 80
    && !UNSAFE_CHORE_TERMS.test(chore.title)
    && isChoreReward(chore.reward)
    && ['ready', 'waiting-for-parent', 'approved', 'needs-another-try', 'archived'].includes(chore.status ?? '')
    && validDate(chore.createdAt)
    && (chore.submittedAt === undefined || validDate(chore.submittedAt))
    && (chore.reviewedAt === undefined || validDate(chore.reviewedAt))
    && (chore.parentNote === undefined || (typeof chore.parentNote === 'string' && chore.parentNote.length <= 160));
}

export function loadFamilyChores(storage?: Pick<Storage, 'getItem'>): FamilyChore[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(FAMILY_CHORES_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isFamilyChore) : [];
  } catch {
    return [];
  }
}

export function saveFamilyChores(chores: FamilyChore[], storage?: Pick<Storage, 'setItem'>): void {
  if (!storage) return;
  storage.setItem(FAMILY_CHORES_STORAGE_KEY, JSON.stringify(chores));
}
