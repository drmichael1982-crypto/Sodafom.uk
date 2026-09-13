# Agent 12 Recovery Report

- **Agent number:** 12
- **Original task:** Homework and Reading scanners — camera/upload capture, safe image handling, explanation, read-aloud and voice flow.
- **Recovery branch:** `recovery/agent12-scanners-20260913`
- **Latest implementation commit:** `91c540a1182531ffe56738821c7b06adf35c1cad`
- **Pushed:** Yes — uploaded through the authorised GitHub connector; this report is the branch’s upload record.

## Completed

- Recovered the original Agent 12 branch (`agent12-homework-reading-scanners`) into the recovery branch.
- Kept Homework and Reading scans in the dedicated scanner workspace, with camera capture, upload, voice questions, read-aloud and word-help flow.
- Fixed the server request-size path: only the photo endpoint accepts a bounded 9 MB JSON body, while the decoded image remains limited to 6 MB. A trusted-origin, declared-size and bounded-rate gate now runs before that parser, with a capped in-process bucket map to prevent it becoming an attacker-controlled memory store.
- Re-encodes uploads through a canvas before preview/send, removing EXIF metadata such as photo location data; camera output is also resized and validated. The original `FileReader` and temporary image source are explicitly cleared after re-encoding, on errors, and on page exit/reset.
- Keeps photos, page text, questions and explanations out of browser persistence; clears this transient state when the page is hidden or left.
- Requires the current paid-AI guard, a signed-in parent, a valid Sodafom origin (or native no-Origin request), and a child profile owned by that parent before a provider call can occur. The teaching age is derived from that owned child profile on the server; the client does not send an age field.
- Makes all page-image requests use the strict scanner safety policy; the caller cannot disable it with `scannerRequest`.
- Adds private/no-store scanner responses, safe parser errors, provider `store: false`, and removes the TTS log that exposed spoken content.
- Routes the old AI Teacher book-photo control into the protected Reading scanner, removing the duplicate direct image-upload path.
- Adds the relevant optional-photo-help notice to the in-app privacy policy.

## Tests performed

| Command | Result |
| --- | --- |
| `node --test tests/scanners/scanners.test.cjs` | Passed: 51/51 targeted scanner checks, including raw-upload release and server-owned-age coverage |
| `pnpm type-check` | Passed |
| `pnpm build` | Passed (only the pre-existing large-chunk warning) |
| `node --test scripts/test-admin-paid-ai-guard.mjs` | Passed: 24/24 |
| Targeted ESLint on changed files | 0 errors; 3 pre-existing unused-disable warnings in shared server entry |
| `git diff --check` | Passed |

## Remaining limits / follow-up

- Paid image help is intentionally still unavailable while the project-wide voucher billing guard fails closed. This branch does not bypass, enable, merge or deploy it.
- The process-local scanner rate limit limits a single application instance; production should retain an equivalent edge/WAF limit before any multi-instance release.
- The camera, microphone and speech flows were checked through targeted isolated tests and a production build; physical Android/iOS/browser permission testing still needs doing before release.
- The optional-photo-help policy text should receive a formal privacy/legal review before production, including the configured AI provider’s final retention terms.

## Shared files / merge conflicts to watch

- Likely shared with other recovery work: `src/server/entry.ts`, `src/server/api/ai-teacher/read-page/POST.ts`, `src/lib/voice-context.tsx`, `src/pages/AITeacherPage.tsx`, and `src/pages/legal.tsx`.
- Scanner-specific files are under `src/components/scanners/` and `tests/scanners/`.

## Safety confirmation

`main`/`master` was not merged. Nothing was deployed to Railway or any production service.
