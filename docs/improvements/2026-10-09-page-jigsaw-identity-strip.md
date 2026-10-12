# Page-jigsaw identity strip and narrow-phone controls — 9 October 2026

## State rechecked before work

- Continued draft PR #81 on `improve/archie-learning-20261007` from documented head `6b2cf5af12fdd60ab4c58e791c2025b85a4d4d32`.
- Rechecked the remote target rather than relying on the previous note. `test/archie-2026-10-02` had advanced to `767b3e61cfd97f7710544a20bbf4b8812c172d7b` (`Recover safely from malformed tutor memory...`). The candidate was reconciled with that exact head as merge commit `99b5717dbb47a05277a3071b0a299d13cc4d3f06`; its merge base with the target is `767b3e61` and it is not behind.
- Railway deployment `22dcab19-faf4-4320-8946-a332b8fe16c8` was `SUCCESS` on that test commit, created 9 October 2026 at 22:06:22 UTC. The separate `sodafom797` service was not changed.
- The reconciliation conflict in `ArchiePages.tsx` retained the target branch's optional nickname/age settings and the candidate's bounded Years 1–7 main-path explanation. No content, artwork, 3D, payment or production configuration was removed or enabled.

## Bounded improvement

The preceding visual review found the full-screen page-jigsaw identity text partly clipped. The implementation now:

- gives the identity text its own non-shrinking wrapper and switches from `Your picture playground` to `Picture playground` only below 331px;
- keeps the complete accessible name `Your picture playground` for assistive technology;
- protects the 44px Return to my activity control and prevents the strip from widening the document;
- adds browser measurements and screenshots at 280 × 653, 320 × 568, 390 × 844, 768 × 1024, 820 × 1180, 1280 × 900 and 844 × 390.

The new hosted guard exposed a separate real regression on the newly reconciled home: fixed navigation tiles measured about 41px at 280 × 653 and 320 × 568. The final short-phone layout keeps the full live instruction/status visible, uses 44px loose pieces and a compact 80px tray, and hides only the redundant tray heading. This releases height for the board's fixed controls instead of shrinking or overlapping them.

Review of the first green artifact then found a tablet-only defect that document-overflow checks could not detect: the 820px board itself extended past the right viewport edge. The board is now capped by both available height and viewport width, and the browser guard measures its physical left/right edges at every size.

These are simulated learner and responsive scenarios. They verify implemented layout, controls and state; they do not demonstrate enjoyment or learning outcomes in real children.

## Accessibility, curriculum and comparison boundary

- [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) uses 320 CSS pixels as the narrow-width benchmark. The seven-view guard deliberately includes 280px and 320px views and rejects document-level horizontal overflow.
- [W3C Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) provides the stricter 44 × 44 CSS-pixel benchmark used for child-facing jigsaw controls. This is an Archie design choice, not a claim of full WCAG conformance.
- [Khan Academy Kids](https://www.khanacademy.org/kids) describes a broad mix of games, books and lessons for ages 2–8. [Sumdog](https://www.sumdog.com/en/) describes game-based maths and spelling practice for ages 5–14. Those official descriptions are comparison benchmarks for recognisable mode identity, simple navigation and broad practice access only. No proprietary characters, art, text, lessons or interaction sequence was copied, and no universal-superiority claim is made.
- The code change does not alter curriculum content. England's statutory programmes remain the boundary for existing learning objectives, while the picture mode, responsive wording and target sizes are Sodafom design proposals: [National curriculum](https://www.gov.uk/government/collections/national-curriculum).

No provider or organisation was selected, purchased, subscribed to or integrated, so no Stripe Directory lookup was required.

## Verification

- Reconciled code head: `99b5717dbb47a05277a3071b0a299d13cc4d3f06`.
- Final code head: `16a42042e088308bd6b11c7497ac11fdc1a0ff73`.
- Focused component suite: PASS, 1 file / 8 tests.
- Local full suite after reconciliation: PASS, 110 files / 949 tests.
- `npm run type-check`: PASS.
- `npm run build:archie`: PASS with the existing mixed-import and large-chunk warnings.
- Focused ESLint: 0 errors and 13 inherited warnings in the touched component/reconciled page.
- GitHub runs #265, #267 and #269 passed TypeScript, 949 tests, the build and Chromium installation, then correctly stopped on the newly strengthened 44px browser assertion at the first unrepaired narrow viewport. Run #271 proved the target sizes at 280px and 320px but exposed that the first compact design hid the live wrong-answer status. The assertions were not weakened; the layout was repaired instead.
- [GitHub Actions run #275](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38002290604): PASS — TypeScript, 110 files / 949 tests, production build, all 130 linked game routes, 12 core browser journeys, the complete seven-viewport jigsaw/identity-strip walkthrough and 82 simulated search/game journeys. The browser run reported no horizontal overflow, zero browser errors and zero live API requests.
- Artifact `11649814772`: 167 files, 74,640,734 bytes, SHA-256 `01a207cb62176155e314510b85b04af8c39ea0202036fcbc8598ee933c828a5f`.

## Rendered evidence reviewed

- Directly opened the current deployed home, Games, lesson, Maths Bingo, grown-up gate and teacher preview. The live home preserves the blue/gold identity, pale illustrated background, continuous picture, large route controls and blond, emerald-eyed Archie. Games exposes its year, search and subject controls; the spelling lesson exposes Hear/Try/Pause/Next; the grown-up and teacher screens retain their gates. No desktop-width horizontal overflow was observed.
- Completed the deployed picture jigsaw and Maths Bingo flows. The picture and game controls remained usable, and the completed states/navigation appeared; these are simulated interactions, not real-child tests.
- The prior hosted failures made the undersized 280px and 320px controls measurable. Run #273's green screenshots then exposed the tablet board extending past the 820px viewport even though the page itself did not overflow.
- Fresh run #275 captures at 280 × 653 and 320 × 568 show compact identity text, full live feedback, 44px pieces/controls and no clipping. The 768 × 1024 and 820 × 1180 captures show the full board, all six fixed destination controls, tray and actions inside the viewport. The visual review supports this responsive-layout fix only; it does not establish learning outcomes or real-child enjoyment.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, live payment, real child data or 3D work was used. Physical-phone/tablet touch, real keyboard/screen-reader, microphone/audio, live-account/payment and real-child checks remain unverified.

Next bounded priority: inspect the parent/teacher navigation and progress handoff at phone/tablet widths, fixing only a reproduced defect and keeping Leonard's separate queue isolated.
