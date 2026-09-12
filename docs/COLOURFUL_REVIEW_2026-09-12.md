# Sodafom colourful review — 12 September 2026

Based on the **live master commit 058097f78077015980460c0b359903fda5aa83a6**, not the older main branch. Production Railway service Sodafom.uk in affectionate-essence is unchanged by this review branch. Do not merge or deploy without the owner's review and critical-path testing.

## Implemented in this change set

- One shared blue/purple/pink/cyan theme in `src/styles/colourful.css`; existing route and control contracts remain.
- Real responsive lesson cards, answer buttons, input, examples, hints, feedback and progress; no screenshot used as a functional page.
- Museum entrance, hall, six gallery doors, selectable exhibits and narration; existing master content and routes preserved. This is a 2.5D click-through, not a 3D walking engine.
- Colourful Ask Archie launcher and explicitly opt-in browser speech turn-taking. Recognition pauses while Archie speaks and stops on hidden page, pause, close or unmount. It is NOT full-duplex or guaranteed noise/child-speaker isolation. The browser's speech service may process speech remotely.
- Admin launchers retain existing tabs. Signed founder sessions, account authorization, hashed code verification and paid-AI safeguards from master are preserved.
- Protected aggregate `/api/admin/system-monitor`: database connectivity, stored lesson counts/bytes and configuration checks. Unknown/unverified checks are never represented as passed.
- A separate read-only monitoring token integration is implemented but disabled until `SODAFOM_MONITOR_TOKEN` (at least 32 random characters) is configured server-side. Send in `x-monitor-token` over HTTPS, never in browser code. This endpoint exposes aggregate health only and cannot modify production or read child conversations.
- Web previews use their own API origin; native builds retain their configured backend. No test needs production credentials.

## Not completed / release blockers

- This first pass is not the complete approved illustrated collage. The full page-by-page artwork replacement, animated characters and artwork cleanup remain. Existing images are retained until replacements and reference checks are complete; no stored lessons/accounts were deleted.
- The Tutor continues its existing lesson source. Adapting the stored cloud lesson templates into rich conversational sessions is not implemented here.
- No claim of 100% operation: real Android/iPhone permissions, speech quality/background noise, camera scanning, all games, email delivery, sign-in/signup and authorised Admin flows require interactive verification.
- The connected Stripe account is test mode. Live billing secrets/webhooks and an audited, idempotent voucher credit ledger with atomic debits are not established. Existing `paid-ai-guard.ts` intentionally blocks paid AI; do not bypass it with a client flag, test voucher or owner login.
- The old main-based SitePro deployment failed a lockfile check and is not the live service. Do not deploy it over master or connect 797's database to it.

## Measured infrastructure, not educational claims

Railway's MySQL service reported 0.229163008 GB disk usage (includes database overhead) and a 500 MB volume capacity. Startup reported 144 Maths, 144 English and 30 Ancient Egypt templates. These are not verified hours of child-ready teaching or the total size of all cloud media/backups. The new monitor separately estimates SQL table/index allocation and active lesson JSON bytes.

## Verification

New tests cover classroom callbacks and progress, museum navigation and opt-in microphone lifecycle. CI uses the existing pinned pnpm version and frozen lockfile. Review the actual CI run results: file creation is not a passing test, and a successful build does not verify live payments or real-device speech.
