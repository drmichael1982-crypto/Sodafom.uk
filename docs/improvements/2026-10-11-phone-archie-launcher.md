# Grown-up dashboard launcher clearance — 11 October 2026

## Repository state

- Current test branch verified from Git and Railway: `test/archie-2026-10-02@60b7e162f281553070a6769883f0158682482e1c`.
- Railway deployment `433361be-8957-484d-b9dd-0c29df27e84c` is `SUCCESS` on that exact target.
- Improvement branch: `improve/archie-learning-20261007`.
- First compact-launcher attempt: `4aa255dd99c3ff0ab43d52acfe7ca60c1569e544`.
- Target reconciliation: `438eb30766af35830c56361a87f09c808b771bee`, which preserves both branches' learner-scoped validation plus age-appropriate fallbacks for older tutor records.
- Launcher removal code head: `986e72adc4a6f7e963c673a54f3afe7ba40a9d6e`.
- Current candidate code head: `4611d280379eb20b1a15c2bdf7be4081e68c899b`.
- Draft PR: #81. It remains unmerged and the candidate is not deployed.

The target's repaired parent progress error handling, response normalisation, abortable requests, responsive controls, 11–13 catalogue label and legacy tutor age fallback are reconciled rather than overwritten.

## Bounded change

At 390 px, the fixed full-width `Ask Archie` launcher covered part of the first `Child Tutor Progress Report` heading. A first attempt compacted it to 56 px, but fresh hosted run #540 proved that it still intersected the heading. The final bounded behaviour now:

- keeps the child-facing launcher off `/parents`, `/teacher` and `/parent-dashboard`, where it otherwise obscures or competes with grown-up controls and reports;
- keeps the full visible label at tablet/desktop widths on ordinary child-facing routes;
- uses a 56 × 56 px circular Archie-avatar control on ordinary child-facing routes up to 400 px;
- retains the accessible name `Ask Archie` when that visible phone label is hidden;
- preserves the approved blond, emerald-eyed Archie artwork and blue/gold treatment everywhere it remains available.
- renders learner cards immediately at full opacity when the user requests reduced motion instead of leaving the phone evidence in a washed-out mid-fade frame.

The signed-in two-child browser journey now confirms there is no child-facing launcher on the authenticated parent dashboard at 390 × 844 and 820 × 1180, while retaining its existing learner-isolation, containment and screenshot checks.

## Verification

- Focused tests after the launcher repair: 4 files / 13 tests passed; the reduced-motion follow-up passed 2 files / 3 tests.
- TypeScript: passed.
- Full unit suite after the final target reconciliation: 169 files / 1,194 tests passed.
- Production build: passed (existing dynamic-import and chunk-size warnings only).
- Diff whitespace check: passed.
- The local browser journey could not launch because this runner had no Chromium binary and its browser download endpoint returned an empty/truncated archive.
- Hosted run [#540](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38167013941) passed TypeScript, its full unit suite, build, Chromium installation, all route/layout checks and 98 simulated age/year journeys, then failed the new exact overlap assertion. That fresh failure drove the route-appropriate final repair rather than being hidden.
- Hosted run [#543](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38168521371) passed on exact launcher code head `986e72ad`, including the authoritative parent-dashboard journey. Artifact `archie-test-results` ID `11713766466`, SHA-256 `46c39c7ffafe28400efa06307bbf02b3ff913a5296ede214d508b68209890fec`.
- Its exact phone capture proved the launcher was gone and the heading was unobscured, but also caught the learner cards part-way through their 400 ms entrance fade despite a reduced-motion browser preference. The current code head removes that motion for reduced-motion users.
- Final branch-head run [#546](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38169739281) passed on exact code head `4611d280`, including TypeScript, 169 files / 1,194 unit tests, production build, Chromium installation, all route/layout checks, 98 simulated phone/tablet age-year journeys and the signed-in parent-dashboard journey. Artifact `archie-test-results` ID `11713903523`, SHA-256 `6c4dc1f8d9c314b8a291228cff56dee6913371c5256196306f310a9935dd4e36`. Parallel interest-theme run #109 also passed.

## Direct rendered review

The current deployed target was opened directly on 11 October 2026:

- Home retained the blue/gold identity, pale illustrated world and Archie launcher.
- Games showed clear year, subject and search controls with the repaired 11–13 labels.
- A complete simulated Year 4 `Archie’s Adventure Trail` visit exercised all eight clues, including deliberate wrong answer, revealed hint, corrected retry, seven later first-try answers, route movement and the final rocket/stars reward. This demonstrates the interface path only, not learning or enjoyment with real children.
- Lessons showed Years 1–9, subject tabs, a 36-week / 180-lesson Year 4 Maths sequence and clear `Start or continue` action.
- Parent settings used a grown-up gate, explained local/device scope and separated built-in help from optional online help.
- Teacher lessons exposed a visual defect after the grown-up gate: the outgoing gate pane remained clipped beside the newly revealed Year 4 list in the deployed view. That is not caused by this launcher change and is recorded as the next visual priority.

The exact final artifact was inspected separately at 390 × 844 and 820 × 1180. Both captures show fully opaque learner cards, distinct Mia and Leo records, an unobscured `Child Tutor Progress Report` heading, no floating child launcher and no horizontal clipping. The phone uses a long vertical reading surface; the tablet keeps its summary and report controls comfortably scannable. No physical-device touch/layout, hardware screen reader, real microphone/audio, live account/email/payment or real-child test was performed.

## Curriculum, comparison and accessibility basis

- [DfE mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) remains the statutory curriculum source. The cited year-by-year content is statutory; the app's lesson order, pacing, hints and rewards are design proposals. This change does not alter curriculum content.
- [Reading Eggs' parent guide](https://readingeggs.co.uk/articles/getting-started-guide-parents/) describes separate progress reports for up to four children. [Khan Academy Kids](https://www.khanacademy.org/kids/pricing) describes a parent section for seeing what a child has worked on. These are current official product benchmarks for scannable learner-specific reporting, not sources copied for characters, visuals, text or lessons.
- [W3C WCAG 2.2 target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) defines a 24 × 24 CSS px Level AA minimum, while the [W3C 44 px technique](https://www.w3.org/WAI/WCAG22/Techniques/css/C44) provides a more generous target example. This candidate retains 56 × 56 px wherever the compact child-facing phone launcher is appropriate and removes that floating obstruction from grown-up pages.

## Boundaries and next priority

Production, credentials, payments, deferred 3D work, real child data and the separate `sodafom797` developer app were untouched. Leonard's queue had no repository branch or open-PR conflict visible beyond the current shared target commits, which were reconciled into the two-parent commit.

Next: reproduce and repair the deployed teacher post-gate clipping with settled desktop/phone/tablet geometry, then exercise Reading Speed through wrong answer, hint/retry, pause/resume, completion/reward and return navigation.
