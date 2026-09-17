import type { ResolvedSodafom3DQuality, Sodafom3DQuality } from './types';

interface NavigatorWithDeviceHints extends Navigator {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
}

export interface Sodafom3DQualitySettings {
  dpr: number | [number, number];
  antialias: boolean;
  shadows: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
}

export function detectLowPowerMode(): boolean {
  if (typeof navigator === 'undefined') return false;

  const deviceNavigator = navigator as NavigatorWithDeviceHints;
  const saveData = deviceNavigator.connection?.saveData === true;
  const lowMemory =
    typeof deviceNavigator.deviceMemory === 'number' &&
    deviceNavigator.deviceMemory <= 4;
  const lowConcurrency =
    typeof deviceNavigator.hardwareConcurrency === 'number' &&
    deviceNavigator.hardwareConcurrency <= 4;
  const slowConnection = ['slow-2g', '2g'].includes(
    deviceNavigator.connection?.effectiveType ?? '',
  );

  return saveData || lowMemory || lowConcurrency || slowConnection;
}

export function resolveSodafom3DQuality(
  requested: Sodafom3DQuality,
  lowPowerMode: boolean,
): ResolvedSodafom3DQuality {
  if (lowPowerMode) return 'low';
  if (requested === 'auto') return 'balanced';
  return requested;
}

export function getSodafom3DQualitySettings(
  quality: ResolvedSodafom3DQuality,
): Sodafom3DQualitySettings {
  switch (quality) {
    case 'low':
      return {
        dpr: 1,
        antialias: false,
        shadows: false,
        powerPreference: 'low-power',
      };
    case 'high':
      return {
        dpr: [1, 2],
        antialias: true,
        shadows: true,
        powerPreference: 'high-performance',
      };
    case 'balanced':
    default:
      return {
        dpr: [1, 1.5],
        antialias: true,
        shadows: true,
        powerPreference: 'default',
      };
  }
}
