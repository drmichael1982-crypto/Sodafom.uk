# SOD-06 — 360° phone look controls

For Michael Davis. Coordinator: **Coordinator Codex**. Date: 14 September 2026.

Branch: `codex/sod-06-phone-look-360`.
Base commit: `81a78e12c5fd35cef4de24180047480364d0358b`
(`codex/children-foundation-first-pass`). The final commit ID is in the GitHub
history for this file and the coordinator's handoff; a commit cannot contain its
own final hash.

## Request and delivered scope

Michael requested looking around a room by moving the phone. This branch adds a
standalone control prototype and a reusable renderer-independent motion module.
The prototype renders a perspective space panorama using Canvas, with the Sun and
eight planets placed around the viewpoint. Horizontal viewing wraps through 360°;
vertical viewing is limited to ±85°. It is a control test scene, not the completed
planet room, a scale astronomy simulation, or finished museum/shop artwork.

Open `/prototypes/phone-look/index.html` when serving this branch's `public`
directory. For a local desktop preview from the repo root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory public
```

Then open `http://127.0.0.1:8080/prototypes/phone-look/index.html` on that computer.
Phone motion needs a supported browser and a secure context, normally HTTPS.
An HTTP LAN address for a laptop is not sufficient for a real-phone motion test.
No new preview URL was deployed. Do not mistake a GitHub source link for a hosted
interactive preview.

## Implemented

- Optional “Move phone to look” button; requests permission only after a tap.
- W3C device-orientation rotation converted to a level camera direction, including
  sideways phone positions. Initial calibration preserves the current view.
- 360° heading wrap, vertical limits and reset/recentering.
- Touch drag, mouse drag, arrow buttons, arrow keys and Home key.
- Manual fallback for unsupported devices, denied permission and missing readings.
- No automatic sensor restart after the page is hidden; late permission responses
  cannot restart controls after cancellation or disposal.
- Rendering is demand-driven with at most one pending animation frame. No idle
  spinning or camera drift. Device pixel ratio is capped at 2.
- Responsive layout, 48px minimum control targets, focus indicators, status text,
  text description, and explicit manual controls independent of motion access.
- No account, camera, microphone, geolocation, network request or sensor storage is
  used by this prototype. It does not change the existing backend.

The sensor API uses browser-provided orientation data. This implementation follows
the coordinate definitions and consent model in the [W3C Device Orientation and
Motion specification](https://www.w3.org/TR/orientation-event/). It feature-detects
`requestPermission` because browser implementations differ. API presence alone
does not establish hardware support; valid readings are required within 5 seconds.

## Files

| File | Purpose |
| --- | --- |
| `public/prototypes/phone-look/controls.mjs` | Reusable camera input/controller; no framework dependency |
| `public/prototypes/phone-look/index.html` | Standalone responsive preview shell and controls |
| `public/prototypes/phone-look/demo.mjs` | Perspective space scene, input binding and demand rendering |
| `scripts/test-phone-look.mjs` | Node checks for rotations, wrapping, consent and controller lifecycle |
| `scripts/test-phone-look-browser.cjs` | Optional Chromium integration test, requiring Playwright/browser |
| `agent-reports/SOD-06-PHONE-LOOK-REPORT.md` | This handoff |

## Actual verification

```sh
node --test scripts/test-phone-look.mjs
```

**10 tests passed; 0 failed**, Node v24.19.0. These execute the real control module
with synthetic sensor readings, mocked event targets and permission outcomes.
They cover all horizontal quadrants, both landscape directions, null readings,
vertical poles, wrapping at 359°/1°, pitch limits, synchronous permission request,
denial/rejection, unsupported contexts, no-reading timeout, recentering, switching
to manual controls, background pause, listener disposal and late-permission races.

```sh
node --test scripts/test-phone-look-browser.cjs
```

**Blocked: 0 passed; 1 failed test-file run at browser launch.** Playwright is
available in the runtime, but its Chromium executable is missing. Browser
assertions did not run. No browser download was attempted. The supplied test is
intended to exercise portrait phone, landscape phone and desktop viewports, touch
drag, keyboard, buttons, reset, simulated permission, stopping motion, reduced
motion and absence of outbound requests. These are pending checks, not passes.

No visual inspection, physical Android/iPhone test, browser sensor emulation,
native Android WebView test, full app build or production integration test is
claimed. JavaScript syntax checks passed for the four added script files.

## Still needed

1. Run the supplied browser test in a configured environment, inspect the layout,
   and correct any discovered rendering or interaction issues.
2. Test on actual Android Chrome, iPhone Safari and the intended native wrapper
   over HTTPS: allow/deny/no sensor; portrait/landscape; full turn; tilt; recenter;
   background/return; screen reader; performance and motion comfort.
3. Connect the control module to the approved rooms' camera/renderers, maintaining
   a manual alternative. A flat illustration alone cannot reveal unseen surfaces;
   each finished room needs a full panorama or a complete 3D scene.
4. Review any desired smoothing on real hardware. The current controller applies
   valid readings directly and does not add inertial movement.
5. Obtain release approval separately before any merge or deployment.

## Branch boundaries and handoff

All six additions are new paths. No existing application files, route definitions,
artwork, dependencies, backend, database, authentication or deployment settings
are changed. No merge or deploy operation is requested or performed.

`master` and `main` must remain untouched. The coordinator's existing foundation
branch is also preserved. Prior to publication, they pointed respectively to
`058097f78077015980460c0b359903fda5aa83a6`,
`305401dd15acfaa60d8bd12f32a1aafd5f351f34` and
`81a78e12c5fd35cef4de24180047480364d0358b`.

Review the six new files against the foundation branch. Against master, the branch
also inherits the earlier foundation repairs: do not accidentally describe those
as new changes made for phone controls. Other world builders should coordinate
the integration path and camera convention with Coordinator Codex.
