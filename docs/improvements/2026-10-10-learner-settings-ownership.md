# Learner-owned practice settings — 10 October 2026

## Fresh repository and deployment evidence

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children's target: `test/archie-2026-10-02` at `286817348b5bf82954b7e67cab01fdd99c4187f8`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remains open and unmerged.
- Implementation commit: `59adf11dab8c73bd3dbef23e327b7ae7c34bc3c5`.
- Browser-journey repair commit: `647a28a4b3650c65f5644704aec53fdbbb2f5b1d`.
- Capture-position commit: `1cee425259c8db754bbce461ed197acf1c76cf7e`.
- The prior documentation-head workflows were rechecked before editing: full run [#433](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38083479815) and interest run [#69](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38083479817) were both green. There was no current CI failure to attribute to an older report.
- Open PRs were checked for overlapping learner-settings work before this bounded change. Leonard's separate external queue is not exposed here, so no claim of active-worker coordination is made. No Leonard source, 3D work, `sodafom797` code, credentials, payments, merge or deployment was touched.

Railway was read read-only through the authenticated project state. Project `noble-emotion` (`2f75a12f-11b5-45da-a1dd-97fd99e77ec3`), environment `production` (`6e9b98eb-2972-4b28-8489-f77f8facc5ee`) and service `archie-learning-test` (`efa8d843-4d25-4622-ba35-a185678a2621`) have no staged work. Deployment `f0320c4c-8306-41da-b432-543ccbed6b96` remains `SUCCESS`, created 10 October 2026 at 13:52 UTC from exact target `286817348b5bf82954b7e67cab01fdd99c4187f8`. The candidate is not deployed.

## Bounded ownership repair

The settings form previously used one shared browser record for nickname and school year and one shared age key. On a family device, switching the selected local learner therefore reused those practice choices without saying that they belonged to the device. Sound, larger text and optional online help were stored in the same record even though those controls are naturally shared by the current browser/device.

The change now:

- saves nickname and school year under `sodafom_archie_settings:profile:<profile id>`;
- saves age presentation under `sodafom_learning_age:profile:<profile id>`;
- keeps sound, larger text and the grown-up's optional-online-help choice shared on the device;
- leaves the older shared nickname, year and age untouched and shows them only as a labelled fallback until choices are explicitly saved for that learner;
- prevents ordinary activity/progress writes from copying the current learner's nickname or year back into the older device-wide record;
- refreshes the form when the active learner changes and labels the learner-owned and shared-device sections directly;
- adds a synthetic Mia/Leo browser journey at 390 × 844 and 820 × 1180, asserting the exact storage ownership, shared controls and absence of horizontal overflow.

No existing shared data is deleted or guessed. This is a clearer local ownership boundary, not a claim of legal compliance, improved attainment or real-child enjoyment.

## Verification

| Check | Result |
| --- | --- |
| JavaScript syntax | PASS |
| TypeScript `--noEmit` | PASS |
| Focused settings/storage tests | PASS — 7 files / 68 tests |
| Full Vitest suite | PASS — 137 files / 1,047 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings only |
| Patch whitespace | PASS |
| Interest workflow | PASS — [run #72](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38088086448) |
| First hosted workflow | FALSE GREEN — [run #435](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38086362041) reported success, but its raw log records a school-year locator timeout and the artifact contains no learner-settings captures |
| Repaired hosted workflow | PASS — [run #437](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38087304265), including both required screenshot-file assertions |
| Final capture-position workflow | PASS — [run #439](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38088086456) |

The hosted learner journey uses invented names and profile IDs only. It first saves Mia as age 6 / Year 2, turns device sound off and larger text on, then switches to unsaved Leo and verifies the explicitly labelled older shared fallback. It saves Leo as age 12 / Year 7 and enables device online help, switches back to Mia, and confirms that Mia's age/year/nickname return while all three device choices remain shared. This is simulated browser coverage, not real-child testing.

Run #435 passed TypeScript, all 1,047 tests, build, the core browser suite and 84 existing simulated age/year journeys. The newly added journey then timed out waiting for its exact-labelled school-year locator. Its asynchronous failure was not propagated to the step summary, so the workflow incorrectly appeared green. The repair addresses both defects: it scopes nickname, age and year selectors directly to `#learning-settings`, and the workflow now asserts that both expected screenshots exist. A missing or failed journey can therefore no longer be reported as successful merely because artifact upload ran afterward. Run #437 then passed every step and produced both required files.

## Separate rendered review

The live Railway app was reopened directly at 1363 × 936. Home retained the blue/gold identity and pale picture-playground artwork. Games showed a readable year selector, search, five large subject controls and paged cards. Lessons showed the Year 3 Maths path, 36 teaching weeks and a prominent Start or continue control. Parent and teacher routes presented readable grown-up gates; the locked teacher preview remained contained at the observed width.

A complete live Number Pop walkthrough answered all ten questions, finished the optional reward-scene multiplication problem and reached the settled 100%, 10/10, three-star result. The reward scene preserved blond, emerald-green-eyed Archie and coherent space artwork. This exercised the deployed target, not the candidate settings change, and does not demonstrate a learning outcome.

Run #435's exact-code artifact was downloaded and inspected separately. Home, Games, spelling lesson, parent and teacher pages remained contained at 390 × 844 and 820 × 1180 with large controls, readable text and the established 2D art. Its learner-settings captures do not exist because that journey failed; this is recorded as failure evidence rather than an after-state claim.

Run #437's artifact (`11682990329`, digest `sha256:4ec63754…`) was downloaded and directly inspected. The 390px capture shows Mia's Year 2 / ages 6–7 choice, sound-off control and large Previous/Next controls without horizontal clipping. The 820px capture is contained but sits on the first parent-account pager screen, so it is not used as visual proof of the changed learner-settings text.

Run #439's final artifact (`11683611577`, digest `sha256:53b726a4…`) was downloaded and directly inspected. Its 390 × 844 capture shows the `Practice settings for Mia` heading, learner/device ownership explanation, Mia nickname and contained pager/navigation controls. Its 820 × 1180 capture shows the same heading and explanation plus Mia's age 6 and Year 2 · ages 6–7 selection, with readable spacing and no horizontal clipping. These are exact-commit rendered checks for `1cee4252…`; they are simulated profile scenarios, not real-child testing or evidence of learning outcomes.

## Official benchmark and curriculum boundary

The requested Stripe Directory workflow was attempted before provider lookup, but its CLI is unavailable in this runtime. No provider was selected, contacted, provisioned or paid. Current official sources were checked on 10 October 2026:

- The [ICO Children's Code default-settings guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/7-default-settings/) says that, where possible, services with multiple users on one device should allow their own profiles and individual privacy settings. The narrower Archie proposal is to attribute practice age/year/nickname to the selected local learner while keeping explicitly device-wide access controls clear.
- The same ICO guidance says privacy settings should be high by default. Archie continues to keep optional online help off until a grown-up enables it; this change makes the device-wide scope visible rather than silently converting that consent into a learner choice.
- [Sumdog's official privacy notice](https://learn.sumdog.com/en-gb/privacy-policy) describes child profiles and a stored school year. This was used only as a benchmark for explicit learner attribution; no character, wording, lesson, art or proprietary flow was copied.
- The [England national curriculum framework](https://www.gov.uk/government/publications/national-curriculum-in-england-framework-for-key-stages-1-to-4) remains the statutory curriculum source. This storage/UI repair changes no learning objective, progression band or statutory content.

## Unverified boundaries and next priority

Physical phones/tablets, audible speech, microphone capture, hardware screen readers, live parent/teacher accounts, cross-device sync, live email/payments and real-child learning or enjoyment remain unverified. No merge or deployment was performed.

Next: audit the saved Ask Archie memory and optional-online-help context for the same synthetic learner boundary, then continue the remaining complete phone/tablet game/lesson matrix. Recheck the target, PRs, exact CI, Railway and separate Leonard/797 queue first.
