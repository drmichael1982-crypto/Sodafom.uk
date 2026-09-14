import * as T from 'three';
import { describe, expect, it, vi } from 'vitest';
import { disposeRoomObjects } from './create-scene';

describe('Three.js resource cleanup', () => {
  it('disposes shared geometries, materials and textures once and clears the scene', () => {
    const scene = new T.Scene();
    const geometry = new T.SphereGeometry(1, 8, 6);
    const texture = new T.Texture();
    const material = new T.MeshStandardMaterial({ map: texture });
    const spriteMaterial = new T.SpriteMaterial({ map: texture });
    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');
    const spriteDispose = vi.spyOn(spriteMaterial, 'dispose');
    const textureDispose = vi.spyOn(texture, 'dispose');
    scene.add(new T.Mesh(geometry, material), new T.Mesh(geometry, material), new T.Sprite(spriteMaterial));
    disposeRoomObjects(scene);
    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(spriteDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).toHaveBeenCalledTimes(1);
    expect(scene.children).toHaveLength(0);
  });
});
