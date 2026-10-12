# Spelling Snap supported retry and optional break — 11 October 2026

## Current handoff

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Dedicated 2D improvement branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), targeting `test/archie-2026-10-02`.
- Rechecked target before work: `a3b1079d4bf0b8ecab3c56ddb39ee3f3e5789904` (`Keep free learning private and measurable`), newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`. After the candidate passed, the target advanced independently to `bdc02e01abe2aedc87a57cfe071e7c64b79d4bb2` (`Correct learning records and free access UI`).
- Reconciliation commit: `aa46e2e4a080f534150791fd303d882db4399892`; initial implementation commit: `b1d141faebdf1b267a6af9436105ebe4d0d3f1d0`; final verified code head: `404473d3a0340941474ec666eecf59b15f78ecf1`. This note is a following documentation-only commit.
- Railway deployment `e2450f46-6261-40f6-8b44-2641532a787a` is `SUCCESS` and exactly matches the newer target `bdc02e01`; Railway reports no staged changes or pending work. This candidate was not deployed.
- Leonard's developer app remains the separate `drmichael1982-crypto/sodafom797` workstream. No Leonard source, 3D work, production setting, credential, paid service, payment or real child data was changed. An active Leonard worker queue was not observable.

## Fresh reproduction

The live test deployment was opened before editing. In Spelling Snap, selecting the wrong option for `Football ___ starts at four.` immediately showed `It was "practice"`, disabled both choices and automatically changed the question after 800 ms. The learner could not use meaning to correct the same sentence, pause, or demonstrate the correction. This is current deployed evidence, not an inference from an older report.

The live deployment was also directly inspected on home, Games, spelling lesson, parent gate and teacher gate pages. Blue/gold branding, the pale illustrated world, blond Archie with green eyes and adult privacy guidance remain coherent. The Games list is visually busy and repeats generic art. The spelling lesson is clear but very sparse on a wide screen. The teacher page briefly displayed a loading spinner before settling correctly; no persistent fault was observed.

## Changed behaviour

Spelling Snap now:

- Runs each of its ten existing contextual confusable-word questions once instead of selecting randomly with repeats.
- Keeps a mistaken sentence on screen, disables only the attempted spelling and leaves the alternative available for correction.
- Gives a short original meaning contrast for every pair, including British-English noun/verb guidance for `practice/practise` and `licence/license`; the hint is available before or after an error.
- Separates first-attempt accuracy from eventual practice completion. Correcting one mistake and answering the other nine first time yields `9/10`, `90%` and the existing three-star threshold rather than pretending the first attempt was correct.
- Adds Pause/Resume. The sentence, error, hint and score are retained; answer and hint controls are unavailable during the optional break.
- Cancels a delayed completion callback when the game is left.
- Uses at least 48 px-high answer, hint and pause controls in the component, with visible text rather than icon-only learning actions.
- Keeps its changing feedback inside a contained vertical reading surface. Hint and pause controls stay ahead of the expanding feedback, so the 390 px game window can scroll to every recovery action without sideways overflow.

The browser journey enters Spelling Snap through the year-filtered Games menu for Years 3–9 at 390×844 and 820×1180, then checks keyboard hint activation, pause/resume focus, wrong-answer retention, a break after an error, corrected completion, exact score/reward and return navigation. These are labelled simulated learner scenarios; they are not tests with real children and do not demonstrate learning outcomes or enjoyment.

The current target's Word Scramble 44 px control test was also reconciled with this branch's retained, replayable `Show hint` button. The full suite initially caught the stale expectation that the button disappeared; the repaired assertion protects both size and `aria-pressed` state.

## Verification

| Check | Result |
| --- | --- |
| Spelling Snap and Word Scramble component tests | PASS — 9 tests |
| Full unit suite | PASS — 147 files / 1,139 tests |
| TypeScript `--noEmit` | PASS |
| Archie-test Vite build | PASS; existing large-chunk and mixed-import warnings remain |
| Browser script syntax / diff whitespace | PASS |
| First hosted branch workflow | FAILED precisely at keyboard hint-focus assertion after install, type, all units, build, Chromium and the route/layout suite passed — run [38120789238](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38120789238) |
| Second hosted branch workflow | FAILED later in the same journey after the focus repair: the two long controls overflowed the final phone panel, leaving `Pause game` beyond it while `Next` was disabled — run [38121224524](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38121224524) |
| Final hosted branch workflow | PASS — [run 38123962878](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38123962878), workflow #459: TypeScript, 147 files / 1,139 tests, build, Chromium, 15 core journeys, 130 game routes, responsive/jigsaw/short-landscape checks, 98 simulated search/game journeys and learner-isolation checks |

The first hosted browser attempt found a real keyboard regression: activating `Show meaning hint` disabled the focused button and caused focus loss. The hint was changed to remain enabled and replayable, while `aria-pressed` continues to expose its shown state. The second attempt then reached the Pause action and found its long side-by-side label outside the final phone panel. Later iterations distinguished a truncated remote test upload from the actual layout and then exposed the underlying dynamic-height problem: feedback could grow below the fixed game viewport. The final implementation stacks controls on phones, keeps them before feedback and gives the game body a contained vertical scroll. The local Playwright browser download was separately blocked by the execution network returning an empty archive, so final rendered candidate claims rely on the repository CI's independent Chromium installation.

## Final rendered review

The exact final-head artifact from workflow #459 was directly inspected, separately from the live deployment:

- At 390×844, paused, wrong-answer retry, moving reward and settled result are contained within the game frame. `Show meaning hint`, `Pause game` and the answer retry remain large and reachable through the internal vertical reading surface; there is no sideways clipping. The phone view is intentionally scrollable rather than pretending all feedback fits on one screen.
- At 820×1180, the same states fit comfortably, with paired controls, readable meaning contrast and substantial whitespace. The settled result shows the honest `90%`, `9 correct out of 10 questions` and three-star reward.
- Fresh Home, Games, spelling lesson, parent gate/unlocked page and teacher preview/unlocked page captures were inspected at both sizes. Blue/gold branding, pale illustrated puzzle world and blond, green-eyed Archie remain intact. Games is denser on phone; the spelling whiteboard remains unusually sparse on tablet. Adult privacy guidance and large controls remain readable.
- The artifact records 98 simulated journeys and zero browser errors. This is automated interaction evidence, not real-child usability, enjoyment or attainment evidence.

## Curriculum and official product comparison

Checked 11 October 2026:

- [DfE English programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study) is statutory guidance for England and links the statutory spelling appendix. The detailed programme says writing includes spelling and emphasises word structure, spelling structure, vocabulary relationships and clarifying words with more than one meaning. Its notes identify homophone knowledge from Year 2 and call for plenty of spelling practice in Years 3–4. The app's exact ten pairs, hints, attempt scoring and age/menu placement remain design choices, not statutory requirements.
- [Sumdog's official spelling page](https://learn.sumdog.com/en-gb/subjects/spelling) groups spelling words by year and skill and describes reading a word in a sentence to provide context. This supports the benchmark of contextual, age-organised practice; no Sumdog wording, art, characters or proprietary lesson was copied.
- [British Council LearnEnglish Kids](https://learnenglishkids.britishcouncil.org/getting-started-for-kids) describes games and `Tricky words` spelling-rule practice for ages 5–12. Its [Playtime page](https://www.britishcouncil.org/english/kids-teens/apps/learnenglish-kids-playtime-age-6-11) also describes vocabulary/spelling games and a parent progress area. These are feature benchmarks only; there is no universal-best or superiority claim.
- [Sumdog's current overview](https://learn.sumdog.com/en-us/) describes real-time adaptation, instant feedback and reporting for ages 5–14. Spelling Snap does not yet adapt difficulty or provide a teacher misconception report; those remain possible future improvements, not current claims.

Stripe Directory was consulted before any provider/organisation selection as required, but its local CLI transport was unavailable. No provider was selected, contacted, purchased or provisioned; the comparisons above use current official public product sources.

## Explicit limits and next priority

- Real-device touch, microphone/audio, speech services and hardware screen readers remain unverified.
- Live accounts and payment readiness remain unverified and were not changed.
- All browser learners are simulated. The full inherited game/year and course/teacher lesson matrix is still larger than this bounded change.
- Draft PR #81 currently reports a merge conflict after the target advanced. A local reconciliation attempt identified the overlap specifically in `src/lib/archie/storage.ts`; it was aborted without publishing or overwriting either implementation. The newer target's learning-record isolation must be reconciled deliberately with this branch's learner settings/game-star scoping and both test sets rerun.
- Next priority: resolve that storage conflict and rerun the full hosted suite before extending complete phone/tablet walkthrough coverage to the next currently observed reading, voice or lesson failure.
