# Agent 14 — Schools and Teachers

## Branch and scope

Branch: `agent-14/schools-teachers-20260913`.
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.

Only teacher/school pages, their authentication helper, school progress logic, teacher endpoints and scoped checks are changed. No changes to parents, payments, admin, books, cinema, birthday room, games, AI routing, database connection configuration or deployment configuration. No merge, deployment, live-data edits or migrations were performed.

## Implemented

- Teacher sign-in validates input, keeps legacy password upgrades, uses a 12-hour server session and process-local sign-in limiting. Explicit sign-out revokes the presented server token. Browser tokens and the teacher profile use tab-scoped session storage; old persistent teacher tokens are cleared. Existing teachers will need to sign in again. The unchanged school-key registration flow remains the way to establish school membership.
- The class roster is loaded after checking the server-side teacher session. Pupil creation accepts both hyphens and the original UI's en dashes in age groups, does not silently substitute a different age, returns complete initial stats and uses a longer random pupil code within the existing schema.
- Teacher-owned pupil reports separate games, lessons, homework/handwriting and reading, with subject scores, comments, a review queue, private text exports and explicit history limits. Marks are weighted by possible marks; pending, invalid and unscored work do not become zero. Existing game recommendation `href` values are adapted to the teacher page's link field.
- Teachers can record school lesson, homework and reading results. These are teacher-entered school records; automatic capture from other learning pages has NOT been added, and private home accounts are NOT joined by name or guessed identity.
- A teacher can select a JPEG, PNG or WebP photo, or use a device's photo-capture chooser, inspect the original, record feedback and confirm a mark. Photos are validated locally, never uploaded by this feature, never written to browser storage and released when the editor closes. A pending review must be reopened with the original work/photo because the photograph is not retained.
- Optional local checks compare teacher-verified text with the teacher's marking guide. They only suggest exact/simple numeric comparisons. They do NOT perform handwriting recognition, OCR, semantic grading or paid AI calls. Ambiguous words, units, fractions and missing text require teacher judgement. Using a suggestion does not approve or save it automatically.
- School records are versioned JSON in the existing school-owned `student_notes` table under the reserved `school-record-v1` subject. No new database table or schema migration is needed. Ordinary notes cannot choose that reserved subject. Only validated fields are persisted; photograph bytes, filenames and client-supplied authors are excluded.
- Writes check and lock pupil ownership. Saved review revisions prevent stale overwrites. An idempotency key prevents an identical retried create from double-counting the same work. Marked results can be amended in place without creating duplicate results.
- Teacher reads use private/no-store responses. Each read/write is restricted to the authenticated teacher's class. Exports require explicit confirmation, omit pupil sign-in codes and photographs, and use plain text rather than executable HTML or spreadsheet formulas.
- In-school teacher reporting and marking do not call payment/subscription services or a paid AI provider. The existing school licence/invitation and payment systems are unchanged; this branch does not create a new school-enrolment or billing policy.

## Checks actually executed

Executed locally using Node.js v22.16.0 and the available TypeScript compiler, with a fetched source subset rather than a complete repository checkout:

- 66 isolated automated checks passed: 34 progress/marking/report/photo validation checks and 32 teacher route/session checks.
- The route checks use an in-memory Drizzle adapter and synthetic users/pupils. They exercise the actual changed handler code, the unchanged password-hashing implementation, ownership filters, expired sessions, strict IDs, record validation, revision conflicts, duplicate-save protection, rate limiting, logout and failed database responses. They are not live-MySQL integration tests.
- Syntax transpilation passed for all 13 changed TypeScript/TSX files.
- A strict standalone TypeScript check passed for `src/lib/teacher-progress.ts`.

Re-run the scoped checks after installing the repository dependencies:

```sh
node --experimental-strip-types --test src/pages/teacher-hub/tests/progress.check.mjs src/pages/teacher-hub/tests/routes.check.cjs
node src/pages/teacher-hub/tests/syntax.check.cjs
npx tsc --noEmit --strict --target ES2022 --module ESNext --lib ES2022,DOM src/lib/teacher-progress.ts
```

The `.check` filenames deliberately avoid Vitest's normal `.test` discovery, because these checks use Node's built-in runner.

## Required before merge or deployment

A complete checkout and dependency installation could not be obtained in this execution environment because network name resolution failed. The full app build, dependency-aware whole-project type check, existing Vitest suite, real MySQL transactions and browser/device tests were NOT run. The local Node version is older than the repository's stated `>=22.22.0` engine requirement; repeat verification on the supported deployment runtime.

Before approving this branch, verify real teacher registration/sign-in against a test database; class ownership across two teachers; concurrent/idempotent review writes; camera/file selection on supported devices; keyboard and screen-reader use; refresh/back navigation after sign-out; photo object-URL cleanup; reports and existing learning-page integrations. Keep production untouched during this verification.

The existing pupil-code lookup and game-submission endpoints were reviewed but not changed, because replacing that flow would involve the game integration excluded from this task. Existing short pupil codes remain, and the existing game submission handler looks up a pupil by code rather than validating the URL pupil ID. Those legacy routes need a separate security/integration pass before broad school rollout; longer codes only apply to newly created pupils here. No claim of whole-app privacy/security certification is made.

The report view is limited to 500 recent game results and 500 recent teacher notes/records per pupil. Truncation and unreadable records are flagged. This is not a lifetime analytics service or a formal attainment/SEN assessment. Schools must apply their own approved retention and report-sharing processes.
