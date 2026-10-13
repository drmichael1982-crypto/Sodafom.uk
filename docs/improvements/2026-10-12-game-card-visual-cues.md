# Game-card visual cues — 12 October 2026

## Current handoff

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test target from fetched repository evidence: `test/archie-2026-10-02@1de32e64a725f5425e629d08d83b069c24a5d77c` (`Repair free learning flows and child isolation`). It is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4` and is already an ancestor of this candidate.
- Dedicated improvement branch: `improve/archie-learning-20261007`.
- Application commit: `7a2ec9d1f7f0b6d2ef31c67a354deca3544c262a` (`Differentiate Archie game card artwork`).
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), kept draft, open and unmerged.
- Railway deployment `6fe1b1f3-60a0-40b8-ada7-3d874e5db29d` is `SUCCESS` on older test commit `f938aaa9173cdefe69c41dcfc6dd5b7136eaf38d`. The app service has no staged changes. The separate `sodafom797` service was only observed in the read-only environment inventory and was not changed.

No overlapping open 2D game-catalogue or card-art PR was found. Open 3D, artwork-handoff and Systems 797 work remains separate. Leonard’s private queue is not visible in this runtime, so fresh branch, PR and changed-file overlap checks are the available coordination evidence.

## Bounded behavior change

The current live Year 4 game selection visibly gave Adventure Trail, Star Trail and Number Pop the same orb artwork. Their text was different, but the repeated picture weakened quick scanning.

The existing branded scene artwork now accepts an optional decorative cue. Game cards derive a stable cue from the activity title before falling back to its subject. The opening repeated Maths scenes now show distinct map, star, balloon, race, fraction, shape and puzzle cues while retaining the existing scene, blue/gold palette and card text.

- The cue remains inside the existing `aria-hidden` artwork, so it does not duplicate or change the link’s accessible name.
- It uses a high-contrast light badge with a dark foreground and white border at both phone and tablet sizes.
- It adds no motion; the existing scene animation remains disabled when reduced motion is requested.
- It does not alter catalogue filtering, years, routes, scoring, feedback or curriculum content.
- The composition and mapping are original and use standard Unicode symbols; no third-party character, lesson or proprietary artwork was copied.

## Verification

| Check | Result |
| --- | --- |
| Focused scene-artwork + game-year tests | PASS — 2 files / 22 tests |
| Full local unit suite | PASS — 170 files / 1,206 tests |
| TypeScript `tsc --noEmit` | PASS |
| Archie production build | PASS; existing Browserslist and large-chunk warnings remain |
| Hosted interest-theme check | PASS — run #131 on application commit `7a2ec9d` |
| Hosted Archie test build | PASS — [run #598](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38198446260) on exact application commit `7a2ec9d` |
| Hosted full simulated matrix | PASS — route/button checks plus Years 1–9 game/lesson, learner-settings and parent/tutor isolation journeys |
| New Chromium visual assertion | PASS — first seven Year 4 cues are distinct; no horizontal overflow at 390×844 or 820×1180 |
| Browser artifact | PASS — ID `11724174065`, SHA-256 `b0c73f773600a2459f780c694dfebefc7d7f0569074f383cc50c99329cdc1562` |

The local browser launch could not be used because this runtime’s Playwright download returned a zero-byte browser archive. This was an environment limitation, not an application failure: hosted CI installed Chromium independently and passed the exact rendered phone/tablet gate. The code, unit, type and build results above are exact local results; hosted results are tied to the exact published application commit.

All learner scenarios are simulated. They are not real-child tests and do not demonstrate enjoyment or learning gains.

## Direct rendered review

- **Live home:** the deployed home still preserves the blue/gold SODAFOM identity, pale surround, fixed picture-puzzle artwork and blond, emerald-eyed Archie. Controls and puzzle destinations were readable at the direct browser viewport.
- **Live game selection before this change:** Year 4 showed 123 eligible games with a clear year selector and subject filters, but the first three visible cards repeated the same orb image. That direct observation selected this bounded change.
- **Complete live game:** Number Pop was played from question 1 through question 10. Correct-answer feedback explained each result, first-try progress reached 10, the Finish control appeared, and the rocket completion scene was exposed. This is simulated successful play, not evidence of learning outcomes.
- **Live lessons:** the Year 4 Maths page showed the current 36-week / 180-lesson path, next adventure, completion progress, week sequence, year control and subject controls. Text and main actions were visually clear.
- **Live parent page:** the grown-up gate worked from its visible instruction. Parent sign-in, optional AI, settings and learner-record sections remained paged and clearly separated. No credentials or child data were entered.
- **Live teacher page:** the deployed older commit still showed a settled desktop clipping defect after the grown-up gate: the 1,120 px `.app-screen-flow` measured from x = -133.5 to 986.5 in a 1,363 px viewport, clipping the left preview copy and right lesson titles. This is recorded as a deployment-specific failure, not attributed to the newer candidate and not expanded into this card-art change.
- **After change:** the hash-verified run #598 artifact was downloaded and both new captures were directly inspected. At 390×844 the first screen keeps the year/subject controls, two complete cards and pager readable without clipping. At 820×1180 it keeps four complete cards visible. The existing orb scene remains branded, while map, star, balloon and race badges are immediately distinct, consistently placed and high contrast. Text remains the primary label, no horizontal overflow is present and the cues do not crowd the Play action. This is a visual-navigation improvement only, not a superiority or learning-outcome claim.

## Current comparison, inclusion and curriculum boundary

- Khan Academy Kids’ official page currently presents a curated library of activities, books, videos and creative lessons and uses distinct, playful content types for independent selection. This is a current benchmark for quick visual differentiation, not a source of copied art or content.
- The Education Endowment Foundation’s current inclusive-teaching guidance describes visual, verbal or written scaffolding and clear, unambiguous explanations as useful universal approaches. The cue is an additional visual scaffold while the full written game title remains primary.
- The DfE mathematics programme remains the statutory source for England: key stages 1 and 2 are set out year by year, with schools required to cover the relevant programme by the end of each key stage. No statutory objective changed here; this is a navigation/design proposal.

Sources:

- [Khan Academy Kids official product page](https://learn.khanacademy.org/khan-academy-kids/)
- [EEF universal approaches for inclusive teaching](https://educationendowmentfoundation.org.uk/education-evidence/inclusive-teaching/universal-approaches)
- [DfE mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study)

Stripe Directory was attempted before current external-product lookup; its CLI was unavailable in this runtime. No provider, organisation, payment service or paid plan was selected, contacted or provisioned.

## Boundaries and next priority

No target/production merge, Railway deployment, credentials, paid service, live payment, real child data, 3D work or Systems 797 code was changed. Physical-device touch/layout, hardware screen readers, real-device microphone/audio, live account/email/payment readiness and real-child outcomes remain unverified.

Next priority after the exact hosted screenshots are inspected: reproduce the deployed teacher desktop clipping against the current candidate before changing code; if it no longer reproduces, continue to the next concrete browser failure rather than duplicating a repaired issue.
