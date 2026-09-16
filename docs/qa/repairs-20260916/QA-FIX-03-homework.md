# QA-FIX-03 — Typed Homework Helper repair

Coordinator: Coordinator Codex. Worker: QA-FIX-03.

- Branch: `codex/qa-fix-03-homework-20260916`
- Base: stable `442656b4e2ec76167b4d0b5fb7b804cf742904a5`
- Scope: typed homework answers and hints; preserve Agent 12's photo/reading scanner.
- Status: repaired and tested locally; not merged or deployed.

## Finding

The deployed audit found no visible answer after asking “Please explain 7 × 8 with a simple example.” Its hint action also replaced the question. The stable branch differs from that deployment: `HomeworkHelperPage` now renders a photo scanner, and every help action requires a photo. There is no usable typed-only homework route in that page.

The shared maths parser also does not recognise the full audited sentence, although it recognises `7 × 8`. Sending unrelated homework through the general tutor risks consuming a pending lesson answer, because that tutor is stateful.

## Changes

- Added a clearly labelled typed-question panel above the existing photo workflow. A photo is no longer required for typed help.
- The audited sentence returns `7 × 8 = 56` with a short bags/counters explanation. Simple whole-number sums have a small local explanation/hint helper. Other known maths, spelling, science and reading answers reuse the existing stateless local helpers.
- Hint keeps the original question in place and does not reveal the total for supported simple sums. Unsupported hints and questions explicitly say that Archie does not know them locally; they do not claim success.
- Added thinking, answer, error, retry, timeout and cancellation states. Editing, cancellation and page exit abort pending work; stale replies cannot overwrite a newer answer.
- Typed help uses the existing `askArchie` routing interface with a local answer and OpenAI fallback disabled. It makes no network request, spends no vouchers and does not store the homework question or mark it as a quiz result.
- `ScannerWorkspace` only gains an optional content slot plus clearer homework title/photo heading. Its image capture, speech, age selection, photo API request, error handling and paid permission checks are unchanged. The reading scanner does not receive the homework panel.

## Files

- `src/pages/HomeworkHelperPage.tsx`
- `src/components/scanners/ScannerWorkspace.tsx` — optional slot and headings only
- `src/components/homework/TypedHomeworkHelp.tsx`
- `src/components/homework/homework-help.ts`
- `src/components/homework/__tests__/TypedHomeworkHelp.test.tsx`
- `src/components/homework/__tests__/HomeworkHelperPage.test.tsx`
- This report

## Validation performed

Using Node 24.19.0 and the coordinator's frozen dependency installation:

```sh
./node_modules/.bin/vitest run src/components/homework/__tests__
# 24 tests passed in 2 files

node --test tests/scanners/scanners.test.cjs
# 40 existing scanner tests passed

./node_modules/.bin/tsc --noEmit
# Passed

./node_modules/.bin/eslint src/components/homework src/pages/HomeworkHelperPage.tsx src/components/scanners/ScannerWorkspace.tsx
# Passed without warnings

git diff --check
# Passed
```

The new tests exercise the rendered typed panel and actual local routing, including the exact audited sentence, hint/question preservation, failures/retry, unknown questions, cancellation, late answers, timeouts, empty responses, pending-lesson isolation, no network/storage side effects, and full Homework Helper integration. Integration tests confirm that photo actions remain disabled without a photo, invalid-photo errors remain visible, and the reading scanner stays separate.

## Remaining checks and limits

- Coordinator integration build and combined branch regressions are still required.
- This worker did not run a browser/device visual review, real microphone/camera session or live paid scan. Existing scanner tests mock devices/providers. No live photos were sent.
- Local typed help is deliberately limited to known local answers; it is not a general homework solver. Simple hints currently support the recognised whole-number sums. Unsupported problems remain visible and direct the child to a grown-up.
- Production still has the audited deployment until a separately authorised release. This branch does not alter domains, hosting, server routes, authentication, billing, package locks, master/main or Sodafoam Systems 797.

No merge, deployment, force push, production write or paid provider call was performed. Coordinator Codex receives the commit SHA for review/publication.
