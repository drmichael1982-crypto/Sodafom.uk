# Sibling learning-record reconciliation — 11 October 2026

## Fresh repository, queue and deployment evidence

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Dedicated 2D branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), targeting `test/archie-2026-10-02`.
- The target was resolved from current GitHub evidence rather than guessed. It advanced first to `bdc02e01abe2aedc87a57cfe071e7c64b79d4bb2` (`Correct learning records and free access UI`) and then, while the candidate workflow was running, to `1645a7d25957da01d2e1d70bf84be73cea7338e6` (`Isolate sibling learning and repair anagrams`). Both are newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- The exact current target had no GitHub Actions run recorded when checked; no failure was inferred from an older report. Its commit message records the author's local TypeScript, 152-file/974-test and build checks.
- Railway deployment `4da475e4-98e9-4045-990f-bff83d1f1ed2` is `SUCCESS` on exact target `1645a7d2`, created 11 October 2026 at 09:06 UTC. No Railway setting, variable, service or deployment was changed in this run.
- The target's sixteen-file delta adds selected-child game-star ownership, default learner settings, child-switching refreshes and repaired Anagram Attack prompts. It overlaps this branch in storage, game-result and learner-year code, so it was reconciled deliberately rather than overwritten.
- Leonard's developer app remains the separate `drmichael1982-crypto/sodafom797` workstream. No 3D, Leonard, production, credential, paid-service, payment or real-child-data work was included.

## Bounded reconciliation

- Published code merge: `4700efa45b398fd2551c8a9229c59e54ff5a62f5`, with parents `3c2f531f01ba8c999e3bbd90125a9f898126aec9` and current target `1645a7d25957da01d2e1d70bf84be73cea7338e6`.
- Fresh hosted run `#464` exposed one stale browser expectation after every preceding check and all 98 simulated journeys had completed: the test still expected a new `11–13` learner to inherit the older shared Year 4/nickname. The retained target behavior correctly supplies that learner's own name and Year 8 default. Test-only commit `2901b86d07162cdddc051ecc9a1a979acb0f6d6d` now checks the correct default, the canonical combined progress records and the absence of silent writes to the earlier settings keys.
- New learner settings, activities and stickers use the target's canonical `sodafom_archie_progress:<encoded child id>` record. Sound, larger text and optional online help remain device-wide accessibility/consent settings.
- New selected-child game results use the target's canonical `sodafom_game_stars:child:<encoded child id>` key. The local preview keeps a separate generated local-learner key so damaged or valid older device-wide scores are not silently overwritten or assigned to the preview learner.
- Earlier branch activity, sticker, learner-setting and game-star formats remain readable only as a fallback until that learner next saves. Opening the app does not copy, guess or delete them; a later save writes the combined valid result to the canonical key and leaves the earlier key untouched.
- Missing selected-child settings now follow the target's age-group defaults and child name instead of exposing an older device-wide nickname/year. Sibling switching updates the learner record while preserving shared accessibility choices.
- The current target's child-switcher, parent-hub summaries and corrected Anagram Attack prompts/tests are retained. The branch's explicit older-shared-history view, accessibility contrast, settled-score announcement, phone containment and spelling/game recovery work are retained.
- No lesson objective, reward threshold, character art, route, payment, account, deployment or AI-provider configuration changed.

## Verification

| Check | Result |
| --- | --- |
| Focused storage/game/parent/age/anagram suite | PASS — 8 files / 52 tests |
| Full Vitest | PASS — 157 files / 1,156 tests |
| TypeScript `--noEmit` | PASS |
| Archie-test production build | PASS; existing mixed-import, stale browsers-data and large-chunk warnings remain |
| `git diff --check` | PASS |
| First reconciled-head GitHub Actions | FAIL — [build #464](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38127805402) passed type-check, 1,156 tests, build, 15 core journeys, 130 routes and all 98 simulated journeys, then failed the stale Year 4 browser assertion described above; its artifact uploaded successfully |
| Test-repair GitHub Actions | PASS — [build #466](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38128924654): type-check, 157 files / 1,156 tests, production build, 15 core journeys, all 130 linked routes, responsive/jigsaw checks, 98 simulated phone/tablet learner journeys, learner-settings/Ask Archie isolation and artifact upload; interest-theme workflow #79 also PASS |
| Exact repaired-head artifact | PASS — artifact `11698812757`, 92,720,979 bytes, SHA-256 `a4852151d07f198744cfec20b7eb766a083d873157aeceb5f6e2743bad1bab2b`; `results.json` records 98 simulated journeys and zero browser errors |

## Direct rendered review

These are simulated browser journeys, not child testing or evidence of enjoyment, attainment or learning outcomes.

- The known test URL was opened after Railway moved to exact target `1645a7d2`. The home keeps the blue/gold identity and pale illustrated puzzle world. Its initial state is now a numbered, mostly empty picture jigsaw, so Archie is not immediately visible there; the blond, emerald-eyed character remains prominent in the completed-game space artwork.
- Year 4 Games directly rendered 123 filtered activities with readable search, five subject choices and 41 paged screens. The page avoids one unbounded wall but remains information-dense.
- Number Pop was completed from an intentional wrong answer through the automatically revealed counting hint, corrected retry, nine further questions and the completion control. It recorded 9 first-try answers and showed a full-screen rocket celebration with coherent Archie/dog/robot art. This proves the interaction path only.
- The Year 4 Maths lessons page directly rendered a clear 36-week / 180-lesson path, four large subject controls, explicit 30-minute planning and a visible start/continue action.
- Parent and teacher routes directly rendered adult gates. The parent gate explains why an adult is needed. The teacher page keeps the no-class-records, no-cloud-sync and no-real-pupil-data preview wording. Controls and body text were readable at the desktop browser size.
- Exact application-code artifact review at 390×844 and 820×1180 covered Home, Games, completed Spelling Snap, spelling lesson, unlocked parent and unlocked teacher pages. The Home puzzle, blue/gold controls, pale illustrated background and blond/green-eyed Archie treatment remain coherent. Game/parent pagination is visibly denser on the phone (43 Games screens and 21 parent screens in the sampled Year 9 state) but controls remain large and contained; the tablet exposes more content per screen. The completed game clearly shows 90%, 9/10 and three stars. The spelling lesson is readable but remains visually sparse on the tablet. Run #464 also captured wrong-answer/retry, pause, completion and reward states across all 98 simulated scenarios before the later stale assertion; the test-only repair does not alter the rendered app.
- Repaired-head captures directly verify Mia's canonical Year 2/name/age settings and one-item Ask Archie memory view at both widths. The phone's deliberately enabled larger-text mode needs later pages in the horizontal pager, but labels, status copy, large Previous/Next and clear-memory controls remain readable and contained. The tablet shows the full settings and memory cards with more surrounding context.

## Curriculum, product and privacy benchmark

- [England's primary national curriculum](https://www.gov.uk/government/publications/national-curriculum-in-england-primary-curriculum) and [English programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study) remain the statutory sources. This storage-only reconciliation makes no curriculum or outcome claim.
- [Khan Academy's official child-profile guidance](https://support.khanacademy.org/hc/en-us/articles/204795300-How-do-I-view-my-child-s-profile) describes each child's own learning history and progress, while its [multiple-child account guidance](https://support.khanacademy.org/hc/en-us/articles/202262994-How-do-I-create-or-link-child-accounts-to-my-parent-account) warns that activity can be recorded to the wrong account when learners do not switch correctly. That supports the benchmark of an explicit active learner and separated progress; no Khan content or interface was copied.
- The [ICO Children's Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/) makes high privacy and data minimisation central standards. Archie therefore reads older local formats without silently copying, merging or deleting records on page open. This is a design rationale, not a legal-compliance claim.
- Stripe Directory was consulted before any provider or organisation selection as required; its local CLI transport was unavailable. No provider was selected, contacted, paid or provisioned. The comparisons above use current official public sources.

## Explicit limits and next priority

Physical phone/tablet touch, hardware screen readers, real-device reduced-motion, microphone capture, audible speech output, live accounts, payment readiness and real-child outcomes remain unverified. The branch was not merged or deployed.

Next priority: after rechecking the moving target and draft PR, use a complete phone/tablet wrong-answer, hint/retry, optional-break, completion/reward and navigation walkthrough to find the next current reading, voice or lesson failure. Keep Leonard's separate queue, 3D, deployment and production merge out of scope.
