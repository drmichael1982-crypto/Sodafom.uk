# Parent dashboard learner focus — 12 October 2026

## Current handoff

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test target, rechecked from GitHub and Railway: `test/archie-2026-10-02@c3d33a23cf98ce2d2a0369348d03204f008cfe8c` (`Report Parent Profile learner failures honestly`). This is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Railway deployment `0d48beae-570a-4b92-8f0b-00e752752aef` is `SUCCESS` on that exact target. The production environment has no staged/applying work. The separate `sodafom797` service was only observed in the read-only environment inventory and was not changed.
- Dedicated improvement branch: `improve/archie-learning-20261007`.
- Application commits: `a498f7d21b2f301d6ca3be6de1e637d6ed972883` and accessibility refinement `fd7160f5acd3de4f2fd532117ea3c8b3634a3683`; reconciliation head `eb427d766d26c2acd79ec97bb338170aaea57e95` preserves the newer Parent Profile failure feedback.
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), still draft, open, mergeable, unmerged and undeployed.

No overlapping open parent-dashboard PR was found. Open 3D and Systems 797 work remains separate. Leonard’s private queue is not visible in this runtime, so the fresh branch/PR/file overlap check is the available coordination evidence.

## Bounded behavior change

The signed-in parent dashboard previously rendered every learner’s full tutor report, statistics, chart, subjects, recent games and quick links in one continuous page. The deterministic two-learner phone capture was 5,391 px tall.

The page now:

- keeps the family overview and all learner totals visible;
- adds a clearly labelled learner selector when a family has more than one learner;
- uses native buttons with a minimum 44 px target, visible selected state, keyboard focus ring, `aria-pressed` and a stable `aria-controls` relationship;
- renders only the selected learner’s detailed progress region, then replaces it when another learner is chosen;
- keeps each learner’s tutor memory and progress request isolated by learner ID;
- avoids a verbose whole-report live region and avoids low-contrast gold text on the light selector surface;
- keeps the existing one-learner dashboard unchanged apart from the internal selection state.

This is an adult information-density and navigation proposal, not a statutory curriculum change and not a claim of improved learning outcomes.

## Verification

| Check | Result |
| --- | --- |
| Focused parent dashboard + Parent Profile tests after reconciliation | PASS — 2 files / 7 tests |
| Full local unit suite after reconciliation | PASS — 169 files / 1,203 tests |
| TypeScript `tsc --noEmit` | PASS |
| Archie production build | PASS; existing Browserslist and large-chunk warnings remain |
| Hosted interest-theme check | PASS — application commit run #127 |
| Hosted Archie test build | PASS — [run #588](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38192373160), application commit `a498f7d` |
| Browser artifact | PASS — ID `11722536378`, SHA-256 `9ae740647be52b07253c27f2c288f4b010433da2826ace17d4f40b3dc0880c26`, 228 files |
| Exact reconciled hosted checks | PASS — interest themes #129 and [Archie test build #593](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38194517544) on `95bc05c` |
| Exact reconciled browser artifact | PASS — ID `11723576072`, SHA-256 `fa5ab372109915e0a0e9826093cffb95f084ff84cb11c60e357d65fbfa478769` |

Fresh workflows #591/#128 on the first reconciliation publication failed at TypeScript before tests because that publication had accidentally appended a blob-SHA token after `parent-dashboard.tsx`. The complete GitHub tree and exact failing line were inspected. Repair commit `95bc05c266eede28ed7737460bda99ed68e82e7f` removed that token and restored the complete 955-file tree. Its replacement workflows #593/#129 passed: TypeScript, all 1,203 tests, production build, Chromium installation, route/button checks, complete Reading Speed journey, full simulated Years 1–9 phone/tablet game/lesson matrix, learner settings/parent tutor isolation and artifact upload.

The new unit scenario verifies the default learner, switching, `aria-pressed`, the 44 px class, removal of the prior report from the DOM and the selected learner’s API request. The browser isolation journey now chooses Mia, checks only Mia’s topic, switches to Leo, checks only Leo’s topic, verifies both reports are never rendered together, checks phone/tablet width fit and captures the rendered result.

All learner and adult scenarios are simulated with deterministic mocked data. They are not real-child tests and do not demonstrate enjoyment or learning gains.

## Direct rendered review

- **Current live Railway baseline:** Home, game selection, settled Year 4 Maths lessons, parent gate and teacher page were opened directly. Railway now serves target `c3d33a2`. The blue/gold branding, pale surround, fixed puzzle artwork and blond, green-eyed Archie were preserved. Games and lessons are readable and unclipped at the browser viewport. The catalogue’s first cards still repeat the same placeholder art. The parent gate is clear and centred. The teacher page still relies on its existing two-screen pager for lower actions.
- **One complete game / full year matrix:** the current unchanged target already has passing exact-run evidence for the complete Reading Speed instructions-to-90%-result journey and the simulated Years 1–9 game/lesson matrix at 390×844 and 820×1180. This run did not substitute that evidence for the new parent selector: the new selector has its own browser journey and artifact gate in the final hosted run.
- **Before:** the exact prior two-learner parent artifact measured 390×5,391 on phone and 820×3,627 on tablet, with both detailed reports stacked.
- **After:** the hash-verified run #588 artifact was directly inspected. The selected Leo state is clear at both widths; Mia remains a large visible alternative; only Leo’s detailed report is present; report cards, statistics, empty activity copy and quick links are readable; no horizontal clipping is visible. The phone capture is 390×4,170 (1,221 px / 22.6% shorter) and tablet is 820×2,842 (785 px / 21.6% shorter). The footer remains a substantial part of the phone scroll but is unrelated to repeating learner reports.
- **Final accessibility-only refinement:** `fd7160f` gives every selector one stable report target and changes the selector star-count text from gold to foreground text. The reconciled candidate also retains the target branch’s honest Parent Profile load/save error and retry behavior. Focused tests, the 1,203-test suite, TypeScript and production build pass locally on that combined source. Run #588 is cited only for `a498f7d`, not misrepresented as exact evidence for the reconciled head.

## Current comparison, privacy and curriculum boundary

- Official DoodleLearning parent guidance, updated 6 August 2026, says parents select each linked child by clicking the child’s name on the progress page. This supplied a current multi-learner navigation benchmark; the Archie selector and visual treatment are original.
- Official Khan Academy Kids material describes a grown-up progress view and separate teacher/admin reporting. This supports keeping adult progress tools distinct from the child play flow.
- The ICO Children’s code identifies data minimisation and age-appropriate application as design considerations. Rendering one selected learner report at a time is a presentation/data-fetch minimisation choice, not a claim of legal compliance.
- Statutory English and maths objectives are unchanged. The DfE programmes of study remain the source of curriculum requirements; this adult navigation change is a design proposal outside those statutory requirements.

Sources:

- [DoodleLearning: viewing your child’s progress](https://help.doodlelearning.com/en/articles/6096182-viewing-your-child-s-progress)
- [Khan Academy Kids pricing and audience comparison](https://www.khanacademy.org/kids/pricing)
- [ICO Children’s code standards](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/code-standards/)
- [DfE national curriculum](https://www.gov.uk/government/collections/national-curriculum)

Stripe Directory was used before current external-product lookup. No provider, organisation, payment service or paid plan was selected, contacted or provisioned.

## Boundaries and next priority

No target/production merge, Railway deployment, credentials, paid service, live payment, real child data, 3D work or Systems 797 code was changed. Physical-device touch/layout, hardware screen readers, real-device microphone/audio, live account/email/payment readiness and real-child outcomes remain unverified.

Next bounded priority after exact hosted evidence is green: replace repeated catalogue placeholder art with a small original subject-distinct visual set, without changing game routes or copying third-party characters/art.
