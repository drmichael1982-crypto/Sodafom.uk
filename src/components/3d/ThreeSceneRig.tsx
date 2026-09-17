import { OrbitControls } from "@react-three/drei";

import type {
  ThreeControlsConfig,
  ThreeLightingConfig,
  ThreeSceneRigProps,
} from "./types";

export const DEFAULT_THREE_LIGHTING: Required<ThreeLightingConfig> = {
  ambientIntensity: 0.65,
  directionalIntensity: 1.15,
  directionalPosition: [5, 8, 6],
};

export const DEFAULT_THREE_CONTROLS: Required<ThreeControlsConfig> = {
  enabled: true,
  enablePan: false,
  enableZoom: true,
  enableRotate: true,
  minDistance: 2.5,
  maxDistance: 16,
  minPolarAngle: 0.15,
  maxPolarAngle: Math.PI / 2.02,
  autoRotate: false,
  autoRotateSpeed: 0.4,
};

export function ThreeSceneRig({
  lighting = DEFAULT_THREE_LIGHTING,
  controls = DEFAULT_THREE_CONTROLS,
  reducedMotion = false,
  shadows = false,
}: ThreeSceneRigProps) {
  const resolvedLighting =
    lighting === false ? null : { ...DEFAULT_THREE_LIGHTING, ...lighting };
  const resolvedControls =
    controls === false ? null : { ...DEFAULT_THREE_CONTROLS, ...controls };

  return (
    <>
      {resolvedLighting ? (
        <>
          <ambientLight intensity={resolvedLighting.ambientIntensity} />
          <directionalLight
            castShadow={shadows}
            intensity={resolvedLighting.directionalIntensity}
            position={resolvedLighting.directionalPosition}
          />
        </>
      ) : null}

      {resolvedControls?.enabled ? (
        <OrbitControls
          autoRotate={!reducedMotion && resolvedControls.autoRotate}
          autoRotateSpeed={resolvedControls.autoRotateSpeed}
          enableDamping={!reducedMotion}
          enablePan={resolvedControls.enablePan}
          enableRotate={resolvedControls.enableRotate}
          enableZoom={resolvedControls.enableZoom}
          maxDistance={resolvedControls.maxDistance}
          maxPolarAngle={resolvedControls.maxPolarAngle}
          minDistance={resolvedControls.minDistance}
          minPolarAngle={resolvedControls.minPolarAngle}
          makeDefault
        />
      ) : null}
    </>
  );
}
