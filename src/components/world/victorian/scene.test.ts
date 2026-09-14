import * as THREE from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHOPS } from '@/lib/world/shop-registry';
import { buildWorld } from './scene';

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), strokeRect: vi.fn(), fillText: vi.fn() } as unknown as CanvasRenderingContext2D);
});
afterEach(() => vi.restoreAllMocks());

describe('real Victorian scene geometry and raycasting', () => {
  it('builds each distinct interior with a central display and a clickable exit', () => {
    for (const shop of SHOPS) {
      const world = buildWorld(shop.id);
      let solids = 0;
      world.scene.traverse(object => { if (object instanceof THREE.Mesh && !(object.geometry instanceof THREE.PlaneGeometry)) solids++; });
      expect(solids).toBeGreaterThan(200);
      const camera = new THREE.PerspectiveCamera(43, 1, .1, 120);
      camera.position.set(4.6, 1.75, 2); camera.lookAt(4.6, 1.75, -3); camera.updateMatrixWorld(); world.scene.updateMatrixWorld(true);
      expect(world.activate(new THREE.Vector2(0, 0), camera)).toBe('street');
      world.dispose(); expect(world.scene.children).toHaveLength(0);
    }
  });
  it('raycasts the double-front sweet shop door and central jar display', () => {
    const street = buildWorld(null);
    const camera = new THREE.PerspectiveCamera(43, 1, .1, 120);
    camera.position.set(-15.6, 1.7, 8); camera.lookAt(-15.6, 1.7, 0); camera.updateMatrixWorld(); street.scene.updateMatrixWorld(true);
    expect(street.activate(new THREE.Vector2(0, 0), camera)).toBe('shop:sweet-shop');
    street.dispose();
    const interior = buildWorld('sweet-shop');
    camera.position.set(0, 1, 5); camera.lookAt(0, 1, 0); camera.updateMatrixWorld(); interior.scene.updateMatrixWorld(true);
    expect(interior.activate(new THREE.Vector2(0, 0), camera)).toBe('surprise');
    interior.dispose();
  });
});
