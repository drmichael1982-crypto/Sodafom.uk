# QA-FIX-02 — Child-facing Maths lesson content

Coordinator: Coordinator Codex. Worker: QA-FIX-02. Date: 16 September 2026.

- Branch: `codex/qa-fix-02-lessons-20260916`
- Base: `442656b4e2ec76167b4d0b5fb7b804cf742904a5`
- Scope: narrow follow-up to Agent 10's classroom work; not ownership of the whole lesson system.
- Status: repaired and checked locally, ready for coordinator review. No merge, production deployment, production API call, payment, database mutation, or Systems 797 change.

## Problem and repair

The local daily planner was using teacher planning notes as a lesson. Maths introduced wording such as “Explain, apply and compare … with evidence, linked steps and independent examples”, displayed a curriculum objective as its worked example, then asked children to identify that objective or vocabulary rather than solve a maths problem.

The repair separates child-facing Maths practice from planning metadata. Each of the eight existing scheduled Maths strands now has concrete teaching, a simpler explanation, worked examples, and ten questions for each supported age band (5–7, 8–10, 11–13). The bands start with tens and ones, whole-number place value, and decimal place value respectively. Other practice covers calculation, fractions/percentages, measurement, geometry, data, patterns/ratio, and word problems. Answer choices rotate and generated values vary by learning day.

The existing Maths cloud seed also contains teacher directions such as “Five retrieval questions from prior learning” as its activities. The classroom now explicitly uses the repaired local Maths content and shows “Maths practice · available offline”; it does not request that legacy cloud plan for Maths or let an earlier cloud response replace the local Maths lesson. Other subjects retain their existing cloud/local selection. There is no new endpoint or change to paid-AI authorization.

The Maths free-response activity prompt now asks children to use a drawing, objects or numbers and explain how they worked something out. Subject, duration, pause, microphone, progress and reporting interfaces are preserved.

## Files

- `src/lib/tutor/maths-lesson-content.ts`
- `src/lib/tutor/curriculum-year-plan.ts`
- `src/pages/tutor/ClassroomLessonPage.tsx`
- `src/lib/tutor/maths-lesson-content.test.ts`
- `src/pages/tutor/ClassroomMathsContent.test.tsx`
- This report.

## Validation

Command:

```sh
./node_modules/.bin/vitest run src/lib/tutor/maths-lesson-content.test.ts src/lib/tutor/curriculum-year-plan.test.ts src/pages/tutor/ClassroomMathsContent.test.tsx src/lib/tutor/classroom-system.test.ts
```

Result: **39 tests passed in 4 test files**.

- Independent answer checks read the numbers/shape facts from every generated question: 10,950 question instances (365 scheduled days × 3 age bands × 10 questions).
- All generated Maths lessons checked for ten distinct questions and IDs, four distinct choices, exactly one choice matching the expected answer, finite values, and no known planner boilerplate in child-facing text.
- Explicit expected answers cover the first question of all eight strands at all three ages.
- Youngest-band checks exclude negative answer options and the older bands' percentage, ratio, mean, decimal and hundredths question wording.
- Rendered classroom tests use the real Blackboard component. For all three age bands they verify a displayed worked example, progress through the activity into the first real Maths question, submit the correct answer and check positive feedback.
- A mocked legacy cloud plan is loaded in English, then the subject changes to Maths. The test verifies concrete Maths content, accurate offline label, absence of the old planning text, no Maths cloud request, preserved duration selection and working pause/resume control.
- Existing curriculum schedule/accessibility and classroom-system regressions pass.
- `./node_modules/.bin/tsc --noEmit`: **passed**.
- `git diff --check`: **passed**.

The coordinator will run combined branch validation and the production build after collecting the parallel repairs.

## Limits and follow-up

- This repairs Maths practice. Non-Maths local planning content and the legacy cloud library still need a separate subject-by-subject editorial review. Their content was deliberately not broadly rewritten in this branch.
- A year of scheduled generated practice is not 365 independently authored lessons. Patterns and some geometry facts repeat. This branch does not claim a complete curriculum, formal curriculum approval, adaptive mastery, or a classroom-teacher review; the existing teacher-review-required metadata remains.
- Automated answer and UI checks do not replace real children, teacher review, a full timed lesson, physical phone/tablet testing, microphone/audio testing, or signed-in cloud progress verification.
- Maths cloud content can be re-enabled after that library supplies independently reviewed child-facing teaching instead of planning directions, with regression tests for the replacement mapping.
- Live-site behavior is unchanged until Michael's separate merge/deployment approval is followed through by the coordinator.
