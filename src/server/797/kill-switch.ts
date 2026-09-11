let killed = false;
let killedAt: string | null = null;
let killedBy: string | null = null;

export interface KillSwitchState {
  killed: boolean;
  killedAt: string | null;
  killedBy: string | null;
}

export function getKillSwitchState(): KillSwitchState {
  return { killed, killedAt, killedBy };
}

export function activateKillSwitch(actor: string): KillSwitchState {
  killed = true;
  killedAt = new Date().toISOString();
  killedBy = actor || 'owner';
  return getKillSwitchState();
}

export function clearKillSwitch(ownerAuthenticated: boolean): KillSwitchState {
  if (!ownerAuthenticated) {
    throw new Error('Owner authentication required to re-enable 797');
  }
  killed = false;
  killedAt = null;
  killedBy = null;
  return getKillSwitchState();
}

export function assert797Enabled(): void {
  if (killed) {
    const error = new Error('Sodafoam Systems 797 is disabled by owner kill switch');
    (error as Error & { code?: string }).code = 'SODAFOAM_797_KILLED';
    throw error;
  }
}
