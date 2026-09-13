# Agent ROOT — AI repair report

- **Agent:** ROOT / Worker 2
- **Task:** Diagnose Ask Archie failures; audit local-first routing, endpoint/error handling, and add only evidenced safe reliability fixes.
- **Branch:** `agent-root-ai-repair-20260913`
- **Base:** `release/sodafom-home-repair-20260913` at `14b108fb957c0ad6064bc5e9f873982714f8486d`

## Findings

1. `ChatbotPage` uses the local answer pack first, then calls `${API_PREFIX}/chat`.
2. `API_PREFIX` is the Railway endpoint for phone builds and same-origin `/api` for the live web app. The configured Railway host is `https://sodafomuk-production-3f3a.up.railway.app`.
3. The server's `requirePaidAiBilling` intentionally returns HTTP 503 for `/api/chat` before an OpenAI client is created. Its reason is that voucher billing has not been safely wired. Therefore broad questions that miss the small local pack (for example, Ancient Egypt) currently fail by design; this is not evidence that a secret or endpoint should be changed.
4. The client exposed an opaque/raw server error and removed the empty assistant bubble, leaving a child without a useful in-app explanation.

## Completed safe fixes

- Added a small factual, offline Ancient Egypt answer pack (Nile, farming, pharaohs and pyramids) to cover the reported question without any network or paid-AI call.
- Added a child-friendly fallback for a paused, unreachable or timed-out online service. It keeps the response in the conversation and directs the child to locally available subjects; it does not pretend the question was answered.
- Preserved the local-first order and the server-side paid-AI fail-closed safeguard. No secret, endpoint, billing guard or deployment configuration was changed.
- Added focused regression tests for Ancient Egypt and safe fallback wording.

## Tests

- `git diff --check` — **passed**.
- `npx vitest run src/lib/__tests__/tutor-engine.test.ts src/lib/__tests__/archie-chat-fallback.test.ts` — **not completed** because this checkout has no `node_modules`; `npx` began attempting to fetch an unpinned Vitest version and did not finish within the controlled run. No package files were changed.
- Live Railway, real OpenAI, browser and device testing were **not run**: this branch must not deploy and no credentials were used.

## Still needed

- Install the repository's locked dependencies in a dedicated CI/local environment, then run the focused tests and full type check.
- Restore online Ask Archie only after voucher billing has a verified ledger and atomic debit path, or provide a separately authenticated/local cloud answer service. That is outside this safe repair.

## Handoff

Master was not merged. Nothing was deployed to Railway.
