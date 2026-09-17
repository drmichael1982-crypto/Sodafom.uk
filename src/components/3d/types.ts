import type { CSSProperties, ReactNode } from "react";
import type { RootState } from "@react-three/fiber";

export type ThreeVector3 = [number, number, number];
export type ReducedMotionPreference = "system" | "always" | "never";
export type ThreeFrameloop = "always" | "demand" | "never";
export type ThreeDpr = number | [number, number];

export interface ThreeCameraConfig {
  position?: ThreeVector3;
  fov?: number;
  near?: number;
  far?: number;
}

export interface ThreeLightingConfig {
  ambientIntensity?: number;
  directionalIntensity?: number;
  directionalPosition?: ThreeVector3;
}

export interface ThreeControlsConfig {
  enabled?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export interface ThreeCanvasShellProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  camera?: ThreeCameraConfig;
  lighting?: ThreeLightingConfig | false;
  controls?: ThreeControlsConfig | false;
  dpr?: ThreeDpr;
  frameloop?: ThreeFrameloop;
  shadows?: boolean;
  reducedMotion?: ReducedMotionPreference;
  onCreated?: (state: RootState) => void;
}

export interface ThreeSceneRigProps {
  lighting?: ThreeLightingConfig | false;
  controls?: ThreeControlsConfig | false;
  reducedMotion?: boolean;
  shadows?: boolean;
}
