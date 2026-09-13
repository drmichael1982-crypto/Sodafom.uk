/** A deliberately small client contract for the authorised admin account list. */
export interface AdminAccount {
  id: string;
  name: string | null;
  email: string;
  createdAt: string | null;
}

export interface VisitCounts {
  trafficToday: number;
  trafficThisWeek: number;
  trafficThisMonth: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFiniteCount(value: unknown): number {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

/**
 * Limits and normalises server data before it reaches the account table.
 * No password, token, role, child, or subscription fields are accepted here.
 */
export function parseAdminAccounts(payload: unknown): AdminAccount[] {
  if (!isRecord(payload) || !Array.isArray(payload.users)) return [];

  return payload.users.slice(0, 100).flatMap((value): AdminAccount[] => {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.email !== 'string') return [];

    return [{
      id: value.id,
      name: typeof value.name === 'string' && value.name.trim() ? value.name : null,
      email: value.email,
      createdAt: typeof value.created_at === 'string'
        ? value.created_at
        : typeof value.createdAt === 'string'
          ? value.createdAt
          : null,
    }];
  });
}

export function normaliseVisitCounts(value: Partial<VisitCounts> | null | undefined): VisitCounts {
  return {
    trafficToday: toFiniteCount(value?.trafficToday),
    trafficThisWeek: toFiniteCount(value?.trafficThisWeek),
    trafficThisMonth: toFiniteCount(value?.trafficThisMonth),
  };
}

export function formatAdminAccountDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
