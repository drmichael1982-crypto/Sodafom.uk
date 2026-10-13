# Learner catalogue and free-access reconciliation — 13 October 2026

## Repository state

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test target from repository evidence: `test/archie-2026-10-02@6b4ac34fe08a3427925e723cfbbe0541191bcb58` (`Keep classic home free-access claims accurate`). This is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81).
- Application reconciliation commit: `ca19ce5c9c7ec589c0a1671a3c928ccc6d54b30d` with parents `4577f7ce3623000769a296fe6ab2a9229329f7bd` and current target `6b4ac34fe08a3427925e723cfbbe0541191bcb58`.
- The target and candidate heads were rechecked immediately before the leased branch update. No production merge or deployment was performed.

The separate 3D and `sodafom797` work was not touched. Leonard’s private queue is not exposed here; current branches, open PR state and exact changed files are the available conflict checks.

## Bounded reconciliation

- The classic game catalogue now defaults to the active learner’s exact saved age band, caps age 13 to `12–13`, retains explicit URL/home selections, and resynchronises when the active learner changes.
- The candidate keeps its learner-scoped star reader; the target’s older device-wide star reader was deliberately not reintroduced.
- The reachable `/classic-home` page no longer advertises a £1 subscription or trial while payment collection is off. Its secondary action now opens the free games catalogue.
- Focused tests cover valid, boundary and invalid saved ages plus the free-access copy guard.
- No lesson content, statutory objective, game scoring, artwork, branding, payment flow or account behavior changed.

## Verification

| Check | Result |
| --- | --- |
| Focused age/free-access unit checks | PASS — 2 files / 15 tests |
| TypeScript | PASS |
| Production build | PASS; existing Browserslist, mixed-import and large-chunk warnings remain |
| Full suite attempt | Environment-limited: Money Maths, Reading Bingo and LearningJigsaw timed out under the concurrent long run; the run was stopped after the third timeout rather than misreported as green |
| Exact isolated rerun of those failures | PASS — 3 files / 18 tests with one worker |
| Current target GitHub Actions | No PR-triggered run was exposed for `6b4ac34`; no conclusion is inferred |
| Current target Railway status | SUCCESS before reconciliation |
| Candidate hosted workflow | PASS — [Archie test build #612](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38362646189) on exact application commit `ca19ce5`: type-check, full unit suite, production build, button/game-route crawl, and simulated age/year phone/tablet matrix |
| Exact responsive artifact | `archie-test-results` artifact `11796465117`; downloaded ZIP SHA-256 `40922cbb0a8e40e4a4b23dd93cfd20eace3a9728114d71a347d3fa2cd5b2bbbc` |

All learner scenarios are simulated. They are not real-child testing and do not demonstrate learning outcomes or enjoyment.

## Direct rendered review

- The current deployed main home remains visually coherent at the available 1,363×936 browser viewport: blue/gold branding, pale illustrated background, large controls and blond, emerald-eyed Archie are preserved.
- The deployed game catalogue remains readable and unclipped at that viewport, with the saved Year 4 learner selection visible, a clear subject row and written game labels.
- The deployed `/classic-home` page was inspected before and after scrolling. It visibly shows `Free — Current access`, `Four subjects, one free app`, `Browse free games` and `No card required · payment collection is off`; the stale trial/subscription action is absent.
- Exact `ca19ce5` captures were visually inspected at 390×844 and 820×1180 for home, catalogue, a completed Number Pop game, spelling lesson, unlocked parent area and unlocked teacher preview. Branding, blond/emerald-eyed Archie, illustrated picture-world treatment and blue/gold controls remain coherent; labels and primary controls are readable, with no visible horizontal clipping.
- The catalogue correctly renders the learner-year control, subject filters and written game labels at both sizes. The spelling lesson keeps the word, instruction, audio, typing, spoken-lesson, pause and next controls legible. Parent and teacher screens retain explicit adult/data-boundary copy.
- The completed Number Pop result is functional and unclipped, but its 390×844 card leaves substantial empty vertical space and pushes some secondary actions below the initial viewport. This is a concrete presentation issue for the next bounded run, not evidence of a broken completion route.

## Sources and boundaries

This reconciliation does not change curriculum content. Existing design decisions remain grounded in the [DfE mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study), with current comparison benchmarks from [Khan Academy Kids](https://learn.khanacademy.org/khan-academy-kids/) and inclusion guidance from the [Education Endowment Foundation](https://educationendowmentfoundation.org.uk/education-evidence/inclusive-teaching/universal-approaches). These are design references, not copied content or evidence of improved outcomes.

Physical-device touch/layout, hardware screen readers, real-device microphone/audio, live account/email/payment readiness and real-child outcomes remain unverified. No credentials, paid service, live payment, child data, 3D code or `sodafom797` code was changed.

## Next priority

Tighten the Number Pop completion card at 390×844 so the result, replay/home choice and next activity are grouped more efficiently without adding pressure. Preserve the now-green routes, catalogue-age, free-access, Word Scramble readiness and teacher-layout work.
