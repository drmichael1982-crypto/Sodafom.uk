# Learner-scoped sticker rewards — 10 October 2026

## Fresh repository evidence

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children’s target: `test/archie-2026-10-02` at `286817348b5bf82954b7e67cab01fdd99c4187f8`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remains open, mergeable, draft and unmerged.
- Implementation commit: `2af2f28960bd62e541b4d15dc4c00e224bbdbf66`.
- Rendered-capture assertion commit: `52a1d1b849cdb37a7b742e8b9a962527bf376dec`.
- Target, candidate, open PR metadata, exact-head CI and Railway deployment were rechecked before editing. Repository search found no open PR matching `Leonard`; Leonard’s external queue is not exposed here, so no active-worker claim is made.

## Reproduced issue and bounded fix

The previous run correctly separated game stars, books and lessons by active learner, but collected stickers still wrote to the legacy device-wide `SavedData.stickers` list. On a shared device, a second child therefore inherited another learner’s claimed sticker and could be prevented from claiming it independently.

The candidate now:

- stores new sticker claims under `sodafom_archie_stickers:profile:<profile-id>`;
- refreshes the sticker book immediately when a claim or active learner changes;
- keeps pre-profile stickers read-only under the adult-only older shared history scope instead of assigning, copying or deleting them;
- labels the older view `Older shared stickers` and unclaimed legacy entries `Not in older history`; and
- includes stickers in the parent/teacher explanation that learner results follow the selected local profile.

No curriculum content, lesson text, character art, payments, credentials, 3D work, production branch or separate `sodafom797` service changed.

## Verification

| Check | Result |
| --- | --- |
| Focused storage regression | PASS — 1 file / 3 tests |
| TypeScript `--noEmit` | PASS |
| Full Vitest suite | PASS — 137 files / 1,045 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings only |
| Patch whitespace | PASS |
| Exact-head interest workflow | PASS — [run #65](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38078581589) |
| Exact-head full workflow | PASS — [run #425](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38078581592); every step passed, including buttons/routes and the age/year matrix |

The focused test switches between synthetic Mia and Leo profiles, proves each receives a different sticker set, then switches back and confirms Mia’s original sticker persists. The full browser journey now repeats the same profile switch after a completed seven-word spelling lesson, confirms the second learner has no inherited `Collected` state, switches back and confirms persistence. It captures the second learner at 390 × 844 and the original learner at 820 × 1180. These are simulated learner scenarios, not real-child testing or evidence of learning outcomes or enjoyment.

Local browser execution remains unavailable because no Chromium binary is installed and the available Playwright CDN returns truncated zero-byte archives. The hosted workflow is therefore the authoritative browser result.

## Rendered and deployment evidence

Before this implementation, exact-head [run #421](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38075528902) completed successfully. Its 84.3 MB artifact was downloaded and visually inspected at 390px and 820px. Home, games, a completed lesson, parent progress and teacher lessons retained the blue/gold branding, pale illustrated playground and blond, emerald-eyed Archie. Text and large controls were readable without horizontal clipping; the phone game-card list is dense but usable. The parent view clearly labelled learner-scoped history.

The exact-head 85.7 MB artifact was downloaded and the sticker-specific captures were inspected directly. At 390 × 844, the second learner’s reward view showed zero stars, zero games and a fresh level-one state, with no horizontal clipping; its first pager panel remained uncluttered and kept the large tabs reachable. At 820 × 1180, switching back restored the original learner’s three-star total and earned Golden key card with a clearly disabled `Collected ✓` control. Branding, puzzle background and button sizing remain coherent. The screenshots establish rendered state separation in this deterministic scenario; they do not demonstrate real-child learning or enjoyment.

The known test URL was opened read-only and the Railway service was checked through its authenticated project state:

- Project `noble-emotion` (`2f75a12f-11b5-45da-a1dd-97fd99e77ec3`).
- Environment `production` (`6e9b98eb-2972-4b28-8489-f77f8facc5ee`).
- Service `archie-learning-test` (`efa8d843-4d25-4622-ba35-a185678a2621`).
- Deployment `f0320c4c-8306-41da-b432-543ccbed6b96` is `SUCCESS`, created 10 October 2026 at 13:52 UTC from `test/archie-2026-10-02@286817348b5bf82954b7e67cab01fdd99c4187f8`.
- No staged or applying work exists. The candidate is not deployed.

## Official benchmark and boundaries

The required Stripe Directory workflow was used before organisation/provider lookup. Its CLI is unavailable in this runtime; no provider was selected, contacted, provisioned or paid.

- [Khan Academy Kids’ official help](https://khankids.zendesk.com/hc/en-us/articles/360006538192-How-do-I-add-a-new-user) says a parent can add multiple children and give each a name and age. Its relevant benchmark is distinct per-child personalisation on one family device; no wording, lesson, character, art or proprietary flow was copied.
- [Sumdog Family](https://learn.sumdog.com/en-gb/get-started/sumdog-family?section=engaginggames) describes game-based practice for ages 5–14 and parent progress insights. Archie’s bounded goal here is narrower and measurable: one selected learner’s reward must not appear in another learner’s book.
- The [ICO Children’s code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/) calls for children’s best interests, high-privacy defaults and data minimisation. This local-only profile split reduces accidental cross-child attribution without collecting new personal data.
- The [England primary national curriculum](https://www.gov.uk/government/publications/national-curriculum-in-england-primary-curriculum) remains the statutory curriculum source. This storage repair changes no statutory or non-statutory learning objective.

Physical phones/tablets, audible speech, microphone capture, hardware screen readers, live parent/teacher accounts, live email, payments and real-child outcomes remain unverified.

## Next priority

Audit the remaining global learning settings (school year, sound, large text and optional online help), explicitly deciding which belong to the device and which belong to a learner. Then continue the age/year scenario matrix without changing the current test deployment.
