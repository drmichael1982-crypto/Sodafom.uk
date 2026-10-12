# Whole-page jigsaw touch-target guard — 8 October 2026

## Current state checked first

- Continued `improve/archie-learning-20261007` from documented head `fafb140deadfd3175d69345ca1effbce440b72e2`; draft PR #81 was still open and the documentation-only GitHub run #209 had completed successfully.
- Rechecked `test/archie-2026-10-02` at `4b2c53329e8d0a289cc3397de5a808e494d055dd`. The candidate was already reconciled with this base, so no merge or conflict resolution was needed.
- Railway deployment `aa228b4a-9e25-450c-b109-fc0ab9ff4986` remained healthy on exact base commit `4b2c533`, with no staged or applying work.
- Leonard/sodafom797 remained a separate service. No Leonard file, setting or deployment was changed.

## Measurement and bounded improvement

1. Inspected the current live 412 × 915 CSS phone preview. The six fixed icon controls, fourteen empty picture spaces, loose-piece tray, progress counter and instructions rendered without observed horizontal clipping. The colourful continuous artwork and blond, emerald-eyed Archie were preserved.
2. Existing CSS gives loose pieces 53 × 53 CSS pixels on portrait layouts and 48 × 48 on short landscape layouts. The prior browser guard checked only the first fixed icon control.
3. Expanded `scripts/test-page-picture-jigsaw.cjs` so every fixed icon control, loose piece, empty picture space and jigsaw action must measure at least 44 × 44 CSS pixels at 280 × 653, 320 × 568, 390 × 844, 768 × 1024, 1280 × 900 and 844 × 390.
4. Portrait and tablet trays must expose horizontal scrolling when pieces extend beyond the visible area. At every tested size, focusing the final loose piece must bring it into the visible tray area, covering keyboard as well as touch access.
5. No visual size change was made because the current controls already meet this stricter guard. The improvement is a regression gate against future compact-layout changes.

## Sources and comparison boundary

- W3C WCAG 2.2 success criterion 2.5.8 requires pointer targets of at least 24 × 24 CSS pixels, subject to defined exceptions: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- W3C success criterion 2.5.5 uses a stricter enhanced target of 44 × 44 CSS pixels. The Archie browser gate deliberately uses this larger target for the child-facing jigsaw controls: https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- Mathseeds describes its current mobile/tablet apps as highly interactive touch activities for early learners. This is a product benchmark for touch-first usability only; no character, artwork, lesson or proprietary interaction was copied: https://mathseeds.com/apps/
- This run did not change curriculum content or claim that Archie is universally better than another app. The larger-target guard is an original implementation choice for accessibility and error prevention.

## Verification

- Candidate branch head: `9320278ede5c1c4cb419962d5e13e114e0b15950`.
- `node --check scripts/test-page-picture-jigsaw.cjs`: PASS.
- `git diff --check`: PASS.
- `npm run type-check`: PASS.
- `npm test -- --run`: PASS, 87 files / 846 tests.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- Local Chromium execution was unavailable because the Playwright browser archive endpoint returned a truncated ZIP. GitHub’s hosted Chromium run is therefore the decisive measurement result.
- GitHub run #211 (`37837585359`) passed the pre-existing type, unit, build, route and simulated-learner suite, but artifact review exposed that the dedicated jigsaw script was not yet called by the workflow. No touch-target claim was made from that run.
- Commit `5368e44ad84617ae8648e8dbdec33878bbc54842` added the dedicated jigsaw script to `.github/workflows/archie-checks.yml`. Run #213 (`37839011879`) then failed before measurements because the remote script contained an older malformed route entry. That real CI blocker was repaired in `9320278ede5c1c4cb419962d5e13e114e0b15950`.
- GitHub run #215 (`37840062226`): PASS. It completed type-check, production build, 87 files / 846 unit tests, all 130 linked game routes, 12 core browser journeys, the dedicated jigsaw checks at all six target viewports, and 74 simulated search/game journeys with zero browser errors and zero live API requests.
- The dedicated browser log confirms placement, fixed controls, saved progress and fit at 280 × 653, 320 × 568, 390 × 844, 768 × 1024, 1280 × 900 and 844 × 390. It also completed the whole-picture game, per-page progress, fixed-icon destinations, retained lesson input and Speed Tables pause/resume.
- Artifact `11578425929` (50,178,055 bytes, SHA-256 `832255a74213cf85eff55978a639c79d9fbb369b253120dc13f2b3ed42ae172f`) contains the six viewport captures and completed-game mobile capture.
- Direct artifact review found no horizontal clipping. The 280px and 320px phone layouts retain readable labels and controls; portrait/tablet trays expose the loose pieces; short landscape uses its compact side-by-side layout; and the completed 390px view shows the whole colourful picture and completion feedback. This is simulated rendering, not a physical-device usability result.

## Boundaries and next priority

Nothing was merged to the test/production branch or deployed from this candidate. No paid service, credential, real child data, live payment, 3D work or Leonard edit occurred. The live review and browser checks are simulations, not physical-device or real-child tests. Physical phones/tablets, microphone/audio, device keyboard/screen reader, live accounts/payments and learning outcomes remain unverified.

Next bounded priority: extend Number Planets coverage from the Year 1, 4 and 7 tier representatives to every main-path Year 1–7 boundary, without treating repeated tier behavior as evidence of learning outcomes.
