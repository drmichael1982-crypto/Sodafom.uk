# Number Planets keyboard focus journey — 9 October 2026

## State rechecked before work

- Continued `improve/archie-learning-20261007` from documented head `c3862910352c21a2005a6b79093af1311526cad9`; draft PR #81 still targets `test/archie-2026-10-02` at `4b2c53329e8d0a289cc3397de5a808e494d055dd`, which remains the merge base.
- The preceding documentation run #237 was green. The latest run note named keyboard-only Number Planets retry and focus movement as the next non-duplicate gap.
- Railway deployment `aa228b4a-9e25-450c-b109-fc0ab9ff4986` remained `SUCCESS` on test commit `4b2c533`, created 8 October 2026 at 19:17:29 UTC. No deployment or configuration was changed.
- Directly reopened the live Games page. The blue/gold branding, pale illustrated background, large subject controls and coherent picture-card layout remained readable. This live deployment did not include the candidate regression change.
- Leonard/sodafom797 stayed separate. No Leonard file, service or queue was changed.

## Bounded regression improvement

Updated `scripts/test-archie-search-journey.cjs` so every existing Number Planets age/year journey now activates answers and progression with a keyboard instead of pointer clicks.

The browser journey must now:

- focus a wrong answer and activate it with Enter, retain focus on that answer, keep the same question and block the Next control;
- focus each corrected answer and alternate Enter/Space activation across the eight missions;
- verify that a correct answer moves focus to `Next space mission` or `Finish space mission`;
- activate Next with Enter and verify focus moves to the next `Choose the answer planet` heading;
- preserve the existing younger, middle and older retry samples, including Year 7 division, at 390 × 844 and 820 × 1180;
- complete at the expected score/reward and return to the Games menu.

The matrix remains 82 simulated learner journeys because the existing Number Planets paths were strengthened rather than duplicated. No product-code change was warranted: the current implementation passed the browser-level keyboard regression.

These are simulated learner scenarios. They verify implemented controls, state, focus and feedback; they do not demonstrate enjoyment or learning outcomes in real children.

## Accessibility, curriculum and product boundary

- WCAG 2.2 Focus Order requires keyboard focus to preserve meaning and operability. Retaining the failed choice for another try, moving to the newly revealed Next action after success and then announcing the new question form a logical task sequence: [W3C Understanding Success Criterion 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).
- England's statutory mathematics programme remains the curriculum boundary for the existing addition, multiplication and division progression. The exact game tiers, recovery pattern and focus design are Sodafom proposals, not statutory requirements: [National curriculum in England: mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study).
- The prior official-product benchmark remains applicable: level-appropriate practice, prompt feedback and simple navigation are useful design comparisons. This run validates Sodafom's original keyboard path; it does not copy proprietary art, characters, wording or lessons and makes no superiority or learning-outcome claim.

No new provider or organisation was selected or looked up in this run, and no external service was provisioned, subscribed to or integrated.

## Verification

- Candidate code commit: `96b33a5e655c012c7e3c15621762e7121a02ea1f`.
- Script syntax and `git diff --check`: PASS.
- Local focused Number Planets test: PASS, 1 file / 8 tests.
- Local `npm run type-check`: PASS.
- Local `npm test -- --run`: PASS, 87 files / 846 tests.
- Local production build: PASS with the existing mixed-import and chunk-size warnings.
- The local browser attempt could not start because this runner did not have a Playwright Chromium binary. It was not counted as a pass; hosted CI supplied the pinned browser.
- [GitHub Actions run #239](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/37977203447): PASS. Installation, type-check, 87 files / 846 tests, production build and Chromium setup all passed.
- Hosted route checks: PASS, 12 core browser journeys, all 130 linked game routes, responsive layout sweep with no horizontal overflow, zero browser errors and zero live API requests.
- Hosted simulated journeys: PASS, 82 total. Number Planets completed Years 1–7 at both widths; Years 2, 4 and 7 retained focus after a wrong answer and all missions passed the correct-answer/Next/question focus hand-off.
- Evidence artifact `11638769950`: 145 files / 59,303,277 bytes; SHA-256 `622322127ae49d0fc742fa6727352334152dc9dc310175555e04de35a5ff7443`.

## Rendered evidence reviewed

- Inspected Year 7 wrong-answer and completed captures at 390 × 844 and 820 × 1180 after the hosted run.
- Both retry views visibly showed Mission 2, `12 ÷ 4 = ?`, four large answer planets and the exact groups-of-four hint. Controls and text remained readable with no horizontal clipping.
- Both completion views showed 88%, 7 correct out of 8 and two stars. The phone view uses normal vertical scrolling for lower actions; the tablet view keeps the complete reward panel comfortably centred.
- The full artifact recorded no browser errors. Focus movement itself was asserted programmatically in Chromium; screenshots are supporting visual evidence, not proof of focus order.
- This was browser/CSS viewport evidence, not a physical-device, real screen-reader or real-child test.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, payment, real child data or 3D work was used. Physical-device touch/keyboard, microphone/audio, screen-reader, live-account and real-child checks remain unverified.

Next bounded priority: extend the Number Planets retry sample so Show hint, Pause mission and Resume mission are also activated entirely by keyboard, with focus recovery asserted after the temporary pause panel. Change product code only if that journey exposes a current defect.
