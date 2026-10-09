# Archie improvement handoff

Read the latest note first and recheck GitHub/CI/deployment before work.

1. [Page-jigsaw identity strip and narrow-phone controls — 9 October 2026](2026-10-09-page-jigsaw-identity-strip.md): prevents the full-screen mode strip from clipping, repairs fixed jigsaw navigation targets at the 280px and short 320px boundaries, and keeps the tablet board inside the viewport.
2. [Maths Bingo keyboard hint and pause focus — 9 October 2026](2026-10-09-maths-bingo-keyboard-pause-focus.md): reconciles the newest full-screen jigsaw work and verifies Bingo wrong-answer, hint and pause/resume controls entirely by keyboard at phone/tablet widths.
3. [Number Planets keyboard hint and pause focus — 9 October 2026](2026-10-09-number-planets-keyboard-pause-focus.md): activates Show hint, Pause mission and Resume mission by keyboard, asserts focus recovery and visually verifies the retry/pause states at phone/tablet widths.
4. [Number Planets keyboard focus journey — 9 October 2026](2026-10-09-number-planets-keyboard-focus.md): uses Enter/Space for Number Planets answers and progression, retaining a failed choice and verifying the correct-answer/Next/question focus sequence at phone/tablet widths.
5. [Number Planets Year 7 division retry — 8 October 2026](2026-10-08-number-planets-division-retry.md): moves the older-tier recovery sample onto a real division mission and verifies its groups hint, retained break state and two-star completion at phone/tablet widths.
6. [Number Planets retry recovery across age tiers — 8 October 2026](2026-10-08-number-planets-retry-age-samples.md): samples explicit wrong-answer, hint, preserved break and corrected retry behavior in younger, middle and older tiers at phone/tablet widths.
7. [Number Planets Years 1–7 browser coverage — 8 October 2026](2026-10-08-number-planets-years-one-to-seven.md): verifies every main-path year tier at phone/tablet widths, including operation bands, pause/resume, exact mission retention and completion.
8. [Whole-page jigsaw touch-target guard — 8 October 2026](2026-10-08-jigsaw-touch-targets.md): measures every fixed control, loose piece, empty space and action across six viewports and protects the larger 44 × 44 target plus keyboard-revealed tray access.
9. [Number Planets age-tier and pause coverage — 8 October 2026](2026-10-08-number-planets-age-tiers.md): reconciles the latest continuous jigsaw/account work, repairs the resulting test-mock failure and covers younger/older Number Planets tiers with pause/resume.
10. [Number Planets retry browser journey — 8 October 2026](2026-10-08-number-planets-browser-journey.md): covers wrong answer, blocked progression, explicit hint, retry and the 7/8 result at phone and tablet widths.
11. [Reconcile the latest Archie test design — 8 October 2026](2026-10-08-branch-reconciliation.md): combines the newest picture-piece/planet work with PR #81, restores a mergeable draft, and fixes the responsive Games search collapse exposed by hosted browser checks.
12. [Settled final score for assistive technology — 8 October 2026](2026-10-08-final-score-accessibility.md): keeps the sighted result animation while exposing the settled score immediately to assistive technology; includes a complete live Number Planets walkthrough and phone/tablet visual review.
13. [Learning year scope — 8 October 2026](2026-10-08-learning-year-scope.md): keeps all existing Years 1–9 while identifying Years 1–7 as the ages 5–12 main pathway and Years 8–9 as optional older extensions.
14. [Spelling practice instructions — 8 October 2026](2026-10-08-spelling-practice-instructions.md): clearly separates the visible study step from hidden-word input and verifies both states across phone/tablet simulated journeys.
15. [Grown-up unlock announcement — 8 October 2026](2026-10-08-grown-up-unlock-announcement.md): makes the focused unlock confirmation explicitly announce that the area opened and verifies focus in the full browser journey.
16. [Pager status announcement — 8 October 2026](2026-10-08-pager-status-announcement.md): gives shared paged screens explicit polite `Screen N of M` announcements while keeping the visual layout unchanged.
17. [Teacher puzzle subject/year grouping — 8 October 2026](2026-10-08-teacher-puzzle-grouping.md): groups local History/Fraction completions without guessing missing years or introducing pupil/cloud tracking.
18. [Teacher jigsaw reporting — 8 October 2026](2026-10-08-teacher-jigsaw-reporting.md): adds a local-only teacher view of the existing History/Fraction completion records and expands browser/visual coverage.
19. [History and fraction jigsaw progress — 7 October 2026](2026-10-07-history-fractions-progress.md): reconciles the live 26-piece space home, aligns early fraction circles to Years 1–2, adds pause/resume and saves completed jigsaws to grown-up progress; 832 unit tests pass locally.
20. [Reward contrast and compact navigation — 7 October 2026](2026-10-07-reward-contrast-and-compact-navigation.md): reconciled through live test lineage `61146b7`; fixes shared reward contrast, restores compact-home controls/routes and keeps completion navigation visible; 828 unit tests, 550 responsive checks and 68 simulated journeys.
21. [Bingo feedback and breaks — 7 October 2026](2026-10-07-bingo-feedback.md): accurate first-try scoring, hints, pause/resume and prior-run evidence.
22. [Game access — 7 October 2026](2026-10-07-game-access.md): preceding freeze/age-discovery repair and historical starting evidence.

Continue `improve/archie-learning-20261007`, draft PR #81, targeting `test/archie-2026-10-02`. The latest observed test deployment is `767b3e61`; candidate pushes do not imply deployment.

Next bounded priority: inspect the parent/teacher navigation and progress handoff at phone/tablet widths, then fix only a reproduced defect. Keep Leonard's separate queue isolated; do not overwrite concurrent changes or merge/deploy.
