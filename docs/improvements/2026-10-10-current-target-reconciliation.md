# Current target reconciliation and live visual review — 10 October 2026

## Fresh repository and deployment evidence

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- The active children’s test branch was re-resolved from the Railway deployment and GitHub branch rather than inferred: `test/archie-2026-10-02` at `0b7a9968df47f96936ebd699899795eca1b162df`.
- Railway deployment `d20a0e02-f4e7-407c-a6ca-be80b1743066` is `SUCCESS` on that exact commit. It was created on 10 October 2026 at 07:30 UTC. No deployment was started or changed in this run.
- The target is two commits newer than the previously recorded `1bd5690800fc8e24cccbe3b017e148466dffa945`. Its current repairs cover parent-dashboard API shape, point-based score normalisation, the final timed-tables answer, the phone scroll region and local nickname use. GitHub reports no pull-request workflow run for the target commit; its commit message records 119 test files / 823 tests plus TypeScript and build checks.
- Open pull requests were rechecked. Draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) is the existing 2D Archie improvement queue; PR #80 remains the separate responsive-home proposal. The deferred 3D PRs and the `sodafom797` admin/business PR remain separate and were not changed.

## Reconciliation completed

- Candidate branch: `improve/archie-learning-20261007`.
- Published merge commit: `918c5a1fbf1afdf9ee304bd74375c9f0f9fa26b2`.
- Parents: documented Reading Quest head `f7700bcef8a766fab9b14adfef5113f230647ae5` and current test target `0b7a9968df47f96936ebd699899795eca1b162df`.
- GitHub comparison now reports the candidate 119 commits ahead and zero behind the current test target, with `0b7a996…` as the merge base. PR #81 remains open, draft, unmerged and currently `mergeable: true`.
- The only content conflict was Maths Bingo. The resolution keeps the candidate’s age-scaled 3×3/4×4 card, explicit wrong-answer feedback, hint, pause/resume, retry-aware scoring, reduced-motion behavior and unmount cleanup. It also retains the target’s new completed-line regression, adapted to the starter card’s three-cell line and the accessible `Bingo number N` button names.
- Reading Quest and the shared voice provider did not overlap the target delta. No character art, branding, curriculum content, payments, credentials, deployment configuration, 3D code or `sodafom797` code changed.

## Curriculum and comparison continuity

This reconciliation changes no lesson objective, passage, question, year policy or reward rule. The bounded Reading Quest repair remains grounded in the [England English programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study) and [DfE reading framework](https://www.gov.uk/government/publications/the-reading-framework-teaching-the-foundations-of-literacy) for the distinction between reading practice, comprehension and a complete systematic programme. [Khan Academy Kids' official literacy description](https://learn.khanacademy.org/khan-academy-kids/) remains a product benchmark only for pairing accessible print with optional read-aloud support. The original story, questions, interface, Archie character and art were not copied. Exact source interpretation and boundaries are recorded in the [Reading Quest speech-recovery note](2026-10-10-reading-quest-speech-recovery.md); no statutory or educational-outcome claim is added here.

## Checks

- Focused reconciliation/voice suite: PASS — 8 files / 55 tests.
- Full Vitest: PASS — 124 files / 989 tests.
- TypeScript: PASS.
- Archie production build: PASS; existing mixed-import and large-chunk warnings remain.
- `git diff --check`: PASS.
- GitHub Actions [Archie test build #355](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38036834287): PASS. Every step completed successfully: dependency install, TypeScript, 989 tests, production build, Chromium installation, the core browser journey, the 82-scenario simulated year/search/game matrix and artifact upload.
- Core hosted journey: PASS — 15 journeys, 130 game routes, zero browser errors and zero live API requests.
- Responsive hosted sweep: PASS — phone, foldable, tablet and landscape layouts reported no horizontal overflow.
- Hosted scenario matrix: PASS — 82 simulated search/game journeys.
- Evidence artifact: `archie-test-results`, artifact `11663939646`, 79,711,117 bytes, 179 extracted files, digest `sha256:03bc4c5703778823f819c4fac24e29e494374e30168bd0fe1a32abcaa70135ab`.

## Direct live visual walkthrough

This review used the deployed target, not the unpublished candidate, and simulated a learner rather than claiming child testing.

- Home: directly rendered with the blue/gold SODAFOM header, pale illustrated background, complete picture-playground composition and blond, emerald-eyed Archie. Controls were large and visually coherent at the cloud browser’s desktop width.
- Game selection: directly rendered Year 4 with 105 games, visible search/subject controls and a three-card page with explicit `1 / 35` navigation. The large catalogue is paged rather than presented as one long wall.
- Complete game: Number Planets was exercised through an intentional wrong choice, explicit hint, pause/resume, corrected retry, all eight missions and the rocket-completion scene. The run recorded seven first-try discoveries because the first mission was deliberately retried. This proves interaction flow, not learning or enjoyment.
- Lessons: Year 4 Maths rendered a clear next-adventure card, 36 teaching weeks, 180 planned lessons, week-one sequence and term browsing.
- Parent page: the grown-up instruction gate opened correctly. The parent hub exposed sign-in separately from local learning settings, optional AI boundaries and local-device progress; no account, payment or API key was used.
- Teacher page: the gate and lesson data opened, but the deployed target left the old gate panel and the teacher list side by side in the horizontal flow. At the observed desktop width both columns clipped horizontally. This is a concrete deployed visual defect. It is not yet attributed to the candidate because the candidate contains newer dynamic pager remeasurement code and must be judged from its own artifact.

## Candidate artifact visual review

These are browser-produced captures from the unpublished candidate, not the deployed target and not real-child tests.

- Reading Quest at 390×844: the complete printed passage remains readable, the two large actions remain visible, and unsupported speech produces a prominent calm recovery card with a `Got it` action instead of silent failure. The narrow action label wraps its target emoji onto a second line, but it remains legible and does not clip or cause horizontal overflow.
- Reading Quest at 820×1180: the passage and both actions fit in one clear learning card. The recovery notice sits above the bottom controls, remains fully visible and does not obscure the printed passage.
- Teacher after unlock at 390×844: the candidate displays one coherent `School preview` page with clear local-only/no-pupil-data guidance and usable previous/next navigation; the deployed desktop side-by-side clipping is not reproduced at phone width.
- Teacher after unlock at 820×1180: the preview, local-device progress, school-year and subject controls, first lesson unit and footer all remain within the tablet viewport. There is no horizontal clipping in the captured tablet state.
- These captures establish the candidate’s phone/tablet rendering only. The deployed target’s desktop post-unlock defect still requires a dedicated candidate desktop assertion before it can be considered resolved.

## Boundaries and next priority

Physical phones/tablets, audible speech output, microphone capture, hardware screen readers, live parent accounts/payments and real-child outcomes remain unverified.

Next priority: add a dedicated 1440×900 candidate journey that unlocks the teacher area and asserts that the old gate panel leaves layout flow before measuring horizontal overflow. If the candidate reproduces the deployed clipping, repair that pager reflow; otherwise preserve the passing phone/tablet behavior and record the deployed-target/candidate difference. Keep the draft ready for owner review without deploying or merging it.
