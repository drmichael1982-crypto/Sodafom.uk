# Archie improvement handoff

Read the latest note first and recheck GitHub/CI/deployment before work.

1. [Number Planets retry browser journey — 8 October 2026](2026-10-08-number-planets-browser-journey.md): covers wrong answer, blocked progression, explicit hint, retry and the 7/8 result at phone and tablet widths.
2. [Reconcile the latest Archie test design — 8 October 2026](2026-10-08-branch-reconciliation.md): combines the newest picture-piece/planet work with PR #81, restores a mergeable draft, and fixes the responsive Games search collapse exposed by hosted browser checks.
3. [Settled final score for assistive technology — 8 October 2026](2026-10-08-final-score-accessibility.md): keeps the sighted result animation while exposing the settled score immediately to assistive technology; includes a complete live Number Planets walkthrough and phone/tablet visual review.
4. [Learning year scope — 8 October 2026](2026-10-08-learning-year-scope.md): keeps all existing Years 1–9 while identifying Years 1–7 as the ages 5–12 main pathway and Years 8–9 as optional older extensions.
5. [Spelling practice instructions — 8 October 2026](2026-10-08-spelling-practice-instructions.md): clearly separates the visible study step from hidden-word input and verifies both states across phone/tablet simulated journeys.
6. [Grown-up unlock announcement — 8 October 2026](2026-10-08-grown-up-unlock-announcement.md): makes the focused unlock confirmation explicitly announce that the area opened and verifies focus in the full browser journey.
7. [Pager status announcement — 8 October 2026](2026-10-08-pager-status-announcement.md): gives shared paged screens explicit polite `Screen N of M` announcements while keeping the visual layout unchanged.
8. [Teacher puzzle subject/year grouping — 8 October 2026](2026-10-08-teacher-puzzle-grouping.md): groups local History/Fraction completions without guessing missing years or introducing pupil/cloud tracking.
9. [Teacher jigsaw reporting — 8 October 2026](2026-10-08-teacher-jigsaw-reporting.md): adds a local-only teacher view of the existing History/Fraction completion records and expands browser/visual coverage.
10. [History and fraction jigsaw progress — 7 October 2026](2026-10-07-history-fractions-progress.md): reconciles the live 26-piece space home, aligns early fraction circles to Years 1–2, adds pause/resume and saves completed jigsaws to grown-up progress; 832 unit tests pass locally.
11. [Reward contrast and compact navigation — 7 October 2026](2026-10-07-reward-contrast-and-compact-navigation.md): reconciled through live test lineage `61146b7`; fixes shared reward contrast, restores compact-home controls/routes and keeps completion navigation visible; 828 unit tests, 550 responsive checks and 68 simulated journeys.
12. [Bingo feedback and breaks — 7 October 2026](2026-10-07-bingo-feedback.md): accurate first-try scoring, hints, pause/resume and prior-run evidence.
13. [Game access — 7 October 2026](2026-10-07-game-access.md): preceding freeze/age-discovery repair and historical starting evidence.

Continue `improve/archie-learning-20261007`, draft PR #81, targeting `test/archie-2026-10-02`. The latest observed test deployment is `c173a256`; candidate pushes do not imply deployment.

Next bounded priority: extend Number Planets browser coverage to its younger addition and older multiplication/division tiers, including pause/resume retention, without duplicating the verified Year 4 journey. Keep Leonard's separate queue isolated; do not overwrite concurrent changes or merge/deploy.
