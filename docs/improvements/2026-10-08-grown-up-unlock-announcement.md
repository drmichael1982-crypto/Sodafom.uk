# Grown-up unlock announcement — 8 October 2026

## Repository and deployment state checked first

- Continued `improve/archie-learning-20261007` and draft PR #81, targeting `test/archie-2026-10-02`; the remote head before this change was `be266a29f1c937a3c6efb890d07e523dae24358c` and GitHub run #168 was successful.
- Rechecked open PRs before editing. PR #80 owns separate responsive-home work; no open PR was found editing `GrownUpGate` or this focus assertion. Leonard/sodafom797 remains separate.
- Directly reopened `https://archie-learning-test-production.up.railway.app/`. The rendered home still shows the dark-blue space jigsaw, gold controls, orbit artwork and blond Archie. Railway reports the live test service healthy on `test/archie-2026-10-02` commit `f254a44aa06bf0d8e4035059290e0a538393f886`, deployed 7 October 2026 at 22:33:37 UTC, with no staged or applying work.
- The candidate branch was not deployed or merged.

## Reproduced issue and bounded change

1. The grown-up gate already moved focus to a hidden confirmation after a correct response, but its accessible label was only `Grown-up area`; the text `Grown-up area opened.` was therefore not fully represented by the authored label.
2. The focused confirmation now has the explicit accessible label `Grown-up area opened`, making the state change unambiguous before the user tabs into the first protected control.
3. The component keyboard test now requires that exact focused confirmation.
4. The complete browser journey now checks both the accessible label and that the confirmation owns `document.activeElement` after every grown-up unlock.
5. The instruction, accepted answer, retry behavior, no-storage rule, protected content and visual layout are unchanged.

## Accessibility basis

- W3C's Label in Name guidance distinguishes the programmatic name used by assistive technology from other text and explains why names and labels should remain aligned: <https://www.w3.org/WAI/WCAG22/Understanding/label-in-name>.
- W3C's Labels or Instructions guidance says clear labels and instructions particularly help users with cognitive and learning disabilities understand required input: <https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions>.
- This is a bounded accessible-name/focus improvement, not a claim of full WCAG conformance or a substitute for a real screen-reader test.

## Verification and rendered review

- Focused gate/pager/Teacher tests: 3 files / 9 tests: PASS.
- `npm run type-check`: PASS.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- `node --check scripts/test-archie-ui.cjs` and `git diff --check`: PASS.
- GitHub run #170 for code head `8d0b22015dd35394cfd7ff982173770bafc18d7a`: PASS. TypeScript, 84 files / 833 tests, production build, all 130 linked game routes, 12 core browser journeys, 68 simulated learner journeys and artifact upload passed with zero browser errors and zero live API requests.
- Direct artifact review at 390 × 844: the Maths and History Teacher screens retain the same readable grouped cards, large Previous/Next controls and `2 / 13` and `3 / 13` counters without horizontal clipping.
- Direct artifact review at 820 × 1180: School preview, both saved-puzzle groups, year and subject controls remain together with the established blue/gold styling; the counter remains `1 / 5`.
- The confirmation itself is screen-reader-only, so the intended rendered result is no visual change. These are automated and manually inspected simulations, not real-child testing or proof of learning outcomes or enjoyment.

## Boundaries and next priority

No merge/deployment, paid service, credential change, real child data, 3D work or Leonard edit occurred. Physical-device keyboard and screen-reader behavior, microphone/audio, live accounts/payments and real-child testing remain unverified.

Next bounded priority: complete a physical keyboard and screen-reader walkthrough of the grown-up Teacher flow, then fix only a reproduced defect.
