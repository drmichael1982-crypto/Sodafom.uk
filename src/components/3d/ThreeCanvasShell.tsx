import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { ThreeSceneErrorBoundary } from "./ThreeSceneErrorBoundary";
import { DEFAULT_THREE_LIGHTING, ThreeSceneRig } from "./ThreeSceneRig";
import type { ThreeCameraConfig, ThreeCanvasShellProps } from "./types";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export const DEFAULT_THREE_CAMERA: Required<ThreeCameraConfig> = {
  position: [0, 2.6, 7.5],
  fov: 50,
  near: 0.1,
  far: 1000,
};

const DEFAULT_DPR: [number, number] = [1, 1.5];

export function ThreeCanvasShell({
  children,
  fallback,
  className,
  style,
  ariaLabel = "Interactive 3D scene",
  camera,
  lighting = DEFAULT_THREE_LIGHTING,
  controls,
  dpr = DEFAULT_DPR,
  frameloop,
  shadows = false,
  reducedMotion = "system",
  onCreated,
}: ThreeCanvasShellProps) {
  const prefersReducedMotion = usePrefersReducedMotion(reducedMotion);
  const resolvedCamera = { ...DEFAULT_THREE_CAMERA, ...camera };
  const resolvedFrameloop = frameloop ?? (prefersReducedMotion ? "demand" : "always");

  return (
    <ThreeSceneErrorBoundary fallback={fallback}>
      <div
        aria-label={ariaLabel}
        className={className}
        style={{ height: "100%", minHeight: 1, width: "100%", ...style }}
      >
        <Canvas
          camera={resolvedCamera}
          dpr={dpr}
          fallback={
            fallback ?? (
              <div role="status" aria-live="polite">
                3D view is unavailable on this device.
              </div>
            )
          }
          frameloop={resolvedFrameloop}
          gl={{
            alpha: true,
            antialias: !prefersReducedMotion,
            powerPreference: "high-performance",
          }}
          onCreated={onCreated}
          shadows={shadows}
        >
          <Suspense fallback={null}>
            <ThreeSceneRig
              controls={controls}
              lighting={lighting}
              reducedMotion={prefersReducedMotion}
              shadows={shadows}
            />
            {children}
          </Suspense>
        </Canvas>
      </div>
    </ThreeSceneErrorBoundary>
  );
}
