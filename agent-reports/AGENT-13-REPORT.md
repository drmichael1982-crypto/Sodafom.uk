# Agent 13 Recovery Report

- **Agent number:** 13
- **Original task:** Parent-authorised child progress reports and parent dashboard recovery.
- **Recovery branch:** `recovery/agent13-parent-reports-20260913`
- **Base:** remote `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- **Recovered source reviewed:** `agent13-parents-child-reports` at `88a52fe388329aa36a90fc96525e7a32efc40880`
- **Latest implementation commit:** `8c3f974e0f2e064b17762019ff2f27b65db9f7f4`
- **Pushed:** Yes — application changes were uploaded and verified on this recovery branch through the authorised GitHub connector. No PR, merge, or deployment was created.

## Completed

- Rebuilt the compatible reporting path on current `main` rather than cherry-picking the divergent Agent 13 history.
- Replaced the stale `game_plays` dashboard queries with a parent-selected 7-, 30-, or 90-day report based only on saved, child-linked `activity_sessions` records.
- Added strict child-ID/period validation, a 500-record cap with an explicit partial-report warning, an owner-scoped child lookup before activity reads, and a second parent-ownership check in the activity query.
- Added no-store, cookie-varying, no-index response headers and generic error messages; missing and non-owned children receive the same response so the endpoint does not reveal child IDs.
- Added a parent dashboard that selects one linked child at a time, aborts/clears stale report reads on a child or period change, and shows account-linked activity, score context, categories, trends, strengths, support areas, and local lesson choices.
- Preserved the current certificates page's limited subject summary contract while the new dashboard uses the verified `{ child, report }` response.
- Added the same ownership verification, strict child ID validation, private response headers, and non-leaking errors to the existing read-only `/children/:childId/progress` endpoint before it reads activity or weekly summaries.
- Kept explicit, parent-controlled JSON save and print only. The save prompt explains that it contains a child's learning data.

## Privacy and safety confirmation

- Reports use only records already linked to the selected child account; they do not infer activity from a child name, guest session, unsaved lesson, browser cache, device tutor memory, scanner image, or microphone data.
- No report is automatically emailed, shared, published, logged, stored in browser storage, sent to AI, or sent to a payment provider by this recovery work.
- The dashboard does not embed `ParentTutorReport`, which reads shared device tutor memory and is not a safe source for a selected child's parent report.
- A blank/unknown report is explicitly presented as insufficient linked evidence, not failure. Missing, impossible, or invalid scores are unassessed rather than converted to failing scores.
- Lesson suggestions only link to the existing local `/lesson-library` or `/reading` routes; they do not alter a child profile, schedule work, or use paid AI.

## Tests performed

| Command                                                   | Result                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `node --test scripts/test-agent13-parent-reports.cjs`     | Passed: 25/25 focused checks                                                                   |
| Targeted ESLint on all changed Agent 13 source/test files | Passed: 0 errors, 0 warnings                                                                   |
| `pnpm type-check`                                         | Passed                                                                                         |
| `pnpm build`                                              | Passed (existing large client-chunk advisory; Rollup stripped third-party annotation comments) |
| `git diff --check`                                        | Passed                                                                                         |

The 25 focused checks compile the changed TS/TSX files and mock React, content, auth, database, and network boundaries. They cover strict identifiers/periods, profile-field minimisation, score/category rules, cross-child and stale-record exclusion, report thresholds/trends/caps, parent report owner checks/headers/errors, certificate subject compatibility, read-only child-progress ownership, and absence of device-memory, automatic-email, payment-control, and payload-logging paths. No production database, browser, email, payment, scanner, or AI request was made.

`pnpm install --offline --ignore-scripts --no-lockfile` supplied the local development layout without changing tracked dependency manifests or the lockfile. A frozen lockfile install cannot be used on this current-main checkout because the pre-existing manifest/lockfile specifiers are not aligned.

## Deliberately omitted stale or out-of-scope integrations

- The old Agent 13 `ParentSubscriptionStatus` panel and its cancellation handling were not ported because they are payment-related and this recovery explicitly excludes payments.
- The current dashboard's automatic weekly-email control was removed from this report path rather than carried forward. This recovery does not modify the separate email backend.
- `ParentTutorReport` is left untouched and omitted from this dashboard because its device-local/shared tutor-memory source is not a parent-authorised child record.
- The stale `game_plays`, daily-chart, and badge-count reporting queries were not retained. The compatible certificates subject summary is built from saved `activity_sessions`; badge data remains outside this recovery's report contract.
- No scanner, voice/audio, AI routing, admin, payment, default-branch, Railway/deployment, database schema, or 797 code was changed.
- The existing progress **POST** writer was not changed: it creates milestones/promo-code side effects and is outside this read/report recovery and the no-payments boundary. Its parent-ownership enforcement needs a separately scoped writer-security review before release.

## Real integration checks still required

- In a signed-in browser with two parents and multiple children, verify one parent receives the same non-enumerating result for a missing/non-owned child and never sees another parent's report/progress response.
- Against a non-production database clone, verify current `activity_sessions` rows, score/null conventions, subject/activity identifiers, time-zone boundaries, a 501-row report, and all-time stars match the displayed report.
- In browser privacy tools and on a shared device, verify no-store response behaviour, child/period switching during a slow network request, sign-out/sign-in state changes, the explicit save confirmation, downloaded JSON contents, and print output.
- With keyboard, screen reader, and mobile layouts, verify child selection, period control, retry/status text, table captions, report print layout, and the plain-language privacy explanation.
- Verify the certificates page handles the preserved period-scoped subject summary as intended. Badge counts are deliberately not obtained by the new report endpoint.

## Shared files / merge conflicts to watch

- Shared recovery surfaces: `src/pages/parent-dashboard.tsx`, `src/server/api/parent/dashboard/GET.ts`, and `src/server/api/children/[childId]/progress/GET.ts`.
- Reconcile any changes to those files deliberately; do not reintroduce `game_plays`, shared tutor memory, automatic email, or payment controls when combining recovery branches.

## Safety confirmation

`main`/ `master` was not merged or changed. No PR, Railway action, deployment, payment action, or production database operation was made.
