# Sodafom Gemini Backend Coordinator

This document is the source of truth for the five Gemini backend agents working in parallel on the cleaned Sodafom backend lane.

## Shared integration lane

- Integration branch: `integration/sodafom-backend-clean-20260917`
- Base source: `visual/approved-3d-world-20260917`
- Repository: `drmichael1982-crypto/Sodafom.uk`
- Every Gemini agent works only on its own branch and opens a **draft pull request** back to the integration branch.
- Do not merge to `main`/`master`.
- Do not deploy to Railway.
- Keep Sodafoam Systems 797 completely separate.
- Never expose, print, commit, rotate or replace real secrets.
- Do not run live payment charges.

## Reuse-first rule

The new backend should be clean and organised, but it should reuse reviewed parts of the older Sodafom implementation rather than rebuilding good working features from scratch.

Old branches to inspect before coding:

### Authentication / accounts
- `agent-root-auth-review-20260913`
- `integration/source-agent29-auth-20260915`

### Progress / daily learning
- `agent22/daily-learning-progress-20260913`
- `recovery/agent22-daily-learning-progress-20260913`

### Parents / Admin / payments / security
- `agent13-parents-child-reports`
- `recovery/agent13-parent-reports-20260913`
- `agent-20-parent-admin-payments-security`
- `admin-feature-control-panel-2026-09-13`
- `agent4-admin-accounts-visits`
- `agent-root-admin-access`
- `backup/pre-payment-hardening-2026-09-11`

### Homework / reading scanners
- `agent12-homework-reading-scanners`
- `recovery/agent12-scanners-20260913`

Do not merge these old branches wholesale. Inspect their code, tests and reports, then port only the compatible pieces that still fit the new architecture.

## Five-agent ownership

### Gemini 01 - Accounts, auth and child ownership
Branch: `gemini-01/auth-accounts`
Own sign-up/sign-in/session recovery, parent-child ownership, child profile age/class selection, account roles and backend access guards.

### Gemini 02 - Progress, levels and reporting contracts
Branch: `gemini-02/progress-levels-reports`
Own the backend contract for game/lesson progress, age bands 5-6 through 11-12, Starter/Developing/Confident/Challenge levels, recent-game rotation history, parent/teacher report data and restore/sync rules.

### Gemini 03 - Parents, Admin, pricing and entitlements
Branch: `gemini-03/parents-admin-entitlements`
Own Parents/Admin backend-facing contracts, pricing display data, subscriptions/allowances/vouchers/entitlements, child controls and safe test-mode payment wiring. No live charging.

### Gemini 04 - AI, scanners and voice API layer
Branch: `gemini-04/ai-scanners-voice-api`
Own clean API contracts for Local AI first/fallback, homework/reading scan flows, voice turn-taking lifecycle, text fallback, upload ownership and safe request boundaries. Reuse existing working scanner/voice code where compatible.

### Gemini 05 - Integration, data model, migrations and QA
Branch: `gemini-05/backend-integration-qa`
Own cross-agent integration planning, data-model compatibility, migrations, API contract tests, route audit, security regression checks and final backend integration QA. Do not take over another agent's feature files unless fixing a clearly isolated integration regression.

## Shared contracts the five agents must preserve

- Ages/classes: 5-6, 6-7, 7-8, 8-9, 9-10, 10-11, 11-12.
- Game levels inside each age/class: Starter, Developing, Confident, Challenge.
- Existing lesson/game/book/report contracts should be reused where sound.
- Touch/text fallback must remain available when voice/microphone is unavailable.
- Parent and teacher views must read the same progress source rather than create duplicate databases.
- Recent game history must support the rotating game system so children do not receive the same game/question repeatedly.
- Accessibility/SEND preferences must be retained across sessions.
- Child data must be owned by the correct parent/school context and protected by server-side checks.

## Required handoff from every Gemini agent

Each agent must:
1. Read this coordinator file and its GitHub issue before coding.
2. Inspect the named old branches relevant to its task.
3. State which files it owns before making broad edits.
4. Work only on its assigned branch.
5. Run relevant tests plus production build/type checks where practical.
6. Create `agent-reports/GEMINI-0X-BACKEND-REPORT.md` with completed work, tests, failures, old code reused, remaining blockers and exact tested commit.
7. Push the branch and open a draft PR to `integration/sodafom-backend-clean-20260917`.
8. Do not merge, deploy or change production secrets.
9. Keep working build -> test -> fix -> retest until acceptance is evidenced or an external blocker is clearly documented.

## Integration order

1. Gemini 01 auth/account contracts.
2. Gemini 02 progress/levels/reporting contracts.
3. Gemini 03 parent/Admin/entitlement wiring against those contracts.
4. Gemini 04 AI/scanner/voice API wiring against account ownership/access rules.
5. Gemini 05 integrates and audits all four without redesigning their ownership areas.

The goal is one clean backend lane that can later plug into the new organised 3D/game front end without losing useful existing Sodafom work.