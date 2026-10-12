# Game-route CI reconciliation — 11 October 2026

## Verified starting state

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test branch: `test/archie-2026-10-02` at `1de32e64a725f5425e629d08d83b069c24a5d77c`, newer than the reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Railway test deployment `7c5aa590-1d6d-4288-8a3f-5659c4aeccb5` reached `SUCCESS` at 2026-10-11T05:22:00Z on that exact test commit.
- Continued dedicated branch `improve/archie-learning-20261007` and draft PR #81. Reconciliation commit: `bcf663e4051574cefa53c96b9e9b58afb25e4a7f`.
- PR #81 is open, draft and mergeable after reconciliation. No merge or deployment was performed.

The target’s fresh GitHub run [38114475439](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38114475439) passed dependency installation, TypeScript, 933 unit tests, the production build and Chromium installation. Its `Check buttons and game routes` step then failed while waiting for a game-card count. This is current failure evidence, not an inference from an older report.

## Bounded repair

The deployed Games page correctly treats each selected school year as an overlapping age band. Year 4 is ages 8–9, so a game advertised for ages 9–10 is eligible. The target’s browser checker used only `year + 4`, while the interface and the dedicated improvement branch use `[year + 4, min(year + 5, 13)]` and test interval overlap.

Merging the exact deployed target into the improvement branch preserves its new free-learning, contextual Spelling Snap and child-isolation work while restoring that browser calculation. On the current 130-game catalogue, the corrected expected counts are 59, 81, 109, 123, 124, 119, 107, 86 and 86 for Years 1–9. The observed deployed Year 4 menu also reports 123 games. This changes test accuracy only; it does not expose a game outside the app’s existing age policy or change lesson content.

## Verification

- Local TypeScript: PASS.
- Local unit suite: PASS — 144 files / 1,111 tests.
- Local Archie production build: PASS; the existing large-chunk and mixed-import warnings remain warnings.
- Candidate GitHub checks: PASS. The pull-request run
  [38117032209](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38117032209)
  and push run
  [38117030089](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38117030089)
  completed successfully. The previously failing `Check buttons and game routes`
  step passed, as did the 144-file/1,111-test unit suite, production build,
  all 130 linked game routes, short-landscape checks and simulated year-group
  game/spelling journeys. The interest-theme workflow
  [38117032192](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38117032192)
  also passed.

Direct inspection of the deployed app covered home, game selection, a complete ten-question Number Pop journey, spelling lesson, parent gate and teacher gate. Number Pop included a deliberate wrong answer, automatic hint, retry, pause/resume, nine further correct answers, completion and its reward scene. The blue/gold identity, pale illustrated background, blond Archie, clear controls and adult gates remain coherent. The desktop spelling whiteboard is visually sparse but readable. The first teacher screenshot briefly caught the loading state; a settled recheck showed the complete two-page adult-gated layout.

The candidate artifact `11694276783` contains 196 files and has digest
`sha256:251f0d2785ca86a0b40de043a750a93c6dcb195eabba6dd13e79199ebbb8d1e3`.
Its phone/tablet captures were inspected for home, Games, completed Number Pop,
spelling lesson, unlocked parent and unlocked teacher views. Branding, illustrated
backgrounds, Archie’s blond hair and green eyes, large controls and adult privacy
copy remain coherent without horizontal clipping. The 390 px Games view is dense
but usable; completion actions continue below the first phone viewport and remain
scrollable. The spelling lesson is readable at both widths but its very large empty
whiteboard area is a visual-density improvement opportunity, not a blocker for
this test-only repair. These are simulated interactions, not real-child testing or
evidence of enjoyment or learning outcomes.

## Curriculum and comparison boundary

- England’s statutory [English programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study) includes year-specific spelling and distinguishing homophones/near-homophones. The target’s contextual Spelling Snap content is preserved; this reconciliation adds no statutory claim or curriculum objective.
- Sumdog’s official description says its spelling practice is grouped by year and skill, while its broader product uses adaptive game-based practice. The relevant original benchmark is transparent year-appropriate discovery; Archie’s test checker now follows Archie’s own visible two-age year labels. No proprietary game, wording, character, art or lesson was copied.
- Khan Academy Kids’ official site describes a free mix of games, books and lessons for ages 2–8. It is a breadth/navigation benchmark only, not a universal-best claim and not an age-range substitute for Archie’s 5–12 scope.
- Stripe Directory instructions were used first as required. The Directory CLI is not installed in this runtime, so no provider was selected, engaged, purchased or provisioned; the comparison uses public official product sources.

This work does not touch 3D, `sodafom797`, payments, credentials, live accounts or real child data. Physical-device touch, microphone/audio, speech services and hardware screen readers remain unverified.

## Hosted result and next priority

The exact reconciliation commit
`bcf663e4051574cefa53c96b9e9b58afb25e4a7f` is green in hosted CI. The
successful candidate preserves the deployed two-age year labels and corrects the
checker that had timed out against them; no production merge or deployment was
performed.

Next bounded priority: after rechecking the target, PR and Leonard’s queue, give
the current contextual Spelling Snap game a complete supportive retry journey at
phone/tablet widths. Its present wrong-answer path reveals the answer and advances
automatically, so it should be evaluated for an explicit hint, retained correction,
optional pause/resume and clear completion/navigation without changing the
preserved curriculum content.
