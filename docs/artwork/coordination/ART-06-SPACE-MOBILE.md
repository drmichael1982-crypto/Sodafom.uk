# ART-06 — Space, birthday, settings and mobile artwork completion

Coordinator: **Coordinator Codex**. Worker: **ART-06**. Date: **16 September 2026**.

**ACKNOWLEDGED.** This numbered lane supplies the remaining artwork work orders and acceptance checks for Rocket/Space, Birthday, windmill Settings and mobile presentation. It preserves SOD-10 planet/floating-room work, SOD-06 phone-look work, existing screen-fit/device QA, and the theatre/media owner. It does not rename the existing agents or claim their sessions are active.

**Current result: AMBER — useful source foundations exist, but these finished moving worlds are not accepted.** The checks below distinguish inspected implementation, source-level mismatches, historical owner reports and untested device behaviour. No whole-app completion percentage is inferred.

## Ownership and inspected sources

| Source | Exact revision | What was inspected |
| --- | --- | --- |
| Stable review checkout, `codex/stable-app-build-20260915` | `442656b4e2ec76167b4d0b5fb7b804cf742904a5` | Birthday, Settings artwork/hotspots, routes, profile, accessibility/audio foundations and local report. |
| Repair branch, `codex/sod-software-repairs-20260914` | `c8470de5a93c2c9a3838b0bb3603cef07da5cc19` | Git tree and the actual planet/floating-room source, room CSS/configuration, routes and Birthday source through read-only GitHub requests. |
| SOD-06, `codex/sod-06-phone-look-360` | `398a51445c2bb242b6e532e16c7b0fca24c31d41` | Git tree and `agent-reports/SOD-06-PHONE-LOOK-REPORT.md`; its runtime tests were not rerun. |
| Shared artwork handoff, PR #33 | `cbe4a727b2edd561fcc29d024844ca920904e1dc` in coordinator inventory | Private supplied reference pack: `README.md`, `WORLD-ARTWORK-WORK-ORDER.md`, `SODAFOM-Rocket-Scene.md`, `scene-status.json` and source images. |

Report working branch: `codex/artwork-coordination-20260916`, based on the stable commit above. This worker owns only `docs/artwork/coordination/ART-06-SPACE-MOBILE.md`. The coordinator records the eventual report commit after publication.

**Identity correction:** stable `agent-reports/AGENT-10-REPORT.md` belongs to classroom/lessons Agent 10 on `agent10/classroom-lessons-20260913`. It is not a SOD-10 planet completion report. That path does not exist at the inspected repair commit. Use the repair world files and `docs/world/planet-motion.md` for planet evidence.

## What exists and what remains

| Area | Verified source state | Remaining requirement |
| --- | --- | --- |
| Rocket walk, boarding and launch | Reference group still and approximately 30-second draft in `SODAFOM-Rocket-Scene.md`; manifest explicitly says `rocketAnimationComplete: false` and `joinedExportApproved: false`. No completed rocket scene was found in the inspected stable/repair world source. | Correct Michael against the primary portrait; produce/review moving boarding, cabin, launch and joins. A script or corrected still does not complete this. |
| SVG planet diagram | Repair `src/components/world/PlanetRoom.tsx`, `planet-motion.ts`, `usePlanetMotion.ts`, `planet-motion.css`; eight labelled planets, Sun/Earth spin, native selection, Pause/Play, speed, reset, reduced-motion and visibility handling. | Visible orbit circles conflict with the latest world direction. Only Earth has its own planet spin. Diagram is 2D and expressly simplified. |
| 3D floating room | Repair `src/components/world/FloatingLearningRoom.tsx` and `floating/{create-scene.ts,models.ts,room-config.ts,animation-clock.ts,floating-room.css}`. Real procedural Three.js room, eight named planet captions, Sun/Earth rotation, fixed Earth tilt, raycasting, manual camera buttons, fallback activities and disposal code. | `create-scene.ts` explicitly renders `T.LineLoop` orbit paths. Other seven planets do not independently spin. No final approved space-room skin or character rig integration is evidenced. |
| World routes | Repair `src/routes.tsx` registers `/world/floating` and `/world/planets`. Both are absent from stable `src/routes.tsx`. | Coordinator must preserve the repair implementation and review integration; an existing branch component is not proof of the stable/live route. README suggestions about future route registration are older than the inspected repair route source. |
| Birthday | Stable and repair `src/pages/BirthdayPage.tsx` contain local countdown/name/date, save, spoken greeting, colouring and rewards links. `/birthday-party` redirects to `/birthday`. | No candle, blow detection, party-room scene, microphone request or candle fallback exists in this inspected page. No birthday-room master is supplied in this pack. |
| Windmill Settings | `public/assets/approved/settings.png` is a static windmill/cog interior, visually inspected. `src/pages/ApprovedArtworkPage.tsx` defines labelled hotspots and an image-load-failure button fallback. | No moving windmill/cogs are implemented here. Jessica visibly has a white chest patch in this older image; latest reference permits only her tiny white chin. Refer that correction to character/art owner. |
| Settings destinations | Artwork links Audio, Child, Display, Language and Account to `/hub/profile?section=...`. | Stable `src/pages/hub/profile.tsx` has no handling for those section query parameters. Distinct pictured controls are not evidenced as distinct functional panels. Coordinate with existing settings/account owner. |
| Phone look | SOD-06 supplies `public/prototypes/phone-look/{controls.mjs,index.html,demo.mjs}` and test scripts. Owner describes optional sensor input with manual alternatives. | This is an independent control prototype, not finished app-room integration. Do not replace it with a second sensor controller. Actual sensor/device and browser layout checks remain pending. |

The floating room currently exposes a Sun quiz, an Earth explanation and a telescope quiz in `floating/room-config.ts`. It does **not** give each of the eight planets a separate app-section destination. If the home solar-system navigation is retained, the town/navigation owner must supply the approved planet-to-section mapping before implementation; ART-06 does not invent that mapping.

## Numbered completion work orders

The following are tasks within ART-06, not additional agent identities. Coordinator Codex assigns each implementation to its existing owner and requests an acknowledgement with exact owned paths.

### ART-06.1 — Finish the existing planet-room visual treatment

Owner to retain: SOD-10 / existing floating-room and planet-motion implementation owner.

1. Work from repair `c8470de...`; preserve its animation clock, disposal, manual controls and accessible WebGL fallback. Do not reconstruct the room on stable while discarding existing work.
2. Remove visible orbit paths from the final space-world view. Inspect both `PlanetRoom.tsx` orbit `<circle>` creation and `floating/create-scene.ts` `LineLoop` creation. If the separate teaching diagram is intentionally retained, keep its purpose distinct and resolve its visible-line presentation with the coordinator; do not silently leave lines in the approved world.
3. Preserve the labels **Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune**. Add independently visible surface rotation to all eight where the final scene shows them, with reviewed per-planet axis/direction choices. Do not mechanically copy Earth's spin/tilt to every planet. Retain the clearly stated illustration scale/timing limits.
4. Keep the Sun centred at the requested comfortable mid-room/table height and the whole system visible on a narrow portrait viewport. The source currently uses a central Sun at `[0, .4, 0]`; this coordinate alone is not a visual fit pass.
5. Make labels legible throughout movement: no planet overlap, clipping, disappearing text behind geometry or moving label carrying an unreadable touch target. Native planet/section buttons must remain available alongside the scene. Current WebGL label sprites use `depthTest: true`; assess actual occlusion and size in motion.
6. Obtain the approved night-sky/space-room master or panorama and any Moon/satellite assets from the existing artwork owner. The supplied pack has a rocket group still, not a complete space-room reference. Document which optional scene details have an actual source before adding them.

Acceptance: eight names readable; all intended independent rotations visually demonstrated; no orbit guide lines in the approved world; stable camera/labels; Pause freezes all ambient/object motion; reduced motion starts paused; touch/manual fallback and correct return route work; screenshots and a full moving preview captured from an exact commit.

### ART-06.2 — Complete rocket boarding and space joins

Owners to retain: character/art owner for reference corrections, existing film/animation owner for motion, Agent 7/theatre owner for playback.

1. Use `images/master/michael-davis-approved.jpg` as Michael's authority, overriding the rocket still. Use the group reference for Archie, Rob, Soda and the dogs. Exactly three dogs: Jessica black with tiny white chin, Sally black, Daisy caramel/white. Preserve Michael's established voice.
2. Follow the supplied draft's sequence: fairground path → lowered ramp → boarding → seated cabin → closed doorway/clear pad → launch → window view → space. Keep matching travel direction, camera height, character order, size, lighting and foot contact.
3. Keep editable brand text **SODAFOM** on the rocket and Soda badge. Make the final boarding visible before door closure. Show three separate secure dog spaces in the cabin as specified by the draft.
4. Review the whole moving sequence, including both joins, not only selected stills. Record identity drift, duplicated/disappearing subjects, limbs, dog coats, contact with the ramp/floor, speech continuity and subtitle readability.
5. Supply the resulting approved media to the existing theatre catalogue/player owner. Do not create a parallel player or publish the private reference/media bytes through this documentation work.

Acceptance: full incoming/outgoing joins and all action phases reviewed; portrait identity and voices consistent; dog count stable; controls remain accessible; final export properties verified. No corrected rocket animation or joined export is currently signed off.

### ART-06.3 — Build the approved birthday-room presentation around existing features

Owner: retain the established Birthday owner if identified; coordinator resolves ownership before edits.

1. Obtain the previously approved birthday-room reference and usable candle/cake/background artwork. Preserve the current countdown and links in `src/pages/BirthdayPage.tsx`; this source is not yet the party room.
2. Add visible **Blow out candles**, **Light candles again**, **Pause motion** and **Sound** controls with clear lit/extinguished/listening/error state. Provide a tap/keyboard candle action that works with no microphone.
3. If optional blowing through the microphone is implemented, request it only from the explicit microphone control. Handle denied/unavailable/disconnected microphone and insecure context; keep the tap action immediately available. Release microphone tracks and analysis timers on stop, backgrounding and exit; never require microphone access to celebrate.
4. Pause must stop decorative movement and candle flicker as well as any celebration sequence. Reduced motion/quiet presentation keeps a static readable celebration; no rapid flashing. Coordinate microphone/audio focus with the existing audio owner.
5. Confirm the actual colouring/rewards return journey with navigation owner. Do not rename generic destination content as completed birthday-specific content without checking it.

Acceptance: touch-only celebration works; optional microphone success/deny/no-device paths exercised; relight/reset predictable; no active microphone after exit; countdown preserved; readable party controls in both orientations. **Candle functionality is not implemented in the inspected source.**

### ART-06.4 — Complete the windmill Settings presentation

Owners to retain: existing Settings/account owner for function; character/art owner for the older image correction.

1. Preserve the approved windmill/cog composition in `public/assets/approved/settings.png`. Ask the character owner to correct Jessica's white chest marking against the latest reference and check Archie against the group master. Preserve other approved scene details.
2. If moving sails/cogs are required, obtain layered artwork or a reviewed 3D/panorama source; the single flat PNG contains no rig or unseen surfaces. Keep labelled controls stationary and reachable while decoration moves.
3. Reconcile `ApprovedArtworkPage.tsx` hotspot destinations with actual Audio, Display, Language, Child and Account panels. Current profile section queries are not handled in stable; generic account/profile arrival must not be reported as a working display or audio setting.
4. Provide visible text-based controls in the normal accessible mode, not only after image failure. Image-embedded labels cannot respond to the dyslexia/large-text font setting. Keep navigation and protected-area behaviour owned by the existing functional agents.

Acceptance: every depicted cog opens the correct functioning panel, Home returns correctly, focus/touch targets are visible, settings survive reload as designed, image failure is usable, and all decorative movement respects Pause/reduced motion.

### ART-06.5 — Finish shared phone/tablet presentation without duplicating SOD-06

Owners to retain: SOD-06 phone-look module, existing screen-fit/device QA, world owners for scene-specific fixes.

1. Use optional phone-look controls only after the existing module is reviewed and connected to each actual room renderer. Keep drag, buttons and reset available. A flat still cannot reveal unseen room surfaces.
2. Check portrait and landscape, safe-area insets, browser address-bar changes, onscreen keyboard, tablet split view and background/return. No forced orientation is needed to reach a control or leave a world.
3. Audit actual target rectangles. In stable `ApprovedArtworkPage.tsx`, Home uses a fixed artwork ratio and 11%-high hotspots: at an **800 × 360 CSS-pixel** viewport the computed height is **39.6 CSS pixels**. This is below the proposed 44-pixel minimum review target; it is a source-based calculation, not a browser/device measurement. Prefer 48-pixel primary controls where space allows.
4. Retain `floating-room.css` native activity buttons, `touch-action: pan-y` and camera alternatives. Its viewport is fixed to 400px under 650px width; inspect short landscape screens and page scroll rather than assuming that media query proves fit.
5. Test text enlargement/dyslexia/high contrast on live editable labels. Current stable accessibility settings cover those three preferences; they do not establish a global motion/light policy.
6. Coordinate one effective Pause/Motion, Sound/Mute and quiet lighting behaviour across world boundaries. Keep the theatre owner's playback controls. Stable `docs/AGENT18_VOICE_AUDIO_REPORT.md` already records legacy direct speech call sites that bypass shared audio ownership, including artwork button feedback. Do not claim every sound follows the shared switch until verified.

Acceptance: visible Back/Home/Help remain usable in each scene; no clipped controls or accidental drag navigation; text and captions readable; motion permission remains optional; no automatic sensor restart on return; muted scenes stay silent; paused scenes stay still; lost artwork/WebGL/media keeps usable navigation and explanations.

## Approved assets and delivery sizes

These are measured inputs, not proposed output resolutions. All nine supplied manifest entries passed SHA-256, byte-size and image-dimension checks during this audit.

| Available input | Actual pixels | What it establishes |
| --- | --- | --- |
| `images/master/michael-davis-approved.jpg` | 685 × 1536 | Primary Michael portrait; screenshot/crop, no new shoes/feet established. |
| `images/master/approved-group-rocket.png` | 1672 × 941 | Group/rocket direction; Michael portrait overrides Michael in it. |
| Shop Walk, Funfair entrance, Waltzers, Twister corrected PNGs | 1920 × 1080 each | Earlier scene correction; latest Michael comparison and full-motion approval still pending. |
| Funfair Continuation and Coaster corrected PNGs | 1672 × 941 each | Earlier scene correction; same pending comparisons. |
| `images/six-scene-review.jpg` | 1984 × 2050 | Review sheet only. |
| Stable `public/assets/approved/settings.png` | 1536 × 1061 | Static windmill/cog Settings interior, visually inspected. |
| Stable `public/assets/approved/home-fire-v3.jpg` | 1086 × 1448 | Existing portrait home background, dimension checked. |

**No verified 4K master, rigged shared cast, complete space-room master, birthday-room master or layered windmill master is supplied by this pack.** Request the exact approved source and provenance from its owner. Do not invent missing cast/environment designs or relabel these files as 4K.

For final pre-rendered deliverables, specify and verify 16:9 **3840 × 2160** and, where commissioned, 9:16 **2160 × 3840** masters, plus separately encoded mobile delivery versions. These are delivery targets, not existing completed files. Upscaling does not establish new 3D geometry or repair character identity. Keep editable text/captions and protect the subject framing in each orientation.

## Required acceptance evidence

| Check | Evidence required before GREEN | This audit |
| --- | --- | --- |
| Source/reference integrity | Exact commit, file paths, original hash/dimensions. | **PASS:** stable commit verified; repair/SOD-06 source read; supplied 9/9 image entries verified. |
| Current planet design | Eight labels, no visible orbit lines, each intended independent spin shown. | **PARTIAL / source mismatch:** eight labels exist; visible orbit paths and seven missing independent spins remain. |
| Rocket, boarding, launch and joins | Full moving clip and frame checks, established voices, stable identities/counts. | **NOT COMPLETE:** supplied manifest marks rocket and joined export incomplete. |
| Birthday candles | Tap/keyboard and optional mic permission/failure/release tests. | **NOT IMPLEMENTED in inspected page.** |
| Settings panels | Every cog changes the intended real preference and works with accessible text controls. | **NOT VERIFIED:** section query handlers absent in inspected profile source. |
| Portrait/landscape phone layout | Suggested simulated viewports: 360×800, 390×844, 412×915, plus inverses. Capture actual target sizes, labels and clipping. | **NOT TESTED in a browser.** |
| Tablet/desktop layout | Suggested simulated viewports: 768×1024, 820×1180, 1024×768 and 1366×768; test enlarged text. | **NOT TESTED in a browser.** |
| Physical devices | Honor Android Chrome first, then intended Android WebView/Fire tablet, iPhone Safari and iPad; allow/deny mic/sensors where applicable. | **NOT TESTED.** No hardware result is claimed. |
| Pause/mute/quiet lights | Full scene/world transition, background/return, reduced motion, denied audio autoplay and media failure. | **NOT TESTED at runtime.** Source foundations only. |
| Build/type-check/regressions | Required owner tests on the final integrated code commit; report exact commands/results. | **NOT RUN:** this worker changes documentation only. Historical owner passes do not certify the current integration. |

Static audit checks actually exercised: repair/stable world-route presence, eight ordered planet names, SVG orbit-circle creation, WebGL `LineLoop` creation, Birthday's missing candle/mic identifiers, missing profile query-handler indicators, calculated Home hotspot height, image dimensions/hashes and report whitespace. These are source checks, not app interaction tests.

SOD-06's inspected report records historical **10 Node tests passed**, and a browser launch blocked before browser assertions; its physical device and full app integration tests are expressly untested. The planet implementation documentation records earlier focused test/type-check passes; ART-06 has not reproduced those runs.

## Handoff and boundaries

1. Coordinator sends ART-06.1 to the retained SOD-10 owner, ART-06.2 to the retained character/film/theatre owners, and resolves the existing Birthday/Settings owners for ART-06.3–4.
2. Screen-fit and SOD-06 retain ART-06.5 device/control implementation; other workers provide their real preview routes and final tested commits.
3. Each owner replies with acknowledgement, exact branch/commit, exclusively owned paths, completed acceptance rows, PASS/FAIL/NOT TESTED evidence and next blocking asset/dependency. Existing agent numbers stay intact alongside this ART-06 coordination lane.

Only this Markdown report was added by ART-06. **No application edits, new artwork, commit/push, external comments, merge, deployment, private media publication or Sodafoam Systems 797 work was performed by this worker.**
