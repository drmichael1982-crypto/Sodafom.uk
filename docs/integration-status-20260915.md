# Sodafom integration status — 15 September 2026

Target branch: `integration/sodafom-big-jobs-20260915`
Production branch remains untouched by this integration pass. No Railway deploy is authorised by this document.

## Integrated into the isolated test branch

1. Agent 26 — navigation recovery and 404 recovery behavior.
2. Agent 27 — full-app QA safety/startup/error-display fixes and QA harness.
3. Agent 12 — homework/reading scanner capture/workspace/speech flow and server read-page hardening.
4. Agent 31 — Local-AI-first Ask Archie routing, one guarded paid fallback, duplicate suppression, provenance/model reporting, and preserved paid-AI billing guard.
5. Agent 28 — child progress/game-level persistence hardening, transactional writes, scoped caches and sync state.

## Held for manual conflict review

- Agent 29 account/login reliability: valuable auth/session fixes and 99 focused tests reported, but the branch conflicts with the integration branch after QA/config changes. It must be reconciled manually rather than merged blindly.

## Important safety state

- `master` is not changed by this integration pass.
- Railway is not deployed from this integration branch.
- Paid AI remains fail-closed until voucher billing/credit accounting is implemented and verified.
- Agent 31's report explicitly states that the existing `src/server/paid-ai-guard.ts` remains in force.

## Tests reported by source branches

- Agent 31: 61 routing tests passed; full app/device/browser acceptance still outstanding.
- Agent 28: 75 persistence tests passed; browser run was blocked by environment; real MySQL/device acceptance still outstanding.
- Agent 29: 70 policy/storage/cookie/redirect tests and 29 source-handler/configuration tests passed on its branch; not yet integrated because of conflicts.
- Agent 27 and Agent 26 include dedicated QA/navigation test harnesses; combined integration branch still requires a fresh complete build/test run after all merges.

## Next big jobs

1. Reconcile Agent 29 auth/session changes against the integrated QA/config changes without weakening founder/Admin security.
2. Review and integrate voice/microphone work.
3. Review lesson/classroom and books/game branches for overlaps.
4. Run a complete dependency install/build/type-check/test suite on the combined integration branch using the supported Node runtime.
5. Run browser/device journeys: sign-up/sign-in -> child profile -> Ask Archie -> lesson -> game -> reading/homework -> save/reload -> parent report.
6. Only after the combined test branch passes should a Railway test deployment be considered.
