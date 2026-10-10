# Parent tutor report learner isolation — 10 October 2026

## Fresh state and bounded ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children’s target: `test/archie-2026-10-02` at `286817348b5bf82954b7e67cab01fdd99c4187f8`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remained open and unmerged.
- Implementation commit: `aef7b8fef297e694601072942089d5b799d135ce`.
- Before editing, the current target, improvement head, open PR, latest Railway deployment and exact recent workflows were rechecked. This run changed only the local tutor-memory reader, authenticated parent tutor card and their tests. Production, deployment settings, 3D work, credentials, payments and the separate `sodafom797` project were not touched. Leonard’s live worker status is not observable here, so no claim of active-worker coordination is made.

## Reproduced behavior and repair

The authenticated parent dashboard rendered one `ParentTutorReport` inside every child card, but each report loaded the globally active learner from `sodafom_active_child`. With two children, both cards could therefore show one child’s locally stored school year, topic strengths and support needs.

The bounded repair now:

- adds `loadTutorMemoryForChild`, which reads an explicit child’s namespaced local tutor record without changing the globally active learner;
- passes the exact authenticated dashboard child ID, name and validated age band into each report;
- derives strengths and support topics from that explicit profile rather than reloading global state;
- identifies each report with the learner name, saved school year and age band;
- preserves the fallback active-child behavior for existing standalone uses of the report;
- replaces the unsupported `COPPA Safe` badge with the factual `Device-only local tutor memory` label; and
- adds unit, component, dashboard-prop and signed-in two-child browser regression coverage.

This protects display isolation for the existing device-local tutor summaries. It is not a claim that all progress in the product is cloud-synchronised, that a statutory school report has been produced or that learning outcomes improved.

## Verification

| Check | Result |
| --- | --- |
| TypeScript `--noEmit` | PASS |
| Focused memory/report/dashboard tests | PASS — 3 files / 4 tests |
| Full Vitest suite | PASS — 137 files / 1,041 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings remain |
| New signed-in two-child parent journey | PASS — 390 × 844 and 820 × 1180, no horizontal overflow or browser errors |
| Main browser suite | PASS — 15 journeys, all 130 linked game routes, phone/foldable/tablet/landscape layouts, zero browser errors and zero live API requests |
| Whole-page jigsaw browser check | PASS — complete picture and fixed routes across checked phone/tablet/desktop widths |
| Exact implementation workflows | PASS — [Archie test build #407](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38066343435) and [interest themes #56](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38066343522) |

The deterministic browser journey signs in a synthetic parent, supplies two synthetic child cards, deliberately keeps Leo as the global active learner, and seeds separate Mia/Year 2/addition and Leo/Year 7/forces tutor records. It verifies that each card shows only its own year and topic, checks that the unsupported compliance wording is absent, measures phone/tablet containment and saves both rendered captures. This is a simulated learner-family scenario, not real-child testing.

Hosted run #407 passed every current step on exact implementation commit `aef7b8fe…`: install, TypeScript, all unit tests, production build, Chromium installation, button/game-route checks, simulated year-group game and spelling journeys and artifact upload. Interest-theme run #56 also passed. No current failure was inferred from an older report.

## Rendered and deployment review

Fresh local captures of home, game selection and lessons were directly inspected at 390 × 844 and 820 × 1180. Their blue/gold controls, pale illustrated backgrounds, large navigation, school-year labels and the established blond, emerald-eyed Archie artwork remain coherent and contained. The game menu presents a readable year selector, search and large subject/game controls; the lessons page keeps its year range and curriculum cards legible without horizontal overflow.

The repaired parent dashboard was separately inspected at both widths. Mia’s card shows `Year 2`, one green addition strength and no forces text; Leo’s card shows `Year 7`, one red forces support topic and no addition strength. Phone cards remain long but clearly separated and usable; the tablet cards are comfortably scannable. The green/gold adult styling is preserved. Current parent/teacher progress captures also remain contained, and the current browser suite completed the whole-picture game with its reward and navigation intact.

The known Railway URL was opened read-only and still renders the established blue/gold/pale illustrated home. Railway deployment `f0320c4c-8306-41da-b432-543ccbed6b96` remained `SUCCESS`, created on 10 October 2026 from exact target `286817348b5bf82954b7e67cab01fdd99c4187f8` on `test/archie-2026-10-02`. The parent-isolation candidate is not deployed, so its repaired dashboard was inspected through the rebuilt local preview rather than represented as live.

## Product comparison and statutory boundary

The required Stripe Directory workflow was attempted before provider lookup, but its CLI is unavailable in this runtime. No provider was selected, contacted, provisioned or paid. Current official sources were then checked on 10 October 2026:

- [Sumdog Family](https://learn.sumdog.com/en-gb/get-started/sumdog-family?section=engaginggames) supports up to three children and describes diagnostic reports that show a child’s progress, strengths and areas for improvement. The relevant original benchmark for Archie is that every parent-facing summary is unambiguously tied to one learner, not copied wording, report layouts or proprietary diagnostics.
- [Khan Academy India](https://india.khanacademy.org/) publishes parent/teacher guides and learning plans across multiple grades. The useful general benchmark is a clear child/grade context around parent support; it is not an England-curriculum source.
- The Department for Education’s [school reports on pupil performance guidance](https://www.gov.uk/guidance/school-reports-on-pupil-performance-guide-for-headteachers) requires maintained-school annual reports to cover general progress plus strengths and developmental needs. Archie’s local tutor card is a practice summary only and must not be presented as that statutory report.

## Unverified boundaries and next priority

Physical phones/tablets, real audible speech, microphone capture, hardware screen readers, live parent accounts, live email, payments and real-child learning or enjoyment remain unverified. No merge or deployment was performed.

Next: recheck the branch, PR, CI and live target, then audit the remaining parent/teacher surfaces so every child-specific local record is either explicitly namespaced to the selected synthetic learner or clearly labelled as shared device history. Continue the remaining age/year game matrix without touching Leonard’s separate queue or `sodafom797`.
