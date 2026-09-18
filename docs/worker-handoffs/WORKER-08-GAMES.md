# Worker 08 — Educational games handoff

## Scope and safety constraints

- Worked only in `drmichael1982-crypto/Sodafom.uk` from `codex/children-foundation-first-pass`.
- Foundation branch: `worker08/educational-games-foundation`.
- Current alignment branch: `worker08/games-progress-security-alignment`.
- Did not edit either Sodafoam 797 repository.
- No deployment, main-branch merge, secret access, database mutation, or irreversible operation.
- Legacy games were treated as reference only; no legacy page was modified.

## Delivered

1. `src/features/learning-games/types.ts`
   - Typed game catalogue, question, answer, session, result, and action contracts.
2. `src/features/learning-games/engine.ts`
   - Pure, deterministic state reducer with duplicate-answer protection, pause/resume, restart, and safe score calculation.
3. `src/features/learning-games/progress.ts`
   - Worker 14-aligned game completion command and verified progress receipt ports.
   - Requires a short-lived, server-issued attempt receipt for durable progress.
   - Stable per-attempt idempotency keys and content/version matching.
   - No child name, email, tenant, raw answers, free text, or other direct personal data.
   - Rewards are presented only from a server-verified progress receipt; the client cannot mint or request its own reward.
4. `src/features/learning-games/components/`
   - Filterable game launcher.
   - Reusable multiple-choice game shell.
   - End-to-end launcher-to-game experience component.
5. `src/features/learning-games/catalog.ts`
   - Versioned manifests with age bands, objective/skill codes, reviewed question-source version, scoring rule, accessibility profile, and asset budget.
   - Two low-risk, untimed starter games for age bands 5–7 and 8–9:
     - Number Bonds to 10.
     - Word Family Match.
6. Accessibility support
   - Semantic headings, lists, fieldsets, answer groups, progressbar, and live feedback.
   - Keyboard-operable and touch-friendly controls.
   - Text equivalents for essential information.
   - Optional host read-aloud callback; no automatic microphone or audio permission.
   - No time pressure, public leaderboard, chat, adverts, purchases, or user-generated content.
7. Safety and integration boundaries
   - Static tests reject Archie, 797, admin, business, diagnostic, codebase, payment, secret, database/server imports, and direct network calls from game code.
   - A small typed navigation adapter accepts only `games`, allowlisted interaction IDs, reviewed game IDs, and allowlisted return destinations.
   - Future 3D portals can open the existing 2D launcher/game route but cannot own progress, auth, rewards, AI, payments, or admin capabilities.

## Shared progress boundary

Worker 08 deliberately did not use or extend the legacy `ProgressionContext`, because it writes a separate local-storage total and would compete with lesson and reading progress.

Worker 14's current canonical `ProgressEvent` was reviewed. Games now emit only the safe client command subset. The trusted server must add `id`, `tenantId`, `childUserId`, and `occurredAt` from verified context before appending the canonical event.

The coordinating progress worker should own one durable service with these responsibilities:

- Accept activity-completed events from games, lessons, and reading.
- Deduplicate by `idempotencyKey` and server-issued `attemptId`.
- Attach the authenticated child identifier server-side or in the trusted host layer.
- Queue offline events and retry failed syncs.
- Calculate stars, badges, streaks, levels, and parent/teacher rollups centrally.
- Return verified progress/reward receipts; child-facing features must never mint rewards themselves.

If the host provides no valid attempt receipt, the game fails closed into labelled practice mode and emits no durable progress or reward.

## 797 / Archie isolation

The current QA handoff marks the wider repository boundary RED. The reviewed `gemini-06/cloud-admin-brain` branch co-locates child and admin capabilities and must not be treated as an approved runtime dependency for games.

Worker 08 does not modify that branch. The games package has no route, import, direct network client, token, prompt, tool registry, database client, payment client, or diagnostic hook for Archie or 797. Static boundary tests are fail-closed.

## Acceptance checks completed

- 7 focused test files passed.
- 17 focused tests passed.
- TypeScript project check passed with no errors.
- Full production client and server build passed; the repository still reports its existing large-bundle warning.
- Full ESLint run passed with 0 errors and 88 pre-existing warnings outside this feature.
- Dependency audit reported no known vulnerabilities.
- Completion is emitted once per play attempt.
- Duplicate answer actions cannot inflate a score.
- Wrong answers receive neutral, supportive feedback.
- Pause/resume retains the current question.
- Age and subject filters work.
- Expired/mismatched attempts are rejected.
- Raw answers and client-claimed child/tenant IDs are absent from durable commands.
- Forged world/admin destination IDs are rejected.
- Direct network calls and forbidden imports are absent from runtime game code.

## Integration intentionally blocked

No production route was changed. Worker 01, Worker 14, Worker 15, and QA handoffs are now reflected in the isolated feature contracts, but the actual server attempt service, canonical progress repository, role-isolation suite, and independent peer review are not integrated yet.

Coordinator decisions needed:

1. Confirm the canonical 2D route for the launcher and map the future `world-games-area` portal to it.
2. Integrate the server-side game-attempt endpoint and Worker 14 progress repository on a dev branch.
3. Confirm whether read-aloud is browser speech, native Capacitor speech, or a child-safe cloud voice service.
4. Require architecture, child-safety/security, data/progress, QA, and accessibility peer review before dev integration.

## Safe next tickets

- GAMES-08-01: Implement the trusted `/v1/game-attempts` create/complete adapter against Worker 14 storage and authorization contracts.
- GAMES-08-02: Wire `LearningGamesExperience` into the approved new-app 2D route; later map the typed world portal to the same route.
- GAMES-08-03: Add host-managed signed offline attempts, replay-safe queue, and adult-only diagnostics for failed sync.
- GAMES-08-04: Add a curriculum/content review gate before any new question bank is enabled.
- GAMES-08-05: Add automated accessibility scanning in CI when the project chooses an accessibility test library.

## Merge gate and automatic reassignment readiness

This branch is ready for independent architecture/security/data/QA review, not for merge.

Current dev-integration blocker: the full repository suite ran 242 tests; 241 passed and existing `src/server/__tests__/admin-auth.test.ts` failed because `issueFounderSession(response)` returned `false` where the test expected `true`. Worker 08 did not alter or bypass admin authentication. This exact failure must return to the auth/security/QA owner and pass on a reviewed commit before integration.

Dev integration also remains blocked until role-isolation checks and independent peer review pass. Main/master and production remain prohibited.

After this review is requested, Worker 08 is ready for automatic reassignment to `GAMES-08-01` or the next coordinator-approved missing games ticket.
