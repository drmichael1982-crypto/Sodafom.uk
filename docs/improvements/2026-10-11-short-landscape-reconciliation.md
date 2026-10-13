# Current-target reconciliation and short-landscape access — 11 October 2026

## Fresh repository, queue and deployment evidence

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- The active children’s target was resolved from GitHub and Railway rather than inferred: `test/archie-2026-10-02` at `649c716c8d45d3c0c1df9956ab7bc93d33ae93b0` (`Isolate preview progress and repair parent scores`).
- Railway deployment `e3b54565-5c78-4199-b722-fa475a07c1af` is `SUCCESS` on that exact commit. It was created on 11 October 2026 at 01:18 UTC. No deployment was started or changed in this run.
- Draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) is the established 2D Archie queue. It remains open, draft, unmerged and reports `mergeable: true` against the exact target above. Deferred 3D work and `sodafom797` remain separate and were not changed.
- The previously documented candidate `a7e2b8611b7b765dfbc4a84436086096f693a3d9` was 166 commits ahead but two commits behind the target, with merge base `286817348b5bf82954b7e67cab01fdd99c4187f8`. The target delta scopes exact learning age, pending help, interests, adaptive game level and preview progress to the selected synthetic/local learner; it also repairs parent score percentages and Tricky Word Hunt rewards.

## Reconciliation and bounded improvement

- Published reconciliation commit: `d30b8af350adbb88fbf2a1621d84b2dfbaf7856a`, with parents `a7e2b8611b7b765dfbc4a84436086096f693a3d9` and `649c716c8d45d3c0c1df9956ab7bc93d33ae93b0`.
- The publication transport initially encoded several TypeScript blobs as binary. GitHub Actions exposed this with `TS1490` rather than the failure being inferred from older reports. Repair commit `2cbe0c3d7d68a53908b2f6e79f66bfa5c647f9d8` replaced all 31 affected/changed paths; every uploaded blob SHA was checked against the corresponding local Git blob before the branch ref moved.
- Conflict resolution keeps learner-specific age/help/game-level ownership from the current target alongside the candidate’s newer app work. An active child does not fall back to an older device-wide exact age; learner year and age-group fallbacks remain available in the intended order.
- The bounded UI repair targets an observed short-landscape risk on paged routes. At 844×390, Games and Library now use one contained vertical reading surface, remove the unusable horizontal pager, keep `Ask Archie` at least 44 pixels tall, keep the first activity and footer navigation reachable, and prevent horizontal overflow. Library cards compact to a wide art-and-text row rather than becoming an unreadably tall stack.
- `scripts/test-short-landscape-help.cjs` opens and closes Ask Archie, measures touch/scroll/overflow geometry, scrolls to the first game/book and footer, rejects page errors, and saves direct candidate captures for both routes. The workflow now requires both captures before it can pass.
- No character art, blue/gold branding, lesson objective, question, reward rule, payment, credential, deployment configuration, 3D code or `sodafom797` code changed.

## Curriculum, accessibility and product benchmark

This layout-only repair changes no statutory learning objective. Existing lesson progression remains bounded by the [England national curriculum programmes of study](https://www.gov.uk/government/collections/national-curriculum), while this run makes no claim that a simulated successful journey demonstrates learning. The 44-pixel help action deliberately exceeds the [WCAG 2.2 minimum target-size criterion](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), and the contained vertical route follows the [WCAG reflow principle](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) by avoiding two-dimensional scrolling at the tested small landscape size. [British Council LearnEnglish Kids](https://learnenglishkids.britishcouncil.org/) is used only as a current official benchmark for combining games, songs, stories and videos for children aged 5–12; Archie’s interface, artwork, stories and activities remain original.

## Checks

- Focused reconciliation suite: PASS — 4 files / 37 tests.
- Full Vitest: PASS — 139 files / 1,089 tests.
- TypeScript: PASS.
- Archie production build: PASS; existing mixed-import and large-chunk warnings remain.
- `git diff --check` and script syntax checks: PASS.
- Local Chromium journey: not run because this executor has no Playwright Chromium binary. The hosted workflow installs Chromium and is the authoritative browser check.
- GitHub Actions [Archie test build #447](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38104653111): PASS. The exact `2cbe0c3…` tree passed dependency install, TypeScript, 139 files / 1,089 tests, production build, Chromium installation, the core route/browser step, the complete simulated matrix and artifact upload.
- Hosted core journey: PASS — 15 journeys, all 130 linked game routes, 16 responsive sizes, a complete picture game, zero browser errors and zero live API requests. The new short-landscape Games/Library journey passed inside this step.
- Hosted learner matrix: PASS — 84 simulated phone/tablet search, wrong-answer, hint/retry, pause/resume, completion/reward and navigation scenarios; the learner settings / Ask Archie memory-isolation journey also passed.
- [Interest themes #75](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38104653150): PASS.
- Evidence artifact: `archie-test-results`, artifact `11689159199`, 87,321,367 bytes, 196 files, digest `sha256:6f10944e77962f2e0632e7819c3c5ccb2127063528a36f5566135a5c8cc9e3ed`.

## Direct visual review

These are simulated browser journeys, not child testing or evidence of enjoyment or learning outcomes.

- Deployed home: directly rendered with the established blue/gold identity, pale yellow-to-blue illustrated background, planet/playground composition and blond, emerald-eyed Archie intact.
- Deployed game selection: Year 4 directly rendered 123 games with readable search, subject filters and paged cards rather than one dense wall.
- Complete deployed game: Number Pop was played from an intentional wrong answer through the automatically expanded supportive hint, corrected retry and all ten questions. The settled reward reported 90%, 9/10 and three stars; the reward artwork kept Archie and the dogs coherent. This proves the interaction path only.
- Deployed lessons: Year 4 showed 36 teaching weeks / 180 planned lessons with clear filters and a start action.
- Deployed parent and teacher routes: both directly rendered an explicit adult handoff/gate. Teacher preview retained its no-real-pupil-data warning. No child, account or payment data was used.
- Exact-candidate captures were inspected separately at 390×844, 820×1180 and 844×390. The phone home keeps the full picture playground and large labelled destinations; tablet Games keeps the complete Year 9 optional-extension label, search, subject filters and paged cards inside the width; the phone lesson presents the study word and six large actions without overlap.
- Candidate parent tablet and teacher phone captures keep clear adult/private-data wording and large navigation. The teacher preview stacks cleanly at 390px; the parent form remains a distinct, plain account surface rather than imitating earned child progress.
- A complete Word Scramble tablet capture shows the settled 95%, 10/10, three-star reward, next level and navigation without clipping. This is a simulated completed journey, not evidence of attainment.
- The new 844×390 Games and Library captures show wide, legible activity cards and the full footer inside the viewport with no sideways overflow. Because the evidence capture is taken after scrolling to the footer, Ask Archie is not visible in the final images; its visibility, open/close behavior and 44-pixel height are measured separately by the passing browser assertion.

## Boundaries and next priority

Physical phones/tablets, hardware screen readers, microphone capture, audible speech output, live parent/teacher accounts, payments and real-child outcomes remain unverified. The branch was not merged or deployed.

Next priority: use the now-reconciled draft to extend a complete wrong-answer, hint/retry, pause/resume, completion and navigation walkthrough to the next uncovered reading/spelling or voice game across phone and tablet widths. Keep Leonard’s separate queue isolated and leave deployment/merge to the owner.
