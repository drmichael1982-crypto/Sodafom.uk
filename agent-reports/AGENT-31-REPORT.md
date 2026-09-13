# Agent 31 — Local-First Archie Routing Recovery Handoff

## Scope

Recovered the compatible safety intent of `agent31/local-first-ai-routing-2026-09-13` onto current remote `main` commit `305401dd15acfaa60d8bd12f32a1aafd5f351f34`, on branch `recovery/agent31-local-first-ai-routing-20260913`.

This recovery changes only Archie question/hint routing and the existing `/api/chat` safety boundary. It does not change payments, vouchers, credentials, admin, scanner implementation, default branches, Railway, deployment, 797, or game content.

## Current-main-safe resolution

The original Agent 31 branch was based on divergent `master` and included an online fallback guarded by a file that does not exist in current `main`. Current `main` instead loaded environment files in `/api/chat`, constructed an OpenAI client, and retried a paid completion directly.

The recovered implementation is stricter and current-compatible:

- `src/lib/archie-routing.ts` is a shared browser-only local router. It uses the existing local Archie rules, handles in-memory contextual hints, has no `fetch`, no cloud fallback, no question/answer cache, and creates no new child data store.
- Archie Helper, AI Teacher’s typed-question flow, and game Hint Button use that local router. Rapid requests are locked, unmounted calls are aborted, and local misses show an honest child-friendly message rather than a made-up lesson or a cloud retry.
- Game hints remain in browser memory and never send the game question to chat. “Show hint again” accurately repeats the local guidance.
- `/api/chat` now uses only stateless local maths, spelling, science, reading, and Sodafom-help rules. It does not call the stateful browser tutor on the server.
- A local miss returns `503 PAID_AI_DISABLED`. The handler contains no OpenAI client, API-key read, voucher path, model, retry, or external-service fallback. A request body flag cannot turn paid AI on.
- Text responses remain available for existing legacy callers; JSON callers receive explicit local provenance and zero local cost.

The legacy Chatbot page was not redesigned, but its existing `/api/chat` request is now protected by the local-only server boundary. No online completion can be reached through that endpoint.

## Validation

- Focused local-routing and server-handler Vitest checks — **2 files, 9 tests passed**.
  - Covers local answers, in-memory hints, invalid/aborted/local-fault cases, fail-closed unknown questions, client flags that attempt to enable fallback, server input validation, and source checks for no OpenAI/credential/completion path.
- Full Vitest suite — **20 files, 161 tests passed**.
- Strict TypeScript check (`tsc --noEmit`) — passed.
- Client production build — passed.
- SSR production build — passed.
- Focused ESLint — no errors. It retains two pre-existing warnings in untouched code: the existing Helper speech-listening effect dependency and the scanner callback’s unused caught error.

The build retains the repository’s existing large-client-chunk warning and third-party Rollup annotation warnings; neither fails the build.

## Production/cloud-AI decision still required

Paid cloud AI remains deliberately disabled for `/api/chat`. Enabling it later requires an explicit owner decision plus a separately reviewed server-side billing, child-safety, privacy, usage-accounting, and provider-error policy. This recovery does not activate vouchers, read credentials, or make a provider request.

`/api/ai-teacher/read-page` is a separate scanner-owned OpenAI path and was left untouched by instruction. Before production, its owner must independently decide whether to disable it or explicitly authorise it with the necessary child-photo privacy, billing, and device-flow review. This report does not treat that scanner path as local-only or production-ready.

## Follow-up before integration/release

- Run authenticated browser/device checks for Helper, Hint, Teacher typed questions, and legacy Chatbot with known local questions and unknown questions; confirm no client makes a cloud completion request.
- Test microphone/touch duplicate submission and unmount navigation on phone/tablet devices.
- Keep scanner evaluation separate from this branch; do not infer scanner approval from the local-chat checks.

## Push status

Pushed — the validated recovery branch was uploaded through the authorised GitHub connector. No pull request, merge, default-branch update, Railway change, or deployment was performed or is authorised by this handoff.
