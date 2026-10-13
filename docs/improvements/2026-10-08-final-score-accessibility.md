# Settled final score for assistive technology — 8 October 2026

## Repository and deployment state checked first

- Continued `improve/archie-learning-20261007` and draft PR #81, targeting `test/archie-2026-10-02`; the remote candidate head before this change was `4759d2e3c3f8050c8b85c0c8f5eec9bd563758f2`.
- Rechecked the PR, saved run notes, current CI and the live Railway test app before editing. Leonard/sodafom797 remains separate.
- The latest observed test deployment remains `test/archie-2026-10-02` commit `c173a2565d96e66c781383b38445d85fa491795b`. Candidate pushes were not merged or deployed.
- GitHub run #183 for the previous head was successful. Its `archie-test-results` artifact was present, but repeated manual download attempts returned HTTP 502 from the artifact gateway.

## Reproduced issue and bounded change

1. Completed the live Number Planets route through all eight missions with correct simulated answers. The result settled at 100%, 8/8 correct, three stars and the expected certificate/replay/navigation actions.
2. The sighted percentage intentionally counts from 0 to the final score. Immediately after the result opened, that transient visual `0%` was also exposed in the accessibility tree even though the settled result was already 100%.
3. The animated visual percentage is now hidden from assistive technology with `aria-hidden="true"`. A screen-reader-only `Final score: N%` value exposes the settled result immediately.
4. The sighted count-up animation, result design, scoring calculation, game content and navigation are unchanged.

## Accessibility basis

- W3C's explanation of WCAG 2.1 status messages says important result information should be programmatically determinable without moving focus: <https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html>.
- W3C's ARIA22 technique documents `role="status"` for advisory information delivered without focus: <https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22.html>.
- This is a targeted implementation improvement, not a claim of full WCAG conformance or a substitute for testing with physical assistive technology.

## Verification and rendered review

- Focused `GameShell.help.test.tsx`: PASS, 5/5. The result test now requires the immediate `Final score: 100%` screen-reader text.
- `npm run type-check`: PASS.
- `npm test -- --run`: PASS, 85 files / 834 tests.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- `git diff --check`: PASS.
- GitHub run #184 for code commit `09d059685f04ce49fc8a957e40ebada13e9b2525`: PASS. TypeScript, 834 tests, production build, all linked-button/game-route checks, all simulated year-group game/spelling journeys and artifact upload passed.
- GitHub produced `archie-test-results` artifact ID `11534132675` (40,702,575 bytes, SHA-256 `3a17e09f45fa3c3ac9fc66ed0fd97b43b9a744d4292e934b4ac39eb624a85578`).
- Direct live rendered review covered the Number Planets start, every mission and settled result. Blue/gold space artwork, blond Archie, large answer controls and result navigation were coherent and readable.
- Direct device-check review covered Number Planets at 360 × 740 and 768 × 1024. The mission, equation, all four answer planets and feedback remained readable without horizontal clipping. These were CSS viewport simulations, not physical device or real-child tests.

## Boundaries and next priority

No merge/deployment, paid service, credential change, real child data, 3D work or Leonard edit occurred. Physical phone/tablet, microphone/audio, device keyboard/screen reader, live accounts/payments and real-child testing remain unverified.

Next bounded priority: simulate Number Planets' wrong-answer, hint and retry path at phone and tablet sizes, verify first-try scoring and completion messaging, and change code only if that walkthrough reproduces a concrete defect.
