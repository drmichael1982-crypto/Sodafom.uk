# Ask Archie learner age and memory isolation — 10 October 2026

## Current handoff

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children’s target: `test/archie-2026-10-02@286817348b5bf82954b7e67cab01fdd99c4187f8`.
- Dedicated candidate branch: `improve/archie-learning-20261007`.
- Implementation commit: `9363aa55c6debd3e84d87153da6333c031000934`.
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), open and unmerged.
- The refreshed GitHub snapshot reports `mergeable: false`; reconcile the branch against the current test target before any merge consideration. No merge was attempted.
- No merge, deployment, credentials, paid service, 3D work, production change or `sodafom797` edit occurred. Leonard’s external queue was not exposed, so no active-queue claim is made.

The reference `be917c8e6cdb99156a63b38f8d12792babeb31c4` was not used as the working head. The newer branch, PR, run notes, current CI and Railway deployment were rechecked first.

## Reproduced problem and bounded repair

The previous learner-settings change made nickname, age and school year profile-scoped, but `ArchieHelper.getLearnerAge()` still preferred the old device-wide `sodafom_learning_age` value. A child could therefore receive an online Ask Archie request carrying another learner’s old age even though the parent page displayed the selected learner’s scoped settings. The parent memory control also counted and deleted all locally saved Ask Archie pairs, although newer records already carry a profile ID.

This commit:

- resolves Ask Archie age from the active learner’s scoped age first, then that learner’s scoped school year (`year + 4`), before any legacy fallback;
- keeps the existing legacy fallbacks for older installations without inventing or deleting data;
- filters saved question-and-answer pairs to the active learner;
- labels the parent panel `Ask Archie memory for <learner>` and makes its count and clear action learner-specific;
- retains other learners’ and older default-profile memory untouched, with an explicit separation note;
- keeps recent in-memory chat clearing when the learner or learning year changes;
- keeps sound, larger text and optional online-help permission device-wide as previously documented.

No curriculum content, game reward, account, payment or provider integration changed.

## Verification

Local checks on the implementation tree:

| Check | Result |
| --- | --- |
| TypeScript | PASS — `npx tsc --noEmit` |
| Focused tests | PASS — 4 files / 30 tests before the full run |
| Full Vitest suite | PASS — 137 files / 1,049 tests |
| Production build | PASS — existing dynamic-import and large-chunk warnings only |
| Learner browser journey | PASS — 390×844 and 820×1180; Mia/Leo settings, Ask Archie request age, memory count and learner-only clear |
| Syntax / whitespace | PASS — browser script syntax and `git diff --check` |

Exact hosted evidence:

- [Archie test build #441](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38090941700) passed TypeScript, all 1,049 tests, build, Chromium installation, 15 core journeys, all 130 linked game routes, responsive layouts, the complete page-picture check, 84 simulated search/game journeys and the learner-isolation journey.
- [Interest themes #73](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38090941821) passed.
- Hosted log: `PASS learner settings, Ask Archie age context and saved memory stay isolated while device accessibility and online-help choices stay shared`.
- Artifact `11684541388`, 194 files, digest `sha256:653fc48e4fc13543835615c8b7c22e2be4917be7ac91e27bec8a4f89c4d87656`.
- The post-job checkout cleanup emitted the repository’s existing missing-`android`-submodule warning after all checks and artifact upload; the job conclusion remained success.

The synthetic two-learner scenario seeded Mia with age 6 and one memory pair, Leo with age 12 and two pairs, plus one older default-profile pair. It verified Leo’s clear action removed only Leo’s pairs, Mia retained her pair, the older pair stayed separate, and Mia’s online request carried age 6 without Leo’s prior question. This is simulated browser testing, not real-child testing or evidence of learning outcomes.

## Rendered review

The exact hosted artifact’s 390×844 and 820×1180 captures were downloaded and directly inspected. Both show `Ask Archie memory for Mia`, one saved pair, the explicit non-reuse statement and a large `Clear Mia’s Ask Archie memory` control. The phone view uses the established Previous/Next pager and fits without horizontal clipping. The tablet view keeps the panel, follow-on adult links and device-only storage warning readable and contained. Blue/gold branding, pale illustrated puzzle art and large controls are preserved.

Separately, the current deployed [Railway test app](https://archie-learning-test-production.up.railway.app/) was reopened. Home, Games, Lessons, parent and teacher pages retained the established 2D presentation. The existing completed Number Pop state visibly showed 100%, 10/10 and three stars. The deployed parent page still showed the before-state device-wide count and generic clear action, confirming that the candidate is not deployed.

Railway remains `SUCCESS` on deployment `f0320c4c-8306-41da-b432-543ccbed6b96`, exact target commit `286817348b5bf82954b7e67cab01fdd99c4187f8`, with no staged work. The deployment label is `production`, but the service is the separate `archie-learning-test` service.

## Official comparison and curriculum boundary

- The [ICO Children’s Code standards](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/code-standards/) require high-privacy defaults and collecting or retaining only the minimum data needed. Keeping local learning memory with its selected learner, while retaining rather than silently migrating older records, is the design application here.
- [Khan Academy Kids’ official support](https://khankids.zendesk.com/hc/en-us/articles/360006538192-How-do-I-add-a-new-user) documents multiple child profiles under one parent account. [Khan Academy’s parent help](https://support.khanacademy.org/hc/en-us/articles/202262994-How-do-I-create-or-link-child-accounts-to-my-parent-account) also warns that progress can land on the wrong account when people forget to switch. These are benchmarks for clear learner attribution; no character, art, wording or proprietary lesson was copied.
- The [England mathematics programme](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) remains the statutory curriculum source. This storage/context repair changes no statutory learning objective; learner-specific memory, clearing and optional-online-help choices are product design decisions.

Stripe Directory was attempted before provider research, but its CLI was unavailable. No provider or organisation was selected, contacted, provisioned or paid.

## Remaining boundaries and next priority

Physical phones/tablets, audible speech, microphone capture, device speech services, hardware screen readers, live parent/teacher accounts, email, payments and real-child enjoyment or attainment remain unverified.

Next bounded priority: first reconcile the draft branch's reported merge conflict against the current test target without overwriting concurrent work, then extend complete wrong-answer, hint/retry, pause/resume, completion and navigation walkthroughs beyond the current 84 sampled scenarios to remaining supported game/lesson and age/year combinations, prioritising reading, spelling and voice flows. Recheck the branch, PR, current CI, Railway state and Leonard ownership before editing.
