# Number Planets age-tier and pause coverage — 8 October 2026

## Repository, CI and deployment checked first

- Rechecked draft PR #81 and found its head at `8a44d885dc704407c5d6bdb41d280dc84114df46`; documentation run #197 had passed. The PR had become non-mergeable because the children’s test branch advanced after the preceding run.
- Initially verified `test/archie-2026-10-02` at `36072ef42e197dd48332711acd4e5263f99fd49d`. While hosted checks were running, it advanced again to `4b2c53329e8d0a289cc3397de5a808e494d055dd`; that is the final base reconciled here. The newer work adds playable whole-page picture jigsaws, fixed navigation icons, responsive lesson breaks, continuous home artwork, live home-orbit checks and opt-in persistent parent-account storage.
- Railway deployment `aa228b4a-9e25-450c-b109-fc0ab9ff4986` is healthy on the final reconciled base `4b2c533`, created 8 October 2026 at 19:17:29 UTC. There is no staged or applying Railway work.
- Leonard/sodafom797 remains a separate service and repository queue. No Leonard file, deployment or setting was changed.

## Reconciliation and current failure repaired

1. Merged the current test-branch lineage through `4b2c533` into `improve/archie-learning-20261007` instead of continuing from a stale base. The later reconciliation keeps the new `All activities` dialog and its exact-link route checks.
2. Preserved the new continuous artwork positioning and all 26 unique home destinations while retaining the existing duplicate-route filter, accessibility announcements, Teacher reporting, lesson guidance and result accessibility.
3. The combined full suite exposed a current failure: `SceneArtwork` now exports `sceneArtworkPath`, but the GameShell and Games age-policy test mocks did not provide it. Twenty-two tests failed during render before reaching their assertions.
4. Added the missing deterministic `sceneArtworkPath` value to those two mocks. The subsequent test-branch update independently supplied the production jigsaw artwork path in both mocks; that newer form is retained. The final complete suite passes 846/846.

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
- `npm test -- --run`: PASS, 87 files / 846 tests.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- Browser-script syntax and `git diff --check`: PASS.
- GitHub run #201 (`37830311163`) passed installation, type-check, all 838 then-current unit tests, the production build and Chromium setup, then found a current home route-check mismatch before the simulated journeys ran. The test branch advanced during that repair and replaced the home cards with an `All activities` dialog; the final reconciliation uses the new exact `Artwork` link in that dialog rather than retaining an assertion for superseded markup.
- Final candidate code commit: `efd8569a1356df57eae9ebd1b623504082db681d` on `improve/archie-learning-20261007`, targeting `test/archie-2026-10-02` at `4b2c53329e8d0a289cc3397de5a808e494d055dd`.
- Replacement GitHub run #207 (`37831640924`): PASS. Type-check, 87 files / 846 unit tests, production build and Chromium setup all passed.
- Hosted browser checks: PASS, 12 core browser journeys, all 130 linked game routes, 16 responsive viewports with no horizontal overflow, 74 simulated learner journeys, zero browser errors and zero live API requests.
- Evidence artifact `11574052960`: 118 files / 46,457,193 bytes; SHA-256 `8fec4386cbdc96090371cc0b61dd0072aead7b4609a109ab14402d83ed664f78`.

## Direct live visual review

- Opened the current live home and its built-in 412 × 915 CSS device preview. The artwork forms one continuous, colourful jigsaw rather than unrelated card pictures; blond, emerald-eyed Archie, the robot, dogs, books, planets and bright landscape remain coherent. Six fixed icon controls stay visible over the picture while fourteen loose pieces are presented in a horizontal tray.
- The live phone preview rendered successfully with readable fixed labels, a visible progress counter, clear instructions and no observed horizontal page clipping. The loose-piece tray is intentionally compact and scrollable, so measured touch-target/readability checks remain the next evidence-driven design task.
- Reviewed the final hosted artifact at 390 × 844 and 820 × 1180. Home, Games, Spelling lesson, unlocked Parent and unlocked Teacher screens were colourful, readable and unclipped; phone layouts used the existing vertical/pager treatment and tablet layouts used the wider card space.
- Reviewed the new Number Planets screenshots. Pause state and Resume control were clear, the exact mission survived pause/resume, Year 1 and Year 7 completed at 100% / three stars, and the Year 4 deliberate retry exposed the hint before the 88% / two-star result. The phone result uses ordinary vertical scrolling for lower content and showed no horizontal clipping.
- These were automated and CSS viewport simulations, not physical-device or real-child tests. The visual review supports layout and state-flow claims only; it does not demonstrate enjoyment or learning outcomes.

## Boundaries and next priority

Nothing was merged to the test/production branch or deployed from this candidate. No paid service, credential, real child data, live payment, 3D work or Leonard edit occurred. Physical phones/tablets, microphone/audio, device keyboard/screen reader, live account recovery/email verification and real-child testing remain unverified.

Next bounded priority: measure the whole-page jigsaw's fixed controls, loose-piece tray and phone touch targets/readability; make a bounded UI change only if those measurements or a reproducible interaction expose a concrete defect. After that, extend the full age/year game matrix without treating simulated play as real-child evidence.
