# Reward contrast and compact navigation — 7 October 2026

## Exact repository and deployment state

- Dedicated candidate branch: `improve/archie-learning-20261007`; draft PR #81 targets `test/archie-2026-10-02`.
- The run first merged test commit `7a78440ce57b8dc9f02403984fd36977ba832828`, then discovered newer deployment evidence and explicitly fetched and merged current test lineage `61146b73fcd6bc86b11761b78285fd0fbeaee6c9` (`6d476dd` → `9f82824` → `bd73137` → `61146b7`). No concurrent history, fraction, lesson, parent or age-range change was overwritten.
- Candidate reconciliation commits are `962ff7deb551a7130ef1f25a5a9182a6243ec297` and `242b61680821bd515b8a3179fa634f913a587b2e`.
- Railway read-only evidence: deployment `0439d23c-63c5-4473-a77b-23d19ff0017d`, SUCCESS, created 2026-10-07T21:37:56.796Z and updated 2026-10-07T21:40:06.060Z, branch `test/archie-2026-10-02`, commit `61146b73fcd6bc86b11761b78285fd0fbeaee6c9`. This candidate has not been deployed.

## Current failures reproduced and fixed

1. Shared result screens used low/uncertain text contrast over subject gradients. Maths now uses navy on gold/pale-gold; spelling uses white on dark rose; reading uses white on dark green. The lowest endpoint ratio is 6.29:1. The supportive result line now has explicit navy-on-blue styling. A focused result test protects these colour contracts.
2. The new compact full-screen home hid personalisation, Ask Archie and several destinations. Personalisation and Ask Archie now have labelled 44 px header controls; Progress, Settings, Clock lab, Artwork gallery and Privacy are present in the paged picture menu. The narrowest header collapses decorative logo detail rather than clipping controls.
3. The nested home picture menu originally behaved as one oversized pager item. It now uses the measured pager width, and browser checks traverse pages to prove every visible card route.
4. A tall completion card was vertically centred into negative space and covered the game header. Result content now starts below the header and scrolls within the game area, leaving Back/Exit and Ask Archie visible.
5. Current upstream browser/type checks had stale selectors and an implicitly untyped pager-test mock. The checks now follow the visible compact labels, use catalogue-derived age expectations, recognise clipped pager panels, and type-check.

## Curriculum, comparison and accessibility basis

- Statutory source: England Mathematics Programme of Study: <https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study>. Year 1 includes number bonds and related subtraction facts within 20, addition/subtraction to 20 and one-step problems. The bounded Year 1 Bingo deck remains within 10 as supportive introductory practice; that limit is a design choice, not a claim that it covers the whole statutory programme.
- Accessibility benchmark: WCAG 2.2 SC 1.4.3 explanation: <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>. Normal text needs 4.5:1 and large text 3:1. Automated colour calculation and rendered browser checks are evidence for the changed result text only, not a full WCAG-conformance claim.
- Official product comparison checked 7 October 2026: Mathseeds describes structured one-to-one, interactive, rewarding maths lessons for ages 3–9 (<https://mathseeds.com/>). Khan Academy Kids describes games, books and lessons, teacher assignment/progress tools, and an ad-free/minimal-data approach for ages 2–8 (<https://www.khanacademy.org/kids>). These are benchmarks for short instructions, meaningful feedback, clear progress and privacy. Archie keeps original characters, art, wording and lesson content, covers a different 5–12 England scope, and no superiority or learning-outcome claim is made.
- Stripe Directory instructions were consulted before the provider benchmark. Its CLI was not available in this runtime, so no service was selected, provisioned, subscribed to or paid for; only public official product pages were read.

## Verification on the reconciled candidate

- `npm run type-check`: PASS.
- Vitest: 84 files, 828 tests: PASS. Targeted pager, age and result tests: 22 PASS.
- `npm run build:archie`: PASS. Existing bundle-size/dynamic-import warnings remain warnings.
- Primary Chromium: 11 complete journeys, all 130 linked game routes, zero browser errors and zero live API requests: PASS.
- Responsive matrix: 550 route/viewport combinations across 320 px phone through tablet and landscape; zero horizontal failures, clipped art findings or browser errors: PASS.
- Simulated learner suite: 68 phone/tablet journeys: PASS. It covers game filtering and recovery for Years 1–9, Number Pop completion, and Maths Bingo perfect/retry/hint/pause/resume/completion for Years 1–6. It also asserts computed completion-text contrast at or above 4.5:1.
- Rendered visual review: the live test home retained blue/gold branding, pale yellow-to-blue background, planet art and blond Archie. Local after-captures at 390 × 844 and 820 × 1180 show a legible navy/gold completion banner and result card; the corrected 390 px completion capture keeps the blue game header and Ask Archie visible. Emoji appeared as empty glyph boxes in the temporary Chromium image font, so emoji rendering remains a runtime/font check rather than an app-logic pass.

## Boundaries and next priority

These are simulated journeys, not tests by real children and not evidence of enjoyment or improved learning outcomes. Physical phone/tablet testing, real microphone/audio, screen-reader/keyboard review on devices, live accounts and payment readiness remain unverified. No merge, production deploy, paid service, credential change, real child data or 3D work occurred. Leonard/sodafom797 remains separate; its active laptop-worker state was not verified and it must not edit this branch concurrently.

Next bounded priority: complete one end-to-end History/Fractions walkthrough at each applicable school-year boundary, including instructions, wrong/correct feedback, retry, completion, pause/navigation and parent/teacher reporting, then repeat visual checks at phone and tablet widths.
