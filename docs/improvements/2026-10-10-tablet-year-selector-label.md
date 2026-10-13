# Tablet learning-year label visibility — 10 October 2026

## Fresh state and ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children’s target: `test/archie-2026-10-02` at `d5200d2c46816536d506a1d9f6c556663997d7bf`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remained open, draft and mergeable before this change.
- Implementation commit: `fa85d6946b4b71f381c229b9c8d252771f4b1a96`.
- The open PR inventory was rechecked. PR #80 is the old, unmergeable homepage proposal; this change touches only game-toolbar rules inside the shared stylesheet and does not alter homepage layout or artwork. The 3D, legacy integration and KANO/797 queues remain separate. Leonard’s live worker status is not observable here, so no claim of active-worker coordination is made.

## Reproduced defect and bounded repair

The fresh Year 9 candidate showed the full selected value at 390 px, but truncated it at 820 px. Browser measurement established why:

| Viewport | Before control | Label text | After control | Horizontal overflow |
| --- | ---: | ---: | ---: | ---: |
| 390 px | 356 px | 247.5 px | 356 px | 0 px |
| 820 px | 160.3 px | 247.5 px | 453.8 px | 0 px |
| 1363 px | 220 px | 247.5 px | 290 px | 0 px |

The label is `Year 9 · age 13 · optional extension`. The previous tablet layout forced the year field and its scope explanation onto one narrow line. The repair:

- stacks the scope explanation below the year selector from 601–900 px;
- reserves a non-shrinking 290 px year field above 900 px;
- keeps the existing single-column phone treatment;
- adds an independent browser assertion that measures the selected text in the rendered font and requires 32 px more control width for the native arrow/padding at 390 and 820 px;
- retains the existing whole-page horizontal-overflow checks.

No lesson, question, age rule, reward, Archie artwork, account, audio, payment, deployment, 3D or `sodafom797` behavior changed.

## Verification

| Check | Result |
| --- | --- |
| TypeScript `--noEmit` | PASS |
| Full Vitest suite | PASS — 136 files / 1035 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings remain |
| Browser syntax / whitespace | PASS |
| Main browser suite | PASS — 15 journeys, all 130 linked game routes, all responsive layouts, zero browser errors and zero live API requests |
| Simulated learner matrix | PASS — 82 search/game/lesson journeys at 390 × 844 and 820 × 1180 |
| Exact candidate hosted workflows | PASS — Archie test build #394 and interest themes #50 |

The simulated matrix completes eligible Number Pop, Number Planets and Maths Bingo flows with wrong-answer recovery where applicable, hint use, keyboard focus, pause/resume, completion/rewards and menu return. It also completes seven-word spelling lessons across Years 1–9. These are simulated learners, not real-child testing or evidence of learning gains or enjoyment.

Hosted [Archie test build #394](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38054746408) passed on exact implementation commit `fa85d694…`: install, TypeScript, 136 files / 1035 tests, production build, Chromium installation, all 15 core browser journeys, all 130 linked game routes, responsive layouts, the whole-page jigsaw journey and all 82 simulated journeys. [Interest-theme run #50](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38054746419) also passed. Artifact `11670960746` has digest `sha256:950d72d2b314c7a9136f953afba0233191220073fc3ccce57c34933b0c6898f9`.

## Rendered and deployment review

Fresh candidate captures were directly inspected at 390 × 844 and 820 × 1180 for home, Year 9 game selection, a completed Maths Bingo round, completed Year 9 spelling, the unlocked parent page and the unlocked teacher page. The full optional-extension label is visible at both sizes, the scope explanation remains readable, controls/cards stay contained, and the established blue/gold illustrated identity is unchanged. Some emoji render as square placeholders in the headless test font; this is not treated as proof of a production glyph defect.

The public test URL was directly reopened. Its established desktop Games page remains visually coherent and accessible. Railway’s read-only deployment record still reports `25268c1c-26e0-4e21-91a0-a99c44afb4c1` as `SUCCESS`, created from exact target `d5200d2…` on 10 October 2026. The new candidate is not deployed and the public page does not yet include this repair.

## Product comparison and curriculum boundary

The requested Stripe Directory lookup was attempted first, but the Stripe CLI/directory plugin is unavailable in this runtime. No provider was selected or engaged. Current official product pages were then checked on 10 October 2026:

- [Oak National Academy’s pupil year chooser](https://www.thenational.academy/pupils/years) asks pupils their year explicitly; its [curriculum page](https://www.thenational.academy/curriculum) describes sequencing across year groups. The relevant benchmark is a clear, fully readable year choice before content discovery.
- [Khan Academy Kids](https://www.khanacademy.org/kids) describes an exploratory or personalised path for ages 2–8. This is useful evidence that age fit and navigation approach depend on the product; Archie should not copy its content or pretend one pattern suits ages 5–12 universally.
- [Sumdog’s official description](https://learn.sumdog.com/en-gb/about-us) describes adaptive maths/spelling practice for ages 5–14. Archie’s explicit year selector is a different design choice; the measurable improvement here is transparent scope, not a claim of stronger adaptation or outcomes.

This repair changes navigation clarity only. Existing content remains grounded in the [England English programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study), [England maths programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) and [DfE reading framework](https://www.gov.uk/government/publications/the-reading-framework-teaching-the-foundations-of-literacy). The optional extension and label-width policy are app design decisions, not statutory requirements. No proprietary character, artwork, lesson or wording was copied.

## Unverified boundaries and next priority

Physical phones/tablets, audible speech output, microphone capture, hardware screen readers, live parent accounts/payments and real-child learning or enjoyment remain unverified. No paid service, credential, merge or deployment was changed.

Next: complete the newly deployed parent-summary journey plus full Sudoku and Word Scramble rounds at phone/tablet widths, then verify saved tutoring remains isolated by synthetic learner and year. Recheck the target, PRs, CI, Railway and separate Leonard/797 queue first.
