# Adult progress navigation — 10 October 2026

## State rechecked before work

- Continued draft PR #81 on `improve/archie-learning-20261007`; no production branch was merged or deployed.
- Rechecked the remote target from repository evidence. `test/archie-2026-10-02` had advanced to `5a63b8358f89ad62b6e2c10c57f3458dd25a2225` (`Send shared game links to the catalogue`). The candidate was one commit behind, so it was reconciled as two-parent merge `e52c33bc2ef9dba2ede4a9048b839ed09ede3949` before this improvement. PR #81 remains draft and open. A final commit comparison reports the candidate ahead and zero behind, with `5a63b835` as its exact merge base; GitHub's PR metadata had not regenerated a merge commit after the documentation-only push, so this note does not claim a final mergeability state.
- Railway deployment `ecf2d076-8b74-483b-ac3b-31014d507bfd` is `SUCCESS` on target commit `5a63b835`, created 9 October 2026 at 23:48:58 UTC. The current public test URL is `https://archie-learning-test-production.up.railway.app/`. The candidate commit was not deployed. The separate `sodafom797` service was not changed.
- Current CI was checked before implementation. No candidate failure was inferred from an older report; the new run below is the authoritative check for this code.

## Reproduced defect and bounded fix

The parent and teacher areas exposed learning summaries but handed an adult to the generic `/progress` page. That page's back control returned to the child-facing My world route, so the adult lost the context they came from. The teacher puzzle summary also had no direct route to the full on-device progress view.

The implementation now:

- sends parent progress links to `/progress?from=parents` and teacher progress links to `/progress?from=teacher`;
- returns the progress page to `Parents and learning` or `Teacher lessons`, with an explicit accessible back label, according to that context;
- preserves the adult context when switching among Rewards, Sticker book and Progress;
- adds `Open full device progress` to the teacher's local puzzle-learning summary;
- keeps the default child journey unchanged: a direct `/progress` visit still returns to My world;
- adds focused component coverage and full-browser assertions for URL, adult back destination, accessible name, saved lesson/puzzle records and phone/tablet captures.

All progress remains local to the device. No pupil profile, cloud class record or real child data was introduced.

## Accessibility, curriculum and product comparison boundary

- [Sumdog's Individual Report](https://support.sumdog.com/knowledge/how-can-i-view-an-overview-of-a-students-level-and-progress) describes a route from an overview into an individual learner's current level and recent activity. [Mathletics reporting](https://knowledgebase.mathletics.com/en_GB/what-reporting-does-mathletics-have) describes participation, class summary and activity/skill mastery views. [Khan Academy Kids Teacher Tools](https://khankids.zendesk.com/hc/en-us/articles/360041862972-All-about-Teacher-Tools-in-Khan-Academy-Kids) describes a teacher view with Assignments and All Progress reports. These current official sources were used only as benchmarks for a clear summary-to-detail handoff and returning adults to their own task context; no characters, artwork, report content, proprietary lessons or interaction sequence was copied.
- Archie deliberately keeps this preview simpler and more private: one explicit full-progress action, a context-aware return, large controls and only on-device fictional/simulated records. This is a measurable navigation design improvement, not a claim of universal superiority or demonstrated educational outcomes.
- England's [National curriculum](https://www.gov.uk/government/collections/national-curriculum) remains the statutory boundary for the existing subject programmes and attainment targets. This navigation change does not add or alter a curriculum objective; its adult handoff and labels are Sodafom design proposals.
- The Stripe Directory workflow was checked before the fresh provider comparison. No provider was selected, subscribed to, provisioned, integrated or paid.

## Verification

- Published branch: `improve/archie-learning-20261007`.
- Reconciliation merge: `e52c33bc2ef9dba2ede4a9048b839ed09ede3949`.
- Code commit: `3515ea18fcb247ce5ee01af8735af3382aa0bbff` (`Keep adult progress navigation connected`).
- Focused component suite: PASS, 2 files / 7 tests.
- Local full suite after reconciliation: PASS, 111 files / 950 tests.
- `npm run type-check`: PASS.
- `npm run build:archie`: PASS with the existing mixed-import and large-chunk warnings.
- Focused ESLint: 0 errors and 12 inherited warnings in the touched/reconciled files.
- Local browser execution was not claimed: Chromium was absent and the Playwright CDN returned a truncated download. Hosted Chromium supplied the browser authority instead.
- [GitHub Actions run #280](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38007371681): PASS — TypeScript, 111 files / 950 tests, production build, all 130 linked game routes, 12 core browser journeys, adult parent/teacher progress handoffs, all existing full-game/lesson scenarios, and 82 simulated search/game journeys. The browser run reported no horizontal overflow, zero browser errors and zero live API requests.
- Artifact `11651995819`: 171 files, 77,805,929 bytes, SHA-256 `5a6eef3f1cd50761d474ebcb714ba33a87fe65822e4c23fd7732d75f63f0da39`.

## Rendered evidence reviewed

- Directly opened the current deployed home, Games catalogue, lesson selection, parent gate and teacher preview. The deployment is on the current target commit, not the candidate. The established blue/gold identity, pale illustrated background, large controls, 2D picture playground and blond Archie artwork remain intact; the new shared Games destination resolves to `/games`.
- Reviewed the hosted candidate's `parent-progress-390.png`, `parent-progress-820.png`, `teacher-progress-390.png` and `teacher-progress-820.png`. Both adult handoffs show a readable `My progress` heading, three summary tiles, large Rewards/Sticker book/Progress controls and expected recent-learning records without clipping or horizontal overflow. The phone view uses a second page for the lower records while the tablet view keeps the summary and records together.
- Reviewed hosted phone/tablet captures for home, Games, spelling lesson, unlocked parent/teacher pages and a completed Maths Bingo run. The broader layout and feedback remain coherent. The completed game shows retry-derived two-star feedback at 390px and a three-star completion at 820px; these are simulated interactions, not real-child tests or evidence of learning outcomes/enjoyment.
- The browser assertions also verified that the adult query survives Rewards/Progress tab changes and that the back control returns to the originating adult page with the correct accessible name. This behavior is not yet present on the live test deployment because nothing from this PR was deployed.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, live payment, real child data or 3D work was used. Leonard's `sodafom797` queue remained separate. Physical-phone/tablet touch, real keyboard/screen-reader, microphone/audio, live-account/payment and real-child checks remain unverified.

Next bounded priority: inspect the reading/spelling voice path on the current candidate, especially microphone-denied and audio-unavailable recovery at phone/tablet widths, and fix only a newly reproduced defect.
