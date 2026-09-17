import type { CSSProperties, ReactNode } from 'react';
import type { MovementId } from '@/lib/visual-world';

export type Sodafom3DQuality = 'auto' | 'low' | 'balanced' | 'high';
export type ResolvedSodafom3DQuality = Exclude<Sodafom3DQuality, 'auto'>;
export type Sodafom3DRenderMode = 'auto' | 'webgl' | 'fallback';

export type SodafomMovementClipMap = Partial<Record<MovementId, string>>;

export interface SodafomModelAsset {
  id: string;
  url: string;
  movementClips?: SodafomMovementClipMap;
}

export interface Sodafom3DEnvironment {
  paused: boolean;
  reducedMotion: boolean;
  lowPowerMode: boolean;
  quality: ResolvedSodafom3DQuality;
}

export interface Sodafom3DWorldProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  paused?: boolean;
  reducedMotion?: boolean;
  lowPowerMode?: boolean;
  quality?: Sodafom3DQuality;
  renderMode?: Sodafom3DRenderMode;
  loadingFallback?: ReactNode;
  accessibilityFallback?: ReactNode;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
}
