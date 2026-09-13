# Agent33: backup, recovery and rollout safety

Audit date: 13 September 2026. Status: **offline safeguards tested; production recovery NOT signed off**.

Repository: `drmichael1982-crypto/Sodafom.uk`.
Branch: `agent33/backup-recovery-rollout-safety-20260913`.
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.

## Scope and safety boundary

Only this runbook, an intentionally incomplete release-evidence example, an offline recovery module and its tests were added. No existing application, account, payment, data-saving, AI, artwork, deployment configuration or other agent files were changed. No merge, production deployment, restart, snapshot restore or production database query was performed. Railway inspection used service configuration and deployment metadata, not variable values or application logs. No real user records, database dumps or credentials were obtained or committed. The separate 797 system was not modified.

The repository is public. Never put backup files, production exports, keys, environment files, private URLs or user records in this repository, test results or release evidence. Use opaque identifiers and hashes; keep the underlying evidence and secrets in approved private storage.

## What currently exists: verified versus unknown

| Area | Observation at the audit baseline | Recovery meaning |
| --- | --- | --- |
| Source history | GitHub `master` exists at the base SHA above. Repository default is `main`. | Source history is available; it is not a user-data backup. |
| Production source | Railway's Sodafom application service follows `master`. A separate SitePro service follows `main`. | Do not confuse the repository default branch with the live app's release branch. The Agent33 branch matches neither deployment source. |
| Deployment history | The latest inspected app deployment reports `SUCCESS` for the base SHA. Earlier entries are marked `REMOVED`. | History exists, but status alone proves neither app correctness nor that an older image remains available for rollback. |
| Database storage | MySQL service uses image `mysql:9.4`, with a persistent volume mounted at `/var/lib/mysql`. | Persistence is present. A mounted volume is not evidence of a completed backup. |
| Point-in-time recovery | The inspected MySQL start command contains `--disable-log-bin`. | Do not promise binary-log-based point-in-time recovery with this setting. No setting was changed. |
| Backup jobs | No backup/restore job or runbook was found in the inspected baseline `scripts/` and `docs/` trees. | This is not a claim that no provider-side backups exist. |
| Provider backups | The available Railway tools did not expose backup listings, schedules or retention. | Enabled schedules, latest successful backup, encryption/key recovery, independent copies and recoverability remain unverified. |
| Health/readiness | Baseline `railway.json` and inspected app service configuration contain no healthcheck path. `src/server/api/health/GET.ts` returns `ok` without querying MySQL. | A working HTTP endpoint is not database readiness. Do not use its current response as proof that data can be saved. |
| Database fallback | `src/server/db/client.ts` can fall back to a mock on initialization failure, returning empty/no-op results. | Recovery smoke tests must verify actual writes and reads; coordinate a fix with the data-saving agent. This file was not changed. |
| Release controls | GitHub's branch response reported `protected: false`; Railway source configuration reported `checkSuites: false`. | Mandatory checks/approval were not established by this audit. Broader rulesets were not audited. |
| Other data | Uploaded assets, browser-only progress, other external stores and secret-vault recovery were not verified. | Do not claim that a MySQL backup covers unsynced device data or every asset. Coordinate the inventory with the data-saving agent. |

Evidence: GitHub branch/tree/file reads at the pinned base SHA; Railway `list-services`, `get-service-config` and `list-deployments` read-only responses on the audit date. Source files inspected included `package.json`, `railway.json`, `src/server/db/client.ts`, `src/server/api/health/GET.ts`, portions of `src/server/entry.ts`, and the database migration tree. Production service configuration was not exported to this repository.

## Added safeguards

`scripts/agent33-recovery.mjs` has only two CLI commands: `rehearse` and `check-release`. There is no deploy, merge, database connection, SQL execution, production restore, caller-selected restore directory or background job.

The rehearsal creates synthetic SQL-shaped bytes in memory, seals them using AES-256-GCM with a fresh random key/nonce, authenticates the artifact, verifies an independently supplied SHA-256 checksum, writes only a new fixed-name file in a newly allocated private temporary directory, reads it back and verifies its checksum, then removes only that directory. Files use exclusive creation and POSIX mode 0600; the directory uses 0700. The artifact format is bounded to 8 MiB. It is an offline test format, **not a production MySQL backup system**. Filesystem cleanup does not claim forensic secure erasure.

The CLI refuses production-mode, Railway or database/selected service-credential-bearing environments. Use a clean local test shell, not `railway run` and not a production shell. Never remove production safeguards merely to force a test to run. The module loads no `.env` file or application module, makes no network calls, and reports fixed error codes instead of input contents, paths, keys or stack traces.

The evidence checker rejects missing/false/string-valued checks, stale or future timestamps, wrong targets, incompatible/unknown schemas, mismatched commit/checksum evidence, and missing owner approval. The example deliberately starts with unknown identifiers and false checks. Its conservative 24-hour freshness threshold is a review default, **not an agreed recovery SLA**. MySQL major 9 matches the inspected deployment; any future engine change requires an explicit review of the checker.

**Important:** the checker validates supplied assertions, not their truth. Even a successful exit does not authorize deployment. It is not wired into Railway or protected-branch enforcement, and cannot prevent someone bypassing it. Independent evidence verification and separate owner authorization are still required.

## Reproduce the completed tests

Run from this branch's repository root, in a clean local shell:

```sh
node --test scripts/test-agent33-recovery.mjs
node scripts/agent33-recovery.mjs rehearse
```

Expected: 31 passing tests and a synthetic-artifact-only success result. The result explicitly reports `mysqlRestoreTested: false`, `appRollbackTested: false` and `deploymentAttempted: false`.

The incomplete example must be rejected:

```sh
node scripts/agent33-recovery.mjs check-release docs/operations/agent33-release-evidence.example.json
```

Expected: exit code 2 and `status: blocked`. Do not change unknown checks to true just to make this pass. Copy the example into approved private working storage for a future evidence review; do not commit sensitive evidence.

The test filename follows the existing standalone-script convention rather than `*.test.mjs`, avoiding accidental collection by the application's Vitest test matcher.

### What was genuinely tested

31 tests passed, 0 failed, 0 skipped on Linux with Node v22.16.0. Coverage includes authenticated round-trip recovery; unique nonces; plaintext exclusion; wrong/invalid keys; modified headers/nonces/tags/ciphertext; truncated, malformed and oversized archives; independent checksums; actual temporary-file restoration, permissions and cleanup; unchanged caller buffers and an unrelated sentinel file; traversal-like text treated only as bytes; offline-environment refusal; all required release assertions; target/version/schema/engine checks; matching artifacts, builds, rollback and approval; timestamp freshness/order; CLI success and rejection exit codes; sanitized output; oversized/malformed/missing/directory/symlink evidence; unsupported commands; and absence of network/application imports.

### What was not tested

No MySQL engine, `mysqldump`, Docker runtime or full application checkout/dependency installation was available locally. Direct Git cloning failed because external DNS/network access was unavailable in the execution container; GitHub connector reads/writes remained available. Consequently no actual MySQL export/import, provider snapshot recovery, app-level rollback, full application build, full Vitest suite, device testing or production recovery-time measurement was performed. The app declares Node >=22.22.0; the older local runtime passing these standalone built-in-only tests does not establish supported full-app compatibility.

## Required isolated MySQL recovery rehearsal: still pending

1. Obtain owner approval for a **separate disposable test environment**. Use a matching MySQL version and only synthetic records derived from the repository schema/migrations. Give it no production credentials, production volume mounts or production network access. Disable outbound email, payments, AI calls, push notifications and other external effects. Do not start the app against production to inspect its migrations.
2. Record schema/migration versions and synthetic record counts/relationships for accounts, children, progress, scores and other relevant tables. Create a database-consistent test backup with matching MySQL tooling. Preserve the original test dataset; restore to a different empty disposable database, never over an existing user's data.
3. Verify backup completeness, checksum, encrypted storage, independent protected copy and recovery of its key from the intended secret store. A successful file copy is not database-consistency evidence.
4. Import only into the disposable MySQL instance. Treat dumps as executable input: check database-selection statements, privileges, definers, routines, triggers and scheduled events. Ensure the server cannot reach production or external services. Do not infer database recovery from this branch's file-only drill.
5. Verify schema, indexes, record counts, parent-child relationships and actual reads/writes through the application. Exercise child/parent/teacher/admin separation using synthetic accounts. A green health response or the fallback mock is insufficient.
6. Record elapsed restore/recovery time, backup age, exact backup hash and release identifiers. Record only non-sensitive results. Agree acceptable data-loss and recovery-time objectives with the owner before production sign-off.

Railway's native volume restore is **not a read-only test**: its documentation describes staging a replacement volume followed by deployment. Backups are limited to the same project/environment, and wiping a volume deletes its backups. Do not click Restore or Deploy on the production volume for this rehearsal. Independent protected exports and a separately approved test environment are needed; this branch does not create them.

## Future release and rollback procedure: not executed

1. Identify the exact service, environment, deployed SHA, runtime version, dependency lockfiles, configuration and schema baseline. Preserve a separately verified known-good artifact and required assets. Confirm the rollback artifact is actually available; a historical deployment entry is insufficient.
2. Confirm a recent complete backup and a successful isolated MySQL recovery test. Record exact checksum/source SHA and verify the independent copy and encryption-key recovery. Review retention and deletion protection. Do not put keys or backup contents in GitHub.
3. Run the candidate against the isolated recovered test database. Review every migration for backward compatibility. Additive changes still require testing; delay column/table removal and incompatible transformations until the rollback window closes.
4. In that same isolated test setup, write additional synthetic progress with the candidate, switch **application code only** to the known-good artifact, then verify the newer writes remain and the old app still reads/writes correctly. Do not restore an older database snapshot to undo an application-only failure. That would discard newer writes.
5. Review runtime variables/secrets, authentication and permissions before rollback. Do not reintroduce old credentials, unlocked admin access or unmetered paid-AI behavior. The audited base includes recent security restrictions; an older commit is not automatically a safe rollback target.
6. Require a readiness check that proves database availability, app smoke-test evidence, preserved current writes, exact candidate/rollback/approval SHAs and owner approval. Run the manual evidence checker, independently verify its assertions, and establish actual release enforcement through a separately reviewed change. This branch changes no live controls.
7. Only after a separate explicit authorization may an operator release or roll back. For an incident, pause new releases, preserve evidence without exposing user data, distinguish application failure from data corruption, and choose the reviewed recovery path. Any database restore is a separate approved recovery event with an explicit data-loss assessment, not an automatic companion to app rollback.

## Outstanding production blockers

Provider backup schedules/retention/latest success and restore access; independent protected copies and key recovery; a complete inventory of MySQL, assets and unsynced device data; an actual isolated MySQL/application recovery test; demonstrated code-only rollback preserving new writes and current security; schema compatibility; database-aware readiness; verified artifact retention and effective release approval/check enforcement; agreed recovery objectives. None are marked complete merely because the 31 offline tests pass.

## Official references checked for this audit

- Railway volume backups: https://docs.railway.com/volumes/backups
- Railway volume persistence: https://docs.railway.com/volumes
- Railway linked-branch deployment behavior: https://docs.railway.com/services
- MySQL point-in-time recovery: https://dev.mysql.com/doc/refman/9.7/en/point-in-time-recovery.html

The MySQL 9.4 documentation URL redirected to the current 9.7 manual when checked. The reference establishes the general recovery concept; it does not change the observed production image or prove that this service has recoverable binary logs.
