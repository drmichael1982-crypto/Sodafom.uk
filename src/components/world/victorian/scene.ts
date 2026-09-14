import * as THREE from 'three';
import { SHOPS, type ShopId } from '@/lib/world/shop-registry';
import type { Surprise } from './journey';

const RED = 0x701d2c, WOOD = 0x392018, GOLD = 0xd9b76c, CREAM = 0xffebbd;
const COLOURS = [0xf899b8, 0x83c5b5, 0xf5c352, 0x9997e9, 0xe97057];
export interface WorldScene {
  scene: THREE.Scene;
  target: THREE.Vector3;
  distance: number;
  activate: (pointer: THREE.Vector2, camera: THREE.Camera) => string | null;
  surprise: (kind: Surprise) => void;
  tick: (seconds: number, animate: boolean) => void;
  dispose: () => void;
}
export function buildWorld(shopId: ShopId | null): WorldScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(shopId ? 0x251c21 : 0xbfcfd2);
  scene.fog = new THREE.Fog(shopId ? 0x251c21 : 0xbfcfd2, 42, 95);
  scene.add(new THREE.HemisphereLight(0xfff5e0, 0x594248, 2.4));
  const sunlight = new THREE.DirectionalLight(0xffe1ae, 3.2);
  sunlight.position.set(-10, 18, 12); scene.add(sunlight);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const materialCache = new Map<number, THREE.MeshStandardMaterial>();
  function mat(colour: number) {
    let value = materialCache.get(colour);
    if (!value) { value = new THREE.MeshStandardMaterial({ color: colour, roughness: .72 }); materialCache.set(colour, value); materials.add(value); }
    return value;
  }
  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, action?: string) {
    geometries.add(geometry); materials.add(material);
    const item = new THREE.Mesh(geometry, material); item.position.set(x, y, z);
    if (action) item.userData.action = action;
    parent.add(item); return item;
  }
  function box(parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, colour: number, action?: string) {
    return mesh(parent, new THREE.BoxGeometry(w, h, d), mat(colour), x, y, z, action);
  }
  function ball(parent: THREE.Object3D, x: number, y: number, z: number, size: number, colour: number, action?: string) {
    return mesh(parent, new THREE.SphereGeometry(size, 12, 8), mat(colour), x, y, z, action);
  }
  function cylinder(parent: THREE.Object3D, x: number, y: number, z: number, radius: number, h: number, colour: number, action?: string) {
    return mesh(parent, new THREE.CylinderGeometry(radius, radius, h, 16), mat(colour), x, y, z, action);
  }
  function sign(parent: THREE.Object3D, title: string, x: number, y: number, z: number, width: number, height = .66, action?: string) {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 160;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#4f1824'; context.fillRect(0, 0, 1024, 160);
    context.strokeStyle = '#dabd7d'; context.lineWidth = 5; context.strokeRect(12, 12, 1000, 136);
    context.fillStyle = '#ffedbc'; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.font = 'bold 58px Georgia'; context.fillText(title, 512, 85, 950);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    mesh(parent, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }), x, y, z, action);
  }
  const display = new THREE.Group(); scene.add(display);
  const toy = new THREE.Group(); toy.position.set(shopId ? -3.6 : 3, .1, shopId ? .6 : 4); toy.visible = false; scene.add(toy);
  box(toy, 0, .42, 0, .65, .42, .9, 0x9c613b, 'surprise');
  ball(toy, 0, .87, .35, .35, 0xba8054, 'surprise');
  for (const x of [-.26, .26]) { box(toy, x, .2, .24, .17, .4, .17, WOOD); box(toy, x, 1, .3, .17, .4, .2, WOOD); ball(toy, x / 2, .94, .66, .045, 0x151515); }
  ball(toy, 0, .8, .71, .075, 0x151515);
  const star = mesh(scene, new THREE.OctahedronGeometry(.4), mat(GOLD), shopId ? 2.8 : -3, shopId ? 2.9 : 3, 2.5, 'surprise'); star.visible = false;
  function jar(parent: THREE.Object3D, x: number, y: number, z: number, index: number, scale = 1) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(scale); g.userData.action = 'surprise'; parent.add(g);
    const glass = new THREE.MeshStandardMaterial({ color: 0xd0e7ef, transparent: true, opacity: .19, depthWrite: false, roughness: .14 });
    mesh(g, new THREE.CylinderGeometry(.29, .29, .74, 16, 1, true), glass, 0, .37, 0);
    cylinder(g, 0, .02, 0, .3, .045, GOLD); cylinder(g, 0, .78, 0, .31, .09, GOLD); ball(g, 0, .87, 0, .07, GOLD);
    for (let n = 0; n < 9; n++) ball(g, Math.cos(n * 2.4) * .16, .12 + Math.floor(n / 3) * .17, Math.sin(n * 2.4) * .16, .1, COLOURS[(index + n) % COLOURS.length]);
  }
  function fixture(parent: THREE.Object3D, id: ShopId, x: number, y: number, z: number, index: number) {
    if (id === 'sweet-shop') { jar(parent, x, y, z, index); return; }
    const g = new THREE.Group(); g.position.set(x, y, z); g.userData.action = 'surprise'; parent.add(g);
    const colour = COLOURS[index % COLOURS.length];
    if (id === 'cake-and-pie') {
      cylinder(g, 0, .05, 0, .46, .08, CREAM); cylinder(g, 0, .25, 0, .37, .35, index % 2 ? 0xdca366 : 0xf5a9bf);
      cylinder(g, 0, .45, 0, .38, .07, CREAM); ball(g, 0, .55, 0, .09, RED);
    } else if (id === 'school-supplies') {
      for (let n = 0; n < 4; n++) box(g, 0, .09 + n * .12, 0, .65 - n * .04, .1, .47, COLOURS[(index + n) % 5]);
      cylinder(g, .4, .3, 0, .08, .6, GOLD);
    } else if (id === 'uniform-and-shoes') {
      if (index % 2) { const shoe = ball(g, 0, .17, .06, .3, WOOD); shoe.scale.set(1, .65, 1.65); box(g, 0, .07, .07, .52, .07, .82, GOLD); }
      else { box(g, 0, .4, 0, .48, .72, .2, colour); for (const side of [-1, 1]) { const sleeve = box(g, side * .31, .6, 0, .2, .45, .2, colour); sleeve.rotation.z = side * .4; } box(g, 0, .58, .12, .055, .3, .04, GOLD); }
    } else {
      box(g, 0, .3, 0, .62, .6, .57, colour); box(g, 0, .3, .3, .1, .62, .03, GOLD); box(g, 0, .62, 0, .65, .06, .6, GOLD);
      const bow = mesh(g, new THREE.TorusGeometry(.13, .04, 5, 12), mat(GOLD), .1, .74, 0); bow.rotation.y = .4;
    }
  }
  if (!shopId) {
    box(scene, 0, -.4, 0, 48, .5, 24, 0x6c777a); box(scene, 0, -.1, .8, 43, .3, 5, 0xc4bba6);
    for (let x = -20; x < 21; x += 2) box(scene, x, .065, 2.5, 1.96, .025, .12, 0x877f73);
    for (let z = 5; z < 12; z += 1.2) for (let x = -22; x < 23; x += 2.4) box(scene, x + (z % 2), -.125, z, 2.2, .045, 1, 0x7c8685);
    SHOPS.forEach((shop, index) => {
      const g = new THREE.Group(); g.position.x = (index - 2) * 7.8; scene.add(g); const action = `shop:${shop.id}`;
      box(g, 0, 3.4, -2.1, 7.5, 6.8, 4.4, index % 2 ? 0x925748 : 0xa66b52);
      box(g, 0, 1.7, .2, 7.4, 3.4, .3, RED, action);
      for (const x of [-2.25, 2.25]) {
        box(g, x, 1.7, .39, 2.65, 2.3, .2, GOLD, action); box(g, x, 1.7, .52, 2.4, 2.04, .14, 0x354144, action);
        for (const xx of [-.65, 0, .65]) fixture(g, shop.id, x + xx, .77, .66, Math.round((xx + 1) * 5));
        box(g, x, 1.75, .81, .06, 2.05, .07, GOLD, action);
        box(g, x, 1.7, .81, 2.4, .05, .07, GOLD, action);
      }
      box(g, 0, 1.25, .52, 1.25, 2.5, .27, WOOD, action); box(g, 0, 1.65, .68, .9, 1.25, .05, 0x9bbaa8, action); ball(g, .4, 1.1, .76, .08, GOLD, action);
      for (const x of [-3.55, -.78, .78, 3.55]) { box(g, x, 1.7, .6, .18, 3.4, .28, GOLD, action); }
      box(g, 0, 3.05, .9, 7.5, .22, 1.2, CREAM, action);
      for (let n = 0; n < 15; n++) box(g, -3.5 + n * .5, 3.01, 1, .26, .17, 1.2, RED, action);
      sign(g, shop.title.replace(' and Merchandise', '').replace(' Shop', ''), 0, 3.64, .43, 7, .72, action);
      for (const x of [-2.4, 0, 2.4]) { box(g, x, 5.12, .22, 1.28, 1.9, .22, CREAM); box(g, x, 5.12, .36, 1.06, 1.65, .1, 0x53656c); box(g, x, 5.12, .43, .065, 1.65, .06, CREAM); box(g, x, 5.12, .43, 1.06, .065, .06, CREAM); }
      box(g, 0, 6.75, -1.7, 7.8, .3, 4.9, WOOD); box(g, 2.3, 7.1, -2.5, .7, 1.1, .8, RED);
    });
    for (const x of [-19, -11.6, 11.6, 19]) { cylinder(scene, x, 1.65, 3, .075, 3.3, WOOD); box(scene, x, 3.45, 3, .4, .5, .4, CREAM); cylinder(scene, x, 3.78, 3, .32, .1, WOOD); }
    sign(scene, 'SODAFOM • LEARNING LANE', 0, 7.7, -.5, 13, .85);
  } else {
    box(scene, 0, -.15, -1, 12, .3, 12, WOOD);
    for (let x = -5.5; x <= 5.5; x++) for (let z = -6.5; z <= 4; z++) box(scene, x, .015, z, .98, .035, .98, (Math.round(x + z) % 2) ? 0xb09370 : 0x715039);
    box(scene, 0, 3, -6, 12, 6, .3, RED); box(scene, -6, 3, -1, .3, 6, 10, RED); box(scene, 6, 3, -1, .3, 6, 10, RED);
    for (const x of [-5.7, -3, 0, 3, 5.7]) box(scene, x, 3, -5.8, .1, 5.8, .1, GOLD);
    box(scene, 0, 1, -5.6, 11.8, 2, .4, WOOD); box(scene, 0, 5.65, -5.7, 12, .14, .2, GOLD);
    sign(scene, SHOPS.find(shop => shop.id === shopId)!.title, 0, 4.9, -5.68, 8, .8);
    for (const x of [-3.8, 0, 3.8]) {
      box(scene, x, 2.55, -5, 3.1, 3.3, .75, WOOD);
      for (const y of [1.05, 2.15, 3.25]) {
        box(scene, x, y, -4.55, 3.25, .12, 1, GOLD);
        for (let n = 0; n < 3; n++) fixture(scene, shopId, x - .96 + n * .96, y + .08, -4.35, n + Math.round(y));
      }
    }
    box(scene, 0, .8, -.6, 4.6, 1.6, 2.1, WOOD, 'surprise'); box(scene, 0, 1.65, -.6, 4.9, .18, 2.4, GOLD, 'surprise');
    display.position.set(0, 1.78, -.6);
    for (let i = 0; i < 5; i++) fixture(display, shopId, (i - 2) * .85, 0, (i % 2) * .7 - .3, i);
    sign(scene, 'Tap the display • a little surprise', 0, 1, .48, 4, .52, 'surprise');
    box(scene, 4.6, 1.5, -3, 1.6, 3, .3, WOOD, 'street'); box(scene, 4.6, 1.75, -2.81, 1.25, 1.65, .06, 0x819ca3, 'street');
    sign(scene, 'Return to street', 4.6, 3.2, -2.8, 2.2, .38, 'street'); ball(scene, 5.1, 1.35, -2.72, .08, GOLD, 'street');
    for (const x of [-3, 3]) { cylinder(scene, x, 4.8, -1, .035, 1.9, GOLD); mesh(scene, new THREE.ConeGeometry(.55, .35, 16, 1, true), mat(CREAM), x, 3.85, -1); ball(scene, x, 3.65, -1, .12, CREAM); }
  }
  const raycaster = new THREE.Raycaster();
  let effect: Surprise | null = null;
  return {
    scene, target: new THREE.Vector3(0, shopId ? 2 : 2.8, shopId ? -1.7 : 0), distance: shopId ? 12.8 : 35,
    activate(pointer, camera) {
      raycaster.setFromCamera(pointer, camera);
      for (const hit of raycaster.intersectObjects(scene.children, true)) {
        let ancestor: THREE.Object3D | null = hit.object;
        let visible = true;
        while (ancestor) { if (!ancestor.visible) visible = false; ancestor = ancestor.parent; }
        if (!visible) continue;
        let object: THREE.Object3D | null = hit.object;
        while (object) { if (typeof object.userData.action === 'string') return object.userData.action; object = object.parent; }
        // Occluding solid geometry must not trigger objects behind it.
        if (hit.object instanceof THREE.Mesh && !(hit.object.material instanceof THREE.MeshStandardMaterial && hit.object.material.transparent)) return null;
      }
      return null;
    },
    surprise(kind) { effect = kind; toy.visible = kind === 'toy-dog'; star.visible = kind === 'golden-star'; },
    tick(seconds, animate) {
      display.rotation.z = effect === 'jar-wiggle' && animate ? Math.sin(seconds * 4) * .024 : 0;
      toy.rotation.y = animate && effect === 'toy-dog' ? Math.sin(seconds * 1.5) * .15 : 0;
      star.rotation.y = animate ? seconds * .5 : 0;
    },
    dispose() { geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose()); scene.clear(); },
  };
}
