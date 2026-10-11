# Word Scramble retry and optional break — 10 October 2026

## Fresh state and bounded ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children’s target: `test/archie-2026-10-02` at `286817348b5bf82954b7e67cab01fdd99c4187f8`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remained open and unmerged.
- Target reconciliation commit: `114a75bbeb7303adf63037a723eb532b401f495d`.
- Implementation commit: `afa8dc8da8cc2174363eee0a482ec7f45d9b4795`.
- The open PR and current CI were rechecked before editing. This run changed Word Scramble and its tests only. The 3D work, production, credentials, payments and separate `sodafom797` project were not touched. Leonard’s live worker status is not observable here, so no claim of active-worker coordination is made.

## Reproduced behavior and repair

The current Word Scramble revealed the answer after a wrong arrangement and automatically moved to the next word after two seconds. It had no retry loop and no optional pause. Its test covered only the perfect ten-word path.

The bounded repair now:

- tells the learner to tap letters and change the answer if it does not fit;
- retains a wrong arrangement on the same word instead of revealing the answer or advancing;
- allows an individual letter to be removed or the answer to be cleared before retrying;
- gives calm `role=status` feedback and keeps the hint control mounted, pressed-state aware and keyboard-focused;
- provides a Pause/Resume control that preserves the partial word and disables letter changes while paused;
- awards five practice points after a hint or earlier mistake, while counting an eventual correction toward completion; correcting all ten words still earns three stars;
- keeps the existing word bank, age rules, game progression, shared result screen and established blue/gold 2D styling unchanged.

This is intended to reward correction and make a short break possible. It is not evidence of improved attainment or enjoyment.

## Verification

| Check | Result |
| --- | --- |
| TypeScript `--noEmit` | PASS |
| Full Vitest suite | PASS — 136 files / 1,038 tests |
| Focused Word Scramble tests | PASS — perfect completion, retained wrong answer/corrected retry, preserved partial answer during pause |
| Archie production build | PASS — existing mixed-import and large-chunk warnings remain |
| Browser syntax / whitespace | PASS |
| Main browser suite | PASS — 15 journeys, all 130 linked game routes, responsive layouts, zero browser errors and zero live API requests |
| Whole-page jigsaw browser check | PASS — seven viewports plus all fixed page actions |
| Simulated learner matrix | PASS — 84 search/game/lesson journeys at 390 × 844 and 820 × 1180 |
| Exact implementation workflows | PASS — GitHub Actions [Archie test build #399](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38060245262) and [interest themes #52](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38060245265) |

The new browser journey selects Year 4, enters Word Scramble from search, activates the hint with the keyboard, submits a deliberately wrong arrangement, confirms that question 1/10 remains after the old two-second advance window, clears and retries, pauses with one chosen letter, resumes, corrects all ten words, closes the moving reward, verifies a settled 95% three-star result and returns to Games. This is a synthetic learner journey, not real-child testing.

An initial matrix rerun exposed a test-only route-transition race: the Word Scramble layer existed but was still off-screen when Playwright tried Clear. The browser journey now waits for the completed transition before capturing or interacting. The fresh rerun passed all 84 journeys.

Hosted run #399 passed on exact implementation commit `afa8dc8…`: install, TypeScript, all 1,038 unit tests, production build, Chromium installation, 15 core journeys, all 130 linked game routes, responsive layouts, whole-page jigsaw verification, the expanded 84-journey simulated matrix and artifact upload. Interest-theme run #52 also passed.

## Rendered and deployment review

Fresh candidate captures were directly inspected at 390 × 844 and 820 × 1180 for the retained wrong answer, paused partial answer, moving reward and final result. The tablet card is fully contained with clear instruction, answer, retry and break controls. On the phone, the fixed game window uses its existing internal vertical scroll; the retry message and pause controls remain reachable, but the whole game cannot be seen at once. Both settled result captures show 95%, 10/10 and three stars. Some emoji render as square placeholders in the headless font; this is not treated as proof of a production glyph defect.

The established home, game selection, complete Number Planets route, lessons, parent and teacher pages were also exercised by the main and simulated browser suites at phone/tablet widths. Their navigation and containment checks passed; this run did not change their visuals or Archie’s blond hair/emerald-green-eye branding.

Railway was rechecked read-only. Deployment `f0320c4c-8306-41da-b432-543ccbed6b96` is `SUCCESS`, created on 10 October 2026 from exact target `286817348b5bf82954b7e67cab01fdd99c4187f8` on branch `test/archie-2026-10-02`. The candidate is not deployed.

## Product comparison and curriculum boundary

The requested Stripe Directory workflow was attempted before provider lookup, but its CLI is unavailable in this runtime. No provider was selected, contacted, provisioned or paid. Current official sources were then checked on 10 October 2026:

- [Khan Academy Kids](https://www.khanacademy.org/kids) describes playful foundational literacy/maths practice and a personalised learning path for ages 2–8. The relevant benchmark is supportive practice, not copied characters, text or lessons.
- [Sumdog](https://learn.sumdog.com/en-gb/about-us) describes adaptive maths and spelling practice at the child’s level for ages 5–14. Archie’s measurable proposal here is narrower: retain the same spelling problem after a mistake and give a recoverable retry.
- [Oak National Academy’s pupil year chooser](https://www.thenational.academy/pupils/years) makes the learner’s school year explicit. Archie continues using its existing year selection; this change does not alter age eligibility.

The [England English programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study), including its spelling appendix, remains the statutory curricular source. Same-word retry, practice-point scoring and an optional break are app-design proposals, not statutory requirements. No proprietary content was copied.

## Unverified boundaries and next priority

Physical phones/tablets, real audible speech, microphone capture, hardware screen readers, live accounts/payments and real-child learning or enjoyment remain unverified. No merge or deployment was performed.

Next: complete a full Sudoku journey and the newly deployed parent-summary journey at phone/tablet widths, then verify saved tutoring is isolated by synthetic learner and year. Recheck the target, PRs, CI, Railway and separate Leonard/797 queue first.
