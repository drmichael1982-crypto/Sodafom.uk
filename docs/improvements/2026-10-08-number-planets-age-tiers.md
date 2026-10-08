# Number Planets age-tier and pause coverage — 8 October 2026

## Repository, CI and deployment checked first

- Rechecked draft PR #81 and found its head at `8a44d885dc704407c5d6bdb41d280dc84114df46`; documentation run #197 had passed. The PR had become non-mergeable because the children’s test branch advanced after the preceding run.
- Verified the current test branch from GitHub as `test/archie-2026-10-02` commit `36072ef42e197dd48332711acd4e5263f99fd49d`, two commits newer than the previously reconciled base. The newer work adds continuous jigsaw artwork, live home-orbit checks and opt-in persistent parent-account storage.
- Railway deployment `a1bc87cf-8a5c-4e8c-8dda-b8759c3d62a1` is healthy on that exact `36072ef` commit, created 8 October 2026 at 18:37:10 UTC. There is no staged or applying Railway work.
- Leonard/sodafom797 remains a separate service and repository queue. No Leonard file, deployment or setting was changed.

## Reconciliation and current failure repaired

1. Merged the two current test-branch commits into `improve/archie-learning-20261007` instead of continuing from a stale base.
2. Preserved the new continuous artwork positioning and all 26 unique home destinations while retaining the existing duplicate-route filter, accessibility announcements, Teacher reporting, lesson guidance and result accessibility.
3. The combined full suite exposed a current failure: `SceneArtwork` now exports `sceneArtworkPath`, but the GameShell and Games age-policy test mocks did not provide it. Twenty-two tests failed during render before reaching their assertions.
4. Added the missing deterministic `sceneArtworkPath` value to those two mocks. Their focused suite then passed 24/24, and the complete suite passed 838/838.

## Number Planets age-tier browser coverage

1. Expanded the existing Year 4 wrong-answer → hint → retry journey to also complete Year 1 and Year 7 at 390 × 844 and 820 × 1180.
2. Year 1 must show addition only. Year 4 must show multiplication only. Year 7 must show both multiplication and division across its eight deterministic missions.
3. The Year 1 and Year 7 journeys pause on Mission 1, require the accessible break message, save a paused screenshot, resume, and verify that the exact equation and zero first-try count were preserved.
4. Both new tiers then complete 8/8 first try, require the settled 100% score and three-star result, save a completion screenshot and return to Games. The existing Year 4 route still requires 88%, 7/8 and two stars after its deliberate retry.
5. These are simulated learner scenarios. They verify implemented behavior and visual states, not enjoyment or learning outcomes in real children.

## Local verification

- Conflict-area tests: PASS, 3 files / 14 tests.
- Repaired age-policy tests: PASS, 2 files / 24 tests.
- `npm run type-check`: PASS.
- `npm test -- --run`: PASS, 85 files / 838 tests.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- Browser-script syntax and `git diff --check`: PASS.
- Hosted Chromium and its screenshots remain required for the reconciled candidate before final browser claims.

## Direct live visual review

- Opened the newly deployed home and its built-in 412 × 915 CSS device preview. The new artwork forms one continuous, colourful jigsaw rather than unrelated card pictures; blond, emerald-eyed Archie, the robot, dogs, books, planets and bright landscape remain coherent.
- The 26 unique buttons remain arranged over the picture and the phone preview shows no horizontal overflow. The four-column phone labels are compact, so font size, contrast and tap-target measurements should be checked from the hosted candidate artifact rather than assuming the small rendered labels are sufficient.
- This was a CSS viewport simulation, not a physical phone test.

## Boundaries and next priority

Nothing was merged to the test/production branch or deployed from this candidate. No paid service, credential, real child data, live payment, 3D work or Leonard edit occurred. Physical phones/tablets, microphone/audio, device keyboard/screen reader, live account recovery/email verification and real-child testing remain unverified.

Next bounded priority: inspect the reconciled phone/tablet artifacts and measure the 26-piece home labels and tap targets; improve the compact phone navigation only if the measurements or rendered review confirm a concrete readability or touch-target defect.
