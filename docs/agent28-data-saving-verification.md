# Agent 28 — data saving, cloud sync and recovery

Date: 13 September 2026
Repository: `drmichael1982-crypto/Sodafom.uk`
Branch: `agent28/data-saving-cloud-sync-20260913`
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`

## Status

Scoped persistence fixes with passing automated checks. **Not a full-app or production cloud-sync sign-off.** No merge, deployment, production database access, real child records, credentials, artwork changes, new database tables or schema migrations were used. Existing APIs, tables, game advancement and reward rules are retained.

## Changes

- The existing database client now fails visibly instead of installing a pretend database after initialization failure. It can retry initialization, releases connections after failed health checks, and resets its pool when closed. Initialization errors no longer log raw driver/configuration details. Existing TLS configuration is unchanged and still needs the security agent's review.
- Existing child game-level and activity-save routes check ownership and validate inputs. Activity records, stars, milestone rewards and weekly summaries share one transaction. Game-level writes also use a transaction. Both write paths lock the owning child row before read-modify-write operations, including first-game insertion. Success is returned only after commit. These routes return generic errors, not database details.
- Existing progress/game-level reads send private/no-store headers. Progress read failures are errors rather than empty successful results. Existing report calculations were not redesigned.
- `useGameLevel` now uses account-and-child-scoped caches. Successful online results are cached. Guest keys remain compatible but are not silently imported into a child's account. Pending local level/best-star values survive new client instances, failed reads and lower server responses. Writes reach local storage before the network request. Stale GETs cannot overwrite newer saves; new POSTs within one instance are serialized and have a timeout.
- The hook exposes `syncStatus`, `storageAvailable` and `saveError`; existing feature UIs still need to display those states. Invalid cache data and storage failures are handled. Inaccessible child responses do not expose the cached level or redirect writes into guest storage.
- Active-child changes notify same-tab consumers after a successful storage write. Cross-tab selection and focus refresh listeners are also maintained.

## Tests actually executed

**75 passed, 0 failed:**

```sh
node --experimental-vm-modules --test scripts/agent28-data-saving-check.mjs
```

The runner executes the changed production TypeScript using Node's TypeScript transform and VM modules. External authentication, Drizzle/MySQL operations and most browser/network objects are synthetic adapters. Checks cover input bounds, ownership, private error responses, score read-back, level advancement, first-row insertion, star milestones, transaction failures at individual write stages and at commit, pool recovery, cache isolation, simulated refresh/second-device restore, failed requests, pending offline state, stale reads, overlapping submissions, storage quota failure and active-child notifications.

The synthetic reading/homework read-back checks submit records directly to the existing progress API. They do **not** prove the reading or homework screens submit those records.

Strict TypeScript checking passed for the two dependency-free production modules (`game-level-persistence.ts` and `progress-input.ts`). Syntax/transpile checks passed for all nine changed production TypeScript files. Tooling: Node 22.16.0 and TypeScript 5.8.3. The app declares Node >=22.22.0; that exact runtime and the complete app build were not tested here.

**Browser attempt blocked; zero browser scenarios completed:**

```sh
python scripts/agent28-browser-check.py
```

Chromium 144.0.7559.96 launched, but navigation to the loopback test fixture was denied with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. The restriction was not bypassed. Browser fixture/scripts are included for a permitted test environment and require Python Playwright and Chromium. They are isolated synthetic tests, not the production app.

The complete repository could not be cloned in this environment, and React/Vitest/Drizzle/MySQL dependencies were not installed. The existing full Vitest suite, full application build, React hook mounting, real database concurrency/rollback, restart durability, actual phone/tablet/browser compatibility and physical-device switching were not verified.

## Remaining work — required before full sign-off

1. **Offline reconciliation is not complete.** The existing POST API has no persistent idempotency identifier. This patch deliberately does not replay uncertain writes, which could duplicate levels or rewards. Pending aggregate game values stay on the original device; they do not automatically reach a second device. A reviewed, durable deduplication/reconciliation extension to the existing save path is needed. Concurrent unsynced edits from multiple tabs/devices and clearing browser storage also require explicit recovery tests.
2. **Reading, homework and settings are not fully cloud-connected.** The inspected story reader's book/page/word position and Homework Helper's explanation are component state, not durable history. Tutor preferences/mastery use device-local `sodafom_tutor_memory`. The broader `sodafom_progression_v1` and personal-best star maps are also local and are not unified by this patch. No homework photos or parent PINs were uploaded or persisted by these changes.
3. **All achievements and teacher records are not verified.** Existing star-milestone transaction handling is covered by synthetic tests; badge/character/sticker systems and the separate teacher/student save paths were not signed off. Aggregate report placeholders and calculations remain unchanged. Existing database column limits, indexes, storage engine and any legacy duplicate rows must be checked on a non-production copy.
4. **Real environment acceptance is outstanding.** Run the full project tests/build and end-to-end scenarios with real MySQL, approved test accounts, two browsers/devices, an offline/reconnect cycle, interrupted requests and a database restart/backup restore. Confirm that every completion screen distinguishes local, pending and confirmed online saves.

## Other-agent coordination

No other branch was modified or merged. Potential integration overlap must be reviewed with the games agent (`useGameLevel`), security agent (database client and ownership/error handling), and progress/reporting agents (child progress routes). Reading/homework and tutor/settings wiring needs coordination with those feature owners. The added persistence helper is an extraction/strengthening of the existing game-level cache and API, not a replacement cloud system.
