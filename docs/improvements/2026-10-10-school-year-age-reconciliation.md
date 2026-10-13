# School-year age-range reconciliation — 10 October 2026

## Fresh state and ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- The active children’s test branch was resolved from the repository, current Actions and Railway as `test/archie-2026-10-02` at `d5200d2c46816536d506a1d9f6c556663997d7bf`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Railway deployment `25268c1c-26e0-4e21-91a0-a99c44afb4c1` is `SUCCESS` on that exact target. It was created on 10 October 2026 at 12:06 UTC and completed at 12:08 UTC; Railway reported no pending work. No deployment was started, restarted or changed here.
- Draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remains the dedicated 2D Archie queue. `sodafom797`, deferred 3D work, production, credentials and payments were not changed.

## Bounded reconciliation

The target first advanced to `54f34245173f6b66b0a09ddd7d6342ff5e1a6ba5`, making game discovery recognise both ages normally present in an England school year. Merge commit `be5af459cf3f63cf1adcd1b08ed3a16db1933179` preserved that behavior and the candidate’s stronger catalogue boundary checks.

The target then advanced to `d5200d2…`, capping learner labels at the app’s age-13 extension. Merge commit `4febd9106e2632c9a9ebd44ce7cd9beddd2f242e` preserves both lines of work:

- A school year matches a game when either of its two possible learner ages intersects the game’s supported range.
- Year 9 displays `age 13`, never age 14.
- The established selector structure still separates the main ages 5–12 path (Years 1–7) from Years 8–9, and identifies Year 9 as an optional extension.
- Focused tests cover overlap at the Year 3/4 and Year 6/7 boundaries, age-13 capping, the shared selectors and catalogue discovery.

No learning objective, question, reward, character, artwork, audio, account, payment or deployment behavior changed.

## Verification

| Check | Result |
| --- | --- |
| Focused reconciliation suite | PASS — 5 files / 69 tests |
| TypeScript `--noEmit` | PASS |
| Full Vitest suite | PASS — 136 files / 1035 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings remain |
| Whitespace / conflict-marker review | PASS |
| Hosted interest themes | PASS — run #46 |
| First hosted Archie test build | FAIL — run #386 exposed a stale one-age browser expectation after all type/unit/build gates passed |
| Repaired local core browser suite | PASS — 15 journeys, all 130 routes and all responsive layouts; zero browser errors/live API requests |
| Repaired local simulated matrix | PASS — 82 phone/tablet search, game and lesson scenarios |
| Final hosted Archie test build | PASS — run #390 on `80569aab…` |

Run #386 passed dependency installation, TypeScript, 136 files / 1035 tests, production build and Chromium setup. Its core browser step timed out while comparing the rendered Year 4 game count with a test helper that still treated Year 4 as age 8 only. The application correctly included games matching either age 8 or age 9. Commit `357b1b1d47ad753f84f08bb0998819a6befb5868` changes that browser oracle to intersect `[year + 4, min(year + 5, 13)]` with each catalogue range. The complete core browser suite then passed locally.

Local execution of the separately skipped 82-scenario matrix exposed the same old formula in its independent catalogue expectation. Commit `80569aabe4353cbdc28cc95881fa4447c05e850e` aligns that second oracle. The full matrix then passed at 390 × 844 and 820 × 1180. Neither script imports the application predicate, so both remain independent checks of the same range rule.

Final hosted [run #390](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38052466938) is green on that exact commit. It passed TypeScript, 136 files / 1035 tests, production build, Chromium installation, all 15 core browser journeys, all 130 linked game routes, phone/foldable/tablet/landscape layout checks, the whole-page jigsaw journey and all 82 simulated search/game/lesson scenarios with zero browser errors and zero live API requests. Artifact `11670196732` has digest `sha256:cad73e3faf759682fb6d0b18ca190a9435778841f607465c402fe42255e1e396`. Interest-theme run #48 also passed.

The live deployed target was directly inspected after Railway reached `SUCCESS`. `/games` and `/courses` both render Year 9 as `age 13`, not age 14. At the observed 1363 × 936 desktop viewport, the lessons page retained its pale illustrated school background, blue/gold identity, large selector and subject controls, readable lesson summary and contained pager/navigation. The candidate is not deployed; phone/tablet evidence will come from its hosted responsive-browser artifact rather than being represented as a live deployment check.

The repaired local matrix produced fresh candidate captures at 390 × 844 and 820 × 1180. Direct inspection covered home, Year 9 game selection, a perfect completed Maths Bingo round, completed Year 9 spelling, unlocked parent and teacher pages. The phone selector visibly shows `Year 9 · age 13 · optional extension`, controls remain large, cards fit without horizontal overflow and the blue/gold illustrated identity is coherent. At 820px, however, the closed native selector truncates the optional-extension suffix while the adjacent scope note remains readable. The value is available when the selector opens and is correctly exposed to assistive technology, but improving the settled tablet label width is now a concrete visual follow-up; this run does not claim it fixed.

These are automated and simulated learner checks, not real-child testing or evidence of enjoyment or improved learning outcomes.

## Curriculum and product boundary

This change repairs product filtering and labels; it does not change statutory curriculum content. The existing curriculum basis remains the [England English programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study), [England maths programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) and [DfE reading framework](https://www.gov.uk/government/publications/the-reading-framework-teaching-the-foundations-of-literacy). The overlap and optional-extension presentation are app design decisions, not statutory requirements. No proprietary lesson, character, art or text was copied.

Physical phones/tablets, audible speech output, microphone capture, hardware screen readers, live parent accounts/payments and real-child outcomes remain unverified. Payments remain disabled on the public test; no paid service was provisioned or activated.

## Next priority

First make the full Year 9 optional-extension label visible in the settled 820px game selector without adding horizontal overflow. Then complete the newly deployed parent-summary, Sudoku and Word Scramble journeys at phone/tablet widths and verify saved age/year tutoring remains isolated by synthetic learner. Recheck the target, CI, Railway and Leonard’s separate queue before editing.
