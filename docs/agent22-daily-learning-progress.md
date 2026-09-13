# Agent 22 — Daily Learning and Progress

Branch: `agent22/daily-learning-progress-20260913`

Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.

## Entry point and scope

Daily Learning appears at the top of Archie's Menu: `/archie-menu#daily-learning`.
The only existing page change is its import and component mount. All existing
menu cards remain unchanged. Lessons, games, books, payments, admin, AI,
artwork files, deployment configuration and other branches are not modified.

The dashboard uses the selected child ID, verifies ownership through the existing
authenticated progress endpoint, and displays the server-saved name and age group.
It reuses `/assets/images/archie-character-v2.png` without editing the artwork.
It offers lesson, reading and game links, completed activities today, saved stars,
an optional age-sized daily aim, gentle achievements and a seven-day overview.
A zero-star completion still counts as effort. Rest days carry no penalties.

## Progress and privacy

`GET /api/children/:childId/progress?view=daily` is an opt-in, read-only view.
It verifies the signed-in account owns the child before reading activity rows,
uses a validated `beforeId` cursor, serves 100 rows per page with a sentinel,
and sets `Cache-Control: private, no-store`. Default progress responses are
preserved for existing callers. There are no reward, completion or star writes.

The client deduplicates sessions, excludes other children and future records,
and groups activity by the browser's local calendar day, including daylight
saving boundaries. Requests are cancelled on unmount and profile/account changes;
loading, empty, error, retry and blocked-storage states have explicit messages.

Only the best streak number and earned achievement IDs are kept locally,
namespaced by account and child. Names, scores and activity history are not
cached by this feature. Best streaks and earned achievements never expire due
to missed days. Clearing local storage removes local keepsakes, not account
activity. No leaderboards, pressure notifications, autoplay or new animations.

## Integration limits

Only completions already saved to the child activity feed can be shown. Opening
a lesson or book is not treated as completion. Legacy shared-device tutor memory
has no trustworthy child ownership/completion record and is deliberately ignored.
Lessons use explicit lesson/tutor activity prefixes; reading includes recorded
reading games; homework prefixes are separate activities. The dashboard does not
change the upstream lesson, book, scanner or game completion producers.

History loading is bounded at 20 pages / 2,000 activities. A visible notice marks
partial counts; the star collection is the authoritative account total. Daily
choices are suggestions, not invented teacher assignments. Existing activity
pages retain their own age/subject selection controls.

## Verification

Run from the repository root after installing its existing dependencies:

```sh
node scripts/test-daily-learning.cjs
```

46 focused tests passed: model validation, duplicate and child separation,
London midnight and DST boundaries, retained achievements, optional goals,
GET pagination/abort/error handling, mocked authenticated endpoint behavior,
unchanged legacy response shape, TSX syntax and source-level scope guards.
The tests use Node's test runner and the existing TypeScript dependency.

Strict TypeScript checking of `src/lib/daily-learning.ts` also passed. The
endpoint tests use mocked authentication/database calls, not a live database.
Full application type-check/build, full Vitest suite and real browser/device
interaction tests were not run: repository dependency installation was unavailable
in this environment. These remain required before approval for integration.

No new dependencies, database migrations, deployment, merge or master push.
