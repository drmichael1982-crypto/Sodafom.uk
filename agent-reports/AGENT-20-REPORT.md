# Agent 20 — Sticker Books Recovery Handoff

## Scope

Recovered the conflicting Agent 20 sticker-book work on branch `recovery/agent20-sticker-books-20260913`, based on remote `main` commit `305401dd15acfaa60d8bd12f32a1aafd5f351f34`.

This work changes only the Sticker Books feature, its direct Rewards entry point, and its route. It does not change games, admin, payments, AI routing, default branches, Railway, deployment, or 797.

## Resolution of the duplicate implementations

Two incompatible versions were reviewed:

1. `agent20/sticker-books-20260913` stored every book under one shared browser key (`sodafom_sticker_books_v1`). That could mix children’s work on the same browser profile.
2. `agent20/sticker-books-interactive-20260913` stored a book under an authenticated account-and-child namespace, validated saved data, used only allowlisted artwork, and provided stronger keyboard/touch controls.

The second design was selected. The two implementations were **not** combined.

The recovered version also fixes two integration problems in that design:

- It accepts the actual existing `GET /api/children` array response (while remaining compatible with a `{ children: [...] }` response), instead of treating every valid current response as an error.
- It registers `/sticker-books` directly in the canonical `src/routes.tsx`; it does not replace the app/SSR route import with a recursive route adapter.

The old unscoped prototype key is deliberately not imported. It contains no verified account or child ownership, so automatic migration could disclose a shared book to the wrong child. Neither prototype branch was merged into the default branch.

## Completed feature

- An authenticated child selector uses the existing authorised child list only; no new child profile fields are collected or sent to a new service.
- Books save locally under `sodafom.sticker-books.v1:<account>:<child>`. They are not uploaded, shared, used for analytics, or included in rewards.
- Children can choose one of four CSS-backed themes, add existing Archie-and-friends artwork, drag or keyboard-move stickers, resize/remove them, name pages, switch pages, undo, save and reopen work.
- Saved data permits only fixed sticker/theme identifiers plus validated title, position, and size values. Saved image URLs or HTML are never trusted.
- Limits protect storage and interaction: 20 pages, 40 stickers per page, 48-character page titles, and a 300 KB saved-book ceiling.
- Storage-denied, corrupt-save, quota, and stale-tab cases show an honest warning instead of pretending a save completed.
- The Rewards link clearly states that Sticker Books are creative play and never spend or award stars.

## Verification

- Focused Sticker Books Vitest checks — 3 files, 6 tests passed.
- Full Vitest suite — 21 files, 158 tests passed.
- Strict TypeScript check (`tsc --noEmit`) — passed.
- Focused ESLint for Sticker Books and its page — passed with no new warnings.
- Client production build — passed.
- SSR production build — passed.

The build retains the repository’s existing large-client-chunk warning; it does not fail the build.

## Follow-up before integration/release

- Run a real authenticated browser/device check with more than one child profile: add, drag, keyboard-move, resize, reload, switch child, and sign out/in.
- Confirm the existing child endpoint is available in the intended integration environment and review the actual supplied artwork on phone/tablet layouts.
- Local browser storage is device/browser-local, not cloud sync. Clearing that browser’s data removes the local sticker book.

## Push status

Pushed — the validated recovery branch was uploaded to GitHub through the authorised GitHub connector. No pull request, merge, default-branch update, Railway change, or deployment was performed or is authorised by this handoff.
