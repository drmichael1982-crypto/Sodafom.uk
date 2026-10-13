# Word Scramble pager journey repair — 10 October 2026

## Fresh repository and deployment evidence

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children’s target: `test/archie-2026-10-02` at `286817348b5bf82954b7e67cab01fdd99c4187f8`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remains open, mergeable, draft and unmerged.
- Repair commit: `09d800ce6468d973456da80119f6fe429adf0a8e`.
- Open-PR search found no new Word Scramble or pager owner. PR #80 remains limited to the older responsive-home proposal. Leonard’s separate external queue is not exposed here; no Leonard source, 3D work or `sodafom797` code was changed.

Railway was read read-only through the authenticated project state. Project `noble-emotion` (`2f75a12f-11b5-45da-a1dd-97fd99e77ec3`), environment `production` (`6e9b98eb-2972-4b28-8489-f77f8facc5ee`) and service `archie-learning-test` (`efa8d843-4d25-4622-ba35-a185678a2621`) have no staged or applying work. Deployment `f0320c4c-8306-41da-b432-543ccbed6b96` remains `SUCCESS`, created 10 October 2026 at 13:52 UTC from exact target `286817348b5bf82954b7e67cab01fdd99c4187f8`. The candidate is not deployed.

## Current failure and bounded repair

The preceding note correctly reported exact implementation/capture workflow [#425](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38078581592) as green and final documentation-head workflow [#427](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38079472653) as still running. Workflow #427 subsequently failed in the simulated age/year journey, after TypeScript, 1,045 tests, build, Chromium setup, all 15 core journeys and all 130 linked game routes had passed.

The exact failure was a 30-second Playwright timeout at `scripts/test-archie-search-journey.cjs:246`: Word Scramble had inserted supportive wrong-answer feedback at 390 × 844, the horizontal app pager was on screen 3 of 3, and `Clear` was on another pager screen. The test tried to click the off-screen control directly instead of navigating the app pager. The uploaded capture confirmed the empty current screen and still-visible Previous/Next controls; this was not inferred from an older report.

The browser journey now uses the same bounded pager-reveal routine as the core UI suite. Before it captures or activates Word Scramble’s Clear, Pause and Resume controls, it measures the target against `.app-screen-window`, presses the visible Previous/Next control until the target is on-screen, and fails explicitly if 30 steps cannot reveal it. This tests the learner-visible navigation model rather than bypassing it with a forced click. No product behavior, curriculum content, scoring, art or storage key changed.

## Verification

| Check | Result |
| --- | --- |
| JavaScript syntax | PASS |
| TypeScript `--noEmit` | PASS |
| Full Vitest suite | PASS — 137 files / 1,045 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings only |
| Patch whitespace | PASS |
| Interest workflow | PASS — [run #67](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38082165141) |
| Full hosted workflow | PASS — [run #429](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38082165133); every step completed successfully |

The journey remains simulated learner coverage, not real-child testing or evidence of learning outcomes or enjoyment. Local browser execution remains unavailable because this checkout has no installed Chromium binary; hosted CI is the authoritative browser result.

## Separate rendered review

The failing #427 artifact was downloaded and directly inspected. Its 390 × 844 Word Scramble retry capture showed the blue/gold game shell, pale puzzle artwork, reachable Previous/Next pager controls, and an otherwise empty screen 3 of 3; the test then timed out because it did not use Previous. This artifact is failure evidence, not an after-state claim.

The known Railway URL was re-opened read-only at 1363 × 936. Home retained the blue/gold identity, pale picture playground and blond, emerald-eyed Archie. Games showed an uncluttered Year 3 selector, search, five large subject controls and paged cards. Word Scramble rendered large letter tiles and a clear 1/10 progress indicator. Lessons showed the Year 3 Maths path, 36 teaching weeks and 180 lessons with a prominent Start or continue control. Parent and teacher grown-up gates used readable instructions and large controls; the locked teacher page was contained at the observed width. The deployed Word Scramble is the unchanged target and does not contain this test-only repair.

Run #429 uploaded artifact `11681366468` (86.2 MB; digest `sha256:cfad2979165f9c284638d23ed358532a6e1090e96ac3493f16e79ef7e0e75afd`). Its exact-head captures were downloaded and directly inspected:

- At 390 × 844, the retry state shows the complete wrong arrangement, the non-revealing spelling hint and supportive correction on pager screen 2 of 3; Previous/Next remain large and visible. The card is dense and Clear is not simultaneously visible in that capture, but the repaired journey reaches it through the pager instead of forcing an off-screen click.
- The 390px paused state shows the retained first letter, remaining tiles, explicit saved-state message and large Resume control. The complete result shows 95%, 10/10 and three stars without horizontal clipping.
- At 820 × 1180, retry and paused states fit in one screen with Clear, Pause/Resume and the hint count visible together. The complete result retains the blue/gold header, pale puzzle artwork, 95% score, 10/10 result and three-star reward.

These captures demonstrate a deterministic simulated journey and rendered control reachability, not real-child learning or enjoyment. Physical phones/tablets, audible speech, microphone capture, hardware screen readers, live accounts, live email/payments and real-child outcomes remain unverified.

## Official benchmark and curriculum boundary

The required Stripe Directory workflow was used before organisation/provider lookup; no provider was selected, contacted, provisioned or paid.

- [British Council LearnEnglish Kids](https://learnenglishkids.britishcouncil.org/getting-started-for-kids), checked 10 October 2026, targets ages 5–12 and directs children to choose games, songs, stories or videos from the homepage. Its relevant benchmark is direct, understandable access to an activity; no wording, game, art or proprietary flow was copied.
- [Khan Academy Kids’ official progress guidance](https://khankids.zendesk.com/hc/en-us/articles/4403614100109-Progress-reports-in-the-Khan-Academy-Kids-app), checked 10 October 2026, exposes attempt history to adults. Archie’s journey similarly checks an actual retry path, but this repair makes no outcome or universal-superiority claim.
- The [England English programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study), checked 10 October 2026, remain the statutory source for spelling and English progression. This browser-navigation repair changes no statutory or proposed learning objective.

## Next priority

Audit school year, sound, large-text and optional-online-help settings, deciding explicitly which settings are device-wide and which are learner-specific. Keep the 390px three-screen Word Scramble density on the visual backlog while preserving the now-tested pager route to every control.
