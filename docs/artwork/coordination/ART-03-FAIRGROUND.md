# ART-03 — Shop and fairground coordination review

Date: 16 September 2026. Coordinator Codex worker ART-03.

This is a source review and an owner handoff, not a completed artwork or phone-test sign-off. The existing PR #31 owner retains implementation ownership. SOD-13 retains street ownership and SOD-04 retains its preview ownership; resolve intersections through Coordinator Codex.

## Evidence and scope

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Reviewed PR: [#31](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/31), branch `codex/fairground-world-walkthrough`, exact head `9c8d1f7528394c97fe351d81ce38df6883108f57`.
- Report branch: `codex/artwork-coordination-20260916`, prepared from stable `442656b4e2ec76167b4d0b5fb7b804cf742904a5`. This worker made no commit.
- Read exact-head `public/village-sweet-shop.html`, `public/fairground.html`, `public/sodafom-world-entry.js` and `docs/SODAFOM_FULL_MASTER_FILM_AND_GAME_SCRIPT.md` through GitHub. Fetched `src/routes.tsx`; full route behaviour remains untested.
- Read the private artwork pack's README, world work order, Michael master and scene-status manifest. No private image bytes are included here. This worker did not visually sign off the reference images or original films.
- Owned change: this report only. No application, scenery, character, media, routing or other owner's files changed.

## Actual results

| Check | Result | Evidence and limit |
| --- | --- | --- |
| Exact PR source retrieval | PASS | GitHub returned the two prototypes at the specified commit. Shop blob `a2a45eb1aa09f822ecc6d07c15d5498ab90e6b95`; fairground blob `a822c9d27361991f3aa424c355ab5fc8b690603c`. |
| Shop arithmetic | PASS — source review | Prompt asks 12 sweets shared between 4 friends. Only `data-a="3"` unlocks the exit; the handler fills four groups with three sweets. No browser execution claimed. |
| Fairground arithmetic | PASS — source review | Ferris question is **8 × 4**, answer index 1 selects **32**. Hoop question is 2 points three times, answer index 1 selects **6**. |
| Other fairground answer keys | PASS — manual source review | Correct answers are circling, adventure, skull, west and Mars for their stated questions. This is seven fixed questions, not a variable question bank. |
| Shop onward continuation | FAIL — source-confirmed | `leaveShop.onclick` sets `step=3` and labels the button “Continue into town”. `goBtn.onclick` handles only steps 0 and 1; its final `else` reopens `shopOverlay` for step 3. The button cannot perform the promised onward navigation. |
| Learning gating | PASS — source review, partial | Wrong shop answers leave the exit disabled. Fairground `openRide(i)` rejects future indexes and correct answers advance `current`. Browser interaction and durable progress were not verified. |
| Browser prototype test | NOT TESTED | Browser setup returned documentation, but the call opening the local shop stalled and was aborted without results. No screenshot, click sequence or browser reproduction is claimed. |
| Full app routes, phone fit, touch, audio playback and film joins | NOT TESTED | No full app build, physical device test, audio review or full moving-scene playback completed in this pass. |

No overall completion percentage is inferred from these checks.

## Small next fixes for the existing PR #31 owner

1. **Repair the shop continuation loop first.** In `public/village-sweet-shop.html`, add an explicit `step === 3` branch before the fallback that opens the overlay. The same PR already contains and links `/fairground.html`, so a concrete minimal destination is that page. If using it, change the post-shop button label to “Continue to funfair” so the destination is clear:

   ```js
   else if (step === 3) {
     window.location.assign('/fairground.html');
   } else {
     overlay.classList.add('open');
   }
   ```

   Use the agreed connected-town destination instead if the town owner supplies one; do not invent or overwrite another owner's route. Keep shop replay as an explicitly labelled separate action. Verify wrong answer keeps the gate closed, correct answer opens it, leaving closes the overlay, and the next action reaches the named destination. Also disable/re-enable the walking button during its 2.2-second transition so rapid taps cannot stack conflicting movement callbacks.

2. **Provide a reversible shop exit.** The custom `.overlay` currently has no Close/Back control; its only exit is disabled until the question is answered. Keep learning progression gated but allow return to the street. Give the overlay dialog semantics, focus management, keyboard dismissal and a focus return target. Confirm sound remains reachable while it is open.

3. **Make sound-off stop existing speech.** In both prototypes, the mute handler changes a flag and label but does not call `speechSynthesis.cancel()` when muting. Add that call in the muted branch and stop/close active generated bark audio where applicable. Current speech uses a generic browser voice with `en-GB` and pitch/rate settings; it does not establish consistent Archie, Rob or Michael voices. Coordinate voice assets with the theatre/audio owner.

4. **Make ride motion reflect unlock state.** `public/fairground.html` gives `.ride-run` a continuous `spin` animation as soon as a question is opened, before a correct answer. Correct answers currently update text/progression; there is no boarding, running, stopping or exit sequence. Render a stationary locked state and start the ride only after success, then stop before offering an exit. Do not imply the emoji animation is completed 3D ride movement.

5. **Add reduced-motion and clear completion behaviour.** Neither prototype contains a reduced-motion rule or control. Both run recurring CSS motion; the shop uses a fixed walking transition and the fairground requests smooth scrolling. Respect the shared reduced-motion preference, provide a static equivalent, and avoid automatic movement for it. After the final coaster question, replace “Walk with me to the next ride!” with an explicit completion/return action. `current` and `unlocked` are only in memory; agree the progress adapter with the existing app owner before claiming saved progress.

6. **Replace placeholder identity only through the agreed asset handoff.** Both pages render Archie and the three dogs as emoji, without the approved Michael/Rob/Soda cast. The fairground hides `.dogs` under 620px. These cannot demonstrate exact character design, dog marking continuity or grounded walking. Preserve the existing backgrounds and interaction logic while the owner applies approved assets. Tap-the-jars copy is also ahead of implementation: the shop jars are inert `div` elements.

## Numbered scene queue

| Scene task | Next artwork/motion work | Acceptance evidence |
| --- | --- | --- |
| ART-03.1 — Shop Walk | Retain the approved street, shopfront, jars and camera direction. Compare Michael against the actual approved portrait; preserve the group proportions. Correct Jessica's tiny white chin without introducing a chest bib. Show approach, doorway crossing, the 12 ÷ 4 = 3 challenge, and a real outward continuation. | Before/after character comparison; opening/middle/close-up/final frames; full foot-contact and doorway playback; tested return and onward buttons. |
| ART-03.2 — Funfair entrance and continuation | Preserve paths, lights and ride placement. Maintain stable group order and exactly three dogs whenever the family group is present. Correct old-film **7 × 4 = 28**, never 32. The separate current source question **8 × 4 = 32** is already correct and must not be changed to 28. | Both visible educational text and spoken answer checked; full entrance-to-ride transition; no duplicate/missing characters or dog coat drift. |
| ART-03.3 — Coaster | Preserve the approved coaster setting. Establish the approach, stopped boarding, coherent seating, ride start, full stop and exit. Give daytime-to-dusk/night footage an intentional transition. Audit every educational sign and spoken prompt. | Boarding/stopping/exiting sequence, character and dog placement at each cut, daylight continuity, full playback. The current prototype only has a coaster emoji question. |
| ART-03.4 — Twister | Use the supplied Twister scene direction. Define stopped approach/boarding, gradual start, bounded ride action, full stop and exit without replacing scenery. Match the same cast and scale through each shot. | Corrected still comparison plus full motion, voice, restraint/seat continuity and exit review. No Twister attraction is defined in the reviewed prototype's `rides` array. |
| ART-03.5 — Waltzers | Use the supplied Waltzers scene direction. Keep carriage orientation and character placement consistent through rotation; show a stopped platform for boarding and exit. | Corrected still comparison, motion/voice review, no body or dog duplication, no exit during motion. No Waltzers attraction is defined in the reviewed `rides` array. |

Shared identity rule: approved Michael portrait takes precedence over all earlier scenes. Archie keeps blond curls, emerald eyes and blue/gold A hoodie. Rob follows the approved older guide with a natural chin; the PR's older script reference to a “short grey beard” needs alignment with the newer handoff. Soda stays the compact white/blue robot with the SODAFOM badge. Jessica is jet-black with a tiny white chin and blue collar; Sally is entirely jet-black with a blue collar; Daisy is caramel-brown/white with a blue collar. Keep the established voices. The supplied stills are reference images, not rigged models or finished 4K masters.

## Handoff state

The next priority is the exact continuation fix in PR #31, followed by the prototype control fixes and asset/motion integration within existing ownership. The pack records no approved corrected full moving section or joined export; this report does not change that status. The browser test remained unconfirmed after its aborted call. A temporary read-only source server was started in scratch for that attempted test; no deployment was performed.

No commit, push, external comment, merge, production deploy, main/master edit or Systems 797 work was performed by ART-03. Parent Coordinator Codex handles publication and owner communication.
