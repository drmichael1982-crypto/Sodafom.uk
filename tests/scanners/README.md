# Agent 12 — Homework and Reading scanners

Branch: `agent12-homework-reading-scanners`
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`

## Changes

- Homework Helper now uses a scanner-only workspace with camera preview, separate photo upload, image validation, removal and cancellation.
- Reading's scanner opens at `/reading?scan=1`, separately from English/lessons. Existing book collection, games and lesson destinations are unchanged.
- Homework uses age-aware hints and a child-attempt / next-step loop rather than an answer-sheet prompt.
- Reading transcription is separate from vocabulary/comprehension help. The child's actual follow-up question now reaches the image helper.
- Reading supports explicit read-aloud/stop controls and word highlighting from browser speech boundary events. No guessed timing is shown when events are unavailable. Native read-aloud uses the existing speech bridge.
- Push-to-talk places recognised speech in an editable question; it does not automatically send or spend vouchers. Unsupported or denied microphones offer typed input.
- Camera/microphone resources are released on close, page hide and unmount, including camera permission resolving late.
- Only the existing Archie image is used, with subtle speaking movement and reduced-motion support. No new artwork or decorative emoji were added to the scanners.
- Photos and questions are held in page memory, not browser storage. Photos are sent to the existing protected endpoint only after an explicit help action.
- Server changes are opt-in via `scannerRequest`. Legacy callers retain their existing behaviour. Billing guard, model, token limit and AI routing are unchanged. Cancelling a sent request does not guarantee the provider stops processing or refunds usage.

## Checks performed

40 isolated regression tests passed, 0 failed:

```sh
node --test tests/scanners/scanners.test.cjs
```

These tests use the actual scanner TypeScript source with mocked camera, speech, provider and billing dependencies. They cover image validation, request errors, cancellation propagation, transcription/help prompts, age and follow-up limits, unchanged permission/model behaviour, native speech fallback, real boundary offsets, late camera permissions and media cleanup. The hook driver is deliberately minimal: these are not full React/browser end-to-end tests.

All seven application files passed TypeScript/TSX syntax parsing. The dependency-free core also passed strict type checking:

```sh
npx tsc --noEmit --strict --target ES2022 --module ESNext --lib ES2022,DOM src/components/scanners/scanner-core.ts
```

Local validation used Node 22.16.0 and TypeScript 5.8.3. The repository requests Node >=22.22.0 for the full application.

## Still required before merge / release

The full app build, project-wide type check and existing Vitest suite were not run. Direct repository cloning failed in the test environment because GitHub DNS could not resolve; the source was read/written through the connected GitHub tool, and the full dependency tree was not available locally.

Run the full checks with the project's supported Node version and dependencies, then verify real camera/photo selection, microphone permissions, audible playback, readable highlighting and layout on desktop, Android and iPhone. Native microphone availability and device-specific speech timing are not certified by these isolated tests. An authorised live photo scan and voucher-accounting check were not performed; no live paid AI calls were made during testing.

No production merge, pull request, deployment or Railway change was requested or performed for this branch.
