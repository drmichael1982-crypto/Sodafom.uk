# Reading Quest supported retry and optional break — 11 October 2026

## Repository and live evidence

- Verified test target before editing: `test/archie-2026-10-02` at `8b4c9218118648a6bb519efef7ee18deaa68307b` (`Repair parent reward emails and badge progress`).
- Dedicated candidate branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81).
- The candidate was reconciled with the new target before the Reading Quest files were changed. The target's parent-reward API and storage work did not overlap the game.
- Railway deployment `789c5aed-507f-42a0-ad44-cac55fdeb057` succeeded on the exact target commit with no pending work. The separate Railway `sodafom797` service remained untouched.
- The Stripe Directory instructions were checked before any provider lookup. No provider was selected, paid or provisioned; the directory CLI was unavailable in this runtime.

On the current Railway test app, the rendered Year 4 Reading Quest was opened directly. Selecting the deliberately wrong answer `The garden` disabled every answer, revealed the correct answer, and moved from question 1 to question 2 after about one second. There was no clue, supported correction or break control. This is fresh browser evidence from 11 October 2026, not an inference from an older report.

The same live review confirmed the blue/gold identity and pale picture-puzzle background across Home, the 123-game Year 4 menu, the 36-week/180-lesson Year 4 course, and the parent/teacher grown-up gates. Reading Quest used readable text and large answers on the desktop capture, but its mistake handling conflicted with the app's otherwise supportive language.

## Bounded improvement

Reading Quest now:

- keeps a mistaken question active instead of revealing the answer and advancing;
- disables only the attempted wrong choice, leaving the learner able to correct it;
- gives an evidence-finding clue for every passage question rather than giving the answer;
- offers an optional pause/resume control that preserves the question and clue;
- lets the learner re-read the passage and return to the same question without resetting the quiz;
- reports first-attempt comprehension separately from eventual completion, while still rewarding a corrected finish;
- cancels delayed progression on unmount and submits completion only once;
- uses 48-pixel-equivalent answer and support controls with clear status regions.

This is a design improvement, not evidence of improved learning outcomes or enjoyment. The browser scenarios use simulated learners and no real child data.

## Curriculum and current product benchmarks

- **Statutory England curriculum:** the [English programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study) separate word reading and comprehension, and require pupils to develop understanding, discuss/clarify vocabulary, and check that text makes sense. The evidence clues and re-reading path are an original design proposal supporting those requirements; pause behavior is supportive design, not a statutory requirement.
- **Khan Academy Kids:** its [official early-reading page](https://www.khanacademy.org/kids/ela) describes read-aloud stories with word highlighting. That informed retaining the existing optional read-aloud and printed passage; Archie does not copy its stories, art or interaction.
- **Reading Eggs:** its [official lesson description](https://readingeggs.co.uk/schools/lessons/) describes immediate feedback, while its [differentiation page](https://readingeggs.co.uk/schools/differentiated-learning/) describes clear read-aloud instructions and constructive feedback. Archie now makes feedback immediate but non-terminal and explicitly evidence-based.
- **Nessy:** its [official school overview](https://nessy.com/en-us/shop/school-products/) presents structured literacy and dyslexia support. Archie keeps uncluttered controls, a calm break and persistent printed text, without claiming equivalent specialist validation.

There is no single objectively best app. The relevant comparison here is narrow: age coverage, clarity, feedback quality, recovery after error, accessibility, navigation, privacy and curriculum fit. No proprietary lesson, character, art or wording was copied.

## Validation

- `npm run type-check` — passed.
- `npx vitest run src/pages/games/reading-quest.test.tsx --maxWorkers=1 --testTimeout=20000` — 1 file / 4 tests passed.
- `npx vitest run --maxWorkers=2 --testTimeout=20000` — 161 files / 1,169 tests passed.
- `npm run build` — passed (existing chunk-size and stale Browserslist-data warnings only).
- Added a dedicated Chromium journey for 390×844 and 820×1180 that covers a deliberate wrong answer, evidence clue, pause/resume, corrected retry, all three questions, two-star/67% completion, navigation containment and screenshots.
- Local execution of that browser journey was blocked because the shared Playwright Chromium binary disappeared from the runtime cache after build/test execution. The script is included in the hosted workflow so its result and captures can be checked from the exact pushed commit before this note is treated as final browser proof.
- Hosted run #469 passed TypeScript, all 1,169 tests, the production build, all 15 established browser journeys, 130 game routes and the responsive layout sweep. The new journey then exposed an ambiguous test selector that read a different responsive `h2` instead of the visible game question. The app behavior had not failed; the selector is now bound to an explicit question marker and must pass a fresh hosted run before browser completion is claimed.
- Hosted run #471 passed TypeScript, all 1,169 tests, the production build, all 15 established journeys, all 130 routes and the responsive sweep, then reproduced a genuine phone layout defect: the paged game wrapper treated Reading Quest's `w-full` play area as wider than one screen, clipping the retry/break card and leaving the corrected answer outside the active page. The play area is now explicitly one pager-screen wide with smaller phone padding, and the journey verifies the learner can use the visible Previous control after resuming before retrying.
- Hosted run #474 showed that the one-screen width rule did not make the fragmented answer list reliably reachable: after returning from the retry/break fragment, the correct answer disappeared from the rendered accessibility tree. Reading Quest now opts into a labelled, vertically scrollable play region instead of column pagination. This keeps the passage/question sequence on one reading surface while retaining the fixed game header and large controls; the next hosted run must verify the complete phone/tablet journey and captures.

## Boundaries and next priority

- No merge, deployment, production change, credential change, payment activation, paid service, 3D work or `sodafom797` edit was made.
- Physical-device touch, microphone/audio, hardware screen-reader behavior, live accounts/payments and real-child outcomes remain unverified.
- Next: inspect the exact candidate's hosted phone/tablet screenshots and full workflow, then continue with the next freshly reproduced lesson/reading defect rather than duplicating this recovery work.
