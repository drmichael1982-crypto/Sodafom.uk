# Teacher puzzle subject/year grouping — 8 October 2026

## Repository and deployment state checked first

- Continued `improve/archie-learning-20261007` and draft PR #81, targeting `test/archie-2026-10-02`; the remote PR head before this change was documentation commit `37eda497da0aae33052146c77fd8ceee25a9a453`.
- GitHub run #152 for that head completed successfully: install, TypeScript, 833 tests, build, browser routes, 68 simulated learner journeys and artifact upload passed. No older failure was assumed to be current.
- Directly reopened `https://archie-learning-test-production.up.railway.app/`. The rendered home still shows the dark-blue space jigsaw, gold controls, moving-planet artwork and blond Archie. This candidate does not alter that home or deploy it.
- The test branch remains `test/archie-2026-10-02` at `f254a44aa06bf0d8e4035059290e0a538393f886`. Leonard/sodafom797 remains separate; no overlapping current PR edit was found.

## Bounded change

1. The grown-up-gated Teacher puzzle summary now groups its existing local completion records by subject and by school year when the record ID proves the year.
2. Fraction records produce groups such as `Maths · Year 1`; History records produce `History · Year not recorded` because the older History completion format has no year. The interface explicitly says it will not guess one.
3. Each group shows a singular/plural completion count and its existing puzzle rows, stars and dates.
4. The grouping function filters out ordinary lessons/books and does not change storage, create pupil profiles, send data online or add rewards.
5. Browser checks require the Maths/History group headings and the transparent missing-year explanation before capturing the Teacher view. They now save separate Maths and History phone captures plus a tablet overview.
6. The final layout keeps each subject group on its own readable phone screen rather than shrinking text or controls. The tablet view shows both groups together. Previous/Next now also resets vertical page scroll so a newly selected screen starts at the top.

## Curriculum and comparison basis

- England mathematics source rechecked 8 October 2026: <https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study>. Its statutory year-specific fraction statements support showing the saved Fraction year accurately; this reporting layout itself is a design proposal, not a statutory requirement.
- Khan Academy Kids' official material shows subject/lesson progress and class reports: <https://www.khanacademy.org/khan-for-educators/resources/teacher-essentials/x12772614%3Akhan-kids-prek-2nd-grade/v/viewing-student-progress-class-reports-khan-academy-kids-teacher-tools>.
- Mathseeds' official help describes automated progress and achievement reporting: <https://support.mathseeds.com/en_GB/how-will-i-know-that-my-students-are-making-progress-in-mathseeds>.
- Those products are reporting benchmarks only. Archie's view is intentionally smaller, local-only and non-assessive; it is not equivalent class reporting or evidence of pupil progress, learning outcomes or enjoyment.

## Verification and rendered review

- `npm run type-check`: PASS.
- Targeted Teacher, History and Fraction tests: 3 files / 11 tests: PASS.
- Full Vitest: 84 files / 833 tests: PASS.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- `node --check scripts/test-archie-ui.cjs` and `git diff --check`: PASS.
- GitHub run #162 for code/evidence head `52597c5bf1d1af08145c4407d9998b98b8cbcba3`: PASS. TypeScript, 833 tests, production build, the browser route journey across all 130 game routes, 68 simulated learner journeys and artifact upload all passed.
- Direct artifact review at 390 × 844: the Maths screen shows the explanation, `Maths · Year 1`, its one-completion count and the full Fraction row without horizontal clipping; the History screen shows `History · Year not recorded`, its count and the full Ancient Egypt row without horizontal clipping. The two groups use separate phone screens and retain the large Previous/Next controls.
- Direct artifact review at 820 × 1180: School preview, Maths and History groups, school-year selection and subject controls are visible together; the established blue/gold styling, pale illustrated background and readable spacing remain coherent.
- These are simulated browser checks, not real-child testing or evidence of learning outcomes or enjoyment.

## Boundaries and next priority

No merge/deployment, paid service, credential change, real child data, 3D work or Leonard edit occurred. Physical-device microphone/audio, keyboard and screen-reader review, live accounts/payments, multi-child reporting and cross-device sync remain unverified.

Next bounded priority: physical-device keyboard and screen-reader review of the grown-up Teacher flow, followed by any reproduced focus-order or announcement defect.
