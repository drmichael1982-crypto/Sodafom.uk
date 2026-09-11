export const CHORES_STORAGE_KEY = 'sodafom_family_chores_v1';

export type ChoreStatus = 'assigned' | 'waiting-for-parent' | 'approved';

export interface FamilyChore {
  id: string;
  childName: string;
  title: string;
  rewardPence: number;
  status: ChoreStatus;
  createdAt: string;
  completedAt?: string;
  approvedAt?: string;
}

export interface NewChoreInput {
  childName: string;
  title: string;
  rewardPounds: number;
}

const cleanText = (value: string, maximum: number) => value.trim().replace(/\s+/g, ' ').slice(0, maximum);

export function createFamilyChore(input: NewChoreInput, now = new Date()): FamilyChore {
  const childName = cleanText(input.childName, 50);
  const title = cleanText(input.title, 100);
  const rewardPence = Math.round(Number(input.rewardPounds) * 100);

  if (!childName) throw new Error('Choose the child who will do this chore.');
  if (!title) throw new Error('Add a short name for the chore.');
  if (!Number.isFinite(rewardPence) || rewardPence < 0 || rewardPence > 100_000) {
    throw new Error('Choose a reward between £0 and £1,000.');
  }

  const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  return {
    id: `${now.getTime()}-${randomPart}`,
    childName,
    title,
    rewardPence,
    status: 'assigned',
    createdAt: now.toISOString(),
  };
}

export function markFamilyChoreComplete(chores: FamilyChore[], id: string, now = new Date()): FamilyChore[] {
  return chores.map(chore => chore.id === id && chore.status === 'assigned'
    ? { ...chore, status: 'waiting-for-parent', completedAt: now.toISOString() }
    : chore);
}

export function approveFamilyChore(chores: FamilyChore[], id: string, now = new Date()): FamilyChore[] {
  return chores.map(chore => chore.id === id && chore.status === 'waiting-for-parent'
    ? { ...chore, status: 'approved', approvedAt: now.toISOString() }
    : chore);
}

export function returnFamilyChore(chores: FamilyChore[], id: string): FamilyChore[] {
  return chores.map(chore => chore.id === id && chore.status === 'waiting-for-parent'
    ? { ...chore, status: 'assigned', completedAt: undefined }
    : chore);
}

export function removeFamilyChore(chores: FamilyChore[], id: string): FamilyChore[] {
  return chores.filter(chore => chore.id !== id);
}

function isFamilyChore(value: unknown): value is FamilyChore {
  if (!value || typeof value !== 'object') return false;
  const chore = value as Partial<FamilyChore>;
  return typeof chore.id === 'string'
    && typeof chore.childName === 'string'
    && typeof chore.title === 'string'
    && typeof chore.rewardPence === 'number'
    && ['assigned', 'waiting-for-parent', 'approved'].includes(chore.status ?? '')
    && typeof chore.createdAt === 'string';
}

export function loadFamilyChores(storage?: Pick<Storage, 'getItem'>): FamilyChore[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(CHORES_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isFamilyChore) : [];
  } catch {
    return [];
  }
}

export function saveFamilyChores(chores: FamilyChore[], storage?: Pick<Storage, 'setItem'>): void {
  if (!storage) return;
  storage.setItem(CHORES_STORAGE_KEY, JSON.stringify(chores));
}

export function formatPocketMoney(rewardPence: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(rewardPence / 100);
}
