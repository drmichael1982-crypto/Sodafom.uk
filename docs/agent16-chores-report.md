# Agent 16 — Chores and pocket money

Date: 13 September 2026. Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.
Branch: `agent-16-chores-pocket-money-20260913`.

## Delivered on this branch

The existing `/chores` and `/parent-dashboard/chores` pages and `/api/chores` handlers are extended, not replaced with a second disconnected feature. Existing pocket-money route aliases remain unchanged.

Parents can create or edit a chore, choose separate chore points or a pound/pence reward, set a one-time/daily/weekly schedule and start date, and pause/resume jobs. Static suggestions use the younger age in the saved child age group; custom chores require a parent suitability/safety confirmation. Schedules use Europe/London calendar dates. Weekly periods start on the selected date. Missed periods do not accumulate rewards; pending work remains pending until reviewed. Schedule changes require pausing the old job and creating a new one so historical periods cannot shift.

Children see tasks, due-period progress, read-aloud buttons using device speech, and a short animation of the existing Archie image. Animations respect reduced-motion preferences. All text remains usable without speech or artwork loading. No character or artwork files are edited.

Submitting or re-submitting work creates no earned reward. Only parent-approved records enter the totals. Parents can approve work or return it with a note. Pending work remains visible in parent controls even when the chore is paused. A returned submission for the current period reuses its record when the child tries again. History is a record per chore occurrence and its latest review, not an immutable event-by-event audit log.

Submitted titles and reward amounts are frozen in each completion. Later edits do not change a pending or approved reward. An approved record cannot be approved twice. Transactions serialize changes for a chore; a unique chore/period index also protects against duplicate new submissions. All-time totals are computed separately from the 50-record history pages.

Older records did not save their reward amounts. The migration does not guess them: unknown older approved amounts are excluded from numeric totals with a visible explanation. An older pending job can be approved only after the parent explicitly confirms the displayed current value.

Chore points do not change game stars or vouchers. There are no fees, commissions, payment requests, wallets, payouts, transfers or AI calls in this feature. Pocket money is only recorded; parents give any money directly.

## Parent control and privacy

The existing app uses a shared signed-in family session for the child and parent views. Every privileged chores mutation therefore additionally checks the parent's existing account password on the server. A client-supplied role, owner, approval status or `parentVerified` flag is rejected. Passwords are transient and are not saved in browser storage, in the chores database or in logs.

Failed parent checks are rate-limited per account in the database (five failures in a 15-minute window). Every action is scoped to the signed-in parent's owned child/chore/completion. Chores requests use a feature-specific origin check and the already-allowed `X-Requested-With` header; shared authentication, CORS and other features are not changed. Responses are private/no-store. This is not a redesign or audit of the whole app's authentication system; siblings still use the existing parent-owned family session.

## Tests executed

`node --test scripts/test-agent16-chores.cjs`: **66 passed, 0 failed**. Tests cover reward validation, integer pence, UK dates and clock changes, recurring and one-time jobs, immutable snapshots, legacy handling, parent-only mutation gates, cross-family rejection, duplicate submissions/reviews, returned work, password limits, origin checks and HTTP-handler contracts. Service and HTTP integration checks use in-memory/mocked database and authentication boundaries. They are not live MySQL or real-account tests.

`tsc -p scripts/tsconfig.agent16-chores.json`: **passed**. This is strict type checking of the shared chores model and the dependency-free mutation and parent-check services, not the entire app.

Every added/changed TypeScript and TSX file was also syntax-transpiled. The source boundary check found no imports of payment, AI, game, book or admin services. The migration guard and additive/no-guessed-backfill checks passed.

The available environment has Node 22.16.0, no installed project dependencies and no external DNS access for clone/npm installation. The repository requires Node >=22.22.0. A complete Vite build, project-wide type check/lint/Vitest, genuine React browser/device testing and real MySQL migration/concurrency tests **were not run**. No live customer data or accounts were used.

## Explicit database preparation required before integration

This feature has its own Drizzle mapping in `src/server/api/chores/schema.ts` so the shared schema and other agents' work stay untouched. It maps the existing chores tables plus the new parent-check table. Do not run a destructive schema sync based solely on either schema file. Retain these additive columns during future schema consolidation.

The additive migration is `src/server/db/migrations/agent16-chores.ts`. It adds only chores-specific columns, indexes and the parent-check table. No schema changes run on import or startup. Existing tables must exist and a real connection is required. It is designed to be rerunnable after partial DDL; MySQL DDL is not transactionally rolled back. Back up first and validate table engines/collations/foreign-key compatibility on a disposable MySQL database.

With the repository dependencies installed and credentials explicitly pointing to that disposable test database, the opt-in command is:

```sh
pnpm exec tsx scripts/migrate-agent16-chores.ts --apply-agent16-chores
```

This command was **not run** here. Do not point it at production without separate review/approval. A server missing the upgrade fails closed rather than fabricating data, and a new frontend talking to the older API shows an upgrade message instead of crashing.

## Checks still needed before release

Run the migration twice on a disposable copy with old approved/pending records and confirm no data is removed or guessed. Test real database concurrent complete/approve/return requests, parent-password verification and rate-limit persistence across server instances. Exercise both routes in the real app on desktop and phone, including stale child switches, slow/failed requests, modal keyboard/focus behavior, reduced motion and optional speech. Confirm pending work gives zero rewards, edits cannot rewrite earned rewards, paused pending jobs remain reviewable, history pagination leaves all-time totals intact, and unrelated families cannot read or mutate each other's chores.

After those checks, run the project's normal full build, type check, lint and test commands on supported Node. Resolve any integration conflicts only through the normal review process.

## Scope and release status

Only chores-specific source, tests, styling, migration and this report are changed. Shared routes, shared database schema, parent dashboard reports, authentication implementation, payments, AI, lessons, games, books, admin, deployment settings and artwork are untouched. No merge, deployment or production migration was performed.
