export type HealingStatus = 'healthy' | 'degraded' | 'failed';

export interface HealthCheckResult {
  name: string;
  status: HealingStatus;
  detail?: string;
  checkedAt: string;
}

export interface HealingSummary {
  status: HealingStatus;
  checks: HealthCheckResult[];
  safeToContinue: boolean;
  suggestedAction: 'none' | 'restart-component' | 'rollback' | 'request-approval';
}

function worstStatus(checks: HealthCheckResult[]): HealingStatus {
  if (checks.some((check) => check.status === 'failed')) return 'failed';
  if (checks.some((check) => check.status === 'degraded')) return 'degraded';
  return 'healthy';
}

export async function run797HealthChecks(): Promise<HealingSummary> {
  const now = new Date().toISOString();
  const checks: HealthCheckResult[] = [];

  checks.push({
    name: 'process',
    status: 'healthy',
    detail: `pid=${process.pid} uptime=${Math.round(process.uptime())}s`,
    checkedAt: now,
  });

  checks.push({
    name: 'memory',
    status: process.memoryUsage().heapUsed < process.memoryUsage().heapTotal * 0.9 ? 'healthy' : 'degraded',
    detail: `heapUsed=${process.memoryUsage().heapUsed} heapTotal=${process.memoryUsage().heapTotal}`,
    checkedAt: now,
  });

  const status = worstStatus(checks);

  return {
    status,
    checks,
    safeToContinue: status !== 'failed',
    suggestedAction: status === 'healthy' ? 'none' : status === 'degraded' ? 'restart-component' : 'request-approval',
  };
}

export function canApplyPermanentRepair(ownerApproved: boolean): boolean {
  return ownerApproved === true;
}
