# Agent 14 — Schools and Teachers

Date: 13 September 2026  
Repository: drmichael1982-crypto/Sodafom.uk  
Branch: agent14-schools-teachers-review-20260913  
Base: master at 058097f78077015980460c0b359903fda5aa83a6

## Status

School-only implementation prepared and unit-tested. **Not deployed. Not approved for live pupil use on the strength of these tests alone.** No production database changes were made. The existing separate Agent 14 branch was not overwritten.

## Implemented

- Teacher sign-in validation, bounded per-process login/registration attempts, hashed new session tokens, eight-hour new sessions, and server-side logout. The resolver remains compatible with existing unexpired legacy tokens. Browser teacher credentials move from persistent local storage to tab-scoped session storage; existing teacher browser sessions require sign-in again. Parent storage is untouched.
- Free standalone teacher-class registration without payment or a school key. An optional existing school key is validated rather than silently ignored. A new account owns only its own roster; registration does not prove school employment or grant access to another teacher's pupils.
- Searchable class list, pupil creation, correct age-band handling, concealed pupil codes, longer new codes, activity averages and pending-review counts. The existing one-class-per-teacher data model is retained; shared/multiple-class administration is not added.
- Pupil view with separate lesson, game, homework and reading summaries, subject percentages, individual activity results, teacher comments and work reviews. Valid zero marks remain assessed results; missing/invalid marks and pending reviews are not treated as zero. Averages are means of individual valid percentages, not raw marks.
- Homework/handwriting photo review with file selection or a device-supported camera capture input. Photos remain browser object URLs and are revoked on replacement, removal or leaving the form. Neither image bytes nor filenames are sent to the server. Reopening a saved review requires reselecting the original photo if it is needed.
- Manual transcription, a conservative local typed-arithmetic suggestion, pending-review status, explicit teacher confirmation before publishing a mark, and version/conflict checks when editing. Unreadable work is left unmarked. The local helper is deterministic arithmetic, **not an AI vision/OCR model**; general handwriting recognition and AI marking are not implemented or claimed.
- Class/pupil CSV reports with formula-escaping and an authorised-school-storage confirmation. Pupil reports include activity results, subject/category summaries, review feedback and comments; the pupil page also provides printing. No report is automatically emailed or publicly shared.

## Scope and integration

No parent, payment, Admin, book, cinema, birthday-room, game implementation, shared AI routing, artwork, deployment configuration or shared routing file was changed. Existing teacher API routes are reused, so other agents do not need to merge a new route registration.

The shared database schema has exactly one changed line: `teacher_accounts.licence_id` becomes nullable. The subscription, school-licence and other table definitions are unchanged. The supplied SQL changes only the teacher account column.

Work reviews are stored as versioned `SODAFOM_WORK_REVIEW_V1` JSON records in the existing teacher-owned `student_notes` text field. Ordinary notes remain ordinary comments. Malformed review records are excluded from scores and disclosed in the pupil view. Editing checks both the expected revision and the original stored text, to avoid overwriting a concurrent edit.

Reports read existing school `student_activity` records and teacher work reviews. Only explicit `lesson:`/`lesson/`, `homework:`/`homework/` and `reading:`/`reading/` source prefixes reclassify activities. Legacy game slugs such as `reading-quest` remain games; their reading subject is still reported separately. Lesson/homework/reading producers were not changed, and automatic end-to-end completion feeds from those areas are **not verified**. Private parent data is not joined into school reports.

Pupil reports explicitly cover the latest 500 activity records and latest 500 notes/reviews, not lifetime progress. A warning appears when older records exist. Class activity averages cover recorded activity only, excluding teacher-marked reviews; this is labelled in the screen and export.

The new teacher workflows make no paid AI calls. The whole application's in-school entitlement, geofence and Local AI routing remain outside this branch; the `schoolPolicy` response describes this teacher workflow, not a new global authorisation mechanism.

## Tests actually executed

**66 unit/handler-contract tests passed, 0 failed, 0 skipped.**

The suite executes the actual changed modules with mocked database/ORM/password-provider boundaries. It covers strict IDs and age bands, missing versus zero marks, mixed-denominator scores, pending and confirmed reviews, ambiguous arithmetic, image-data rejection, CSV escaping, unauthenticated and foreign-pupil requests, review ownership, concurrent-edit conflicts, capped history, free registration, token hashing at the handler boundary, expiry predicates, logout, rate limits, longer pupil codes, tab-scoped storage and unreadable 401 responses.

Commands, from a checked-out repository with its declared dependencies installed:

```sh
node --test scripts/test-agent14.mjs
npx tsc src/lib/teacher-school.ts --noEmit --strict --target es2022 --module commonjs --skipLibCheck
```

The pure school validation/reporting module passed a strict TypeScript check. All 16 changed TypeScript/TSX files, including the schema, passed syntax transpilation. The runnable test suite also syntax-transpiles teacher routes/pages/helpers.

In this isolated environment the suite used the preinstalled TypeScript compiler via `NODE_PATH=$(npm root -g)`. It ran on Node 22.16.0. The repository declares Node >=22.22.0; this run is not a supported-runtime certification.

## Required before merge or live use

1. Review/back up a staging database and apply `docs/agent14/free-school-registration.sql` there. It was **not run** here. Without the nullable column, new free accounts cannot be inserted. Do not reverse the column to NOT NULL or delete free accounts as a rollback shortcut.
2. Install the locked application dependencies on the supported Node version, then run the full application build, project type-check and existing tests. These were **not run**: this environment lacks the application dependencies and network access for cloning/installing. Syntax transpilation is not a full project type-check.
3. Run real MySQL integration tests for existing/free account sign-in, legacy-token compatibility, roster isolation, review insert/update conflicts and logout. The contract suite uses database doubles, not a live database.
4. Perform browser/device testing of sign-in, class lists, reports/printing, photo input, camera permission/denial, preview cleanup and teacher confirmation. No real camera or browser interaction was exercised in this run.
5. Confirm the other agents' school completion feeds, whole-app free in-school access and Local AI behaviour. Do not claim all subject/game/scanner progress is live-synchronised from this branch alone.
6. Review privacy/security before using real pupils. Existing legacy short pupil codes and the code-only lookup/activity endpoints used by games were not changed. New longer codes do not fix those legacy endpoints. Multiple production replicas also need a shared edge rate limiter; the new teacher limiter is process-local. School membership verification, retention/deletion policy and protected handling of exported files need operational review.

No merge, production deployment or production migration is authorised by this report.
