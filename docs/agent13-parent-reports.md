# Agent 13 — Parent Dashboard and child reports

Branch: `agent13-parents-child-reports`
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`
Date: 13 September 2026
Project: Sodafom children's education platform (not Sodafoam Systems 797).

## Delivered on this branch

The Parent Dashboard now reads the actual child API array and normalises its camelCase fields. A parent selects one child and a 7-, 30- or 90-day reporting period. The report uses authenticated, child-owned `activity_sessions` records rather than the old `game_plays` queries and shared device tutor memory. Parent and child changes discard the previous report and abort pending reads.

Reports separate lessons, games, reading, homework and unidentified legacy activity. They show saved activity counts, marked-score averages, recorded time, stars, subject summaries, recent activity, strengths, support suggestions and parent-chosen next lesson guidance. Reading games recognised from the current game catalogue count as games, not twice. Suggestions open the verified `/lesson-library` or `/reading` chooser without changing the active child's profile or calling paid AI.

A strength requires at least three marked activities averaging at least 80%; support is suggested below 60% with the same minimum evidence. These are explicit product heuristics, not clinical, SEN or formal educational assessments. Trends compare the earlier/later halves of at least four marked sessions. Missing or impossible scores are unassessed, not zero. Scores are converted to percentages before averaging; different activities have equal session weight.

Parent-controlled JSON saving includes a privacy confirmation. Printing applies to the selected report. This dashboard does not automatically send, share, publish or store report copies in browser storage. API reads verify child ownership before querying activity, repeat parent ownership in the activity query, reject malformed identifiers, use private/no-store headers, and return generic errors. This does not constitute an audit of the whole app or establish a separate parent PIN on a shared signed-in device.

Subscription status reads the existing API without hardcoded prices. Monthly/annual cancellation uses the existing cancellation endpoint only after explicit confirmation, prevents duplicate requests, and shows a clear unconfirmed state on failure. The existing backend cancels immediately, so the confirmation says paid access ends immediately. No payment backend, Stripe configuration, prices, billing rules or entitlements were changed. Tests made no real payment, cancellation, email or production database calls.

## Data contract and honest limits

The reporting endpoint remains `/api/parent/dashboard`; its response is now `{ child, report }`. The Parent Dashboard consumer is updated with it. Any external consumer of the previous `totalGames`, `subjects`, `daily` or `recent` top-level fields must be reviewed before integration. The shared `ParentTutorReport` component remains untouched but is no longer embedded under every child.

Only account-linked saved activity is visible. This branch does not change lesson, game, reading or homework writers. In the inspected base, the Homework Helper makes a scan request without saving a child-linked activity; that scan cannot truthfully appear as completed homework in this report. Unsaved/device-only/guest activity is explicitly absent, not inferred from child names or shared local memory.

Future writers should use stable activity IDs with `lesson-`, `curriculum-` or `tutor-` prefixes for lessons; `reading-`, `read-`, `book-` or `scan-reading-` for reading; and `homework-` or `scan-homework-` for homework. Known catalogue game IDs/title slugs and `game-` prefixes are games. Otherwise the report preserves the event under Other saved activity. Existing reading-subject events without a recognised game ID are treated as reading. For unmarked activity, the writer must represent scores as null or a zero maximum rather than a fabricated 0/100 assessment. Source recording and classifications need coordinated integration with Agents 10–12.

Each report covers the chosen rolling period and at most the latest 500 saved records. More than 500 produces an explicit partial-report warning; recent history displays the latest 20. All-time child stars are labelled separately from the report period. No total-curriculum completion percentage, diagnosis or fabricated learning record is generated.

## Tests actually run

43 isolated automated checks passed (0 failed), covering six TS/TSX syntax checks, profile response formats, ID/period validation, score handling, all four activity categories, cross-child isolation, duplicate/date handling, evidence thresholds, recommendations, trends, API ownership and limits, private headers/errors, component output contracts, cancellation confirmation/success/failure/double-click protection, and stale-response/session-expiry handling.

The calculation module also passed strict TypeScript checking.

From a normal checkout with development dependencies installed:

```sh
node --test scripts/test-parent-reports.cjs
npx tsc src/lib/parent-reports.ts --noEmit --strict --target ES2022 --module ESNext --skipLibCheck
```

The execution environment here used Node 22.16.0 and TypeScript 5.8.3. The repository declares Node >=22.22.0. TypeScript was supplied by the environment without changing repository dependencies. The test runner mocks React hooks/JSX, authentication, SQL, content and network boundaries; it tests the actual changed source, not a browser rendering or a live integration. Its mock network tests do not invoke Stripe.

A full project checkout/dependency installation was not available in this execution environment. Full Vite build, whole-app type-check/lint, repository Vitest suite, real MySQL integration, signed-in browser testing, mobile layout and assistive-technology checks were NOT run. These remain integration gates; 43 passing isolated checks are not a 100% whole-app pass.

## Out-of-scope findings requiring review before release

1. The existing child-progress saving handler authenticates a session but does not visibly verify parent ownership before writing activity/stars for the supplied child ID. This is a separate data-integrity/security issue in the writer and was not changed under this dashboard/report-only assignment. The report endpoint's read checks do not fix it.
2. The existing subscription-management page expects status/billing fields that the subscription GET does not return, contains old price labels, and promises end-of-period access while the cancellation backend ends access immediately. This branch avoids those assumptions in its parent-only status panel, but leaves the separate page and payment implementation unchanged.
3. Some lesson/reading/homework activity needs child-linked persistence in its owning feature before it can populate reports. No guessed or cross-child device-memory fallback was added.

## Scope and integration

Changed application files: `src/pages/parent-dashboard.tsx`, `src/server/api/parent/dashboard/GET.ts`, `src/lib/parent-reports.ts`, and the three files under `src/components/parent/`.

Added supporting files: this report and `scripts/test-parent-reports.cjs`.

No artwork, games, lessons, scanners, books, cinema, birthday room, admin, auth implementation, AI routing, database schema, deployment configuration, dependency files or payment backend were edited. No production branch was updated, no merge or pull-request auto-deploy was requested, and no deployment was performed.
