# Settled Number Pop result evidence — 13 October 2026

## Repository state

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test target from repository evidence: `test/archie-2026-10-02@eda1acd11c1af267ca4227e7abb84ba0c200bcae` (`Keep parents page consistent with free access`). This is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81).
- Reconciliation commit: `214fa75116b4b0bed9db1b843b812a9050e3716f`; settled-result evidence commit: `02e7a2cc28992517016581617f750b83042a9312`; catalogue-recovery readiness commit: `fe0ae5e04ab2cb4a4cdd3f759666fdc501649e11`.
- The target is an ancestor of the candidate. No production merge or deployment was performed.

The separate 3D and `sodafom797` work was not touched. Leonard’s private queue is not exposed here; current branches, open PR state and exact changed files are the available conflict checks.

## Bounded improvement

The previous exact-artifact Number Pop result capture was taken immediately after the accessible final-score heading appeared. `ResultScreen` intentionally exposes the settled score to assistive technology before animating the sighted counter and reward details, so that screenshot recorded a transient entrance frame as though it were the final layout.

The simulated browser journey now waits for the visible `90%` score, the three-star reward message and a short settling interval before each phone/tablet completion capture. This follows the established settled-result pattern already used by the focused Reading Quest journey.

Fresh hosted run #620 then exposed a separate current race before the game journey: immediately after activating `Show Year 1 games`, the script read the `All games` pressed state before React had painted it. The final change waits for the rendered `aria-pressed="true"` state before asserting the recovered catalogue. It does not mask a product failure; the same run had already passed its unit suite, build and route crawl, and the replacement run completes the exact recovery flow.

No game UI, score, reward timing, lesson, curriculum content, artwork, branding, production route, payment flow or account behavior changed.

## Verification

| Check | Result |
| --- | --- |
| Script syntax | PASS — `node --check scripts/test-archie-search-journey.cjs` |
| Patch whitespace | PASS — `git diff --check` |
| Focused parent/result unit checks | PASS — 2 files / 8 tests |
| TypeScript | PASS |
| Production build | PASS; existing Browserslist, mixed-import and large-chunk warnings remain |
| First hosted workflow | FAIL — [Archie test build #620](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38366748332) reached a premature catalogue pressed-state assertion after type-check, all unit tests, build and route crawl passed; its artifact stopped before Number Pop and is not used as final visual evidence |
| Final candidate workflow | PASS — [Archie test build #623](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38368401772) on exact commit `fe0ae5e`: type-check, full unit suite, production build, button/game-route crawl, full simulated year/age phone/tablet matrix and artifact upload |
| Interest-themes workflow | PASS — run #138 on exact commit `fe0ae5e` |
| Exact responsive artifact | `archie-test-results` artifact `11798407850`; downloaded ZIP SHA-256 `0ca52f28add139eb220100500e56c857a876801decbeb44273ff033eb48779aa` |

All learner scenarios are simulated. They are not real-child testing and do not demonstrate learning outcomes or enjoyment.

## Direct rendered review

- The current deployed home, Games, Lessons, Parents and Teacher routes were opened directly. The blue/gold brand, pale illustrated world, large controls and blond, emerald-eyed Archie remain coherent at the available desktop viewport.
- Games and Lessons were readable and unclipped. The teacher page clearly states that it is a local preview with no pupil tracking and instructs adults not to enter pupil names. The parent route keeps the adult gate and privacy guidance.
- The live catalogue still uses repeated generic card art, confirming that the deployed state is older than the candidate’s differentiated game-card work; this run did not deploy the candidate.
- Exact `fe0ae5e` captures were visually inspected at 390×844 and 820×1180 for home, Games, a completed Number Pop journey, spelling, unlocked Parents and unlocked Teacher. Branding, blond/emerald-eyed Archie, large controls, adult/data-boundary copy and responsive containment remain coherent.
- The settled Number Pop captures visibly show three stars, `90%`, `9 correct out of 10 questions`, earned-star and supportive-practice feedback. The earlier apparently blank card was a transient animation frame, not a persistent layout defect.
- At 820×1180 the result, replay/home choice, next activity and sharing actions are visible together. At 390×844 the meaningful score and feedback are clear, but replay/navigation actions remain below the initial viewport. That is a measurable next usability question; this evidence-only change does not claim it is repaired.
- Phone and tablet Games views show distinct decorative cues for Adventure Trail, Star Trail, Number Pop and Times Table Race, with written labels retained. The spelling lesson has readable instructions and six large controls. Parent and Teacher views preserve their explicit account/privacy and no-real-pupil-data boundaries without horizontal clipping.

## Sources and boundaries

This browser-evidence change does not alter curriculum content. The [DfE mathematics programme](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study) remains the statutory source for year-group mathematics; its Year 1 material includes counting, reading and writing numbers and practical/pictorial representations. [Khan Academy Kids](https://learn.khanacademy.org/khan-academy-kids/) remains a current product benchmark for a free, playful, curated activity/library experience for younger children. These sources guide original design and evidence quality; they are not copied content or evidence that Archie improves learning outcomes.

Physical-device touch/layout, hardware screen readers, real-device microphone/audio, live account/email/payment readiness and real-child outcomes remain unverified. No credentials, paid service, live payment or real child data was used.

## Next priority

Verify that replay/home/next actions are reachable by touch and keyboard on a physical 390px device, then make a bounded compact-result adjustment only if that direct check confirms avoidable scrolling or obstruction. Do not infer a persistent blank-space defect from an animation frame.
