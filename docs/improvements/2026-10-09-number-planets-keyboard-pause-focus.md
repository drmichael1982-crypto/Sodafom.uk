# Number Planets keyboard hint and pause focus — 9 October 2026

## State rechecked before work

- Continued `improve/archie-learning-20261007` from documented head `71c8250e806b951001b5c574eb683ab549917e89`; draft PR #81 still targets `test/archie-2026-10-02` at `4b2c53329e8d0a289cc3397de5a808e494d055dd`.
- GitHub Actions run #242 on that starting head was green. The preceding run note named keyboard-only Show hint, Pause mission and Resume mission coverage as the next non-duplicate gap.
- Railway deployment `aa228b4a-9e25-450c-b109-fc0ab9ff4986` was rechecked and remained `SUCCESS` on test commit `4b2c533`, branch `test/archie-2026-10-02`, created 8 October 2026 at 19:17:29 UTC. No deployment or configuration was changed.
- Directly reopened the live Number Planets page at the known test URL. The blue space treatment, large planet answers, mission count, hint/pause controls and illustrated background remained coherent and readable. This deployed build did not include the candidate regression change.
- Leonard/sodafom797 stayed separate. No Leonard file, service or queue was changed.

## Bounded regression improvement

Updated `scripts/test-archie-search-journey.cjs` and `src/pages/games/number-planets.test.tsx` to require the existing retry controls to work entirely by keyboard.

The checks now require:

- focus Show hint, activate it with Enter and retain focus while the exact arithmetic hint is announced;
- focus Pause mission, activate it with Space and keep focus on the same renamed Resume mission control in the temporary break state;
- activate Resume mission with Enter and restore focus to Pause mission;
- preserve the same equation and the retry hint through pause/resume;
- continue the established answer/Next/question focus hand-off, exact score/reward and return to Games;
- repeat the browser path at 390 × 844 and 820 × 1180 across the existing Years 1–7 matrix, including the Year 7 division retry.

The matrix remains 82 simulated learner journeys because the existing paths were strengthened rather than duplicated. No product-code change was warranted: the current controls passed the unit and real-browser keyboard regressions.

These are simulated learner scenarios. They verify implemented controls, state, focus and feedback; they do not demonstrate enjoyment or learning outcomes in real children.

## Accessibility, curriculum and product boundary

- WCAG 2.2 Focus Order requires focus movement to preserve meaning and operability. Keeping the renamed pause/resume control focused, then returning focus to the restored pause control, gives a predictable keyboard sequence: [W3C Understanding Success Criterion 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).
- England's statutory mathematics programme remains the curriculum boundary for the existing addition, multiplication and division progression. The exact game tiers, hints, recovery pattern and focus design are Sodafom proposals, not statutory requirements: [National curriculum in England: mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study).
- The prior official-product benchmark remains applicable: level-appropriate practice, prompt feedback and simple navigation are useful design comparisons. This run validates Sodafom's original keyboard path; it does not copy proprietary art, characters, wording or lessons and makes no superiority or learning-outcome claim.

No new provider or organisation was selected or looked up in this run, and no external service was provisioned, subscribed to or integrated.

## Verification

- Candidate code head: `a448eec9c7c47e3d1cb496d747064a201af5f47c`.
- Script syntax and `git diff --check`: PASS.
- Local focused Number Planets test: PASS, 1 file / 9 tests.
- Local `npm run type-check`: PASS.
- Local full unit suite: PASS, 87 files / 847 tests.
- Local production build: PASS with the existing mixed-import and chunk-size warnings.
- [GitHub Actions run #245](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/37984458909): PASS. Installation, type-check, 87 files / 847 tests, production build and Chromium setup all passed.
- Hosted route checks: PASS, 12 core browser journeys, all 130 linked game routes, responsive layout sweep with no horizontal overflow, zero browser errors and zero live API requests.
- Hosted simulated journeys: PASS, 82 total. Number Planets completed Years 1–7 at both widths with keyboard hint/pause/resume and focus assertions.
- Evidence artifact `11642523631`: 145 files / 59,319,164 bytes; SHA-256 `b6c616667e6d32ad10e60a56b0b893300e01a1624055419bcbdd30b3d9a2fbb4`.

## Rendered evidence reviewed

- Inspected fresh Year 7 retry and paused captures at 390 × 844 and 820 × 1180 after the hosted run.
- Retry views visibly showed Mission 2, `12 ÷ 4 = ?`, four large answer planets, `How many groups of 4 make 12?`, and an orange focus ring around Show a hint.
- Paused views visibly kept the same division equation, mission count and first-try score, displayed the optional break message and showed a strong orange focus ring around Resume mission.
- Phone content stacked without horizontal clipping; tablet spacing remained clear and the large controls were easy to distinguish. The live deployed page separately retained its existing blue space visuals and answer layout.
- Focus restoration after resume and hint retention were asserted programmatically in Chromium; screenshots are supporting visual evidence, not proof of real assistive-technology use.
- This was browser/CSS viewport evidence, not a physical-device, real screen-reader or real-child test.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, payment, real child data or 3D work was used. Physical-device touch/keyboard, microphone/audio, screen-reader, live-account and real-child checks remain unverified.

Next bounded priority: apply the same keyboard-only hint, pause/resume and focus-recovery assertions to the existing Maths Bingo retry journey at phone/tablet widths. Change product code only if that current journey exposes a defect.
