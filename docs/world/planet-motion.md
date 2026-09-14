# Planet room implementation

`src/components/world/PlanetRoom.tsx` exports the standalone React component by default. The coordinator owns route registration; suggested route: `/world/planets`. Its back link uses the existing `/cartoon-mode` adventure route. No existing artwork or backend files are changed.

## What works

- Eight planets orbit a centered Sun at `(450, 430)` in a `900 × 860` SVG room. The orbital system is centered halfway down the room drawing.
- The Sun has rotating surface marks. Earth's surface marks spin independently of Earth's orbital translation.
- All orbits and Earth's spin move counterclockwise in the labelled north-side view. SVG screen coordinates increase downward, so the angle decreases with time. Earth's north-pole close-up uses the same independent spin angle.
- Native buttons and a labelled select offer Play/Pause, ½×/1×/2× speed, Reset, and planet selection with short text facts. Selection has a visible ring and an `aria-pressed` button state.
- The animation starts paused when reduced motion is requested. A user may choose Play. A new reduced-motion preference pauses it again.
- A single requestAnimationFrame clock drives the scene. Hidden tabs stop scheduling frames and resume without catching up time spent hidden. Frames and preference/visibility listeners are cleaned up on unmount. No flashing, sound, external assets, network calls, purchases or permissions are involved.

## Scientific scope

This is a teaching diagram, not a physical orbital simulation or a 3D room. Sizes, spacing, periods and relative timing are deliberately compressed for legibility; outer planets still move more slowly in this illustration. Earth spins once in eight displayed seconds at normal speed, independently of its 46-second illustrated orbit. This is **not** the true spin-to-orbit ratio. Initial positions are designed, not an ephemeris.

Orbits are drawn as circles instead of real ellipses. Planet markers are illustrative discs. Earth's coloured marks are not a geographic map. Earth's axial tilt is **not rendered**; no rotating tilted axis is implied. Spin of planets other than Earth is not animated, so Venus/Uranus are not assigned an incorrect prograde spin. The Sun uses one illustration rate instead of modelling differential rotation. Saturn's decorative ring is not an accurate projection of its ring plane.

Primary scientific sources checked on 14 September 2026:

- [NASA JPL: Modeling Weather Patterns and the Coriolis Effect](https://www.jpl.nasa.gov/edu/resources/lesson-plan/modeling-weather-patterns-and-the-coriolis-effect/), Procedures Part 1, step 3: Earth's rotation is counterclockwise from above the North Pole and clockwise from above the South Pole.
- [NASA: Orbits and Kepler's Laws](https://science.nasa.gov/resource/orbits-and-keplers-laws/), transcript: planetary orbits are counterclockwise from above the Sun's north pole.
- [NASA: The Solar System](https://science.nasa.gov/learn/basics-of-space-flight/chapter1-1/): planets orbit in the same direction as the Sun rotates.
- [NASA: Sun Facts](https://science.nasa.gov/sun/facts/): the Sun rotates; its equator and poles rotate at different rates.
- [NASA: About the Planets](https://science.nasa.gov/solar-system/planets/): eight planets and their order.

## Validation and limits

`node_modules/.bin/vitest run src/components/world/planet-motion.test.tsx` passed six tests: screen-coordinate direction, ordered orbits, pause/speed/unmount lifecycle, hidden-tab behavior, reduced-motion behavior, and component controls/facts.

`node_modules/.bin/tsc --noEmit --pretty false` completed without errors in the shared checkout after these files were added. Full site integration and browser visual review remain with the coordinator; no browser screenshot is claimed here.

No earlier approved planet-room picture was found in the checkout; existing geography artwork is `public/assets/cartoon/worlds/geography.png`. This change does not reproduce, replace or edit an unseen picture. Aircraft animation, floating room skins, differently placed hotspots, shops, cinema, floating colouring books and interactive surprises are separate follow-up work.
