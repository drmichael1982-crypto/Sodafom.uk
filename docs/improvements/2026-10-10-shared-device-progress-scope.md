# Shared-device progress scope — 10 October 2026

## Fresh state and bounded ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children’s target: `test/archie-2026-10-02` at `286817348b5bf82954b7e67cab01fdd99c4187f8`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remained open, mergeable and unmerged before this change.
- Implementation commit: `6ba9e229431e42e34442e2d04da6fc3be7e344bd`.
- Before editing, the branch heads, PR, exact prior workflow steps, latest run note and Railway deployment were rechecked. The prior documentation-head workflows [Archie test build #409](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38067279630) and [interest themes #57](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38067279510) both finished green. Their long route step was observed while genuinely in progress and then rechecked; it did not fail.
- This run changed only the preview’s shared device-history labels and their unit/browser regression coverage. Production, deployment settings, credentials, payments, deferred 3D work and the separate `sodafom797` project were not touched. Leonard’s live worker status is not observable here, so no claim of active-worker coordination is made.

## Reproduced behavior and repair

The parent preview stores game stars and book/lesson activity in browser-wide keys. Its report nevertheless led with a possessive learner label such as `Mia’s saved practice`, and the linked adult detail screen said `My progress`. A warning at the bottom eventually admitted that several children could be mixed, but the first and strongest labels could already misattribute shared results to one learner.

The bounded repair does not delete, migrate or invent progress. It now:

- heads the parent summary `Shared practice on this device`;
- presents the selected nickname and lesson year only as `Current profile` context, not ownership;
- puts a plain-language shared-history warning before the scores;
- labels summary counts, table caption, recent activity and link as shared browser records;
- changes parent/teacher detail handoffs to `Shared device progress` with an up-front scope panel and browser-specific stat labels;
- preserves the child-facing `My progress` title when the page is opened outside an adult parent/teacher handoff; and
- adds a deterministic rendered regression for the complete parent-to-progress journey at 390 × 844 and 820 × 1180.

This improves attribution accuracy in the current preview. It is not a claim that records are learner-namespaced, cloud-synchronised, statutory school reports or evidence of improved learning outcomes.

## Verification

| Check | Result |
| --- | --- |
| TypeScript `--noEmit` | PASS |
| Focused shared-scope unit test | PASS — 1 file / 3 tests |
| Full Vitest suite | PASS — 137 files / 1,042 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings remain |
| Shared parent → progress browser journey | PASS — 390 × 844 and 820 × 1180, zero overflow or browser errors |
| Main browser suite | PASS — 15 journeys, all 130 linked game routes, 16 responsive viewports from 280px phone through desktop/landscape, zero browser errors and zero live API requests |
| Whole-page picture game | PASS — completed at phone/tablet/desktop/landscape sizes; fixed destinations, saved progress and retained lesson answers verified |
| Exact implementation workflows | PASS — [Archie test build #411](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38068711723) and [interest themes #58](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38068711673). The build completed type-check, all unit tests, production build, button/route checks, and simulated year-group game and spelling journeys successfully. |

The focused journey seeds only fictional `Mia`, Year 2, one book, one spelling lesson and one game score. It verifies the shared label, rejects the old possessive wording, follows the real link, verifies the adult detail title/warning and saves phone/tablet captures. These are simulated records, not real-child testing.

## Rendered and deployment review

Before the change, the adult detail capture visibly said `My progress` even though its data was browser-wide. After the rebuilt change:

- the phone parent screen clearly leads with `Shared practice on this device`, `Current profile: Mia` and the shared-history explanation; its long adult content remains paginated with large controls;
- the tablet parent screen places the same warning above the three shared-result cards without horizontal overflow;
- phone/tablet detail screens lead with `Shared device progress` and `Shared device history`, while retaining the blue/gold Sodafom controls, pale illustrated puzzle background and readable white panels; and
- the main responsive suite retained home, game selection, complete game, lessons, parent and teacher containment across the tested widths, including reduced-motion rendering in the focused journey.

The known Railway URL was opened read-only. Its home, games, lessons, parent gate and teacher gate were directly inspected: the blue/gold branding, pale illustrated scenes, blond Archie artwork, large controls, school-year selector and adult gates remain coherent. Railway deployment `f0320c4c-8306-41da-b432-543ccbed6b96` remained `SUCCESS` from target `286817348b5bf82954b7e67cab01fdd99c4187f8`; this candidate is not deployed.

## Product comparison and statutory boundary

The required Stripe Directory workflow was attempted before provider lookup, but the Stripe CLI is unavailable in this runtime. No provider was selected, contacted, provisioned or paid. Current official sources were checked on 10 October 2026:

- [Sumdog](https://learn.sumdog.com/en-us/) describes adaptive practice for each child and parent progress tracking. The relevant original benchmark is unmistakable learner attribution around progress; Archie now avoids implying that its still-shared browser record belongs to the selected nickname. No Sumdog character, art, text, report layout or proprietary activity was copied.
- The Department for Education’s [school reports on pupil performance guidance](https://www.gov.uk/guidance/school-reports-on-pupil-performance-guide-for-headteachers) distinguishes statutory annual reports, including general progress, strengths and developmental needs. Archie continues to call its data recorded practice rather than a school assessment or National Curriculum completion certificate.
- The Department for Education’s [mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) are statutory for maintained schools and distinguish statutory content from non-statutory examples. This scope-label repair does not change curriculum claims or lesson content.

## Unverified boundaries and next priority

Physical phones/tablets, real audible speech, microphone capture, hardware screen readers, live parent accounts, live email, payments and real-child learning or enjoyment remain unverified. No merge or deployment was performed.

Next: recheck the exact hosted workflows and branch state, then design a non-destructive migration from shared game/book/lesson history to child-scoped browser keys with an explicit legacy shared fallback. Until that exists, keep every adult surface labelled as shared device history. Continue the remaining age/year matrix without touching Leonard’s separate queue or `sodafom797`.
