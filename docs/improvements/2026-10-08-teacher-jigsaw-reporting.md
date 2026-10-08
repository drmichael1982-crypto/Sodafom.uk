# Teacher jigsaw reporting — 8 October 2026

## Repository state checked first

- Continued `improve/archie-learning-20261007` and draft PR #81, targeting `test/archie-2026-10-02`.
- Rechecked remote refs: the current test branch remains `f254a44aa06bf0d8e4035059290e0a538393f886`; the PR head before this change was the documentation commit `81c5653910e1c31e7731dd7ffd84483680c6d025`.
- GitHub run #140 for `81c5653` completed successfully: install, TypeScript, 833 tests, build, browser route checks, simulated learner journeys and artifact upload passed. No current failure was carried forward from an older report.
- The live test deployment was not changed. Leonard/sodafom797 work remains separate and no overlapping Archie edit was observed in the current remote refs.

## Bounded change

1. The grown-up-gated Teacher lessons page now shows `Recent puzzle learning on this device`.
2. It filters the existing on-device activity list for `history-jigsaw-*` and `fraction-jigsaw-year-*` records. It does not write a second activity, award another star, create a pupil profile or send progress online.
3. Ordinary lesson/book records stay out of this small puzzle summary; the full on-device list remains available in My progress.
4. The browser journey now completes one History scene after a wrong-answer retry, completes the Year 1 Fraction sequence, checks each completion ID occurs once, opens the teacher summary through the grown-up gate and captures History, Fraction and teacher-summary states at 390 × 844 and 820 × 1180.
5. `/history` is now included in the responsive overflow matrix at every tested phone, foldable, tablet, landscape and desktop viewport.

## Curriculum and comparison basis

- England mathematics source rechecked 8 October 2026: <https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study>. The existing Year 1/2 fraction boundaries remain unchanged by this reporting work.
- Khan Academy Kids' official teacher material describes student progress and class reports: <https://www.khanacademy.org/khan-for-educators/resources/teacher-essentials/x12772614%3Akhan-kids-prek-2nd-grade/v/viewing-student-progress-class-reports-khan-academy-kids-teacher-tools>.
- Mathseeds' official help states that it provides automated student progress and achievement reporting: <https://support.mathseeds.com/en_GB/how-will-i-know-that-my-students-are-making-progress-in-mathseeds>.
- These products are reporting benchmarks only. Archie's new panel is deliberately smaller and local-only; it is not presented as equivalent class reporting, an assessment, demonstrated learning progress or evidence that a child enjoyed the activity.

## Verification before publication

- `npm run type-check`: PASS.
- Targeted Vitest: Teacher lessons, History Jigsaw and Fraction Jigsaw — 3 files, 11 tests: PASS.
- Full Vitest: 84 files, 833 tests: PASS.
- `npm run build:archie`: PASS, with the existing bundle-size and mixed dynamic/static import warnings.
- `node --check scripts/test-archie-ui.cjs`: PASS.
- The expanded GitHub browser journey and its six new rendered captures require publication and a current CI run before they are claimed as passing or visually approved.
- Published commit `5be8d97ea997a7e24d262e7090a2aba4e4b4244e` passed GitHub run #142: install, TypeScript, 833 tests, build, the expanded browser route/puzzle/teacher journey, all 130 game routes, 68 simulated learner journeys and artifact upload.
- Direct review of the six new screenshots found History and Fraction completion states clear at both widths and the teacher summary clear at 820 × 1180. It also reproduced a 390 × 844 defect: the unlocked gate's full-height wrapper nested the teacher content inside one pager column, so page 2 was shifted and clipped. The unlocked gate now returns a focusable screen-reader announcement followed by its content as direct pager children; this preserves the focus test while allowing phone columns to flow correctly. Run #144 passed every check, but its immediate phone capture caught the 150 ms pager transition after the gate reflow rather than a settled panel. The summary heading is now an explicit programmatic focus target and the visual check waits 250 ms before both captures. Another replacement artifact is required before visual approval.

## Boundaries and next priority

No production merge/deployment, paid service, credential change, real child data, 3D work or Leonard edit occurred. Physical-device microphone/audio, screen-reader and keyboard review, live accounts, payments, multi-child teacher records and cross-device sync remain unverified.

Next bounded priority: publish this candidate, inspect the exact GitHub browser steps and the six new History/Fraction/teacher screenshots, then fix only reproduced failures or visual defects.
