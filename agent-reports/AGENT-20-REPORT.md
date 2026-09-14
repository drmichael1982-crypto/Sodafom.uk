# Agent 20 Report

- Agent: 20
- Serial: S-O-D-AI-router-20
- Branch: agent20/SOD-AI-router-20
- Implementation commit: 9a13db09822c169240fdfd8ff804c66f4c6f34a7
- Scope: Local-first AI routing for Home, Ask Archie, AI Teacher, floating Archie, and game hints
- Merge status: Not merged
- Deployment status: Not deployed (including Railway)

## Delivered changes

- Added a shared routing policy: local answer first, then a scoped on-device saved answer, then at most one cloud fallback.
- Made saved answers scope-aware, so a response from one age/context cannot be reused in another.
- Replaced direct /api/chat calls in the Home Ask Archie flow, AI Teacher, Ask Archie chat, and floating Archie helper with the shared router.
- Made game hints local-only so they can never trigger a paid request.
- Added request-in-flight and AbortController protections in Home, AI Teacher, Ask Archie, and floating Archie.
- Removed the duplicate touch/click toggle path from the floating Archie button.
- Made the API endpoint answer server-safe local questions before any billing/provider work.
- Added a fail-closed paid-AI billing guard. Unknown questions return PAID_AI_BILLING_PENDING until verified voucher/subscription debit is connected.
- Disabled OpenAI SDK retries (maxRetries: 0); the fallback path makes one provider attempt only when the guard is enabled in future.
- Added provenance labels:
  - Local: Local AI · £0 API cost
  - Reused saved answer: Local AI · saved answer · £0 API cost
  - Cloud: returned model name plus Cost pending verified billing (no invented currency amount)

## Automated tests run

| Command | Result |
| --- | --- |
| pnpm run type-check | PASS |
| pnpm exec vitest run src/lib/__tests__/archie-routing-core.test.ts src/lib/__tests__/archie-device-memory.test.ts src/server/api/chat/POST.test.ts | PASS — 3 files, 12 tests |
| pnpm exec vitest run | PASS — 21 files, 164 tests |
| pnpm run build | PASS — client and SSR bundles built |

### New routing coverage

- Local result returns without a cloud request.
- Saved answer returns without a cloud request.
- Local miss performs exactly one cloud request in the routing policy.
- Local engine failure does not fall through to paid cloud.
- Disabled fallback performs no cloud request.
- Missing provider provenance is rejected.
- Saved answers are normalised, scope-specific, and exclude likely personal/account questions.
- /api/chat returns a local JSON/text answer before paid access.
- /api/chat fails closed with PAID_AI_BILLING_PENDING for an unknown question needing paid fallback.

## Viewport checks

The intended manual matrix was desktop (1440×900), tablet (768×1024), and mobile (390×844), covering the Home Ask Archie local answer, AI Teacher local answer, and unknown-question billing guard.

The cloud browser could not reach the isolated local Vite preview and its navigation stalled; cancelling that blocked preview also terminated the local command runner. Therefore these three visual browser checks are accurately recorded as **not completed**, not passed. The responsive implementations were statically reviewed: Home uses a flexible input row and sm grid breakpoints; AI Teacher constrains content to max-w-3xl and uses two-column/sm three-column layouts; provenance labels use wrapping layouts.

## Paid-call result

No paid provider call was made during testing. The current server guard prevents an unknown question from reaching OpenAI until atomic billing entitlement/debit support exists.

## Handoff

This branch contains no merge and no deployment action. No pull request was opened.
