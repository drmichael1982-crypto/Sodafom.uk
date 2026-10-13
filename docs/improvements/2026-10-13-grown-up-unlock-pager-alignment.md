# Grown-up unlock pager alignment — 13 October 2026

## Repository state

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test target from repository evidence: `test/archie-2026-10-02@a7538e37c7f5042ca1291d2bdc06af1b73c2a9d2`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81).
- Application commits: `aa0e1d28de6d9994660dc9bd57e37e588f7e1e90` (`Keep grown-up pager aligned after unlock`) and `a671da59f28d2b5cbc7b291bd004a5d172624819` (`Capture settled grown-up first screen`).
- The target remains an ancestor of the candidate. No production merge or deployment was performed.

The separate 3D and `sodafom797` work was not touched. Leonard’s private queue is not exposed here; the current target, open draft PR, branch history and exact changed files were used as conflict checks.

## Confirmed defect and bounded fix

The live test app’s desktop `/teacher` route was unlocked through the written grown-up check. The pager still announced `1 / 3`, but direct rendered inspection showed the school-preview text clipped on the left and the teacher lesson list partially exposed on the right. Browser geometry measured a `1120px` pager viewport with an unintended hidden `scrollLeft` of `255px`; the transformed flow itself remained on screen 1.

The cause was the unlock announcement receiving programmatic focus without suppressing browser scrolling. The announcement remains focused for keyboard and assistive-technology continuity, but now uses `focus({ preventScroll: true })`. This preserves the current screen rather than letting the browser partially pan the overflow-hidden pager.

Regression coverage now:

- asserts the focus call uses `preventScroll` while retaining keyboard-only unlock and subsequent Tab order;
- asserts every tested Parents, Settings and Teacher unlock leaves the shared pager’s native horizontal scroll at zero; and
- captures the settled first unlocked Teacher screen at 390×844, 820×1180 and 1440×900 before navigating to the existing learner-summary evidence screen.

No lesson content, answers, curriculum mapping, rewards, artwork, branding, account, payment or production behavior changed.

## Verification

| Check | Result |
| --- | --- |
| Focused units | PASS — 3 files / 16 tests (`GrownUpGate`, `AppScreenPager`, `ArchieTeacherClass`) |
| Browser script syntax | PASS — `node --check scripts/test-archie-ui.cjs` |
| Patch whitespace | PASS — `git diff --check` |
| TypeScript | PASS locally and in the hosted build |
| Production build | PASS locally after the final application and browser-evidence changes (`vite build --mode archie-test`, 2,866 modules) |
| Hosted workflows | [Archie test build #635](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38382272196) PASS on exact app head `a671da59`: 174 files / 1,217 tests, production build, 15 core journeys, all 130 game routes, zero browser errors/live API calls, 98 simulated phone/tablet journeys, learner/settings isolation and parent/tutor isolation. Interest themes [#143](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38382272173) also PASS. |

Exact-head artifact [11805110579](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38382272196/artifacts/11805110579) contains 233 evidence files. Its downloaded ZIP matched the hosted digest: `sha256:139980f2fdb588893d1ec479770545346d79a934557dfca96f58afb08be71c44`.

All learner walkthroughs are simulated. They are not real-child testing and do not demonstrate learning outcomes or enjoyment.

## Direct rendered review

- The deployed home retains the blue/gold brand, pale illustrated world and blond, emerald-eyed Archie. Games, Lessons and the grown-up gate remain readable with large controls at the available desktop viewport.
- A complete live Number Pop journey deliberately included one initial wrong answer, the hint and a successful retry, then nine correct answers. It ended at `90%`, `9 correct out of 10`, three stars, supportive feedback, replay/home/next actions and the optional rocket picture reward.
- The live Parents route correctly separates the written grown-up gate from the unlocked account, optional AI, learning-settings and device-record panels. No credentials, child names or live services were used.
- The live Teacher route exposed the confirmed post-unlock 255px hidden-scroll defect described above. This was direct visual and geometry evidence, not an inference from an older report.
- The exact candidate artifact was then inspected at 390×844, 820×1180 and 1440×900. All three settled on Teacher screen 1 with the entire School preview card inside the viewport, Previous disabled, Next reachable and no adjacent lesson content exposed. The automated zero-scroll assertion also passed for Parents, Settings and Teacher at every tested layout.
- The previous exact candidate artifact at 390×844 and 820×1180 was re-inspected for home, Games, Number Pop completion, Lessons, unlocked Parents and unlocked Teacher. The phone result keeps the score and feedback clear but still requires vertical scrolling for replay/navigation; this run did not change or overstate that separate question.
- The new exact artifact was separately rechecked across phone/tablet Home, Games, a completed Number Planets game, lesson and unlocked Parents screens. Branding, readable large controls and unclipped cards are retained. The phone completion view shows replay and Home, with Play Next only partly inside the initial viewport and sharing below it; that is a remaining reachability/scrolling question, not a failed route.

## Curriculum, comparison and accessibility sources

This interaction fix does not change curriculum content. The [DfE mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) remain the statutory source for England’s year-group mathematics; the current Number Pop arithmetic and explanation flow is a design implementation, not itself a claim of statutory completion.

Current official product/accessibility benchmarks were checked for inspiration only:

- [Oak National Academy’s accessibility statement](https://www.thenational.academy/legal/accessibility-statement) explicitly treats keyboard navigation as an accessibility requirement and records remaining keyboard gaps. Archie’s measurable target for this fix is stricter and local: the grown-up flow must remain keyboard operable, keep the unlock announcement focused and leave the pager at exactly zero hidden native horizontal scroll.
- [Reading Eggs](https://readingeggs.co.uk/reapp/) describes visible progress, rewards and parent reporting for ages 2–13. Archie keeps those ideas original and bounded: rewards follow completed practice, while the adult area labels saved results as device practice rather than school assessment.
- [Khan Academy](https://www.khanacademy.org/) emphasises practice with prompt feedback and support. Number Pop’s wrong-answer hint, correction on the same question and explanatory success feedback were observed directly, but no comparative learning-outcome claim is made.

Stripe Directory was consulted before considering provider selection; its local CLI was unavailable and no provider or paid service was selected. No credentials, subscriptions or payments were activated.

## Remaining boundaries and next priority

Physical-device touch/layout, hardware screen readers, real-device microphone/audio, live account/email/payment readiness and real-child outcomes remain unverified.

Next: verify the 390px completion actions on a physical touch device and compact the result layout only if Play Next or sharing proves unnecessarily difficult to reach, without hiding the score, feedback or learning reward.
