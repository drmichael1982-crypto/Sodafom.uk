import * as T from 'three';
import { PLANETS } from '../planet-motion';
import { ROOM_SKINS, type RoomSkin } from './room-config';
import { createRoomClock, orbit3D } from './animation-clock';
import { aircraft, box, earth, label, material, openBook, pencils, sphere, telescope } from './models';

export type RoomController = {
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  moveView: (direction: 'left' | 'right' | 'closer' | 'farther') => void;
  resetView: () => void;
  dispose: () => void;
};

export function disposeRoomObjects(scene: T.Scene) {
  const geometries = new Set<T.BufferGeometry>();
  const materials = new Set<T.Material>();
  const textures = new Set<T.Texture>();
  scene.traverse(object => {
    const renderable = object as T.Mesh;
    if (renderable.geometry) geometries.add(renderable.geometry);
    if (renderable.material) for (const mat of Array.isArray(renderable.material) ? renderable.material : [renderable.material]) {
      materials.add(mat);
      for (const value of Object.values(mat)) if (value instanceof T.Texture) textures.add(value);
    }
  });
  textures.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); geometries.forEach(value => value.dispose());
  scene.clear();
}

export function createFloatingScene(host: HTMLElement, skin: RoomSkin, onAction: (id: string) => void, onError: () => void): RoomController {
  const scene = new T.Scene();
  const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  const cleanup: (() => void)[] = [];
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cleanup.forEach(fn => fn());
    disposeRoomObjects(scene);
    renderer.renderLists.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
  };
  try {
    const definition = ROOM_SKINS[skin];
    scene.background = new T.Color(definition.background);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label', `${definition.title}. Drag sideways to turn the view. Every hotspot also has a button below.`);
    renderer.domElement.setAttribute('role', 'img');
    host.appendChild(renderer.domElement);
    const camera = new T.PerspectiveCamera(44, 1, .1, 100);
    let azimuth = .08;
    let zoom = 1;
    const updateCamera = () => {
      const radius = Math.max(10.7, 5.6 / (Math.tan(T.MathUtils.degToRad(22)) * camera.aspect)) * zoom;
      camera.position.set(Math.sin(azimuth) * radius, .4 + radius * .29, Math.cos(azimuth) * radius);
      camera.lookAt(0, .4, 0); camera.updateMatrixWorld();
    };

    // An open-front room, with three dimensional floor, walls, trim and posts.
    const room = new T.Group(); scene.add(room);
    const floor = box(10.7, .18, 8.7, skin === 'geography' ? '#74948e' : '#48405a'); floor.position.y = -1.65; room.add(floor);
    const back = box(10.7, 5.1, .15, skin === 'planets' ? '#1d2948' : definition.background); back.position.set(0, .85, -4.3); room.add(back);
    for (const side of [-1, 1]) {
      const wall = box(.13, 4.8, 8.6, definition.background); wall.position.set(side * 5.3, .75, 0); room.add(wall);
      const post = box(.15, 5.2, .16, definition.accent); post.position.set(side * 5.1, .85, 3.6); room.add(post);
    }
    for (const y of [-1.48, 3.35]) { const trim = box(10.5, .075, .1, definition.accent); trim.position.set(0, y, -4.17); room.add(trim); }
    for (let x = -4; x <= 4; x += 1) { const line = box(.015, .01, 8.4, '#9b8e9a'); line.position.set(x, -1.55, 0); room.add(line); }
    const sign = label(skin === 'planets' ? 'THE PLANET ROOM' : skin === 'colouring' ? 'THE COLOURING ROOM' : 'THE GEOGRAPHY ROOM', 3.7); sign.position.set(0, 2.8, -4.05); room.add(sign);

    scene.add(new T.AmbientLight('#b9cee8', skin === 'planets' ? .23 : 1.65));
    if (skin !== 'planets') { const light = new T.DirectionalLight('#fff5df', 2.3); light.position.set(-3, 6, 5); scene.add(light); }
    const updates: ((seconds: number) => void)[] = [];
    const addHotspot = (object: T.Object3D, id: string, text: string, labelY = -.6) => {
      const spot = definition.hotspots.find(item => item.id === id)!;
      object.userData.hotspot = id; object.position.set(...spot.position); scene.add(object);
      const caption = label(text); caption.position.y = labelY; object.add(caption);
      return object;
    };

    if (skin === 'planets') {
      const sun = sphere(.43, '#ffd476', true);
      addHotspot(sun, 'solar-quiz', 'Sun · quiz', -.66);
      const sunspot = sphere(.045, '#b77638', true); sunspot.position.set(.3, .13, .27); sun.add(sunspot);
      const sunlight = new T.PointLight('#fff5d6', 3.3, 0, 0); sunlight.position.set(0, .4, 0); scene.add(sunlight);
      updates.push(time => { sun.rotation.y = time / 26 * Math.PI * 2; });
      PLANETS.forEach((planet, index) => {
        const radius = .88 + index * .43;
        const path = new T.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0).getPoints(96).map(point => new T.Vector3(point.x, .4, point.y));
        scene.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(path), new T.LineBasicMaterial({ color: '#667a9e', transparent: true, opacity: .5 })));
        const orbital = new T.Group(); scene.add(orbital);
        const tilt = new T.Group(); orbital.add(tilt);
        const size = planet.name === 'Earth' ? .24 : .08 + planet.size * .009;
        const globe = planet.name === 'Earth' ? earth(size) : sphere(size, planet.color);
        tilt.add(globe);
        if (planet.name === 'Earth') {
          // Fixed world direction of the spin axis; orbital parent only translates.
          tilt.rotation.z = -T.MathUtils.degToRad(23.4);
          const axis = new T.Mesh(new T.CylinderGeometry(.012, .012, .78, 8), new T.MeshBasicMaterial({ color: '#e8f4ff' })); tilt.add(axis);
          orbital.userData.hotspot = 'earth-spin';
          const north = label('N', .2); north.position.y = .45; tilt.add(north);
          updates.push(time => { globe.rotation.y = time / 8 * Math.PI * 2; });
        }
        if (planet.name === 'Saturn') {
          const rings = new T.Mesh(new T.RingGeometry(size * 1.35, size * 1.9, 48), new T.MeshStandardMaterial({ color: '#d9c297', side: T.DoubleSide, roughness: 1 })); rings.rotation.x = Math.PI / 2.6; globe.add(rings);
        }
        const caption = label(planet.name, .8); caption.position.y = -size - .17; orbital.add(caption);
        updates.push(time => { const point = orbit3D(time, radius, planet.period, -T.MathUtils.degToRad(planet.phase)); orbital.position.set(point.x, point.y, point.z); });
      });
      addHotspot(telescope(), 'space-quiz', 'Space quiz', -.55);
    } else if (skin === 'colouring') {
      const book = addHotspot(openBook(), 'open-book', 'Open colouring book', -.7);
      const crayons = addHotspot(pencils(), 'colour-pencils', 'Learn colours', -1.1);
      const star = new T.Mesh(new T.OctahedronGeometry(.36), material('#ffcf79'));
      addHotspot(star, 'drawing-idea', 'Drawing idea', -.65);
      updates.push(time => { book.position.y = .55 + Math.sin(time * .65) * .12; crayons.rotation.y = Math.sin(time * .35) * .18; star.rotation.y = time * .22; });
      for (let i = 0; i < 8; i++) { const dot = sphere(.08, ['#eab0db', '#acd7ca', '#edd196'][i % 3]); dot.position.set(-4 + i * 1.1, 1.8 + Math.sin(i) * .6, -3.7); scene.add(dot); }
    } else {
      const plane = addHotspot(aircraft(), 'aircraft-quiz', 'Geography quiz', -.5);
      updates.push(time => { const a = time * .19; plane.position.set(2.6 * Math.cos(a), 1.2 + Math.sin(a * 2) * .12, 1 + Math.sin(a) * 1.4); plane.rotation.y = Math.atan2(2.6 * Math.sin(a), -1.4 * Math.cos(a)); plane.rotation.z = Math.sin(a) * .08; });
      const suitcase = new T.Group(); suitcase.add(box(.9, .65, .4, '#c28758'));
      const handle = new T.Mesh(new T.TorusGeometry(.14, .035, 8, 20, Math.PI), material('#dfbd84')); handle.position.y = .34; suitcase.add(handle);
      addHotspot(suitcase, 'uk-luggage', 'Explore the UK', -.6);
      const globe = new T.Group(); globe.add(earth(.54));
      const stand = box(.7, .07, .7, '#d4bf8f'); stand.position.y = -.65; globe.add(stand);
      addHotspot(globe, 'globe-fact', 'Land and sea', -.95);
      // Imaginary landscape model, no geographical coordinates or claims.
      for (let i = 0; i < 5; i++) { const mountain = new T.Mesh(new T.ConeGeometry(.4 + (i % 2) * .12, .8 + (i % 3) * .2, 5), material('#abc5a0')); mountain.position.set(-2 + i, -1, -2.3 + (i % 2) * .3); scene.add(mountain); }
    }

    let failed = false;
    const clock = createRoomClock(seconds => {
      if (disposed || failed) return;
      try { updates.forEach(update => update(seconds)); renderer.render(scene, camera); }
      catch { failed = true; clock.setPlaying(false); onError(); }
    }, { request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id) });
    cleanup.push(() => clock.dispose());
    const resize = () => {
      if (disposed) return;
      const width = Math.max(1, host.clientWidth); const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height; camera.updateProjectionMatrix(); updateCamera(); renderer.setSize(width, height, false); clock.redraw();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); cleanup.push(() => observer.disconnect());
    const onVisibility = () => { clock.setVisible(document.visibilityState === 'visible'); clock.redraw(); };
    document.addEventListener('visibilitychange', onVisibility); cleanup.push(() => document.removeEventListener('visibilitychange', onVisibility));
    const onContextLost = (event: Event) => { event.preventDefault(); clock.setPlaying(false); onError(); };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost); cleanup.push(() => renderer.domElement.removeEventListener('webglcontextlost', onContextLost));

    const raycaster = new T.Raycaster();
    raycaster.params.Line.threshold = .025;
    let drag: { id: number; x: number; y: number; startX: number; moved: boolean } | null = null;
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, moved: false };
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.y) > 6) drag.moved = true;
      if (drag.moved) { azimuth = T.MathUtils.clamp(azimuth - (event.clientX - drag.x) * .006, -.65, .65); updateCamera(); clock.redraw(); }
      drag.x = event.clientX;
    };
    const up = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      const click = !drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.y) <= 6; drag = null;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      if (!click) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      raycaster.setFromCamera(new T.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      const intersection = raycaster.intersectObjects(scene.children, true)[0];
      let object: T.Object3D | null = intersection?.object ?? null;
      while (object) { if (typeof object.userData.hotspot === 'string') { onAction(object.userData.hotspot); return; } object = object.parent; }
    };
    const cancel = () => { drag = null; };
    for (const [name, fn] of [['pointerdown', down], ['pointermove', move], ['pointerup', up], ['pointercancel', cancel]] as const) {
      renderer.domElement.addEventListener(name, fn as EventListener); cleanup.push(() => renderer.domElement.removeEventListener(name, fn as EventListener));
    }
    onVisibility(); resize();
    return {
      setPlaying: value => clock.setPlaying(value), setSpeed: value => clock.setSpeed(value), dispose,
      resetView: () => { azimuth = .08; zoom = 1; updateCamera(); clock.redraw(); },
      moveView: direction => {
        if (direction === 'left' || direction === 'right') azimuth = T.MathUtils.clamp(azimuth + (direction === 'left' ? -.16 : .16), -.65, .65);
        else zoom = T.MathUtils.clamp(zoom + (direction === 'closer' ? -.1 : .1), .8, 1.25);
        updateCamera(); clock.redraw();
      },
    };
  } catch (error) { dispose(); throw error; }
}
