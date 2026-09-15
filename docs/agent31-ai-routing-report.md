# Agent 31 — Local-first AI routing handover

Date: 13 September 2026
Repository: `drmichael1982-crypto/Sodafom.uk`
Branch: `agent31/local-first-ai-routing-2026-09-13`
Created from master commit: `058097f78077015980460c0b359903fda5aa83a6`

## Status

Routing fixes and an offline regression suite have been committed to this branch only. No merge, pull request, deployment command, payment change or write to another agent's branch was made. The branch is for review, not a production-readiness claim.

**Important existing blocker:** `src/server/paid-ai-guard.ts` intentionally disables paid AI while voucher billing is pending. That file and safeguard are unchanged. This work does not switch paid AI back on or bypass billing using a client flag. Live paid fallback and charge reconciliation remain unverified.

## Routing changes

The teacher question callback, the existing ArchieHelper and the legacy ArchieHintButton now use the same `askArchie` adapter. General questions use the existing local engine, then the existing learned-answer cache, then at most one request to `/api/chat`. The teacher previously omitted the cache lookup. Contextual hint guidance is already local and is returned without treating a hint request as a pupil's answer to the stateful tutor.

The server now checks stateless local answers before the unchanged paid-AI guard. It does not invoke the stateful browser tutor on the server. The former three-model retry chain is removed. The authorised path makes one `gpt-4o-mini` completion request with SDK retries disabled; successful, failed and empty provider replies were exercised with a mock provider, not a real paid account.

Client requests include credentials and request JSON explicitly. The server retains text responses for legacy callers. This removes the hint caller's JSON-versus-text response mismatch. Each changed UI callback uses a synchronous in-flight lock to prevent rapid duplicate submissions and an abort signal to suppress stale answers. Network timeouts cover response-body reading and clean up their timers. Provider errors and prompt diagnostics are not copied into child-facing errors or chat logs.

The existing teacher badge uses verified response provenance: Local AI, or OpenAI plus the returned model name. A service error is not labelled a successful local lesson. Local replies carry zero API cost. Paid replies carry actual returned model/usage, with monetary cost explicitly unknown; no made-up sterling amount, exchange rate, voucher debit or free OpenAI charge is reported. Billing integration must provide verified monetary accounting before paid AI is enabled.

## What was genuinely executed

`node --test scripts/test-agent31-ai-routing.cjs`

Result: **61 tests passed, 0 failed, 0 skipped.**

Tests execute the actual new routing core, browser adapter and Express handler in isolated module contexts. Local-engine/storage, fetch, OpenAI, Express response and React state/voice boundaries are mocked where needed. The existing real billing guard is loaded in the tests. Actual TSX request callbacks are extracted from their source AST and executed; they are not reimplemented in the test harness.

Coverage includes local hits, learned-answer reuse, local-only mode, local/cache faults, one fallback on a local miss, failure without model escalation, empty/malformed/provenance-free replies, paid cost remaining unknown, billing denial, input validation, credential placeholders, cancellation, timeout cleanup, provider disconnect, JSON/text compatibility, rapid duplicate submissions in all three callbacks, safe errors, model badges and stale-response suppression.

All three touched TSX files passed syntax transpilation checks. The dependency-free routing core also passed a strict TypeScript check:

`tsc --noEmit --strict --target ES2022 --lib ES2022,DOM src/lib/archie-routing-core.ts`

Test environment: Node 22.16.0 and the available TypeScript installation. This is below the repository's stated Node >=22.22.0 requirement; rerun under the supported version before integration. No paid-provider calls or real customer data were used.

## Entry points inspected

| Entry point | Evidence and result |
| --- | --- |
| Home AI-teacher button | Source inspection confirms navigation to `/ai-teacher`; no home layout changes made. |
| `/ai-teacher` question flow | Actual callback plus shared-router tests passed, including learned answers, duplicate suppression and provenance badge. |
| Existing ArchieHelper | Actual callback tests passed for shared routing, navigation short-circuit, errors and cancellation. RootLayout currently hides this legacy floating helper on immersive routes; that layout policy is unchanged. |
| Existing ArchieHintButton | Actual callback plus adapter tests passed with contextual local guidance and zero network calls. |
| `/api/chat` | Handler contract tests passed with real billing denial, local-before-guard behavior and a mocked authorised provider. |
| `/tutor` TeacherModePage | Source reviewed: lesson answers, hints and explanations are local; teaching, voice and progress logic left unchanged. Not browser-tested. |
| Legacy VoiceAssistant | Source reviewed: static FAQ, no paid network path in the reviewed logic. Left unchanged. |

This is an audit of the inspected entry points, not a claim of exhaustive repository-wide or browser navigation coverage. Connector code search returned no results for known symbols, and the execution environment could not clone GitHub directly.

## Boundaries and outstanding work

A full dependency install, whole-app type-check/build, existing full project suite, real browser/device tests, live Express integration and live OpenAI calls were not run. The environment could not access GitHub directly; source was read and written through the connected GitHub tools. These limitations must not be counted as passed tests.

The six runtime files changed are `src/lib/archie-routing-core.ts`, `src/lib/archie-routing.ts`, `src/server/api/chat/POST.ts`, `src/components/ArchieHelper.tsx`, `src/components/ArchieHintButton.tsx` and `src/pages/AITeacherPage.tsx`. Only routing/request lifecycle code changed in the existing UI files; their original base versions were reconstructed and verified against Git blob hashes to check preservation of unrelated content. The additional files are this report and the dedicated test script.

Integration may overlap other agents working on the teacher page, helper voice behavior or game hints. Review those shared-file diffs together before any later merge. No other branch was edited or overridden.

A pre-existing photo-reading failure message in AITeacherPage claims the photograph was examined and labels generic guidance Local AI after an OCR failure. The scanner function was left unchanged because it belongs to the scanner workstream; its owner should correct that misleading fallback. The legacy hint button's existing "Another hint" UI behavior and richer hint content were not redesigned or certified.

Stop here for result collection. No further agent or background task was started.
