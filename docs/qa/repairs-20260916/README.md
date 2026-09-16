# Sodafom audit repairs — parallel worker handoff

16 September 2026. Coordinator Codex. Work order: [issue #39](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/39).

Six workers ran in parallel on isolated worktrees. Their reviewable changes are collected on `codex/audit-repairs-20260916`, based on stable checkpoint `442656b4e2ec76167b4d0b5fb7b804cf742904a5`. The existing stable PR, other owners' branches, production configuration, main/master and Sodafoam Systems 797 are unchanged. No merge or deployment was performed.

## Status by job

The colours describe this repair handoff, not a new score for the live app. Green means the bounded code repair passes the recorded automated checks; amber means a check or release decision remains; red means the audited defect remains unresolved.

| Job | Status | Delivered result | Remaining acceptance |
| --- | --- | --- | --- |
| QA-FIX-01 — scoring | GREEN — automated checks pass | 9/10 no longer claims perfection; levelled quizzes use actual counts/percentages; empty banks award nothing | Browser/device result screens and certificate export |
| QA-FIX-02 — Maths lessons | GREEN — automated checks pass | Concrete examples and answerable Maths questions for three age bands and eight strands; old cloud planner text cannot replace them | Teacher review, other subjects and device delivery |
| QA-FIX-03 — homework | GREEN — automated checks pass | Typed local help without a photo; audited 7 × 8 question answered; hints preserve the question; visible recovery/cancel states | Browser layout, physical microphone/camera and paid scan flow |
| QA-FIX-04 — books | AMBER — code and playback tests pass | Magic Key opening fits current art; shelf/header CSS repairs; prior labels and speech cleanup preserved | Rendered phone/tablet layout and real audio |
| QA-FIX-05 — artwork | RED — replacement images required | Nine exact asset corrections with consumer paths and ownership handoff | Accepted corrected assets; no private reference pixels published |
| QA-FIX-06 — public address/release | RED — live mismatch confirmed | Both domains' Railway mapping checked; browser visits prove different client bundle references; conditional repair and rollback recorded | Exact DNS/CDN/cache cause and authorised release |
| Coordinator — catalogue/readability | GREEN — source checks/build pass | Active game-count labels derive from catalogue; colouring instructions/counter have an opaque high-contrast panel; inaccurate no-external-links claim removed | Rendered contrast/layout review |

The previous live audit remains **74% (26/35 checks)**. These source changes have not reached the live app and do not justify raising that percentage. No claim is made that every game level, every child profile or every device has been tested.

## Verification of the combined candidate

Runtime code built at local commit `a692dc7`; the subsequent change updates an existing test's expected heading from “Scan Homework” to the intended “Homework Helper”, plus these reports. That final test version passed the application run below. No application source changed after the successful build.

| Check | Command | Result |
| --- | --- | --- |
| Application tests | `node node_modules/vitest/vitest.mjs run src` | 317 passed in 40 files |
| Account UI | `node node_modules/vitest/vitest.mjs run --config agent29.vitest.config.ts` | 16 passed |
| Scanner regression | `node --test tests/scanners/scanners.test.cjs` | 40 passed |
| Account policy | `node --experimental-strip-types --test scripts/agent29-account-reliability.test.mjs` | 70 passed |
| Stable account server scope | `node --experimental-strip-types --test --test-name-pattern='server admin\|founder\|reset\|logout\|teacher helper\|auth configuration\|signup' scripts/agent29-server-reliability.test.mjs` | 21 passed |
| Parent dashboard policy | `node --experimental-strip-types --test scripts/stable-parent-dashboard-auth.test.mjs` | 7 passed |
| TypeScript | `node node_modules/typescript/bin/tsc --noEmit` | Passed |
| Client and server build | `node node_modules/vite/bin/vite.js build` followed by `node node_modules/vite/bin/vite.js build --ssr src/server/entry.ts` | Passed; bundle-size warnings remain |
| Whitespace | `git diff --check` | Passed |

**471 automated checks passed** across the application, account and scanner suites. No dependency manifest or lockfile was changed. The Maths content checks inspect all 10,950 generated daily question instances for answer choices, distinct questions and teacher-planning prose, with separate arithmetic and classroom interaction checks. This does not turn generated practice variants into a complete reviewed curriculum.

The first unrestricted `vitest run` also discovered native Node test files and the disposable-MySQL suite, which use separate runners in `.github/workflows/stable-app-build-qa.yml`. It reported those runner/setup failures and one obsolete heading expectation. The heading expectation was corrected; the intended application and account commands above then passed. The disposable database was not provisioned, and its guard was not bypassed. Live login and database integration remain unverified in this session.

An offline static preview was built with backend requests disabled. The supported browser refused its loopback URL with `net::ERR_BLOCKED_BY_CLIENT`, so the preview server was stopped. No alternate browser, public preview deployment or proxy was used. Source CSS and DOM tests are not a substitute for rendered phone/tablet acceptance.

## Reports and provenance

| Worker | Original local worker commit | Report |
| --- | --- | --- |
| Scoring | `e4591d28dbe59f5f1ba63a66a4a509725012f01f` | [QA-FIX-01-scoring.md](QA-FIX-01-scoring.md) |
| Lessons | `03602b970edcdc1aaf2cb7d18c1438e7739b194a` | [QA-FIX-02-lessons.md](QA-FIX-02-lessons.md) |
| Homework | `a8c93034026968031462297401d123980d2774f4` | [QA-FIX-03-homework.md](QA-FIX-03-homework.md) |
| Books | `7b2e9c4902014e9406aafe65a4043ad820a54a88` | [QA-FIX-04-books.md](QA-FIX-04-books.md) |
| Artwork | `34915c095cbcf04b9810754a0ce2fac774cf3f16` | [QA-FIX-05-artwork.md](QA-FIX-05-artwork.md) |
| Release | Report-only contribution collected by coordinator | [QA-FIX-06-release.md](QA-FIX-06-release.md) |

Worker commits were collected onto the separate coordinator branch without updating their existing owner branches or merging any pull request. Their isolated local checks remain useful evidence; the table above is the combined verification record. The published draft PR identifies its exact remote commit.

## Remaining release conditions

- Correct artwork through the existing numbered artwork desk, preserving scenes, navigation targets and private-reference restrictions.
- Establish why the public address serves an older document before proposing a specific DNS/CDN/cache change. Different script references are confirmed; the underlying routing cause is not.
- Review the rendered repaired pages at phone/tablet widths, audible playback, certificates and approved account/device flows.
- Complete disposable database CI and review the exact candidate. The user's existing no-merge/no-deploy instruction remains in force.
