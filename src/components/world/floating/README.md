# Floating learning room

Default export: `src/components/world/FloatingLearningRoom.tsx`. Coordinator registers `/world/floating`. Existing `/world/planets` diagram remains separate and is linked as a clear north-view alternative / WebGL fallback. No existing artwork, backend files or routes are changed by this component.

## Implemented

- A real Three.js WebGL scene: perspective camera, floor, back and side walls, trim, three-dimensional models, lighting and pointer raycasting. Drag sideways or use visible camera buttons; Reset view restores the initial camera. Camera movement is bounded to the room's open front.
- Planet skin: a centered Sun, eight planets floating in the middle of the camera view, circular orbit paths, a rotating Earth with a fixed 23.4° axial tilt, and a Sun point light that produces a lit day side and dim night side. Orbit groups translate; Earth's independently spinning mesh is inside a fixed-tilt group, preserving the axis direction throughout an orbit. Positive right-handed Y rotation and x=cos(a), z=-sin(a) orbital positions give prograde rotation viewed from north.
- Colouring skin: floating open book with locally drawn page art, pencils and a little decorative star. Hotspots open the existing colouring book and colour-learning games, or display an actionable drawing prompt.
- Geography skin: a three-dimensional little aircraft follows a smooth imaginary circuit, a travel case opens the UK activity, and a globe opens a land/sea explanation. Geography quiz and UK routes already exist.
- Each skin owns a distinct hotspot registry and positions. Only known IDs belonging to the active skin resolve to actions. Raycast object ancestry resolves through the same callback as visible native buttons. Old scenes are disposed; stale asynchronous callbacks are cancelled. Game routes include `returnTo=/world/floating` for the coordinator's return-navigation work.
- Pause/Play, three teaching speeds, reduced-motion preference, visibility pausing and a single bounded clock. Switching room rebuilds that scene and restarts its illustration time. All object motion shares the scene clock.
- A user-triggered shuffle bag of four gentle text surprises. No repeats within a bag or immediately across bag boundaries; no sounds, purchases, messages to others or permissions.
- WebGL initialization/render/context-loss failures show a readable fallback. Skin selectors and activity buttons remain usable without WebGL.
- Cleanup stops frames and removes pointer, visibility and context-loss listeners, disconnects ResizeObserver, disposes geometries/materials/textures and the renderer, releases the context, and removes the canvas. Three.js is loaded lazily for this route, without remote model or texture requests.

## Scientific and visual limits

This is a stylised teaching room, not a physical simulator. Planet radii, sizes and animation periods are illustrative and not proportionally scaled to nature. Earth's displayed spin/orbit ratio is not physical. Orbits are circles, not the real ellipses; initial positions are designed, not a current ephemeris. The Sun uses one spin speed, omitting differential rotation. Other planets' own spins are not animated. Earth's land patches and the geography globe are decorative markings, not maps. The point light and ambient room fill illustrate day/night; they are not a photometric lighting simulation. The aircraft path is imaginary. All models are local geometric artwork; no approved images were replaced or new AI images generated.

Science references:

- [NASA Space Place: What Causes the Seasons?](https://spaceplace.nasa.gov/seasons/en/) explains day/night, axial tilt and the approximately fixed direction of Earth's axis through an orbit.
- [NASA JPL: Modeling Weather Patterns and the Coriolis Effect](https://www.jpl.nasa.gov/edu/resources/lesson-plan/modeling-weather-patterns-and-the-coriolis-effect/) establishes counterclockwise rotation viewed above Earth's North Pole.
- [NASA: Orbits and Kepler's Laws](https://science.nasa.gov/resource/orbits-and-keplers-laws/) establishes the north-view orbital direction.
- The separate `docs/world/planet-motion.md` documents diagram science and simplifications.

## Validation

Focused tests cover cross-skin action isolation, real activity targets, invalid/prototype input, shuffle-bag repetition and invalid random input, prograde orbit coordinates, pause/visibility/speed/stall behavior, disposal inside a draw callback, active scene teardown, stale callbacks, reduced-motion startup, WebGL fallback navigation, and actual shared Three.js geometry/material/texture disposal.

Command: `node_modules/.bin/vitest run src/components/world/floating`.

Browser visual verification was attempted through the required browser skill, but the browser execution tool reported its session capacity was fully active. No screenshot or browser interaction result is claimed. The coordinator should review all three skins at desktop and mobile sizes after route registration.
