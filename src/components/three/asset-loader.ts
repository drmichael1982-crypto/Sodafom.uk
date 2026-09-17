import { useGLTF } from '@react-three/drei';
import type { MovementId } from '@/lib/visual-world';
import type { SodafomModelAsset } from './types';

const GLTF_URL_PATTERN = /\.(?:glb|gltf)(?:[?#].*)?$/i;

export function assertSodafomModelAsset(
  asset: SodafomModelAsset,
): SodafomModelAsset {
  if (!asset.id.trim()) {
    throw new Error('Sodafom 3D assets require a non-empty id.');
  }

  if (!GLTF_URL_PATTERN.test(asset.url)) {
    throw new Error(
      `Sodafom 3D asset "${asset.id}" must use a .glb or .gltf URL.`,
    );
  }

  return asset;
}

export function getMovementClipName(
  asset: SodafomModelAsset,
  movementId: MovementId,
): string | undefined {
  return asset.movementClips?.[movementId];
}

export function useSodafomModel(asset: SodafomModelAsset) {
  assertSodafomModelAsset(asset);
  return useGLTF(asset.url);
}

export function preloadSodafomModel(asset: SodafomModelAsset): void {
  assertSodafomModelAsset(asset);
  useGLTF.preload(asset.url);
}

export function clearSodafomModel(asset: SodafomModelAsset): void {
  assertSodafomModelAsset(asset);
  useGLTF.clear(asset.url);
}
